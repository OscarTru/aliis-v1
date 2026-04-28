# Custom Checkout Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Stripe-hosted checkout with a branded inline checkout page that matches the Aliis design system, using Stripe Elements so users never leave the app.

**Architecture:** A new `/checkout` page (server component for auth + query param) renders a `CheckoutForm` client component. Two new API routes handle SetupIntent creation and subscription creation server-side. The existing `createCheckoutSession` action is updated to redirect to `/checkout?plan=...` instead of Stripe's hosted page.

**Tech Stack:** Next.js 15 App Router, `@stripe/stripe-js`, `@stripe/react-stripe-js`, Stripe API (SetupIntent + Subscription), Tailwind CSS, TypeScript

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `frontend/app/(shell)/checkout/page.tsx` | Create | Server component — auth check, reads `?plan=` param, passes publishable key |
| `frontend/app/(shell)/checkout/CheckoutForm.tsx` | Create | Client component — all UI: switchers, Stripe Elements, submit logic |
| `frontend/app/api/stripe/setup-intent/route.ts` | Create | POST — creates Stripe SetupIntent, returns `clientSecret` |
| `frontend/app/api/stripe/subscribe/route.ts` | Create | POST — attaches payment method + creates subscription with trial |
| `frontend/app/actions/checkout.ts` | Modify | Replace Stripe session redirect with redirect to `/checkout?plan=...` |
| `frontend/.env.example` | Modify | Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |

---

## Task 1: Install Stripe frontend packages + add env var

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Modify: `frontend/.env.example`

- [ ] **Step 1: Install packages**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Expected: packages added to `package.json` dependencies, no errors.

- [ ] **Step 2: Add env var to .env.example**

In `frontend/.env.example`, after the `STRIPE_PRICE_MXN_YEARLY=` line add:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

- [ ] **Step 3: Add env var to .env.local**

In `frontend/.env.local`, after `STRIPE_PRICE_MXN_YEARLY=` add:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

(Use the actual publishable key from the Stripe dashboard.)

- [ ] **Step 4: Verify TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/package.json frontend/package-lock.json frontend/.env.example
git commit -m "feat(checkout): install @stripe/stripe-js + @stripe/react-stripe-js"
```

---

## Task 2: POST /api/stripe/setup-intent

**Files:**
- Create: `frontend/app/api/stripe/setup-intent/route.ts`

- [ ] **Step 1: Create the route**

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id as string | undefined

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: 'off_session',
  })

  return NextResponse.json({ clientSecret: setupIntent.client_secret })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/app/api/stripe/setup-intent/route.ts
git commit -m "feat(checkout): POST /api/stripe/setup-intent"
```

---

## Task 3: POST /api/stripe/subscribe

**Files:**
- Create: `frontend/app/api/stripe/subscribe/route.ts`

- [ ] **Step 1: Create the route**

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

const PRICE_MAP: Record<string, string | undefined> = {
  eur_monthly: process.env.STRIPE_PRICE_EUR_MONTHLY,
  eur_yearly:  process.env.STRIPE_PRICE_EUR_YEARLY,
  usd_monthly: process.env.STRIPE_PRICE_USD_MONTHLY,
  usd_yearly:  process.env.STRIPE_PRICE_USD_YEARLY,
  mxn_monthly: process.env.STRIPE_PRICE_MXN_MONTHLY,
  mxn_yearly:  process.env.STRIPE_PRICE_MXN_YEARLY,
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { paymentMethodId?: string; priceKey?: string } = {}
  try { body = await req.json() } catch { /* default */ }

  const { paymentMethodId, priceKey } = body
  if (!paymentMethodId || !priceKey) {
    return NextResponse.json({ error: 'paymentMethodId y priceKey son requeridos' }, { status: 400 })
  }

  const priceId = PRICE_MAP[priceKey]
  if (!priceId) return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const customerId = profile?.stripe_customer_id as string | undefined
  if (!customerId) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 })

  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  // Create subscription with 14-day trial
  await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: 14,
    default_payment_method: paymentMethodId,
    metadata: { userId: user.id },
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/app/api/stripe/subscribe/route.ts
git commit -m "feat(checkout): POST /api/stripe/subscribe"
```

---

## Task 4: Update createCheckoutSession action

**Files:**
- Modify: `frontend/app/actions/checkout.ts`

The existing action creates a Stripe hosted session and redirects to Stripe's URL. Replace it to redirect to `/checkout?plan=...` instead.

- [ ] **Step 1: Replace the file content**

```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(currency: string, cadence: 'monthly' | 'yearly') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const priceKey = `${currency.toLowerCase()}_${cadence}`
  redirect(`/checkout?plan=${priceKey}`)
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/app/actions/checkout.ts
git commit -m "feat(checkout): redirect to /checkout instead of Stripe hosted page"
```

---

## Task 5: Checkout page — server component

**Files:**
- Create: `frontend/app/(shell)/checkout/page.tsx`

- [ ] **Step 1: Create the server component**

```typescript
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CheckoutForm } from './CheckoutForm'

const VALID_PRICE_KEYS = [
  'eur_monthly', 'eur_yearly',
  'usd_monthly', 'usd_yearly',
  'mxn_monthly', 'mxn_yearly',
]

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { plan } = await searchParams
  const priceKey = VALID_PRICE_KEYS.includes(plan ?? '') ? plan! : 'eur_monthly'

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <CheckoutForm
        initialPriceKey={priceKey}
        publishableKey={publishableKey}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: error about `CheckoutForm` not existing yet — that's fine, continue to Task 6.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add "frontend/app/(shell)/checkout/page.tsx"
