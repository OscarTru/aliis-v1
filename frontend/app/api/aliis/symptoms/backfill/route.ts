import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SymptomLog, TrackedSymptom } from '@/lib/types'

const SYSTEM_PROMPT = `Eres un extractor de síntomas médicos. Dado un registro de salud de un paciente, extrae todos los síntomas mencionados o implícitos.

Para cada síntoma evalúa si necesita atención médica basándote en:
- Si es persistente o recurrente
- Si los valores vitales asociados son anormales (glucosa >200 o <70, tensión sistólica >140 o <90, FC >100 o <50, temperatura >38 o <35.5)
- Si el síntoma en sí es potencialmente grave

Responde ÚNICAMENTE con JSON válido en este formato exacto:
[{"name": "nombre del síntoma en minúsculas", "needs_medical_attention": true/false, "attention_reason": "razón o null"}]

Si no hay síntomas, responde: []
No incluyas texto adicional fuera del JSON.`

interface ExtractedSymptom {
  name: string
  needs_medical_attention: boolean
  attention_reason: string | null
}

function buildUserMessage(log: SymptomLog): string {
  return [
    'Registro de salud:',
    log.note ? `Nota: ${log.note}` : '(sin nota)',
    log.glucose !== null ? `Glucosa: ${log.glucose} mg/dL` : '',
    log.bp_systolic !== null ? `Tensión sistólica: ${log.bp_systolic} mmHg` : '',
    log.bp_diastolic !== null ? `Tensión diastólica: ${log.bp_diastolic} mmHg` : '',
    log.heart_rate !== null ? `Frecuencia cardíaca: ${log.heart_rate} lpm` : '',
    log.weight !== null ? `Peso: ${log.weight} kg` : '',
    log.temperature !== null ? `Temperatura: ${log.temperature}°C` : '',
  ].filter(Boolean).join('\n')
}

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  // Check if user already has tracked symptoms — if so, skip backfill
  const { count } = await supabase
    .from('tracked_symptoms')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) > 0) {
    return Response.json({ skipped: true })
  }

  // Fetch up to 20 most recent logs that have a note
  const { data: logsData } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', user.id)
    .not('note', 'is', null)
    .order('logged_at', { ascending: false })
    .limit(20)

  const logs = (logsData ?? []) as SymptomLog[]
  if (logs.length === 0) return Response.json({ processed: 0, symptoms: [] })

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const now = new Date().toISOString()

  // Process each log sequentially to avoid hammering the API
  for (const log of logs) {
    let extracted: ExtractedSymptom[] = []
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserMessage(log) }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]'
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) extracted = parsed
    } catch {
      continue
    }

    for (const symptom of extracted) {
      if (!symptom.name || typeof symptom.name !== 'string') continue
      const name = symptom.name.toLowerCase()

      const { data: existing } = await supabase
        .from('tracked_symptoms')
        .select('id, occurrences')
        .eq('user_id', user.id)
        .ilike('name', name)
        .eq('resolved', false)
        .single()

      if (existing) {
        await supabase
          .from('tracked_symptoms')
          .update({
            occurrences: existing.occurrences + 1,
            last_seen_at: log.logged_at,
            needs_medical_attention: symptom.needs_medical_attention,
            attention_reason: symptom.attention_reason ?? null,
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('tracked_symptoms').insert({
          user_id: user.id,
          name,
          first_seen_at: log.logged_at,
          last_seen_at: log.logged_at,
          occurrences: 1,
          needs_medical_attention: symptom.needs_medical_attention,
          attention_reason: symptom.attention_reason ?? null,
          created_at: now,
        })
      }
    }
  }

  // Return the resulting tracked symptoms so the client can update state
  const { data: result } = await supabase
    .from('tracked_symptoms')
    .select('*')
    .eq('user_id', user.id)
    .order('last_seen_at', { ascending: false })

  return Response.json({ processed: logs.length, symptoms: result ?? [] })
}
