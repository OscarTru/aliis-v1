'use client'

import { useState, useRef, useEffect } from 'react'
import type { DiagnosticoResponse } from './api/diagnostico/route'
import Image from 'next/image'

// ─── Design tokens (inline styles follow tokens.css) ──────────

const EJEMPLOS = ['Migraña con aura', 'Vértigo posicional', 'Epilepsia focal', 'Temblor esencial', 'Insomnio crónico']

// ─── Primitives ───────────────────────────────────────────────

function Eyebrow({ children, centered = false, style = {} }: { children: React.ReactNode; centered?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '.22em',
      color: 'var(--c-text-subtle)',
      textAlign: centered ? 'center' : 'left',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Capsule({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'teal' | 'ghost' }) {
  const tones = {
    default: { bg: 'var(--c-surface)', fg: 'var(--c-text-muted)', bd: 'var(--c-border)' },
    teal: { bg: 'rgba(31,138,155,.08)', fg: 'var(--c-brand-teal-deep)', bd: 'rgba(31,138,155,.22)' },
    ghost: { bg: 'transparent', fg: 'var(--c-text-subtle)', bd: 'var(--c-border)' },
  }
  const t = tones[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      fontFamily: 'var(--font-mono)', fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '.18em',
    }}>
      {children}
    </span>
  )
}

function ButtonPrimary({ children, onClick, size = 'md', icon }: {
  children: React.ReactNode; onClick?: () => void; size?: 'sm' | 'md' | 'lg'; icon?: 'arrow'
}) {
  const pad = { sm: '8px 16px', md: '12px 22px', lg: '14px 28px' }[size]
  const fs = { sm: 13, md: 14, lg: 15 }[size]
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: pad, background: 'var(--c-invert)', color: 'var(--c-invert-fg)',
      border: '1px solid var(--c-invert)', borderRadius: 999,
      fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: fs,
      cursor: 'pointer', transition: 'opacity .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {children}
      {icon === 'arrow' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

function ButtonGhost({ children, onClick, size = 'md' }: {
  children: React.ReactNode; onClick?: () => void; size?: 'sm' | 'md' | 'lg'
}) {
  const pad = { sm: '8px 16px', md: '12px 22px', lg: '14px 28px' }[size]
  const fs = { sm: 13, md: 14, lg: 15 }[size]
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: pad, background: 'transparent', color: 'var(--c-text)',
      border: '1px solid var(--c-border)', borderRadius: 999,
      fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: fs,
      cursor: 'pointer', transition: 'border-color .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--c-border-strong)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--c-border)')}
    >
      {children}
    </button>
  )
}

function Glow() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        width: '70%', aspectRatio: '1/1', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(31,138,155,0.06),transparent 62%)',
        animation: 'ce-breathe 8s ease-in-out infinite',
      }} />
    </div>
  )
}

function ScribbleBrain({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden style={{ display: 'block' }}>
      <g stroke="var(--c-brand-scribble)" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28,60 C18,50 18,32 34,26 C40,16 58,14 66,24 C78,18 94,28 92,42 C100,50 98,66 86,72 C86,86 70,94 58,86 C46,94 30,86 30,74 C22,70 22,62 28,60 Z" />
        <path d="M40,42 C48,38 56,44 60,50" opacity=".7" />
        <path d="M66,56 C74,54 80,60 78,66" opacity=".7" />
        <path d="M46,66 C52,70 58,68 62,72" opacity=".6" />
        <path d="M54,30 C58,36 56,44 62,48" opacity=".5" />
        <circle cx="58" cy="58" r="1.8" fill="var(--c-brand-scribble)" stroke="none" opacity=".7" />
        <circle cx="72" cy="48" r="1.2" fill="var(--c-brand-scribble)" stroke="none" opacity=".6" />
        <circle cx="42" cy="56" r="1" fill="var(--c-brand-scribble)" stroke="none" opacity=".5" />
      </g>
    </svg>
  )
}

function AINote() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 18px',
      background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 14,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-brand-teal)" strokeWidth="1.6" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden>
        <path d="M12 2L14.5 8.5 21 11 14.5 13.5 12 20 9.5 13.5 3 11 9.5 8.5Z" />
      </svg>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1.55, color: 'var(--c-text-muted)' }}>
        <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>Basado en evidencia científica.</span>{' '}
        Cada explicación sigue el estilo de Cerebros Esponjosos. Aliis no reemplaza a tu médico — lo complementa.
      </div>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────

