'use client'

import { useState } from 'react'
import { AppNav } from '../../components/AppNav'
import { Footer } from '../../components/Footer'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { Capsule } from '../../components/ui/Capsule'
import { LoginModal } from '../../components/LoginModal'
import { PRICING_TIERS } from '../../lib/mock-data'

type Currency = 'EUR' | 'USD' | 'MXN'

const COMPARISON_ROWS = [
  ['Explicaciones por semana', '1', 'Ilimitadas'],
  ['Referencias verificables', '✓', '✓ con DOI desplegable'],
  ['Historial', '30 días', 'Permanente'],
  ['Audio narrado', '—', '✓'],
  ['Compartir', '3 por explicación', 'Sin límite'],
  ['Diario de síntomas', '—', '✓'],
  ['PDF sin marca de agua', '—', '✓'],
  ['Soporte prioritario', '—', '✓'],
]

const FAQ = [
  {
    q: '¿Cómo sé que la IA no se inventa cosas?',
    a: 'Cada afirmación de cada explicación va con su referencia desplegable — PubMed, DOI, guías clínicas. Si una fuente no existe o no soporta la frase, el sistema no la escribe.',
  },
  {
    q: '¿Qué pasa si cancelo?',
    a: 'Tus explicaciones siguen ahí hasta 30 días. Si vuelves antes, retomas donde estabas. Después se archivan.',
  },
  {
    q: '¿Las explicaciones gratis son peores?',
    a: 'No. Son las mismas explicaciones, con las mismas referencias. La diferencia es cuántas puedes crear, el audio y el historial largo.',
  },
  {
    q: '¿Esto reemplaza a mi médico?',
    a: 'Nunca. Es lo que te prepara para ir a tu médico con mejores preguntas. Aparece como disclaimer en cada pantalla.',
  },
]

export default function PreciosPage() {
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '72px 24px 120px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <Capsule tone="teal">💡 14 días gratis · cancelas cuando quieras</Capsule>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem,5vw,3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-.02em',
            margin: '0 0 14px',
          }}>
            Entiende tu cerebro{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>por menos que un café al mes.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--c-text-muted)', maxWidth: '54ch', margin: '0 auto' }}>
            Gratis funciona para un diagnóstico puntual. Pro es para quien convive con el suyo.
          </p>
        </div>

        {/* Currency switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 999 }}>
            {(['EUR', 'USD', 'MXN'] as Currency[]).map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                style={{
                  background: currency === c ? 'var(--c-invert)' : 'transparent',
                  color: currency === c ? 'var(--c-invert-fg)' : 'var(--c-text-muted)',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '.15em',
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, marginBottom: 56 }}>
          {([PRICING_TIERS.gratis, PRICING_TIERS.pro] as const).map((tier) => (
            <article key={tier.name}
              style={{
                position: 'relative',
                padding: '36px 36px 40px',
                background: tier.highlight ? 'var(--c-surface)' : 'transparent',
                border: `1px solid ${tier.highlight ? 'var(--c-text)' : 'var(--c-border)'}`,
                borderRadius: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tier.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: 32,
                  padding: '4px 12px',
                  background: 'var(--c-text)', color: 'var(--c-bg)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
                }}>
                  Nuestra recomendación
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <Capsule tone={tier.highlight ? 'teal' : 'ghost'}>
                  {tier.highlight ? 'Referencias verificables' : 'Basado en evidencia'}
                </Capsule>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', margin: '0 0 8px', lineHeight: 1.05 }}>
                {tier.name}
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--c-text-muted)', margin: '0 0 24px' }}>
                {tier.pitch}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 52, letterSpacing: '-.03em', lineHeight: 1 }}>
                  {tier.prices[currency]}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
                  {tier.cadence}
                </span>
              </div>

              <div style={{ margin: '24px 0', height: 1, background: 'var(--c-border)' }} />

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: f.included ? 1 : 0.4 }}>
                    <span style={{ flexShrink: 0, marginTop: 4, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {f.included ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--c-brand-teal-deep)" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                          <path d="M3 7.5L6 10.5 11.5 4.5" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                          <path d="M2 2l6 6M8 2l-6 6" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.4 }}>{f.text}</div>
                      {f.sub && (
                        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-faint)', marginTop: 2 }}>
                          {f.sub}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '13px 20px',
                  borderRadius: 12,
                  background: tier.highlight ? 'var(--c-invert)' : 'transparent',
                  color: tier.highlight ? 'var(--c-invert-fg)' : 'var(--c-text)',
                  border: `1px solid ${tier.highlight ? 'var(--c-invert)' : 'var(--c-border)'}`,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {tier.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </article>
          ))}
        </div>

        {/* Comparison table */}
        <div style={{ border: '1px solid var(--c-border)', borderRadius: 20, overflow: 'hidden', background: 'var(--c-surface)', marginBottom: 56 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: 0 }}>Compara todo, sin trampas.</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--c-bg)' }}>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-subtle)' }}>Funcionalidad</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-subtle)' }}>Gratis</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text)' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '14px 24px' }}>{r[0]}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--c-text-muted)' }}>{r[1]}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500 }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trust pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, padding: 40, background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 20, marginBottom: 56 }}>
          {[
            { eyebrow: 'Evidencia', title: 'Basado en evidencia científica', body: 'Cada afirmación con su referencia. Desplegables para comprobar.' },
            { eyebrow: 'Límite', title: 'No reemplaza a tu médico', body: 'Disclaimer visible siempre. Es preparación, no diagnóstico.' },
            { eyebrow: 'Origen', title: 'Por Cerebros Esponjosos', body: 'La misma voz que ya sigues. La misma obsesión por explicar bien.' },
          ].map((p, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 14 }}>· {p.eyebrow} ·</div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.25, letterSpacing: '-.01em', margin: '0 0 10px' }}>{p.title}</h4>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.65, color: 'var(--c-text-muted)', margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, textAlign: 'center', marginBottom: 32 }}>Preguntas frecuentes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28 }}>
            {FAQ.map((f, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 8, lineHeight: 1.35 }}>{f.q}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', lineHeight: 1.65 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
