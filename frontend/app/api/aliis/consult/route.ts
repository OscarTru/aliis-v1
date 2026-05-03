import { generateText } from 'ai'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { models } from '@/lib/ai-providers'
import { rateLimit } from '@/lib/rate-limit'
import type { SymptomLog, TrackedSymptom } from '@/lib/types'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const rl = await rateLimit(`user:${user.id}:consult`, 10, 3600)
  if (!rl.ok) {
    return Response.json(
      { error: 'Demasiadas solicitudes — intenta más tarde' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, name')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    return Response.json({ error: 'Esta función es exclusiva de Aliis Pro.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const packId: string | null = typeof body.packId === 'string' ? body.packId : null

  // Reuse existing summary if generated in the last 7 days for this pack
  if (packId) {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
      .from('consult_summaries')
      .select('token')
      .eq('user_id', user.id)
      .eq('pack_id', packId)
      .gte('created_at', since7d)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existing) return Response.json({ token: existing.token, cached: true })
  }

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [packsRes, logsRes, trackedRes, medRes, packRes] = await Promise.all([
    supabase
      .from('packs')
      .select('dx, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', since30)
      .order('logged_at', { ascending: false }),
    supabase
      .from('tracked_symptoms')
      .select('name, occurrences, needs_medical_attention, attention_reason')
      .eq('user_id', user.id)
      .eq('resolved', false)
      .order('last_seen_at', { ascending: false })
      .limit(10),
    supabase
      .from('medical_profiles')
      .select('medicamentos, alergias, condiciones_previas, edad, sexo')
      .eq('user_id', user.id)
      .maybeSingle(),
    packId
      ? supabase.from('packs').select('dx, summary').eq('id', packId).eq('user_id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const userName = profile.name ?? 'Paciente'
  const recentDx = (packsRes.data ?? []).map(p => p.dx)
  const logs = (logsRes.data ?? []) as SymptomLog[]
  const tracked = (trackedRes.data ?? []) as Pick<TrackedSymptom, 'name' | 'occurrences' | 'needs_medical_attention' | 'attention_reason'>[]
  const med = medRes.data

  // Build vitals summary
  const avg = (vals: (number | null)[]): number | null => {
    const nums = vals.filter((v): v is number => v !== null)
    return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
  }
  const avgGlucose = avg(logs.map(l => l.glucose))
  const avgSbp = avg(logs.map(l => l.bp_systolic))
  const avgDbp = avg(logs.map(l => l.bp_diastolic))
  const avgHr = avg(logs.map(l => l.heart_rate))
  const avgWeight = avg(logs.map(l => l.weight))
  const avgTemp = avg(logs.map(l => l.temperature))

  const vitalsLines: string[] = []
  if (avgGlucose !== null) vitalsLines.push(`Glucosa promedio: ${avgGlucose} mg/dL`)
  if (avgSbp !== null) vitalsLines.push(`Presión promedio: ${avgSbp}/${avgDbp} mmHg`)
  if (avgHr !== null) vitalsLines.push(`Frecuencia cardíaca promedio: ${avgHr} bpm`)
  if (avgWeight !== null) vitalsLines.push(`Peso promedio: ${avgWeight} kg`)
  if (avgTemp !== null) vitalsLines.push(`Temperatura promedio: ${avgTemp}°C`)

  const medParts: string[] = []
  if (med?.edad) medParts.push(`${med.edad} años`)
  if (med?.sexo && med.sexo !== 'prefiero_no_decir') medParts.push(med.sexo)
  if (med?.condiciones_previas?.length) medParts.push(`Antecedentes: ${med.condiciones_previas.join(', ')}`)
  if (med?.medicamentos?.length) medParts.push(`Medicamentos: ${med.medicamentos.join(', ')}`)
  if (med?.alergias?.length) medParts.push(`Alergias: ${med.alergias.join(', ')}`)

  const flaggedSymptoms = tracked.filter(s => s.needs_medical_attention)

  const systemPrompt = `Eres un asistente médico que ayuda a pacientes a preparar su próxima consulta médica. Generas un resumen estructurado y conciso que el paciente puede mostrar a su médico.

El resumen debe estar en español, ser claro para un médico, e incluir solo información relevante. No diagnostiques. No recomiendes tratamientos. Organiza la información de forma que facilite la consulta.

Responde SOLO con el texto del resumen, sin encabezados markdown extra, sin JSON.`

  const userMessage = `Genera un resumen pre-consulta para ${userName}.

${medParts.length ? `DATOS DEL PACIENTE:\n${medParts.join('\n')}` : ''}

DIAGNÓSTICOS RECIENTES:
${recentDx.length ? recentDx.map((dx, i) => `${i + 1}. ${dx}`).join('\n') : 'Sin diagnósticos registrados'}

${packRes.data ? `DIAGNÓSTICO ACTUAL A CONSULTAR:\n${packRes.data.dx}\n${packRes.data.summary}` : ''}

SIGNOS VITALES (últimos 30 días, ${logs.length} registros):
${vitalsLines.length ? vitalsLines.join('\n') : 'Sin registros de vitales'}

SÍNTOMAS ACTIVOS (${tracked.length} rastreados):
${tracked.length ? tracked.map(s => `- ${s.name} (${s.occurrences} veces${s.needs_medical_attention ? ', requiere atención médica' : ''})`).join('\n') : 'Sin síntomas activos'}

${flaggedSymptoms.length ? `SÍNTOMAS QUE REQUIEREN ATENCIÓN ESPECIAL:\n${flaggedSymptoms.map(s => `- ${s.name}: ${s.attention_reason ?? ''}`).join('\n')}` : ''}

Genera un resumen estructurado, profesional y conciso (máximo 300 palabras) que el paciente pueda mostrar directamente a su médico en la consulta.`

  const { text } = await generateText({
    model: models.insight,
    system: systemPrompt,
    prompt: userMessage,
    maxOutputTokens: 500,
  })

  const content = text.trim()

  const { data: inserted, error: insertError } = await supabase
    .from('consult_summaries')
    .insert({ user_id: user.id, pack_id: packId, content })
    .select('token')
    .single()

  if (insertError || !inserted) {
    return Response.json({ error: 'Error guardando el resumen.' }, { status: 500 })
  }

  return Response.json({ token: inserted.token, content })
}
