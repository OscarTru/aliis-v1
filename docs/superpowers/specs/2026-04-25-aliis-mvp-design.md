# Aliis MVP — Design Spec
> 2026-04-25 · Basado en PRD v1.0 · Cerebros Esponjosos

---

## 1. Objetivo

Convertir el UI mock actual en un MVP funcional y desplegable: auth real, generación de packs con IA, historial persistente, compartir por link, y monetización con Stripe. Arquitectura preparada para escalar sin reescribir.

---

## 2. Arquitectura

### Monorepo

```
/frontend/    → Next.js 15 App Router (Vercel)
/backend/     → Express + TypeScript (Railway o Render)
```

El root `app/` se deja intacto pero no se desarrolla más — toda la plataforma vive en `frontend/`.

### Frontend — rutas

```
/                     → landing (público)
/precios              → precios (público)
/p/[token]            → pack compartido read-only (público, sin AppNav)

/onboarding           → 3 pasos, solo primera vez (protegido)
/ingreso              → chat conversacional (protegido)
/loading              → animación generando pack (protegido)
/pack/[id]            → pack educativo longform (protegido)
/historial            → biblioteca de packs (protegido)
/compartir/[id]       → flujo de compartir (protegido)
```

Rutas protegidas usan middleware de Supabase Auth. Si no hay sesión → redirect a `/` con modal de login.

### Backend — endpoints

```
POST /pack/generate     → pipeline completo de IA
POST /ingreso/ocr       → OCR de foto de receta (fase 2)
POST /stripe/webhook    → eventos de Stripe
GET  /health            → healthcheck
```

---

## 3. Base de datos (Supabase PostgreSQL)

```sql
-- Perfil extendido (complementa auth.users de Supabase)
profiles (
  id                uuid references auth.users primary key,
  name              text,
  who               text check (who in ('yo', 'familiar')),
  plan              text default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  onboarding_done   boolean default false,
  created_at        timestamptz default now()
)

-- Packs generados
packs (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references profiles(id) on delete cascade,
  dx               text not null,
  summary          text,
  chapters         jsonb not null,
  references       jsonb,
  shared_token     text unique,
  shared_expires_at timestamptz,
  created_at       timestamptz default now()
)

-- Lectura por capítulo
chapter_reads (
  pack_id    uuid references packs(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  chapter_id text not null,
  read_at    timestamptz default now(),
  primary key (pack_id, user_id, chapter_id)
)
```

**RLS:**
- `profiles`: usuario solo lee/escribe su propio perfil
- `packs`: usuario solo lee/escribe sus propios packs. Excepción: packs con `shared_token` válido y `shared_expires_at > now()` son legibles sin auth (policy separada para `/p/[token]`)
- `chapter_reads`: usuario solo lee/escribe sus propias lecturas

`symptom_diary` queda para fase 2.

---

## 4. Tipos TypeScript compartidos

`frontend/lib/types.ts` — reemplaza el `DiagnosticoResponse` actual:

```typescript
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
  pack: Pack
  references: Reference[]
  limitReached?: boolean
  emergencyResponse?: string
  blockedReason?: 'DOSE' | 'DIAGN' | 'OOD'
}
```

---

## 5. Pipeline de IA (backend)

### Estructura de archivos

```
backend/src/
  index.ts           → servidor Express, rutas
  routes/
    pack.ts          → POST /pack/generate
  lib/
    classifier.ts    → Capa 1: Intent Classifier
    generator.ts     → Capa 3: Pack Generator
    verifier.ts      → Capa 4: DOI Verifier
    emergency.ts     → Capa 1b: respuesta EMERG hardcoded
    enricher.ts      → Capa 2: Context enrichment
```

### Las 5 capas

**Capa 1 — Intent Classifier** (`claude-haiku-4-5-20251001`)
- Clasifica el input en: `SAFE | DOSE | DIAGN | EMERG | OOD`
- Si no es `SAFE`: devuelve respuesta hardcoded, no llama a opus
- Protocolo EMERG: respuesta inmediata con números de emergencia (112 España, 911 México), sin cobrar crédito
- Bloques DOSE/DIAGN/OOD: mensaje explicativo, sin pack
- Prompt caching con `cache_control: { type: "ephemeral" }` en el system prompt del classifier

**Capa 2 — Context enrichment**
- Si el usuario tiene packs previos, añade los últimos 2 `dx` al contexto
- Añade `para` (yo/familiar) y `nombre` del profile

**Capa 3 — Pack Generator** (`claude-opus-4-5`)
- System prompt completo de la sección 12 del PRD
- Respuesta: JSON estricto con `chapters[5]` + `references[]`
- Prompt caching en system prompt
- Temperatura 0 para consistencia
- Si el JSON es inválido: reintenta una vez, luego devuelve error

**Capa 4 — DOI Verifier**
- Valida formato DOI con regex: `/^10\.\d{4,}\/\S+$/`
- Verifica existencia via `api.semanticscholar.org/graph/v1/paper/{doi}?fields=title`
- Timeout: 3s por DOI (no bloquea si Semantic Scholar es lento)
- DOIs inválidos o no verificados: `verified: false`, se ocultan en el frontend
- Si >50% de referencias fallan: regenera una vez con temperatura 0
- Si todas fallan: pack se sirve con nota "Las fuentes de este pack están en revisión"

