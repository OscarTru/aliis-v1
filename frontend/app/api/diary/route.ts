import { generateText } from 'ai'
import { models } from '@/lib/ai-providers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

interface ExtractedSymptom {
  name: string
  needs_medical_attention: boolean
  attention_reason: string | null
}

const EXTRACT_SYSTEM = `Eres un extractor de síntomas médicos. Dado un texto libre de un diario de salud, extrae todos los síntomas mencionados o implícitos.

Para cada síntoma evalúa si necesita atención médica basándote en:
- Si es persistente, grave, o potencialmente peligroso
- Si el contexto sugiere urgencia

Responde ÚNICAMENTE con JSON válido:
[{"name": "nombre del síntoma en minúsculas", "needs_medical_attention": true/false, "attention_reason": "razón o null"}]

Si no hay síntomas, responde: []
No incluyas texto adicional fuera del JSON.`

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const rl = await rateLimit(`user:${user.id}:diary`, 30, 300)
  if (!rl.ok) {
    return Response.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const action = body.action as string | undefined

  // Step 1: extract symptoms from free text (no DB write yet)
  if (action === 'extract') {
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : ''
    if (!text) return Response.json({ symptoms: [] })

    const { text: raw } = await generateText({
      model: models.symptoms,
      system: EXTRACT_SYSTEM,
      prompt: text,
      maxOutputTokens: 512,
    })

    let symptoms: ExtractedSymptom[] = []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) symptoms = parsed.filter(s => typeof s.name === 'string')
    } catch {
      // return empty on parse error
    }

    return Response.json({ symptoms })
  }

  // Step 2: save confirmed entry
  if (action === 'save') {
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : ''
    if (!text) return Response.json({ error: 'El texto no puede estar vacío' }, { status: 400 })

    const confirmedSymptoms = Array.isArray(body.symptoms)
      ? (body.symptoms as ExtractedSymptom[]).filter(s => typeof s.name === 'string')
      : []

    const MAX_SYMPTOMS = 50
    if (confirmedSymptoms.length > MAX_SYMPTOMS) {
      return Response.json({ error: 'Demasiados síntomas en una sola petición' }, { status: 400 })
    }

    const validSymptoms = confirmedSymptoms.filter(s => s.name.length <= 200)

    const { data: log, error: logError } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: user.id,
        free_text: text,
        glucose: null,
        bp_systolic: null,
        bp_diastolic: null,
        heart_rate: null,
        weight: null,
        temperature: null,
        note: null,
      })
      .select()
      .single()

    if (logError) return Response.json({ error: 'Error al guardar' }, { status: 500 })

    const now = new Date().toISOString()
    for (const symptom of validSymptoms) {
      const { data: existing } = await supabase
        .from('tracked_symptoms')
        .select('id, occurrences')
        .eq('user_id', user.id)
        .ilike('name', symptom.name)
        .eq('resolved', false)
        .single()

      if (existing) {
        await supabase.from('tracked_symptoms').update({
          occurrences: existing.occurrences + 1,
          last_seen_at: now,
          needs_medical_attention: symptom.needs_medical_attention,
          attention_reason: symptom.attention_reason ?? null,
        }).eq('id', existing.id)
      } else {
        await supabase.from('tracked_symptoms').insert({
          user_id: user.id,
          name: symptom.name.toLowerCase(),
          first_seen_at: now,
          last_seen_at: now,
          occurrences: 1,
          needs_medical_attention: symptom.needs_medical_attention,
          attention_reason: symptom.attention_reason ?? null,
        })
      }
    }

    return Response.json({ log })
  }

  return Response.json({ error: 'Acción no válida' }, { status: 400 })
}
