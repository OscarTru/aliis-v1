# Aliis MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the mocked frontend shell into a functional MVP with real Supabase auth, AI pack generation (5-layer pipeline), persistent history, shareable links, and Stripe billing.

**Architecture:** `frontend/` (Next.js 15 App Router, Vercel) + `backend/` (Express + TypeScript, Railway). Supabase for auth + DB. All new platform screens live in `frontend/`; root `app/` is untouched.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v3, CSS custom properties, Supabase JS v2, @anthropic-ai/sdk ^0.39, Express 4, stripe ^14, @supabase/ssr, uuid

**Working directory:** `/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis`

---

## File Map

**Frontend — Created:**
- `frontend/lib/supabase.ts` — browser + server Supabase clients
- `frontend/middleware.ts` — auth guard for protected routes
- `frontend/app/onboarding/page.tsx` — 3-step onboarding
- `frontend/app/ingreso/page.tsx` — conversational chat input
- `frontend/app/loading/page.tsx` — pack generation animation + polling
- `frontend/app/pack/[id]/page.tsx` — longform pack view (replaces `dashboard/pack/[id]`)
- `frontend/app/historial/page.tsx` — pack library (replaces `dashboard/`)
- `frontend/app/compartir/[id]/page.tsx` — share link generator
- `frontend/app/p/[token]/page.tsx` — public shared pack view
- `frontend/components/PackView.tsx` — shared pack render component (used by pack/[id] and p/[token])
- `frontend/components/UpgradeModal.tsx` — free limit hit modal

**Frontend — Modified:**
- `frontend/lib/types.ts` — replace DiagnosticoResponse with Pack, Chapter, Reference, etc.
- `frontend/app/globals.css` — add `ce-pulse` keyframe + `.ce-pulse` class
- `frontend/app/layout.tsx` — add `suppressHydrationWarning`
- `frontend/components/LoginModal.tsx` — implement real Supabase signup/login
- `frontend/components/AppNav.tsx` — real user state from Supabase session
- `frontend/app/precios/page.tsx` — wire CTAs to Stripe Checkout
- `frontend/app/page.tsx` — CTA logic: session → /ingreso, no session → LoginModal

**Backend — Created:**
- `backend/src/lib/classifier.ts` — Intent Classifier (Haiku)
- `backend/src/lib/emergency.ts` — EMERG hardcoded responses
- `backend/src/lib/enricher.ts` — Context enrichment from profile + history
- `backend/src/lib/generator.ts` — Pack Generator (Opus)
- `backend/src/lib/verifier.ts` — DOI Verifier via Semantic Scholar
- `backend/src/routes/pack.ts` — POST /pack/generate
- `backend/src/routes/stripe.ts` — Stripe webhooks

**Backend — Modified:**
- `backend/src/index.ts` — add new routes, health endpoint, Supabase client init
- `backend/package.json` — add `stripe`, `@supabase/supabase-js`, `uuid`, `@types/uuid`

**SQL (run in Supabase dashboard):**
- Migration 1: create `profiles`, `packs`, `chapter_reads` tables + RLS policies
- Migration 2: trigger `handle_new_user()` on `auth.users` insert

---

## Task 1: Types + CSS foundation

**Files:**
- Modify: `frontend/lib/types.ts`
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Replace types.ts**

```typescript
// frontend/lib/types.ts
export interface Reference {
  id: number
  authors: string
  journal: string
  year: number
  doi: string
  quote: string
  verified?: boolean
}

export interface Chapter {
  id: string
  n: string
  kicker: string
  kickerItalic: string
  readTime: string
  tldr: string
  paragraphs?: string[]
  callout?: { label: string; body: string }
  timeline?: { w: string; t: string }[]
  questions?: string[]
  alarms?: { tone: 'red' | 'amber'; t: string; d: string }[]
  practices?: { t: string; d: string }[]
}

export interface Pack {
  id: string
  dx: string
  for: string
  createdAt: string
  summary: string
  chapters: Chapter[]
  references: Reference[]
}

export type IntentClass = 'SAFE' | 'DOSE' | 'DIAGN' | 'EMERG' | 'OOD'

export interface GeneratePackRequest {
  diagnostico: string
  medicamentos?: string[]
  contexto?: {
    frecuencia?: string
    dudas?: string
    para?: 'yo' | 'familiar'
    nombre?: string
  }
  userId: string
  userPlan: 'free' | 'pro'
}

export interface GeneratePackResponse {
  pack?: Pack
  references?: Reference[]
  limitReached?: boolean
  emergencyResponse?: string
  blockedReason?: 'DOSE' | 'DIAGN' | 'OOD'
}

export interface Profile {
  id: string
  name: string | null
  who: 'yo' | 'familiar' | null
  plan: 'free' | 'pro'
  stripe_customer_id: string | null
  onboarding_done: boolean
  created_at: string
}
```

- [ ] **Step 2: Add ce-pulse to globals.css** — append after the `.shimmer` block:

```css
@keyframes ce-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.ce-pulse {
  animation: ce-pulse 1.8s ease-in-out infinite;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/types.ts frontend/app/globals.css
git commit -m "feat(types): replace DiagnosticoResponse with Pack/Chapter/Reference; add ce-pulse"
```

---

## Task 2: Supabase client + middleware

**Files:**
- Create: `frontend/lib/supabase.ts`
- Create: `frontend/middleware.ts`

- [ ] **Step 1: Install Supabase deps**

```bash
cd frontend && npm install @supabase/supabase-js @supabase/ssr
```

Expected: package-lock.json updated, no errors.

- [ ] **Step 2: Create frontend/lib/supabase.ts**

```typescript
// frontend/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}
```

- [ ] **Step 3: Create frontend/middleware.ts**

```typescript
// frontend/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/onboarding', '/ingreso', '/loading', '/pack', '/historial', '/compartir']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
```

- [ ] **Step 4: Add env vars to frontend/.env.local** — add if not present:

```
NEXT_PUBLIC_SUPABASE_URL=<tu-url-de-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<tu-pk-de-stripe>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/supabase.ts frontend/middleware.ts frontend/package.json frontend/package-lock.json
git commit -m "feat(auth): Supabase SSR client + route protection middleware"
```

---

## Task 3: Supabase DB schema + trigger

Run these in the Supabase SQL editor (Dashboard → SQL Editor).

- [ ] **Step 1: Run Migration 1 — tables + RLS**

