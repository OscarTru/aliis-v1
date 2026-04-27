# Aliis — Pre-Deploy Checklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar Aliis listo para producción: fix de inconsistencia en free tier, backend autenticado con JWT, deploy en Vercel + Railway, variables de entorno de prod, webhook de Stripe con URL de prod, y Sentry para monitoreo de errores.

**Architecture:** El frontend (Next.js) va a Vercel. El backend Express va a Railway. Ambos comparten Supabase (ya en prod) y Stripe (ya configurado). El backend necesita validar el JWT de Supabase en cada request para cerrar el agujero de seguridad actual (userId llega como body param sin verificación).

**Tech Stack:** Next.js 15 · Express 4 · Supabase (JWT verification) · Stripe Webhooks · Vercel · Railway · Sentry

---

## Estado real confirmado por análisis

| Item | Estado |
|------|--------|
| Botón Stripe en precios | ✅ Ya conectado — `createCheckoutSession` en `startTransition` |
| Límite free tier (backend) | ✅ 1 pack / 7 días — correcto |
| Límite free tier (UI precios) | ✅ "1 por semana" — correcto |
| Límite free tier (términos legales) | ❌ Dice "3 por mes" — hay que corregirlo |
| Auth en backend Express | ❌ userId llega como body param sin verificar JWT |
| Deploy | ❌ Solo local |
| Variables de entorno prod | ❌ No documentadas |
| Sentry | ❌ No configurado |
| `NEXT_PUBLIC_APP_URL` en .env.local | ❌ Falta — checkout usa fallback `localhost:3000` |
| Features prometidas en pricing sin implementar | ⚠️ Audio narrado, PDF, historial 30 días — hay que alinear |

---

## Task 1: Corregir inconsistencia en términos legales (free tier)

**Files:**
- Modify: `frontend/app/(legal)/terminos/page.tsx:59`

- [ ] **Step 1: Corregir el texto**

En `frontend/app/(legal)/terminos/page.tsx` línea 59, cambiar:

```tsx
// ANTES
El plan gratuito permite generar hasta <strong>3 packs educativos por mes</strong> sin coste. Incluye
acceso a la biblioteca de condiciones médicas.

// DESPUÉS
El plan gratuito permite generar hasta <strong>1 explicación por semana</strong> sin coste. Incluye
acceso a la biblioteca de condiciones médicas.
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(legal\)/terminos/page.tsx
git commit -m "fix(legal): alinear límite free tier — 1/semana no 3/mes"
```

---

## Task 2: Alinear features prometidas en pricing con realidad

**Files:**
- Modify: `frontend/app/(shell)/precios/page.tsx`

El pricing promete features no implementadas. Hay que retirarlas o reemplazarlas con features reales que sí existen.

- [ ] **Step 1: Actualizar COMPARISON_ROWS**

En `frontend/app/(shell)/precios/page.tsx`, la tabla de comparación actualmente tiene:

```tsx
const COMPARISON_ROWS = [
  ['Explicaciones por semana', '1', 'Ilimitadas'],
  ['Referencias verificables', '✓', '✓ con DOI desplegable'],
  ['Historial', '30 días', 'Permanente'],
  ['Audio narrado', '—', '✓'],           // ❌ No implementado
  ['Compartir', '3 por explicación', 'Sin límite'],
  ['Diario de síntomas', '—', '✓'],
  ...
]
```

Reemplazar con features reales:

```tsx
const COMPARISON_ROWS = [
  ['Explicaciones por semana', '1', 'Ilimitadas'],
  ['Referencias verificables', '✓', '✓ con DOI desplegable'],
  ['Historial', '30 días', 'Permanente'],
  ['Chat IA por capítulo', '—', '✓'],
  ['Apuntes automáticos', '—', '✓'],
  ['Compartir', '✓', '✓'],
  ['Diario de síntomas', '—', '✓'],
]
```

