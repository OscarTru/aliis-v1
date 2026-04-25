import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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
          await admin
            .from('profiles')
            .update({
              plan: 'pro',
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        await admin
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status
        const plan = status === 'active' || status === 'trialing' ? 'pro' : 'free'

        await admin
          .from('profiles')
          .update({ plan })
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
