'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Treatment, TreatmentInput } from '@/lib/types'

// Fire-and-forget: regenerate treatment check analysis for a pro user
async function triggerTreatmentCheck(userId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', userId).single()
    if (profile?.plan !== 'pro') return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    // Invalidate cache by deleting old treatment_check insights, then let next load regenerate
    await supabase
      .from('aliis_insights')
      .delete()
      .eq('user_id', userId)
      .contains('data_window', { type: 'treatment_check' })
  } catch {
    // Non-fatal
  }
}

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

export async function createTreatment(input: TreatmentInput): Promise<{ data?: Treatment; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { data, error } = await supabase.from('treatments').insert({
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
  }).select().single()
  revalidatePath('/cuenta')
  revalidatePath('/tratamientos')
  if (data && !error) triggerTreatmentCheck(user.id)
  return { data: data as Treatment | undefined, error: error?.message }
}

export async function updateTreatment(id: string, input: Partial<TreatmentInput>): Promise<{ data?: Treatment; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.dose !== undefined) patch.dose = input.dose?.trim() || null
  if (input.frequency !== undefined) patch.frequency = input.frequency
  if (input.frequency_label !== undefined) patch.frequency_label = input.frequency_label?.trim() || null
  if (input.indefinite !== undefined) {
    patch.indefinite = input.indefinite
    patch.ended_at = input.indefinite ? null : (input.ended_at || null)
  } else if (input.ended_at !== undefined) {
    patch.ended_at = input.ended_at || null
  }
  if (input.started_at !== undefined) patch.started_at = input.started_at || null
  if (input.last_changed_at !== undefined) patch.last_changed_at = input.last_changed_at || null
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null

  const { data, error } = await supabase
    .from('treatments')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  revalidatePath('/cuenta')
  revalidatePath('/tratamientos')
  if (data && !error) triggerTreatmentCheck(user.id)
  return { data: data ?? undefined, error: error?.message }
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
  revalidatePath('/cuenta')
  revalidatePath('/tratamientos')
  return { error: error?.message }
}
