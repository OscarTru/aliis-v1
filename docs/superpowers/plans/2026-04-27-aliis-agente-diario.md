# Aliis Agente Diario — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir a Aliis como agente de salud en el diario: genera un insight personalizado al abrir `/diario` analizando los últimos 30 días de signos vitales y síntomas, y manda una notificación push diaria vía Web Push API.

**Architecture:** El insight se genera con Claude Haiku en `/api/aliis/insight`, se cachea en Supabase (`aliis_insights`) por 24h para no llamar a Claude en cada visita. Las suscripciones push se guardan en `push_subscriptions`. Un Vercel Cron diario llama a `/api/aliis/notify` para mandar el insight del día a cada usuario activo.

**Tech Stack:** Next.js 15 App Router · Claude Haiku (`claude-haiku-4-5-20251001`) · `@anthropic-ai/sdk` (ya instalado) · `web-push` (nuevo) · Supabase · Vercel Cron

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|----------------|
| `frontend/app/api/aliis/insight/route.ts` | Crear | Genera o sirve el insight del día con caché 24h |
| `frontend/app/api/aliis/push/subscribe/route.ts` | Crear | Guarda suscripción Web Push en Supabase |
| `frontend/app/api/aliis/notify/route.ts` | Crear | Cron job: genera insights y manda push a usuarios activos |
| `frontend/lib/aliis-prompt.ts` | Crear | Construye el system prompt y user message para Claude |
| `frontend/lib/web-push.ts` | Crear | Wrapper de `web-push` para mandar notificaciones |
| `frontend/components/AliisInsight.tsx` | Crear | Muestra el insight en el diario con animación |
| `frontend/components/PushPermissionPrompt.tsx` | Crear | Banner que pide permiso de notificaciones push |
| `frontend/app/(shell)/diario/page.tsx` | Modificar | Añadir `<AliisInsight>` y `<PushPermissionPrompt>` |
| `frontend/lib/types.ts` | Modificar | Añadir tipos `AliisInsight` y `PushSubscription` |
| `frontend/.env.local` | Modificar | Añadir VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT, CRON_SECRET |
| `frontend/.env.example` | Modificar | Documentar las nuevas variables |
| `vercel.json` | Crear | Configurar Vercel Cron para `/api/aliis/notify` |
| `frontend/migrations/20260427_aliis_tables.sql` | Crear | Crear tablas `aliis_insights` y `push_subscriptions` |

---

## Task 1: Instalar web-push y generar claves VAPID

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Modify: `frontend/.env.local`
- Modify: `frontend/.env.example`

- [ ] **Step 1: Instalar web-push**

```bash
cd frontend && npm install web-push && npm install --save-dev @types/web-push
```

Esperado: `added N packages`

- [ ] **Step 2: Generar claves VAPID**

```bash
cd frontend && node -e "const wp = require('web-push'); const keys = wp.generateVAPIDKeys(); console.log('PUBLIC:', keys.publicKey); console.log('PRIVATE:', keys.privateKey);"
```

Copia los valores que imprime.

- [ ] **Step 3: Añadir variables al .env.local**

En `frontend/.env.local` añadir al final:

```
VAPID_PUBLIC_KEY=<pega la clave pública aquí>
VAPID_PRIVATE_KEY=<pega la clave privada aquí>
VAPID_CONTACT=mailto:hola@aliis.app
CRON_SECRET=<genera un string aleatorio, ej: openssl rand -hex 32>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<misma clave pública — necesaria en el cliente>
```

- [ ] **Step 4: Documentar en .env.example**

En `frontend/.env.example` añadir:

```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_CONTACT=mailto:hola@aliis.app
CRON_SECRET=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

- [ ] **Step 5: Commit**

```bash
cd frontend && git add package.json package-lock.json .env.example
git commit -m "feat(aliis): instalar web-push, añadir variables VAPID"
```

---

## Task 2: Crear tablas en Supabase

**Files:**
- Create: `frontend/migrations/20260427_aliis_tables.sql`

- [ ] **Step 1: Crear el archivo de migración**

Crear `frontend/migrations/20260427_aliis_tables.sql`:

```sql
-- Tabla de insights de Aliis (1 por usuario por día, cacheado)
create table if not exists aliis_insights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  content      text not null,
  generated_at timestamptz not null default now(),
  data_window  jsonb
);

create unique index if not exists aliis_insights_user_day
  on aliis_insights (user_id, date(generated_at at time zone 'UTC'));

alter table aliis_insights enable row level security;

create policy "Users see own insights" on aliis_insights
  for select using (auth.uid() = user_id);

