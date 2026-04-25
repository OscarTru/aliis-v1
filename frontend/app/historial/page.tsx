import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppShell } from '@/components/AppShell'
import { PackList } from '@/components/PackList'

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
    { key: 'leido', label: 'Mi expediente' },
  ]

  const totalPacks = packs.length

  return (
    <AppShell>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 8 }}>
            {totalPacks} {totalPacks === 1 ? 'explicación' : 'explicaciones'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3.5vw, 36px)', letterSpacing: '-.025em', lineHeight: 1.1, marginBottom: 0, whiteSpace: 'nowrap' }}>
            Mis <em style={{ color: 'var(--c-brand-teal)' }}>explicaciones</em>
          </h1>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/historial?filter=${f.key}`}
              style={{
                padding: '7px 16px',
                borderRadius: 999,
                border: `1px solid ${filter === f.key ? 'transparent' : 'var(--c-border)'}`,
                background: filter === f.key ? '#0F1923' : 'transparent',
                boxShadow: filter === f.key ? '0 0 0 1px rgba(31,138,155,.3), 0 2px 10px rgba(31,138,155,.12)' : 'none',
                color: filter === f.key ? '#fff' : 'var(--c-text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                textDecoration: 'none',
                transition: 'all .12s',
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Empty state — no packs at all */}
        {packs.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 64 }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--c-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              Todavía no tienes explicaciones.<br />Empieza con tu primer diagnóstico.
            </p>
            <Link
              href="/ingreso"
              style={{ padding: '12px 28px', borderRadius: 999, background: '#0F1923', boxShadow: '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500 }}
            >
              Entender mi diagnóstico
            </Link>
          </div>
        )}

        {/* Pack list — client component handles delete + empty filter state */}
        {packs.length > 0 && <PackList initialPacks={filtered} />}

      </main>
    </AppShell>
  )
}