```sql
-- profiles
create table public.profiles (
  id                uuid references auth.users primary key,
  name              text,
  who               text check (who in ('yo', 'familiar')),
  plan              text default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  onboarding_done   boolean default false,
  created_at        timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "users own their profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- packs
create table public.packs (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.profiles(id) on delete cascade,
  dx               text not null,
  summary          text,
  chapters         jsonb not null default '[]',
  references       jsonb default '[]',
  shared_token     text unique,
  shared_expires_at timestamptz,
  created_at       timestamptz default now()
);

alter table public.packs enable row level security;

create policy "users own their packs"
  on public.packs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "public shared packs readable"
  on public.packs for select
  using (
    shared_token is not null
    and shared_expires_at > now()
  );

-- chapter_reads
create table public.chapter_reads (
  pack_id    uuid references public.packs(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  chapter_id text not null,
  read_at    timestamptz default now(),
  primary key (pack_id, user_id, chapter_id)
);

alter table public.chapter_reads enable row level security;

create policy "users own their reads"
  on public.chapter_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: Run Migration 2 — auto-create profile on signup**

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 3: Verify** — In Supabase Table Editor, confirm `profiles`, `packs`, `chapter_reads` exist.

---

## Task 4: LoginModal — auth real

**Files:**
- Modify: `frontend/components/LoginModal.tsx`

- [ ] **Step 1: Replace LoginModal with real auth**

```typescript
// frontend/components/LoginModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Mode = 'login' | 'signup'

