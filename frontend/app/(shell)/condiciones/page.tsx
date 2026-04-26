import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PageHeader } from '@/components/PageHeader'
import { ConditionList } from '@/components/ConditionList'

export default async function BibliotecaPage() {
  const supabase = await createServerSupabaseClient()
  const { data: conditions } = await supabase
    .from('conditions')
    .select('id, slug, name, subtitle, specialty, icd10, reviewed')
    .eq('published', true)
    .order('name')

  return (
    <div className="max-w-[900px] mx-auto px-8 pt-10 pb-20">
      <PageHeader
        eyebrow="Neurología · Aliis"
        title="Biblioteca de diagnósticos"
        subtitle="Explicaciones enciclopédicas escritas por residentes de neurología."
      />
      <ConditionList conditions={conditions ?? []} />
    </div>
  )
}
