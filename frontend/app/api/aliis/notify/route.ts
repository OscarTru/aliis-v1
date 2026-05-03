import { createClient } from '@supabase/supabase-js'
import { anthropic, cachedSystem } from '@/lib/anthropic'
import { buildAliisPrompt } from '@/lib/aliis-prompt'
import { logLlmUsage } from '@/lib/llm-usage'
import { sendPushNotification } from '@/lib/web-push'
import { verifyCronAuth } from '@/lib/cron-auth'
import type { SymptomLog } from '@/lib/types'
import { HAIKU_4_5 } from '@/lib/ai-models'

export async function GET(req: Request) {
  const authError = verifyCronAuth(req)
  if (authError) return authError

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const todayStart = `${today}T00:00:00Z`

  // --- Appointment reminders (separate flow) ---
  const { data: appointmentUsers } = await supabase
    .from('profiles')
    .select('id, name, next_appointment')
    .eq('next_appointment', tomorrow)

  if (appointmentUsers && appointmentUsers.length > 0) {
    await supabase.from('notifications').insert(
      appointmentUsers.map(u => ({
        user_id: u.id,
        title: 'Tu consulta es mañana',
        body: 'Recuerda llevar tu resumen pre-consulta de Aliis.',
        type: 'reminder',
        url: '/historial',
      }))
    )
    await supabase
      .from('profiles')
      .update({ next_appointment: null })
      .in('id', appointmentUsers.map(u => u.id))
  }

  // --- Insight + diary reminder flow ---
  const { data: activeUsers } = await supabase
    .from('symptom_logs')
    .select('user_id')
    .gte('logged_at', since30)

  const userIds = [...new Set((activeUsers ?? []).map(r => r.user_id))]

  // Sharding: read from query string (?shard=N&total=M); defaults to no sharding.
  const url = new URL(req.url)
  const shard = parseInt(url.searchParams.get('shard') ?? '0', 10)
  const total = parseInt(url.searchParams.get('total') ?? '1', 10)
  const { filterShard } = await import('@/lib/cron-shard')
  const shardedUserIds = filterShard(userIds, shard, total)

  if (shardedUserIds.length === 0) return Response.json({ sent: 0, skipped: 0, shard, total })

  // Batched: who already received an insight notification today?
  const { data: existingNotifs } = await supabase
    .from('notifications')
    .select('user_id')
    .in('user_id', shardedUserIds)
    .gte('created_at', todayStart)
    .eq('type', 'insight')
  const alreadyNotified = new Set((existingNotifs ?? []).map(r => r.user_id))

  // Batched: cached insights for today
  const { data: cachedInsights } = await supabase
    .from('aliis_insights')
    .select('user_id, content')
    .in('user_id', shardedUserIds)
    .gte('generated_at', todayStart)
  const cacheByUser = new Map(
    (cachedInsights ?? []).map(r => [r.user_id, r.content as string])
  )

  // Users that still need an insight generated
  const toGenerate = shardedUserIds.filter(
    id => !alreadyNotified.has(id) && !cacheByUser.has(id)
  )

  // Batched: profiles, symptom_logs, packs for users needing generation
  const [profilesRes, logsRes, packsRes, subsRes] = await Promise.all([
    supabase.from('profiles').select('id, name').in('id', toGenerate),
    supabase
      .from('symptom_logs')
      .select('user_id, logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, temperature, weight')
      .in('user_id', toGenerate)
      .gte('logged_at', since30)
      .order('logged_at', { ascending: false }),
    supabase
      .from('packs')
      .select('user_id, dx, created_at')
      .in('user_id', toGenerate)
      .order('created_at', { ascending: false }),
    supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth')
      .in('user_id', shardedUserIds),
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
  const subsByUser = new Map((subsRes.data ?? []).map(s => [s.user_id, s]))

  let sent = 0
  let skipped = 0

  // Accumulators for batched writes
  const insightsToInsert: Array<{ user_id: string; content: string; data_window: object }> = []
  const notificationsToInsert: Array<{
    user_id: string
    title: string
    body: string
    type: string
    url: string
  }> = []
  const expiredEndpoints: string[] = []

  for (const userId of shardedUserIds) {
    if (alreadyNotified.has(userId)) { skipped++; continue }

    let content = cacheByUser.get(userId) ?? null

    if (!content) {
      const userName = profileByUser.get(userId) ?? 'tú'
      const logs = logsByUser.get(userId) ?? []
      const recentDiagnosis = recentDxByUser.get(userId) ?? null

      const { system, userMessage } = buildAliisPrompt({ userName, recentDiagnosis, logs })
      try {
        const message = await anthropic.messages.create({
          model: HAIKU_4_5,
          max_tokens: 150,
          system: cachedSystem(system),
          messages: [{ role: 'user', content: userMessage }],
        })
        await logLlmUsage({
          userId,
          endpoint: 'aliis_notify_cron',
          model: HAIKU_4_5,
          usage: message.usage,
        })
        content = (message.content[0] as { type: string; text: string }).text.trim()
      } catch {
        skipped++
        continue
      }

      insightsToInsert.push({
        user_id: userId,
        content,
        data_window: { logs: logs.length, userName, recentDiagnosis },
      })
    }

    notificationsToInsert.push(
      {
        user_id: userId,
        title: 'Aliis',
        body: content.slice(0, 500),
        type: 'insight',
        url: '/diario',
      },
      {
        user_id: userId,
        title: '¿Cómo te sientes hoy?',
        body: 'Registra tus signos del día para que Aliis pueda seguir tu evolución.',
        type: 'reminder',
        url: '/diario?registrar=1',
      }
    )

    sent++

    const sub = subsByUser.get(userId)
    if (sub) {
      const result = await sendPushNotification(sub, {
        title: 'Aliis',
        body: content.slice(0, 120),
        url: '/diario',
      })
      if (!result.ok && result.expired) {
        expiredEndpoints.push(sub.endpoint)
      }
    }
  }

  // Single round trip per write category
  if (insightsToInsert.length > 0) {
    await supabase.from('aliis_insights').insert(insightsToInsert)
  }
  if (notificationsToInsert.length > 0) {
    await supabase.from('notifications').insert(notificationsToInsert)
  }
  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  return Response.json({ sent, skipped, shard, total })
}
