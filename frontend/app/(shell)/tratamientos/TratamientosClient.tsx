'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pill, Plus, Pencil, Trash2 } from 'lucide-react'
import { deleteTreatment } from '@/app/actions/treatments'
import { FREQUENCY_LABELS } from '@/lib/types'
import { AddTreatmentModal } from '@/components/AddTreatmentModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Treatment } from '@/lib/types'

interface Props {
  initialTreatments: Treatment[]
}

export function TratamientosClient({ initialTreatments }: Props) {
  const router = useRouter()
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleDelete(id: string) {
    setDeletingId(id)
  }

  function confirmDelete() {
    if (!deletingId) return
    const id = deletingId
    setDeletingId(null)
    startTransition(async () => {
      const result = await deleteTreatment(id)
      if (!result.error) setTreatments(prev => prev.filter(t => t.id !== id))
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-sans text-[14px] font-medium cursor-pointer"
        >
          <Plus size={16} />
          Agregar mi primer tratamiento
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Compact list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
        {treatments.map(t => {
          const freq = t.frequency === 'other'
            ? (t.frequency_label ?? 'Otra frecuencia')
            : FREQUENCY_LABELS[t.frequency]

          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Pill className="w-3.5 h-3.5 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[14px] font-medium text-foreground leading-tight truncate">
                  {t.name}
                  {t.dose && (
                    <span className="font-normal text-muted-foreground ml-1.5 text-[13px]">{t.dose}</span>
                  )}
                </p>
                <p className="font-sans text-[11px] text-muted-foreground/60 leading-tight mt-0.5 truncate">
                  {freq}
                  {t.started_at && (
                    <span className="ml-2">
                      · Desde {new Date(t.started_at + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {t.indefinite && <span className="ml-2">· Indefinido</span>}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-0.5 shrink-0">
                <button
                  onClick={() => setEditingTreatment(t)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-sans text-[13px] cursor-pointer bg-transparent transition-colors"
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
            } else if (!editingTreatment && newT) {
              setTreatments(prev => [...prev, newT])
            }
            setShowAddModal(false)
            setEditingTreatment(null)
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        title="¿Eliminar tratamiento?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
