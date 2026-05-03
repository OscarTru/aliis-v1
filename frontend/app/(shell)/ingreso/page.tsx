'use client'

import { Suspense, useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import { UpgradeModal } from '@/components/UpgradeModal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ComboboxDiagnostico } from '@/components/ComboboxDiagnostico'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Step = 'dx' | 'para' | 'emocion' | 'dudas' | 'generating'

type ConditionSuggestion = {
  id: string
  slug: string
  name: string
}

const STAGES = [
  'Leyendo tu diagnóstico con cuidado…',
  'Entendiendo qué significa esto para ti…',
  'Buscando en fuentes médicas indexadas…',
  'Revisando estudios recientes sobre este tema…',
  'Verificando que las referencias sean reales…',
  'Estructurando una explicación que tenga sentido…',
  'Escribiendo en un lenguaje que puedas leer…',
  'Preparando las preguntas que querrás hacerle a tu médico…',
  'Dándole formato para que sea fácil de navegar…',
  'Revisando que todo esté claro antes de mostrártelo…',
]

const PARA_OPTIONS = [
  { value: 'yo', label: 'Para mí', sub: 'El diagnóstico es mío' },
  { value: 'familiar', label: 'Para un familiar', sub: 'Me lo diagnosticaron a un ser querido' },
  { value: 'acompanando', label: 'Acompañando a alguien', sub: 'Quiero entenderlo para apoyar' },
]

const EMOCION_OPTIONS = [
  { value: 'tranquilo', label: 'Tranquilo, con dudas', sub: 'Estoy bien, solo quiero entender' },
  { value: 'asustado', label: 'Asustado', sub: 'Me preocupa lo que esto significa' },
  { value: 'abrumado', label: 'Abrumado', sub: 'Es mucha información de golpe' },
  { value: 'enojado', label: 'Enojado', sub: 'No entiendo por qué me pasó esto' },
]

const DUDAS_OPTIONS = [
  { value: 'Qué esperar', label: 'Qué esperar', sub: 'Evolución y pronóstico' },
  { value: 'Medicamentos', label: 'Mis medicamentos', sub: 'Cómo funcionan y para qué' },
  { value: 'Estilo de vida', label: 'Estilo de vida', sub: 'Alimentación, ejercicio, rutinas' },
  { value: 'Compartir con familia', label: 'Explicárselo a alguien', sub: 'Cómo contárselo' },
  { value: 'Por qué me pasó', label: 'Por qué me pasó esto', sub: 'Causas y factores' },
  { value: 'Día a día', label: 'Cómo afecta mi día a día', sub: 'Trabajo, sueño, energía' },
  { value: 'Cuándo preocuparme', label: 'Cuándo preocuparme', sub: 'Señales de alarma, qué es normal' },
  { value: 'Hablar con médico', label: 'Cómo hablar con mi médico', sub: 'Preguntas que llevar' },
]

// Inline chip component — avoids prop drilling.
// Compact layout fit for grids: label + sub stacked, equal-height tiles.
function Chip({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string
  sub: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-4 py-3 rounded-[14px] cursor-pointer text-left border-2 flex flex-col gap-0.5 transition-[border-color,background] duration-150 min-h-[68px]',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-muted'
      )}
    >
      <div className="font-sans text-[14px] font-medium text-foreground leading-tight pr-6">{label}</div>
      <div className="font-sans text-[12px] text-muted-foreground leading-snug">{sub}</div>
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Check size={10} color="#fff" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}

export default function IngresoPage() {
  return (
    <Suspense>
      <IngresoPageInner />
    </Suspense>
  )
}

function IngresoPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialDx = searchParams.get('dx') ?? ''
  const initialPara = searchParams.get('para') ?? ''

  const [step, setStep] = useState<Step>(initialDx ? (initialPara ? 'emocion' : 'para') : 'dx')

  // Step 1 — dx
  const [dxText, setDxText] = useState(initialDx)
  const [conditionSlug, setConditionSlug] = useState<string | null>(null)
  const [conditions, setConditions] = useState<ConditionSuggestion[]>([])

  // Step 2 — para
  const [para, setPara] = useState(initialPara)

  // Step 3 — emocion
  const [emocion, setEmocion] = useState('')
  const [emocionCustom, setEmocionCustom] = useState('')

  // Step 4 — dudas
  const [dudas, setDudas] = useState('')
  const [dudasCustom, setDudasCustom] = useState('')

  // Generating
  const [loading, setLoading] = useState(false)
  const [pendingPackId, setPendingPackId] = useState<string | null>(null)
  const [stageIdx, setStageIdx] = useState(0)
  const [stageVisible, setStageVisible] = useState(true)
  const [progressPct, setProgressPct] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const circleRef = useRef<SVGCircleElement>(null)
  const CIRCUMFERENCE = 2 * Math.PI * 18

  // Reset only when there are no pre-filled params (fresh "Nuevo diagnóstico")
  useEffect(() => {
    if (initialDx) return
    setStep('dx')
    setDxText('')
    setConditionSlug(null)
    setPara('')
    setEmocion('')
    setEmocionCustom('')
    setDudas('')
    setDudasCustom('')
    setPendingPackId(null)
    setStageIdx(0)
    setStageVisible(true)
    setProgressPct(0)
  }, [initialDx])

  // Load conditions for combobox
  useEffect(() => {
    let mounted = true
    const supabase = createClient()
    supabase
      .from('conditions')
      .select('id, slug, name')
      .eq('published', true)
      .order('name')
      .then(({ data, error }) => {
        if (!mounted) return
        if (error) console.error('[conditions] failed to load:', error.message)
        setConditions(data ?? [])
      })
    return () => { mounted = false }
  }, [])

  // Drive the SVG circle directly via ref — bypasses React render cycle for smooth animation
  const startProgress = useCallback(() => {
    setProgressPct(0)
    startTimeRef.current = performance.now()

    function tick(now: number) {
      const elapsed = (now - startTimeRef.current) / 1000
      const pct = 88 * (1 - Math.exp(-elapsed / 18))
      // Update SVG directly — no React state, no batching, true 60fps
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct / 100))
      }
      // Update the text counter at ~4fps to avoid thrashing
      if (Math.round(elapsed * 4) % 1 === 0) {
        setProgressPct(Math.round(pct))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [CIRCUMFERENCE])

  const completeProgress = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = '0'
    }
    setProgressPct(100)
  }, [])

  // Stage text cycles in loop — never gets stuck on last item
  useEffect(() => {
    if (step !== 'generating') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    setStageIdx(0)
    setStageVisible(true)
    setProgressPct(0)
    startProgress()
    const interval = setInterval(() => {
      // Fade out → swap text → fade in
      setStageVisible(false)
      setTimeout(() => {
        setStageIdx((i) => (i + 1) % STAGES.length)
        setStageVisible(true)
      }, 350)
    }, 4000)
    return () => {
      clearInterval(interval)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [step, startProgress])

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
        completeProgress()
        setTimeout(() => router.push(`/pack/${pendingPackId}`), 400)
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [pendingPackId, router, completeProgress])

  function emocionFinal() {
    return emocion === '__custom' ? emocionCustom.trim() : emocion
  }

  function dudasFinal() {
    return dudas === '__custom' ? dudasCustom.trim() : dudas
  }

  async function handleGenerate() {
    const d = dudasFinal()
    if (!d) return
    setLoading(true)
    setStep('generating')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: { session } } = await supabase.auth.getSession()
      // getSession() can return null in SSR-auth flows; refresh if needed
      const token = session?.access_token ?? (await supabase.auth.refreshSession()).data.session?.access_token

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      const userPlan = profile?.plan ?? 'free'

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/pack/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          diagnostico: dxText,
          conditionSlug: conditionSlug ?? undefined,
          contexto: {
            para,
            emocion: emocionFinal() || undefined,
            dudas: dudasFinal(),
          },
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
        <div
          className={cn(
            step === 'generating'
              ? 'flex items-center justify-center min-h-screen'
              : 'min-h-[calc(100dvh-64px-env(safe-area-inset-bottom))] md:min-h-screen flex items-center justify-center px-4 md:px-8 py-8'
          )}
        >
          <div className={cn(step !== 'generating' && 'w-full max-w-[640px] mx-auto')}>

          {/* ── Step 1: diagnóstico (combobox) ── */}
          {step === 'dx' && (
            <div className="ce-fade">
              <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
                Paso 1 de 4
              </p>
              <h1 className="font-serif leading-[1.15] tracking-[-0.025em] mb-2 text-[clamp(26px,5vw,38px)]">
                ¿Qué te dijo tu médico?
              </h1>
              <p className="font-sans text-[15px] text-muted-foreground mb-8 leading-relaxed">
                Escribe el diagnóstico, copia lo que dice tu receta, o cuéntalo con tus palabras.
              </p>

              <div className="flex flex-col gap-3">
                <ComboboxDiagnostico
                  value={dxText}
                  onChange={(text, slug) => {
                    setDxText(text)
                    setConditionSlug(slug)
                  }}
                  conditions={conditions}
                />
                <Button
                  onClick={() => { if (dxText.trim()) setStep('para') }}
                  disabled={!dxText.trim()}
                  className={cn(
                    'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                    dxText.trim()
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                      : 'bg-border text-muted-foreground cursor-not-allowed'
                  )}
                >
                  Continuar →
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: para quién ── */}
          {step === 'para' && (
            <div className="ce-fade">
              <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
                Paso 2 de 4
              </p>
              <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
                ¿Para quién es este pack?
              </h2>
              <p className="font-sans text-[15px] text-muted-foreground mb-6 leading-relaxed">
                Adaptamos la explicación según quién va a leerla.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
                {PARA_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    sub={opt.sub}
                    selected={para === opt.value}
                    onClick={() => setPara(opt.value)}
                  />
                ))}
              </div>

              <Button
                onClick={() => { if (para) setStep('emocion') }}
                disabled={!para}
                className={cn(
                  'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                  para
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                    : 'bg-border text-muted-foreground cursor-not-allowed'
                )}
              >
                Continuar →
              </Button>

              <button
                onClick={() => setStep('dx')}
                className="mt-3 w-full bg-transparent border-none font-sans text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            </div>
          )}

          {/* ── Step 3: emoción ── */}
          {step === 'emocion' && (
            <div className="ce-fade">
              <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
                Paso 3 de 4
              </p>
              <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
                ¿Cómo te sientes con este diagnóstico?
              </h2>
              <p className="font-sans text-[15px] text-muted-foreground mb-6 leading-relaxed">
                Nos ayuda a adaptar el tono de la explicación.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {EMOCION_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    sub={opt.sub}
                    selected={emocion === opt.value}
                    onClick={() => { setEmocion(opt.value); setEmocionCustom('') }}
                  />
                ))}
              </div>

              {/* Opción libre — ancho completo bajo el grid */}
              <div className="flex flex-col gap-2.5 mb-5">
                <button
                  onClick={() => setEmocion('__custom')}
                  className={cn(
                    'px-5 py-3 rounded-[14px] cursor-pointer text-left border-2 font-sans text-[14px] text-muted-foreground transition-[border-color,background] duration-150',
                    emocion === '__custom'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted'
                  )}
                >
                  Otro…
                </button>
                {emocion === '__custom' && (
                  <Input
                    autoFocus
                    value={emocionCustom}
                    onChange={(e) => setEmocionCustom(e.target.value)}
                    placeholder="Cuéntame cómo te sientes…"
                    className="h-12 rounded-[12px] border-primary bg-muted font-sans text-[15px] focus-visible:ring-primary/20"
                  />
                )}
              </div>

              <Button
                onClick={() => { if (emocionFinal()) setStep('dudas') }}
                disabled={!emocionFinal()}
                className={cn(
                  'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                  emocionFinal()
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                    : 'bg-border text-muted-foreground cursor-not-allowed'
                )}
              >
                Continuar →
              </Button>

              <button
                onClick={() => setStep('para')}
                className="mt-3 w-full bg-transparent border-none font-sans text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            </div>
          )}

          {/* ── Step 4: dudas ── */}
          {step === 'dudas' && (
            <div className="ce-fade">
              <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
                Paso 4 de 4
              </p>
              <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
                ¿Qué te gustaría entender mejor?
              </h2>
              <p className="font-sans text-[15px] text-muted-foreground mb-6 leading-relaxed">
                Aliis enfocará la explicación en lo que más te importa.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {DUDAS_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    sub={opt.sub}
                    selected={dudas === opt.value}
                    onClick={() => { setDudas(opt.value); setDudasCustom('') }}
                  />
                ))}
              </div>

              {/* Opción libre — ancho completo bajo el grid */}
              <div className="flex flex-col gap-2.5 mb-5">
                <button
                  onClick={() => setDudas('__custom')}
                  className={cn(
                    'px-5 py-3 rounded-[14px] cursor-pointer text-left border-2 font-sans text-[14px] text-muted-foreground transition-[border-color,background] duration-150',
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
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                    : 'bg-border text-muted-foreground cursor-not-allowed'
                )}
              >
                {loading ? 'Preparando tu diagnóstico…' : 'Generar mi diagnóstico'}
              </Button>

              <button
                onClick={() => setStep('emocion')}
                className="mt-3 w-full bg-transparent border-none font-sans text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            </div>
          )}

          {/* ── Generating ── */}
          {step === 'generating' && (
            <div className="ce-fade flex flex-col items-center justify-center gap-8 min-h-[60vh] w-full">

              {/* 3 squares — wave bounce */}
              <div className="flex items-end gap-[6px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block w-[11px] h-[11px] rounded-[3px] bg-primary"
                    style={{ animation: `aliis-bounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
                  />
                ))}
              </div>

              {/* Stage text — crossfade on each cycle */}
              <div className="text-center px-6">
                <Eyebrow>· Trabajando en tu explicación ·</Eyebrow>
                <h2
                  aria-live="polite"
                  className="font-serif text-[20px] tracking-[-0.02em] mt-3 min-h-[56px] flex items-center justify-center transition-opacity duration-300"
                  style={{ opacity: stageVisible ? 1 : 0 }}
                >
                  {STAGES[stageIdx]}
                </h2>
              </div>

              {/* Circle progress + percentage — circle driven by ref for true 60fps */}
              <div className="flex items-center gap-3">
                <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle
                    ref={circleRef}
                    cx="22" cy="22" r="18" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE}
                  />
                </svg>
                <span className="font-mono text-[15px] text-foreground/70 tabular-nums w-12">
                  {progressPct}%
                </span>
              </div>

              {/* Current stage label only — clean, no list clutter */}
              <p className="font-sans text-[12px] text-muted-foreground/50 tracking-wide">
                Esto toma entre 20 y 40 segundos
              </p>

            </div>
          )}

          </div>
        </div>
      </>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
