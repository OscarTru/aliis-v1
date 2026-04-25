import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { AppNav } from '@/components/AppNav'
import { ScribbleBrain } from '@/components/ui/ScribbleBrain'

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
    return { ...p, read, total, pct }
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
    { key: 'leido', label: 'Leído' },
  ]

  return (
    <>
      <AppNav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, letterSpacing: '-.025em', marginBottom: 32 }}>
          Mis explicaciones
        </h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/historial?filter=${f.key}`}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: '1px solid var(--c-border)',
                background: filter === f.key ? 'var(--c-brand-teal)' : 'transparent',
                color: filter === f.key ? '#fff' : 'var(--c-text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 64 }}>
            <ScribbleBrain size={60} />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--c-text-muted)', marginTop: 20, marginBottom: 24 }}>
              {packs.length === 0 ? 'Todavía no hay explicaciones aquí.' : 'No hay packs en esta categoría.'}
            </p>
            <Link
              href="/ingreso"
              style={{ padding: '12px 28px', borderRadius: 999, background: 'var(--c-brand-teal)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 15 }}
            >
              Entender mi diagnóstico
            </Link>
          </div>
        )}

        {/* Pack list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/pack/${p.id}`}
              style={{ textDecoration: 'none', display: 'block', padding: '20px 24px', background: 'var(--c-surface)', borderRadius: 16, border: '1px solid var(--c-border)' }}
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--c-text)', marginBottom: 6 }}>
                {p.dx}
              </div>
              {p.summary && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 14, lineHeight: 1.5, margin: '0 0 14px' }}>
                  {p.summary}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--c-border)' }}>
                  <div style={{ width: `${p.pct * 100}%`, height: '100%', borderRadius: 999, background: 'var(--c-brand-teal)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-text-faint)', flexShrink: 0 }}>
                  {p.read}/{p.total}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
