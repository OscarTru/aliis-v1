import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildAliisPrompt } from '@/lib/aliis-prompt'
import type { SymptomLog } from '@/lib/types'

export async function GET() {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  // 1. Check cache — 1 insight per user per day
  const today = new Date().toISOString().slice(0, 10)
  const { data: cached } = await supabase
    .from('aliis_insights')
    .select('content, generated_at')
    .eq('user_id', user.id)
    .gte('generated_at', `${today}T00:00:00Z`)
    .lt('generated_at', `${today}T23:59:59Z`)
    .single()

  if (cached) {
    return Response.json({ content: cached.content, cached: true })
  }

  // 2. Fetch data
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [profileRes, logsRes, packRes] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).single(),
    supabase.from('symptom_logs').select('*').eq('user_id', user.id).gte('logged_at', since30).order('logged_at', { ascending: false }),
    supabase.from('packs').select('dx').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
  ])

  const userName = profileRes.data?.name ?? 'tú'
  const logs = (logsRes.data ?? []) as SymptomLog[]
  const recentDiagnosis = packRes.data?.dx ?? null

  // 3. Build prompt and call Claude Haiku
  const { system, userMessage } = buildAliisPrompt({ userName, recentDiagnosis, logs })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = (message.content[0] as { type: string; text: string }).text.trim()

  // 4. Save to cache
  await supabase.from('aliis_insights').insert({
    user_id: user.id,
    content,
    data_window: { logs: logs.length, userName, recentDiagnosis },
  })

  return Response.json({ content, cached: false })
}
