import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY missing'); process.exit(1)
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY missing'); process.exit(1)
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))

// Raw body for Stripe webhooks — must come before express.json()
app.use('/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

import { packRouter } from './routes/pack'
import { stripeRouter } from './routes/stripe'
app.use('/pack', packRouter)
app.use('/stripe', stripeRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend Aliis :${PORT}`))