También buscar y eliminar `['Audio narrado', ...]` y `['PDF sin marca', ...]` de los bullets de features por tier si existen.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(shell\)/precios/page.tsx
git commit -m "fix(pricing): alinear tabla de comparación con features implementadas"
```

---

## Task 3: Agregar autenticación JWT al backend Express

**Files:**
- Create: `backend/src/middleware/auth.ts`
- Modify: `backend/src/routes/pack.ts`
- Modify: `backend/src/index.ts`

El backend actualmente recibe `userId` como body param sin verificar. Cualquiera puede llamar `/pack/generate` con cualquier `userId`. Hay que verificar el JWT de Supabase en cada request.

- [ ] **Step 1: Instalar la librería de Supabase en el backend**

```bash
cd backend && npm install @supabase/supabase-js
```

- [ ] **Step 2: Crear el middleware de auth**

Crear `backend/src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' })
    return
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Token inválido o expirado' })
    return
  }

  // Attach verified userId to request — overrides any body param
  res.locals.userId = user.id
  next()
}
```

- [ ] **Step 3: Aplicar el middleware en pack router**

En `backend/src/routes/pack.ts`, reemplazar el uso de `req.body.userId` con `res.locals.userId`:

```typescript
import { requireAuth } from '../middleware/auth'

// En la ruta /generate, agregar requireAuth como middleware:
packRouter.post('/generate', requireAuth, async (req, res) => {
  // ...
  // Reemplazar: const userId = req.body.userId
  const userId = res.locals.userId  // verificado por JWT
  // ...
})
```

- [ ] **Step 4: Actualizar el frontend para enviar el JWT**

El frontend llama al backend con un fetch. Hay que incluir el token de Supabase en el header. Buscar el fetch en `frontend/app/(shell)/ingreso/` o donde se llame al backend:

```typescript
// Obtener el token de sesión de Supabase
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// Incluirlo en el fetch al backend
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pack/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ dx, context, whoFor, emotion, doubts, conditionSlug }),
})
```

- [ ] **Step 5: Agregar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY al backend .env**

En `backend/.env` (crear si no existe):

```
SUPABASE_URL=https://cdnecuufkdykybisqybm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<el mismo valor que en frontend/.env.local>
```

- [ ] **Step 6: Probar localmente**

```bash
cd backend && npm run dev
# En otra terminal: probar que sin token devuelve 401
curl -X POST http://localhost:3001/pack/generate \
  -H "Content-Type: application/json" \
  -d '{"dx":"migraña"}'
# Esperado: {"error":"No autorizado"}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/middleware/auth.ts backend/src/routes/pack.ts backend/src/index.ts
git commit -m "feat(backend): JWT auth middleware — verifica token Supabase en cada request"
```

---

## Task 4: Agregar `NEXT_PUBLIC_APP_URL` al .env.local

**Files:**
- Modify: `frontend/.env.local`

- [ ] **Step 1: Agregar la variable**

En `frontend/.env.local` agregar:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

En producción esto se sobreescribirá con `https://aliis.app` en las variables de entorno de Vercel.

- [ ] **Step 2: Verificar que checkout.ts lo usa**

En `frontend/app/actions/checkout.ts` ya está:
```typescript
success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/historial?upgraded=1`,
```
✅ Ya funciona correctamente cuando la variable esté seteada.

---

## Task 5: Documentar variables de entorno de producción

**Files:**
- Create: `frontend/.env.example`
- Create: `backend/.env.example`

- [ ] **Step 1: Crear `frontend/.env.example`**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_EUR_MONTHLY=
STRIPE_PRICE_EUR_YEARLY=
STRIPE_PRICE_USD_MONTHLY=
STRIPE_PRICE_USD_YEARLY=
STRIPE_PRICE_MXN_MONTHLY=
STRIPE_PRICE_MXN_YEARLY=

# App
NEXT_PUBLIC_APP_URL=https://aliis.app
NEXT_PUBLIC_API_URL=https://api.aliis.app

# Email
RESEND_API_KEY=

# IA
ANTHROPIC_API_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=G-DSCPNZ3V2H
```

- [ ] **Step 2: Crear `backend/.env.example`**

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# IA
ANTHROPIC_API_KEY=

# Semantic Scholar (si aplica)
# SEMANTIC_SCHOLAR_API_KEY=

