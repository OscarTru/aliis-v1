import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: Date
}

/**
 * Fixed window rate limit. Returns {ok:false} if the caller exceeded `limit`
 * within the current `windowSec`-second bucket.
 *
 * key examples:
 *   `ip:${ip}:diagnostico`
 *   `user:${userId}:chat`
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(
    Math.floor(now.getTime() / (windowSec * 1000)) * windowSec * 1000
  )
  const resetAt = new Date(windowStart.getTime() + windowSec * 1000)

  const { data, error } = await admin.rpc('increment_rate_limit', {
    p_key: key,
    p_window_start: windowStart.toISOString(),
  })

  if (error) {
    // Fail open on storage errors — better than blocking real users
    console.error('[rate-limit] RPC error:', error)
    return { ok: true, remaining: limit, resetAt }
  }

  const count = data as number
  return { ok: count <= limit, remaining: Math.max(0, limit - count), resetAt }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
