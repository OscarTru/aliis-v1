'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { TrackedSymptom, SymptomLog } from '@/lib/types'

export function SymptomsTracker({
  initialSymptoms,
  logs,
}: {
  initialSymptoms: TrackedSymptom[]
  logs: SymptomLog[]
}) {
  const [symptoms, setSymptoms] = useState<TrackedSymptom[]>(initialSymptoms)
  const [backfilling, setBackfilling] = useState(false)

  useEffect(() => {
    // Only backfill if no tracked symptoms yet but there are logs with notes
    const hasNotes = logs.some(l => l.note)
    if (initialSymptoms.length > 0 || !hasNotes) return

    setBackfilling(true)
    fetch('/api/aliis/symptoms/backfill', { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.symptoms && Array.isArray(d.symptoms)) {
          setSymptoms(d.symptoms as TrackedSymptom[])
        }
      })
      .catch(console.error)
      .finally(() => setBackfilling(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleResolved(id: string, resolved: boolean) {
    // optimistic update
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, resolved, resolved_at: resolved ? new Date().toISOString() : null } : s))
    const res = await fetch(`/api/aliis/symptoms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved }),
    })
    if (!res.ok) {
      // revert
      setSymptoms(prev => prev.map(s => s.id === id ? { ...s, resolved: !resolved } : s))
    }
  }

  const redFlags = symptoms.filter(s => s.needs_medical_attention && !s.resolved)
  const active = symptoms.filter(s => !s.resolved && !s.needs_medical_attention)
  const resolved = symptoms.filter(s => s.resolved)

  if (symptoms.length === 0) {
    return (
      <div className="mt-6">
        <p className="font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50 mb-4">
          Síntomas rastreados
        </p>
        {backfilling ? (
          <p className="font-serif italic text-[14px] text-muted-foreground/60 text-center py-6 animate-pulse">
            Aliis está analizando tus registros...
          </p>
        ) : (
          <p className="font-serif italic text-[14px] text-muted-foreground text-center py-6">
            Aliis irá rastreando los síntomas que menciones en tus registros.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6">
      <p className="font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50 mb-4">
        Síntomas rastreados
      </p>

      {/* Red flags */}
      {redFlags.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            <span className="font-sans text-[13px] font-medium text-amber-700 dark:text-amber-400">
              Vale la pena mencionárselo a tu médico
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {redFlags.map(s => (
              <div key={s.id} className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-sans text-[13px] text-amber-600 dark:text-amber-300 capitalize">{s.name}</span>
                  {s.attention_reason && (
                    <p className="font-sans text-[11px] text-amber-500/70 italic m-0">{s.attention_reason}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleResolved(s.id, true)}
                  className="shrink-0 text-amber-400/60 hover:text-green-500 transition-colors border-none bg-transparent cursor-pointer p-1"
                  title="Marcar como resuelto"
                >
                  <CheckCircle2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active symptoms (no flag) */}
      {active.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {active.map(s => (
            <div key={s.id} className={cn('flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-muted')}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-sans text-[13px] text-foreground capitalize truncate">{s.name}</span>
                {s.occurrences > 1 && (
                  <span className="font-mono text-[10px] bg-background px-2 py-0.5 rounded-full text-muted-foreground shrink-0">
                    &times;{s.occurrences}
                  </span>
                )}
                <span className="font-sans text-[11px] text-muted-foreground/60 shrink-0 hidden sm:block">
                  {format(new Date(s.last_seen_at), 'd MMM', { locale: es })}
                </span>
              </div>
              <button
                onClick={() => toggleResolved(s.id, true)}
                className="shrink-0 text-muted-foreground/40 hover:text-green-500 transition-colors border-none bg-transparent cursor-pointer p-1"
                title="Marcar como resuelto"
              >
                <CheckCircle2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Resolved symptoms */}
      {resolved.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[9px] tracking-[.12em] uppercase text-muted-foreground/30 mb-1">Resueltos</p>
          {resolved.map(s => (
            <div key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl">
              <span className="font-sans text-[12px] text-muted-foreground/40 line-through capitalize">{s.name}</span>
              <button
                onClick={() => toggleResolved(s.id, false)}
                className="shrink-0 text-muted-foreground/30 hover:text-muted-foreground transition-colors border-none bg-transparent cursor-pointer p-1"
                title="Marcar como no resuelto"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