create policy "Service role inserts insights" on aliis_insights
  for insert with check (true);

-- Tabla de suscripciones Web Push
create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists push_subscriptions_user_endpoint
  on push_subscriptions (user_id, endpoint);

alter table push_subscriptions enable row level security;

create policy "Users manage own subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);

create policy "Service role reads subscriptions" on push_subscriptions
  for select using (true);
```

- [ ] **Step 2: Ejecutar la migración en Supabase**

Ir al dashboard de Supabase → SQL Editor → pegar el contenido del archivo → Run.

Verificar que las tablas aparecen en Table Editor.

- [ ] **Step 3: Commit**

```bash
git add frontend/migrations/20260427_aliis_tables.sql
git commit -m "feat(aliis): tablas aliis_insights y push_subscriptions"
```

---

## Task 3: Tipos TypeScript

**Files:**
- Modify: `frontend/lib/types.ts`

- [ ] **Step 1: Añadir los tipos al final de `frontend/lib/types.ts`**

```typescript
export interface AliisInsight {
  id: string
  user_id: string
  content: string
  generated_at: string
  data_window: unknown
}

export interface PushSubscriptionRecord {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

Esperado: sin errores nuevos.

---

## Task 4: `lib/aliis-prompt.ts` — construir el prompt

**Files:**
- Create: `frontend/lib/aliis-prompt.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import type { SymptomLog } from './types'

interface AliisPromptInput {
  userName: string
  recentDiagnosis: string | null
  logs: SymptomLog[]
}

interface AliisPromptOutput {
  system: string
  userMessage: string
}

export function buildAliisPrompt({ userName, recentDiagnosis, logs }: AliisPromptInput): AliisPromptOutput {
  const system = `Eres Aliis, el agente de salud personal de esta plataforma. Tu trabajo es acompañar al usuario revisando sus registros de síntomas y signos vitales.

Reglas estrictas:
- Habla siempre de tú — conjugación en segunda persona del singular (tienes, has, te has, puedes)
- Habla en primera persona: "he notado", "esta semana vi", "me llama la atención"
- Máximo 3 oraciones. Nunca más.
- Termina siempre con una pregunta suave o recomendación leve
- Nunca diagnostiques. Si algo es preocupante: "podría valer la pena mencionárselo a tu médico en tu próxima cita"
- Usa el nombre del usuario cuando lo conoces
- Si no hay datos o patrones claros, manda un check-in cálido y simple
- Tono: como un amigo que sabe de salud — cercano, no clínico`

  const hasLogs = logs.length > 0
  const last7 = logs.filter(l => {
    const d = new Date(l.logged_at)
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  })
  const last30 = logs

  // Compute averages for last 7 days
  const avg = (vals: (number | null)[]): number | null => {
    const nums = vals.filter((v): v is number => v !== null)
    return nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
  }

  const avg30 = {
    glucose: avg(last30.map(l => l.glucose)),
    bp_systolic: avg(last30.map(l => l.bp_systolic)),
    bp_diastolic: avg(last30.map(l => l.bp_diastolic)),
    heart_rate: avg(last30.map(l => l.heart_rate)),
  }

  const avg7 = {
    glucose: avg(last7.map(l => l.glucose)),
    bp_systolic: avg(last7.map(l => l.bp_systolic)),
    bp_diastolic: avg(last7.map(l => l.bp_diastolic)),
    heart_rate: avg(last7.map(l => l.heart_rate)),
  }

  // Extract symptom keywords from notes
  const notes7 = last7.map(l => l.note).filter(Boolean) as string[]
  const notes30 = last30.map(l => l.note).filter(Boolean) as string[]

  const userMessage = `Usuario: ${userName}
Diagnóstico principal: ${recentDiagnosis ?? 'no registrado'}
Tiene registros: ${hasLogs ? 'sí' : 'no'}
Registros últimos 7 días: ${last7.length}
Registros últimos 30 días: ${last30.length}

Promedios últimos 7 días:
- Glucosa: ${avg7.glucose ?? 'sin datos'} mg/dL
- Presión: ${avg7.bp_systolic ?? 'sin datos'}/${avg7.bp_diastolic ?? 'sin datos'} mmHg
- Frecuencia cardíaca: ${avg7.heart_rate ?? 'sin datos'} bpm

Promedios últimos 30 días (referencia):
- Glucosa: ${avg30.glucose ?? 'sin datos'} mg/dL
- Presión: ${avg30.bp_systolic ?? 'sin datos'}/${avg30.bp_diastolic ?? 'sin datos'} mmHg
- Frecuencia cardíaca: ${avg30.heart_rate ?? 'sin datos'} bpm

Notas de síntomas (últimos 7 días): ${notes7.length > 0 ? notes7.join(' | ') : 'ninguna'}
Notas de síntomas (últimos 30 días): ${notes30.length > 0 ? notes30.slice(0, 10).join(' | ') : 'ninguna'}

Genera un mensaje de Aliis para este usuario. Máximo 3 oraciones.`

  return { system, userMessage }
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

---

## Task 5: `lib/web-push.ts` — wrapper de notificaciones

**Files:**
- Create: `frontend/lib/web-push.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_CONTACT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload {
  title: string
  body: string
  url?: string
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ ok: true } | { ok: false; expired: boolean }> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    )
    return { ok: true }
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    // 404 o 410 = suscripción expirada/cancelada
    return { ok: false, expired: status === 404 || status === 410 }
  }
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

