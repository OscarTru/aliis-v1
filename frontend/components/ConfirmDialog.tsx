'use client'

import { useEffect, useRef } from 'react'

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
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'dialog-backdrop-in 0.18s ease forwards',
      }}
    >
      <style>{`
        @keyframes dialog-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dialog-slide-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dialog-slide-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(8px); }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-desc"
        style={{
          background: 'var(--c-bg)',
          border: '1px solid var(--c-border)',
          borderRadius: 20,
          padding: '32px 32px 28px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
          animation: 'dialog-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Icon */}
        {isDanger && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(220,38,38,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        )}

        <div
          id="dialog-title"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 20,
            letterSpacing: '-.015em',
            color: 'var(--c-text)',
            marginBottom: 10,
          }}
        >
          {title}
        </div>

        <p
          id="dialog-desc"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--c-text-muted)',
            lineHeight: 1.6,
            margin: '0 0 28px',
          }}
        >
          {description}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid var(--c-border)',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--c-text-muted)',
              cursor: 'pointer',
              transition: 'background 0.12s ease, color 0.12s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--c-surface)'
              e.currentTarget.style.color = 'var(--c-text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--c-text-muted)'
            }}
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: isDanger ? '#dc2626' : '#0F1923',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.12s ease, transform 0.12s ease',
              boxShadow: isDanger
                ? '0 0 0 1px rgba(220,38,38,.3), 0 4px 16px rgba(220,38,38,.2)'
                : 'var(--c-btn-primary-shadow)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1' }}
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
