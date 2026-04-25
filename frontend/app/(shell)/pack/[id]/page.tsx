import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PackView } from '@/components/PackView'
import type { Pack } from '@/lib/types'

export default async function PackPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: row } = await supabase
    .from('packs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id ?? '')
    .single()

  if (!row) notFound()

  // Fuzzy match condition by diagnosis name
  const { data: conditionMatch } = await supabase
    .from('conditions')
    .select('slug, name')
    .eq('published', true)
    .ilike('name', `%${row.dx}%`)
    .limit(1)
    .maybeSingle()

  const pack: Pack = {
    id: row.id,
    dx: row.dx,
    for: 'yo',
    createdAt: row.created_at,
    summary: row.summary ?? '',
    chapters: row.chapters ?? [],
    references: row.refs ?? [],
  }

  return <PackView pack={pack} userId={user?.id} conditionSlug={conditionMatch?.slug ?? null} />
}
