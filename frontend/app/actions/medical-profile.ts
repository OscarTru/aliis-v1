'use server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MedicalProfile } from '@/lib/types'

type MedicalProfileInput = Partial<Omit<MedicalProfile, 'id' | 'user_id' | 'updated_at'>>

export async function saveMedicalProfile(data: MedicalProfileInput) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('medical_profiles')
    .upsert({
      user_id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)
}

export async function getMedicalProfile(): Promise<MedicalProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('medical_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data ?? null
}
