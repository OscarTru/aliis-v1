import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

const PRICE_MAP: Record<string, string | undefined> = {
  eur_monthly: process.env.STRIPE_PRICE_EUR_MONTHLY,
  eur_yearly:  process.env.STRIPE_PRICE_EUR_YEARLY,
  usd_monthly: process.env.STRIPE_PRICE_USD_MONTHLY,
  usd_yearly:  process.env.STRIPE_PRICE_USD_YEARLY,
  mxn_monthly: process.env.STRIPE_PRICE_MXN_MONTHLY,
  mxn_yearly:  process.env.STRIPE_PRICE_MXN_YEARLY,
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { paymentMethodId?: string; priceKey?: string } = {}
  try { body = await req.json() } catch { /* default */ }

  const { paymentMethodId, priceKey } = body
  if (!paymentMethodId || !priceKey) {
    return NextResponse.json({ error: 'paymentMethodId y priceKey son requeridos' }, { status: 400 })
  }

  const priceId = PRICE_MAP[priceKey]
  if (!priceId) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const customerId = profile?.stripe_customer_id as string | undefined
  if (!customerId) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 })

  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Create subscription with 14-day trial
    await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 14,
      default_payment_method: paymentMethodId,
      metadata: { userId: user.id },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la suscripción'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
