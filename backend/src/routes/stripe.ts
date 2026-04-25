import { Router } from 'express'
import StripeDefault from 'stripe'
import type { Stripe } from 'stripe/cjs/stripe.core.js'
import { supabase } from '../index'

export const stripeRouter = Router()

const stripe = new StripeDefault(process.env.STRIPE_SECRET_KEY!)

stripeRouter.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    res.status(400).send('Webhook signature verification failed')
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string | null
    const userId = session.metadata?.userId
    if (userId && customerId) {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'pro', stripe_customer_id: customerId })
        .eq('id', userId)
      if (error) { console.error('Supabase update failed (checkout):', error); res.status(500).send('Internal error'); return }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('stripe_customer_id', sub.customer as string)
    if (error) { console.error('Supabase update failed (sub deleted):', error); res.status(500).send('Internal error'); return }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const plan =
      sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free'
    const { error } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('stripe_customer_id', sub.customer as string)
    if (error) { console.error('Supabase update failed (sub updated):', error); res.status(500).send('Internal error'); return }
  }

  res.json({ received: true })
})
