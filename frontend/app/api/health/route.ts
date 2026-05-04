import { createClient } from '@supabase/supabase-js'

// Lightweight health check for external uptime monitors (UptimeRobot,
// Pingdom, etc). Returns 200 + {"ok":true} when everything is reachable;
// 503 + {"ok":false, ...} when any dependency fails.
//
// Do not add auth here — uptime monitors must be able to hit it anonymously.
// Don't include sensitive details in the response either; only health flags.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Skip the middleware /api guard for this route by being public-by-design.
// (The middleware allowlist already excludes /api/health since it's listed
// alongside other public endpoints; if not, add it.)

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}

  // Supabase reachability — minimal SELECT against a table everyone has access to.
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    const { error } = await supabase.from('conditions').select('id').limit(1)
    checks.supabase = error ? 'error' : 'ok'
  } catch {
    checks.supabase = 'error'
  }

  // Required API keys present (we don't call external APIs in a health check
  // because that's expensive and can flap; just verify config is loaded).
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? 'ok' : 'error'
  checks.stripe = process.env.STRIPE_SECRET_KEY ? 'ok' : 'error'

  const allOk = Object.values(checks).every(v => v === 'ok')

  return new Response(
    JSON.stringify({ ok: allOk, checks, ts: new Date().toISOString() }),
    {
      status: allOk ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}
