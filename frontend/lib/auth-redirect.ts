import { SupabaseClient } from '@supabase/supabase-js'

export async function getPostAuthRedirect(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', userId)
    .single()
  return profile?.onboarding_done ? '/historial' : '/onboarding'
}
