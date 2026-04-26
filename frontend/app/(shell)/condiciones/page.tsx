import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PageHeader } from '@/components/PageHeader'

export default async function BibliotecaPage() {
  const supabase = await createServerSupabaseClient()
  const { data: conditions } = await supabase
    .from('conditions')
    .select('id, slug, name, subtitle, summary, specialty, icd10, reviewed')
    .eq('published', true)
    .order('name')

  return (
    <div className="max-w-[900px] mx-auto px-8 pt-10 pb-20">
      <PageHeader
        eyebrow="Neurología · Aliis"
        title="Biblioteca de condiciones"
        subtitle="Explicaciones enciclopédicas escritas por residentes de neurología."
      />

      {(!conditions || conditions.length === 0) ? (
        <div className="text-center py-20 text-muted-foreground font-sans text-[14px]">
          Próximamente — estamos escribiendo los primeros artículos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {conditions.map((c) => (
            <Link
              key={c.id}
              href={`/condiciones/${c.slug}`}
              className="block p-5 rounded-[14px] border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors no-underline group"
            >
              <div className="font-mono text-[9px] tracking-[.18em] uppercase text-muted-foreground/50 mb-2">
                {c.specialty} · {c.icd10}
              </div>
              <div className="font-serif text-[18px] leading-[1.2] text-foreground mb-1 group-hover:text-primary transition-colors">
                {c.name}
              </div>
              <div className="font-sans text-[13px] text-muted-foreground leading-[1.5]">
                {c.subtitle}
              </div>
              {c.reviewed && (
                <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[.15em] uppercase text-primary/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
                  Revisado por especialista
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
