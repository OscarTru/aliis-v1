'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '@/components/AppNav'
import { Footer } from '@/components/Footer'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/button'
import { ScribbleBrain } from '@/components/ui/ScribbleBrain'
import { MOCK_PACKS, TINT_GRADIENTS, type MockPack } from '@/lib/mock-data'

const FILTERS = ['Todos', 'Sin leer', 'A medias', 'Compartidos', 'Este año'] as const

function PackCard({ pack, onClick }: { pack: MockPack; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--c-surface)',
        border: `1px solid ${hovered ? 'var(--c-border-strong)' : 'var(--c-border)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color .2s',
      }}
    >
      {/* Color header */}
      <div style={{ position: 'relative', height: 130, background: TINT_GRADIENTS[pack.tint], overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.55),transparent 70%)' }} />
        <span style={{ position: 'absolute', top: 14, left: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', color: 'rgba(255,255,255,.85)' }}>
          {pack.date.toUpperCase()}
        </span>
        <span style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase',
          background: pack.status === 'Nuevo' ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.16)',
          color: pack.status === 'Nuevo' ? 'var(--c-brand-ink)' : '#fff',
          backdropFilter: 'blur(6px)',
          borderRadius: 999,
        }}>
          {pack.status}
        </span>
        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display: 'flex', gap: 3 }}>
          {Array.from({ length: pack.chaptersTotal }).map((_, j) => (
            <div key={j} style={{ flex: 1, height: 3, borderRadius: 2, background: j < pack.chaptersRead ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)' }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 22px 24px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.2, letterSpacing: '-.01em', margin: '0 0 10px' }}>
          {pack.dx}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)' }}>
          <span>{pack.chaptersRead}/{pack.chaptersTotal} capítulos</span>
          <span>Abrir →</span>
        </div>
      </div>
    </article>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState(0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '60px 24px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 48 }}>
          <div>
            <Eyebrow style={{ marginBottom: 16 }}>· Mis explicaciones ·</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem,5vw,3.5rem)', lineHeight: 1.04, letterSpacing: '-.025em', margin: 0 }}>
              Lo que has entendido,{' '}
              <em style={{ color: 'var(--c-text-faint)' }}>junto.</em>
            </h1>
          </div>
          <Button onClick={() => router.push('/')}>
            Nueva explicación
          </Button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {FILTERS.map((f, i) => (
            <button key={f} onClick={() => setActiveFilter(i)}
              style={{
                padding: '7px 14px',
                background: i === activeFilter ? 'var(--c-invert)' : 'transparent',
                color: i === activeFilter ? 'var(--c-invert-fg)' : 'var(--c-text-muted)',
                border: `1px solid ${i === activeFilter ? 'var(--c-invert)' : 'var(--c-border)'}`,
                borderRadius: 999,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Pack grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {MOCK_PACKS.map((p) => (
            <PackCard key={p.id} pack={p} onClick={() => router.push(`/dashboard/pack/${p.id}`)} />
          ))}
        </div>

        {/* Empty state CTA */}
        <div style={{ marginTop: 64, padding: '40px 24px', textAlign: 'center', border: '1px dashed var(--c-border-strong)', borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <ScribbleBrain size={56} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 16 }}>
            ¿Saliste hoy de consulta?{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>Pégalo ya, mientras está fresco.</em>
          </div>
          <Button size="sm" onClick={() => router.push('/')}>
            Empezar nueva explicación
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
