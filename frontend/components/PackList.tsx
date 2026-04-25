'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, X, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Pack = {
  id: string
  dx: string
  summary?: string | null
  created_at: string
  read: number
  total: number
  pct: number
}

export function PackList({ initialPacks }: { initialPacks: Pack[] }) {
  const [packs, setPacks] = useState(initialPacks)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('chapter_reads').delete().eq('pack_id', id)
    await supabase.from('packs').delete().eq('id', id)
    setPacks((prev) => prev.filter((p) => p.id !== id))
    setConfirmId(null)
    setDeletingId(null)
  }

  if (packs.length === 0) {
    return (
      <div className="pt-12">
        <p className="font-serif italic text-[17px] text-muted-foreground leading-[1.5]">
          No hay diagnósticos en esta categoría.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {packs.map((p) => {
        const date = new Date(p.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long' })
        const isConfirming = confirmId === p.id
        const isDeleting = deletingId === p.id

        return (
          <div key={p.id} className="relative">
            <Link
              href={`/pack/${p.id}`}
              className={cn('no-underline block transition-opacity duration-200', isDeleting ? 'opacity-40' : 'opacity-100')}
              onClick={(e) => { if (isConfirming) e.preventDefault() }}
            >
              <div className={cn(
                'group flex flex-col gap-0 bg-background rounded-2xl border overflow-hidden transition-colors duration-100',
                isConfirming ? 'border-destructive/30' : 'border-border hover:border-foreground/20'
              )}>
                {/* Progress bar — top edge of card, full width */}
                <div className="h-[3px] bg-muted w-full">
                  <div
                    className={cn('h-full transition-all duration-500', p.pct === 1 ? 'bg-primary' : 'bg-primary/50')}
                    style={{ width: `${Math.round(p.pct * 100)}%` }}
                  />
                </div>

                {/* Card body */}
                <div className="flex gap-4 items-start px-5 py-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[18px] tracking-[-0.015em] text-foreground mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {p.dx}
                    </div>
                    {p.summary && !isConfirming && (
                      <p className="font-sans text-[13px] text-muted-foreground leading-[1.5] m-0 mb-3 line-clamp-2">
                        {p.summary}
                      </p>
                    )}
                    {isConfirming ? (
                      <p className="font-sans text-[13px] text-destructive/90 leading-[1.4] mb-0 mt-1">
                        ¿Borrar este diagnóstico? No se puede deshacer.
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status badge */}
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] tracking-[.08em] uppercase',
                          p.pct === 0 ? 'bg-muted text-muted-foreground/60' :
                          p.pct === 1 ? 'bg-primary/10 text-primary' :
                                        'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                        )}>
                          {p.pct === 0 ? 'Sin leer' : p.pct === 1 ? '✓ Completado' : `${p.read} de ${p.total} capítulos`}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/40">{date}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: actions or chevron */}
                  {isConfirming ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.preventDefault(); handleDelete(p.id) }}
                        disabled={isDeleting}
                        className="px-[14px] py-[7px] rounded-lg border-none cursor-pointer bg-destructive text-destructive-foreground font-sans text-[13px] font-medium"
                      >
                        {isDeleting ? 'Borrando…' : 'Sí, borrar'}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setConfirmId(null) }}
                        className="px-[10px] py-[7px] rounded-lg border border-border cursor-pointer bg-transparent flex items-center text-muted-foreground"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <button
                        onClick={(e) => { e.preventDefault(); setConfirmId(p.id) }}
                        className="p-1.5 rounded-[7px] border-none bg-transparent cursor-pointer text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors duration-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                    </div>
                  )}
                </div>

                {/* Contextual CTA footer — only when not confirming */}
                {!isConfirming && (
                  <div className={cn(
                    'px-5 py-3 border-t border-border/60 flex items-center justify-between',
                    p.pct === 1 ? 'bg-primary/5' : 'bg-muted/40'
                  )}>
                    <span className="font-sans text-[12px] text-muted-foreground/70">
                      {p.pct === 0 ? 'Empieza a leer tu diagnóstico' :
                       p.pct === 1 ? 'Diagnóstico completado — prepara tu consulta' :
                                     'Continúa donde lo dejaste'}
                    </span>
                    <span className="font-sans text-[12px] font-medium text-primary">
                      {p.pct === 0 ? 'Leer →' : p.pct === 1 ? 'Revisar →' : 'Continuar →'}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
