import { timingSafeEqual } from 'node:crypto'

/**
 * Validates a cron request. Accepts:
 *   - `Authorization: Bearer ${CRON_SECRET}` (Vercel cron sends this automatically
 *     when CRON_SECRET is set as a project env var)
 *   - `x-cron-secret: ${CRON_SECRET}` (manual triggers from CI / curl)
 *
 * Uses timingSafeEqual to prevent secret enumeration via response timing.
 *
 * Returns null if valid, or a 401/503 Response if not.
 */
export function verifyCronAuth(req: Request): Response | null {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    // Fail closed if env var missing
    return new Response(JSON.stringify({ error: 'Cron not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const auth = req.headers.get('authorization')
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  const headerSecret = req.headers.get('x-cron-secret')
  const provided = bearer ?? headerSecret

  if (!provided) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // timingSafeEqual requires equal-length buffers
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return null
}
