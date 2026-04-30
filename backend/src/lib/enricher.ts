import { supabase } from '../index'

export interface EnrichedContext {
  para: 'yo' | 'familiar' | 'acompanando'
  emocion?: string
  dudas?: string
  nombre: string | null
  previousDx: string[]
  // Medical profile (available for all users, used in generation for Pro)
  medicamentos?: string[]
  alergias?: string[]
  condicionesPrevias?: string[]
  edadYSexo?: string
}

export async function enrichContext(
  userId: string,
  contexto?: {
    para?: 'yo' | 'familiar' | 'acompanando'
    emocion?: string
    dudas?: string
    nombre?: string
  },
  userPlan?: string
): Promise<EnrichedContext> {
  const [profileResult, packsResult, medResult] = await Promise.all([
    supabase.from('profiles').select('name, who').eq('id', userId).single(),
    supabase
      .from('packs')
      .select('dx')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2),
    supabase
      .from('medical_profiles')
      .select('medicamentos, alergias, condiciones_previas, edad, sexo')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const profile = profileResult.data
  const previousDx = (packsResult.data ?? []).map((p: { dx: string }) => p.dx)

  const context: EnrichedContext = {
    para: contexto?.para ?? (profile?.who as 'yo' | 'familiar' | 'acompanando' | null) ?? 'yo',
    nombre: contexto?.nombre ?? profile?.name ?? null,
    previousDx,
    emocion: contexto?.emocion,
    dudas: contexto?.dudas,
  }

  // Inject medical profile only for Pro users (data is collected for all)
  if (userPlan === 'pro' && medResult.data) {
    const med = medResult.data
    if (med.medicamentos?.length) context.medicamentos = med.medicamentos
    if (med.alergias?.length) context.alergias = med.alergias
    if (med.condiciones_previas?.length) context.condicionesPrevias = med.condiciones_previas

    const parts: string[] = []
    if (med.sexo && med.sexo !== 'prefiero_no_decir') {
      parts.push(med.sexo.charAt(0).toUpperCase() + med.sexo.slice(1))
    }
    if (med.edad) parts.push(`${med.edad} años`)
    if (parts.length) context.edadYSexo = parts.join(', ')
  }

  return context
}
