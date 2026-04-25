import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ConditionView } from '@/components/ConditionView'
import type { Condition } from '@/lib/types'

export default async function CondicionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

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
