'use server'

import { revalidatePath } from 'next/cache'
import { generateText } from 'ai'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { models } from '@/lib/ai-providers'
import type { Treatment, TreatmentInput } from '@/lib/types'

function sanitizeInput(value: string, maxLen: number): string {
  return value.slice(0, maxLen).replace(/[`"\n\r<>]/g, ' ').trim()
}

interface ValidateDoseResult {
  nameNormalized: string
  doseNormalized: string
}

async function normalizeMedication(nameRaw: string, doseRaw: string): Promise<ValidateDoseResult> {
  const safeName = sanitizeInput(nameRaw, 100)
  const safeDose = sanitizeInput(doseRaw, 50)

  const { text } = await generateText({
    model: models.insight,
    prompt: `Eres un farmacéutico clínico. Normaliza el nombre y dosis de este medicamento.

Nombre: <nombre>${safeName}</nombre>
Dosis: <dosis>${safeDose}</dosis>

Responde SOLO con JSON válido, sin markdown:
{"nameNormalized":"Nombre genérico correcto en español, primera letra mayúscula. Ej: Metformina, Enalapril, Ácido acetilsalicílico. NUNCA en minúsculas.","doseNormalized":"Solo número y unidad estándar, ej: 850 mg, 5 mg. Vacío si no hay dosis."}`,
    maxOutputTokens: 80,
  })

  const cleaned = text.trim().replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  const name = (parsed.nameNormalized || safeName).trim()
  return {
    // Guarantee first letter is uppercase regardless of AI output
    nameNormalized: name.charAt(0).toUpperCase() + name.slice(1),
    doseNormalized: (parsed.doseNormalized || safeDose).trim(),
  }
}

// ---------------------------------------------------------------------------
// syncOnboardingMedications
// ---------------------------------------------------------------------------
// Called after onboarding step 4. Takes raw medication strings (e.g.
// "metformina 850mg"), normalises each through the AI, and creates a
// Treatment record for every one that doesn't already exist.
// Best-effort — any single failure is swallowed so the user still lands
// on /ingreso without an error dialog.
// ---------------------------------------------------------------------------
export async function syncOnboardingMedications(medicamentos: string[]): Promise<void> {
  if (!medicamentos.length) return

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Fetch existing active treatment names to avoid duplicates (case-insensitive)
  const { data: existing } = await supabase
    .from('treatments')
    .select('name')
    .eq('user_id', user.id)
    .eq('active', true)

  const existingNames = new Set(
    (existing ?? []).map((t: { name: string }) => t.name.toLowerCase().trim())
  )

  for (const raw of medicamentos) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    // Heuristic: last token that looks like a dose (digits + unit) is the dose
    const doseMatch = trimmed.match(/\b(\d+(?:[.,]\d+)?\s*(?:mg|mcg|g|ml|UI|ui|iu|IU|u|U))\s*$/i)
    const doseRaw = doseMatch ? doseMatch[1].trim() : ''
    const nameRaw = doseMatch ? trimmed.slice(0, trimmed.length - doseMatch[0].length).trim() : trimmed

    let normalizedName = nameRaw
    let normalizedDose = doseRaw

    try {
      const result = await normalizeMedication(nameRaw, doseRaw)
      normalizedName = result.nameNormalized
      normalizedDose = result.doseNormalized
    } catch {
      // AI call failed — capitalize the raw string as minimum normalization
      normalizedName = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1)
    }

    // Skip if this medication already exists (by normalized name)
    if (existingNames.has(normalizedName.toLowerCase().trim())) continue

    try {
      await supabase.from('treatments').insert({
        user_id: user.id,
        name: normalizedName.trim(),
        dose: normalizedDose?.trim() || null,
        frequency: 'once_daily',   // safe default; user can edit later
        frequency_label: null,
        indefinite: true,
        started_at: null,
        ended_at: null,
        last_changed_at: null,
        notes: null,
      })
      existingNames.add(normalizedName.toLowerCase().trim())
    } catch {
      // Non-fatal
    }
  }

  revalidatePath('/cuenta')
  revalidatePath('/tratamientos')
  triggerTreatmentCheck(user.id)
}

// Fire-and-forget: regenerate treatment check analysis for a pro user
async function triggerTreatmentCheck(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', userId).single()
    if (profile?.plan !== 'pro') return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    // Invalidate cache by deleting old treatment_check insights, then let next load regenerate
    await supabase
      .from('aliis_insights')
      .delete()
      .eq('user_id', userId)
      .contains('data_window', { type: 'treatment_check' })
  } catch {
    // Non-fatal
  }
}

export async function getTreatments(): Promise<Treatment[]> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('treatments')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: true })
  return (data ?? []) as Treatment[]
}

export async function createTreatment(input: TreatmentInput): Promise<{ data?: Treatment; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { data, error } = await supabase.from('treatments').insert({
    user_id: user.id,
    name: input.name.trim(),
    dose: input.dose?.trim() || null,
    frequency: input.frequency,
    frequency_label: input.frequency_label?.trim() || null,
    indefinite: input.indefinite,
    started_at: input.started_at || null,
    ended_at: input.indefinite ? null : (input.ended_at || null),
    last_changed_at: input.last_changed_at || null,
    notes: input.notes?.trim() || null,
  }).select().single()
  revalidatePath('/cuenta')
  revalidatePath('/tratamientos')
  if (data && !error) triggerTreatmentCheck(user.id)
  return { data: data as Treatment | undefined, error: error?.message }
}

export async function updateTreatment(id: string, input: Partial<TreatmentInput>): Promise<{ data?: Treatment; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.dose !== undefined) patch.dose = input.dose?.trim() || null
  if (input.frequency !== undefined) patch.frequency = input.frequency
  if (input.frequency_label !== undefined) patch.frequency_label = input.frequency_label?.trim() || null
  if (input.indefinite !== undefined) {
    patch.indefinite = input.indefinite
    patch.ended_at = input.indefinite ? null : (input.ended_at || null)
  } else if (input.ended_at !== undefined) {
    patch.ended_at = input.ended_at || null
  }
  if (input.started_at !== undefined) patch.started_at = input.started_at || null
  if (input.last_changed_at !== undefined) patch.last_changed_at = input.last_changed_at || null
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null

  const { data, error } = await supabase
    .from('treatments')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  revalidatePath('/cuenta')
  revalidatePath('/tratamientos')
  if (data && !error) triggerTreatmentCheck(user.id)
  return { data: data ?? undefined, error: error?.message }
}

export async function deleteTreatment(id: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { error } = await supabase
    .from('treatments')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/cuenta')
  revalidatePath('/tratamientos')
  return { error: error?.message }
}
