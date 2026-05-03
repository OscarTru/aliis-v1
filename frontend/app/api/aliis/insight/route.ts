import { anthropic, cachedSystem } from '@/lib/anthropic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildAliisPrompt } from '@/lib/aliis-prompt'
import { logLlmUsage } from '@/lib/llm-usage'
import { rateLimit } from '@/lib/rate-limit'
import type { SymptomLog } from '@/lib/types'
import { HAIKU_4_5 } from '@/lib/ai-models'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  // 1. Check cache FIRST. Cached reads are free (no Anthropic call) so they
  // shouldn't count against the rate limit. Otherwise just navigating the
  // app and re-mounting the diary page burns through the quota in minutes.
  const today = new Date().toISOString().slice(0, 10)
  const { data: cached } = await supabase
    .from('aliis_insights')
    .select('content, generated_at')
    .eq('user_id', user.id)
    .gte('generated_at', `${today}T00:00:00Z`)
    .lt('generated_at', `${today}T23:59:59Z`)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cached) {
    return Response.json({ content: cached.content, cached: true })
  }

  // 2. Cache miss — only now is it worth a rate-limit slot. Limit applies to
  // actual generation (Anthropic spend + DB write). Bumped to 10/hour for
  // headroom; the daily cache effectively caps it at 1 generation/day anyway.
  const rl = await rateLimit(`user:${user.id}:insight`, 10, 3600)
  if (!rl.ok) {
    return Response.json(
      { error: 'Demasiadas solicitudes — intenta más tarde' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } }
    )
  }

  // 2. Fetch data — maybeSingle on profile and pack so users with no pack yet
  // don't crash the endpoint. limit(500) on symptom_logs for safety.
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [profileRes, logsRes, packRes] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
    supabase
      .from('symptom_logs')
      .select('logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, temperature, weight')
      .eq('user_id', user.id)
      .gte('logged_at', since30)
      .order('logged_at', { ascending: false })
      .limit(500),
    supabase.from('packs').select('dx').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const userName = profileRes.data?.name ?? 'tú'
  const logs = (logsRes.data ?? []) as SymptomLog[]
  const recentDiagnosis = packRes.data?.dx ?? null

  // 3. Build prompt and call Claude Haiku
  const { system, userMessage } = buildAliisPrompt({ userName, recentDiagnosis, logs })

  try {
    const message = await anthropic.messages.create({
      model: HAIKU_4_5,
      max_tokens: 150,
      system: cachedSystem(system),
      messages: [{ role: 'user', content: userMessage }],
    })

    await logLlmUsage({
      userId: user.id,
      endpoint: 'aliis_insight',
      model: HAIKU_4_5,
      usage: message.usage,
    })

    const firstBlock = message.content[0]
    const content =
      firstBlock && firstBlock.type === 'text' ? firstBlock.text.trim() : ''
    if (!content) {
      return Response.json({ error: 'Sin contenido' }, { status: 502 })
    }

    // 4. Save to cache
    await supabase.from('aliis_insights').insert({
      user_id: user.id,
      content,
      data_window: { logs: logs.length, userName, recentDiagnosis },
    })

    return Response.json({ content, cached: false })
  } catch (err) {
    console.error('[aliis/insight] generation failed:', err)
    return Response.json({ error: 'No se pudo generar el insight' }, { status: 502 })
  }
}
