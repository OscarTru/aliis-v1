import { createServerSupabaseClient } from '@/lib/supabase-server'
import LandingClient from './LandingClient'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initialInitial = user?.email ? user.email[0].toUpperCase() : null

  return <LandingClient initialInitial={initialInitial} />
}
