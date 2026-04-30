'use client'

import { useState, useTransition } from 'react'
import { X, Pill } from 'lucide-react'
import { createTreatment, updateTreatment } from '@/app/actions/treatments'
import type { Treatment, TreatmentFrequency } from '@/lib/types'

const SCHEDULE_OPTIONS: { label: string; value: TreatmentFrequency }[] = [
  { label: 'Solo por la mañana', value: 'once_daily' },
  { label: 'Mañana y noche', value: 'twice_daily' },
  { label: 'Mañana, tarde y noche', value: 'three_daily' },
  { label: 'Cuatro veces al día', value: 'four_daily' },
  { label: 'Según sea necesario', value: 'as_needed' },
  { label: 'Otra frecuencia', value: 'other' },
]

interface Props {
  treatment?: Treatment  // if present = edit mode
  onClose: () => void
  onCreated: (t?: Treatment) => void
}

export function AddTreatmentModal({ treatment, onClose, onCreated }: Props) {
  const isEdit = !!treatment
  const [name, setName] = useState(treatment?.name ?? '')
  const [dose, setDose] = useState(treatment?.dose ?? '')
  const [frequency, setFrequency] = useState<TreatmentFrequency>(treatment?.frequency ?? 'once_daily')
  const [frequencyLabel, setFrequencyLabel] = useState(treatment?.frequency_label ?? '')
  const [indefinite, setIndefinite] = useState(treatment?.indefinite ?? true)
  const [startedAt, setStartedAt] = useState(treatment?.started_at ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    setError(null)
    startTransition(async () => {
      const input = {
        name: name.trim(),
        dose: dose.trim() || undefined,
        frequency,
        frequency_label: frequency === 'other' ? frequencyLabel.trim() : undefined,
        indefinite,
        started_at: startedAt || undefined,
      }
      if (isEdit) {
        const result = await updateTreatment(treatment!.id, input)
        if (result.error) { setError(result.error); return }
        onCreated(undefined)
        onClose()
      } else {
        const result = await createTreatment(input)
        if (result.error) { setError(result.error); return }
        onCreated(result.data)
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-[480px] bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-xl p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pill className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-[18px] text-foreground leading-none">
              {isEdit ? 'Editar ' : 'Agregar '}<em>tratamiento</em>
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">Medicamento *</label>
              <input className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground" placeholder="Ej: Metformina" value={name} onChange={e => setName(e.target.value)} autoFocus={!isEdit} />
            </div>
            <div className="w-28">
              <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">Dosis</label>
              <input className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground" placeholder="500mg" value={dose} onChange={e => setDose(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">¿Cuándo lo toma?</label>
            <select className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground" value={frequency} onChange={e => setFrequency(e.target.value as TreatmentFrequency)}>
              {SCHEDULE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {frequency === 'other' && (
            <input className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground" placeholder="Describe la frecuencia" value={frequencyLabel} onChange={e => setFrequencyLabel(e.target.value)} />
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">Fecha de inicio</label>
              <input type="date" className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50 text-foreground" value={startedAt} onChange={e => setStartedAt(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground cursor-pointer pb-2.5">
              <input type="checkbox" checked={indefinite} onChange={e => setIndefinite(e.target.checked)} className="accent-primary w-4 h-4" />
              Indefinido
            </label>
          </div>

          {error && <p className="font-sans text-[13px] text-destructive">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={isPending || !name.trim()} className="flex-1 h-11 rounded-xl bg-foreground text-background font-sans text-[14px] font-medium cursor-pointer disabled:opacity-60 transition-opacity">
              {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar tratamiento'}
            </button>
            <button onClick={onClose} className="h-11 px-4 rounded-xl border border-border bg-transparent font-sans text-[14px] text-muted-foreground cursor-pointer">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