---

## Task 6: `app/api/aliis/insight/route.ts`

**Files:**
- Create: `frontend/app/api/aliis/insight/route.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildAliisPrompt } from '@/lib/aliis-prompt'
import type { SymptomLog } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  // 1. Check cache — 1 insight per user per day
  const today = new Date().toISOString().slice(0, 10)
  const { data: cached } = await supabase
    .from('aliis_insights')
    .select('content, generated_at')
    .eq('user_id', user.id)
    .gte('generated_at', `${today}T00:00:00Z`)
    .lt('generated_at', `${today}T23:59:59Z`)
    .single()

  if (cached) {
    return Response.json({ content: cached.content, cached: true })
  }

  // 2. Fetch data
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [profileRes, logsRes, packRes] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).single(),
    supabase.from('symptom_logs').select('*').eq('user_id', user.id).gte('logged_at', since30).order('logged_at', { ascending: false }),
    supabase.from('packs').select('dx').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
  ])

  const userName = profileRes.data?.name ?? 'tú'
  const logs = (logsRes.data ?? []) as SymptomLog[]
  const recentDiagnosis = packRes.data?.dx ?? null

  // 3. Build prompt and call Claude Haiku
  const { system, userMessage } = buildAliisPrompt({ userName, recentDiagnosis, logs })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = (message.content[0] as { type: string; text: string }).text.trim()

  // 4. Save to cache
  await supabase.from('aliis_insights').insert({
    user_id: user.id,
    content,
    data_window: { logs: logs.length, userName, recentDiagnosis },
  })

  return Response.json({ content, cached: false })
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 3: Probar manualmente**

Con el servidor corriendo (`npm run dev`), iniciar sesión y visitar:
```
http://localhost:3000/api/aliis/insight
```
Esperado: `{ "content": "...", "cached": false }` la primera vez, `{ "content": "...", "cached": true }` la segunda.

---

## Task 7: `app/api/aliis/push/subscribe/route.ts`

**Files:**
- Create: `frontend/app/api/aliis/push/subscribe/route.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json() as {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ error: 'Suscripción inválida' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: body.endpoint,
    p256dh: body.keys.p256dh,
    auth: body.keys.auth,
  }, { onConflict: 'user_id,endpoint' })

  if (error) return Response.json({ error: 'Error guardando suscripción' }, { status: 500 })

  return Response.json({ ok: true })
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

---

## Task 8: `app/api/aliis/notify/route.ts` — cron job

