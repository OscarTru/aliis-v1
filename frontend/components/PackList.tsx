'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

function ProgressRing({ pct }: { pct: number }) {
  const r = 14
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={34} height={34} className="shrink-0 -rotate-90">
      <circle cx={17} cy={17} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={3} />
      <circle cx={17} cy={17} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

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
          No hay packs en esta categoría.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {packs.map((p) => {
        const statusLabel = p.pct === 0 ? 'Sin leer' : p.pct === 1 ? 'Completado' : `${p.read} de ${p.total} capítulos`
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
                'flex gap-5 items-center px-6 py-5 bg-muted rounded-2xl border transition-colors duration-100',
                isConfirming ? 'border-destructive/30' : 'border-border'
              )}>
                {/* Progress ring */}
                <div className="relative shrink-0">
                  <ProgressRing pct={p.pct} />
                  <div className={cn(
                    'absolute inset-0 flex items-center justify-center font-mono text-[9px]',
                    p.pct === 1 ? 'text-primary' : 'text-muted-foreground/60'
                  )}>
                    {p.pct === 1 ? '✓' : `${p.read}/${p.total}`}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[19px] tracking-[-0.015em] text-foreground mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {p.dx}
                  </div>
                  {p.summary && !isConfirming && (
                    <p className="font-sans text-[13px] text-muted-foreground leading-[1.5] m-0 mb-2.5 line-clamp-2">
                      {p.summary}
                    </p>
                  )}
                  {isConfirming ? (
                    <p className="font-sans text-[13px] text-destructive/90 mt-1 leading-[1.4] mb-0">
                      ¿Borrar esta explicación? No se puede deshacer.
                    </p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'font-mono text-[10px] tracking-[.08em] uppercase',
                        p.pct === 1 ? 'text-primary' : 'text-muted-foreground/60'
                      )}>
                        {statusLabel}
                      </span>
                      <span className="w-[3px] h-[3px] rounded-full bg-border shrink-0" />
                      <span className="font-mono text-[10px] text-muted-foreground/60">{date}</span>
                    </div>
                  )}
                </div>

                {/* Right actions */}
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
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmId(p.id) }}
                      className="p-1.5 rounded-[7px] border-none bg-transparent cursor-pointer flex items-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors duration-100"
                    >
                      <Trash2 size={15} />
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--border))" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
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
