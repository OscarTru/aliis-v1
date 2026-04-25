import { supabase } from '../index'

export interface EnrichedContext {
  para: 'yo' | 'familiar'
  nombre: string | null
  previousDx: string[]
  frecuencia?: string
  dudas?: string
}

export async function enrichContext(
  userId: string,
  contexto?: {
    frecuencia?: string
    dudas?: string
    para?: 'yo' | 'familiar'
    nombre?: string
  }
): Promise<EnrichedContext> {
  const [profileResult, packsResult] = await Promise.all([
    supabase.from('profiles').select('name, who').eq('id', userId).single(),
    supabase
      .from('packs')
      .select('dx')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  const profile = profileResult.data
  const previousDx = (packsResult.data ?? []).map((p: { dx: string }) => p.dx)

  return {
    para: contexto?.para ?? (profile?.who as 'yo' | 'familiar' | null) ?? 'yo',
    nombre: contexto?.nombre ?? profile?.name ?? null,
    previousDx,
    frecuencia: contexto?.frecuencia,
    dudas: contexto?.dudas,
  }
}