**Capa 5 — Disclaimer**
- Se añade programáticamente al response, nunca generado por IA
- Texto fijo: "Esta información es educativa y no reemplaza la consulta con tu médico."

### Límite free
- Verificado antes del classifier: cuenta packs del usuario en los últimos 7 días
- Si `plan = 'free'` y `count >= 1`: devuelve `{ limitReached: true }` sin llamar a IA
- Frontend muestra modal upgrade

---

## 6. Auth (Supabase)

- Email + password para MVP (OAuth en fase 2)
- `supabase.auth.signUp()` → crea usuario en `auth.users` → trigger crea row en `profiles`
- `supabase.auth.signInWithPassword()` → sesión con cookie (SSR compatible)
- Middleware Next.js (`middleware.ts`): verifica sesión en rutas protegidas, redirect a `/` si no hay sesión
- Login/signup: modal en landing (ya existe `LoginModal.tsx`) — expandir para que sea funcional
- Tras signup exitoso: redirect a `/onboarding` si `onboarding_done = false`
- Tras login: redirect a `/historial`

---

## 7. Pantallas — especificación de implementación

### 7.1 Landing `/`
Estado actual: implementada con mock. Cambios para MVP:
- CTA "Pregúntale a Aliis" → abre `LoginModal` (ya funciona) o redirect a `/ingreso` si hay sesión
- CTA "Ver ejemplo" → `/historial` (con sesión) o abre demo estática
- `LoginModal`: implementar signup + login real con Supabase Auth
- Sin otros cambios estructurales — el diseño ya está bien

### 7.2 Onboarding `/onboarding`
Nueva pantalla. 3 pasos con barra de progreso:

```
Paso 1: Bienvenida + 3 promesas (solo lectura, botón Continuar)
Paso 2: Nombre → guarda en profiles.name
Paso 3: ¿Para quién? [Para mí / Para un familiar] → guarda en profiles.who
Al completar: profiles.onboarding_done = true → redirect a /ingreso
```

Header: logo + barra de progreso (3 segmentos) + botón "Saltar" (marca onboarding_done sin guardar nombre/who).

### 7.3 Ingreso `/ingreso`
Nueva pantalla. Chat conversacional en 4 turnos para MVP (texto only):

```
Turn 1 [Bot]: Saludo + chips de modo [Escribir | Buscar diagnóstico]
Turn 2 [User]: Input de texto libre con el diagnóstico
Turn 3 [Bot]: Confirmación + 2 QuickPick (frecuencia, dudas principales)
Turn 4 [User]: Responde QuickPicks → botón "Generar pack"
```

Al pulsar "Generar pack":
- Verifica límite free → si limitReached: muestra modal upgrade
- Si ok: POST /pack/generate → redirect a /loading?packId=... (el pack se genera en background)

Composer sticky en bottom: input texto + botón enviar.

Para MVP: no OCR, no voz, no buscar diagnóstico con autocomplete. Esos son fase 2.

### 7.4 Loading `/loading`
Nueva pantalla. Recibe `packId` como query param.

```
- ScribbleBrain con anillo de puntos rotando
- Eyebrow: "· Destilando ·"
- H1 animado que cambia entre 5 etapas (1.4s cada una)
- Lista de etapas con estado: ✓ / ⟳ / ○
- Botón ghost: "Saltar (demo)" solo en development
```

Polling cada 2s al backend (o usa Supabase Realtime si el pack se guarda en DB directamente).
Al recibir pack completo → redirect a `/pack/[id]`.

### 7.5 Pack `/pack/[id]`
Estado actual: implementado como mock con sidebar. Para MVP:
- Carga datos reales desde Supabase (`packs` table)
- Layout: **longform** (variante A del PRD) — columna única, scroll continuo
- Al leer cada capítulo (scroll + tiempo en viewport >10s): POST a `chapter_reads`
- Referencias: mostrar solo las `verified: true`, con DOI como link externo
- Disclaimer (`AINote`) siempre visible al final de cada capítulo
- Botones: [Compartir] → `/compartir/[id]` | [Ver mis explicaciones] → `/historial`

### 7.6 Historial `/historial`
Estado actual: implementado con mock. Para MVP:
- Carga packs reales del usuario desde Supabase
- Progreso de capítulos desde `chapter_reads`
- Filtros: [Todos | Sin leer | A medias | Leído] — filtrado en cliente
- Empty state: ScribbleBrain + CTA a `/ingreso`

### 7.7 Compartir `/compartir/[id]`
Nueva pantalla. Solo modo Enlace para MVP (email y mensaje son fase 2):

```
- Genera shared_token (uuid v4) + shared_expires_at (30 días)
- Guarda en packs.shared_token via Supabase
- Input readonly con URL: aliis.app/p/[token]
- Botón copiar
- Preview: descripción de qué verá el destinatario
```

