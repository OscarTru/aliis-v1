import './instrument'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import * as Sentry from '@sentry/node'
import { createClient } from '@supabase/supabase-js'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY missing'); process.exit(1)
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing'); process.exit(1)
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ALLOWED_ORIGINS = [
  'https://aliis.app',
  'https://www.aliis.app',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
]

const app = express()
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true)
    else cb(new Error(`CORS: ${origin} not allowed`))
  },
}))

app.use(express.json())

app.get('/health', async (_req, res) => {
  const checks: Record<string, 'ok' | 'error'> = {}

  // Verify Supabase connectivity with a minimal query
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    checks.supabase = error ? 'error' : 'ok'
  } catch {
    checks.supabase = 'error'
  }

  // Verify Anthropic key is present (actual API call is too expensive for a health check)
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? 'ok' : 'error'

  const allOk = Object.values(checks).every(v => v === 'ok')
  res.status(allOk ? 200 : 503).json({ ok: allOk, checks, ts: new Date().toISOString() })
})

import { packRouter } from './routes/pack'
import { requireAuth } from './middleware/auth'

// Auth required for all /pack routes (individual routes also apply requireAuth as defense-in-depth)
app.use('/pack', requireAuth)
app.use('/pack', packRouter)

// Stripe webhook lives at frontend/app/api/stripe/webhook (Next.js).
// That endpoint has idempotency (email_sends UNIQUE), trial_end handling,
// and welcome email — features missing here. The Stripe dashboard MUST point
// only to https://aliis.app/api/stripe/webhook, never to this backend.

// Sentry Express error handler must come AFTER all routes/middleware
Sentry.setupExpressErrorHandler(app)

// Generic error handler (after Sentry's)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[backend] error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend Aliis :${PORT}`))
