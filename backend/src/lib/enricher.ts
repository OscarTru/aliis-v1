import { supabase } from '../index'

export interface EnrichedContext {
  para: 'yo' | 'familiar' | 'acompanando'
  emocion?: string
  dudas?: string
  nombre: string | null
  previousDx: string[]
}

export async function enrichContext(
  userId: string,
  contexto?: {
    para?: 'yo' | 'familiar' | 'acompanando'
    emocion?: string
    dudas?: string
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
    para: contexto?.para ?? (profile?.who as 'yo' | 'familiar' | 'acompanando' | null) ?? 'yo',
    nombre: contexto?.nombre ?? profile?.name ?? null,
    previousDx,
    emocion: contexto?.emocion,
    dudas: contexto?.dudas,
  }
}
