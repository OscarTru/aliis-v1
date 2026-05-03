import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'
import { paymentConfirmationEmail } from '@/lib/emails'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 })
  }

  const admin = getAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId) {
          const subscriptionId = session.subscription as string | null
          let trialEnd: string | null = null
          let subscriptionStatus: string | null = null
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            subscriptionStatus = sub.status
            if (sub.trial_end) {
              trialEnd = new Date(sub.trial_end * 1000).toISOString()
            }
          }

          await admin
            .from('profiles')
            .update({
              plan: 'pro',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              subscription_status: subscriptionStatus,
              trial_end: trialEnd,
            })
            .eq('id', userId)

          // Send payment confirmation email — idempotent against Stripe retries.
          try {
            const email = session.customer_details?.email ?? null
            if (email) {
              const { error: insertErr } = await admin
                .from('email_sends')
                .insert({
                  event_source: 'stripe',
                  event_id: event.id,
                  kind: 'payment_confirmation',
                })

              if (insertErr && insertErr.code === '23505') {
                // UNIQUE conflict — this event was already processed, skip silently
              } else if (insertErr) {
                logger.error({ err: insertErr, eventId: event.id }, 'email_sends insert failed')
              } else {
                const { data: profile } = await admin
                  .from('profiles')
                  .select('name')
                  .eq('id', userId)
                  .single()
                const name: string | null = profile?.name ?? null
                const { subject, html } = paymentConfirmationEmail(name)
                await sendEmail({ to: email, subject, html })
              }
            }
          } catch (emailErr) {
            logger.error({ err: emailErr, kind: 'payment_confirmation' }, 'Payment confirmation email failed')
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        if (!customerId) {
          console.warn('[stripe webhook] subscription.deleted with null customer — skipping')
          break
        }
        await admin
          .from('profiles')
          .update({
            plan: 'free',
            trial_end: null,
            stripe_subscription_id: null,
            subscription_status: 'canceled',
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (userId) {
          const status = sub.status
          const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free'
          const trialEnd = sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null
          await admin
            .from('profiles')
            .update({
              plan,
              stripe_subscription_id: sub.id,
              subscription_status: status,
              trial_end: trialEnd,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        if (!customerId) {
          console.warn('[stripe webhook] subscription.updated with null customer — skipping')
          break
        }
        const status = sub.status
        const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free'
        const trialEnd = sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : null

        await admin
          .from('profiles')
          .update({
            plan,
            stripe_subscription_id: sub.id,
            trial_end: trialEnd,
            subscription_status: status,
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'invoice.payment_failed': {
        // A scheduled charge failed (expired card, insufficient funds, 3DS).
        // Stripe will retry on its smart retry schedule; meanwhile, mirror the
        // subscription status to the profile so we don't keep a Pro on the app
        // while their billing is broken.
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (!customerId) break

        let subscriptionStatus: string | null = null
        const subRef = invoice.subscription
        const subId = typeof subRef === 'string' ? subRef : subRef?.id ?? null
        if (subId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId)
            subscriptionStatus = sub.status
          } catch (err) {
            logger.error({ err, subId }, '[stripe webhook] failed to retrieve subscription on payment_failed')
          }
        }

        // Don't downgrade unilaterally — `subscription.updated` will handle that
        // when Stripe transitions to past_due/unpaid/canceled. We just record
        // the status for visibility in the user's account page.
        await admin
          .from('profiles')
          .update({ subscription_status: subscriptionStatus ?? 'past_due' })
          .eq('stripe_customer_id', customerId)
        break
      }

      default:
        // Unhandled event type — ignore
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isDev = process.env.NODE_ENV === 'development'
    return Response.json(
      { error: 'Webhook error', ...(isDev && { detail: message }) },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