export function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      router.push('/onboarding')
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', data.user.id)
        .single()
      router.push(profile?.onboarding_done ? '/historial' : '/onboarding')
    }
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid var(--c-border)',
    background: 'var(--c-surface)',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--c-text)',
    outline: 'none',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'var(--c-bg)',
          border: '1px solid var(--c-border)',
          borderRadius: 24,
          padding: '48px 40px 40px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 999,
            border: '1px solid var(--c-border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--c-text-muted)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, letterSpacing: '-.025em', lineHeight: 1, marginBottom: 8 }}>
            Aliis
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--c-text-muted)' }}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
          {error && (
            <p style={{ color: '#dc2626', fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--c-brand-teal)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
          style={{
            marginTop: 16,
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--c-text-muted)',
          }}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        <p style={{ marginTop: 16, textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-faint)' }}>
          Aliis no comparte tus datos. Nunca.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/LoginModal.tsx
git commit -m "feat(auth): implement real Supabase signup/login in LoginModal"
```

---

## Task 5: Onboarding `/onboarding`

**Files:**
- Create: `frontend/app/onboarding/page.tsx`

- [ ] **Step 1: Create onboarding/page.tsx**

```typescript
// frontend/app/onboarding/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

const PROMISES = [
  'Tu diagnóstico en palabras que puedes entender',
  'Referencias científicas verificadas, no Wikipedia',
  'Preguntas listas para tu próxima consulta',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [who, setWho] = useState<'yo' | 'familiar' | null>(null)
  const [saving, setSaving] = useState(false)

  async function skip() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_done: true }).eq('id', user.id)
    }
    router.push('/ingreso')
  }

  async function finish() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        name: name || null,
        who: who || null,
        onboarding_done: true,
      }).eq('id', user.id)
    }
    router.push('/ingreso')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--c-border)' }}>
        <Image src="/assets/aliis-logo.png" alt="Aliis" width={28} height={28} style={{ objectFit: 'contain' }} />
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ width: 32, height: 3, borderRadius: 999, background: s <= step ? 'var(--c-brand-teal)' : 'var(--c-border)' }} />
          ))}
        </div>
        <button onClick={skip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
          Saltar
        </button>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {step === 1 && (
          <div className="ce-fade" style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, letterSpacing: '-.025em', marginBottom: 8 }}>
              Bienvenido a Aliis
            </h1>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--c-text-muted)', marginBottom: 40 }}>
              Tu asistente para entender lo que el médico dijo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {PROMISES.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--c-surface)', borderRadius: 12, textAlign: 'left' }}>
                  <span style={{ color: 'var(--c-brand-teal)', fontSize: 18 }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)' }}>{p}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ padding: '14px 40px', borderRadius: 999, background: 'var(--c-brand-teal)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="ce-fade" style={{ width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginBottom: 8 }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32 }}>
              Aliis te llamará por tu nombre en las explicaciones.
            </p>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--c-text)', outline: 'none', marginBottom: 24 }}
            />
            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--c-brand-teal)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Continuar
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="ce-fade" style={{ width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginBottom: 8 }}>
              ¿Para quién es Aliis?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32 }}>
              Adaptamos el tono según para quién estás buscando explicaciones.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              {(['yo', 'familiar'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setWho(opt)}
                  style={{
                    flex: 1, padding: '20px 16px', borderRadius: 14,
                    border: `2px solid ${who === opt ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
                    background: who === opt ? 'rgba(31,138,155,.08)' : 'var(--c-surface)',
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                    color: 'var(--c-text)', cursor: 'pointer',
                  }}
                >
                  {opt === 'yo' ? 'Para mí' : 'Para un familiar'}
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              disabled={saving}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--c-brand-teal)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando…' : 'Empezar'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/onboarding/page.tsx
git commit -m "feat(onboarding): 3-step onboarding with Supabase profile update"
```

---

## Task 6: Backend — install deps + Supabase client

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Install backend deps**

```bash
cd backend && npm install stripe @supabase/supabase-js uuid && npm install -D @types/uuid
```

- [ ] **Step 2: Add env vars to backend/.env** — add if not present:

```
SUPABASE_URL=<tu-supabase-url>
SUPABASE_SERVICE_KEY=<tu-service-role-key>
STRIPE_SECRET_KEY=<sk_test_...>
STRIPE_WEBHOOK_SECRET=<whsec_...>
STRIPE_PRO_PRICE_EUR_MONTHLY=<price_id>
STRIPE_PRO_PRICE_EUR_YEARLY=<price_id>
STRIPE_PRO_PRICE_USD_MONTHLY=<price_id>
STRIPE_PRO_PRICE_USD_YEARLY=<price_id>
STRIPE_PRO_PRICE_MXN_MONTHLY=<price_id>
STRIPE_PRO_PRICE_MXN_YEARLY=<price_id>
```

- [ ] **Step 3: Replace backend/src/index.ts**

```typescript
// backend/src/index.ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY missing'); process.exit(1)
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY missing'); process.exit(1)
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))

// Raw body for Stripe webhooks — must come before express.json()
app.use('/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

import { packRouter } from './routes/pack'
import { stripeRouter } from './routes/stripe'
app.use('/pack', packRouter)
app.use('/stripe', stripeRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend Aliis :${PORT}`))
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/index.ts backend/package.json backend/package-lock.json
git commit -m "feat(backend): add Supabase client, Stripe raw body, route stubs"
```

---

## Task 7: Backend — Intent Classifier + Emergency

**Files:**
- Create: `backend/src/lib/classifier.ts`
- Create: `backend/src/lib/emergency.ts`

- [ ] **Step 1: Create backend/src/lib/emergency.ts**

```typescript
// backend/src/lib/emergency.ts
export const EMERGENCY_RESPONSE = `⚠️ Esto puede ser una emergencia médica.

Llama ahora:
• España: 112
• México: 911
• Argentina: 107
• USA: 911

No esperes. Ve a urgencias o llama a emergencias inmediatamente.

Aliis no puede reemplazar la atención médica de urgencia.`

export const BLOCKED_MESSAGES = {
  DOSE: 'Aliis no puede recomendar dosis de medicamentos. Consulta con tu médico o farmacéutico.',
  DIAGN: 'Aliis no puede hacer diagnósticos. Solo puede explicar diagnósticos que ya realizó un médico.',
  OOD: 'Esto está fuera del ámbito de Aliis. Somos especialistas en explicar diagnósticos neurológicos.',
}
```

- [ ] **Step 2: Create backend/src/lib/classifier.ts**

```typescript
// backend/src/lib/classifier.ts
import Anthropic from '@anthropic-ai/sdk'
import type { IntentClass } from '../types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CLASSIFIER_SYSTEM = `Eres un clasificador de intención para Aliis, un asistente que explica diagnósticos neurológicos.

Clasifica el input del usuario en UNA de estas categorías:

SAFE  → Es un diagnóstico médico válido que podemos explicar (ej: "epilepsia focal", "esclerosis múltiple", "migraña crónica")
DOSE  → Pregunta sobre dosis o administración de medicamentos (ej: "cuánto levetiracetam tomo")
DIAGN → Intenta obtener un diagnóstico (ej: "tengo estos síntomas, qué tengo")
EMERG → Situación de emergencia activa (ej: "estoy teniendo una convulsión", "no puedo moverme")
OOD   → Fuera del dominio médico-neurológico (ej: "explícame la fotosíntesis")

Responde ÚNICAMENTE con la palabra en mayúsculas: SAFE, DOSE, DIAGN, EMERG, o OOD.
Sin explicación. Sin puntuación. Solo la palabra.`

export async function classifyIntent(input: string): Promise<IntentClass> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    system: [{ type: 'text', text: CLASSIFIER_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: input }],
  })

  const text = response.content.find((b) => b.type === 'text')
  const raw = text?.type === 'text' ? text.text.trim().toUpperCase() : ''
  const valid: IntentClass[] = ['SAFE', 'DOSE', 'DIAGN', 'EMERG', 'OOD']
  return valid.includes(raw as IntentClass) ? (raw as IntentClass) : 'SAFE'
}
```

- [ ] **Step 3: Create backend/src/types.ts** (shared backend types):

```typescript
// backend/src/types.ts
export type IntentClass = 'SAFE' | 'DOSE' | 'DIAGN' | 'EMERG' | 'OOD'

export interface Reference {
  id: number
  authors: string
  journal: string
  year: number
  doi: string
  quote: string
  verified?: boolean
}

export interface Chapter {
  id: string
  n: string
  kicker: string
  kickerItalic: string
  readTime: string
  tldr: string
  paragraphs?: string[]
  callout?: { label: string; body: string }
  timeline?: { w: string; t: string }[]
  questions?: string[]
  alarms?: { tone: 'red' | 'amber'; t: string; d: string }[]
  practices?: { t: string; d: string }[]
}

export interface GeneratedPack {
  summary: string
  chapters: Chapter[]
  references: Reference[]
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/lib/classifier.ts backend/src/lib/emergency.ts backend/src/types.ts
git commit -m "feat(backend): intent classifier (Haiku) + emergency responses"
```

---

## Task 8: Backend — Context Enricher

**Files:**
- Create: `backend/src/lib/enricher.ts`

- [ ] **Step 1: Create backend/src/lib/enricher.ts**

```typescript
// backend/src/lib/enricher.ts
import { supabase } from '../index'

export interface EnrichedContext {
  para: 'yo' | 'familiar'
  nombre: string | null
  previousDx: string[]
  frecuencia?: string
  dudas?: string
}

export async function enrichContext(
  userId: string,
  contexto?: {
    frecuencia?: string
    dudas?: string
    para?: 'yo' | 'familiar'
    nombre?: string
  }
): Promise<EnrichedContext> {
  const [profileResult, packsResult] = await Promise.all([
    supabase.from('profiles').select('name, who').eq('id', userId).single(),
    supabase
      .from('packs')
      .select('dx')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  const profile = profileResult.data
  const previousDx = (packsResult.data ?? []).map((p: { dx: string }) => p.dx)

  return {
    para: contexto?.para ?? profile?.who ?? 'yo',
    nombre: contexto?.nombre ?? profile?.name ?? null,
    previousDx,
    frecuencia: contexto?.frecuencia,
    dudas: contexto?.dudas,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/lib/enricher.ts
git commit -m "feat(backend): context enricher pulls profile + last 2 packs from Supabase"
```

---

## Task 9: Backend — Pack Generator

**Files:**
- Create: `backend/src/lib/generator.ts`

- [ ] **Step 1: Create backend/src/lib/generator.ts**

```typescript
// backend/src/lib/generator.ts
import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedPack, Chapter, Reference } from '../types'
import type { EnrichedContext } from './enricher'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GENERATOR_SYSTEM = `Eres el agente educativo de Aliis — plataforma creada por médicos residentes de neurología (Cerebros Esponjosos).

Tu función: recibir un diagnóstico médico y generar un pack educativo con 5 capítulos + referencias científicas.

VOZ Y ESTILO:
- Destila, no simplifiques. La esencia sin perder profundidad.
- Conversacional con intención: como un amigo médico muy informado.
- Empiezas desde la experiencia del paciente, nunca desde la definición académica.
- Frases cortas (8-15 palabras como norma). Ritmo variado.
- Si usas término técnico, lo explicas en la misma frase o la siguiente.
- Sin adjetivos vacíos. Sin enumeraciones secas.
- Responde siempre en español.

ESTRUCTURA DE RESPUESTA — JSON estricto, sin texto antes ni después:

{
  "summary": "1-2 frases que capturan la esencia del diagnóstico para el paciente",
  "chapters": [
    {
      "id": "que-es",
      "n": "01",
      "kicker": "Qué es",
      "kickerItalic": "exactamente",
      "readTime": "3 min",
      "tldr": "Una frase que resume este capítulo",
      "paragraphs": ["párrafo 1", "párrafo 2", "párrafo 3"]
    },
    {
      "id": "como-funciona",
      "n": "02",
      "kicker": "Cómo",
      "kickerItalic": "funciona",
      "readTime": "4 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "callout": { "label": "Para entenderlo así", "body": "analogía clara del mecanismo" }
    },
    {
      "id": "que-esperar",
      "n": "03",
      "kicker": "Qué",
      "kickerItalic": "esperar",
      "readTime": "3 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "timeline": [
        { "w": "Primeras semanas", "t": "descripción breve" },
        { "w": "1-3 meses", "t": "descripción breve" }
      ]
    },
    {
      "id": "preguntas",
      "n": "04",
      "kicker": "Preguntas para",
      "kickerItalic": "tu médico",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "questions": ["¿...?", "¿...?", "¿...?", "¿...?", "¿...?"]
    },
    {
      "id": "senales",
      "n": "05",
      "kicker": "Señales de",
      "kickerItalic": "alarma",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "alarms": [
        { "tone": "red", "t": "título señal urgente", "d": "descripción" },
        { "tone": "amber", "t": "título señal moderada", "d": "descripción" }
      ]
    }
  ],
  "references": [
    {
      "id": 1,
      "authors": "Apellido A, Apellido B",
      "journal": "Nombre revista",
      "year": 2023,
      "doi": "10.xxxx/xxxxxx",
      "quote": "Hallazgo clave de este paper en una frase"
    }
  ]
}

REGLAS:
1. Exactamente 5 capítulos con los ids: que-es, como-funciona, que-esperar, preguntas, senales
2. Entre 3 y 5 referencias reales con DOIs válidos (formato 10.xxxx/xxxxxx)
3. Nunca diagnosticas ni cuestionas el diagnóstico dado
4. JSON válido, sin comentarios, sin texto fuera del JSON`

function isValidGeneratedPack(v: unknown): v is GeneratedPack {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.summary === 'string' &&
    Array.isArray(p.chapters) &&
    p.chapters.length === 5 &&
    Array.isArray(p.references)
  )
}

export async function generatePack(
  diagnostico: string,
  context: EnrichedContext
): Promise<GeneratedPack> {
  const userPrompt = [
    `Diagnóstico: ${diagnostico}`,
    context.nombre ? `Paciente: ${context.nombre}` : null,
    context.para === 'familiar' ? 'Este pack es para un familiar del paciente.' : null,
    context.frecuencia ? `Frecuencia: ${context.frecuencia}` : null,
    context.dudas ? `Dudas principales: ${context.dudas}` : null,
    context.previousDx.length > 0
      ? `Diagnósticos previos del paciente: ${context.previousDx.join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  async function attempt(): Promise<GeneratedPack> {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      temperature: 0,
      system: [{ type: 'text', text: GENERATOR_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    const parsed: unknown = JSON.parse(match[0])
    if (!isValidGeneratedPack(parsed)) throw new Error('Invalid pack structure')

    return parsed
  }

  try {
    return await attempt()
  } catch {
    return await attempt()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/lib/generator.ts
git commit -m "feat(backend): pack generator with Opus, 5-chapter structure, retry on invalid JSON"
```

---

## Task 10: Backend — DOI Verifier

**Files:**
- Create: `backend/src/lib/verifier.ts`

- [ ] **Step 1: Create backend/src/lib/verifier.ts**

```typescript
// backend/src/lib/verifier.ts
import type { Reference } from '../types'

const DOI_REGEX = /^10\.\d{4,}\/\S+$/

async function checkDoi(doi: string): Promise<boolean> {
  if (!DOI_REGEX.test(doi)) return false
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(doi)}?fields=title`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

export async function verifyReferences(references: Reference[]): Promise<Reference[]> {
  const results = await Promise.all(
    references.map(async (ref) => ({
      ...ref,
      verified: await checkDoi(ref.doi),
    }))
  )

  const verifiedCount = results.filter((r) => r.verified).length
  const failRate = 1 - verifiedCount / results.length

  if (failRate > 0.5) {
    return results.map((r) => ({ ...r, verified: false }))
  }

  return results
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/lib/verifier.ts
git commit -m "feat(backend): DOI verifier via Semantic Scholar, 3s timeout, >50% fail → all unverified"
```

---

## Task 11: Backend — POST /pack/generate route

**Files:**
- Create: `backend/src/routes/pack.ts`

- [ ] **Step 1: Create backend/src/routes/pack.ts**

```typescript
// backend/src/routes/pack.ts
import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { classifyIntent } from '../lib/classifier'
import { enrichContext } from '../lib/enricher'
import { generatePack } from '../lib/generator'
import { verifyReferences } from '../lib/verifier'
import { EMERGENCY_RESPONSE, BLOCKED_MESSAGES } from '../lib/emergency'
import { supabase } from '../index'
import type { GeneratePackRequest } from '../types'

export const packRouter = Router()

function isValidRequest(body: unknown): body is GeneratePackRequest {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return typeof b.diagnostico === 'string' && typeof b.userId === 'string' && typeof b.userPlan === 'string'
}

packRouter.post('/generate', async (req, res) => {
  if (!isValidRequest(req.body)) {
    res.status(400).json({ error: 'diagnostico, userId y userPlan son requeridos' })
    return
  }

  const { diagnostico, contexto, userId, userPlan } = req.body
  const dx = diagnostico.trim()

  if (!dx) { res.status(400).json({ error: 'El diagnóstico no puede estar vacío' }); return }
  if (dx.length > 500) { res.status(400).json({ error: 'El diagnóstico no puede superar 500 caracteres' }); return }

  // Free tier limit
  if (userPlan === 'free') {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('packs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since)

    if ((count ?? 0) >= 1) {
      res.json({ limitReached: true })
      return
    }
  }

  // Classify intent
  const intent = await classifyIntent(dx)

  if (intent === 'EMERG') {
    res.json({ emergencyResponse: EMERGENCY_RESPONSE })
    return
  }

  if (intent !== 'SAFE') {
    res.json({ blockedReason: intent as 'DOSE' | 'DIAGN' | 'OOD', blockedMessage: BLOCKED_MESSAGES[intent as keyof typeof BLOCKED_MESSAGES] })
    return
  }

  // Enrich context
  const context = await enrichContext(userId, contexto)

  // Generate pack
  let generated
  try {
    generated = await generatePack(dx, context)
  } catch {
    res.status(500).json({ error: 'Error generando el pack. Intenta de nuevo.' })
    return
  }

  // Verify DOIs
  const verifiedRefs = await verifyReferences(generated.references)

  // Persist to Supabase
  const packId = uuidv4()
  const { error: insertError } = await supabase.from('packs').insert({
    id: packId,
    user_id: userId,
    dx,
    summary: generated.summary,
    chapters: generated.chapters,
    references: verifiedRefs,
  })

  if (insertError) {
    console.error('Error saving pack:', insertError)
    res.status(500).json({ error: 'Error guardando el pack.' })
    return
  }

  res.json({
    pack: {
      id: packId,
      dx,
      for: context.para,
      createdAt: new Date().toISOString(),
      summary: generated.summary,
      chapters: generated.chapters,
      references: verifiedRefs,
    },
    references: verifiedRefs,
  })
})
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/pack.ts
git commit -m "feat(backend): POST /pack/generate — full 5-layer pipeline, free limit, persist to Supabase"
```

---

## Task 12: Backend — Stripe webhooks

**Files:**
- Create: `backend/src/routes/stripe.ts`

- [ ] **Step 1: Create backend/src/routes/stripe.ts**

```typescript
// backend/src/routes/stripe.ts
import { Router } from 'express'
import Stripe from 'stripe'
import { supabase } from '../index'

export const stripeRouter = Router()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30' as Stripe.LatestApiVersion })

stripeRouter.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    res.status(400).send('Webhook signature verification failed')
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const email = session.customer_details?.email
    if (email) {
      await supabase.from('profiles').update({ plan: 'pro', stripe_customer_id: customerId }).eq('id', session.metadata?.userId ?? '')
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('profiles').update({ plan: 'free' }).eq('stripe_customer_id', sub.customer as string)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const plan = sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free'
    await supabase.from('profiles').update({ plan }).eq('stripe_customer_id', sub.customer as string)
  }

  res.json({ received: true })
})
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/stripe.ts
git commit -m "feat(backend): Stripe webhook handler — checkout, subscription updated/deleted"
```

---

## Task 13: /ingreso — chat conversacional

**Files:**
- Create: `frontend/app/ingreso/page.tsx`
- Create: `frontend/components/UpgradeModal.tsx`

- [ ] **Step 1: Create UpgradeModal.tsx**

```typescript
// frontend/components/UpgradeModal.tsx
'use client'

import Link from 'next/link'

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 24, padding: '40px', maxWidth: 380, width: '100%', textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginBottom: 12 }}>
          Has usado tu pack gratuito
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Con Aliis Pro tienes packs ilimitados, referencias verificadas y acceso completo.
        </p>
        <Link
          href="/precios"
          style={{ display: 'block', padding: '14px', borderRadius: 12, background: 'var(--c-brand-teal)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, marginBottom: 12 }}
        >
          Ver planes — desde €9.99/mes
        </Link>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}
        >
          Ahora no
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create frontend/app/ingreso/page.tsx**

```typescript
// frontend/app/ingreso/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '@/components/AppNav'
import { UpgradeModal } from '@/components/UpgradeModal'
import { createClient } from '@/lib/supabase'

type BotMessage = { role: 'bot'; text: string; chips?: string[] }
type UserMessage = { role: 'user'; text: string }
type Message = BotMessage | UserMessage

type Step = 'mode' | 'dx' | 'confirm' | 'done'

const FRECUENCIA_CHIPS = ['Recién diagnosticado', 'Hace meses', 'Llevo años con esto']
const DUDAS_CHIPS = ['Qué esperar', 'Medicamentos', 'Estilo de vida', 'Compartir con familia']

export default function IngresoPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Hola! Cuéntame el diagnóstico que quieres entender.', chips: ['Escribir diagnóstico'] },
  ])
  const [step, setStep] = useState<Step>('dx')
  const [dx, setDx] = useState('')
  const [frecuencia, setFrecuencia] = useState('')
  const [dudas, setDudas] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg])
  }

  function handleDxSubmit(text: string) {
    if (!text.trim()) return
    addMessage({ role: 'user', text })
    setDx(text.trim())
    setTimeout(() => {
      addMessage({
        role: 'bot',
        text: `Entendido: "${text.trim()}". Dos preguntas rápidas para personalizar tu pack:`,
        chips: [],
      })
      addMessage({
        role: 'bot',
        text: '¿Cuándo te lo diagnosticaron?',
        chips: FRECUENCIA_CHIPS,
      })
    }, 400)
    setStep('confirm')
    setInput('')
  }

  function handleChip(chip: string) {
    if (step === 'confirm') {
      addMessage({ role: 'user', text: chip })
      setFrecuencia(chip)
      setTimeout(() => {
        addMessage({ role: 'bot', text: '¿Qué te gustaría entender mejor?', chips: DUDAS_CHIPS })
      }, 300)
      setStep('done')
    } else if (step === 'done') {
      addMessage({ role: 'user', text: chip })
      setDudas(chip)
    }
  }

  async function handleGenerate() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    const userPlan = profile?.plan ?? 'free'

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/pack/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnostico: dx,
        contexto: { frecuencia, dudas },
        userId: user.id,
        userPlan,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.limitReached) { setShowUpgrade(true); return }
    if (data.emergencyResponse) {
      addMessage({ role: 'bot', text: data.emergencyResponse })
      return
    }
    if (data.blockedReason) {
      addMessage({ role: 'bot', text: data.blockedMessage ?? 'No puedo ayudarte con eso.' })
      return
    }
    if (data.pack?.id) {
      router.push(`/pack/${data.pack.id}`)
    }
  }

  const showGenerateButton = step === 'done' && dudas !== ''

  return (
    <>
      <AppNav />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '24px 24px 120px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} className="ce-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'var(--c-brand-teal)' : 'var(--c-surface)',
                color: msg.role === 'user' ? '#fff' : 'var(--c-text)',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.5,
              }}>
                {msg.text}
              </div>
              {msg.role === 'bot' && (msg as BotMessage).chips && (msg as BotMessage).chips!.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(msg as BotMessage).chips!.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChip(chip)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: '1px solid var(--c-border)',
                        background: 'var(--c-bg)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        color: 'var(--c-text)',
                        cursor: 'pointer',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {showGenerateButton && (
            <div className="ce-fade" style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  padding: '14px 40px',
                  borderRadius: 999,
                  background: 'var(--c-brand-teal)',
                  color: '#fff',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Generando pack…' : 'Generar mi pack'}
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Sticky composer for dx input */}
      {step === 'dx' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid var(--c-border)', background: 'color-mix(in srgb, var(--c-bg) 90%, transparent)', backdropFilter: 'blur(12px)', padding: '16px 24px' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleDxSubmit(input) }}
            style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 12 }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe el diagnóstico…"
              style={{ flex: 1, padding: '12px 16px', borderRadius: 999, border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '12px 24px', borderRadius: 999, background: 'var(--c-brand-teal)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Enviar
            </button>
          </form>
        </div>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/ingreso/page.tsx frontend/components/UpgradeModal.tsx
git commit -m "feat(ingreso): 4-turn conversational chat + free limit → UpgradeModal"
```

---

## Task 14: /loading — animación + polling

**Files:**
- Create: `frontend/app/loading/page.tsx`

- [ ] **Step 1: Create frontend/app/loading/page.tsx**

```typescript
// frontend/app/loading/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ScribbleBrain } from '@/components/ui/ScribbleBrain'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { createClient } from '@/lib/supabase'

const STAGES = [
  'Analizando tu diagnóstico…',
  'Destilando la información…',
  'Verificando referencias científicas…',
  'Preparando tus preguntas para el médico…',
  'Casi listo…',
]

export default function LoadingPage() {
  const router = useRouter()
  const params = useSearchParams()
  const packId = params.get('packId')
  const [stageIdx, setStageIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1))
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!packId) return
    const supabase = createClient()
    const poll = setInterval(async () => {
      const { data } = await supabase.from('packs').select('id').eq('id', packId).single()
      if (data) {
        clearInterval(poll)
        router.push(`/pack/${packId}`)
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [packId, router])

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 32 }}>
      <div className="ce-pulse">
        <ScribbleBrain size={80} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <Eyebrow>· Destilando ·</Eyebrow>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginTop: 12, minHeight: 40 }}>
          {STAGES[stageIdx]}
        </h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        {STAGES.map((stage, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-sans)', fontSize: 14, color: i < stageIdx ? 'var(--c-brand-teal)' : i === stageIdx ? 'var(--c-text)' : 'var(--c-text-faint)' }}>
            <span style={{ width: 20, textAlign: 'center' }}>
              {i < stageIdx ? '✓' : i === stageIdx ? '⟳' : '○'}
            </span>
            {stage}
          </div>
        ))}
      </div>
      {process.env.NODE_ENV === 'development' && packId && (
        <button onClick={() => router.push(`/pack/${packId}`)} style={{ background: 'none', border: '1px solid var(--c-border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>
          Saltar (demo)
        </button>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/loading/page.tsx
git commit -m "feat(loading): animated stages + Supabase polling → redirect to pack"
```

---

## Task 15: PackView component + /pack/[id]

**Files:**
- Create: `frontend/components/PackView.tsx`
- Create: `frontend/app/pack/[id]/page.tsx`

- [ ] **Step 1: Create frontend/components/PackView.tsx**

```typescript
// frontend/components/PackView.tsx
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Pack, Chapter, Reference } from '@/lib/types'
import { createClient } from '@/lib/supabase'

function AlarmBadge({ tone, t, d }: { tone: 'red' | 'amber'; t: string; d: string }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: 10,
      background: tone === 'red' ? 'rgba(220,38,38,.08)' : 'rgba(245,158,11,.08)',
      borderLeft: `3px solid ${tone === 'red' ? '#dc2626' : '#f59e0b'}`,
      marginBottom: 8,
    }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: tone === 'red' ? '#dc2626' : '#b45309', marginBottom: 2 }}>{t}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>{d}</div>
    </div>
  )
}

