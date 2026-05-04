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

  // --- Universe selection ---
  // Reminder universe: every user who has finished onboarding. Otherwise we
  // gated reminders behind "must already log symptoms", which is the exact
  // population that doesn't need the nudge — new users who hadn't logged
  // anything never received the prompt and stayed silent forever.
  // Insight universe: subset of the above who actually have logs to talk
  // about (no point generating an LLM insight from zero data).
  const { data: onboardedUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('onboarding_done', true)

  const reminderUserIds = (onboardedUsers ?? []).map(u => u.id as string)

  const { data: activeUsers } = await supabase
    .from('symptom_logs')
    .select('user_id')
    .gte('logged_at', since30)

  const insightEligibleSet = new Set((activeUsers ?? []).map(r => r.user_id as string))

  // Sharding: read from query string (?shard=N&total=M); defaults to no sharding.
  const url = new URL(req.url)
  const shard = parseInt(url.searchParams.get('shard') ?? '0', 10)
  const total = parseInt(url.searchParams.get('total') ?? '1', 10)
  const { filterShard } = await import('@/lib/cron-shard')
  const shardedReminderIds = filterShard(reminderUserIds, shard, total)

  if (shardedReminderIds.length === 0) {
    return Response.json({ sent: 0, skipped: 0, reminders: 0, shard, total })
  }

  // Two independent cadences:
  //  - insight: 1 per user every 7 days (LLM-backed, real spend, must dedupe)
  //  - reminder: 1 per user every 24h ("registra tus signos") — cheap, no LLM
  // We track them separately so a user can get a daily reminder without
  // burning a fresh insight generation each day.
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Insight processing only for users who have data to analyze.
  const shardedInsightIds = shardedReminderIds.filter(id => insightEligibleSet.has(id))

  // Insights already sent in the last 7 days (notifications + cache)
  const [insightNotifsRes, reminderNotifsRes, cachedInsightsRes] = await Promise.all([
    supabase
      .from('notifications')
      .select('user_id')
      .in('user_id', shardedInsightIds)
      .gte('created_at', since7d)
      .eq('type', 'insight'),
    supabase
      .from('notifications')
      .select('user_id')
      .in('user_id', shardedReminderIds)
      .gte('created_at', todayStart)
      .eq('type', 'reminder'),
    supabase
      .from('aliis_insights')
      .select('user_id, content')
      .in('user_id', shardedInsightIds)
      .gte('generated_at', since7d),
  ])

  const insightSentInWeek = new Set((insightNotifsRes.data ?? []).map(r => r.user_id))
  const reminderSentToday = new Set((reminderNotifsRes.data ?? []).map(r => r.user_id))
  const cacheByUser = new Map(
    (cachedInsightsRes.data ?? []).map(r => [r.user_id, r.content as string])
  )

  // Users that still need an insight generated (eligible + no notif this week + no cache)
  const toGenerate = shardedInsightIds.filter(
    id => !insightSentInWeek.has(id) && !cacheByUser.has(id)
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
    // Push subscriptions for ALL onboarded users in this shard (we need them
    // for both reminder pushes and insight pushes).
    supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth')
      .in('user_id', shardedReminderIds),
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
  let reminders = 0
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
  // Push payloads for the in-app notifications. Each payload knows whether
  // it's a reminder (cheap, broadcast to onboarded universe) or an insight
  // (LLM-backed, broadcast to active users only).
  const pushPayloads: Array<{
    endpoint: string
    p256dh: string
    auth: string
    title: string
    body: string
    url: string
  }> = []

  // ---- Phase 1: emit reminders (cheap, no LLM, daily cadence) ----
  // Reminders go out for every onboarded user who hasn't already received
  // one today. Crucial for user activation: a freshly registered user with
  // zero symptom logs still gets the daily nudge inviting them to log.
  const REMINDER_TITLE = '¿Cómo te sientes hoy?'
  const REMINDER_BODY = 'Registra tus signos del día para que Aliis pueda seguir tu evolución.'
  for (const userId of shardedReminderIds) {
    if (reminderSentToday.has(userId)) continue
    notificationsToInsert.push({
      user_id: userId,
      title: REMINDER_TITLE,
      body: REMINDER_BODY,
      type: 'reminder',
      url: '/diario?registrar=1',
    })
    const sub = subsByUser.get(userId)
    if (sub) {
      pushPayloads.push({
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        title: REMINDER_TITLE,
        body: REMINDER_BODY,
        url: '/diario?registrar=1',
      })
    }
    reminders++
  }

  // ---- Phase 2: generate insights with bounded concurrency (weekly cadence) ----
  // Each Anthropic call takes 1-3s. With concurrency 6, 200 generations finish
  // in ~30-90s, well under Vercel's 60s function timeout.
  const CONCURRENCY = 6
  const usersToProcess = shardedInsightIds.filter(id => !insightSentInWeek.has(id))
  skipped = shardedInsightIds.length - usersToProcess.length

  async function processUser(userId: string): Promise<void> {
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
        return
      }

      insightsToInsert.push({
        user_id: userId,
        content,
        data_window: { logs: logs.length, userName, recentDiagnosis },
      })
    }

    notificationsToInsert.push({
      user_id: userId,
      title: 'Aliis',
      body: content.slice(0, 500),
      type: 'insight',
      url: '/diario',
    })
    sent++

    const sub = subsByUser.get(userId)
    if (sub) {
      pushPayloads.push({
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        title: 'Aliis',
        body: content.slice(0, 120),
        url: '/diario',
      })
    }
  }

  // Pool runner — keeps CONCURRENCY workers active until queue drains.
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, usersToProcess.length) }, async () => {
      while (cursor < usersToProcess.length) {
        const idx = cursor++
        await processUser(usersToProcess[idx])
      }
    })
  )

  // ---- Phase 3: fan out push notifications in parallel ----
  // Web push is network-bound; allSettled lets us tolerate partial failures.
  // Each payload now carries its own title/body/url (reminders use the
  // "¿Cómo te sientes hoy?" prompt, insights use the LLM-generated text).
  const pushResults = await Promise.allSettled(
    pushPayloads.map(p =>
      sendPushNotification(
        { endpoint: p.endpoint, p256dh: p.p256dh, auth: p.auth },
        { title: p.title, body: p.body, url: p.url }
      )
    )
  )
  pushResults.forEach((r, i) => {
    if (r.status === 'fulfilled' && !r.value.ok && r.value.expired) {
      expiredEndpoints.push(pushPayloads[i].endpoint)
    }
  })

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

  return Response.json({
    insights: sent,
    reminders,
    skipped,
    universeSize: shardedReminderIds.length,
    insightUniverseSize: shardedInsightIds.length,
    shard,
    total,
  })
}
