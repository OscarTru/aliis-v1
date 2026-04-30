import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { buildAliisPrompt } from '@/lib/aliis-prompt'
import { sendPushNotification } from '@/lib/web-push'
import type { SymptomLog } from '@/lib/types'

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const hasSecret = req.headers.get('x-cron-secret') === process.env.CRON_SECRET
  if (!isVercelCron && !hasSecret) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Appointment reminders: notify users whose next_appointment is tomorrow
  const { data: appointmentUsers } = await supabase
    .from('profiles')
    .select('id, name, next_appointment')
    .eq('next_appointment', tomorrow)

  for (const u of appointmentUsers ?? []) {
    await supabase.from('notifications').insert({
      user_id: u.id,
      title: 'Tu consulta es mañana',
      body: 'Recuerda llevar tu resumen pre-consulta de Aliis.',
      type: 'reminder',
      url: '/historial',
    })
    // Clear appointment so it doesn't trigger again
    await supabase.from('profiles').update({ next_appointment: null }).eq('id', u.id)
  }

  // Get all active users (logged in the last 30 days)
  const { data: activeUsers } = await supabase
    .from('symptom_logs')
    .select('user_id')
    .gte('logged_at', since30)

  const userIds = [...new Set((activeUsers ?? []).map(r => r.user_id))]
  if (userIds.length === 0) return Response.json({ sent: 0, skipped: 0 })

  // Get push subscriptions indexed by user_id
  const { data: subsData } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  const subsByUser = new Map((subsData ?? []).map(s => [s.user_id, s]))

  let sent = 0
  let skipped = 0

  for (const userId of userIds) {
    // Skip if already notified today
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`)
      .eq('type', 'reminder')

    if ((count ?? 0) > 0) { skipped++; continue }

    // Reuse today's insight if already generated
    const { data: cached } = await supabase
      .from('aliis_insights')
      .select('content')
      .eq('user_id', userId)
      .gte('generated_at', `${today}T00:00:00Z`)
      .maybeSingle()

    let content: string

    if (cached) {
      content = cached.content
    } else {
      const [profileRes, logsRes, packRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', userId).single(),
        supabase.from('symptom_logs').select('*').eq('user_id', userId).gte('logged_at', since30).order('logged_at', { ascending: false }),
        supabase.from('packs').select('dx').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
      ])

      const userName = profileRes.data?.name ?? 'tú'
      const logs = (logsRes.data ?? []) as SymptomLog[]
      const recentDiagnosis = packRes.data?.dx ?? null

      const { system, userMessage } = buildAliisPrompt({ userName, recentDiagnosis, logs })
      try {
        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          system,
          messages: [{ role: 'user', content: userMessage }],
        })
        content = (message.content[0] as { type: string; text: string }).text.trim()
      } catch {
        skipped++
        continue
      }

      await supabase.from('aliis_insights').insert({
        user_id: userId,
        content,
        data_window: { logs: logs.length, userName, recentDiagnosis },
      })
    }

    // In-app notification: insight goes to /diario, no modal
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Aliis',
      body: content.slice(0, 500),
      type: 'insight',
      url: '/diario',
    })

    // Separate daily reminder notification to open the log modal
    await supabase.from('notifications').insert({
      user_id: userId,
      title: '¿Cómo te sientes hoy?',
      body: 'Registra tus signos del día para que Aliis pueda seguir tu evolución.',
      type: 'reminder',
      url: '/diario?registrar=1',
    })
    sent++

    // Also send push if user has a subscription (push for the reminder)
    const sub = subsByUser.get(userId)
    if (sub) {
      const result = await sendPushNotification(sub, {
        title: '¿Cómo te sientes hoy?',
        body: 'Registra tus signos del día.',
        url: '/diario?registrar=1',
      })
      if (!result.ok && result.expired) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }

  return Response.json({ sent, skipped })
}
