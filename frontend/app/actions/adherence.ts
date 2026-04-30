'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function toggleAdherence(
  medication: string,
  takenDate: string,
  taken: boolean
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (taken) {
    const { error } = await supabase.from('adherence_logs').upsert(
      { user_id: user.id, medication, taken_date: takenDate },
      { onConflict: 'user_id,medication,taken_date' }
    )
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('adherence_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('medication', medication)
      .eq('taken_date', takenDate)
    if (error) return { error: error.message }
  }

  return {}
}
