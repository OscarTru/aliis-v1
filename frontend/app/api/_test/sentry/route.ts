import { NextResponse } from 'next/server'

// Smoke test for Sentry. Hit GET /api/_test/sentry?secret=<CRON_SECRET> to fire a test error.
// Should appear in the Sentry dashboard (project: aliis-frontend) within ~1 minute.
// Safe to keep deployed: gated behind CRON_SECRET.
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  throw new Error('Sentry frontend smoke test — if you see this in the dashboard, scrubbing works')
}