# Server
PORT=3001
FRONTEND_URL=https://aliis.app
```

- [ ] **Step 3: Asegurarse de que .env.local está en .gitignore**

```bash
grep ".env.local" .gitignore || echo ".env.local" >> .gitignore
grep ".env" backend/.gitignore 2>/dev/null || echo ".env" >> backend/.gitignore
```

- [ ] **Step 4: Commit**

```bash
git add frontend/.env.example backend/.env.example
git commit -m "docs: agregar .env.example para frontend y backend"
```

---

## Task 6: Deploy del frontend en Vercel

- [ ] **Step 1: Instalar Vercel CLI**

```bash
npm i -g vercel
```

- [ ] **Step 2: Deploy desde el directorio frontend**

```bash
cd frontend && vercel --prod
# Seguir el wizard: asociar al proyecto "aliis", framework Next.js detectado automáticamente
```

- [ ] **Step 3: Configurar variables de entorno en Vercel**

En el dashboard de Vercel (vercel.com/dashboard → proyecto Aliis → Settings → Environment Variables), agregar todas las variables de `frontend/.env.example` con sus valores de producción. Las críticas:

```
NEXT_PUBLIC_SUPABASE_URL        = https://cdnecuufkdykybisqybm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = <anon key>
SUPABASE_SERVICE_ROLE_KEY       = <service role key>
STRIPE_SECRET_KEY               = <live key sk_live_...>
STRIPE_WEBHOOK_SECRET           = <se obtiene en paso 8 — webhook de prod>
STRIPE_PRICE_EUR_MONTHLY        = price_1TQ339RzPm8iXc7MjzO4iQcb
STRIPE_PRICE_EUR_YEARLY         = price_1TQ37LRzPm8iXc7M3TIsBDm8
STRIPE_PRICE_USD_MONTHLY        = price_1TQ35VRzPm8iXc7MFIr55qOB
STRIPE_PRICE_USD_YEARLY         = price_1TQ37rRzPm8iXc7McUZ438WS
STRIPE_PRICE_MXN_MONTHLY        = price_1TQ36DRzPm8iXc7M9qqpTyWK
STRIPE_PRICE_MXN_YEARLY         = price_1TQ39eRzPm8iXc7MFWlkWgCm
NEXT_PUBLIC_APP_URL             = https://aliis.app
NEXT_PUBLIC_API_URL             = https://<railway-url>.railway.app
RESEND_API_KEY                  = <resend key>
ANTHROPIC_API_KEY               = <anthropic key>
NEXT_PUBLIC_GA_ID               = G-DSCPNZ3V2H
```

- [ ] **Step 4: Configurar dominio aliis.app en Vercel**

En Vercel → proyecto → Settings → Domains → agregar `aliis.app` y `www.aliis.app`. Seguir las instrucciones DNS que da Vercel (registros A o CNAME en tu proveedor de dominio).

- [ ] **Step 5: Verificar el deploy**

```bash
curl https://aliis.app
# Esperado: HTML del landing de Aliis
```

---

## Task 7: Deploy del backend Express en Railway

- [ ] **Step 1: Instalar Railway CLI**

```bash
npm i -g @railway/cli
railway login
```

- [ ] **Step 2: Crear proyecto en Railway**

```bash
cd backend
railway init
# Nombre: aliis-backend
railway up
```

- [ ] **Step 3: Configurar variables de entorno en Railway**

En el dashboard de Railway → proyecto aliis-backend → Variables:

```
SUPABASE_URL              = https://cdnecuufkdykybisqybm.supabase.co
SUPABASE_SERVICE_ROLE_KEY = <service role key>
ANTHROPIC_API_KEY         = <anthropic key>
FRONTEND_URL              = https://aliis.app
PORT                      = 3001
```

- [ ] **Step 4: Obtener la URL del backend**

Railway asigna una URL tipo `aliis-backend-production.up.railway.app`. Copiarla.

- [ ] **Step 5: Actualizar NEXT_PUBLIC_API_URL en Vercel**

En Vercel → Variables de entorno, actualizar:
```
NEXT_PUBLIC_API_URL = https://aliis-backend-production.up.railway.app
```

Re-deploy del frontend:
```bash
cd frontend && vercel --prod
```

- [ ] **Step 6: Probar el backend en prod**

```bash
curl https://aliis-backend-production.up.railway.app/health
# Esperado: {"ok":true} o similar
```

---

## Task 8: Configurar webhook de Stripe con URL de producción

- [ ] **Step 1: Crear el webhook en Stripe Dashboard**

Ir a stripe.com → Developers → Webhooks → Add endpoint:
- URL: `https://aliis.app/api/stripe/webhook`
- Eventos a escuchar:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

- [ ] **Step 2: Copiar el Signing Secret**

Stripe genera un `whsec_...` para este endpoint. Copiarlo.

