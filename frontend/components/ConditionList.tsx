'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type Condition = {
  id: string
  slug: string
  name: string
  subtitle: string
  specialty: string
  icd10: string
  reviewed: boolean
}

const PAGE_SIZE = 6

function normalize(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function fuzzyMatch(q: string, target: string): boolean {
  const nq = normalize(q)
  const nt = normalize(target)
  if (nt.includes(nq)) return true
  // Check each word in target against query for short-distance typos
  const words = nt.split(/\s+/)
  const threshold = Math.floor(nq.length / 4) + 1  // 1 error per ~4 chars
  return words.some((w) => {
    if (Math.abs(w.length - nq.length) > threshold) return false
    return levenshtein(nq, w.slice(0, nq.length + threshold)) <= threshold
  })
}

export function ConditionList({ conditions }: { conditions: Condition[] }) {
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return conditions
    return conditions.filter(
      (c) =>
        fuzzyMatch(q, c.name) ||
        fuzzyMatch(q, c.subtitle) ||
        fuzzyMatch(q, c.specialty)
    )
  }, [query, conditions])

  // Reset visible count when query changes
  const displayed = query.trim() ? filtered : filtered.slice(0, visible)
  const hasMore = !query.trim() && filtered.length > visible

  if (conditions.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground font-sans text-[14px]">
        Próximamente — estamos escribiendo los primeros artículos.
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-7">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca una condición o diagnóstico…"
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background font-sans text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/30 transition-colors duration-150"
        />
      </div>

      {/* Results count when searching */}
      {query.trim() && (
        <p className="font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50 mb-5">
          {filtered.length === 0
            ? 'Sin resultados'
            : `${filtered.length} ${filtered.length === 1 ? 'diagnóstico' : 'diagnósticos'}`}
        </p>
      )}

      {/* Empty search state */}
      {query.trim() && filtered.length === 0 && (
        <div className="text-center py-14">
          <p className="font-serif italic text-[17px] text-muted-foreground leading-[1.5]">
            No encontramos "{query}" en la biblioteca de diagnósticos.
          </p>
          <p className="font-sans text-[13px] text-muted-foreground/60 mt-2">
            Prueba con otro término o genera tu explicación desde{' '}
            <Link href="/ingreso" className="text-foreground underline underline-offset-2">Mi diagnóstico</Link>.
          </p>
        </div>
      )}

      {/* Grid */}
      {displayed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayed.map((c) => (
            <Link
              key={c.id}
              href={`/condiciones/${c.slug}`}
              className="block p-5 rounded-[14px] border border-border hover:border-foreground/20 hover:bg-muted/40 transition-colors no-underline group"
            >
              <div className="font-mono text-[9px] tracking-[.18em] uppercase text-muted-foreground/50 mb-2">
                {c.specialty} · {c.icd10}
              </div>
              <div className="font-serif text-[18px] leading-[1.2] text-foreground mb-1.5">
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

      {/* Ver más */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-7 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] text-foreground cursor-pointer hover:bg-muted transition-colors duration-150"
          >
            Ver más diagnósticos
          </button>
        </div>
      )}
    </div>
  )
}
