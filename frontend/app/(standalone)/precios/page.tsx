'use client'

import { useState, useTransition } from 'react'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
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
  { text: '1 explicación por semana', icon: 'solar:document-text-bold-duotone' },
  { text: 'Asistente IA por capítulo', icon: 'solar:chat-round-dots-bold-duotone' },
  { text: 'Diario de síntomas y vitales', icon: 'solar:notebook-bold-duotone' },
  { text: 'Control de tratamientos', icon: 'solar:pill-bold-duotone' },
  { text: 'Validación IA de dosis al añadir', icon: 'solar:shield-check-bold-duotone' },
  { text: 'Biblioteca de diagnósticos', icon: 'solar:library-bold-duotone' },
  { text: 'Compartir tu explicación', icon: 'solar:share-bold-duotone' },
  { text: 'Historial permanente', icon: 'solar:archive-bold-duotone' },
]

const PRO_FEATURES = [
  { text: 'Modelos Anthropic de mayor capacidad', sub: 'explicaciones más profundas, matices clínicos que los modelos pequeños pierden', icon: 'solar:cpu-bold-duotone' },
  { text: 'Explicaciones ilimitadas', sub: 'sin contadores ni fricción — cuando las necesites', icon: 'solar:infinity-bold-duotone' },
  { text: 'Personalizadas con tu perfil médico', sub: 'usa tus condiciones, medicamentos y alergias al generar cada explicación', icon: 'solar:user-id-bold-duotone' },
  { text: 'Agente Aliis con contexto completo', sub: 'recuerda tu historial, tus vitales y tus tratamientos activos en cada conversación', icon: 'solar:chat-round-bold-duotone' },
  { text: 'Notificaciones proactivas', sub: 'AliisCore analiza tus datos cada mañana y te avisa si algo merece atención', icon: 'solar:bell-bing-bold-duotone' },
  { text: 'Preparar consulta con tu médico', sub: 'resumen listo para llevar a la cita — en formato de preguntas concretas', icon: 'solar:stethoscope-bold-duotone' },
  { text: 'Análisis de correlación síntoma-vital', sub: 'cruza tu diario con glucosa, presión, FC y peso para ver patrones', icon: 'solar:graph-new-bold-duotone' },
  { text: 'El Hilo: análisis longitudinal mensual', sub: 'tu diario convertido en un resumen narrativo que evoluciona mes a mes', icon: 'solar:book-2-bold-duotone' },
  { text: 'Detector de inconsistencias dx ↔ tratamiento', sub: 'avisa si hay una condición sin tratamiento o un medicamento sin diagnóstico', icon: 'solar:danger-triangle-bold-duotone' },
]

const COMPARISON_ROWS: { label: string; free: string; pro: string }[] = [
  { label: 'Modelo de IA', free: 'Haiku (rápido)', pro: 'Sonnet — mayor capacidad' },
  { label: 'Explicaciones por semana', free: '1', pro: 'Ilimitadas' },
  { label: 'Personalización con perfil médico', free: '—', pro: '✓' },
  { label: 'Referencias verificables (PubMed, DOI)', free: '✓', pro: '✓' },
  { label: 'Agente Aliis conversacional', free: '✓ básico', pro: '✓ con contexto completo' },
  { label: 'Notificaciones proactivas', free: '—', pro: '✓' },
  { label: 'Historial de explicaciones', free: 'Permanente', pro: 'Permanente' },
  { label: 'Diario de síntomas y vitales', free: '✓', pro: '✓' },
  { label: 'Control de tratamientos', free: '✓', pro: '✓' },
  { label: 'Validación IA de dosis', free: '✓', pro: '✓' },
  { label: 'Compartir tu explicación', free: '✓', pro: '✓' },
  { label: 'Preparar consulta con tu médico', free: '—', pro: '✓' },
  { label: 'Detector de inconsistencias', free: '—', pro: '✓' },
  { label: 'Análisis de correlación síntoma-vital', free: '—', pro: '✓' },
  { label: 'El Hilo: análisis longitudinal mensual', free: '—', pro: '✓' },
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
    a: 'Cada afirmación va acompañada de su referencia. Antes de responder, un clasificador descarta preguntas fuera de dominio y un verificador comprueba que cada fuente exista. Si la evidencia no soporta una frase, el sistema no la incluye.',
  },
  {
    q: '¿Qué diferencia hay realmente entre Gratis y Pro?',
    a: 'La diferencia principal es el modelo de IA. Gratis usa Claude Haiku (rápido, bueno para explicaciones directas). Pro usa Claude Sonnet, que maneja mejor los matices clínicos, condiciones complejas y la personalización con tu perfil médico. Además, Pro desbloquea el análisis longitudinal: correlaciones síntoma-vital, El Hilo mensual y las notificaciones proactivas.',
  },
  {
    q: '¿Las explicaciones de Gratis son peores?',
    a: 'Son sólidas y con las mismas fuentes, pero generadas por un modelo más pequeño. La diferencia se nota en diagnósticos complejos con comorbilidades, donde Sonnet profundiza más y Haiku puede quedarse en la superficie.',
  },
  {
    q: '¿Qué pasa si cancelo Pro?',
    a: 'No pierdes nada. Tu historial, tu diario, tus tratamientos y tus explicaciones siguen ahí. Solo dejas de generar nuevas explicaciones ilimitadas y pierdes el acceso a las herramientas Pro.',
  },
  {
    q: '¿Esto reemplaza a mi médico?',
    a: 'Nunca. Es lo que te prepara para ir con mejores preguntas. Cada pantalla lo recuerda. No diagnostica, no recomienda dosis, no es para emergencias.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Tu diario, tus síntomas y tu perfil médico son privados. No vendemos datos, no entrenamos modelos con ellos. Puedes exportar todo o borrar tu cuenta cuando quieras.',
  },
]

