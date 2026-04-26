'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, Pill, ClipboardList, HelpCircle, Check } from 'lucide-react'
import { UpgradeModal } from '@/components/UpgradeModal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Step = 'dx' | 'frecuencia' | 'dudas' | 'generating'

const STAGES = [
  'Analizando tu diagnóstico…',
  'Destilando la información…',
  'Verificando referencias científicas…',
  'Preparando tus preguntas para el médico…',
  'Casi listo…',
]

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
  const [pendingPackId, setPendingPackId] = useState<string | null>(null)
  const [stageIdx, setStageIdx] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const dxInputRef = useRef<HTMLTextAreaElement>(null)

  // Reset to dx step on every mount so "Nuevo diagnóstico" always starts fresh
  useEffect(() => {
    setStep('dx')
    setDx('')
    setDxInput('')
    setFrecuencia('')
    setFrecuenciaCustom('')
    setDudas('')
    setDudasCustom('')
    setPendingPackId(null)
    setStageIdx(0)
  }, [])

  useEffect(() => {
    if (step === 'dx') dxInputRef.current?.focus()
  }, [step])

  // Cycle stage text while generating
  useEffect(() => {
    if (step !== 'generating') return
    setStageIdx(0)
    const interval = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1))
    }, 1400)
    return () => clearInterval(interval)
  }, [step])

  // Poll Supabase while generating — redirect when pack is ready
  useEffect(() => {
    if (!pendingPackId) return
    const supabase = createClient()
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('packs')
        .select('id')
        .eq('id', pendingPackId)
        .single()
      if (data) {
        clearInterval(poll)
        router.push(`/pack/${pendingPackId}`)
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [pendingPackId, router])

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
      if (data.pack?.id) { setPendingPackId(data.pack.id); return }
      // Unexpected response — go back so user isn't stuck
      setStep('dudas')
    } catch {
      setStep('dudas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <>
        <div className={cn(step === 'generating' ? 'flex items-center justify-center min-h-screen' : 'max-w-[560px] mx-auto px-6 pt-12 pb-20')}>

          {/* ── Step 1: diagnóstico ── */}
          {step === 'dx' && (
            <div className="ce-fade">
              <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
                Paso 1 de 3
              </p>
              <h1 className="font-serif leading-[1.15] tracking-[-0.025em] mb-2 text-[clamp(26px,5vw,38px)]">
                ¿Qué te dijo tu médico?
              </h1>
              <p className="font-sans text-[15px] text-muted-foreground mb-8 leading-relaxed">
                Escribe el diagnóstico, copia lo que dice tu receta, o cuéntalo con tus palabras.
              </p>

              <div className="flex flex-col gap-[10px] mb-6">
                {[
                  { icon: <Stethoscope size={15} />, text: 'Migraña con aura' },
                  { icon: <Pill size={15} />, text: 'Epilepsia focal' },
                  { icon: <ClipboardList size={15} />, text: 'Esclerosis múltiple remitente-recurrente' },
                  { icon: <HelpCircle size={15} />, text: 'Neuralgia del trigémino' },
                ].map(({ icon, text }) => (
                  <button
                    key={text}
                    onClick={() => { setDxInput(text); dxInputRef.current?.focus() }}
                    className="px-4 py-[10px] rounded-[10px] border border-border bg-muted font-sans text-[14px] text-muted-foreground cursor-pointer text-left flex items-center gap-[10px] hover:border-primary/40 transition-colors"
                  >
                    <span className="text-primary shrink-0">{icon}</span>
                    {text}
                  </button>
                ))}
              </div>

              <form onSubmit={handleDxSubmit} className="flex flex-col gap-3">
                <textarea
                  ref={dxInputRef}
                  aria-label="Escribe tu diagnóstico"
                  value={dxInput}
                  onChange={(e) => setDxInput(e.target.value)}
                  placeholder="O escribe aquí lo que te dijeron…"
                  rows={3}
                  className="w-full px-4 py-[14px] rounded-[14px] border border-border bg-muted font-sans text-[15px] text-foreground outline-none resize-none leading-[1.5] box-border focus:border-primary focus:ring-[3px] focus:ring-primary/20 transition-colors"
                />
                <Button
                  type="submit"
                  disabled={!dxInput.trim()}
                  className={cn(
                    'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                    dxInput.trim()
                      ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                      : 'bg-border text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Continuar →
                </Button>
              </form>
            </div>
          )}

          {/* ── Step 2: frecuencia ── */}
          {step === 'frecuencia' && (
            <div className="ce-fade">
              <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
                Paso 2 de 3
              </p>
              <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
                ¿Cuándo te lo diagnosticaron?
              </h2>
              <p className="font-sans text-[15px] text-muted-foreground mb-7 leading-relaxed">
                Nos ayuda a adaptar el tono de la explicación.
              </p>

              <div className="flex flex-col gap-[10px] mb-5">
                {FRECUENCIA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFrecuenciaSelect(opt.value)}
                    className={cn(
                      'px-5 py-4 rounded-[14px] cursor-pointer text-left border-2 flex items-center justify-between gap-3 transition-[border-color,background] duration-150',
                      frecuencia === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted'
                    )}
                  >
                    <div>
                      <div className="font-sans text-[15px] font-medium text-foreground mb-[2px]">{opt.label}</div>
                      <div className="font-sans text-[13px] text-muted-foreground">{opt.sub}</div>
                    </div>
                    {frecuencia === opt.value && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                  </button>
                ))}

                {/* Opción libre */}
                <button
                  onClick={() => handleFrecuenciaSelect('__custom')}
                  className={cn(
                    'px-5 py-[14px] rounded-[14px] cursor-pointer text-left border-2 font-sans text-[14px] text-muted-foreground transition-[border-color,background] duration-150',
                    frecuencia === '__custom'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted'
                  )}
                >
                  Otra situación…
                </button>
                {frecuencia === '__custom' && (
                  <Input
                    autoFocus
                    value={frecuenciaCustom}
                    onChange={(e) => setFrecuenciaCustom(e.target.value)}
                    placeholder="Cuéntame un poco más…"
                    className="h-12 rounded-[12px] border-primary bg-muted font-sans text-[15px] focus-visible:ring-primary/20"
                  />
                )}
              </div>

              <Button
                onClick={() => { if (frecuenciaFinal()) setStep('dudas') }}
                disabled={!frecuenciaFinal()}
                className={cn(
                  'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                  frecuenciaFinal()
                    ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                    : 'bg-border text-muted-foreground cursor-not-allowed'
                )}
              >
                Continuar →
              </Button>
            </div>
          )}

          {/* ── Step 3: dudas ── */}
          {step === 'dudas' && (
            <div className="ce-fade">
              <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
                Paso 3 de 3
              </p>
              <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
                ¿Qué te gustaría entender mejor?
              </h2>
              <p className="font-sans text-[15px] text-muted-foreground mb-7 leading-relaxed">
                Aliis enfocará la explicación en lo que más te importa.
              </p>

              <div className="flex flex-col gap-[10px] mb-5">
                {DUDAS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleDudasSelect(opt.value)}
                    className={cn(
                      'px-5 py-4 rounded-[14px] cursor-pointer text-left border-2 flex items-center justify-between gap-3 transition-[border-color,background] duration-150',
                      dudas === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted'
                    )}
                  >
                    <div>
                      <div className="font-sans text-[15px] font-medium text-foreground mb-[2px]">{opt.label}</div>
                      <div className="font-sans text-[13px] text-muted-foreground">{opt.sub}</div>
                    </div>
                    {dudas === opt.value && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                  </button>
                ))}

                {/* Opción libre */}
                <button
                  onClick={() => handleDudasSelect('__custom')}
                  className={cn(
                    'px-5 py-[14px] rounded-[14px] cursor-pointer text-left border-2 font-sans text-[14px] text-muted-foreground transition-[border-color,background] duration-150',
                    dudas === '__custom'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted'
                  )}
                >
                  Tengo otra pregunta…
                </button>
                {dudas === '__custom' && (
                  <Input
                    autoFocus
                    value={dudasCustom}
                    onChange={(e) => setDudasCustom(e.target.value)}
                    placeholder="¿Qué quieres entender?"
                    className="h-12 rounded-[12px] border-primary bg-muted font-sans text-[15px] focus-visible:ring-primary/20"
                  />
                )}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!dudasFinal() || loading}
                className={cn(
                  'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                  dudasFinal()
                    ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                    : 'bg-border text-muted-foreground cursor-not-allowed'
                )}
              >
                {loading ? 'Preparando tu diagnóstico…' : 'Generar mi diagnóstico'}
              </Button>

              <button
                onClick={() => setStep('frecuencia')}
                className="mt-3 w-full bg-transparent border-none font-sans text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            </div>
          )}

          {/* ── Generating ── */}
          {step === 'generating' && (
            <div className="ce-fade flex flex-col items-center justify-center gap-8 min-h-[60vh]">

              {/* Typing indicator — 3 bouncing squares */}
              <div className="flex items-end gap-[6px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block w-3 h-3 rounded-[3px] bg-primary"
                    style={{ animation: `aliis-bounce 1.1s ease-in-out ${i * 0.18}s infinite` }}
                  />
                ))}
              </div>

              {/* Stage text */}
              <div className="text-center px-6">
                <Eyebrow>· Destilando ·</Eyebrow>
                <h2 aria-live="polite" className="font-serif text-[22px] tracking-[-0.02em] mt-3 min-h-[32px]">
                  {STAGES[stageIdx]}
                </h2>
              </div>

              {/* Progress bar + circle side by side */}
              <div className="flex items-center gap-5 w-full max-w-[300px]">
                {/* Linear progress bar */}
                <div className="flex-1 h-[3px] bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.round(((stageIdx + 1) / STAGES.length) * 100)}%` }}
                  />
                </div>
                {/* Circular progress */}
                <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0 -rotate-90">
                  <circle cx="16" cy="16" r="13" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                  <circle
                    cx="16" cy="16" r="13" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 13}`}
                    strokeDashoffset={`${2 * Math.PI * 13 * (1 - (stageIdx + 1) / STAGES.length)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
                  />
                </svg>
              </div>

              {/* Stages list */}
              <div className="flex flex-col gap-[10px] w-full max-w-[300px]">
                {STAGES.map((stage, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 font-sans text-[13px]',
                      i < stageIdx ? 'text-primary' : i === stageIdx ? 'text-foreground' : 'text-muted-foreground/35'
                    )}
                  >
                    <span className="w-4 shrink-0 inline-flex items-center justify-center">
                      {i < stageIdx
                        ? <Check size={13} />
                        : i === stageIdx
                        ? <span className="block w-[6px] h-[6px] rounded-full bg-primary" style={{ animation: 'aliis-pulse 1s ease-in-out infinite' }} />
                        : <span className="block w-[5px] h-[5px] rounded-full bg-muted-foreground/25" />
                      }
                    </span>
                    {stage}
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
