'use client'

import { useState, useTransition } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Capsule } from '@/components/ui/Capsule'
import { LoginModal } from '@/components/LoginModal'
import { createCheckoutSession } from '@/app/actions/checkout'
import { cn } from '@/lib/utils'

type Currency = 'EUR' | 'USD' | 'MXN'
type Cadence = 'monthly' | 'yearly'

const PRICES: Record<Cadence, Record<Currency, { display: string; sub: string }>> = {
  monthly: {
    EUR: { display: '€9.99', sub: 'al mes' },
    USD: { display: '$9.99', sub: 'al mes' },
    MXN: { display: '$199', sub: 'al mes · MXN' },
  },
  yearly: {
    EUR: { display: '€7.99', sub: 'al mes · facturado anual' },
    USD: { display: '$7.99', sub: 'al mes · facturado anual' },
    MXN: { display: '$159', sub: 'al mes · facturado anual · MXN' },
  },
}

const FREE_FEATURES = [
  { text: '2 expedientes por semana', icon: 'solar:document-text-bold-duotone' },
  { text: 'Referencias científicas verificables', icon: 'solar:link-bold-duotone' },
  { text: 'Biblioteca de diagnósticos', icon: 'solar:library-bold-duotone' },
  { text: 'Diario de síntomas', icon: 'solar:notebook-bold-duotone' },
  { text: 'Registro de tratamientos + racha', icon: 'solar:pill-bold-duotone' },
  { text: 'Asistente IA (5 preguntas/día)', icon: 'solar:chat-round-dots-bold-duotone' },
]

const PRO_FEATURES = [
  { text: 'Expedientes ilimitados', sub: 'sin contadores, sin fricción', icon: 'solar:infinity-bold-duotone' },
  { text: 'Asistente IA ilimitado', sub: 'pregunta cuanto quieras, sin tope diario', icon: 'solar:chat-round-dots-bold-duotone' },
  { text: 'Preparar consulta con tu médico', sub: 'resumen personalizado para llevar', icon: 'solar:stethoscope-bold-duotone' },
  { text: 'Diario de síntomas y tratamientos', sub: 'igual que en Gratis, siempre incluido', icon: 'solar:notebook-bold-duotone' },
  { text: 'Historial permanente', sub: 'todos tus expedientes siempre disponibles', icon: 'solar:archive-bold-duotone' },
  { text: 'Compartir tu expediente', sub: 'con familiares, pareja o médicos', icon: 'solar:users-group-two-rounded-bold-duotone' },
  { text: 'Referencias DOI, PubMed y guías clínicas', sub: 'desplegables en cada capítulo', icon: 'solar:diploma-bold-duotone' },
  { text: 'Soporte prioritario', sub: 'respondemos en menos de 24 h', icon: 'solar:headphones-round-sound-bold-duotone' },
]

const COMPARISON_ROWS: { label: string; free: string; pro: string }[] = [
  { label: 'Expedientes por semana', free: '2', pro: 'Ilimitados' },
  { label: 'Referencias verificables (DOI, PubMed)', free: '✓', pro: '✓ desplegables' },
  { label: 'Historial de diagnósticos', free: '30 días', pro: 'Permanente' },
  { label: 'Diario de síntomas', free: '✓', pro: '✓' },
  { label: 'Control de tratamientos + racha', free: '✓', pro: '✓' },
  { label: 'Asistente IA por capítulo', free: '5 preguntas/día', pro: 'Ilimitado' },
  { label: 'Preparar consulta', free: '—', pro: '✓' },
  { label: 'Compartir expediente', free: '—', pro: '✓' },
  { label: 'Soporte prioritario', free: '—', pro: '✓' },
]

const TRUST_PILLARS = [
  {
    icon: 'solar:shield-check-bold-duotone',
    eyebrow: 'Evidencia',
    title: 'Basado en ciencia revisada por pares',
    body: 'Cada afirmación lleva su referencia desplegable — PubMed, DOI, guías clínicas. Si una fuente no existe, el sistema no la escribe.',
  },
  {
    icon: 'solar:stethoscope-bold-duotone',
    eyebrow: 'Límite claro',
    title: 'No reemplaza a tu médico',
    body: 'Disclaimer visible en cada pantalla. Aliis es lo que te prepara para la consulta, no lo que la sustituye.',
  },
  {
    icon: 'solar:lightbulb-bold-duotone',
    eyebrow: 'Origen',
    title: 'Hecho por Cerebros Esponjosos',
    body: 'La misma voz que ya sigues. La misma obsesión por explicar medicina bien, sin condescendencia.',
  },
]

