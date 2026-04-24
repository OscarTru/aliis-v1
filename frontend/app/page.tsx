'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AppNav } from '../components/AppNav'
import { Footer } from '../components/Footer'
import { LoginModal } from '../components/LoginModal'
import { Eyebrow } from '../components/ui/Eyebrow'
import { Capsule } from '../components/ui/Capsule'
import { Glow } from '../components/ui/Glow'
import { PRICING_TIERS } from '../lib/mock-data'

// ─── Hero ─────────────────────────────────────────────────────

function InputPreview({ onCTA }: { onCTA: () => void }) {
  const [mode, setMode] = useState<'pegar' | 'foto' | 'voz' | 'buscar'>('pegar')
  const previews = {
    pegar: 'Dx: migraña con aura. Indico sumatriptán 50mg según pauta. Control en 6 semanas…',
    foto: 'Arrastra aquí una foto de la receta, o haz clic para elegir del rollo.',
    voz: 'Pulsa y dicta lo que te dijo el médico. También puedes subir un audio de la consulta.',
    buscar: 'Busca tu diagnóstico: migraña, epilepsia, esclerosis múltiple…',
  }
  return (
    <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 24, padding: 20, boxShadow: '0 1px 0 rgba(255,255,255,.5) inset' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--c-text-subtle)' }}>Pregúntale a Aliis</span>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-faint)' }}>toma 30 segundos</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {([
          { id: 'foto', l: 'Foto de receta' },
          { id: 'pegar', l: 'Pegar texto' },
          { id: 'voz', l: 'Dictar' },
          { id: 'buscar', l: 'Buscar' },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setMode(t.id)}
            style={{
              background: mode === t.id ? 'var(--c-invert)' : 'transparent',
              color: mode === t.id ? 'var(--c-invert-fg)' : 'var(--c-text-muted)',
              border: `1px solid ${mode === t.id ? 'var(--c-invert)' : 'var(--c-border)'}`,
              padding: '6px 12px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}>
            {t.l}
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 14, padding: 16, minHeight: 120, fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.5, color: 'var(--c-text-faint)', fontStyle: 'italic' }}>
        {previews[mode]}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--c-text-faint)' }}>Privado · No se comparte</span>
        <button onClick={onCTA}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'var(--c-invert)', color: 'var(--c-invert-fg)',
            border: 'none', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, cursor: 'pointer',
          }}>
          Pedir explicación
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  )
}

function Hero({ onCTA }: { onCTA: () => void }) {
  return (
    <section style={{ position: 'relative', padding: '80px 24px 100px', overflow: 'hidden' }}>
      <Glow />
      <div style={{ position: 'relative', maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 56, alignItems: 'center' }}>
        <div className="ce-fade">
          <Eyebrow style={{ marginBottom: 22 }}>· AI Assistant · Salud cerebral ·</Eyebrow>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.75rem,5.8vw,4.75rem)', lineHeight: .98, letterSpacing: '-.028em', margin: '0 0 24px' }}>
            Tu cerebro tiene preguntas.{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>Aliis las responde con evidencia.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.7, color: 'var(--c-text-muted)', maxWidth: '38ch', margin: '0 0 32px' }}>
            Le cuentas a Aliis lo que te dijo el neurólogo. Te devuelve una explicación clara, con referencias verificables, y te acompaña hasta la siguiente consulta.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <button onClick={onCTA}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'var(--c-invert)', color: 'var(--c-invert-fg)',
                border: 'none', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, cursor: 'pointer',
              }}>
              Pregúntale a Aliis
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <a href="/dashboard"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'transparent', color: 'var(--c-text)',
                border: '1px solid var(--c-border)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15,
                textDecoration: 'none', cursor: 'pointer',
              }}>
              Ver un ejemplo
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Capsule tone="teal">✓ Basado en evidencia</Capsule>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--c-text-muted)' }}>Cada dato con su referencia · PubMed, DOI, guías clínicas</span>
          </div>
        </div>
        <InputPreview onCTA={onCTA} />
      </div>
    </section>
  )
}

// ─── Qué hace Aliis ───────────────────────────────────────────

