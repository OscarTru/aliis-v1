# Custom Checkout Page — Design Spec

## Goal

Replace the Stripe-hosted checkout with a branded, inline checkout page that matches the Aliis design system. Users never leave the app to pay.

## Layout

Two-column layout, full-height card on a centered max-w-[900px] container:

### Left column — Editorial (flex-col, justify-between)
- Aliis logo top-left (`/assets/aliis-original.png` / dark variant)
- Headline: `font-serif italic` — "Entiende tu diagnóstico. *De verdad.*"
- Feature list (3 items with teal checkmarks):
  - Explicaciones ilimitadas con referencias reales
  - Chat IA por capítulo
  - Diario de síntomas con Aliis
- Bottom (separated by top border):
  - Price: large white `font-sans font-bold` — e.g. "€9" with `/mes` in muted
  - Annual billing note when yearly selected: "facturado €90/año · ahorra €18"
  - Teal line: "14 días gratis · sin cargo hasta [date+14days]"

### Right column — Payment form (bg-card, rounded-2xl, p-6)
- **Currency switcher**: pill group — EUR / USD / MXN (same pattern as `/precios`)
- **Cycle switcher**: pill group — Mensual / Anual (with "−20%" badge on Anual)
- **Stripe Elements**: `CardNumberElement`, `CardExpiryElement`, `CardCvcElement` — each in a styled `div` matching the app's input style (`border border-border rounded-xl px-3 py-2.5 bg-background`)
- **CTA button**: full-width pill `bg-foreground text-background` — "Empezar 14 días gratis" (spinner + disabled while processing)
- **Error message**: `text-destructive text-[12px]` below button
- **Trust badge**: `🔒 Pago seguro · Stripe` in `text-[11px] text-muted-foreground/50` centered

## Pricing Data

Reuse the existing `PRICE_MAP` keys from `frontend/app/actions/checkout.ts`:
```
eur_monthly, eur_yearly, usd_monthly, usd_yearly, mxn_monthly, mxn_yearly
```

Display prices (hardcoded, not fetched from Stripe — avoids latency):
```typescript
const PRICES = {
  EUR: { monthly: '€9', yearly: '€7.50', yearlyTotal: '€90', saving: '€18' },
  USD: { monthly: '$9', yearly: '$7.50', yearlyTotal: '$90', saving: '$18' },
  MXN: { monthly: '$169', yearly: '$140', yearlyTotal: '$1,690', saving: '$338' },
}
```

## Payment Flow

**No redirect to Stripe hosted page.** Use Stripe Elements + Payment Intents:

1. Page loads → `POST /api/stripe/setup-intent` returns `{ clientSecret }` (SetupIntent for trial subscriptions)
2. User fills card + clicks CTA
3. Frontend calls `stripe.confirmCardSetup(clientSecret, { payment_method: { card: cardElement } })`
4. On success → `POST /api/stripe/subscribe` with `{ paymentMethodId, priceKey }` → creates subscription server-side
5. On subscription created → redirect to `/cuenta?upgrade=success`

**Why SetupIntent not PaymentIntent:** The plan has a 14-day trial, so no charge happens immediately. We collect the payment method first, then attach it to the subscription.

## New API Routes

### `POST /api/stripe/setup-intent`
- Auth required
- Creates or retrieves Stripe customer from `profiles.stripe_customer_id`
- Creates a `SetupIntent` with `customer` and `usage: 'off_session'`
- Returns `{ clientSecret: string }`

### `POST /api/stripe/subscribe`
- Auth required
- Body: `{ paymentMethodId: string, priceKey: string }`
- Attaches payment method to customer
- Creates subscription with `trial_period_days: 14`, `default_payment_method`
- Returns `{ ok: true }` on success

## New Page

`frontend/app/(shell)/checkout/page.tsx` — server component that:
- Checks auth (redirect to `/login` if not)
- Reads `?plan=eur_monthly` query param (default `eur_monthly`)
- Passes `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to client component

`frontend/app/(shell)/checkout/CheckoutForm.tsx` — client component with all interactivity.

## Environment Variable

Add to `.env.example` and `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Entry Point

Update `frontend/app/actions/checkout.ts` — instead of creating a Stripe hosted session and redirecting, redirect to `/checkout?plan={priceKey}`.

## Error Handling

- Card declined → show Stripe error message inline (in Spanish if possible, fallback to Stripe's message)
- Network error → "Algo salió mal. Inténtalo de nuevo."
- Invalid price key → redirect back to `/precios`

## Out of Scope

- Apple Pay / Google Pay (future)
- Coupon/promo code field (future)
- Address collection (not needed for digital subscription)
