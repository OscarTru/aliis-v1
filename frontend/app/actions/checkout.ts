'use server'

import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_MAP: Record<string, string | undefined> = {
  eur_monthly: process.env.STRIPE_PRICE_EUR_MONTHLY,
  eur_yearly: process.env.STRIPE_PRICE_EUR_YEARLY,
  usd_monthly: process.env.STRIPE_PRICE_USD_MONTHLY,
  usd_yearly: process.env.STRIPE_PRICE_USD_YEARLY,
  mxn_monthly: process.env.STRIPE_PRICE_MXN_MONTHLY,
  mxn_yearly: process.env.STRIPE_PRICE_MXN_YEARLY,
}

export async function createCheckoutSession(currency: string, cadence: 'monthly' | 'yearly') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const priceId = PRICE_MAP[`${currency}_${cadence}`]
  if (!priceId) throw new Error('Invalid price configuration')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    metadata: { userId: user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/historial?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/precios`,
  })

  redirect(session.url!)
}