function WhatAliisDoes() {
  const items = [
    { n: '01', t: 'Traduce', i: 'lo que te dijeron', d: 'Del lenguaje médico al tuyo. Sin inflar, sin asustar. Pensado para que lo lea un familiar que nunca abrió un libro de medicina.' },
    { n: '02', t: 'Cita sus fuentes,', i: 'siempre', d: 'Cada afirmación lleva su referencia desplegable. PubMed, DOI, guías clínicas oficiales. Si no hay evidencia, Aliis te lo dice.' },
    { n: '03', t: 'Prepara tu próxima', i: 'consulta', d: 'Diez preguntas que importan, escritas para que las copies tal cual. Aliis estudia tu diario de síntomas y sugiere qué contarle al neurólogo.' },
    { n: '04', t: 'Te avisa', i: 'cuando algo no cuadra', d: 'Señales de alarma sin alarmismo. Cuándo vuelves a urgencias, cuándo llamas, cuándo respiras y esperas a la cita.' },
    { n: '05', t: 'Aprende', i: 'contigo', d: 'Guarda tus diagnósticos, cruza síntomas, recuerda fármacos. Cada pregunta nueva llega con el contexto de todas las anteriores.' },
  ]
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '120px 24px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ marginBottom: 64, maxWidth: '46rem' }}>
          <Eyebrow style={{ marginBottom: 18 }}>· Qué hace Aliis ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem,4.6vw,3.5rem)', lineHeight: 1.04, letterSpacing: '-.02em', margin: 0 }}>
            Un asistente.{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>No un buscador de síntomas a las 2am.</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', borderTop: '1px solid var(--c-border)' }}>
          {items.map((it, i) => (
            <article key={i} style={{ padding: '32px 28px 36px', borderBottom: '1px solid var(--c-border)', borderRight: i < items.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: 'var(--c-text-faint)', marginBottom: 18 }}>{it.n}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.15, letterSpacing: '-.015em', margin: '0 0 14px' }}>
                {it.t} <em style={{ color: 'var(--c-text-faint)' }}>{it.i}</em>
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7, color: 'var(--c-text-muted)', margin: 0 }}>{it.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Cómo funciona ────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { n: 'Le cuentas', t: 'lo que te dijeron', d: 'Texto, foto de la receta, o audio. Aliis extrae el diagnóstico y los fármacos.' },
    { n: 'Aliis responde', t: 'con referencias', d: 'Explicación clara, con cada afirmación citada. Desplegable para ver la fuente cuando quieras comprobar.' },
    { n: 'Vuelves cuando', t: 'te surjan dudas', d: 'Aliis recuerda tu caso. Cada nueva pregunta llega con tu contexto médico completo.' },
  ]
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '120px 24px', background: 'var(--c-surface)' }}>
      <div style={{ maxWidth: '60rem', margin: '0 auto', textAlign: 'center' }}>
        <Eyebrow centered style={{ marginBottom: 22 }}>· Cómo funciona ·</Eyebrow>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4.4vw,3.25rem)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '0 0 72px' }}>
          Tres pasos.{' '}
          <em style={{ color: 'var(--c-text-faint)' }}>Ninguno te pide matricularte en medicina.</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 40, textAlign: 'left' }}>
          {steps.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: 'var(--c-brand-teal-deep)', marginBottom: 16 }}>0{i + 1}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.15, letterSpacing: '-.015em', margin: '0 0 12px' }}>
                {s.n} <em style={{ color: 'var(--c-text-faint)' }}>{s.t}</em>
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7, color: 'var(--c-text-muted)', margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Trust section ────────────────────────────────────────────

