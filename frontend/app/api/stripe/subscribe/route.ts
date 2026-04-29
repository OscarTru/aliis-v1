import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const PRICE_MAP: Record<string, string | undefined> = {
  eur_monthly: process.env.STRIPE_PRICE_EUR_MONTHLY,
  eur_yearly:  process.env.STRIPE_PRICE_EUR_YEARLY,
  usd_monthly: process.env.STRIPE_PRICE_USD_MONTHLY,
  usd_yearly:  process.env.STRIPE_PRICE_USD_YEARLY,
  mxn_monthly: process.env.STRIPE_PRICE_MXN_MONTHLY,
  mxn_yearly:  process.env.STRIPE_PRICE_MXN_YEARLY,
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
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
    .select('stripe_customer_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  const customerId = profile?.stripe_customer_id as string | undefined
  if (!customerId) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 })

  const existingSubId = profile?.stripe_subscription_id as string | undefined
  if (existingSubId) {
    return NextResponse.json({ error: 'Ya tienes una suscripción activa.' }, { status: 409 })
  }

  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Create subscription with 14-day trial
    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: 14,
        default_payment_method: paymentMethodId,
        metadata: { userId: user.id },
      },
      { idempotencyKey: `sub_${user.id}_${priceKey}` }
    )

    await supabase.from('profiles').update({
      plan: 'pro',
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    }).eq('id', user.id)
  } catch (err) {
    console.error('[stripe/subscribe]', err)
    return NextResponse.json({ error: 'Error al crear la suscripción' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
