'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Treatment, TreatmentInput } from '@/lib/types'

export async function getTreatments(): Promise<Treatment[]> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('treatments')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: true })
  return (data ?? []) as Treatment[]
}

export async function createTreatment(input: TreatmentInput): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { error } = await supabase.from('treatments').insert({
    user_id: user.id,
    name: input.name.trim(),
    dose: input.dose?.trim() || null,
    frequency: input.frequency,
    frequency_label: input.frequency_label?.trim() || null,
    indefinite: input.indefinite,
    started_at: input.started_at || null,
    ended_at: input.indefinite ? null : (input.ended_at || null),
    last_changed_at: input.last_changed_at || null,
    notes: input.notes?.trim() || null,
  })
  return { error: error?.message }
}

export async function updateTreatment(id: string, input: Partial<TreatmentInput>): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { error } = await supabase
    .from('treatments')
    .update({
      ...input,
      dose: input.dose?.trim() || null,
      frequency_label: input.frequency_label?.trim() || null,
      ended_at: input.indefinite ? null : (input.ended_at || null),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
  return { error: error?.message }
}

export async function deleteTreatment(id: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { error } = await supabase
    .from('treatments')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
  return { error: error?.message }
}