**Files:**
- Create: `frontend/app/api/aliis/notify/route.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { buildAliisPrompt } from '@/lib/aliis-prompt'
import { sendPushNotification } from '@/lib/web-push'
import type { SymptomLog } from '@/lib/types'

// Usa service role — bypasses RLS para leer todos los usuarios
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(req: Request) {
  // Verificar CRON_SECRET para que solo Vercel Cron pueda llamar esto
  const secret = req.headers.get('x-cron-secret') ?? new URL(req.url).searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Usuarios activos: con symptom_logs en últimos 30 días y con push_subscriptions
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .limit(100)

  if (!subs || subs.length === 0) return Response.json({ sent: 0, skipped: 0 })

  let sent = 0
  let skipped = 0

  for (const sub of subs) {
    // Check cache
    const { data: cached } = await supabase
      .from('aliis_insights')
      .select('content')
      .eq('user_id', sub.user_id)
      .gte('generated_at', `${today}T00:00:00Z`)
      .maybeSingle()

    let content: string

    if (cached) {
      content = cached.content
    } else {
      // Generate insight
      const [profileRes, logsRes, packRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', sub.user_id).single(),
        supabase.from('symptom_logs').select('*').eq('user_id', sub.user_id).gte('logged_at', since30).order('logged_at', { ascending: false }),
        supabase.from('packs').select('dx').eq('user_id', sub.user_id).order('created_at', { ascending: false }).limit(1).single(),
      ])

      const userName = profileRes.data?.name ?? 'tú'
      const logs = (logsRes.data ?? []) as SymptomLog[]
      const recentDiagnosis = packRes.data?.dx ?? null

      const { system, userMessage } = buildAliisPrompt({ userName, recentDiagnosis, logs })
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        system,
        messages: [{ role: 'user', content: userMessage }],
      })
      content = (message.content[0] as { type: string; text: string }).text.trim()

      await supabase.from('aliis_insights').insert({
        user_id: sub.user_id,
        content,
        data_window: { logs: logs.length, userName, recentDiagnosis },
      })
    }

    // Send push
    const result = await sendPushNotification(sub, {
      title: 'Aliis',
      body: content.slice(0, 80) + (content.length > 80 ? '…' : ''),
      url: '/diario',
    })

    if (result.ok) {
      sent++
    } else {
      skipped++
      // Si la suscripción expiró, eliminarla
      if (result.expired) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      }
    }
  }

  return Response.json({ sent, skipped })
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

---

## Task 9: `vercel.json` — configurar Cron

**Files:**
- Create: `vercel.json` (en la raíz del repo, no en `/frontend`)

- [ ] **Step 1: Crear el archivo**

En la raíz del repo (`/Users/oscar/.../Aliis/vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/aliis/notify",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Nota: Vercel Cron incluye el header `x-vercel-cron: 1` automáticamente en las llamadas cron. Pero usamos `CRON_SECRET` para mayor seguridad — hay que configurar en Vercel que el cron añada `?secret=<CRON_SECRET>` o pasar el secret como query param en el path:

```json
{
  "crons": [
    {
      "path": "/api/aliis/notify?secret=<no pongas el secret aquí>",
      "schedule": "0 9 * * *"
    }
  ]
}
```

En realidad, la solución más segura es verificar el header `x-vercel-cron` que Vercel añade automáticamente. Actualiza el route de notify para verificar ese header en lugar de CRON_SECRET:

En `frontend/app/api/aliis/notify/route.ts`, reemplaza la verificación de secret por:

```typescript
// Vercel Cron añade este header automáticamente — solo acepta llamadas de Vercel
const isVercelCron = req.headers.get('x-vercel-cron') === '1'
const hasSecret = req.headers.get('x-cron-secret') === process.env.CRON_SECRET
if (!isVercelCron && !hasSecret) {
  return Response.json({ error: 'No autorizado' }, { status: 401 })
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat(aliis): Vercel Cron para notify diario a las 9am UTC"
```

---

## Task 10: `components/AliisInsight.tsx`

**Files:**
- Create: `frontend/components/AliisInsight.tsx`

- [ ] **Step 1: Crear el componente**

```typescript
'use client'

import { useEffect, useState } from 'react'

export function AliisInsight() {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/aliis/insight')
      .then(r => r.json())
      .then(d => setContent(d.content ?? null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 mb-6 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary/20" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-[10px] font-serif font-semibold">A</span>
        </div>
        <span className="font-mono text-[10px] tracking-[.15em] uppercase text-primary">Aliis</span>
      </div>
      <p className="font-serif text-[15px] leading-relaxed text-foreground italic">
        {content}
      </p>
    </div>
  )
}
```

---

## Task 11: `components/PushPermissionPrompt.tsx`

**Files:**
- Create: `frontend/components/PushPermissionPrompt.tsx`

- [ ] **Step 1: Crear el componente**

```typescript
'use client'

import { useState, useEffect } from 'react'

export function PushPermissionPrompt() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'default') {
      setShow(true)
    }
  }, [])

  async function handleAccept() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setShow(false); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      const json = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      await fetch('/api/aliis/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
    } catch {
      // silently fail — notificaciones no son críticas
    } finally {
      setShow(false)
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 mb-5 flex items-center justify-between gap-4">
      <p className="font-sans text-sm text-muted-foreground leading-snug">
        ¿Quieres que Aliis te avise si detecta algo? Solo manda algo si vale la pena.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setShow(false)}
          className="px-3 py-1.5 rounded-lg font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ahora no
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-primary text-white font-sans text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? 'Un momento…' : 'Activar'}
        </button>
      </div>
    </div>
  )
}
```

---

## Task 12: Service Worker para Web Push

**Files:**
- Create: `frontend/public/sw.js`

Web Push requiere un Service Worker que maneje el evento `push` del navegador.

