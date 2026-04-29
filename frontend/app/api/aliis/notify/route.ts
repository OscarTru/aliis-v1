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
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .limit(100)

  if (!subs || subs.length === 0) return Response.json({ sent: 0, skipped: 0 })

  let sent = 0
  let skipped = 0

  for (const sub of subs) {
    const { data: cached } = await supabase
      .from('aliis_insights')
      .select('content')
      .eq('user_id', sub.user_id)
      .gte('generated_at', `${today}T00:00:00Z`)
      .maybeSingle()

    let content: string

    if (cached) {
      content = cached.content
    } else {
      const [profileRes, logsRes, packRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', sub.user_id).single(),
        supabase.from('symptom_logs').select('*').eq('user_id', sub.user_id).gte('logged_at', since30).order('logged_at', { ascending: false }),
        supabase.from('packs').select('dx').eq('user_id', sub.user_id).order('created_at', { ascending: false }).limit(1).single(),
      ])

      const userName = profileRes.data?.name ?? 'tú'
      const logs = (logsRes.data ?? []) as SymptomLog[]
      const recentDiagnosis = packRes.data?.dx ?? null

      const { system, userMessage } = buildAliisPrompt({ userName, recentDiagnosis, logs })
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        system,
        messages: [{ role: 'user', content: userMessage }],
      })
      content = (message.content[0] as { type: string; text: string }).text.trim()

      await supabase.from('aliis_insights').insert({
        user_id: sub.user_id,
        content,
        data_window: { logs: logs.length, userName, recentDiagnosis },
      })
    }

    const result = await sendPushNotification(sub, {
      title: 'Aliis',
      body: content.slice(0, 80) + (content.length > 80 ? '…' : ''),
      url: '/diario',
    })

    if (result.ok) {
      sent++
      await supabase.from('notifications').insert({
        user_id: sub.user_id,
        title: 'Aliis',
        body: content.slice(0, 500),
        type: 'reminder',
        url: '/diario',
      })
    } else {
      skipped++
      if (result.expired) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }

  return Response.json({ sent, skipped })
}
