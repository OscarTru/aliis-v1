import { generateText } from 'ai'
import { models } from '@/lib/ai-providers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

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

  const SYMPTOMS_SYSTEM = `Eres un extractor de síntomas médicos. Dado un registro de salud de un paciente, extrae todos los síntomas mencionados o implícitos.

Para cada síntoma evalúa si necesita atención médica basándote en:
- Si es persistente o recurrente
- Si los valores vitales asociados son anormales (glucosa >200 o <70, tensión sistólica >140 o <90, FC >100 o <50, temperatura >38 o <35.5)
- Si el síntoma en sí es potencialmente grave

Responde ÚNICAMENTE con JSON válido en este formato exacto:
[{"name": "nombre del síntoma en minúsculas", "needs_medical_attention": true/false, "attention_reason": "razón o null"}]

Si no hay síntomas, responde: []
No incluyas texto adicional fuera del JSON.`

  const { text: rawText } = await generateText({
    model: models.symptoms,
    system: SYMPTOMS_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
    maxOutputTokens: 512,
  })

  let symptoms: ExtractedSymptom[]
  try {
    symptoms = JSON.parse(rawText) as ExtractedSymptom[]
    if (!Array.isArray(symptoms)) symptoms = []
  } catch {
    logger.error({ rawTextSample: rawText.slice(0, 200) }, 'extractAndUpsertSymptoms: failed to parse JSON')
    return
  }

  // Normalise + dedupe up-front so we don't double-count the same symptom
  // mentioned twice in the same log (e.g. "dolor de cabeza" + "cefalea").
  // Dedupe by lowercased name; later occurrences override attention flags.
  const normalised = new Map<string, ExtractedSymptom>()
  for (const s of symptoms) {
    if (!s.name || typeof s.name !== 'string') continue
    const key = s.name.trim().toLowerCase()
    if (!key) continue
    normalised.set(key, { ...s, name: key })
  }
  if (normalised.size === 0) return

  const now = new Date().toISOString()
  const names = [...normalised.keys()]

  // Single round-trip: fetch ALL existing tracked symptoms for these names.
  // Was N round-trips (one .select per symptom) → now 1 batch select.
  const { data: existingRows, error: selectError } = await supabase
    .from('tracked_symptoms')
    .select('id, name, occurrences')
    .eq('user_id', userId)
    .eq('resolved', false)
    .in('name', names)

  if (selectError) {
    logger.error({ err: selectError }, 'extractAndUpsertSymptoms: select failed')
    return
  }

  // Build per-name lookup. Names in the DB should already be lowercase
  // (we always insert that way), but defensively lowercase again here.
  const existingByName = new Map<string, { id: string; occurrences: number }>()
  for (const row of existingRows ?? []) {
    existingByName.set(row.name.toLowerCase(), { id: row.id, occurrences: row.occurrences })
  }

  // Split into two batches: updates for known symptoms, inserts for new ones.
  const updates: Array<{ id: string; occurrences: number; symptom: ExtractedSymptom }> = []
  const inserts: Array<Record<string, unknown>> = []

  for (const symptom of normalised.values()) {
    const existing = existingByName.get(symptom.name)
    if (existing) {
      updates.push({ id: existing.id, occurrences: existing.occurrences + 1, symptom })
    } else {
      inserts.push({
        user_id: userId,
        name: symptom.name,
        first_seen_at: now,
        last_seen_at: now,
        occurrences: 1,
        needs_medical_attention: symptom.needs_medical_attention,
        attention_reason: symptom.attention_reason ?? null,
      })
    }
  }

  // One bulk INSERT for all new symptoms.
  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from('tracked_symptoms').insert(inserts)
    if (insertError) {
      logger.error({ err: insertError, count: inserts.length }, 'extractAndUpsertSymptoms: bulk insert failed')
    }
  }

  // Updates can't be batched into one query (each row needs a different value)
  // but Promise.all parallelises the round-trips. With ~10 symptoms max this is
  // bounded and finishes in one network RTT instead of 10.
  if (updates.length > 0) {
    await Promise.allSettled(
      updates.map(u =>
        supabase
          .from('tracked_symptoms')
          .update({
            occurrences: u.occurrences,
            last_seen_at: now,
            needs_medical_attention: u.symptom.needs_medical_attention,
            attention_reason: u.symptom.attention_reason ?? null,
          })
          .eq('id', u.id)
      )
    )
  }
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) logger.error({ err: authError }, 'symptoms auth error')
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
    logger.error({ err: error }, 'symptoms supabase error')
    return Response.json({ error: 'Error al guardar' }, { status: 500 })
  }

  // fire-and-forget — don't await
  extractAndUpsertSymptoms(
    user.id,
    noteStr,
    { glucose, bp_systolic, bp_diastolic, heart_rate, weight, temperature },
    supabase
  ).catch((err) => logger.error({ err }, 'extractAndUpsertSymptoms async failed'))

  return Response.json(data)
}
