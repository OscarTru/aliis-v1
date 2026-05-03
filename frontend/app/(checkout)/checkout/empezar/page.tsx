import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CheckoutSignupForm } from './CheckoutSignupForm'

const VALID_PRICE_KEYS = [
  'eur_monthly', 'eur_yearly',
  'usd_monthly', 'usd_yearly',
  'mxn_monthly', 'mxn_yearly',
]

export default async function CheckoutEmpezarPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { plan } = await searchParams
  const priceKey = VALID_PRICE_KEYS.includes(plan ?? '') ? plan! : 'eur_monthly'

  // If user is already logged in (and verified), skip signup and go straight
  // to payment with the chosen plan.
  if (user) {
    redirect(`/checkout?plan=${priceKey}`)
  }

  return <CheckoutSignupForm priceKey={priceKey} />
}
