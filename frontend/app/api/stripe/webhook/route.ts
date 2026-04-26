import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'
import { paymentConfirmationEmail } from '@/lib/emails'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
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

          // Send payment confirmation email.
          // Note: checkout.session.completed can re-fire on Stripe retries — duplicate
          // emails are possible but acceptable at MVP scale.
          try {
            const email = session.customer_details?.email ?? null
            if (email) {
              const { data: profile } = await admin
                .from('profiles')
                .select('name')
                .eq('id', userId)
                .single()
              const name: string | null = profile?.name ?? null
              const { subject, html } = paymentConfirmationEmail(name)
              await sendEmail({ to: email, subject, html })
            }
          } catch (emailErr) {
            console.error('Payment confirmation email error:', emailErr)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await admin
          .from('profiles')
          .update({
            plan: 'free',
            trial_end: null,
            stripe_subscription_id: null,
            subscription_status: 'canceled',
          })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status
        const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free'
        const trialEnd = sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : null

        await admin
          .from('profiles')
          .update({
            plan,
            trial_end: trialEnd,
            subscription_status: status,
          })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }

      default:
        // Unhandled event type — ignore
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(`Database update failed: ${message}`, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
