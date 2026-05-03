'use server'
import { revalidatePath } from 'next/cache'
import { generateText } from 'ai'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { models } from '@/lib/ai-providers'
import { normalize, levenshtein } from '@/lib/fuzzy-search'
import type { MedicalProfile } from '@/lib/types'

type MedicalProfileInput = Partial<Omit<MedicalProfile, 'id' | 'user_id' | 'updated_at'>>

function sanitizeInput(value: string, maxLen: number): string {
  return value.slice(0, maxLen).replace(/[`"\n\r<>]/g, ' ').trim()
}

// ---------------------------------------------------------------------------
// syncOnboardingCondiciones
// ---------------------------------------------------------------------------
// Normalizes raw condition strings entered during onboarding:
//   1. Fuzzy-match against the `conditions` library table → use official name
//   2. If no match, ask AI for the correct clinical name in Spanish
// Then upserts medical_profiles.condiciones_previas with normalized names.
// Best-effort — failures are swallowed so onboarding redirect is never blocked.
// ---------------------------------------------------------------------------
export async function syncOnboardingCondiciones(condiciones: string[]): Promise<void> {
  if (!condiciones.length) return

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Fetch the full conditions library (name + slug) for fuzzy matching
  const { data: library } = await supabase
    .from('conditions')
    .select('name, slug')
    .eq('published', true)

  const libraryItems = (library ?? []) as { name: string; slug: string }[]

  // For each raw condition, try to find the best library match (score = edit distance)
  function bestLibraryMatch(raw: string): string | null {
    if (!libraryItems.length) return null
    const nRaw = normalize(raw)

    let bestName: string | null = null
    let bestScore = Infinity

    for (const item of libraryItems) {
      const nLib = normalize(item.name)
      // Substring containment → strong match
      if (nLib.includes(nRaw) || nRaw.includes(nLib)) {
        // Prefer the closest length match when multiple contain each other
        const score = Math.abs(nLib.length - nRaw.length)
        if (score < bestScore) { bestScore = score; bestName = item.name }
        continue
      }
      // Levenshtein on full strings — accept if distance ≤ 30% of longer string
      const dist = levenshtein(nRaw, nLib)
      const threshold = Math.floor(Math.max(nRaw.length, nLib.length) * 0.3)
      if (dist <= threshold && dist < bestScore) {
        bestScore = dist
        bestName = item.name
      }
    }

    return bestName
  }

  async function normalizeWithAI(raw: string): Promise<string> {
    const safe = sanitizeInput(raw, 120)
    try {
      const { text } = await generateText({
        model: models.insight,
        prompt: `Eres un médico clínico. Devuelve el nombre clínico correcto en español de esta condición o enfermedad. Si no la reconoces escribe el input tal cual.

Condición escrita por el paciente: <condicion>${safe}</condicion>

Responde SOLO con JSON válido, sin markdown:
{"nombre":"nombre clínico correcto en español, primera letra mayúscula"}`,
        maxOutputTokens: 60,
      })
      const cleaned = text.trim().replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      return parsed.nombre || safe
    } catch {
      return safe
    }
  }

  const normalized: string[] = []

  for (const raw of condiciones) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    // Try library match first (free, instant)
    const libraryName = bestLibraryMatch(trimmed)
    if (libraryName) {
      if (!normalized.includes(libraryName)) normalized.push(libraryName)
      continue
    }

    // Fall back to AI normalization
    const aiName = await normalizeWithAI(trimmed)
    if (!normalized.includes(aiName)) normalized.push(aiName)
  }

  if (!normalized.length) return

  // Upsert only condiciones_previas — preserve all other fields
  try {
    await supabase
      .from('medical_profiles')
      .upsert({
        user_id: user.id,
        condiciones_previas: normalized,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    revalidatePath('/historial')
  } catch {
    // Non-fatal
  }
}

export async function saveMedicalProfile(data: MedicalProfileInput) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('medical_profiles')
    .upsert({
      user_id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/historial')
}

export async function getMedicalProfile(): Promise<MedicalProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('medical_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data ?? null
}
