import { createServerSupabaseClient } from './supabase-server'
import { anthropic, cachedSystem } from './anthropic'
import { readMemory } from './agent-memory'
import type { PatientSummary } from './types'

const SUMMARY_MAX_AGE_DAYS = 7
const HAIKU = 'claude-haiku-4-5-20251001'

export async function getPatientContext(userId: string): Promise<{
  summary: PatientSummary
  summaryText: string
}> {
  const supabase = await createServerSupabaseClient()

  // Try reading cached patient_summary
  const { data: cached } = await supabase
    .from('aliis_insights')
    .select('content, generated_at')
    .eq('user_id', userId)
    .eq('type', 'patient_summary')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cached) {
    const ageMs = Date.now() - new Date(cached.generated_at).getTime()
    const ageDays = ageMs / 86_400_000
    if (ageDays < SUMMARY_MAX_AGE_DAYS) {
      // Check if medical_profiles or treatments changed after summary was generated
      const [profileUpdated, treatmentUpdated] = await Promise.all([
        supabase.from('medical_profiles').select('updated_at').eq('user_id', userId).maybeSingle(),
        supabase.from('treatments').select('updated_at').eq('user_id', userId).eq('active', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      const latestUpdate = Math.max(
        profileUpdated.data ? new Date(profileUpdated.data.updated_at).getTime() : 0,
        treatmentUpdated.data ? new Date(treatmentUpdated.data.updated_at).getTime() : 0,
      )
      const summaryTime = new Date(cached.generated_at).getTime()
      if (latestUpdate < summaryTime) {
        try {
          const summary = JSON.parse(cached.content) as PatientSummary
          return { summary, summaryText: summary.resumen_narrativo }
        } catch {
          // Fall through to regenerate if content is malformed
        }
      }
    }
  }

  return generateAndCachePatientSummary(userId)
}

export async function generateAndCachePatientSummary(userId: string): Promise<{
  summary: PatientSummary
  summaryText: string
}> {
  const supabase = await createServerSupabaseClient()
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString()

  const [profileRes, medRes, treatRes, logsRes, adherenceRes, trackedRes, recentMemory] = await Promise.all([
    supabase.from('profiles').select('name, next_appointment').eq('id', userId).single(),
    supabase.from('medical_profiles').select('condiciones_previas, edad, sexo').eq('user_id', userId).maybeSingle(),
    supabase.from('treatments').select('name, dose, frequency_label').eq('user_id', userId).eq('active', true),
    supabase.from('symptom_logs').select('logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, temperature, weight').eq('user_id', userId).gte('logged_at', since30).order('logged_at', { ascending: false }).limit(100),
    supabase.from('adherence_logs').select('status').eq('user_id', userId).gte('taken_date', since14.slice(0, 10)),
    supabase.from('tracked_symptoms').select('name, occurrences, needs_medical_attention').eq('user_id', userId).eq('resolved', false).order('occurrences', { ascending: false }).limit(5),
    readMemory(userId, 'MonitorAgent', 'alert', 7),
  ])

  const treatments = treatRes.data ?? []
  const logs = logsRes.data ?? []
  const adherenceLogs = adherenceRes.data ?? []
  const trackedSymptoms = trackedRes.data ?? []
  const condiciones = (medRes.data?.condiciones_previas as string[] | null) ?? []

  const total = adherenceLogs.length
  const taken = adherenceLogs.filter(a => a.status === 'taken').length
  const adherencia14d = total > 0 ? Math.round((taken / total) * 100) : 0

  const sintomas_frecuentes = trackedSymptoms.map(s => s.name)
  const senales_alarma = trackedSymptoms
    .filter(s => s.needs_medical_attention)
    .map(s => s.name)

  const lastLog = logs[0]
  const vitales_recientes: PatientSummary['vitales_recientes'] = {}
  if (lastLog) {
    if (lastLog.bp_systolic && lastLog.bp_diastolic)
      vitales_recientes.bp = `${lastLog.bp_systolic}/${lastLog.bp_diastolic} mmHg`
    if (lastLog.heart_rate) vitales_recientes.hr = lastLog.heart_rate
    if (lastLog.glucose) vitales_recientes.glucose = lastLog.glucose
    if (lastLog.weight) vitales_recientes.weight = lastLog.weight
  }

  const alertDays = recentMemory.filter(m => (m.content as { level?: string }).level === 'high').length
  const patron_reciente = alertDays >= 3
    ? `${alertDays} días consecutivos con alertas de vitales esta semana`
    : null

  const profileData = profileRes.data as { name: string | null; next_appointment: string | null } | null

  const systemPrompt = 'Eres Aliis. Genera un párrafo de contexto clínico conciso para uso interno. Máximo 3 oraciones. Solo datos objetivos, sin consejos.'
  const userMsg = [
    `Paciente: ${profileData?.name ?? 'usuario'}`,
    `Condiciones: ${condiciones.join(', ') || 'no registradas'}`,
    `Tratamientos activos: ${treatments.map(t => `${t.name} ${t.dose ?? ''}`).join(', ') || 'ninguno'}`,
    `Adherencia 14d: ${adherencia14d}%`,
    `Síntomas frecuentes: ${sintomas_frecuentes.join(', ') || 'ninguno'}`,
    vitales_recientes.bp ? `TA: ${vitales_recientes.bp}` : '',
    vitales_recientes.glucose ? `Glucosa: ${vitales_recientes.glucose} mg/dL` : '',
    profileData?.next_appointment ? `Próxima cita: ${profileData.next_appointment}` : '',
    patron_reciente ? `Patrón reciente: ${patron_reciente}` : '',
    senales_alarma.length > 0 ? `Señales de alarma: ${senales_alarma.join(', ')}` : '',
  ].filter(Boolean).join('\n')

  let resumen_narrativo = `Paciente con ${condiciones.join(', ') || 'historial no registrado'}.`
  try {
    const message = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 150,
      system: cachedSystem(systemPrompt),
      messages: [{ role: 'user', content: userMsg }],
    })
    resumen_narrativo = (message.content[0] as { type: string; text: string }).text.trim()
  } catch (err) {
    console.error('[patient-context] narrative generation failed', err)
  }

  const summary: PatientSummary = {
    condiciones,
    tratamientos_activos: treatments.map(t => `${t.name} ${t.dose ?? ''}`),
    adherencia_14d: adherencia14d,
    sintomas_frecuentes,
    vitales_recientes,
    proxima_cita: profileData?.next_appointment ?? null,
    senales_alarma,
    patron_reciente,
    resumen_narrativo,
    generated_at: new Date().toISOString(),
  }

  // Delete today's patient_summary if it exists, then insert fresh
  // (can't upsert on function-based unique index)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  await supabase
    .from('aliis_insights')
    .delete()
    .eq('user_id', userId)
    .eq('type', 'patient_summary')
    .gte('generated_at', todayStart.toISOString())

  await supabase.from('aliis_insights').insert({
    user_id: userId,
    type: 'patient_summary',
    content: JSON.stringify(summary),
    generated_at: summary.generated_at,
    data_window: { source: 'patient_context' },
  })

  return { summary, summaryText: resumen_narrativo }
}
