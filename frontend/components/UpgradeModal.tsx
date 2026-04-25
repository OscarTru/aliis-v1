'use client'

import Link from 'next/link'

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--c-bg)',
          border: '1px solid var(--c-border)',
          borderRadius: 24,
          padding: '40px',
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginBottom: 12 }}>
          Has usado tu pack gratuito
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Con Aliis Pro tienes packs ilimitados, referencias verificadas y acceso completo.
        </p>
        <Link
          href="/precios"
          style={{
            display: 'block', padding: '14px', borderRadius: 12,
            background: 'var(--c-brand-teal)', color: '#fff',
            textDecoration: 'none', fontFamily: 'var(--font-sans)',
            fontSize: 15, fontWeight: 500, marginBottom: 12,
          }}
        >
          Ver planes — desde €9.99/mes
        </Link>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)',
          }}
        >
          Ahora no
        </button>
      </div>
    </div>
  )
}
