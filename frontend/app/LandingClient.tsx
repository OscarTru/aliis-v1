'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AppNav } from '../components/AppNav'
import { Footer } from '../components/Footer'
import { LoginModal } from '../components/LoginModal'
import { Eyebrow } from '../components/ui/Eyebrow'
import { Capsule } from '../components/ui/Capsule'
import { Glow } from '../components/ui/Glow'
import { PRICING_TIERS } from '../lib/mock-data'
import { createClient } from '../lib/supabase'

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
              background: mode === t.id ? 'hsl(var(--secondary))' : 'transparent',
              color: mode === t.id ? 'hsl(var(--secondary-foreground))' : 'var(--c-text-muted)',
              boxShadow: mode === t.id ? '0 0 0 1px rgba(31,138,155,.3)' : 'none',
              border: `1px solid ${mode === t.id ? 'transparent' : 'var(--c-border)'}`,
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
            padding: '10px 20px', background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))',
            boxShadow: '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)',
            border: 'none', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, cursor: 'pointer',
            transition: 'opacity .15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Pedir explicación
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  )
}

function Hero({ onCTA, onVerEjemplo }: { onCTA: () => void; onVerEjemplo: () => void }) {
  return (
    <section style={{ position: 'relative', padding: '80px 24px 100px', overflow: 'hidden' }}>
      <Glow />
      <div className="relative max-w-[72rem] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_.9fr] gap-8 md:gap-14 items-center">
        <div className="ce-fade">
          <Eyebrow style={{ marginBottom: 22 }}>· AI Assistant · Salud cerebral ·</Eyebrow>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.75rem,5.8vw,4.75rem)', lineHeight: .98, letterSpacing: '-.028em', margin: '0 0 24px' }}>
            Saliste de la consulta sin entender nada.{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>Aliis no te deja solo.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.75, color: 'var(--c-text-muted)', maxWidth: '38ch', margin: '0 0 32px' }}>
            Aliis te acompaña de la consulta a lo que sigue. Tu expediente médico explicado capítulo a capítulo, con fuentes verificables, un diario de síntomas, Asistente IA por capítulo y más de 60 diagnósticos revisados por especialistas.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            <button onClick={onCTA}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))',
                boxShadow: '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)',
                border: 'none', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, cursor: 'pointer',
                transition: 'opacity .15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Entender mi diagnóstico →
            </button>
            <button onClick={onVerEjemplo}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'transparent', color: 'var(--c-text)',
                border: '1px solid rgba(31,138,155,.35)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15,
                cursor: 'pointer',
              }}>
              Ver un ejemplo real
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Capsule tone="teal">✓ Basado en evidencia · PubMed, DOI, guías clínicas</Capsule>
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
    { n: '01', t: 'Explica tu diagnóstico', i: 'capítulo a capítulo', d: 'Qué es, cómo funciona, qué esperar, señales de alarma, preguntas para tu médico. Todo en el lenguaje que necesitas, con la fuente detrás.' },
    { n: '02', t: 'Cada afirmación', i: 'viene con su fuente', d: 'PubMed, DOI, guías clínicas. Si no hay evidencia que soporte algo, Aliis te lo dice. Sin inventar nada.' },
    { n: '03', t: 'Pregúntale', i: 'lo que no quedó claro', d: 'Cada capítulo tiene su propio Asistente IA. Pregunta con tus palabras y Aliis responde en contexto — sin empezar de cero cada vez.' },
    { n: '04', t: 'Lleva tu diario', i: 'de síntomas y apuntes', d: 'Registra cómo te sientes día a día. Agrega apuntes a cada diagnóstico. Llega a tu próxima cita con todo ordenado.' },
    { n: '05', t: 'Explora la biblioteca', i: 'de diagnósticos', d: 'Más de 60 condiciones revisadas por especialistas. Neurología, cardiología, digestivo y más — organizadas para que encuentres lo que necesitas.' },
  ]
  return (
    <section id="que-hace" className="px-6 py-16 md:py-[120px]" style={{ borderTop: '1px solid var(--c-border)' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ marginBottom: 64, maxWidth: '46rem' }}>
          <Eyebrow style={{ marginBottom: 18 }}>· Qué hace Aliis ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem,4.6vw,3.5rem)', lineHeight: 1.04, letterSpacing: '-.02em', margin: 0 }}>
            Cinco cosas que necesitas{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>antes de tu próxima cita.</em>
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
    { n: 'Describes', t: 'tu diagnóstico', d: 'Pega el texto de la consulta, escribe el nombre, o busca entre más de 60 condiciones. Aliis lo identifica.' },
    { n: 'Recibes', t: 'tu expediente completo', d: 'Capítulos estructurados: qué es, cómo funciona, qué esperar, señales de alarma, preguntas para el médico. Cada dato con su fuente.' },
    { n: 'Sigues desde ahí', t: 'cuando lo necesitas', d: 'Tu diario, el Asistente IA por capítulo, la biblioteca. Todo en el mismo lugar, siempre disponible.' },
  ]
  return (
    <section id="como-funciona" className="px-6 py-16 md:py-[120px]" style={{ borderTop: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
      <div style={{ maxWidth: '60rem', margin: '0 auto', textAlign: 'center' }}>
        <Eyebrow centered style={{ marginBottom: 22 }}>· Cómo funciona ·</Eyebrow>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4.4vw,3.25rem)', lineHeight: 1.08, letterSpacing: '-.02em', margin: '0 0 72px' }}>
          Tres pasos y ya tienes{' '}
          <em style={{ color: 'var(--c-text-faint)' }}>una respuesta.</em>
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
    { eyebrow: 'Evidencia', title: 'Con fuente o no lo decimos', body: 'Cada capítulo cita su referencia — PubMed, DOI, guías clínicas. Despliégala cuando quieras. Si algo no tiene evidencia sólida, Aliis te lo dice antes que inventarse una respuesta.', stat: '+60', statLabel: 'condiciones con revisión especializada' },
    { eyebrow: 'Límite', title: 'Aliis no diagnostica. Explica.', body: 'Aliis es acompañamiento, no diagnóstico. En cada explicación viene lo que deberías preguntarle a tu médico — para que cada cita valga más y no salgas con más dudas que antes.', stat: '100%', statLabel: 'explicaciones con preguntas para tu médico' },
    { eyebrow: 'Origen', title: 'Por médicos que ya conoces', body: 'Oscar y Stephanie son residentes de neurología que llevan años traduciendo medicina difícil para 575k personas en Cerebros Esponjosos. Aliis es la misma voz — disponible cuando no tienes un médico al lado.', stat: '575k', statLabel: 'personas que ya confían en cómo explicamos medicina' },
  ]
  return (
    <section className="px-6 py-16 md:py-[120px]" style={{ borderTop: '1px solid var(--c-border)' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72, maxWidth: '44rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <Eyebrow centered style={{ marginBottom: 18 }}>· Por qué confiar ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem,4.6vw,3.5rem)', lineHeight: 1.04, letterSpacing: '-.02em', margin: '0 0 16px' }}>
            Una IA médica merece{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>más escrutinio, no menos.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--c-text-muted)', margin: 0 }}>Por eso en Aliis, todo lo que te decimos está comprobado científicamente.</p>
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

// Phase durations in ms
const PHASE_DURATIONS = [8000, 8000, 15000, 14000, 14000]
const DIAGNOSIS_TEXT = 'Migraña con aura. Sumatriptán 50mg. ¿Cuándo exactamente debo tomarlo?'
const ANSWER_TEXT = 'Tomarlo durante el aura reduce su eficacia. Espera al inicio del dolor de cabeza.'
const SOURCES = ['PubMed', 'DOI', 'Guías clínicas']
const CHAPTERS = [
  '¿Qué es la migraña con aura?',
  'Cómo funciona',
  'Señales de alarma',
  'Preguntas para tu médico',
]

function LiveExample() {
  const [phase, setPhase] = useState(0)
  const [typedDiagnosis, setTypedDiagnosis] = useState('')
  const [visibleSources, setVisibleSources] = useState(0)
  const [visibleChapters, setVisibleChapters] = useState(0)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [showCitation, setShowCitation] = useState(false)
  const [buttonPulse, setButtonPulse] = useState(false)
  const [visibleSymptoms, setVisibleSymptoms] = useState(0)
  const [showNote, setShowNote] = useState(false)

  const phaseRef = useRef(phase)
  phaseRef.current = phase

  // Master phase ticker
  useEffect(() => {
    const startTime = Date.now()
    const totalCycle = PHASE_DURATIONS.reduce((a, b) => a + b, 0)

    const tick = () => {
      const elapsed = (Date.now() - startTime) % totalCycle
      let acc = 0
      for (let i = 0; i < PHASE_DURATIONS.length; i++) {
        acc += PHASE_DURATIONS[i]
        if (elapsed < acc) {
          setPhase(i)
          return
        }
      }
    }

    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [])

  // Phase 0: typing diagnosis
  useEffect(() => {
    if (phase !== 0) {
      setTypedDiagnosis('')
      setButtonPulse(false)
      return
    }
    let i = 0
    setTypedDiagnosis('')
    setButtonPulse(false)
    const id = setInterval(() => {
      i++
      setTypedDiagnosis(DIAGNOSIS_TEXT.slice(0, i))
      if (i >= DIAGNOSIS_TEXT.length) {
        clearInterval(id)
        setTimeout(() => setButtonPulse(true), 400)
      }
    }, 65)
    return () => clearInterval(id)
  }, [phase])

  // Phase 1: sources appear one by one
  useEffect(() => {
    if (phase !== 1) {
      setVisibleSources(0)
      return
    }
    setVisibleSources(0)
    let count = 0
    const id = setInterval(() => {
      count++
      setVisibleSources(count)
      if (count >= SOURCES.length) clearInterval(id)
    }, 1800)
    return () => clearInterval(id)
  }, [phase])

  // Phase 2: chapters slide in one by one
  useEffect(() => {
    if (phase !== 2) {
      setVisibleChapters(0)
      return
    }
    setVisibleChapters(0)
    let count = 0
    const id = setInterval(() => {
      count++
      setVisibleChapters(count)
      if (count >= CHAPTERS.length) clearInterval(id)
    }, 1200)
    return () => clearInterval(id)
  }, [phase])

  // Phase 3: typing Aliis answer + citation
  useEffect(() => {
    if (phase !== 3) {
      setTypedAnswer('')
      setShowCitation(false)
      return
    }
    setTypedAnswer('')
    setShowCitation(false)
    // Wait briefly before typing starts
    const delay = setTimeout(() => {
      let i = 0
      const id = setInterval(() => {
        i++
        setTypedAnswer(ANSWER_TEXT.slice(0, i))
        if (i >= ANSWER_TEXT.length) {
          clearInterval(id)
          setTimeout(() => setShowCitation(true), 600)
        }
      }, 55)
      return () => clearInterval(id)
    }, 1800)
    return () => clearTimeout(delay)
  }, [phase])

  // Phase 4: diary — symptoms stagger in, then note appears
  useEffect(() => {
    if (phase !== 4) {
      setVisibleSymptoms(0)
      setShowNote(false)
      return
    }
    setVisibleSymptoms(0)
    setShowNote(false)
    let count = 0
    const id = setInterval(() => {
      count++
      setVisibleSymptoms(count)
      if (count >= 3) {
        clearInterval(id)
        setTimeout(() => setShowNote(true), 900)
      }
    }, 1100)
    return () => clearInterval(id)
  }, [phase])

  return (
    <section id="ejemplo" className="px-6 py-16 md:py-[120px]" style={{ borderTop: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: '42rem' }}>
          <Eyebrow style={{ marginBottom: 18 }}>· Así responde Aliis ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.08, letterSpacing: '-.02em', margin: 0 }}>
            Una pregunta real.{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>Juzga tú mismo.</em>
          </h2>
        </div>

        {/* Animated demo card */}
        <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 20, overflow: 'hidden', position: 'relative', height: 520 }}>

          {/* Phase indicator dots */}
          <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 6, zIndex: 10 }}>
            {[0, 1, 2, 3, 4].map((p) => (
              <div key={p} style={{
                width: 6, height: 6, borderRadius: 999,
                background: phase === p ? 'var(--c-brand-teal-deep)' : 'var(--c-border)',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>

          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">

            {/* ── Phase 0: Input ── */}
            {phase === 0 && (
              <motion.div
                key="phase-input"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                style={{ padding: '36px 36px 32px' }}
              >
                {/* Header label */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--c-text-subtle)', marginBottom: 20 }}>
                  Pregúntale a Aliis
                </div>

                {/* Text area simulation */}
                <div style={{
                  background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 14,
                  padding: '20px 22px', minHeight: 140, marginBottom: 20,
                  fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.6, color: 'var(--c-text)',
                  position: 'relative',
                }}>
                  {typedDiagnosis}
                  {/* blinking cursor */}
                  <span style={{
                    display: 'inline-block', width: 2, height: '1.1em', background: 'var(--c-brand-teal-deep)',
                    verticalAlign: 'middle', marginLeft: 2,
                    animation: 'aliis-blink 1s step-end infinite',
                  }} />
                </div>

                {/* Source pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                  {SOURCES.map((s) => (
                    <div key={s} style={{
                      padding: '5px 12px', borderRadius: 999, background: 'var(--c-surface)',
                      border: '1px solid var(--c-border)', fontFamily: 'var(--font-mono)',
                      fontSize: 10, letterSpacing: '.15em', color: 'var(--c-text-muted)',
                    }}>{s}</div>
                  ))}
                </div>

                {/* CTA button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button
                    animate={buttonPulse ? {
                      boxShadow: [
                        '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)',
                        '0 0 0 1px rgba(31,138,155,.6), 0 4px 28px rgba(31,138,155,.4)',
                        '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)',
                      ],
                    } : {}}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 22px', background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))',
                      boxShadow: '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)',
                      border: 'none', borderRadius: 999, fontFamily: 'var(--font-sans)',
                      fontWeight: 500, fontSize: 14, cursor: 'default',
                    }}
                  >
                    Pedir explicación
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Phase 1: Loading ── */}
            {phase === 1 && (
              <motion.div
                key="phase-loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                style={{ padding: '60px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
              >
                {/* Aliis logo/symbol */}
                <div style={{
                  width: 52, height: 52, borderRadius: 999, background: 'var(--c-text)', color: 'var(--c-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 18, marginBottom: 28,
                }}>◐</div>

                {/* Status text with dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--c-text-muted)' }}>
                    Aliis está analizando tu diagnóstico
                  </span>
                  <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, delay: i * 0.22, repeat: Infinity }}
                        style={{ display: 'inline-block', width: 4, height: 4, borderRadius: 999, background: 'var(--c-brand-teal-deep)' }}
                      />
                    ))}
                  </span>
                </div>

                {/* Source pills appearing */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {SOURCES.map((s, i) => (
                    <AnimatePresence key={s}>
                      {visibleSources > i && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                          style={{
                            padding: '6px 16px', borderRadius: 999,
                            background: 'var(--c-surface)', border: '1px solid var(--c-border)',
                            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em',
                            color: 'var(--c-brand-teal-deep)',
                          }}
                        >
                          ✓ {s}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Phase 2: Chapters ── */}
            {phase === 2 && (
              <motion.div
                key="phase-chapters"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                style={{ padding: '32px 36px' }}
              >
                {/* Pack header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--c-border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--c-surface)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src="/assets/aliis-logo.png" alt="Aliis" width={38} height={38} className="dark:invert-0 invert" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, lineHeight: 1.2 }}>Migraña con aura</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', color: 'var(--c-brand-teal-deep)', marginTop: 3 }}>· EXPEDIENTE ALIIS ·</div>
                  </div>
                  <div style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, background: 'rgba(31,138,155,0.08)', border: '1px solid rgba(31,138,155,0.2)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', color: 'var(--c-brand-teal-deep)' }}>
                    3 fuentes · PubMed
                  </div>
                </div>

                {/* Chapters list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {CHAPTERS.map((ch, i) => (
                    <AnimatePresence key={ch}>
                      {visibleChapters > i && (
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                          style={{
                            padding: '14px 18px', borderRadius: 12,
                            background: i === 0 ? 'rgba(31,138,155,0.08)' : 'var(--c-surface)',
                            border: `1px solid ${i === 0 ? 'rgba(31,138,155,0.25)' : 'var(--c-border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em',
                              color: i === 0 ? 'var(--c-brand-teal-deep)' : 'var(--c-text-faint)',
                              minWidth: 24,
                            }}>0{i + 1}</span>
                            <span style={{
                              fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.3,
                              color: i === 0 ? 'var(--c-brand-teal-deep)' : 'var(--c-text)',
                            }}>{ch}</span>
                          </div>
                          {i === 0 && (
                            <span style={{
                              padding: '3px 10px', borderRadius: 999,
                              background: 'rgba(31,138,155,0.15)', border: '1px solid rgba(31,138,155,0.3)',
                              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.15em',
                              color: 'var(--c-brand-teal-deep)',
                            }}>LEYENDO</span>
                          )}
                          {i > 0 && i < visibleChapters && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-faint)" strokeWidth="1.5" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Phase 3: Chat ── */}
            {phase === 3 && (
              <motion.div
                key="phase-chat"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 0 }}
              >
                {/* Chat header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--c-border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--c-text-subtle)' }}>
                    Asistente IA · Capítulo 01
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--c-brand-teal-deep)' }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.12em', color: 'var(--c-brand-teal-deep)' }}>EN LÍNEA</div>
                  </div>
                </div>

                {/* User message */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 24, justifyContent: 'flex-end' }}>
                  <div style={{
                    maxWidth: '70%', padding: '12px 18px', borderRadius: '16px 16px 4px 16px',
                    background: '#0F1923', border: '1px solid rgba(31,138,155,.25)',
                    fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.55, color: '#fff',
                  }}>
                    ¿Y si lo tomo durante el aura?
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999, background: 'var(--c-border)',
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-text-muted)', alignSelf: 'flex-end',
                  }}>TÚ</div>
                </div>

                {/* Aliis response */}
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 999, overflow: 'hidden', flexShrink: 0, alignSelf: 'flex-start', background: 'var(--c-surface)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src="/assets/aliis-logo.png" alt="Aliis" width={32} height={32} className="dark:invert-0 invert" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 8 }}>
                      Aliis
                    </div>
                    <div style={{
                      padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
                      background: 'var(--c-surface)', border: '1px solid var(--c-border)',
                      fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.65, color: 'var(--c-text)',
                      marginBottom: 12, minHeight: 56,
                    }}>
                      {typedAnswer}
                      {typedAnswer.length < ANSWER_TEXT.length && typedAnswer.length > 0 && (
                        <span style={{
                          display: 'inline-block', width: 2, height: '1em', background: 'var(--c-brand-teal-deep)',
                          verticalAlign: 'middle', marginLeft: 2,
                          animation: 'aliis-blink 1s step-end infinite',
                        }} />
                      )}
                    </div>

                    {/* Citation */}
                    <AnimatePresence>
                      {showCitation && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 14px', borderRadius: 999,
                            background: 'rgba(31,138,155,0.08)', border: '1px solid rgba(31,138,155,0.2)',
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-brand-teal-deep)', letterSpacing: '.1em' }}>[1]</span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--c-text-muted)' }}>Bates et al, Neurology (1994)</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Phase 4: Diario ── */}
            {phase === 4 && (
              <motion.div
                key="phase-diary"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                style={{ padding: '32px 36px' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--c-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--c-text-subtle)' }}>Mi diario</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--c-text-muted)' }}>Migraña con aura</div>
                  </div>
                  <div style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(31,138,155,0.08)', border: '1px solid rgba(31,138,155,0.2)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)' }}>
                    + Registrar
                  </div>
                </div>

                {/* Síntomas y signos vitales */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 12 }}>
                    Síntomas y signos vitales
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { date: '24 abr · 14:30', symptom: 'Síntoma: Aura visual con zigzag', vitals: ['FC 88 lpm', 'TA 118/76'] },
                      { date: '18 abr · 09:15', symptom: 'Síntoma: Dolor pulsátil derecho', vitals: ['FC 92 lpm'] },
                      { date: '11 abr · 20:00', symptom: 'Síntoma: Náusea y fotofobia', vitals: ['TA 122/80', 'FC 78 lpm'] },
                    ].map((entry, i) => (
                      <AnimatePresence key={entry.date}>
                        {visibleSymptoms > i && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                            style={{
                              padding: '12px 16px', borderRadius: 12,
                              background: 'var(--c-surface)', border: '1px solid var(--c-border)',
                              display: 'flex', flexDirection: 'column', gap: 6,
                            }}
                          >
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--c-text-faint)' }}>
                              {entry.date}
                            </div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
                              {entry.symptom}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {entry.vitals.map(v => (
                                <span key={v} style={{
                                  padding: '2px 10px', borderRadius: 999, background: 'var(--c-bg)',
                                  border: '1px solid var(--c-border)', fontFamily: 'var(--font-mono)',
                                  fontSize: 10, letterSpacing: '.08em', color: 'var(--c-text-muted)',
                                }}>{v}</span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                </div>

                {/* Apuntes */}
                <AnimatePresence>
                  {showNote && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 12 }}>
                        Apuntes
                      </div>
                      <div style={{
                        padding: '16px 18px', borderRadius: 12,
                        border: '1px solid var(--c-border)', background: 'var(--c-surface)',
                      }}>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--c-text)', lineHeight: 1.2, marginBottom: 6 }}>
                          Migraña con aura
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 12 }}>
                          hace 3 días
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--c-text-muted)', fontStyle: 'italic', lineHeight: 1.55 }}>
                          El sumatriptán funciona mejor tomado al inicio del dolor, no durante el aura. Anotar hora exacta del aura la próxima vez.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Blink keyframe */}
      <style>{`
        @keyframes aliis-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  )
}

// ─── Founders ─────────────────────────────────────────────────

function Founders() {
  return (
    <section className="px-6 py-16 md:py-[120px]" style={{ borderTop: '1px solid var(--c-border)' }}>
      <div className="max-w-[72rem] mx-auto grid grid-cols-1 md:grid-cols-[.8fr_1.2fr] gap-10 md:gap-[60px] items-center">
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
            Lo hacemos en consulta. Lo hacemos en Cerebros Esponjosos.{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>Ahora lo pusimos en Aliis.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.8, color: 'var(--c-text-muted)', margin: '0 0 20px' }}>
            Oscar y Stephanie son residentes de neurología. Llevan años explicando diagnósticos en consulta y traduciendo medicina difícil para 575k personas en Cerebros Esponjosos. Aliis es lo mismo — disponible para ti cuando no tienes un neurólogo al lado.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--c-border)' }}>
            <Capsule tone="teal">Un producto de Cerebros Esponjosos</Capsule>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--c-text-faint)' }}>@cerebros.esponjosos</span>
          </div>
          <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)' }}>
            575k personas que ya confían en cómo explicamos medicina
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
    <section className="px-6 py-16 md:py-[120px]" style={{ borderTop: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Eyebrow centered style={{ marginBottom: 22 }}>· Precios · transparentes ·</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem,5.5vw,4rem)', lineHeight: 1, letterSpacing: '-.03em', margin: '0 0 16px' }}>
            Menos que un café <em style={{ color: 'var(--c-text-faint)' }}>al día.</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.45, color: 'var(--c-text-muted)', maxWidth: '38ch', margin: '0 auto' }}>
            "Cuesta menos que ignorar lo que te dijeron en consulta."
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 999 }}>
            {(['EUR', 'USD', 'MXN'] as const).map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                style={{
                  background: currency === c ? 'hsl(var(--secondary))' : 'transparent',
                  color: currency === c ? 'hsl(var(--secondary-foreground))' : 'var(--c-text-muted)',
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
                  background: tier.highlight ? 'hsl(var(--secondary))' : 'transparent',
                  color: tier.highlight ? 'hsl(var(--secondary-foreground))' : 'var(--c-text)',
                  boxShadow: tier.highlight ? '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)' : 'none',
                  border: `1px solid ${tier.highlight ? 'transparent' : 'rgba(31,138,155,.35)'}`,
                  fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                  transition: 'opacity .15s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {tier.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </article>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', paddingTop: 32, borderTop: '1px solid var(--c-border)' }}>
          {[
            { k: 'Cancelas cuando quieras', v: 'un click. Sin fricción.' },
            { k: '14 días gratis', v: 'si no convence, lo pagado vuelve.' },
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

export default function LandingClient({ initialInitial }: { initialInitial: string | null }) {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_done')
          .eq('id', session.user.id)
          .single()
        router.push(profile?.onboarding_done ? '/historial' : '/onboarding')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  async function handleMainCTA() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/ingreso')
    } else {
      setShowLogin(true)
    }
  }

  async function handleVerEjemplo() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    router.push(user ? '/historial' : '#demo')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <Suspense><AppNav initialInitial={initialInitial} /></Suspense>
      <Hero onCTA={handleMainCTA} onVerEjemplo={handleVerEjemplo} />
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