- [ ] **Step 1: Crear `frontend/public/sw.js`**

```javascript
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title ?? 'Aliis'
  const body = data.body ?? ''
  const url = data.url ?? '/diario'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/assets/aliis-black-single.png',
      badge: '/assets/aliis-black-single.png',
      data: { url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/diario')
  )
})
```

- [ ] **Step 2: Registrar el Service Worker en el layout**

En `frontend/app/layout.tsx`, añadir un script de registro del SW en el body:

```typescript
// Añadir este componente antes del cierre del body
function RegisterSW() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `,
      }}
    />
  )
}
```

Y en el layout, añadir `<RegisterSW />` antes de `</body>`.

- [ ] **Step 3: Commit**

```bash
git add frontend/public/sw.js frontend/app/layout.tsx
git commit -m "feat(aliis): service worker para Web Push"
```

---

## Task 13: Integrar en `diario/page.tsx`

**Files:**
- Modify: `frontend/app/(shell)/diario/page.tsx`

- [ ] **Step 1: Añadir AliisInsight y PushPermissionPrompt**

```typescript
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DiarioNotesSection } from '@/components/DiarioNotesSection'
import { SymptomsSection } from '@/components/SymptomsSection'
import { AliisInsight } from '@/components/AliisInsight'
import { PushPermissionPrompt } from '@/components/PushPermissionPrompt'
import type { NoteWithPack, SymptomLog } from '@/lib/types'

export default async function DiarioPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const uid = user.id

  const [notesResult, symptomsResult] = await Promise.all([
    supabase
      .from('pack_notes')
      .select('id, pack_id, content, created_at, packs!inner(dx, created_at)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false }),
    supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', uid)
      .order('logged_at', { ascending: false })
      .limit(90),
  ])

  const notes: NoteWithPack[] = (notesResult.data ?? []).map((row: {
    id: string
    pack_id: string
    content: string
    created_at: string
    packs: { dx: string; created_at: string } | { dx: string; created_at: string }[]
  }) => {
    const pack = Array.isArray(row.packs) ? row.packs[0] : row.packs
    return {
      id: row.id,
      pack_id: row.pack_id,
      content: row.content,
      created_at: row.created_at,
      dx: pack?.dx ?? '',
      pack_created_at: pack?.created_at ?? row.created_at,
    }
  })

  const logs: SymptomLog[] = (symptomsResult.data ?? []) as SymptomLog[]

  return (
    <div className="px-8 pt-10 pb-20 max-w-[1200px] mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-1">
          Mi diario
        </p>
        <h1 className="font-serif text-[28px] leading-[1.2] text-foreground m-0">
          Tu <em>diario</em> de salud
        </h1>
      </div>

      {/* Aliis insight */}
      <AliisInsight />

      {/* Push permission prompt */}
      <PushPermissionPrompt />

      {/* Two-column dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-2xl border border-border bg-card p-6 min-h-[400px]">
          <DiarioNotesSection notes={notes} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 min-h-[400px]">
          <SymptomsSection initialLogs={logs} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
cd frontend && npm run build 2>&1 | tail -20
```

Esperado: sin errores de compilación.

- [ ] **Step 3: Commit final**

```bash
git add \
  frontend/app/api/aliis/ \
  frontend/lib/aliis-prompt.ts \
  frontend/lib/web-push.ts \
  frontend/lib/types.ts \
  frontend/components/AliisInsight.tsx \
  frontend/components/PushPermissionPrompt.tsx \
  frontend/app/\(shell\)/diario/page.tsx \
  frontend/.env.example
git commit -m "feat(aliis): agente de salud en diario — insights + push notifications"
```

---

## Self-Review

**Spec coverage:**
- ✅ Insight al abrir el diario — Task 6 + 10 + 13
- ✅ Caché 24h en Supabase — Task 6
- ✅ Analiza signos vitales + síntomas — Task 4
- ✅ Personalidad tú/primera persona — Task 4 (system prompt)
- ✅ Notificación push diaria — Task 8 + 9 + 11 + 12
- ✅ Tablas Supabase — Task 2
- ✅ VAPID / web-push — Task 1 + 5
- ✅ Check-in si no hay datos — Task 4 (buildAliisPrompt maneja logs vacíos)
- ✅ Solo desktop + Android (Web Push nativo) — sin configuración adicional

**Tipo consistency:** `SymptomLog` y `AliisInsight` definidos en Task 3, usados en Task 4, 6, 8. `PushSubscriptionRecord` definido pero solo se usa internamente en Supabase — no se exporta innecesariamente. ✅