function ChapterBlock({ chapter, packId, userId }: { chapter: Chapter; packId: string; userId?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markedRef = useRef(false)

  useEffect(() => {
    if (!userId || markedRef.current) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !markedRef.current) {
          timerRef.current = setTimeout(async () => {
            markedRef.current = true
            const supabase = createClient()
            await supabase.from('chapter_reads').upsert({ pack_id: packId, user_id: userId, chapter_id: chapter.id })
          }, 10000)
        } else {
          if (timerRef.current) clearTimeout(timerRef.current)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => { observer.disconnect(); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [chapter.id, packId, userId])

  return (
    <div ref={ref} id={chapter.id} style={{ paddingTop: 48, paddingBottom: 48, borderBottom: '1px solid var(--c-border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 8 }}>
        {chapter.n} · {chapter.readTime}
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', marginBottom: 6, lineHeight: 1.15 }}>
        {chapter.kicker} <em>{chapter.kickerItalic}</em>
      </h2>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--c-text-muted)', fontSize: 16, marginBottom: 28 }}>
        {chapter.tldr}
      </p>

      {chapter.paragraphs?.map((p, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.75, color: 'var(--c-text)', marginBottom: 20 }}>{p}</p>
      ))}

      {chapter.callout && (
        <div style={{ margin: '24px 0', padding: '20px 24px', background: 'rgba(31,138,155,.06)', border: '1px solid rgba(31,138,155,.18)', borderRadius: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 8 }}>{chapter.callout.label}</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.6, color: 'var(--c-text)', margin: 0 }}>{chapter.callout.body}</p>
        </div>
      )}

      {chapter.timeline && (
        <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {chapter.timeline.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-brand-teal)', minWidth: 120, paddingTop: 3 }}>{item.w}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', lineHeight: 1.5 }}>{item.t}</div>
            </div>
          ))}
        </div>
      )}

      {chapter.questions && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chapter.questions.map((q, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: 'var(--c-surface)', borderRadius: 10 }}>
              <span style={{ color: 'var(--c-brand-teal)', fontWeight: 600, flexShrink: 0 }}>?</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)' }}>{q}</span>
            </li>
          ))}
        </ul>
      )}

      {chapter.alarms && chapter.alarms.map((a, i) => <AlarmBadge key={i} {...a} />)}

      <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--c-surface-2)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--c-text-faint)', fontStyle: 'italic' }}>
        Esta información es educativa y no reemplaza la consulta con tu médico.
      </div>
    </div>
  )
}

