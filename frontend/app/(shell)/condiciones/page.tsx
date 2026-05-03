import { createPublicSupabaseClient } from '@/lib/supabase-public'
import { PageHeader } from '@/components/PageHeader'
import { ConditionList } from '@/components/ConditionList'

// Revalidate every hour — condition library content changes rarely.
// Using ISR instead of per-request SSR avoids hitting Supabase on every visit.
export const revalidate = 3600

export default async function BibliotecaPage() {
  const supabase = createPublicSupabaseClient()
  const { data: conditions } = await supabase
    .from('conditions')
    .select('id, slug, name, subtitle, specialty, icd10, reviewed')
    .eq('published', true)
    .order('name')

  return (
    <div className="max-w-[900px] mx-auto px-8 pt-10 pb-20">
      <PageHeader
        eyebrow="Base de datos · Aliis"
        title="Biblioteca de diagnósticos"
        subtitle="Explicaciones enciclopédicas escritas por residentes de neurología."
      />
      <ConditionList conditions={conditions ?? []} />
    </div>
  )
}