export default function PreciosPage() {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [cadence, setCadence] = useState<Cadence>('monthly')
  const [showLogin, setShowLogin] = useState(false)
  const [isPending, startTransition] = useTransition()

  const price = PRICES[cadence][currency]

  function handleBack() {
    // Prefer browser history when available so the user returns exactly
    // where they came from. Fall back to landing if there is none.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <>
      {/* Sticky top bar — back button only, no shell nav */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 h-14 flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <Icon icon="solar:arrow-left-bold-duotone" width={16} />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-[72rem] mx-auto px-4 sm:px-6 pt-14 pb-[120px]">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex justify-center mb-5">
            <Capsule tone="teal">14 días gratis · sin tarjeta hasta que decidas</Capsule>
          </div>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] mb-4">
            Entiende mejor.{' '}
            <em className="text-muted-foreground/55">Con modelos más potentes.</em>
          </h1>
          <p className="font-sans text-[16px] text-muted-foreground max-w-[54ch] mx-auto leading-relaxed">
            Gratis te da lo esencial: tu explicación, tu diario y tu asistente. Pro activa los modelos más avanzados de Anthropic y el análisis longitudinal que detecta lo que tú no ves aún.
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
        <div className="grid gap-6 mb-16 grid-cols-1 md:grid-cols-[1fr_1.15fr] items-start">

          {/* Free card */}
          <article className="px-7 pt-8 pb-8 rounded-3xl border border-border bg-transparent flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-serif text-[26px] tracking-[-0.02em] leading-[1.05] m-0">Gratis</h2>
              <span className="font-mono text-[9px] tracking-[.18em] uppercase text-muted-foreground/50 px-2 py-[3px] rounded-full border border-border">Empieza aquí</span>
            </div>
            <p className="font-serif italic text-[14px] text-muted-foreground mb-6 leading-snug">Para entender tu diagnóstico hoy.</p>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-serif text-[44px] tracking-[-0.03em] leading-none">€0</span>
              <span className="font-sans text-[13px] text-muted-foreground">para siempre</span>
            </div>

            <div className="my-6 h-px bg-border" />

            <ul className="list-none p-0 mb-7 flex flex-col gap-[11px] flex-1">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon icon={f.icon} width={13} className="text-muted-foreground/60" />
                  </div>
                  <span className="font-sans text-[13.5px] text-foreground/85">{f.text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowLogin(true)}
              className="px-5 py-[12px] rounded-[12px] font-sans text-[14.5px] font-medium flex items-center justify-center gap-2 border border-border bg-transparent text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Crear cuenta gratis
              <Icon icon="solar:arrow-right-bold-duotone" width={15} />
            </button>
          </article>

          {/* Pro card — clean and contained, no overflow tricks */}
          <article
            className="relative px-8 pt-9 pb-9 rounded-3xl flex flex-col"
            style={{
              background: 'hsl(var(--secondary) / 0.04)',
              border: '1.5px solid hsl(var(--secondary) / 0.4)',
              boxShadow: '0 1px 0 hsl(var(--secondary) / 0.15) inset, 0 12px 40px -18px hsl(var(--secondary) / 0.35)',
            }}
          >
            {/* Recomendado badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full font-mono text-[10px] tracking-[.2em] uppercase whitespace-nowrap shadow-[0_4px_12px_rgba(31,138,155,.3)]">
              Recomendado
            </div>

            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-serif text-[30px] tracking-[-0.02em] leading-[1.05] m-0">Pro</h2>
              <Icon icon="solar:crown-bold-duotone" width={22} className="text-secondary" />
            </div>
            <p className="font-serif italic text-[15px] text-muted-foreground mb-6 leading-snug">
              Para quien quiere profundidad real y que Aliis aprenda de sus datos.
            </p>

            <motion.div
              key={`${cadence}-${currency}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-baseline gap-2 mb-1"
            >
              <span className="font-serif text-[52px] tracking-[-0.03em] leading-none">{price.display}</span>
              <span className="font-sans text-[13px] text-muted-foreground">{price.sub}</span>
            </motion.div>
            {cadence === 'yearly' && (
              <div className="font-mono text-[10px] tracking-[.15em] uppercase text-emerald-500 mt-1">
                Ahorras 20% con plan anual
              </div>
            )}

            <div className="my-6 h-px bg-secondary/15" />

            <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/55 mb-4">
              Todo lo de Gratis, más:
            </div>

            <ul className="list-none p-0 mb-8 flex flex-col gap-[14px] flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-secondary/25">
                    <Icon icon={f.icon} width={15} className="text-secondary" />
                  </div>
                  <div>
                    <div className="font-sans text-[14.5px] text-foreground leading-tight font-medium">{f.text}</div>
                    {f.sub && (
                      <div className="font-serif italic text-[12.5px] text-muted-foreground/70 mt-[3px] leading-snug">{f.sub}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={() => startTransition(() => createCheckoutSession(currency.toLowerCase(), cadence))}
              disabled={isPending}
              className={cn(
                'px-5 py-[14px] rounded-[12px] font-sans text-[15px] font-medium flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all cursor-pointer',
                isPending && 'opacity-70 cursor-default'
              )}
              style={{ boxShadow: '0 0 0 1px hsl(var(--secondary) / .35), 0 8px 24px -8px hsl(var(--secondary) / .5)' }}
            >
              {isPending ? 'Redirigiendo…' : 'Empezar 14 días gratis'}
              {!isPending && <Icon icon="solar:arrow-right-bold-duotone" width={16} />}
            </button>
            <div className="text-center font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50 mt-3">
              No te cobramos hasta que decidas seguir
            </div>
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