function TrustSection() {
  const pillars = [
    { eyebrow: 'Evidencia', title: 'Basado en evidencia científica', body: 'Cada afirmación de Aliis viene con su referencia desplegable — PubMed, DOI, guías clínicas oficiales. Si no hay evidencia que soporte una respuesta, Aliis lo dice.', stat: '14,800', statLabel: 'referencias indexadas' },
    { eyebrow: 'Límite', title: 'No reemplaza a tu médico', body: 'Disclaimer visible en cada pantalla. Aliis es preparación y acompañamiento, no diagnóstico. En cada respuesta aparece qué debes preguntarle a tu neurólogo.', stat: '100%', statLabel: 'respuestas con disclaimer' },
    { eyebrow: 'Origen', title: 'Construido por Cerebros Esponjosos', body: 'El proyecto de divulgación en neurología que ya sigues en redes. La misma voz, la misma obsesión por explicar bien lo difícil. Aliis es su forma de llegar a tu consulta.', stat: '312k', statLabel: 'siguen @cerebros.esponjosos' },
  ]
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '120px 24px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72, maxWidth: '44rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <Eyebrow centered style={{ marginBottom: 18 }}>· Por qué confiar ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem,4.6vw,3.5rem)', lineHeight: 1.04, letterSpacing: '-.02em', margin: 0 }}>
            Una IA médica merece{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>más escrutinio, no menos.</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
          {pillars.map((p, i) => (
            <article key={i} style={{ padding: '36px 32px 40px', background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 20 }}>· {p.eyebrow} ·</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.2, letterSpacing: '-.015em', margin: '0 0 14px' }}>{p.title}</h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7, color: 'var(--c-text-muted)', margin: '0 0 28px' }}>{p.body}</p>
              <div style={{ paddingTop: 20, borderTop: '1px solid var(--c-border)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', lineHeight: 1 }}>{p.stat}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-faint)', marginTop: 4 }}>{p.statLabel}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Live example ─────────────────────────────────────────────

function LiveExample() {
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '120px 24px', background: 'var(--c-surface)' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: '42rem' }}>
          <Eyebrow style={{ marginBottom: 18 }}>· Así responde Aliis ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.08, letterSpacing: '-.02em', margin: 0 }}>
            Una pregunta real.{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>Con la fuente abierta.</em>
          </h2>
        </div>
        <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 20, overflow: 'hidden' }}>
          {/* User question */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--c-border)', display: 'flex', gap: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--c-border-strong)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-text-muted)' }}>TÚ</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-subtle)', marginBottom: 4 }}>María · hace 2 minutos</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.55 }}>
                Me dieron sumatriptán 50mg. ¿Cuándo funciona mejor — al empezar el aura, o ya con dolor?
              </div>
            </div>
          </div>
          {/* Aliis answer */}
          <div style={{ padding: '24px 32px', display: 'flex', gap: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--c-text)', color: 'var(--c-bg)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em' }}>◐</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 6 }}>Aliis · basado en 3 fuentes</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.65, marginBottom: 18 }}>
                Sumatriptán funciona mejor <em>al inicio del dolor, no durante el aura</em>.
                <sup style={{ color: 'var(--c-brand-teal-deep)', fontSize: 12, marginLeft: 2 }}>[1]</sup>{' '}
                Tomarlo antes —en fase de aura— no aumenta la eficacia y puede retrasar tu siguiente dosis si el dolor llega más tarde.
                <sup style={{ color: 'var(--c-brand-teal-deep)', fontSize: 12, marginLeft: 2 }}>[2]</sup>
              </div>
              <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 12, padding: '16px 18px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-brand-teal-deep)', letterSpacing: '.15em' }}>[1]</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500 }}>Bates D et al, Neurology (1994)</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--c-text-subtle)', letterSpacing: '.12em' }}>DOI 10.1212/WNL.44.9.1587</span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-muted)', lineHeight: 1.55, paddingLeft: 12, borderLeft: '2px solid var(--c-border)' }}>
                  "Sumatriptan administered during the aura phase was not significantly more effective than placebo. Administration at headache onset showed 70% response at 2h."
                </div>
              </div>
              <div style={{ background: 'var(--c-surface)', border: '1px dashed var(--c-border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', color: 'var(--c-text-faint)' }}>[2] Olesen J, Cephalalgia (2004) · ver referencia →</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-faint)' }}>Disclaimer: consulta siempre la pauta de tu neurólogo.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Founders ─────────────────────────────────────────────────

function Founders() {
  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '120px 24px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: 60, alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden', background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <Image src="/assets/oscar.png" alt="Oscar" width={300} height={375} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden', background: 'var(--c-surface)', border: '1px solid var(--c-border)', marginTop: 32 }}>
            <Image src="/assets/stephanie.png" alt="Stephanie" width={300} height={375} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
        <div>
          <Eyebrow style={{ marginBottom: 20 }}>· Detrás del proyecto ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '0 0 24px' }}>
            Por los mismos que llevas tiempo leyendo{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>en Cerebros Esponjosos.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.8, color: 'var(--c-text-muted)', margin: '0 0 20px' }}>
            Oscar y Stephanie llevan años en neurología — y años explicando lo mismo en consulta. Construyeron Aliis para escalar lo que ya hacen en redes: traducir el lenguaje médico sin perder el rigor.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--c-border)' }}>
            <Capsule tone="teal">Un producto de Cerebros Esponjosos</Capsule>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--c-text-faint)' }}>@cerebros.esponjosos</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing inline ───────────────────────────────────────────

