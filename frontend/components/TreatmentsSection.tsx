'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Check, Pill } from 'lucide-react'
import { createTreatment, updateTreatment, deleteTreatment } from '@/app/actions/treatments'
import { FREQUENCY_LABELS } from '@/lib/types'
import type { Treatment, TreatmentFrequency, TreatmentInput } from '@/lib/types'

const FREQUENCIES: TreatmentFrequency[] = [
  'once_daily', 'twice_daily', 'three_daily', 'four_daily', 'as_needed', 'other'
]

function emptyInput(): TreatmentInput {
  return {
    name: '',
    dose: '',
    frequency: 'once_daily',
    frequency_label: '',
    indefinite: true,
    started_at: '',
    ended_at: '',
    last_changed_at: '',
    notes: '',
  }
}

interface FormProps {
  initial?: TreatmentInput
  onSave: (data: TreatmentInput) => void
  onCancel: () => void
  loading: boolean
}

function TreatmentForm({ initial, onSave, onCancel, loading }: FormProps) {
  const [data, setData] = useState<TreatmentInput>(initial ?? emptyInput())

  function set<K extends keyof TreatmentInput>(key: K, value: TreatmentInput[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-muted/30">
      <div className="flex gap-2">
        <input
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
          placeholder="Nombre del medicamento *"
          value={data.name}
          onChange={e => set('name', e.target.value)}
        />
        <input
          className="h-10 w-28 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
          placeholder="Dosis"
          value={data.dose ?? ''}
          onChange={e => set('dose', e.target.value)}
        />
      </div>

      <select
        className="h-10 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
        value={data.frequency}
        onChange={e => set('frequency', e.target.value as TreatmentFrequency)}
      >
        {FREQUENCIES.map(f => (
          <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
        ))}
      </select>

      {data.frequency === 'other' && (
        <input
          className="h-10 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
          placeholder="Describe la frecuencia"
          value={data.frequency_label ?? ''}
          onChange={e => set('frequency_label', e.target.value)}
        />
      )}

      <div className="flex gap-3 items-center">
        <label className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={data.indefinite}
            onChange={e => set('indefinite', e.target.checked)}
            className="accent-primary"
          />
          Tratamiento indefinido
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-sans text-[11px] text-muted-foreground/70 mb-1 block">Fecha de inicio</label>
          <input
            type="date"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50"
            value={data.started_at ?? ''}
            onChange={e => set('started_at', e.target.value)}
          />
        </div>
        {!data.indefinite && (
          <div>
            <label className="font-sans text-[11px] text-muted-foreground/70 mb-1 block">Fecha de fin</label>
            <input
              type="date"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50"
              value={data.ended_at ?? ''}
              onChange={e => set('ended_at', e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="font-sans text-[11px] text-muted-foreground/70 mb-1 block">Último cambio de dosis</label>
          <input
            type="date"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50"
            value={data.last_changed_at ?? ''}
            onChange={e => set('last_changed_at', e.target.value)}
          />
        </div>
      </div>

      <textarea
        className="rounded-lg border border-border bg-background px-3 py-2 font-sans text-[13px] focus:outline-none focus:border-primary/50 resize-none"
        placeholder="Notas (indicación, instrucciones especiales...)"
        rows={2}
        value={data.notes ?? ''}
        onChange={e => set('notes', e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={() => onSave(data)}
          disabled={loading || !data.name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:opacity-60 shadow-[var(--c-btn-primary-shadow)]"
        >
          <Check size={14} />
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border bg-transparent font-sans text-sm text-muted-foreground cursor-pointer"
        >
          <X size={14} />
          Cancelar
        </button>
      </div>
    </div>
  )
}

interface TreatmentRowProps {
  treatment: Treatment
  onEdit: () => void
  onDelete: () => void
}

function TreatmentRow({ treatment, onEdit, onDelete }: TreatmentRowProps) {
  const freq = treatment.frequency === 'other'
    ? (treatment.frequency_label ?? 'Otra frecuencia')
    : FREQUENCY_LABELS[treatment.frequency]

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Pill className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-[14px] font-medium text-foreground">{treatment.name}</span>
          {treatment.dose && (
            <span className="font-mono text-[11px] text-muted-foreground">{treatment.dose}</span>
          )}
        </div>
        <p className="font-sans text-[12px] text-muted-foreground mt-0.5">{freq}</p>
        <div className="flex gap-3 mt-1 flex-wrap">
          {treatment.started_at && (
            <span className="font-mono text-[11px] text-muted-foreground/60">
              Desde {new Date(treatment.started_at + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </span>
          )}
          {treatment.indefinite && (
            <span className="font-mono text-[11px] text-muted-foreground/60">Indefinido</span>
          )}
          {treatment.last_changed_at && (
            <span className="font-mono text-[11px] text-muted-foreground/60">
              Cambio: {new Date(treatment.last_changed_at + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        {treatment.notes && (
          <p className="font-sans text-[12px] text-muted-foreground/70 mt-1 italic">{treatment.notes}</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-none bg-transparent cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

interface Props {
  initialTreatments: Treatment[]
}

export function TreatmentsSection({ initialTreatments }: Props) {
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate(data: TreatmentInput) {
    startTransition(async () => {
      const result = await createTreatment(data)
      if (!result.error) {
        const optimistic: Treatment = {
          id: crypto.randomUUID(),
          user_id: '',
          name: data.name,
          dose: data.dose ?? null,
          frequency: data.frequency,
          frequency_label: data.frequency_label ?? null,
          indefinite: data.indefinite,
          started_at: data.started_at ?? null,
          ended_at: data.ended_at ?? null,
          last_changed_at: data.last_changed_at ?? null,
          notes: data.notes ?? null,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTreatments(prev => [...prev, optimistic])
        setShowForm(false)
      }
    })
  }

  function handleUpdate(id: string, data: TreatmentInput) {
    startTransition(async () => {
      const result = await updateTreatment(id, data)
      if (!result.error) {
        setTreatments(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
        setEditingId(null)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTreatment(id)
      if (!result.error) {
        setTreatments(prev => prev.filter(t => t.id !== id))
      }
    })
  }

  return (
    <div>
      {treatments.length === 0 && !showForm && (
        <p className="font-sans text-[13px] text-muted-foreground mb-4">
          No tienes tratamientos registrados.
        </p>
      )}

      {treatments.map(t => (
        editingId === t.id ? (
          <TreatmentForm
            key={t.id}
            initial={{
              name: t.name,
              dose: t.dose ?? '',
              frequency: t.frequency,
              frequency_label: t.frequency_label ?? '',
              indefinite: t.indefinite,
              started_at: t.started_at ?? '',
              ended_at: t.ended_at ?? '',
              last_changed_at: t.last_changed_at ?? '',
              notes: t.notes ?? '',
            }}
            onSave={(data) => handleUpdate(t.id, data)}
            onCancel={() => setEditingId(null)}
            loading={isPending}
          />
        ) : (
          <TreatmentRow
            key={t.id}
            treatment={t}
            onEdit={() => setEditingId(t.id)}
            onDelete={() => handleDelete(t.id)}
          />
        )
      ))}

      {showForm && (
        <TreatmentForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={isPending}
        />
      )}

      {!showForm && editingId === null && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-[10px] border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-sans text-[13px] cursor-pointer bg-transparent transition-colors"
        >
          <Plus size={14} />
          Agregar tratamiento
        </button>
      )}
    </div>
  )
}
