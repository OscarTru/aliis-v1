'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type Currency = 'EUR' | 'USD' | 'MXN'
type Cycle = 'monthly' | 'yearly'

const PRICES: Record<Currency, { monthly: string; yearly: string; yearlyTotal: string; saving: string }> = {
  EUR: { monthly: '€9', yearly: '€7.50', yearlyTotal: '€90', saving: '€18' },
  USD: { monthly: '$9', yearly: '$7.50', yearlyTotal: '$90', saving: '$18' },
  MXN: { monthly: '$169', yearly: '$140', yearlyTotal: '$1,690', saving: '$338' },
}

function trialEndDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: 'var(--font-sans, sans-serif)',
      color: 'var(--foreground, #fff)',
      '::placeholder': { color: '#666' },
    },
    invalid: { color: '#ef4444' },
  },
}

function PaymentForm({
  clientSecret,
  priceKey,
  onPriceKeyChange,
}: {
  clientSecret: string
  priceKey: string
  onPriceKeyChange: (key: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const [currency, setCurrency] = useState<Currency>(() => {
    const c = priceKey.split('_')[0].toUpperCase() as Currency
    return ['EUR', 'USD', 'MXN'].includes(c) ? c : 'EUR'
  })
  const [cycle, setCycle] = useState<Cycle>(() =>
    priceKey.endsWith('yearly') ? 'yearly' : 'monthly'
  )

  useEffect(() => {
    onPriceKeyChange(`${currency.toLowerCase()}_${cycle}`)
  }, [currency, cycle, onPriceKeyChange])

  const prices = PRICES[currency]
  const displayPrice = cycle === 'yearly' ? prices.yearly : prices.monthly

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError(null)

    const cardNumber = elements.getElement(CardNumberElement)
    if (!cardNumber) { setProcessing(false); return }

    const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
      clientSecret,
      { payment_method: { card: cardNumber } }
    )

    if (setupError) {
      setError(setupError.message ?? 'Error al procesar la tarjeta.')
      setProcessing(false)
      return
    }

    const paymentMethodId = setupIntent?.payment_method as string
    if (!paymentMethodId) {
      setError('No se pudo obtener el método de pago.')
      setProcessing(false)
      return
    }

    const res = await fetch('/api/stripe/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId, priceKey: `${currency.toLowerCase()}_${cycle}` }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Algo salió mal. Inténtalo de nuevo.')
      setProcessing(false)
      return
    }

    router.push('/cuenta?upgrade=success')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Currency switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-full">
        {(['EUR', 'USD', 'MXN'] as Currency[]).map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            className={cn(
              'flex-1 py-1.5 rounded-full font-mono text-[11px] tracking-[.12em] border-none cursor-pointer transition-colors',
              currency === c ? 'bg-foreground text-background' : 'bg-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Cycle switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-full">
        {(['monthly', 'yearly'] as Cycle[]).map(cy => (
          <button
            key={cy}
            type="button"
            onClick={() => setCycle(cy)}
            className={cn(
              'flex-1 py-1.5 rounded-full font-sans text-[12px] border-none cursor-pointer transition-colors flex items-center justify-center gap-1.5',
              cycle === cy ? 'bg-foreground text-background' : 'bg-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {cy === 'monthly' ? 'Mensual' : 'Anual'}
            {cy === 'yearly' && (
              <span className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                cycle === 'yearly' ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'
              )}>
                −20%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Card fields */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="rounded-xl border border-border bg-background px-3 py-2.5">
          <CardNumberElement options={ELEMENT_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-background px-3 py-2.5">
            <CardExpiryElement options={ELEMENT_OPTIONS} />
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-2.5">
            <CardCvcElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="font-sans text-[12px] text-destructive">{error}</p>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={processing || !stripe}
        className={cn(
          'w-full py-3 rounded-full font-sans text-[14px] font-medium transition-colors border-none',
          processing || !stripe
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-foreground text-background cursor-pointer hover:opacity-90'
        )}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Procesando…
          </span>
        ) : (
          'Empezar 14 días gratis'
        )}
      </button>

      <p className="font-sans text-[11px] text-muted-foreground/50 text-center">
        🔒 Pago seguro · Stripe
      </p>
    </form>
  )
}

export function CheckoutForm({
  initialPriceKey,
  publishableKey,
}: {
  initialPriceKey: string
  publishableKey: string
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [priceKey, setPriceKey] = useState(initialPriceKey)
  const [stripePromise] = useState(() => loadStripe(publishableKey))

  const handlePriceKeyChange = useCallback((key: string) => setPriceKey(key), [])

  const currency = priceKey.split('_')[0].toUpperCase() as Currency
  const cycle = priceKey.endsWith('yearly') ? 'yearly' : 'monthly'
  const prices = PRICES[currency] ?? PRICES.EUR
  const displayPrice = cycle === 'yearly' ? prices.yearly : prices.monthly

  useEffect(() => {
    fetch('/api/stripe/setup-intent', { method: 'POST' })
      .then(r => r.json())
      .then(d => { if (d.clientSecret) setClientSecret(d.clientSecret) })
      .catch(console.error)
  }, [])

  return (
    <div className="w-full max-w-[860px]">
      {/* Back link */}
      <Link
        href="/precios"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.12em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors no-underline mb-6"
      >
        <ArrowLeft size={11} />
        Volver a precios
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0 rounded-2xl border border-border overflow-hidden bg-card">

        {/* Left — editorial */}
        <div className="flex flex-col gap-6 p-8 lg:p-10">
          {/* Logo */}
          <div>
            <Image
              src="/assets/aliis-original.png"
              alt="Aliis"
              width={80}
              height={28}
              className="object-contain dark:hidden"
            />
            <Image
              src="/assets/aliis-black.png"
              alt="Aliis"
              width={80}
              height={28}
              className="object-contain hidden dark:block"
            />
          </div>

          {/* Headline */}
          <div>
            <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-2">
              Aliis Pro
            </p>
            <h1 className="font-serif text-[28px] leading-[1.2] text-foreground">
              Entiende tu diagnóstico.{' '}
              <em className="text-muted-foreground/60">De verdad.</em>
            </h1>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            {[
              'Explicaciones ilimitadas con referencias reales',
              'Chat IA por capítulo de tu diagnóstico',
              'Diario de síntomas con seguimiento de Aliis',
            ].map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="text-primary mt-0.5">✓</span>
                <span className="font-sans text-[13px] text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          {/* Price — grows to bottom */}
          <div className="mt-auto pt-6 border-t border-border">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-[36px] font-bold text-foreground leading-none">
                {displayPrice}
              </span>
              <span className="font-sans text-[14px] text-muted-foreground">/mes</span>
            </div>
            {cycle === 'yearly' && (
              <p className="font-sans text-[12px] text-muted-foreground/70 mt-1">
                Facturado {prices.yearlyTotal}/año · ahorras {prices.saving}
              </p>
            )}
            <p className="font-sans text-[12px] text-primary mt-2">
              14 días gratis · sin cargo hasta el {trialEndDate()}
            </p>
          </div>
        </div>

        {/* Right — payment form */}
        <div className="flex flex-col justify-center p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-border bg-card">
          {!clientSecret ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: 'night' } }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                priceKey={priceKey}
                onPriceKeyChange={handlePriceKeyChange}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