function AppNav({ onReset }: { onReset: () => void }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      background: 'color-mix(in srgb, var(--c-bg) 78%, transparent)',
      borderBottom: '1px solid var(--c-border)',
    }}>
      <div style={{
        maxWidth: '72rem', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', gap: 24,
      }}>
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        }}>
          <Image src="/assets/aliis-logo.png" alt="Aliis" width={30} height={30} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-.02em', color: 'var(--c-text)' }}>
            Aliis
          </span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em',
            textTransform: 'uppercase', color: 'var(--c-text-faint)',
          }}>
            Cerebros Esponjosos
          </span>
          <Capsule>Beta</Capsule>
        </div>
      </div>
    </header>
  )
}

// ─── Hero + formulario ────────────────────────────────────────

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section style={{
      position: 'relative', minHeight: '60vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 24px 80px', textAlign: 'center', overflow: 'hidden',
    }}>
      <Glow />
      <div className="ce-fade" style={{ position: 'relative', maxWidth: '52rem' }}>
        <Eyebrow centered style={{ marginBottom: 26 }}>· Aliis · AI Assistant de salud cerebral ·</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          lineHeight: .95, letterSpacing: '-.03em',
          margin: '0 0 28px', color: 'var(--c-text)',
        }}>
          Entiende<br />
          <em style={{ color: 'var(--c-text-faint)' }}>tu diagnóstico.</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.75,
          color: 'var(--c-text-muted)', maxWidth: '40rem', margin: '0 auto 40px',
        }}>
          Cuéntale a Aliis lo que te dijo el neurólogo. Te devuelve una explicación clara,{' '}
          con referencias verificables, y te acompaña hasta la siguiente consulta.{' '}
          <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--c-text)' }}>
            No reemplaza a tu médico — lo complementa.
          </em>
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <ButtonPrimary onClick={onStart} icon="arrow" size="lg">Pregúntale a Aliis</ButtonPrimary>
          <ButtonGhost size="lg">Cómo funciona</ButtonGhost>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
          <Capsule tone="teal">✓ Basado en evidencia</Capsule>
          <Capsule>✓ Referencias verificables</Capsule>
          <Capsule>✓ No reemplaza a tu médico</Capsule>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ScribbleBrain size={90} />
        </div>
      </div>
    </section>
  )
}

// ─── Formulario ───────────────────────────────────────────────

