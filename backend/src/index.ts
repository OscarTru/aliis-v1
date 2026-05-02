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

// Raw body for Stripe webhooks — must come before express.json()
app.use('/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

import { packRouter } from './routes/pack'
import { stripeRouter } from './routes/stripe'
import { requireAuth } from './middleware/auth'

// Auth required for all /pack routes (individual routes also apply requireAuth as defense-in-depth)
app.use('/pack', requireAuth)
app.use('/pack', packRouter)
app.use('/stripe', stripeRouter)

// Sentry Express error handler must come AFTER all routes/middleware
Sentry.setupExpressErrorHandler(app)

// Generic error handler (after Sentry's)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[backend] error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend Aliis :${PORT}`))
