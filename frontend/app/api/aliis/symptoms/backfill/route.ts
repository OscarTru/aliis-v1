import { anthropic, cachedSystem } from '@/lib/anthropic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { logLlmUsage } from '@/lib/llm-usage'
import type { SymptomLog } from '@/lib/types'
import { logger } from '@/lib/logger'
import { HAIKU_4_5 } from '@/lib/ai-models'

const SYSTEM_PROMPT = `Eres un extractor de síntomas médicos. Dado un conjunto de registros de salud de un paciente, extrae todos los síntomas únicos mencionados o implícitos en todos los registros.

Para cada síntoma evalúa si necesita atención médica basándote en:
- Si es persistente o recurrente (aparece en más de un registro)
- Si los valores vitales asociados son anormales (glucosa >200 o <70, tensión sistólica >140 o <90, FC >100 o <50, temperatura >38 o <35.5)
- Si el síntoma en sí es potencialmente grave

Responde ÚNICAMENTE con JSON válido en este formato exacto:
[{"name": "nombre del síntoma en minúsculas", "needs_medical_attention": true/false, "attention_reason": "razón concisa o null", "occurrences": número_de_registros_donde_aparece, "first_log_index": índice_del_registro_más_antiguo, "last_log_index": índice_del_registro_más_reciente}]

Si no hay síntomas, responde: []
No incluyas texto adicional fuera del JSON.`

interface ExtractedSymptom {
  name: string
  needs_medical_attention: boolean
  attention_reason: string | null
  occurrences: number
  first_log_index: number
  last_log_index: number
}

function buildBatchMessage(logs: SymptomLog[]): string {
  const entries = logs.map((log, i) => {
    const lines = [
      `Registro ${i} (${log.logged_at}):`,
      log.note ? `  Nota: ${log.note}` : '  (sin nota)',
      log.glucose !== null ? `  Glucosa: ${log.glucose} mg/dL` : '',
      log.bp_systolic !== null ? `  Tensión sistólica: ${log.bp_systolic} mmHg` : '',
      log.bp_diastolic !== null ? `  Tensión diastólica: ${log.bp_diastolic} mmHg` : '',
      log.heart_rate !== null ? `  Frecuencia cardíaca: ${log.heart_rate} lpm` : '',
      log.weight !== null ? `  Peso: ${log.weight} kg` : '',
      log.temperature !== null ? `  Temperatura: ${log.temperature}°C` : '',
    ].filter(Boolean).join('\n')
    return lines
  })
  return entries.join('\n\n')
}

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { count } = await supabase
    .from('tracked_symptoms')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) > 0) {
    return Response.json({ skipped: true })
  }

  const { data: logsData, error: logsError } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })
    .limit(10)


  const logs = (logsData ?? []) as SymptomLog[]
  if (logs.length === 0) return Response.json({ processed: 0, symptoms: [] })

  let extracted: ExtractedSymptom[] = []
  try {
    const response = await anthropic.messages.create({
      model: HAIKU_4_5,
      max_tokens: 1024,
      system: cachedSystem(SYSTEM_PROMPT),
      messages: [{ role: 'user', content: buildBatchMessage(logs) }],
    })
    await logLlmUsage({
      userId: user.id,
      endpoint: 'symptoms_backfill',
      model: HAIKU_4_5,
      usage: response.usage,
    })
    let raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]'
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) extracted = parsed
  } catch (err) {
    logger.error({ err, route: 'aliis_symptoms_backfill' }, 'Claude API error')
    return Response.json({ processed: 0, symptoms: [] })
  }

  const now = new Date().toISOString()

  for (const symptom of extracted) {
    if (!symptom.name || typeof symptom.name !== 'string') continue
    const name = symptom.name.toLowerCase()
    const firstLog = logs[symptom.first_log_index] ?? logs[0]
    const lastLog = logs[symptom.last_log_index] ?? logs[logs.length - 1]

    const { error: insertError } = await supabase.from('tracked_symptoms').insert({
      user_id: user.id,
      name,
      first_seen_at: firstLog.logged_at,
      last_seen_at: lastLog.logged_at,
      occurrences: Math.max(1, symptom.occurrences ?? 1),
      needs_medical_attention: symptom.needs_medical_attention,
      attention_reason: symptom.attention_reason ?? null,
      created_at: now,
    })
    if (insertError && insertError.code !== '23505') {
      logger.error({ err: insertError }, 'symptoms insert failed')
    }
  }

  const { data: result } = await supabase
    .from('tracked_symptoms')
    .select('*')
    .eq('user_id', user.id)
    .order('last_seen_at', { ascending: false })

  return Response.json({ processed: logs.length, symptoms: result ?? [] })
}
