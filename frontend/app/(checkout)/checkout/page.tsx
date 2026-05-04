import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CheckoutForm } from './CheckoutForm'

const VALID_PRICE_KEYS = [
  'eur_monthly', 'eur_yearly',
  'usd_monthly', 'usd_yearly',
  'mxn_monthly', 'mxn_yearly',
]

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { plan } = await searchParams
  const priceKey = VALID_PRICE_KEYS.includes(plan ?? '') ? plan! : 'mxn_monthly'

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="font-sans text-[14px] text-muted-foreground text-center">
          Error de configuración. Por favor contacta soporte.
        </p>
      </div>
    )
  }

  return (
    <CheckoutForm
      initialPriceKey={priceKey}
      publishableKey={publishableKey}
    />
  )
}