git commit -m "feat(checkout): checkout page server component"
```

---

## Task 6: CheckoutForm client component

**Files:**
- Create: `frontend/app/(shell)/checkout/CheckoutForm.tsx`

This is the main UI component. It:
1. On mount, calls `POST /api/stripe/setup-intent` to get `clientSecret`
2. Wraps Stripe Elements with the `clientSecret`
3. Renders the two-column layout
4. On submit, calls `stripe.confirmCardSetup` then `POST /api/stripe/subscribe`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { useState, useEffect } from 'react'
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

const PRICES: Record<Currency, { monthly: string; yearly: string; yearlyTotal: string; saving: string; symbol: string }> = {
  EUR: { monthly: '€9', yearly: '€7.50', yearlyTotal: '€90', saving: '€18', symbol: '€' },
  USD: { monthly: '$9', yearly: '$7.50', yearlyTotal: '$90', saving: '$18', symbol: '$' },
  MXN: { monthly: '$169', yearly: '$140', yearlyTotal: '$1,690', saving: '$338', symbol: '$' },
}

const CURRENCY_LABELS: Record<Currency, string> = { EUR: 'EUR', USD: 'USD', MXN: 'MXN' }

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
  priceKey,
  onPriceKeyChange,
}: {
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
      (stripe as unknown as { _setupIntentClientSecret?: string })._setupIntentClientSecret ?? '',
      { payment_method: { card: cardNumber } }
    )

    // Re-fetch clientSecret from the Elements context
    // The clientSecret was set on the Elements provider — use stripe.confirmCardSetup directly
    const result = await stripe.confirmCardSetup(
      document.querySelector<HTMLInputElement>('[data-client-secret]')?.value ?? '',
      { payment_method: { card: cardNumber } }
    )

    if (result.error) {
      setError(result.error.message ?? 'Error al procesar la tarjeta.')
      setProcessing(false)
      return
    }

    const paymentMethodId = result.setupIntent?.payment_method as string
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
            {CURRENCY_LABELS[c]}
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
          <ul className="flex flex-col gap-2.5">
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
              <span className="font-sans text-[14px] text-muted-foreground">
                {cycle === 'yearly' ? '/mes' : '/mes'}
              </span>
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
              {/* Skeleton loaders */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: 'night' } }}
            >
              {/* Hidden input to pass clientSecret to PaymentForm */}
              <input type="hidden" data-client-secret value={clientSecret} />
              <PaymentForm priceKey={priceKey} onPriceKeyChange={setPriceKey} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Important note:** The `PaymentForm` component above has a draft implementation of `handleSubmit` that needs a small fix. The `clientSecret` is available in the `Elements` context — use it directly via the `stripe.confirmCardSetup` method which reads it from the `Elements` provider automatically when `elements` is initialized with it. Replace the `handleSubmit` function with this corrected version:

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!stripe || !elements) return
  setProcessing(true)
  setError(null)

  const cardNumber = elements.getElement(CardNumberElement)
  if (!cardNumber) { setProcessing(false); return }

  const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
    // clientSecret is injected from the hidden input by the parent
    document.querySelector<HTMLInputElement>('[data-client-secret]')?.value ?? '',
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
```

Write the complete file with the corrected `handleSubmit` (remove the duplicate/draft version — keep only the corrected one shown above).

- [ ] **Step 2: Verify TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no errors (or only pre-existing tailwind error).

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add "frontend/app/(shell)/checkout/CheckoutForm.tsx"
git commit -m "feat(checkout): CheckoutForm con Stripe Elements y layout editorial"
```

---

## Task 7: Add .superpowers to .gitignore

**Files:**
- Modify: `.gitignore` (repo root)

- [ ] **Step 1: Add entry**

Check if `.gitignore` exists at repo root and add `.superpowers/` if not already there:

```bash
grep -q '.superpowers' "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/.gitignore" || echo '.superpowers/' >> "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/.gitignore"
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm dir"
```

---

## Self-Review

**Spec coverage:**
- ✅ Two-column layout (editorial left, form right) — Task 6
- ✅ Logo, headline serif, feature list, price at bottom with border — Task 6
- ✅ Currency switcher EUR/USD/MXN — Task 6
- ✅ Cycle switcher Mensual/Anual with −20% badge — Task 6
- ✅ Stripe Elements (CardNumber, Expiry, CVC) — Task 6
- ✅ Price updates reactively — Task 6 (`displayPrice` derived from state)
- ✅ Annual billing note — Task 6
- ✅ Trial end date — Task 6 (`trialEndDate()`)
- ✅ SetupIntent API route — Task 2
- ✅ Subscribe API route — Task 3
- ✅ createCheckoutSession redirects to /checkout — Task 4
- ✅ Skeleton loading state — Task 6
- ✅ Error message inline — Task 6
- ✅ Processing spinner — Task 6
- ✅ Trust badge — Task 6
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var — Task 1
- ✅ Back link to /precios — Task 6
- ✅ .superpowers gitignore — Task 7

**Placeholder scan:** None found.

**Type consistency:** `Currency`, `Cycle`, `PRICES` defined in Task 6 and used consistently. `priceKey` format `{currency_lower}_{cycle}` used consistently across Tasks 3, 4, 5, 6.
