'use client'

import { useState, useTransition } from 'react'
import { AppShell } from '../../components/AppShell'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { Capsule } from '../../components/ui/Capsule'
import { LoginModal } from '../../components/LoginModal'
import { PRICING_TIERS } from '../../lib/mock-data'
import { createCheckoutSession } from '../actions/checkout'
import { cn } from '@/lib/utils'

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
  const [isPending, startTransition] = useTransition()

  return (
    <AppShell>
      <div className="max-w-[72rem] mx-auto px-6 pt-12 pb-[120px]">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex justify-center mb-[18px]">
            <Capsule tone="teal">💡 14 días gratis · cancelas cuando quieras</Capsule>
          </div>
          <h1 className="font-serif leading-[1.05] tracking-[-0.02em] mb-[14px]" style={{ fontSize: 'clamp(2.5rem,5vw,3.5rem)' }}>
            Entiende tu cerebro{' '}
            <em className="text-[color:var(--c-text-faint)]">por menos que un café al mes.</em>
          </h1>
          <p className="font-sans text-[16px] text-muted-foreground max-w-[54ch] mx-auto">
            Gratis funciona para un diagnóstico puntual. Pro es para quien convive con el suyo.
          </p>
        </div>

        {/* Currency switcher */}
        <div className="flex justify-center mb-9">
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
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 mb-14" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          {([PRICING_TIERS.gratis, PRICING_TIERS.pro] as const).map((tier) => (
            <article
              key={tier.name}
              className={cn(
                'relative px-9 pt-9 pb-10 rounded-3xl border flex flex-col',
                tier.highlight
                  ? 'bg-muted border-foreground'
                  : 'bg-transparent border-border'
              )}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-8 px-3 py-1 bg-foreground text-background rounded-full font-mono text-[10px] tracking-[.2em] uppercase">
                  Nuestra recomendación
                </div>
              )}

              <div className="mb-5">
                <Capsule tone={tier.highlight ? 'teal' : 'ghost'}>
                  {tier.highlight ? 'Referencias verificables' : 'Basado en evidencia'}
                </Capsule>
              </div>

              <h2 className="font-serif text-[32px] tracking-[-0.02em] mb-2 leading-[1.05]">
                {tier.name}
              </h2>
              <p className="font-serif italic text-[17px] text-muted-foreground mb-6">
                {tier.pitch}
              </p>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-serif text-[52px] tracking-[-0.03em] leading-none">
                  {tier.prices[currency]}
                </span>
                <span className="font-sans text-[14px] text-muted-foreground">
                  {tier.cadence}
                </span>
              </div>

              <div className="my-6 h-px bg-border" />

              <ul className="list-none p-0 mb-8 flex flex-col gap-[14px] flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className={cn('flex gap-3 items-start', !f.included && 'opacity-40')}>
                    <span className="shrink-0 mt-1 w-[14px] h-[14px] flex items-center justify-center">
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
                      <div className="font-sans text-[15px] leading-[1.4]">{f.text}</div>
                      {f.sub && (
                        <div className="font-serif italic text-[13px] text-[color:var(--c-text-faint)] mt-[2px]">
                          {f.sub}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (tier.highlight) {
                    startTransition(() => createCheckoutSession(currency.toLowerCase(), 'monthly'))
                  } else {
                    setShowLogin(true)
                  }
                }}
                disabled={tier.highlight && isPending}
                className={cn(
                  'px-5 py-[13px] rounded-[12px] font-sans text-[15px] font-medium flex items-center justify-center gap-2 border transition-opacity',
                  tier.highlight
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-foreground border-border hover:bg-muted',
                  tier.highlight && isPending && 'opacity-70 cursor-default'
                )}
              >
                {tier.highlight && isPending ? 'Redirigiendo…' : tier.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </article>
          ))}
        </div>

        {/* Comparison table */}
        <div className="border border-border rounded-[20px] overflow-hidden bg-muted mb-14">
          <div className="px-6 py-[18px] border-b border-border">
            <h3 className="font-serif text-[22px] m-0">Compara todo, sin trampas.</h3>
          </div>
          <table className="w-full border-collapse font-sans text-[14px]">
            <thead>
              <tr className="bg-background">
                <th className="text-left px-6 py-[14px] font-normal font-mono text-[10px] tracking-[.2em] uppercase text-[color:var(--c-text-subtle)]">Funcionalidad</th>
                <th className="text-center px-4 py-[14px] font-normal font-mono text-[10px] tracking-[.2em] uppercase text-[color:var(--c-text-subtle)]">Gratis</th>
                <th className="text-center px-4 py-[14px] font-medium font-mono text-[10px] tracking-[.2em] uppercase text-foreground">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-6 py-[14px]">{r[0]}</td>
                  <td className="px-4 py-[14px] text-center text-muted-foreground">{r[1]}</td>
                  <td className="px-4 py-[14px] text-center font-medium">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trust pillars */}
        <div className="grid gap-6 p-10 bg-muted border border-border rounded-[20px] mb-14" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {[
            { eyebrow: 'Evidencia', title: 'Basado en evidencia científica', body: 'Cada afirmación con su referencia. Desplegables para comprobar.' },
            { eyebrow: 'Límite', title: 'No reemplaza a tu médico', body: 'Disclaimer visible siempre. Es preparación, no diagnóstico.' },
            { eyebrow: 'Origen', title: 'Por Cerebros Esponjosos', body: 'La misma voz que ya sigues. La misma obsesión por explicar bien.' },
          ].map((p, i) => (
            <div key={i}>
              <div className="font-mono text-[10px] tracking-[.22em] uppercase text-[color:var(--c-brand-teal-deep)] mb-[14px]">· {p.eyebrow} ·</div>
              <h4 className="font-serif text-[20px] leading-[1.25] tracking-[-0.01em] mb-[10px] mt-0">{p.title}</h4>
              <p className="font-sans text-[13.5px] leading-[1.65] text-muted-foreground m-0">{p.body}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h3 className="font-serif text-[28px] text-center mb-8">Preguntas frecuentes</h3>
          <div className="grid gap-7" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
            {FAQ.map((f, i) => (
              <div key={i}>
                <div className="font-serif text-[17px] mb-2 leading-[1.35]">{f.q}</div>
                <div className="font-sans text-[14px] text-muted-foreground leading-[1.65]">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </AppShell>
  )
}
