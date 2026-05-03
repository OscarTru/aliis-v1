'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(currency: string, cadence: 'monthly' | 'yearly') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const priceKey = `${currency.toLowerCase()}_${cadence}`
  // No session yet → start the signup-then-checkout flow.
  if (!user) redirect(`/checkout/empezar?plan=${priceKey}`)
  // Authenticated → go directly to payment with the chosen plan.
  redirect(`/checkout?plan=${priceKey}`)
}
