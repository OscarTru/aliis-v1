import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const PRICE_MAP: Record<string, string | undefined> = {
  'eur-monthly': process.env.STRIPE_PRICE_EUR_MONTHLY,
  'eur-yearly':  process.env.STRIPE_PRICE_EUR_YEARLY,
  'usd-monthly': process.env.STRIPE_PRICE_USD_MONTHLY,
  'usd-yearly':  process.env.STRIPE_PRICE_USD_YEARLY,
  'mxn-monthly': process.env.STRIPE_PRICE_MXN_MONTHLY,
  'mxn-yearly':  process.env.STRIPE_PRICE_MXN_YEARLY,
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { priceKey?: string } = {}
  try { body = await req.json() } catch { /* default */ }

  const priceKey = body.priceKey ?? 'mxn-monthly'
  const priceId = PRICE_MAP[priceKey]
  if (!priceId) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const origin = req.headers.get('origin') ?? 'https://aliis.app'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    metadata: { userId: user.id },
    success_url: `${origin}/cuenta?upgrade=success`,
    cancel_url: `${origin}/precios`,
  })

  return NextResponse.json({ url: session.url })
}