function Formulario({
  diagnostico, setDiagnostico,
  contexto, setContexto,
  loading, error,
  onSubmit,
}: {
  diagnostico: string; setDiagnostico: (v: string) => void
  contexto: string; setContexto: (v: string) => void
  loading: boolean; error: string | null
  onSubmit: (e: React.FormEvent) => void
}) {
  const formRef = useRef<HTMLDivElement>(null)

  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '80px 24px 100px', position: 'relative', overflow: 'hidden' }}>
      <Glow />
      <div style={{ maxWidth: '44rem', margin: '0 auto', position: 'relative' }}>
        <Eyebrow style={{ marginBottom: 16, textAlign: 'center' }}>· Modo consulta ·</Eyebrow>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)',
          lineHeight: 1.08, letterSpacing: '-.02em',
          margin: '0 0 8px', textAlign: 'center',
        }}>
          Cuéntamelo{' '}
          <em style={{ color: 'var(--c-text-faint)' }}>como se lo dirías a un amigo.</em>
        </h2>
        <p style={{
          textAlign: 'center', fontFamily: 'var(--font-sans)',
          fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 40,
          maxWidth: '38ch', marginLeft: 'auto', marginRight: 'auto',
        }}>
          Aliis traduce el lenguaje médico, cita sus fuentes y te prepara para la próxima consulta.
        </p>

        {/* Card formulario */}
        <div ref={formRef} style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 24,
          padding: 20,
          boxShadow: '0 1px 0 rgba(255,255,255,.5) inset',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--c-text-subtle)',
            }}>
              Pregúntale a Aliis
            </span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 13, color: 'var(--c-text-faint)',
            }}>
              toma 30 segundos
            </span>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {EJEMPLOS.map(ej => (
              <button key={ej} onClick={() => setDiagnostico(ej)} disabled={loading}
                style={{
                  background: diagnostico === ej ? 'var(--c-invert)' : 'transparent',
                  color: diagnostico === ej ? 'var(--c-invert-fg)' : 'var(--c-text-muted)',
                  border: `1px solid ${diagnostico === ej ? 'var(--c-invert)' : 'var(--c-border)'}`,
                  padding: '6px 12px', borderRadius: 999,
                  fontFamily: 'var(--font-sans)', fontSize: 12,
                  cursor: 'pointer', transition: 'all .15s',
                }}>
                {ej}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit}>
            {/* Textarea diagnóstico */}
            <div style={{
              background: 'var(--c-bg)', border: '1px solid var(--c-border)',
              borderRadius: 14, marginBottom: 12, overflow: 'hidden',
            }}>
              <label htmlFor="diagnostico" style={{
                display: 'block', padding: '12px 16px 4px',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-text-subtle)',
              }}>
                ¿Cuál es tu diagnóstico?
              </label>
              <textarea
                id="diagnostico"
                rows={3}
                value={diagnostico}
                onChange={e => setDiagnostico(e.target.value)}
                placeholder="Ej: Migraña con aura. Me recetaron sumatriptán 50mg…"
                maxLength={500}
                disabled={loading}
                style={{
                  width: '100%', border: 'none', background: 'transparent',
                  padding: '4px 16px 14px',
                  fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5,
                  color: diagnostico ? 'var(--c-text)' : 'var(--c-text-faint)',
                  fontStyle: diagnostico ? 'normal' : 'italic',
                  resize: 'none', outline: 'none',
                }}
              />
            </div>

            {/* Textarea contexto */}
            <div style={{
              background: 'var(--c-bg)', border: '1px solid var(--c-border)',
              borderRadius: 14, marginBottom: 14, overflow: 'hidden',
            }}>
              <label htmlFor="contexto" style={{
                display: 'block', padding: '12px 16px 4px',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-text-subtle)',
              }}>
                Contexto adicional <span style={{ color: 'var(--c-text-faint)' }}>(opcional)</span>
              </label>
              <textarea
                id="contexto"
                rows={2}
                value={contexto}
                onChange={e => setContexto(e.target.value)}
                placeholder="Edad, síntomas, medicación que te recetaron…"
                maxLength={300}
                disabled={loading}
                style={{
                  width: '100%', border: 'none', background: 'transparent',
                  padding: '4px 16px 14px',
                  fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.6,
                  color: contexto ? 'var(--c-text)' : 'var(--c-text-faint)',
                  fontStyle: contexto ? 'normal' : 'italic',
                  resize: 'none', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-text-faint)',
              }}>
                Privado · No se comparte
              </span>
              <button type="submit" disabled={!diagnostico.trim() || loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px',
                  background: !diagnostico.trim() || loading ? 'var(--c-surface)' : 'var(--c-invert)',
                  color: !diagnostico.trim() || loading ? 'var(--c-text-faint)' : 'var(--c-invert-fg)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14,
                  cursor: diagnostico.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all .2s',
                }}>
                {loading ? (
                  <>
                    <svg className="spinning" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ animation: 'ce-spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                    </svg>
                    Analizando…
                  </>
                ) : (
                  <>
                    Pedir explicación
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <p style={{ marginTop: 16, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 14, color: '#c43b3b' }}>
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

// ─── Loading state ────────────────────────────────────────────

function LoadingState() {
  const stages = [
    { t: 'Leyendo el diagnóstico', i: 'identificando condición y contexto.' },
    { t: 'Buscando evidencia', i: 'guías clínicas · mecanismos · pronóstico.' },
    { t: 'Adaptando al caso', i: 'en lenguaje humano, sin perder el rigor.' },
    { t: 'Escribiendo las preguntas', i: 'para tu próxima consulta.' },
    { t: 'Dando el último repaso', i: 'para que se lea bien.' },
  ]
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setStage(s => s < stages.length - 1 ? s + 1 : s), 1600)
    return () => clearInterval(interval)
  }, [stages.length])

  return (
    <section style={{
      borderTop: '1px solid var(--c-border)', padding: '80px 24px 100px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <Glow />
      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '42rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ animation: 'ce-spin 10s linear infinite', position: 'absolute', inset: 0 }} aria-hidden>
              <circle cx="60" cy="60" r="56" fill="none" stroke="var(--c-border)" strokeWidth="1" strokeDasharray="4 6" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScribbleBrain size={72} />
            </div>
          </div>
        </div>
        <Eyebrow centered style={{ marginBottom: 18 }}>· Destilando ·</Eyebrow>
        <h2 key={stage} className="ce-fade" style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)',
          lineHeight: 1.08, letterSpacing: '-.02em',
          margin: '0 0 44px',
        }}>
          {stages[stage].t}.{' '}
          <em style={{ color: 'var(--c-text-faint)' }}>{stages[stage].i}</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
          {stages.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: i === stage ? 'var(--c-surface)' : 'transparent',
              border: `1px solid ${i === stage ? 'var(--c-border-strong)' : 'transparent'}`,
              borderRadius: 12,
              opacity: i > stage ? .4 : 1,
              transition: 'all .4s',
            }}>
              <div style={{ width: 16, height: 16, flexShrink: 0 }}>
                {i < stage ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-brand-teal)" strokeWidth="2.2" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
                ) : i === stage ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-text)" strokeWidth="2" style={{ animation: 'ce-spin 1s linear infinite' }} aria-hidden><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /></svg>
                ) : (
                  <div style={{ width: 10, height: 10, borderRadius: 999, border: '1px solid var(--c-border-strong)', margin: 3 }} />
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: i === stage ? 'var(--c-text)' : 'var(--c-text-muted)' }}>{s.t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pack resultado ───────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*[^*]+\*)/g)
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*')
      ? <em key={i} style={{ fontFamily: 'var(--font-serif)', color: 'var(--c-text)' }}>{p.slice(1, -1)}</em>
      : p
  )
}

