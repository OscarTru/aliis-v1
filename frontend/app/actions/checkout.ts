'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(currency: string, cadence: 'monthly' | 'yearly') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const priceKey = `${currency.toLowerCase()}_${cadence}`
  redirect(`/checkout?plan=${priceKey}`)
}
