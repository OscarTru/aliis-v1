'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddTreatmentModal } from '@/components/AddTreatmentModal'

export function AddTreatmentButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-sans text-[13px] cursor-pointer bg-transparent transition-colors"
      >
        <Plus size={14} />
        Agregar tratamiento
      </button>
      {open && (
        <AddTreatmentModal
          onClose={() => setOpen(false)}
          onCreated={() => setOpen(false)}
        />
      )}
    </>
  )
}