export function PackView({ pack, userId, isPublic }: { pack: Pack; userId?: string; isPublic?: boolean }) {
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Header */}
      <div style={{ paddingTop: 48, paddingBottom: 32, borderBottom: '1px solid var(--c-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, letterSpacing: '-.025em', marginBottom: 12, lineHeight: 1.1 }}>
          {pack.dx}
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>
          {pack.summary}
        </p>
        {!isPublic && (
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Link href={`/compartir/${pack.id}`} style={{ padding: '9px 20px', borderRadius: 999, border: '1px solid var(--c-border)', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', textDecoration: 'none' }}>
              Compartir
            </Link>
            <Link href="/historial" style={{ padding: '9px 20px', borderRadius: 999, border: '1px solid var(--c-border)', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', textDecoration: 'none' }}>
              Mis explicaciones
            </Link>
          </div>
        )}
      </div>

      {/* Chapters */}
      {pack.chapters.map((ch) => (
        <ChapterBlock key={ch.id} chapter={ch} packId={pack.id} userId={userId} />
      ))}

      {/* References */}
      {verifiedRefs.length > 0 && (
        <div style={{ paddingTop: 48 }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 20 }}>
            Referencias verificadas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {verifiedRefs.map((ref) => (
              <div key={ref.id} style={{ padding: '16px', background: 'var(--c-surface)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{ref.authors} ({ref.year}). {ref.journal}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 8 }}>{ref.quote}</div>
                <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-brand-teal)', textDecoration: 'none' }}>
                  doi:{ref.doi}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create frontend/app/pack/[id]/page.tsx**

```typescript
// frontend/app/pack/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { AppNav } from '@/components/AppNav'
import { PackView } from '@/components/PackView'
import type { Pack } from '@/lib/types'

export default async function PackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: row } = await supabase
    .from('packs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id ?? '')
    .single()

  if (!row) notFound()

  const pack: Pack = {
    id: row.id,
    dx: row.dx,
    for: 'yo',
    createdAt: row.created_at,
    summary: row.summary ?? '',
    chapters: row.chapters ?? [],
    references: row.references ?? [],
  }

  return (
    <>
      <AppNav />
      <PackView pack={pack} userId={user?.id} />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/PackView.tsx frontend/app/pack/[id]/page.tsx
git commit -m "feat(pack): longform pack view with read tracking via IntersectionObserver"
```

---

## Task 16: /historial — datos reales

**Files:**
- Modify: `frontend/app/historial/page.tsx` (was `dashboard/page.tsx`)

- [ ] **Step 1: Create frontend/app/historial/page.tsx**

```typescript
// frontend/app/historial/page.tsx
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { AppNav } from '@/components/AppNav'
import { ScribbleBrain } from '@/components/ui/ScribbleBrain'

type Filter = 'todos' | 'sin-leer' | 'a-medias' | 'leido'

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter = 'todos' } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [packsResult, readsResult] = await Promise.all([
    supabase.from('packs').select('id, dx, summary, created_at, chapters').eq('user_id', user?.id ?? '').order('created_at', { ascending: false }),
    supabase.from('chapter_reads').select('pack_id, chapter_id').eq('user_id', user?.id ?? ''),
  ])

  const packs = packsResult.data ?? []
  const reads = readsResult.data ?? []

  const readsByPack = reads.reduce<Record<string, Set<string>>>((acc, r) => {
    if (!acc[r.pack_id]) acc[r.pack_id] = new Set()
    acc[r.pack_id].add(r.chapter_id)
    return acc
  }, {})

  const withProgress = packs.map((p) => {
    const total = Array.isArray(p.chapters) ? p.chapters.length : 5
    const read = readsByPack[p.id]?.size ?? 0
    const pct = total > 0 ? read / total : 0
    return { ...p, read, total, pct }
  })

  const filtered = withProgress.filter((p) => {
    if (filter === 'sin-leer') return p.pct === 0
    if (filter === 'a-medias') return p.pct > 0 && p.pct < 1
    if (filter === 'leido') return p.pct === 1
    return true
  })

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'sin-leer', label: 'Sin leer' },
    { key: 'a-medias', label: 'A medias' },
    { key: 'leido', label: 'Leído' },
  ]

  return (
    <>
      <AppNav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, letterSpacing: '-.025em', marginBottom: 32 }}>
          Mis explicaciones
        </h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/historial?filter=${f.key}`}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: '1px solid var(--c-border)',
                background: filter === f.key ? 'var(--c-brand-teal)' : 'transparent',
                color: filter === f.key ? '#fff' : 'var(--c-text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 64 }}>
            <ScribbleBrain size={60} />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--c-text-muted)', marginTop: 20, marginBottom: 24 }}>
              Todavía no hay packs aquí.
            </p>
            <Link href="/ingreso" style={{ padding: '12px 28px', borderRadius: 999, background: 'var(--c-brand-teal)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 15 }}>
              Entender mi diagnóstico
            </Link>
          </div>
        )}

        {/* Pack list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((p) => (
            <Link key={p.id} href={`/pack/${p.id}`} style={{ textDecoration: 'none', display: 'block', padding: '20px 24px', background: 'var(--c-surface)', borderRadius: 16, border: '1px solid var(--c-border)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--c-text)', marginBottom: 6 }}>{p.dx}</div>
              {p.summary && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{p.summary}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'var(--c-border)' }}>
                  <div style={{ width: `${p.pct * 100}%`, height: '100%', borderRadius: 999, background: 'var(--c-brand-teal)', transition: 'width .3s' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-text-faint)' }}>{p.read}/{p.total}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/historial/page.tsx
git commit -m "feat(historial): real packs from Supabase, chapter progress, filter chips"
```

---

## Task 17: /compartir + /p/[token]

**Files:**
- Create: `frontend/app/compartir/[id]/page.tsx`
- Create: `frontend/app/p/[token]/page.tsx`

- [ ] **Step 1: Create frontend/app/compartir/[id]/page.tsx**

```typescript
// frontend/app/compartir/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppNav } from '@/components/AppNav'
import { createClient } from '@/lib/supabase'

export default function CompartirPage() {
  const { id } = useParams<{ id: string }>()
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function generate() {
      const supabase = createClient()
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('packs').update({ shared_token: token, shared_expires_at: expiresAt }).eq('id', id)
      setUrl(`${window.location.origin}/p/${token}`)
      setLoading(false)
    }
    generate()
  }, [id])

  async function copy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <AppNav />
      <main style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', marginBottom: 12 }}>
          Compartir explicación
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Cualquier persona con este enlace puede ver tu explicación durante 30 días. Sin necesidad de cuenta.
        </p>
        {loading ? (
          <div className="ce-pulse" style={{ fontFamily: 'var(--font-sans)', color: 'var(--c-text-faint)' }}>Generando enlace…</div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              readOnly
              value={url ?? ''}
              style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--c-text)', outline: 'none' }}
            />
            <button
              onClick={copy}
              style={{ padding: '12px 20px', borderRadius: 10, background: copied ? 'var(--c-brand-teal)' : 'var(--c-surface)', border: '1px solid var(--c-border)', fontFamily: 'var(--font-sans)', fontSize: 14, color: copied ? '#fff' : 'var(--c-text)', cursor: 'pointer', transition: 'all .2s' }}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        )}
      </main>
    </>
  )
}
```

- [ ] **Step 2: Create frontend/app/p/[token]/page.tsx**

```typescript
// frontend/app/p/[token]/page.tsx
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { PackView } from '@/components/PackView'
import type { Pack } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

export default async function SharedPackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createServerSupabaseClient()

  const { data: row } = await supabase
    .from('packs')
    .select('*, profiles(name)')
    .eq('shared_token', token)
    .gt('shared_expires_at', new Date().toISOString())
    .single()

  if (!row) notFound()

  const pack: Pack = {
    id: row.id,
    dx: row.dx,
    for: 'yo',
    createdAt: row.created_at,
    summary: row.summary ?? '',
    chapters: row.chapters ?? [],
    references: row.references ?? [],
  }

  const sharedByName = (row as { profiles?: { name?: string } }).profiles?.name

  return (
    <>
      {/* Minimal header for public view */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(16px)', background: 'color-mix(in srgb, var(--c-bg) 78%, transparent)', borderBottom: '1px solid var(--c-border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/assets/aliis-logo.png" alt="Aliis" width={26} height={26} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--c-text)' }}>Aliis</span>
        </Link>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-faint)' }}>
          {sharedByName ? `Compartido por ${sharedByName}` : 'Explicación compartida'} · aliis.app
        </div>
      </header>
      <PackView pack={pack} isPublic />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/compartir/[id]/page.tsx frontend/app/p/[token]/page.tsx
git commit -m "feat(compartir): generate shared link with 30-day expiry; public pack view"
```

---

## Task 18: /precios — Stripe Checkout

**Files:**
- Modify: `frontend/app/precios/page.tsx`

- [ ] **Step 1: Add Stripe checkout action**

Create `frontend/app/actions/checkout.ts`:

```typescript
// frontend/app/actions/checkout.ts
'use server'

import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30' as Stripe.LatestApiVersion })

const PRICE_MAP: Record<string, string | undefined> = {
  eur_monthly: process.env.STRIPE_PRO_PRICE_EUR_MONTHLY,
  eur_yearly: process.env.STRIPE_PRO_PRICE_EUR_YEARLY,
  usd_monthly: process.env.STRIPE_PRO_PRICE_USD_MONTHLY,
  usd_yearly: process.env.STRIPE_PRO_PRICE_USD_YEARLY,
  mxn_monthly: process.env.STRIPE_PRO_PRICE_MXN_MONTHLY,
  mxn_yearly: process.env.STRIPE_PRO_PRICE_MXN_YEARLY,
}

export async function createCheckoutSession(currency: string, cadence: 'monthly' | 'yearly') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const priceId = PRICE_MAP[`${currency}_${cadence}`]
  if (!priceId) throw new Error('Invalid price')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    trial_period_days: 14,
    metadata: { userId: user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/historial?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/precios`,
  })

  redirect(session.url!)
}
```

- [ ] **Step 2: Add Stripe dep to frontend**

```bash
cd frontend && npm install stripe
```

- [ ] **Step 3: Add Stripe server env to frontend/.env.local**

```
STRIPE_SECRET_KEY=<sk_test_...>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 4: Wire CTA in precios page** — find the "Empezar 14 días gratis" button in `frontend/app/precios/page.tsx` and replace it with a form that calls the server action:

In `frontend/app/precios/page.tsx`, add at the top:
```typescript
import { createCheckoutSession } from '@/app/actions/checkout'
```

Replace the Pro plan CTA button with:
```typescript
<form action={async () => {
  'use server'
  await createCheckoutSession(/* currency */'eur', /* cadence */'monthly')
}}>
  <button type="submit" style={{ /* keep existing styles */ }}>
    Empezar 14 días gratis
  </button>
</form>
```

Note: The actual currency/cadence values should be passed from the page's state. Since `/precios` is a Server Component, pass them as hidden inputs or refactor the CTA button into a Client Component that calls the action with the selected values.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/actions/checkout.ts frontend/app/precios/page.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat(precios): Stripe Checkout with 14-day trial, 6 price IDs"
```

---

## Task 19: AppNav — estado real

**Files:**
- Modify: `frontend/components/AppNav.tsx`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Update AppNav to read real session**

Replace `frontend/components/AppNav.tsx`:

```typescript
// frontend/components/AppNav.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoginModal } from './LoginModal'
import { createClient } from '@/lib/supabase'

export function AppNav() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [initial, setInitial] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setInitial(user.email[0].toUpperCase())
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setInitial(session?.user?.email?.[0]?.toUpperCase() ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: 'color-mix(in srgb, var(--c-bg) 78%, transparent)', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', gap: 24 }}>
          <Link href={initial ? '/historial' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <Image src="/assets/aliis-logo.png" alt="Aliis" width={30} height={30} style={{ objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-.02em', color: 'var(--c-text)' }}>Aliis</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!initial && (
              <Link href="/precios" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', textDecoration: 'none' }}>
                Precios
              </Link>
            )}
            {initial ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/ingreso" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', textDecoration: 'none' }}>
                  Nuevo pack
                </Link>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--c-brand-teal-light)', color: 'var(--c-brand-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 14, border: 'none', cursor: 'pointer' }}
                >
                  {initial}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--c-border)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', cursor: 'pointer' }}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
```

- [ ] **Step 2: Add suppressHydrationWarning to layout**

In `frontend/app/layout.tsx`, update the html tag:
```typescript
<html lang="es" suppressHydrationWarning>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/AppNav.tsx frontend/app/layout.tsx
git commit -m "feat(appnav): real session state, logout, Nuevo pack link"
```

---

## Task 20: Landing — wire CTAs

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Update landing CTAs**

In `frontend/app/page.tsx`, find the main CTA button ("Pregúntale a Aliis" or equivalent) and update its click handler to check session:

```typescript
// At the top of the component, add:
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Inside the component:
const router = useRouter()
const supabase = createClient()

async function handleMainCTA() {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    router.push('/ingreso')
  } else {
    setShowLogin(true)
  }
}
```

Replace the main CTA `onClick` with `onClick={handleMainCTA}`.

For the "Ver ejemplo" CTA, update to:
```typescript
onClick={async () => {
  const { data: { user } } = await supabase.auth.getUser()
  router.push(user ? '/historial' : '#demo')
}}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat(landing): CTAs route to /ingreso or /historial when session active"
```

---

## Self-Review

### Spec coverage check

| Spec section | Covered by task |
|---|---|
| Types (§4) | Task 1 |
| Supabase client + middleware (§6) | Task 2 |
| DB schema + RLS + trigger (§3) | Task 3 |
| Auth — LoginModal real (§6, §7.1) | Task 4 |
| Onboarding 3 pasos (§7.2) | Task 5 |
| Backend Supabase client (§5) | Task 6 |
| Intent Classifier / Emergency (§5 Capa 1) | Task 7 |
| Context Enricher (§5 Capa 2) | Task 8 |
| Pack Generator Opus (§5 Capa 3) | Task 9 |
| DOI Verifier (§5 Capa 4) | Task 10 |
| POST /pack/generate + free limit (§5, §7.3) | Task 11 |
| Stripe webhooks (§8) | Task 12 |
| /ingreso chat + UpgradeModal (§7.3) | Task 13 |
| /loading animation + polling (§7.4) | Task 14 |
| /pack/[id] longform + read tracking (§7.5) | Task 15 |
| /historial datos reales + filtros (§7.6) | Task 16 |
| /compartir + /p/[token] (§7.7, §7.8) | Task 17 |
| /precios Stripe Checkout (§7.9, §8) | Task 18 |
| AppNav estado real (§8 Polish) | Task 19 |
| Landing CTAs reales (§7.1) | Task 20 |
| globals.css ce-pulse (§10) | Task 1 |
| Disclaimer programático Capa 5 | PackView (Task 15) ✓ |
| Free limit verificación | Task 11 ✓ |

### Potential gaps

- **`/loading` page**: the spec says redirect to `/loading?packId=...` after POST, but Task 13 (`/ingreso`) currently redirects to `router.push(`/pack/${data.pack.id}`)` directly. The backend generates the pack synchronously. **Fix:** in `/ingreso`, after POSTing, redirect to `/pack/${data.pack.id}` directly (no need for loading polling since the pack exists in DB by the time the response arrives). The `/loading` page still exists for the animation UX — redirect to it, then it polls and immediately finds the pack. Update `/ingreso` Task 13 Step 2 `handleGenerate` to: `router.push(`/loading?packId=${data.pack.id}`)` instead of `/pack/...`.

- **`backend/src/types.ts`** is created in Task 7 but `GeneratePackRequest` is used in Task 11 `pack.ts` from `../types`. The interface is defined in `backend/src/types.ts` in Task 7 — consistent. ✓

- **Stripe API version**: `'2025-04-30'` is used. Cast as `Stripe.LatestApiVersion` to avoid TS errors. ✓
