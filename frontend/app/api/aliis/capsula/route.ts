import { generateText } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { models } from '@/lib/ai-providers'
import { sendPushNotification } from '@/lib/web-push'
import type { SymptomLog } from '@/lib/types'

export async function GET(req: Request) {
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const hasSecret = req.headers.get('x-cron-secret') === process.env.CRON_SECRET
  if (!isVercelCron && !hasSecret) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const since60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()

  // Active users: logged at least once in the last 30 days
  const { data: activeUsers } = await supabase
    .from('symptom_logs')
    .select('user_id')
    .gte('logged_at', since30)

  const userIds = [...new Set((activeUsers ?? []).map(r => r.user_id as string))]
  if (userIds.length === 0) return Response.json({ sent: 0, skipped: 0 })

  const { data: subsData } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  const subsByUser = new Map((subsData ?? []).map(s => [s.user_id as string, s]))

  let sent = 0
  let skipped = 0

  for (const userId of userIds) {
    // Skip if already sent a cápsula this month
    const { count } = await supabase
      .from('aliis_insights')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'capsula')
      .gte('generated_at', `${thisMonth}-01T00:00:00Z`)

    if ((count ?? 0) > 0) { skipped++; continue }

    const [profileRes, logsNowRes, logsThenRes, packRes] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', userId).single(),
      supabase.from('symptom_logs').select('*').eq('user_id', userId).gte('logged_at', since30).order('logged_at', { ascending: false }),
      supabase.from('symptom_logs').select('*').eq('user_id', userId).gte('logged_at', since60).lt('logged_at', since30).order('logged_at', { ascending: false }),
      supabase.from('packs').select('dx').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
    ])

    const userName = profileRes.data?.name ?? 'tú'
    const logsNow = (logsNowRes.data ?? []) as SymptomLog[]
    const logsThen = (logsThenRes.data ?? []) as SymptomLog[]

    // Need at least some data in both periods to make a meaningful comparison
    if (logsNow.length === 0 || logsThen.length === 0) { skipped++; continue }

    const avg = (vals: (number | null)[]): number | null => {
      const nums = vals.filter((v): v is number => v !== null)
      return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
    }

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

    const recentDx = packRes.data?.dx ?? null

    const systemPrompt = `Eres Aliis, el agente de salud personal. Una vez al mes generas una "cápsula del tiempo": un mensaje cálido que compara los signos vitales del último mes con el mes anterior.

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
        system: systemPrompt,
        prompt: userMessage,
        maxOutputTokens: 150,
      })
      content = text.trim()
    } catch {
      skipped++
      continue
    }

    await supabase.from('aliis_insights').insert({
      user_id: userId,
      content,
      type: 'capsula',
      data_window: { logsNow: logsNow.length, logsThen: logsThen.length, nowStats, thenStats },
    })

    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Tu cápsula del tiempo',
      body: content.slice(0, 200),
      type: 'capsula',
      url: '/diario',
    })

    const sub = subsByUser.get(userId)
    if (sub) {
      const result = await sendPushNotification(sub, {
        title: 'Tu cápsula del tiempo',
        body: content.slice(0, 100),
        url: '/diario',
      })
      if (!result.ok && result.expired) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }

    sent++
  }

  return Response.json({ sent, skipped })
}
