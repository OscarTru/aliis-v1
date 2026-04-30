'use client'

import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="w-full max-w-[340px] bg-background border border-border rounded-2xl shadow-xl p-6 pointer-events-auto"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  variant === 'danger' ? 'bg-destructive/10' : 'bg-amber-500/10'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${
                    variant === 'danger' ? 'text-destructive' : 'text-amber-500'
                  }`} />
                </div>

                <div>
                  <p className="font-serif text-[17px] text-foreground leading-snug mb-1">
                    {title}
                  </p>
                  {description && (
                    <p className="font-sans text-[13px] text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 w-full pt-1">
                  <button
                    onClick={onCancel}
                    className="flex-1 h-10 rounded-xl border border-border bg-transparent font-sans text-[13px] text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 h-10 rounded-xl font-sans text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-90 ${
                      variant === 'danger'
                        ? 'bg-destructive text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
