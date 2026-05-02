import { generateText } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { models } from '@/lib/ai-providers'
import { sendPushNotification } from '@/lib/web-push'
import { verifyCronAuth } from '@/lib/cron-auth'
import type { SymptomLog } from '@/lib/types'

const SYSTEM_PROMPT = `Eres Aliis, el agente de salud personal. Una vez al mes generas una "cápsula del tiempo": un mensaje cálido que compara los signos vitales del último mes con el mes anterior.

Reglas:
- Habla en segunda persona (tú, tienes, has)
- Primera persona para lo que notaste ("he visto", "noto que")
- Máximo 3 oraciones
- Si hay mejora: celébrala con calidez, sin exagerar
- Si hay empeoramiento: menciónalo con cuidado, sugiere comentarlo con el médico
- Si no hay diferencia notable: destaca la constancia como algo positivo
- Empieza con algo tipo "Este mes, mirando hacia atrás..."
- Nunca diagnostiques
- Responde siempre en español`

export async function GET(req: Request) {
  const authError = verifyCronAuth(req)
  if (authError) return authError

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const thisMonthStart = `${new Date().toISOString().slice(0, 7)}-01T00:00:00Z`
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const since60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

  const { data: activeUsers } = await supabase
    .from('symptom_logs')
    .select('user_id')
    .gte('logged_at', since30)

  const userIds = [...new Set((activeUsers ?? []).map(r => r.user_id as string))]
  if (userIds.length === 0) return Response.json({ sent: 0, skipped: 0 })

  // Batched: which users already got a capsula this month?
  const { data: existingCapsulas } = await supabase
    .from('aliis_insights')
    .select('user_id')
    .in('user_id', userIds)
    .eq('type', 'capsula')
    .gte('generated_at', thisMonthStart)
  const alreadySent = new Set((existingCapsulas ?? []).map(r => r.user_id as string))

  const toProcess = userIds.filter(id => !alreadySent.has(id))

  // Batched: profiles, all symptom_logs in last 60 days, packs, push subs
  const [profilesRes, logsRes, packsRes, subsRes] = await Promise.all([
    supabase.from('profiles').select('id, name').in('id', toProcess),
    supabase
      .from('symptom_logs')
      .select('user_id, logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, temperature, weight')
      .in('user_id', toProcess)
      .gte('logged_at', since60)
      .order('logged_at', { ascending: false }),
    supabase
      .from('packs')
      .select('user_id, dx, created_at')
      .in('user_id', toProcess)
      .order('created_at', { ascending: false }),
    supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth')
      .in('user_id', toProcess),
  ])

  const profileByUser = new Map(
    (profilesRes.data ?? []).map(p => [p.id, p.name as string | null])
  )
  const logsByUser = new Map<string, SymptomLog[]>()
  for (const log of (logsRes.data ?? []) as SymptomLog[]) {
    const arr = logsByUser.get(log.user_id) ?? []
    arr.push(log)
    logsByUser.set(log.user_id, arr)
  }
  const recentDxByUser = new Map<string, string>()
  for (const p of packsRes.data ?? []) {
    if (!recentDxByUser.has(p.user_id)) recentDxByUser.set(p.user_id, p.dx)
  }
  const subsByUser = new Map((subsRes.data ?? []).map(s => [s.user_id as string, s]))

  let sent = 0
  let skipped = 0

  const insightsToInsert: Array<{
    user_id: string
    content: string
    type: string
    data_window: object
  }> = []
  const notificationsToInsert: Array<{
    user_id: string
    title: string
    body: string
    type: string
    url: string
  }> = []
  const expiredEndpoints: string[] = []

  const avg = (vals: (number | null)[]): number | null => {
    const nums = vals.filter((v): v is number => v !== null)
    return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
  }

  for (const userId of toProcess) {
    const allLogs = logsByUser.get(userId) ?? []
    const logsNow = allLogs.filter(l => l.logged_at >= since30)
    const logsThen = allLogs.filter(l => l.logged_at >= since60 && l.logged_at < since30)

    if (logsNow.length === 0 || logsThen.length === 0) { skipped++; continue }

    const nowStats = {
      glucose: avg(logsNow.map(l => l.glucose)),
      bp_systolic: avg(logsNow.map(l => l.bp_systolic)),
      heart_rate: avg(logsNow.map(l => l.heart_rate)),
      weight: avg(logsNow.map(l => l.weight)),
    }
    const thenStats = {
      glucose: avg(logsThen.map(l => l.glucose)),
      bp_systolic: avg(logsThen.map(l => l.bp_systolic)),
      heart_rate: avg(logsThen.map(l => l.heart_rate)),
      weight: avg(logsThen.map(l => l.weight)),
    }

    const lines: string[] = []
    if (nowStats.glucose !== null && thenStats.glucose !== null)
      lines.push(`Glucosa: ${thenStats.glucose} mg/dL → ${nowStats.glucose} mg/dL`)
    if (nowStats.bp_systolic !== null && thenStats.bp_systolic !== null)
      lines.push(`Presión sistólica: ${thenStats.bp_systolic} mmHg → ${nowStats.bp_systolic} mmHg`)
    if (nowStats.heart_rate !== null && thenStats.heart_rate !== null)
      lines.push(`Frecuencia cardíaca: ${thenStats.heart_rate} bpm → ${nowStats.heart_rate} bpm`)
    if (nowStats.weight !== null && thenStats.weight !== null)
      lines.push(`Peso: ${thenStats.weight} kg → ${nowStats.weight} kg`)

    if (lines.length === 0) { skipped++; continue }

    const userName = profileByUser.get(userId) ?? 'tú'
    const recentDx = recentDxByUser.get(userId) ?? null

    const userMessage = `Usuario: ${userName}
Diagnóstico principal: ${recentDx ?? 'no registrado'}
Registros este mes: ${logsNow.length} | Registros mes anterior: ${logsThen.length}

COMPARACIÓN (mes anterior → este mes):
${lines.join('\n')}

Genera la cápsula del tiempo.`

    let content: string
    try {
      const { text } = await generateText({
        model: models.insight,
        system: SYSTEM_PROMPT,
        prompt: userMessage,
        maxOutputTokens: 150,
      })
      content = text.trim()
    } catch {
      skipped++
      continue
    }

    insightsToInsert.push({
      user_id: userId,
      content,
      type: 'capsula',
      data_window: { logsNow: logsNow.length, logsThen: logsThen.length, nowStats, thenStats },
    })

    notificationsToInsert.push({
      user_id: userId,
      title: 'Tu cápsula del tiempo',
      body: content.slice(0, 200),
      type: 'capsula',
      url: '/diario',
    })

    sent++

    const sub = subsByUser.get(userId)
    if (sub) {
      const result = await sendPushNotification(sub, {
        title: 'Tu cápsula del tiempo',
        body: content.slice(0, 100),
        url: '/diario',
      })
      if (!result.ok && result.expired) {
        expiredEndpoints.push(sub.endpoint)
      }
    }
  }

  if (insightsToInsert.length > 0) {
    await supabase.from('aliis_insights').insert(insightsToInsert)
  }
  if (notificationsToInsert.length > 0) {
    await supabase.from('notifications').insert(notificationsToInsert)
  }
  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  return Response.json({ sent, skipped })
}
