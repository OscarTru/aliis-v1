'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pill, Check, Plus, Pencil, Trash2 } from 'lucide-react'
import { deleteTreatment } from '@/app/actions/treatments'
import { FREQUENCY_LABELS } from '@/lib/types'
import { AddTreatmentModal } from '@/components/AddTreatmentModal'
import type { Treatment, AdherenceLog } from '@/lib/types'

const SCHEDULE_SLOTS: Record<string, string[]> = {
  once_daily:  ['Mañana'],
  twice_daily: ['Mañana', 'Noche'],
  three_daily: ['Mañana', 'Tarde', 'Noche'],
  four_daily:  ['Mañana', 'Mediodía', 'Tarde', 'Noche'],
  as_needed:   [],
  other:       [],
}

function slotKey(treatment: Treatment, slot: string): string {
  const base = treatment.dose ? `${treatment.name} ${treatment.dose}` : treatment.name
  return `${base} (${slot})`
}

interface Props {
  initialTreatments: Treatment[]
  initialTodayLogs: AdherenceLog[]
  todayDate: string
}

export function TratamientosClient({ initialTreatments, initialTodayLogs, todayDate }: Props) {
  const router = useRouter()
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments)
  const [logs, setLogs] = useState<AdherenceLog[]>(initialTodayLogs)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const takenToday = new Set(logs.map(l => l.medication))

  function toggleSlot(treatment: Treatment, slot: string) {
    const key = slotKey(treatment, slot)
    const taken = takenToday.has(key)
    if (!taken) {
      setLogs(prev => [...prev, {
        id: crypto.randomUUID(),
        user_id: '',
        medication: key,
        taken_date: todayDate,
        taken_at: new Date().toISOString(),
      }])
    } else {
      setLogs(prev => prev.filter(l => !(l.medication === key && l.taken_date === todayDate)))
    }
    startTransition(async () => {
      const { toggleAdherence } = await import('@/app/actions/adherence')
      await toggleAdherence(key, todayDate, !taken)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este tratamiento?')) return
    startTransition(async () => {
      const result = await deleteTreatment(id)
      if (!result.error) {
        setTreatments(prev => prev.filter(t => t.id !== id))
      }
    })
  }

  if (treatments.length === 0 && !showAddModal && !editingTreatment) {
    return (
      <div className="text-center pt-12">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Pill className="w-7 h-7 text-primary/60" />
        </div>
        <p className="font-serif italic text-[17px] text-muted-foreground mb-6 leading-relaxed">
          No tienes tratamientos registrados.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-sans text-[14px] font-medium cursor-pointer"
        >
          <Plus size={16} />
          Agregar mi primer tratamiento
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {treatments.map(t => {
          const slots = SCHEDULE_SLOTS[t.frequency] ?? []
          const freq = t.frequency === 'other'
            ? (t.frequency_label ?? 'Otra frecuencia')
            : FREQUENCY_LABELS[t.frequency]

          return (
            <div key={t.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[18px] text-foreground leading-tight">
                        {t.name}
                        {t.dose && (
                          <span className="font-sans text-[13px] font-normal text-muted-foreground ml-2">{t.dose}</span>
                        )}
                      </h3>
                      <p className="font-sans text-[13px] text-muted-foreground mt-0.5">{freq}</p>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        {t.started_at && (
                          <span className="font-mono text-[11px] text-muted-foreground/60">
                            Desde {new Date(t.started_at + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </span>
                        )}
                        {t.indefinite && (
                          <span className="font-mono text-[11px] text-muted-foreground/60">· Indefinido</span>
                        )}
                      </div>
                      {t.notes && (
                        <p className="font-sans text-[12px] text-muted-foreground/70 mt-1.5 italic leading-relaxed">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditingTreatment(t)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {slots.length > 0 && (
                <div className="px-5 pb-4 border-t border-border pt-3">
                  <p className="font-mono text-[10px] tracking-[.14em] uppercase text-muted-foreground/50 mb-2.5">
                    Hoy
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {slots.map(slot => {
                      const key = slotKey(t, slot)
                      const taken = takenToday.has(key)
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleSlot(t, slot)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-sans text-[13px] transition-all cursor-pointer ${
                            taken
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                          }`}
                        >
                          {taken && <Check className="w-3.5 h-3.5" />}
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {t.frequency === 'as_needed' && (
                <div className="px-5 pb-4 border-t border-border pt-3">
                  <p className="font-sans text-[12px] text-muted-foreground/60 italic">
                    Tomar según sea necesario
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-sans text-[13px] cursor-pointer bg-transparent transition-colors"
      >
        <Plus size={14} />
        Agregar tratamiento
      </button>

      {(showAddModal || editingTreatment) && (
        <AddTreatmentModal
          treatment={editingTreatment ?? undefined}
          onClose={() => { setShowAddModal(false); setEditingTreatment(null) }}
          onCreated={(newT) => {
            if (editingTreatment && newT) {
              setTreatments(prev => prev.map(t => t.id === editingTreatment.id ? newT : t))
            } else if (editingTreatment && !newT) {
              // edit mode returns undefined — refresh server data to get updated treatment
              router.refresh()
            } else if (!editingTreatment && newT) {
              setTreatments(prev => [...prev, newT])
            }
            setShowAddModal(false)
            setEditingTreatment(null)
          }}
        />
      )}
    </div>
  )
}
