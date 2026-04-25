'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

type Variant = 'danger' | 'default'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger'

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <AlertDialogContent className="max-w-[400px] rounded-2xl">
        <AlertDialogHeader>
          {isDanger && (
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-destructive/10 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          )}
          <AlertDialogTitle className="font-serif text-xl tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              isDanger
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_0_1px_rgba(220,38,38,.3),_0_4px_16px_rgba(220,38,38,.2)]'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[var(--c-btn-primary-shadow)]'
            )}
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
