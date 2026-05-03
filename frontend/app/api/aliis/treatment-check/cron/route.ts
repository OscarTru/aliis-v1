import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { models } from '@/lib/ai-providers'
import { verifyCronAuth } from '@/lib/cron-auth'
import { filterShard } from '@/lib/cron-shard'
import { logger } from '@/lib/logger'

// Called by Vercel Cron on the 1st of each month at 9am.
// Sharded the same way as /api/aliis/notify so we can process Pro cohorts in
// parallel and stay under Vercel's 60s function timeout.
export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const url = new URL(request.url)
  const shard = parseInt(url.searchParams.get('shard') ?? '0', 10)
  const total = parseInt(url.searchParams.get('total') ?? '1', 10)

  const { data: proUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('plan', 'pro')

  if (!proUsers?.length) return Response.json({ processed: 0, shard, total })

  const userIds = proUsers.map(u => u.id)
  const shardedIds = filterShard(userIds, shard, total)
  if (!shardedIds.length) return Response.json({ processed: 0, shard, total })

  let processed = 0
  let failed = 0

  async function processUser(userId: string): Promise<void> {
    try {
      const [medRes, treatRes, packsRes] = await Promise.all([
        supabase.from('medical_profiles').select('condiciones_previas').eq('user_id', userId).maybeSingle(),
        supabase.from('treatments').select('name, dose, frequency').eq('user_id', userId).eq('active', true),
        supabase.from('packs').select('dx').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      ])

      const condiciones: string[] = medRes.data?.condiciones_previas ?? []
      const tratamientos = treatRes.data ?? []
      const diagnosticos: string[] = packsRes.data?.map((p: { dx: string }) => p.dx) ?? []

      if (!condiciones.length && !diagnosticos.length && !tratamientos.length) return

      // 30s per-user timeout — Haiku with 600 tokens is fast (<5s); cap so a
      // hung call can't burn the whole pool slot.
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30_000)
      let text: string
      try {
        const result = await generateText({
          model: models.insight,
          maxOutputTokens: 600,
          system: `Eres Aliis, compañero de salud. Hablas de tú, con calidez. NUNCA diagnostiques ni recomiendes medicamentos.
Responde SOLO con JSON válido: { "items": [{ "mensaje": "...", "tipo": "dx_sin_tto|tto_sin_dx", "dx": "...", "tratamiento": "..." }] }
Máximo 3 items. Si no hay discordancias, items:[].`,
          prompt: `Diagnósticos: ${diagnosticos.join(' | ') || 'ninguno'}
Condiciones previas: ${condiciones.join(' | ') || 'ninguna'}
Tratamientos activos: ${tratamientos.map((t: { name: string; dose?: string; frequency?: string }) => `${t.name}${t.dose ? ' ' + t.dose : ''}${t.frequency === 'prn' ? ' (prn)' : ''}`).join(' | ') || 'ninguno'}`,
          abortSignal: controller.signal,
        })
        text = result.text
      } finally {
        clearTimeout(timeout)
      }

      const cleaned = text.trim().replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      const items = Array.isArray(parsed.items) ? parsed.items : []

      await supabase.from('aliis_insights').insert({
        user_id: userId,
        content: JSON.stringify({ items }),
        data_window: { type: 'treatment_check' },
      })

      processed++
    } catch (err) {
      // Don't swallow silently — at least surface in Sentry/logs so we know
      // when a cohort is consistently failing (e.g. malformed JSON from LLM).
      failed++
      logger.error({ err, userId }, '[treatment-check/cron] user failed')
    }
  }

  // Bounded concurrency — keeps Anthropic calls within rate limits and stays
  // under Vercel function timeout.
  const CONCURRENCY = 6
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, shardedIds.length) }, async () => {
      while (cursor < shardedIds.length) {
        const idx = cursor++
        await processUser(shardedIds[idx])
      }
    })
  )

  return Response.json({ processed, failed, shard, total })
}
