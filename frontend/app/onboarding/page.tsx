import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not authenticated → landing
  if (!user) redirect('/')

  // Already completed onboarding → skip straight to the app
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_done) redirect('/ingreso')

  return <OnboardingClient />
}