### 7.8 Pack compartido `/p/[token]`
Nueva ruta pública. Carga pack via `shared_token`:
- Verifica que `shared_expires_at > now()`
- Render del pack en modo read-only (misma UI que `/pack/[id]` pero sin AppNav de usuario)
- Sin botones de compartir ni historial
- Banner: "Compartido por [nombre] via Aliis · aliis.app"

### 7.9 Precios `/precios`
Estado actual: implementado con mock. Para MVP:
- Toggle mensual/anual (-20%)
- Selector EUR/USD/MXN (ya implementado)
- CTA "Empezar gratis" → signup modal
- CTA "Empezar 14 días gratis" → Stripe Checkout (hosted)
- Stripe Checkout: `mode: 'subscription'`, `trial_period_days: 14`, precio según moneda y cadencia seleccionada

---

## 8. Stripe

### Productos y precios

Un producto `aliis_pro` con 6 price IDs:
```
aliis_pro_eur_monthly   → €9.99/mes
aliis_pro_eur_yearly    → €95.90/año (-20%)
aliis_pro_usd_monthly   → $9.99/mes
aliis_pro_usd_yearly    → $95.90/año
aliis_pro_mxn_monthly   → MXN 199/mes
aliis_pro_mxn_yearly    → MXN 1910/año
```

### Webhooks (backend `/stripe/webhook`)

```
checkout.session.completed        → profiles.plan = 'pro', guarda stripe_customer_id
customer.subscription.deleted     → profiles.plan = 'free'
customer.subscription.updated     → sincroniza plan según subscription.status
```

### Variables de entorno

```
# Backend
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_EUR_MONTHLY
STRIPE_PRO_PRICE_EUR_YEARLY
STRIPE_PRO_PRICE_USD_MONTHLY
STRIPE_PRO_PRICE_USD_YEARLY
STRIPE_PRO_PRICE_MXN_MONTHLY
STRIPE_PRO_PRICE_MXN_YEARLY

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## 9. Variables de entorno completas

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Backend (`backend/.env`)
```
ANTHROPIC_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_EUR_MONTHLY
STRIPE_PRO_PRICE_EUR_YEARLY
STRIPE_PRO_PRICE_USD_MONTHLY
STRIPE_PRO_PRICE_USD_YEARLY
STRIPE_PRO_PRICE_MXN_MONTHLY
STRIPE_PRO_PRICE_MXN_YEARLY
FRONTEND_URL=http://localhost:3000
PORT=3001
```

---

## 10. Design system — recordatorio de implementación

- **CSS custom properties nativas** para todo (ya definidas en `globals.css`) — no Tailwind para componentes nuevos
- **Fuentes:** Instrument Serif (títulos, cuerpo de packs) + Inter (UI) — ya importadas
- **Animaciones:** `ce-fade`, `ce-spin`, `ce-pulse` — definir en `globals.css`
- **Componentes UI existentes** (`Button`, `Capsule`, `Eyebrow`, `Glow`, `ScribbleBrain`) — reutilizar sin modificar
- **Dark mode:** variables definidas, no implementar en MVP — preparar el terreno con `.dark` class en `<html>`

---

## 11. Orden de construcción

```
Bloque 1 — Fundación
  1a. Tipos TypeScript (frontend/lib/types.ts)
  1b. Supabase client browser + server (frontend/lib/supabase.ts)
  1c. Middleware de auth (frontend/middleware.ts)
  1d. Trigger SQL: crear profile en signup
  1e. globals.css: añadir ce-pulse, ce-fade, completar tokens faltantes

Bloque 2 — Auth
  2a. LoginModal: signup + login real con Supabase
  2b. /onboarding: 3 pasos, guarda en profiles

Bloque 3 — Backend IA
  3a. backend/src/lib/classifier.ts
  3b. backend/src/lib/generator.ts
  3c. backend/src/lib/verifier.ts
  3d. backend/src/lib/emergency.ts
  3e. backend/src/lib/enricher.ts
  3f. backend/src/routes/pack.ts → POST /pack/generate
  3g. Integrar en backend/src/index.ts

Bloque 4 — Core flow
  4a. /ingreso: chat conversacional (texto)
  4b. /loading: animación + polling
  4c. /pack/[id]: longform con datos reales + read tracking

Bloque 5 — Historial
  5a. /historial: datos reales + filtros + progreso real

Bloque 6 — Compartir
  6a. /compartir/[id]: genera token, copia link
  6b. /p/[token]: vista pública read-only

Bloque 7 — Stripe
  7a. /precios: conectar CTAs a Stripe Checkout
  7b. backend/src/routes/stripe.ts: webhooks
  7c. Modal upgrade en /ingreso

Bloque 8 — Polish
  8a. AppNav con estado real (nombre, plan, logout)
  8b. Error states y empty states
  8c. Preparar dark mode (class en html, sin implementar completamente)
```

---

## 12. Fuera de scope (fase 2)

- OCR de fotos de receta
- Dictado de voz
- Pack variantes `chapters` y `cards`
- Audio narrado del pack
- Diario de síntomas
- Compartir por email / mensaje
- OAuth (Google, Apple)
- Prep de consulta inteligente
- Post-consulta update
- Dark mode completo
- App móvil / PWA