function PricingSection({ onCTA }: { onCTA: () => void }) {
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'MXN'>('EUR')
  const t = PRICING_TIERS

  return (
    <section style={{ borderTop: '1px solid var(--c-border)', padding: '120px 24px', background: 'var(--c-surface)' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Eyebrow centered style={{ marginBottom: 22 }}>· Precios · transparentes ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem,5.5vw,4rem)', lineHeight: 1, letterSpacing: '-.03em', margin: '0 0 16px' }}>
            Menos que un café <em style={{ color: 'var(--c-text-faint)' }}>al mes.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.45, color: 'var(--c-text-muted)', maxWidth: '38ch', margin: '0 auto' }}>
            "No queremos que pienses el precio. Queremos que lo pagues y te olvides."
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 999 }}>
            {(['EUR', 'USD', 'MXN'] as const).map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                style={{
                  background: currency === c ? 'var(--c-invert)' : 'transparent',
                  color: currency === c ? 'var(--c-invert-fg)' : 'var(--c-text-muted)',
                  border: 'none', padding: '7px 16px', borderRadius: 999,
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', cursor: 'pointer',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, marginBottom: 56 }}>
          {([t.gratis, t.pro] as const).map((tier) => (
            <article key={tier.name}
              style={{
                position: 'relative', padding: '36px 36px 40px',
                background: tier.highlight ? 'var(--c-bg)' : 'transparent',
                border: `1px solid ${tier.highlight ? 'var(--c-text)' : 'var(--c-border)'}`,
                borderRadius: 24, display: 'flex', flexDirection: 'column',
              }}>
              {tier.highlight && (
                <div style={{ position: 'absolute', top: -12, left: 32, padding: '4px 12px', background: 'var(--c-text)', color: 'var(--c-bg)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>
                  Nuestra recomendación
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <Capsule tone={tier.highlight ? 'teal' : 'ghost'}>
                  {tier.highlight ? 'Referencias verificables' : 'Basado en evidencia'}
                </Capsule>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', margin: '0 0 8px', lineHeight: 1.05 }}>{tier.name}</h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--c-text-muted)', margin: '0 0 24px' }}>{tier.pitch}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 52, letterSpacing: '-.03em', lineHeight: 1 }}>{tier.prices[currency]}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>{tier.cadence}</span>
              </div>
              <div style={{ margin: '24px 0', height: 1, background: 'var(--c-border)' }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: f.included ? 1 : 0.4 }}>
                    <span style={{ flexShrink: 0, marginTop: 4, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {f.included
                        ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--c-brand-teal-deep)" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M3 7.5L6 10.5 11.5 4.5" /></svg>
                        : <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden><path d="M2 2l6 6M8 2l-6 6" /></svg>
                      }
                    </span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.4 }}>{f.text}</div>
                      {f.sub && <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--c-text-faint)', marginTop: 2 }}>{f.sub}</div>}
                    </div>
                  </li>
                ))}
              </ul>
              <button onClick={onCTA}
                style={{
                  padding: '13px 20px', borderRadius: 12,
                  background: tier.highlight ? 'var(--c-invert)' : 'transparent',
                  color: tier.highlight ? 'var(--c-invert-fg)' : 'var(--c-text)',
                  border: `1px solid ${tier.highlight ? 'var(--c-invert)' : 'var(--c-border)'}`,
                  fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {tier.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </article>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', paddingTop: 32, borderTop: '1px solid var(--c-border)' }}>
          {[
            { k: 'Cancelas cuando quieras', v: 'un click. Sin fricción.' },
            { k: '14 días a prueba', v: 'lo pagado vuelve si no convence.' },
            { k: 'Sin anuncios, nunca', v: 'tu diagnóstico no se vende.' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--c-text-subtle)', marginBottom: 4 }}>{item.k}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--c-text-muted)' }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page root ────────────────────────────────────────────────

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav />
      <Hero onCTA={() => setShowLogin(true)} />
      <WhatAliisDoes />
      <HowItWorks />
      <TrustSection />
      <LiveExample />
      <Founders />
      <PricingSection onCTA={() => setShowLogin(true)} />
      <Footer />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
