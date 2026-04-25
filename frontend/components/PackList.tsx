'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'

function ProgressRing({ pct }: { pct: number }) {
  const r = 14
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={34} height={34} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={17} cy={17} r={r} fill="none" stroke="var(--c-border)" strokeWidth={3} />
      <circle cx={17} cy={17} r={r} fill="none" stroke="var(--c-brand-teal)" strokeWidth={3}
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
      <div style={{ paddingTop: 48 }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>
          No hay packs en esta categoría.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {packs.map((p) => {
        const statusLabel = p.pct === 0 ? 'Sin leer' : p.pct === 1 ? 'Completado' : `${p.read} de ${p.total} capítulos`
        const date = new Date(p.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long' })
        const isConfirming = confirmId === p.id
        const isDeleting = deletingId === p.id

        return (
          <div key={p.id} style={{ position: 'relative' }}>
            <Link
              href={`/pack/${p.id}`}
              style={{ textDecoration: 'none', display: 'block', opacity: isDeleting ? 0.4 : 1, transition: 'opacity .2s' }}
              onClick={(e) => { if (isConfirming) e.preventDefault() }}
            >
              <div style={{
                padding: '20px 24px',
                background: 'var(--c-surface)',
                borderRadius: 16,
                border: `1px solid ${isConfirming ? 'rgba(192,57,43,.3)' : 'var(--c-border)'}`,
                display: 'flex',
                gap: 20,
                alignItems: 'center',
                transition: 'border-color .12s',
              }}>
                {/* Progress ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <ProgressRing pct={p.pct} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: p.pct === 1 ? 'var(--c-brand-teal)' : 'var(--c-text-faint)' }}>
                    {p.pct === 1 ? '✓' : `${p.read}/${p.total}`}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-.015em', color: 'var(--c-text)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.dx}
                  </div>
                  {p.summary && !isConfirming && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)', lineHeight: 1.5, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.summary}
                    </p>
                  )}
                  {isConfirming ? (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(192,57,43,.9)', margin: '4px 0 0', lineHeight: 1.4 }}>
                      ¿Borrar esta explicación? No se puede deshacer.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', color: p.pct === 1 ? 'var(--c-brand-teal)' : 'var(--c-text-faint)', textTransform: 'uppercase' }}>
                        {statusLabel}
                      </span>
                      <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--c-border)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-text-faint)' }}>{date}</span>
                    </div>
                  )}
                </div>

                {/* Right actions */}
                {isConfirming ? (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(p.id) }}
                      disabled={isDeleting}
                      style={{
                        padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: '#c0392b', color: '#fff',
                        fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                      }}
                    >
                      {isDeleting ? 'Borrando…' : 'Sí, borrar'}
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmId(null) }}
                      style={{
                        padding: '7px 10px', borderRadius: 8, border: '1px solid var(--c-border)',
                        cursor: 'pointer', background: 'transparent',
                        display: 'flex', alignItems: 'center', color: 'var(--c-text-muted)',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmId(p.id) }}
                      style={{
                        padding: '6px', borderRadius: 7, border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', color: 'var(--c-text-faint)',
                        transition: 'color .12s, background .12s',
                      }}
                      onMouseEnter={(e) => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.color = '#c0392b'
                        b.style.background = 'rgba(192,57,43,.07)'
                      }}
                      onMouseLeave={(e) => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.color = 'var(--c-text-faint)'
                        b.style.background = 'transparent'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-border)" strokeWidth="2">
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