const FAQ = [
  {
    q: '¿Cómo sé que la IA no se inventa cosas?',
    a: 'Cada afirmación va acompañada de su referencia desplegable. Si la fuente no existe o no soporta la frase, el sistema no la incluye.',
  },
  {
    q: '¿Qué pasa si cancelo?',
    a: 'Tus explicaciones siguen disponibles hasta 30 días. Si vuelves antes, retomas exactamente donde estabas.',
  },
  {
    q: '¿Las explicaciones gratis son peores?',
    a: 'No. Son la misma calidad, con las mismas referencias. La diferencia está en el volumen, el asistente IA y las herramientas avanzadas.',
  },
  {
    q: '¿Esto reemplaza a mi médico?',
    a: 'Nunca. Es lo que te prepara para ir con mejores preguntas. Siempre aparece como disclaimer en cada pantalla.',
  },
]

export default function PreciosPage() {
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [cadence, setCadence] = useState<Cadence>('monthly')
  const [showLogin, setShowLogin] = useState(false)
  const [isPending, startTransition] = useTransition()

  const price = PRICES[cadence][currency]

  return (
    <>
      {/* Sticky top bar — back button only, no shell nav */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 hover:text-foreground transition-colors no-underline"
          >
            <Icon icon="solar:arrow-left-bold-duotone" width={16} />
            Volver
          </Link>
        </div>
      </div>

      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 pt-14 pb-[120px]">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex justify-center mb-5">
            <Capsule tone="teal">💡 14 días gratis · cancelas cuando quieras</Capsule>
          </div>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] mb-4">
            Entiende tu salud{' '}
            <em className="text-muted-foreground/55">por menos que un café al mes.</em>
          </h1>
          <p className="font-sans text-[16px] text-muted-foreground max-w-[52ch] mx-auto leading-relaxed">
            Gratis funciona para un diagnóstico puntual. Pro es para quien convive con el suyo.
          </p>
        </div>

        {/* Switchers row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* Currency */}
          <div className="flex gap-[2px] p-[3px] bg-muted border border-border rounded-full">
            {(['EUR', 'USD', 'MXN'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  'px-4 py-[7px] rounded-full font-mono text-[11px] tracking-[.15em] border-none cursor-pointer transition-colors',
                  currency === c
                    ? 'bg-foreground text-background'
                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Cadence */}
          <div className="flex gap-[2px] p-[3px] bg-muted border border-border rounded-full">
            {([['monthly', 'Mensual'], ['yearly', 'Anual']] as [Cadence, string][]).map(([c, label]) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={cn(
                  'px-4 py-[7px] rounded-full font-mono text-[11px] tracking-[.12em] border-none cursor-pointer transition-colors flex items-center gap-1.5',
                  cadence === c
                    ? 'bg-foreground text-background'
                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
                {c === 'yearly' && (
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-sans font-medium transition-colors',
                    cadence === 'yearly' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/15 text-emerald-500/70'
                  )}>
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 mb-16 grid-cols-1 md:grid-cols-2">

          {/* Free card */}
          <article className="px-8 pt-8 pb-9 rounded-3xl border border-border bg-transparent flex flex-col">
            <h2 className="font-serif text-[28px] tracking-[-0.02em] mb-1 leading-[1.05]">Gratis</h2>
            <p className="font-serif italic text-[15px] text-muted-foreground mb-6">Para entender un diagnóstico puntual.</p>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-serif text-[48px] tracking-[-0.03em] leading-none">€0</span>
              <span className="font-sans text-[13px] text-muted-foreground">para siempre</span>
            </div>

            <div className="my-6 h-px bg-border" />

            <ul className="list-none p-0 mb-8 flex flex-col gap-[13px] flex-1">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon icon={f.icon} width={15} className="text-muted-foreground/60" />
                  </div>
                  <span className="font-sans text-[14px] text-foreground">{f.text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowLogin(true)}
              className="px-5 py-[13px] rounded-[12px] font-sans text-[15px] font-medium flex items-center justify-center gap-2 border border-border bg-transparent text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Empezar gratis
              <Icon icon="solar:arrow-right-bold-duotone" width={16} />
            </button>
          </article>

          {/* Pro card */}
          <article className="relative px-8 pt-8 pb-9 rounded-3xl border border-foreground bg-muted flex flex-col">
            <div className="absolute -top-3 left-8 px-3 py-1 bg-foreground text-background rounded-full font-mono text-[10px] tracking-[.2em] uppercase">
              Más popular
            </div>

            <h2 className="font-serif text-[28px] tracking-[-0.02em] mb-1 leading-[1.05]">Pro</h2>
            <p className="font-serif italic text-[15px] text-muted-foreground mb-6">Para quien convive con su diagnóstico.</p>

            <motion.div
              key={`${cadence}-${currency}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-baseline gap-2 mb-1"
            >
              <span className="font-serif text-[48px] tracking-[-0.03em] leading-none">{price.display}</span>
              <span className="font-sans text-[13px] text-muted-foreground">{price.sub}</span>
            </motion.div>

            <div className="my-6 h-px bg-border" />

            <ul className="list-none p-0 mb-8 flex flex-col gap-[13px] flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon icon={f.icon} width={15} className="text-primary/70" />
                  </div>
                  <div>
                    <div className="font-sans text-[14px] text-foreground leading-tight">{f.text}</div>
                    {f.sub && (
                      <div className="font-serif italic text-[12px] text-muted-foreground/60 mt-[2px]">{f.sub}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startTransition(() => createCheckoutSession(currency.toLowerCase(), cadence))}
              disabled={isPending}
              className={cn(
                'px-5 py-[13px] rounded-[12px] font-sans text-[15px] font-medium flex items-center justify-center gap-2 border border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-opacity cursor-pointer',
                isPending && 'opacity-70 cursor-default'
              )}
            >
              {isPending ? 'Redirigiendo…' : 'Empezar 14 días gratis'}
              {!isPending && <Icon icon="solar:arrow-right-bold-duotone" width={16} />}
            </button>
          </article>
        </div>

        {/* Comparison table */}
        <div className="border border-border rounded-[20px] overflow-hidden bg-muted mb-16">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-serif text-[22px] m-0">Compara todo, sin trampas.</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-sans text-[14px] min-w-[480px]">
              <thead>
                <tr className="bg-background">
                  <th className="text-left px-6 py-4 font-normal font-mono text-[10px] tracking-[.2em] uppercase text-muted-foreground/60">Funcionalidad</th>
                  <th className="text-center px-4 py-4 font-normal font-mono text-[10px] tracking-[.2em] uppercase text-muted-foreground/60">Gratis</th>
                  <th className="text-center px-4 py-4 font-medium font-mono text-[10px] tracking-[.2em] uppercase text-foreground">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-6 py-[13px]">{r.label}</td>
                    <td className={cn('px-4 py-[13px] text-center', r.free === '—' ? 'text-muted-foreground/30' : 'text-muted-foreground')}>{r.free}</td>
                    <td className={cn('px-4 py-[13px] text-center font-medium', r.pro === '—' ? 'text-muted-foreground/30' : 'text-foreground')}>{r.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust pillars */}
        <div className="grid gap-8 p-10 bg-muted border border-border rounded-[20px] mb-16 grid-cols-1 sm:grid-cols-3">
          {TRUST_PILLARS.map((p, i) => (
            <div key={i}>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon icon={p.icon} width={20} className="text-primary/70" />
              </div>
              <div className="font-mono text-[10px] tracking-[.22em] uppercase text-primary/60 mb-2">· {p.eyebrow} ·</div>
              <h4 className="font-serif text-[18px] leading-[1.25] tracking-[-0.01em] mb-2 mt-0">{p.title}</h4>
              <p className="font-sans text-[13.5px] leading-[1.65] text-muted-foreground m-0">{p.body}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h3 className="font-serif text-[28px] text-center mb-8 mt-0">Preguntas frecuentes</h3>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {FAQ.map((f, i) => (
              <div key={i} className="p-6 rounded-[16px] border border-border bg-muted">
                <div className="font-serif text-[17px] mb-2 leading-[1.35]">{f.q}</div>
                <div className="font-sans text-[14px] text-muted-foreground leading-[1.65]">{f.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
