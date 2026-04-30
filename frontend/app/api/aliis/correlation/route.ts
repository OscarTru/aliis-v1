import { generateText } from 'ai'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { models } from '@/lib/ai-providers'
import type { SymptomLog, AdherenceLog } from '@/lib/types'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  // Pro only
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, name')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    return Response.json({ error: 'Esta función es exclusiva de Aliis Pro.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const days = Math.max(7, Math.min(90, parseInt(searchParams.get('days') ?? '30', 10)))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [logsRes, adherenceRes] = await Promise.all([
    supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', since)
      .order('logged_at', { ascending: true }),
    supabase
      .from('adherence_logs')
      .select('medication, taken_date')
      .eq('user_id', user.id)
      .gte('taken_date', since.slice(0, 10))
      .order('taken_date', { ascending: true }),
  ])

  const logs = (logsRes.data ?? []) as SymptomLog[]
  const adherenceLogs = (adherenceRes.data ?? []) as Pick<AdherenceLog, 'medication' | 'taken_date'>[]

  if (logs.length === 0 && adherenceLogs.length === 0) {
    return Response.json({
      error: `Necesitas al menos 7 días de registros para el análisis. Lleva unos días más registrando y vuelve.`
    }, { status: 422 })
  }

  // Count unique days with logs
  const uniqueDays = new Set([
    ...logs.map(l => l.logged_at.slice(0, 10)),
    ...adherenceLogs.map(l => l.taken_date),
  ])
  if (uniqueDays.size < 7) {
    return Response.json({
      error: `Necesitas al menos 7 días de registros para el análisis. Llevas ${uniqueDays.size} día${uniqueDays.size === 1 ? '' : 's'}.`
    }, { status: 422 })
  }

  // Build summary for prompt
  const vitalsLines = logs.map(l => {
    const parts: string[] = [`fecha: ${l.logged_at.slice(0, 10)}`]
    if (l.glucose !== null) parts.push(`glucosa: ${l.glucose} mg/dL`)
    if (l.bp_systolic !== null) parts.push(`presión: ${l.bp_systolic}/${l.bp_diastolic} mmHg`)
    if (l.heart_rate !== null) parts.push(`FC: ${l.heart_rate} bpm`)
    if (l.temperature !== null) parts.push(`temp: ${l.temperature}°C`)
    if (l.note) parts.push(`nota: "${l.note}"`)
    return parts.join(', ')
  }).join('\n')

  const adherenceByDate: Record<string, string[]> = {}
  for (const a of adherenceLogs) {
    adherenceByDate[a.taken_date] = adherenceByDate[a.taken_date] ?? []
    adherenceByDate[a.taken_date].push(a.medication)
  }
  const adherenceLines = Object.entries(adherenceByDate)
    .map(([date, meds]) => `${date}: ${meds.join(', ')}`)
    .join('\n')

  const userName = profile.name ?? 'tú'

  const systemPrompt = `Eres Aliis, el agente de salud personal. Tu trabajo es encontrar patrones entre los signos vitales y el cumplimiento de medicamentos del usuario.

Reglas:
- Habla en segunda persona (tú, tienes, has)
- Habla en primera persona cuando describes lo que notaste ("he visto", "noto que")
- Máximo 4 oraciones
- Menciona correlaciones concretas si las hay (ej: "los días que tomaste X tu presión estuvo más baja")
- Si no hay correlación clara, dilo honestamente y sugiere seguir registrando
- Nunca diagnostiques. Si algo es relevante: "podría valer la pena mencionárselo a tu médico"
- Tono cercano, no clínico
- Responde siempre en español`

  const userMessage = `Usuario: ${userName}
Período analizado: últimos ${days} días
Días con registros: ${uniqueDays.size}

SIGNOS VITALES:
${vitalsLines || 'Sin registros de vitales'}

MEDICAMENTOS TOMADOS POR DÍA:
${adherenceLines || 'Sin registros de adherencia'}

Analiza si hay patrones entre la adherencia a medicamentos y los valores de signos vitales. Sé específico con fechas o tendencias si las ves.`

  const { text } = await generateText({
    model: models.insight,
    system: systemPrompt,
    prompt: userMessage,
    maxOutputTokens: 200,
  })

  return Response.json({ content: text.trim(), days, dataPoints: logs.length + adherenceLogs.length })
}
