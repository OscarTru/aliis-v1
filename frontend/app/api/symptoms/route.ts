import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SupabaseClient } from '@supabase/supabase-js'

function parseNumeric(v: unknown, label: string, lo: number, hi: number): number | null {
  if (v === undefined || v === null) return null
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new RangeError(`${label} debe ser un número válido`)
  }
  if (v < lo || v > hi) {
    throw new RangeError(`${label} fuera de rango (${lo}–${hi})`)
  }
  return v
}

interface ExtractedSymptom {
  name: string
  needs_medical_attention: boolean
  attention_reason: string | null
}

interface VitalsSnapshot {
  glucose: number | null
  bp_systolic: number | null
  bp_diastolic: number | null
  heart_rate: number | null
  weight: number | null
  temperature: number | null
}

async function extractAndUpsertSymptoms(
  userId: string,
  noteStr: string | null,
  vitals: VitalsSnapshot,
  supabase: SupabaseClient
): Promise<void> {
  const { glucose, bp_systolic, bp_diastolic, heart_rate, weight, temperature } = vitals

  const userMessage = [
    'Registro de salud:',
    noteStr ? `Nota: ${noteStr}` : '(sin nota)',
    glucose !== null ? `Glucosa: ${glucose} mg/dL` : '',
    bp_systolic !== null ? `Tensión sistólica: ${bp_systolic} mmHg` : '',
    bp_diastolic !== null ? `Tensión diastólica: ${bp_diastolic} mmHg` : '',
    heart_rate !== null ? `Frecuencia cardíaca: ${heart_rate} lpm` : '',
    weight !== null ? `Peso: ${weight} kg` : '',
    temperature !== null ? `Temperatura: ${temperature}°C` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `Eres un extractor de síntomas médicos. Dado un registro de salud de un paciente, extrae todos los síntomas mencionados o implícitos.

Para cada síntoma evalúa si necesita atención médica basándote en:
- Si es persistente o recurrente
- Si los valores vitales asociados son anormales (glucosa >200 o <70, tensión sistólica >140 o <90, FC >100 o <50, temperatura >38 o <35.5)
- Si el síntoma en sí es potencialmente grave

Responde ÚNICAMENTE con JSON válido en este formato exacto:
[{"name": "nombre del síntoma en minúsculas", "needs_medical_attention": true/false, "attention_reason": "razón o null"}]

Si no hay síntomas, responde: []
No incluyas texto adicional fuera del JSON.`,
    messages: [{ role: 'user', content: userMessage }],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]'

  let symptoms: ExtractedSymptom[]
  try {
    symptoms = JSON.parse(rawText) as ExtractedSymptom[]
    if (!Array.isArray(symptoms)) symptoms = []
  } catch {
    console.error('extractAndUpsertSymptoms: failed to parse JSON:', rawText)
    return
  }

  const now = new Date().toISOString()

  for (const symptom of symptoms) {
    if (!symptom.name || typeof symptom.name !== 'string') continue

    const { data: existing } = await supabase
      .from('tracked_symptoms')
      .select('id, occurrences')
      .eq('user_id', userId)
      .ilike('name', symptom.name)
      .eq('resolved', false)
      .single()

    if (existing) {
      await supabase
        .from('tracked_symptoms')
        .update({
          occurrences: existing.occurrences + 1,
          last_seen_at: now,
          needs_medical_attention: symptom.needs_medical_attention,
          attention_reason: symptom.attention_reason ?? null,
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('tracked_symptoms').insert({
        user_id: userId,
        name: symptom.name.toLowerCase(),
        first_seen_at: now,
        last_seen_at: now,
        occurrences: 1,
        needs_medical_attention: symptom.needs_medical_attention,
        attention_reason: symptom.attention_reason ?? null,
      })
    }
  }
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('auth error:', authError)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Request body inválido' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Request body inválido' }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  let glucose: number | null
  let bp_systolic: number | null
  let bp_diastolic: number | null
  let heart_rate: number | null
  let weight: number | null
  let temperature: number | null

  try {
    glucose = parseNumeric(b.glucose, 'Glucosa', 1, 1000)
    bp_systolic = parseNumeric(b.bp_systolic, 'Tensión sistólica', 1, 300)
    bp_diastolic = parseNumeric(b.bp_diastolic, 'Tensión diastólica', 1, 300)
    heart_rate = parseNumeric(b.heart_rate, 'Frecuencia cardíaca', 1, 300)
    weight = parseNumeric(b.weight, 'Peso', 1, 500)
    temperature = parseNumeric(b.temperature, 'Temperatura', 30, 45)
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 })
  }

  const hasNumeric = [glucose, bp_systolic, bp_diastolic, heart_rate, weight, temperature].some(v => v !== null)
  if (!hasNumeric) {
    return Response.json({ error: 'Ingresa al menos un valor numérico' }, { status: 400 })
  }

  const noteStr = typeof b.note === 'string' ? b.note.trim().slice(0, 500) || null : null

  const { data, error } = await supabase
    .from('symptom_logs')
    .insert([{
      user_id: user.id,
      glucose,
      bp_systolic,
      bp_diastolic,
      heart_rate,
      weight,
      temperature,
      note: noteStr,
    }])
    .select()
    .single()

  if (error) {
    console.error('supabase error:', error)
    return Response.json({ error: 'Error al guardar' }, { status: 500 })
  }

  // fire-and-forget — don't await
  extractAndUpsertSymptoms(
    user.id,
    noteStr,
    { glucose, bp_systolic, bp_diastolic, heart_rate, weight, temperature },
    supabase
  ).catch(console.error)

  return Response.json(data)
}
