import { Suspense } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PackList } from '@/components/PackList'
import { UpgradeToast } from '@/components/UpgradeToast'
import { cn } from '@/lib/utils'

type FilterKey = 'todos' | 'sin-leer' | 'a-medias' | 'leido'

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter = 'todos' } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [packsResult, readsResult] = await Promise.all([
    supabase
      .from('packs')
      .select('id, dx, summary, created_at, chapters')
      .eq('user_id', user?.id ?? '')
      .order('created_at', { ascending: false }),
    supabase
      .from('chapter_reads')
      .select('pack_id, chapter_id')
      .eq('user_id', user?.id ?? ''),
  ])

  const packs = packsResult.data ?? []
  const reads = readsResult.data ?? []

  const readsByPack = reads.reduce<Record<string, Set<string>>>((acc, r) => {
    if (!acc[r.pack_id]) acc[r.pack_id] = new Set()
    acc[r.pack_id].add(r.chapter_id)
    return acc
  }, {})

  const withProgress = packs.map((p) => {
    const total = Array.isArray(p.chapters) ? p.chapters.length : 5
    const read = readsByPack[p.id]?.size ?? 0
    const pct = total > 0 ? read / total : 0
    return { id: p.id, dx: p.dx, summary: p.summary, created_at: p.created_at, read, total, pct }
  })

  const filtered = withProgress.filter((p) => {
    if (filter === 'sin-leer') return p.pct === 0
    if (filter === 'a-medias') return p.pct > 0 && p.pct < 1
    if (filter === 'leido') return p.pct === 1
    return true
  })

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'sin-leer', label: 'Sin leer' },
    { key: 'a-medias', label: 'A medias' },
    { key: 'leido', label: 'Completados' },
  ]

  const totalPacks = packs.length

  return (
    <>
      <Suspense fallback={null}>
        <UpgradeToast />
      </Suspense>
      <div className="max-w-[680px] mx-auto px-8 pt-10 pb-20">

        {/* Header */}
        <div className="mb-9">
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-2">
            {totalPacks} {totalPacks === 1 ? 'diagnóstico' : 'diagnósticos'}
          </p>
          <h1 className="font-serif text-[clamp(24px,3.5vw,36px)] tracking-tight leading-tight mb-0 whitespace-nowrap">
            Mi <em>expediente</em>
          </h1>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-7 flex-wrap">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/historial?filter=${f.key}`}
              className={cn(
                'px-4 py-1.5 rounded-full border font-sans text-[13px] no-underline transition-all duration-[120ms]',
                filter === f.key
                  ? 'border-transparent bg-foreground text-background shadow-[var(--c-btn-primary-shadow)]'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Empty state — no packs at all */}
        {packs.length === 0 && (
          <div className="text-center pt-16">
            <p className="font-serif italic text-[17px] text-muted-foreground mb-6 leading-relaxed">
              Todavía no tienes explicaciones.<br />Empieza con tu primer diagnóstico.
            </p>
            <Link
              href="/ingreso"
              className="inline-block px-7 py-3 rounded-full bg-foreground text-background no-underline font-sans text-sm font-medium shadow-[var(--c-btn-primary-shadow)]"
            >
              Entender mi diagnóstico
            </Link>
          </div>
        )}

        {/* Pack list — client component handles delete + empty filter state */}
        {packs.length > 0 && <PackList initialPacks={filtered} />}

      </div>
    </>
  )
}
