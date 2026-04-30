import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CuentaClient } from './CuentaClient'
import { getMedicalProfile } from '@/app/actions/medical-profile'

export default async function CuentaPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: p } = await supabase
    .from('profiles')
    .select('name,last_name,birth_date,location,who,plan,trial_end,subscription_status,stripe_customer_id')
    .eq('id', user.id)
    .single()

  const providers = user.identities?.map(i => i.provider) ?? []
  const isGoogleUser = providers.includes('google') && !providers.includes('email')
  const googleName = user.user_metadata?.full_name ?? ''

  const medicalProfile = p?.plan === 'pro' ? await getMedicalProfile() : null

  return (
    <CuentaClient
      userId={user.id}
      isGoogleUser={isGoogleUser}
      googleName={googleName}
      initialMedicalProfile={medicalProfile}
      initialProfile={{
        name: p?.name ?? null,
        last_name: p?.last_name ?? null,
        birth_date: p?.birth_date ?? null,
        location: p?.location ?? null,
        who: p?.who ?? null,
        plan: p?.plan ?? 'free',
        email: user.email ?? null,
        trial_end: p?.trial_end ?? null,
        subscription_status: p?.subscription_status ?? null,
        stripe_customer_id: p?.stripe_customer_id ?? null,
      }}
    />
  )
}
