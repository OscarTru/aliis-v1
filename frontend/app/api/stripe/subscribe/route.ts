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

  let body: { paymentMethodId?: string; priceKey?: string; promotionCodeId?: string } = {}
  try { body = await req.json() } catch { /* default */ }

  const { paymentMethodId, priceKey, promotionCodeId } = body
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

  // Atomic lock: claim the "currently subscribing" slot in profiles before
  // calling Stripe. Sets stripe_subscription_id to a sentinel that only
  // succeeds if it was NULL (i.e. no other concurrent request claimed it).
  // This prevents double-subscribe on rapid double-click — the previous
  // idempotency key alone could be bypassed if priceKey changed between clicks.
  const claimSentinel = `pending_${user.id}_${Date.now()}`
  const { data: claimed, error: claimErr } = await supabase
    .from('profiles')
    .update({ stripe_subscription_id: claimSentinel })
    .eq('id', user.id)
    .is('stripe_subscription_id', null)
    .select('id')
    .maybeSingle()

  if (claimErr) {
    console.error('[stripe/subscribe] claim error', claimErr)
    return NextResponse.json({ error: 'Error preparando la suscripción' }, { status: 500 })
  }
  if (!claimed) {
    // Another request already grabbed the slot (or webhook beat us to it).
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
        ...(promotionCodeId ? { promotion_code: promotionCodeId } : {}),
        metadata: { userId: user.id },
      },
      { idempotencyKey: `sub_${user.id}_${priceKey}` }
    )

    // Replace the sentinel with the real subscription id + plan upgrade.
    // Note: the customer.subscription.created webhook will also try to set
    // these fields. Both updates are idempotent and converge to the same row.
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
    // Release the lock so the user can retry without being stuck on 409.
    await supabase
      .from('profiles')
      .update({ stripe_subscription_id: null })
      .eq('id', user.id)
      .eq('stripe_subscription_id', claimSentinel)
    return NextResponse.json({ error: 'Error al crear la suscripción' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
