import { notFound } from 'next/navigation'
import { createPublicSupabaseClient } from '@/lib/supabase-public'
import { ConditionView } from '@/components/ConditionView'
import type { Condition } from '@/lib/types'

// Revalidate every hour — condition content is editorial and changes rarely.
// ISR caches the rendered HTML at the edge, eliminating Supabase queries on
// repeated visits to the same condition page.
export const revalidate = 3600

export default async function CondicionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createPublicSupabaseClient()

  const { data: condition } = await supabase
    .from('conditions')
    .select('*, sections:condition_sections(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!condition) notFound()

  const sorted: Condition = {
    ...condition,
    sections: [...condition.sections].sort((a, b) => a.order - b.order),
  }

  return (
    <div className="h-full flex flex-col">
      <ConditionView condition={sorted} />
    </div>
  )
}