function PackResult({ resultado, diagnostico, onReset }: {
  resultado: DiagnosticoResponse; diagnostico: string; onReset: () => void
}) {
  const chapters = [
    {
      n: '01', kicker: 'Qué es', kickerItalic: 'y por qué pasa.',
      content: resultado.que_es, type: 'paragraphs' as const,
    },
    {
      n: '02', kicker: 'Cómo funciona', kickerItalic: 'por dentro.',
      content: resultado.como_funciona, type: 'paragraphs' as const,
    },
    {
      n: '03', kicker: 'Qué puedes esperar', kickerItalic: 'en el tiempo.',
      content: resultado.que_esperar, type: 'paragraphs' as const,
    },
    {
      n: '04', kicker: 'Preguntas para', kickerItalic: 'tu próxima consulta.',
      content: resultado.preguntas_para_medico, type: 'questions' as const,
    },
    {
      n: '05', kicker: 'Cuándo buscar', kickerItalic: 'atención urgente.',
      content: resultado.senales_de_alarma, type: 'alarms' as const,
    },
    {
      n: '06', kicker: 'Algo que mucha gente', kickerItalic: 'malentiende.',
      content: resultado.mito_frecuente, type: 'callout' as const,
    },
  ]

  return (
    <article style={{ maxWidth: '42rem', margin: '0 auto', padding: '80px 24px 120px' }} className="ce-fade">
      {/* Header del pack */}
      <Eyebrow style={{ marginBottom: 24, textAlign: 'center' }}>
        · Explicación · {resultado.diagnostico_recibido} ·
      </Eyebrow>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
        lineHeight: 1.02, letterSpacing: '-.025em',
        margin: '0 0 24px', textAlign: 'center',
      }}>
        {resultado.diagnostico_recibido},{' '}
        <em style={{ color: 'var(--c-text-faint)' }}>explicado.</em>
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
        <AINote />
      </div>

      {/* Capítulos */}
      {chapters.map((ch, i) => (
        <section key={ch.n} style={{
          marginTop: i === 0 ? 0 : 80,
          paddingTop: i === 0 ? 0 : 48,
          borderTop: i === 0 ? 'none' : '1px solid var(--c-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 18 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: 'var(--c-text-faint)' }}>
              CAPÍTULO {ch.n}
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
            lineHeight: 1.08, letterSpacing: '-.02em',
            margin: '0 0 24px',
          }}>
            {ch.kicker}{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>{ch.kickerItalic}</em>
          </h2>

          {ch.type === 'paragraphs' && (
            <div>
              {(ch.content as string).split('\n\n').filter(Boolean).map((p, j) => (
                <p key={j} style={{
                  fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.8,
                  color: 'var(--c-text)', margin: '0 0 18px',
                }}>
                  {renderInline(p)}
                </p>
              ))}
            </div>
          )}

          {ch.type === 'callout' && (
            <div style={{
              padding: '22px 26px',
              background: 'var(--c-bg)',
              border: '1px solid var(--c-border-strong)',
              borderRadius: 16,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '.2em', textTransform: 'uppercase',
                color: 'var(--c-text-subtle)', marginBottom: 12,
              }}>
                El malentendido frecuente
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.5, color: 'var(--c-text)' }}>
                {ch.content as string}
              </div>
            </div>
          )}

          {ch.type === 'questions' && (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(ch.content as string[]).map((q, j) => (
                <li key={j} style={{
                  display: 'flex', gap: 16,
                  padding: '16px 0',
                  borderTop: j === 0 ? '1px solid var(--c-border)' : 'none',
                  borderBottom: '1px solid var(--c-border)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--c-text-faint)', minWidth: 24,
                  }}>
                    {String(j + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.45, color: 'var(--c-text)', flex: 1 }}>
                    {q}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {ch.type === 'alarms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(ch.content as string[]).map((a, j) => (
                <div key={j} style={{
                  padding: '16px 18px',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 14,
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <div style={{
                    flexShrink: 0, marginTop: 6,
                    width: 10, height: 10, borderRadius: 999,
                    background: j === 0 ? '#c43b3b' : 'var(--c-brand-teal)',
                  }} />
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.5, color: 'var(--c-text)' }}>
                    {a}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Nota final */}
      <section style={{ marginTop: 80, paddingTop: 48, borderTop: '1px solid var(--c-border)' }}>
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 22, lineHeight: 1.5,
          color: 'var(--c-text-muted)',
          textAlign: 'center', maxWidth: '36ch', margin: '0 auto 48px',
        }}>
          "{resultado.nota_final}"
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ScribbleBrain size={64} />
        </div>
      </section>

      {/* Disclaimer + reset */}
      <div style={{ marginTop: 48, textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          textTransform: 'uppercase', letterSpacing: '.18em',
          color: 'var(--c-text-faint)', marginBottom: 24,
        }}>
          Aliis no sustituye a tu neurólogo · Basado en evidencia · Cerebros Esponjosos
        </p>
        <ButtonGhost onClick={onReset}>← Nueva consulta</ButtonGhost>
      </div>
    </article>
  )
}

// ─── What Aliis does (landing section) ───────────────────────

function WhatAliisDoes() {
  const items = [
    { n: '01', t: 'Traduce', i: 'lo que te dijeron', d: 'Del lenguaje médico al tuyo. Sin inflar, sin asustar. Pensado para que lo lea un familiar que nunca abrió un libro de medicina.' },
    { n: '02', t: 'Cita sus fuentes,', i: 'siempre', d: 'Cada explicación sigue el estilo Cerebros Esponjosos — conversacional con evidencia real detrás. Si no hay evidencia, Aliis te lo dice.' },
    { n: '03', t: 'Prepara tu próxima', i: 'consulta', d: 'Diez preguntas que importan, escritas para que las copies tal cual. Aliis estudia tu diagnóstico y sugiere qué contarle al neurólogo.' },
    { n: '04', t: 'Te avisa', i: 'cuando algo no cuadra', d: 'Señales de alarma sin alarmismo. Cuándo vuelves a urgencias, cuándo llamas, cuándo respiras y esperas a la cita.' },
  ]
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '100px 24px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ marginBottom: 64, maxWidth: '46rem' }}>
          <Eyebrow style={{ marginBottom: 18 }}>· Qué hace Aliis ·</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4.4vw, 3.25rem)',
            lineHeight: 1.05, letterSpacing: '-.02em', margin: 0,
          }}>
            Un asistente.{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>No un buscador de síntomas a las 2am.</em>
          </h2>
        </div>
        <div style={{ borderTop: '1px solid var(--c-border)' }}>
          {items.map((it, i) => (
            <article key={i} style={{
              padding: '32px 0',
              borderBottom: '1px solid var(--c-border)',
              display: 'grid',
              gridTemplateColumns: '3rem 1fr 1fr',
              gap: '0 48px',
              alignItems: 'start',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: 'var(--c-text-faint)', paddingTop: 4 }}>{it.n}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.15, letterSpacing: '-.015em', margin: 0 }}>
                {it.t}{' '}<em style={{ color: 'var(--c-text-faint)' }}>{it.i}</em>
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.7, color: 'var(--c-text-muted)', margin: 0 }}>{it.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Trust section ────────────────────────────────────────────

function TrustSection() {
  const pillars = [
    {
      eyebrow: 'Evidencia',
      title: 'Basado en evidencia científica',
      body: 'Cada explicación de Aliis sigue el rigor de Cerebros Esponjosos — la misma voz, la misma obsesión por explicar bien lo difícil, con la ciencia detrás.',
      stat: '312k', statLabel: 'siguen @cerebros.esponjosos',
    },
    {
      eyebrow: 'Límite',
      title: 'No reemplaza a tu médico',
      body: 'Disclaimer visible en cada pantalla. Aliis es preparación y acompañamiento, no diagnóstico. En cada respuesta aparece qué debes preguntarle a tu neurólogo.',
      stat: '100%', statLabel: 'respuestas con disclaimer',
    },
    {
      eyebrow: 'Origen',
      title: 'Construido por Cerebros Esponjosos',
      body: 'El proyecto de divulgación en neurología creado por médicos residentes. Aliis es su forma de llegar a tu consulta.',
      stat: '2', statLabel: 'médicos residentes detrás',
    },
  ]
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '100px 24px', background: 'var(--c-surface)' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64, maxWidth: '44rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <Eyebrow centered style={{ marginBottom: 18 }}>· Por qué confiar ·</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4.4vw, 3.25rem)',
            lineHeight: 1.04, letterSpacing: '-.02em', margin: 0,
          }}>
            Una IA médica merece{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>más escrutinio, no menos.</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {pillars.map((p, i) => (
            <article key={i} style={{
              padding: '36px 32px 40px',
              background: 'var(--c-bg)',
              border: '1px solid var(--c-border)',
              borderRadius: 20,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em',
                textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 20,
              }}>
                · {p.eyebrow} ·
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.2, letterSpacing: '-.015em', margin: '0 0 14px' }}>{p.title}</h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7, color: 'var(--c-text-muted)', margin: '0 0 28px' }}>{p.body}</p>
              <div style={{ paddingTop: 20, borderTop: '1px solid var(--c-border)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', lineHeight: 1, color: 'var(--c-text)' }}>{p.stat}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-faint)', marginTop: 4 }}>{p.statLabel}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--c-border)', padding: '72px 24px 36px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 48 }}>
          <div style={{ maxWidth: '28rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Image src="/assets/aliis-logo.png" alt="Aliis" width={40} height={40} style={{ objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-.02em', color: 'var(--c-text)' }}>Aliis</span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--c-text-faint)', margin: 0, lineHeight: 1.55 }}>
              Tu AI Assistant de salud cerebral. Un producto de Cerebros Esponjosos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 56, fontFamily: 'var(--font-sans)', fontSize: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 4 }}>Producto</div>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Cómo funciona</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Ejemplo real</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 4 }}>Cerebros Esponjosos</div>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Instagram</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Newsletter</a>
            </div>
          </div>
        </div>
        <div style={{
          paddingTop: 24, borderTop: '1px solid var(--c-border)',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
          letterSpacing: '.2em', color: 'var(--c-text-faint)',
        }}>
          <span>© 2026 · Cerebros Esponjosos</span>
          <span>Aliis no sustituye a tu neurólogo</span>
          <span>Basado en evidencia</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Page root ────────────────────────────────────────────────

