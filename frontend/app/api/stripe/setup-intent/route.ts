import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id as string | undefined

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email })
    customerId = customer.id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
    if (updateError) console.error('Failed to persist stripe_customer_id:', updateError)
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: 'off_session',
  })

  if (!setupIntent.client_secret) {
    return NextResponse.json({ error: 'No se pudo crear el SetupIntent' }, { status: 500 })
  }
  return NextResponse.json({ clientSecret: setupIntent.client_secret })
}
