'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fuzzyMatch } from '@/lib/fuzzy-search'

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

const SPECIALTY_LABELS: Record<string, string> = {
  'Neurología': 'Neurología',
  'psiquiatría': 'Psiquiatría',
  'cardiología': 'Cardiología',
  'gastroenterología': 'Digestivo',
  'endocrinología': 'Endocrinología',
  'neumología': 'Pulmones',
  'reumatología': 'Reumatología',
  'oncología': 'Oncología',
  'ginecología-endocrinología': 'Ginecología',
}

const CHIPS_VISIBLE = 5

export function ConditionList({ conditions }: { conditions: Condition[] }) {
  const [query, setQuery] = useState('')
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Derive specialties from actual data, preserving count order
  const specialties = useMemo(() => {
    const counts: Record<string, number> = {}
    conditions.forEach(c => { counts[c.specialty] = (counts[c.specialty] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s)
  }, [conditions])

  const visibleChips = specialties.slice(0, CHIPS_VISIBLE)
  const overflowChips = specialties.slice(CHIPS_VISIBLE)

  // Close popover on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [popoverOpen])

  const filtered = useMemo(() => {
    let result = conditions
    if (activeSpecialty) result = result.filter(c => c.specialty === activeSpecialty)
    const q = query.trim()
    if (q) result = result.filter(c => fuzzyMatch(q, c.name) || fuzzyMatch(q, c.subtitle) || fuzzyMatch(q, c.specialty))
    return result
  }, [query, activeSpecialty, conditions])

  const isFiltering = query.trim() !== '' || activeSpecialty !== null
  const displayed = isFiltering ? filtered : filtered.slice(0, visible)
  const hasMore = !isFiltering && filtered.length > visible

  function selectSpecialty(s: string) {
    setActiveSpecialty(prev => prev === s ? null : s)
    setVisible(PAGE_SIZE)
    setPopoverOpen(false)
  }

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
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE) }}
          placeholder="Busca una condición o diagnóstico…"
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background font-sans text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/30 transition-colors duration-150"
        />
      </div>

      {/* Specialty filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-7">
        {/* "Todos" chip */}
        <button
          onClick={() => { setActiveSpecialty(null); setVisible(PAGE_SIZE) }}
          className={cn(
            'px-3.5 py-1.5 rounded-full font-sans text-[12px] border transition-colors cursor-pointer',
            activeSpecialty === null
              ? 'bg-foreground text-background border-transparent'
              : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
          )}
        >
          Todos
        </button>

        {visibleChips.map(s => (
          <button
            key={s}
            onClick={() => selectSpecialty(s)}
            className={cn(
              'px-3.5 py-1.5 rounded-full font-sans text-[12px] border transition-colors cursor-pointer',
              activeSpecialty === s
                ? 'bg-foreground text-background border-transparent'
                : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
            )}
          >
            {SPECIALTY_LABELS[s] ?? s}
          </button>
        ))}

        {/* "Mostrar más" with popover */}
        {overflowChips.length > 0 && (
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setPopoverOpen(p => !p)}
              className={cn(
                'flex items-center gap-1 px-3.5 py-1.5 rounded-full font-sans text-[12px] border transition-colors cursor-pointer',
                overflowChips.includes(activeSpecialty ?? '')
                  ? 'bg-foreground text-background border-transparent'
                  : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
              )}
            >
              Más
              <ChevronDown size={11} className={cn('transition-transform', popoverOpen && 'rotate-180')} />
            </button>

            {popoverOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 bg-background border border-border rounded-2xl shadow-lg p-3 min-w-[180px] flex flex-col gap-1">
                <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-border">
                  <span className="font-mono text-[9px] tracking-[.15em] uppercase text-muted-foreground/50">Especialidades</span>
                  <button onClick={() => setPopoverOpen(false)} className="text-muted-foreground/40 hover:text-foreground cursor-pointer bg-transparent border-none p-0">
                    <X size={12} />
                  </button>
                </div>
                {overflowChips.map(s => (
                  <button
                    key={s}
                    onClick={() => selectSpecialty(s)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl font-sans text-[13px] transition-colors cursor-pointer border-none',
                      activeSpecialty === s
                        ? 'bg-foreground text-background'
                        : 'text-foreground hover:bg-muted bg-transparent'
                    )}
                  >
                    {SPECIALTY_LABELS[s] ?? s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {isFiltering && (
        <div className="flex items-center gap-3 mb-5">
          <p className="font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50">
            {filtered.length === 0
              ? 'Sin resultados'
              : `${filtered.length} ${filtered.length === 1 ? 'diagnóstico' : 'diagnósticos'}`}
            {activeSpecialty ? ` · ${SPECIALTY_LABELS[activeSpecialty] ?? activeSpecialty}` : ''}
          </p>
          {activeSpecialty && (
            <button
              onClick={() => setActiveSpecialty(null)}
              className="flex items-center gap-1 font-sans text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <X size={11} /> Quitar filtro
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {isFiltering && filtered.length === 0 && (
        <div className="text-center py-14">
          <p className="font-serif italic text-[17px] text-muted-foreground leading-[1.5]">
            No encontramos resultados{query.trim() ? ` para "${query}"` : ''}{activeSpecialty ? ` en ${SPECIALTY_LABELS[activeSpecialty] ?? activeSpecialty}` : ''}.
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
                {SPECIALTY_LABELS[c.specialty] ?? c.specialty} · {c.icd10}
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
