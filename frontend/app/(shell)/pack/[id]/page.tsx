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

  const [packResult, profileResult] = await Promise.all([
    supabase
      .from('packs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id ?? '')
      .single(),
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', user?.id ?? '')
      .single(),
  ])

  if (!packResult.data) notFound()
  const row = packResult.data
  const userPlan: string = profileResult.data?.plan ?? 'free'

  const pack: Pack = {
    id: row.id,
    dx: row.dx,
    for: 'yo',
    createdAt: row.created_at,
    summary: row.summary ?? '',
    chapters: row.chapters ?? [],
    references: row.refs ?? [],
    conditionSlug: row.condition_slug ?? null,
    tools: row.tools ?? [],
  }

  return <PackView pack={pack} userId={user?.id} userPlan={userPlan} />
}
