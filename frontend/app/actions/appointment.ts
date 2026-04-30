'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function saveNextAppointment(date: string | null): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({ next_appointment: date ?? null })
    .eq('id', user.id)

  return error ? { error: error.message } : {}
}
