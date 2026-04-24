'use client'

import { useEffect } from 'react'

export function LoginModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'var(--c-bg)',
          border: '1px solid var(--c-border)',
          borderRadius: 24,
          padding: '48px 40px 40px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 999,
            border: '1px solid var(--c-border)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--c-text-muted)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 36,
              letterSpacing: '-.025em',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            Aliis
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--c-text-muted)',
            }}
          >
            Tu asistente de salud cerebral
          </div>
        </div>

        {/* Próximamente badge */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 20,
            padding: '8px 16px',
            background: 'rgba(31,138,155,.08)',
            border: '1px solid rgba(31,138,155,.22)',
            borderRadius: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'var(--c-brand-teal-deep)',
          }}
        >
          Próximamente · En desarrollo
        </div>

        {/* Disabled auth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.45 }}>
          <button
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '13px 20px',
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 12,
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--c-text)',
              cursor: 'not-allowed',
              width: '100%',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <button
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '13px 20px',
              background: 'var(--c-invert)',
              border: '1px solid var(--c-invert)',
              borderRadius: 12,
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--c-invert-fg)',
              cursor: 'not-allowed',
              width: '100%',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Continuar con email
          </button>
        </div>

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--c-text-faint)',
          }}
        >
          Aliis no comparte tus datos. Nunca.
        </p>
      </div>
    </div>
  )
}
