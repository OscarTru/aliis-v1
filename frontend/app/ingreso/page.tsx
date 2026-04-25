'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, Pill, ClipboardList, HelpCircle, Check } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { UpgradeModal } from '@/components/UpgradeModal'
import { createClient } from '@/lib/supabase'

type Step = 'dx' | 'frecuencia' | 'dudas' | 'generating'

const FRECUENCIA_OPTIONS = [
  { value: 'Recién diagnosticado', label: 'Recién me lo dijeron', sub: 'Menos de un mes' },
  { value: 'Hace meses', label: 'Llevo unos meses', sub: 'Entre 1 y 12 meses' },
  { value: 'Llevo años con esto', label: 'Ya tiene tiempo', sub: 'Más de un año' },
]

const DUDAS_OPTIONS = [
  { value: 'Qué esperar', label: 'Qué esperar', sub: 'Evolución y pronóstico' },
  { value: 'Medicamentos', label: 'Mis medicamentos', sub: 'Cómo funcionan y para qué' },
  { value: 'Estilo de vida', label: 'Estilo de vida', sub: 'Alimentación, ejercicio, rutinas' },
  { value: 'Compartir con familia', label: 'Explicárselo a alguien', sub: 'Cómo contárselo a mi familia' },
]

export default function IngresoPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('dx')
  const [dx, setDx] = useState('')
  const [dxInput, setDxInput] = useState('')
  const [frecuencia, setFrecuencia] = useState('')
  const [frecuenciaCustom, setFrecuenciaCustom] = useState('')
  const [dudas, setDudas] = useState('')
  const [dudasCustom, setDudasCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const dxInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (step === 'dx') dxInputRef.current?.focus()
  }, [step])

  function handleDxSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = dxInput.trim()
    if (!trimmed) return
    setDx(trimmed)
    setStep('frecuencia')
  }

  function handleFrecuenciaSelect(value: string) {
    setFrecuencia(value)
    setFrecuenciaCustom('')
  }

  function handleDudasSelect(value: string) {
    setDudas(value)
    setDudasCustom('')
  }

  function frecuenciaFinal() {
    return frecuencia === '__custom' ? frecuenciaCustom.trim() : frecuencia
  }

  function dudasFinal() {
    return dudas === '__custom' ? dudasCustom.trim() : dudas
  }

  async function handleGenerate() {
    const f = frecuenciaFinal()
    const d = dudasFinal()
    if (!f || !d) return
    setLoading(true)
    setStep('generating')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      const userPlan = profile?.plan ?? 'free'

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/pack/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnostico: dx,
          contexto: { frecuencia: f, dudas: d },
          userId: user.id,
          userPlan,
        }),
      })

      if (!res.ok) { setStep('dudas'); return }

      const data = await res.json() as {
        limitReached?: boolean
        emergencyResponse?: string
        blockedReason?: string
        blockedMessage?: string
        pack?: { id: string }
      }

      if (data.limitReached) { setShowUpgrade(true); setStep('dudas'); return }
      if (data.pack?.id) router.push(`/loading?packId=${data.pack.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppShell>
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Step 1: diagnóstico ── */}
        {step === 'dx' && (
          <div className="ce-fade">
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>Paso 1 de 3</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 5vw, 38px)', letterSpacing: '-.025em', lineHeight: 1.15, marginBottom: 8 }}>
              ¿Qué te dijo tu médico?
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
              Escribe el diagnóstico, copia lo que dice tu receta, o cuéntalo con tus palabras.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { icon: <Stethoscope size={15} />, text: 'Migraña con aura' },
                { icon: <Pill size={15} />, text: 'Epilepsia focal' },
                { icon: <ClipboardList size={15} />, text: 'Esclerosis múltiple remitente-recurrente' },
                { icon: <HelpCircle size={15} />, text: 'Neuralgia del trigémino' },
              ].map(({ icon, text }) => (
                <button key={text} onClick={() => { setDxInput(text); dxInputRef.current?.focus() }}
                  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--c-brand-teal)', flexShrink: 0 }}>{icon}</span>
                  {text}
                </button>
              ))}
            </div>

            <form onSubmit={handleDxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                ref={dxInputRef}
                value={dxInput}
                onChange={(e) => setDxInput(e.target.value)}
                placeholder="O escribe aquí lo que te dijeron…"
                rows={3}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14,
                  border: '1px solid var(--c-border)', background: 'var(--c-surface)',
                  fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)',
                  outline: 'none', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box',
                }}
              />
              <button type="submit" disabled={!dxInput.trim()}
                style={{
                  padding: '14px', borderRadius: 12, border: 'none',
                  background: dxInput.trim() ? '#0F1923' : 'var(--c-border)',
                  boxShadow: dxInput.trim() ? '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)' : 'none',
                  color: dxInput.trim() ? '#fff' : 'var(--c-text-muted)',
                  fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                  cursor: dxInput.trim() ? 'pointer' : 'not-allowed', transition: 'background .15s, box-shadow .15s',
                }}>
                Continuar →
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: frecuencia ── */}
        {step === 'frecuencia' && (
          <div className="ce-fade">
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>Paso 2 de 3</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: '-.02em', lineHeight: 1.2, marginBottom: 8 }}>
              ¿Cuándo te lo diagnosticaron?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Nos ayuda a adaptar el tono de la explicación.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {FRECUENCIA_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => handleFrecuenciaSelect(opt.value)}
                  style={{
                    padding: '16px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${frecuencia === opt.value ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
                    background: frecuencia === opt.value ? 'rgba(31,138,155,.07)' : 'var(--c-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    transition: 'border-color .15s, background .15s',
                  }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--c-text)', marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>{opt.sub}</div>
                  </div>
                  {frecuencia === opt.value && (
                    <div style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--c-brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                  )}
                </button>
              ))}

              {/* Opción libre */}
              <button onClick={() => handleFrecuenciaSelect('__custom')}
                style={{
                  padding: '14px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${frecuencia === '__custom' ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
                  background: frecuencia === '__custom' ? 'rgba(31,138,155,.07)' : 'var(--c-surface)',
                  fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)',
                  transition: 'border-color .15s, background .15s',
                }}>
                Otra situación…
              </button>
              {frecuencia === '__custom' && (
                <input
                  autoFocus
                  value={frecuenciaCustom}
                  onChange={(e) => setFrecuenciaCustom(e.target.value)}
                  placeholder="Cuéntame un poco más…"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1px solid var(--c-brand-teal)', background: 'var(--c-surface)',
                    fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            <button
              onClick={() => { if (frecuenciaFinal()) setStep('dudas') }}
              disabled={!frecuenciaFinal()}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: frecuenciaFinal() ? '#0F1923' : 'var(--c-border)',
                boxShadow: frecuenciaFinal() ? '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)' : 'none',
                color: frecuenciaFinal() ? '#fff' : 'var(--c-text-muted)',
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                cursor: frecuenciaFinal() ? 'pointer' : 'not-allowed', transition: 'background .15s, box-shadow .15s',
              }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── Step 3: dudas ── */}
        {step === 'dudas' && (
          <div className="ce-fade">
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>Paso 3 de 3</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: '-.02em', lineHeight: 1.2, marginBottom: 8 }}>
              ¿Qué te gustaría entender mejor?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Aliis enfocará la explicación en lo que más te importa.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {DUDAS_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => handleDudasSelect(opt.value)}
                  style={{
                    padding: '16px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${dudas === opt.value ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
                    background: dudas === opt.value ? 'rgba(31,138,155,.07)' : 'var(--c-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    transition: 'border-color .15s, background .15s',
                  }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--c-text)', marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>{opt.sub}</div>
                  </div>
                  {dudas === opt.value && (
                    <div style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--c-brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                  )}
                </button>
              ))}

              {/* Opción libre */}
              <button onClick={() => handleDudasSelect('__custom')}
                style={{
                  padding: '14px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${dudas === '__custom' ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
                  background: dudas === '__custom' ? 'rgba(31,138,155,.07)' : 'var(--c-surface)',
                  fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)',
                  transition: 'border-color .15s, background .15s',
                }}>
                Tengo otra pregunta…
              </button>
              {dudas === '__custom' && (
                <input
                  autoFocus
                  value={dudasCustom}
                  onChange={(e) => setDudasCustom(e.target.value)}
                  placeholder="¿Qué quieres entender?"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1px solid var(--c-brand-teal)', background: 'var(--c-surface)',
                    fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!dudasFinal() || loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: dudasFinal() ? '#0F1923' : 'var(--c-border)',
                boxShadow: dudasFinal() ? '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)' : 'none',
                color: dudasFinal() ? '#fff' : 'var(--c-text-muted)',
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                cursor: dudasFinal() ? 'pointer' : 'not-allowed', transition: 'background .15s, box-shadow .15s',
              }}>
              {loading ? 'Preparando tu pack…' : 'Generar mi pack'}
            </button>

            <button onClick={() => setStep('frecuencia')}
              style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)', cursor: 'pointer' }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ── Generating ── */}
        {step === 'generating' && (
          <div className="ce-fade">
            {/* Header skeleton */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--c-brand-teal)', marginBottom: 10 }}>
                · Construyendo tu explicación ·
              </div>
              <div className="shimmer" style={{ height: 32, width: '70%', borderRadius: 8, marginBottom: 8 }} />
              <div className="shimmer" style={{ height: 16, width: '45%', borderRadius: 6 }} />
            </div>

            {/* Chapter cards appearing one by one */}
            {[
              { label: '¿Qué es exactamente?', w: '55%', delay: 0 },
              { label: '¿Qué pasa en mi cuerpo?', w: '62%', delay: 0.6 },
              { label: '¿Qué esperar?', w: '48%', delay: 1.2 },
              { label: '¿Qué preguntar en mi consulta?', w: '58%', delay: 1.8 },
              { label: '¿Cuándo actuar?', w: '40%', delay: 2.4 },
            ].map((ch, i) => (
              <div
                key={i}
                style={{
                  padding: '18px 22px',
                  background: 'var(--c-surface)',
                  borderRadius: 14,
                  border: '1px solid var(--c-border)',
                  marginBottom: 10,
                  opacity: 0,
                  animation: `ce-fade-in 0.5s ease forwards`,
                  animationDelay: `${ch.delay}s`,
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-brand-teal)', marginBottom: 8 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, letterSpacing: '-.01em', color: 'var(--c-text)', marginBottom: 12 }}>
                  {ch.label}
                </div>
                <div className="shimmer" style={{ height: 11, borderRadius: 5, marginBottom: 6, width: ch.w }} />
                <div className="shimmer" style={{ height: 11, borderRadius: 5, marginBottom: 6, width: '80%' }} />
                <div className="shimmer" style={{ height: 11, borderRadius: 5, width: '35%' }} />
              </div>
            ))}

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-faint)', textAlign: 'center', marginTop: 20 }}>
              Esto toma unos segundos…
            </p>
          </div>
        )}

      </main>
      </AppShell>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