- [ ] **Step 3: Actualizar STRIPE_WEBHOOK_SECRET en Vercel**

En Vercel → Variables de entorno:
```
STRIPE_WEBHOOK_SECRET = whsec_<nuevo secret de prod>
```

Re-deploy:
```bash
cd frontend && vercel --prod
```

- [ ] **Step 4: Probar el webhook**

En Stripe Dashboard → Webhooks → el endpoint creado → Send test webhook → `checkout.session.completed`.

Verificar en los logs de Vercel que llega y se procesa sin error 400.

---

## Task 9: Instalar Sentry para monitoreo de errores

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/sentry.client.config.ts`
- Create: `frontend/sentry.server.config.ts`
- Modify: `backend/package.json`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Crear proyecto en Sentry**

Ir a sentry.io → New Project → Next.js → nombre "aliis-frontend". Copiar el DSN.

- [ ] **Step 2: Instalar Sentry en el frontend**

```bash
cd frontend && npx @sentry/wizard@latest -i nextjs
# Seguir el wizard — agrega automáticamente sentry.client.config.ts, sentry.server.config.ts y sentry.edge.config.ts
```

Cuando pregunte por el DSN, pegar el de "aliis-frontend".

- [ ] **Step 3: Agregar SENTRY_DSN a Vercel**

```
SENTRY_DSN = https://xxx@o0.ingest.sentry.io/yyy
NEXT_PUBLIC_SENTRY_DSN = https://xxx@o0.ingest.sentry.io/yyy
```

- [ ] **Step 4: Instalar Sentry en el backend**

```bash
cd backend && npm install @sentry/node
```

Crear proyecto en Sentry → Node.js → "aliis-backend". Copiar DSN.

En `backend/src/index.ts`, al inicio del archivo:

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})

// Después de definir `app` y antes de las rutas:
app.use(Sentry.Handlers.requestHandler())

// Después de todas las rutas:
app.use(Sentry.Handlers.errorHandler())
```

- [ ] **Step 5: Agregar SENTRY_DSN al backend en Railway**

```
SENTRY_DSN = https://xxx@o0.ingest.sentry.io/yyy
```

- [ ] **Step 6: Commit**

```bash
git add frontend/sentry.*.config.ts backend/src/index.ts backend/package.json
git commit -m "feat(monitoring): Sentry para frontend (Next.js) y backend (Express)"
```

---

## Task 10: Prueba de flujo completo en producción

- [ ] **Step 1: Registrar una cuenta nueva en aliis.app**

Verificar que llega el email de confirmación (Resend funcionando).

- [ ] **Step 2: Completar onboarding**

Verificar que los 3 pasos funcionan y redirige al dashboard.

- [ ] **Step 3: Generar un pack**

Ingresar un diagnóstico. Verificar que el backend de Railway responde y el pack se genera y guarda.

- [ ] **Step 4: Probar el límite free**

Intentar generar un segundo pack en la misma semana. Verificar que aparece el UpgradeModal.

- [ ] **Step 5: Probar el flujo de pago con tarjeta real**

Ir a /precios → Pro → introducir tarjeta real (Stripe live mode). Verificar:
- Stripe Checkout carga con el precio correcto
- El pago se procesa
- El webhook llega a aliis.app/api/stripe/webhook
- El plan en Supabase cambia a 'pro'
- Llega el email de confirmación de pago
- Se puede generar packs sin límite

- [ ] **Step 6: Probar cancelación**

Ir a /cuenta → Portal de Stripe → cancelar. Verificar que el webhook actualiza el plan a 'free'.

---

## Resumen de prioridades

| Task | Tiempo estimado | Impacto |
|------|----------------|---------|
| 1 — Fix legal free tier | 5 min | Compliance |
| 2 — Alinear pricing features | 10 min | Honestidad comercial |
| 3 — JWT auth backend | 30 min | Seguridad crítica |
| 4 — NEXT_PUBLIC_APP_URL | 2 min | Fix checkout redirect |
| 5 — .env.example | 10 min | Documentación |
| 6 — Deploy Vercel | 30 min | Deploy |
| 7 — Deploy Railway | 20 min | Deploy |
| 8 — Webhook Stripe prod | 15 min | Monetización |
| 9 — Sentry | 20 min | Monitoreo |
| 10 — Prueba completa | 30 min | Validación |