type AppState = 'landing' | 'form' | 'loading' | 'result'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing')
  const [diagnostico, setDiagnostico] = useState('')
  const [contexto, setContexto] = useState('')
  const [resultado, setResultado] = useState<DiagnosticoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  function handleReset() {
    setAppState('landing')
    setResultado(null)
    setError(null)
    setDiagnostico('')
    setContexto('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleStartFromHero() {
    setAppState('form')
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!diagnostico.trim()) return

    setAppState('loading')
    setError(null)

    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico, contexto }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ocurrió un error inesperado')
        setAppState('form')
        return
      }
      setResultado(data)
      setAppState('result')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch {
      setError('No se pudo conectar. Verifica tu conexión e intenta de nuevo.')
      setAppState('form')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav onReset={handleReset} />

      {/* Landing sections — always visible unless result */}
      {appState !== 'result' && (
        <>
          <Hero onStart={handleStartFromHero} />
          <div ref={formRef}>
            <Formulario
              diagnostico={diagnostico}
              setDiagnostico={setDiagnostico}
              contexto={contexto}
              setContexto={setContexto}
              loading={appState === 'loading'}
              error={error}
              onSubmit={handleSubmit}
            />
          </div>
          {appState === 'loading' && <LoadingState />}
          <WhatAliisDoes />
          <TrustSection />
          <Footer />
        </>
      )}

      {/* Result */}
      {appState === 'result' && resultado && (
        <div ref={resultRef}>
          <PackResult resultado={resultado} diagnostico={diagnostico} onReset={handleReset} />
          <Footer />
        </div>
      )}
    </div>
  )
}
