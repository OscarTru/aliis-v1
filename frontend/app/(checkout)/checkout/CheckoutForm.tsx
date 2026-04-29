'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type Currency = 'EUR' | 'USD' | 'MXN'
type Cycle = 'monthly' | 'yearly'

const PRICES: Record<Currency, { monthly: string; yearly: string; yearlyTotal: string; saving: string }> = {
  EUR: { monthly: '€9.99', yearly: '€7.99', yearlyTotal: '€95.88', saving: '€23.88' },
  USD: { monthly: '$9.99', yearly: '$7.99', yearlyTotal: '$95.88', saving: '$23.88' },
  MXN: { monthly: '$199', yearly: '$159', yearlyTotal: '$1,908', saving: '$480' },
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
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      color: '#ffffff',
      '::placeholder': { color: '#888' },
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
  const [coupon, setCoupon] = useState('')
  const [couponState, setCouponState] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [couponDiscount, setCouponDiscount] = useState<string | null>(null)
  const [promotionCodeId, setPromotionCodeId] = useState<string | null>(null)
  const couponTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    if (couponTimer.current) clearTimeout(couponTimer.current)
    const code = coupon.trim()
    if (!code) { setCouponState('idle'); setCouponDiscount(null); setPromotionCodeId(null); return }
    setCouponState('checking')
    couponTimer.current = setTimeout(async () => {
      const res = await fetch('/api/stripe/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }).catch(() => null)
      const data = res ? await res.json().catch(() => ({})) : {}
      if (data.valid) {
        setCouponState('valid')
        setCouponDiscount(data.discount)
        setPromotionCodeId(data.promotionCodeId)
      } else {
        setCouponState('invalid')
        setCouponDiscount(null)
        setPromotionCodeId(null)
      }
    }, 600)
    return () => { if (couponTimer.current) clearTimeout(couponTimer.current) }
  }, [coupon])

  const prices = PRICES[currency]

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
      body: JSON.stringify({ paymentMethodId, priceKey: `${currency.toLowerCase()}_${cycle}`, promotionCodeId }),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
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
      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-border bg-background px-3 py-3">
          <CardNumberElement options={ELEMENT_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <CardExpiryElement options={ELEMENT_OPTIONS} />
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <CardCvcElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Coupon */}
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Código de descuento (opcional)"
            spellCheck={false}
            autoComplete="off"
            className="w-full h-11 rounded-xl border border-border bg-background px-3 pr-8 font-mono text-[13px] tracking-wider placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {coupon.trim() && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px]">
              {couponState === 'checking' && <span className="text-muted-foreground">…</span>}
              {couponState === 'valid' && <span className="text-[#1f8a9b]">✓</span>}
              {couponState === 'invalid' && <span className="text-destructive">✗</span>}
            </span>
          )}
        </div>
        {couponState === 'valid' && couponDiscount && (
          <p className="font-sans text-[12px] text-[#1f8a9b] pl-1">{couponDiscount}</p>
        )}
        {couponState === 'invalid' && (
          <p className="font-sans text-[12px] text-destructive pl-1">Cupón no válido o expirado</p>
        )}
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
          'w-full py-3.5 rounded-full font-sans text-[15px] font-medium transition-colors border-none mt-1',
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

      <div className="flex items-center justify-center gap-2 text-muted-foreground/40">
        <ShieldCheck size={13} strokeWidth={1.5} />
        <span className="font-sans text-[11px]">Pago seguro · Powered by</span>
        <span className="font-sans font-bold text-[13px] tracking-tight -ml-1">Stripe</span>
      </div>
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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
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
      .then(d => {
        if (d.clientSecret) {
          setClientSecret(d.clientSecret)
          setLoadError(null)
        } else {
          setLoadError('No se pudo iniciar el pago. Inténtalo de nuevo.')
        }
      })
      .catch(() => setLoadError('Error de red. Inténtalo de nuevo.'))
  }, [retryCount])

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">

      {/* Left — editorial, dark bg */}
      <div className="bg-[#0a0a0a] flex flex-col px-10 py-12 lg:px-16 lg:py-16">
        {/* Back */}
        <Link
          href="/precios"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.12em] uppercase text-white/30 hover:text-white/60 transition-colors no-underline mb-12"
        >
          <ArrowLeft size={11} />
          Volver a precios
        </Link>

        <div className="flex flex-col gap-8 flex-1">
          {/* Logo */}
          <Image
            src="/assets/aliis-black-single.png"
            alt="Aliis"
            width={36}
            height={36}
            className="object-contain"
          />

          {/* Headline */}
          <div>
            <p className="font-mono text-[10px] tracking-[.18em] uppercase text-white/30 mb-3">
              Aliis Pro
            </p>
            <h1 className="font-serif text-[clamp(2rem,3.5vw,2.8rem)] leading-[1.15] text-white">
              Entiende tu diagnóstico.{' '}
              <em className="text-white/40">De verdad.</em>
            </h1>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {[
              'Explicaciones ilimitadas con referencias reales',
              'Chat IA por capítulo de tu diagnóstico',
              'Diario de síntomas con seguimiento de Aliis',
            ].map(f => (
              <li key={f} className="flex items-start gap-3">
                <span className="text-[#1f8a9b] mt-0.5 text-[15px]">✓</span>
                <span className="font-sans text-[14px] text-white/60">{f}</span>
              </li>
            ))}
          </ul>

          {/* Price — at bottom */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-[42px] font-bold text-white leading-none">
                {displayPrice}
              </span>
              <span className="font-sans text-[15px] text-white/40">/mes</span>
            </div>
            {cycle === 'yearly' && (
              <p className="font-sans text-[12px] text-white/40 mt-1.5">
                Facturado {prices.yearlyTotal}/año · ahorras {prices.saving}
              </p>
            )}
            <p className="font-sans text-[13px] text-[#1f8a9b] mt-2">
              14 días gratis · sin cargo hasta el {trialEndDate()}
            </p>
          </div>
        </div>
      </div>

      {/* Right — payment form */}
      <div className="bg-background flex flex-col items-center justify-center px-8 py-12 lg:px-16">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="font-sans text-[13px] text-muted-foreground text-center">{loadError}</p>
            <button
              type="button"
              onClick={() => { setLoadError(null); setRetryCount(c => c + 1) }}
              className="font-mono text-[11px] text-primary hover:underline border-none bg-transparent cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : !clientSecret ? (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-11 rounded-xl bg-muted animate-pulse" />
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
  )
}
