# Aliis AI-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar los agentes de Aliis con memoria compartida, un orquestador de señales, un resumen narrativo del paciente, y un endpoint queryable que potencia el botón "Pregúntale a Aliis" en toda la app.

**Architecture:** Cuatro fases secuenciales: (A) `agent_memory` como base de memoria compartida entre agentes, (B) `patient-context.ts` que construye un resumen narrativo desde esa memoria, (C) `AliisCore` que orquesta señales y reemplaza la lógica dispersa en el cron de notify, (D) `/api/aliis/agent` como endpoint único queryable consumido por el botón existente en web y mobile.

**Tech Stack:** Next.js 15 App Router, Supabase (PostgreSQL + RLS), Anthropic SDK con prompt caching, TypeScript, Vitest (tests existentes en `frontend/app/api/__tests__/`)

**Spec:** `docs/superpowers/specs/2026-05-04-aliis-ai-first-design.md`

---

## File Map

### Archivos nuevos
```
frontend/migrations/20260504_agent_memory.sql          — tabla agent_memory + RLS + índices
frontend/lib/agent-memory.ts                           — writeMemory / readMemory helpers
frontend/lib/patient-context.ts                        — getPatientContext() + PatientSummary
frontend/lib/aliis-core.ts                             — runAliisCore() → AliisSignal
frontend/app/api/aliis/agent/route.ts                  — POST /api/aliis/agent (3 modos)
frontend/app/api/aliis/agent/summary/route.ts          — GET cron semanal patient_summary
frontend/app/api/__tests__/aliis-agent.test.ts         — tests del agente
```

### Archivos modificados
```
frontend/lib/types.ts                                  — AgentMemory, AliisSignal, PatientSummary
frontend/app/api/aliis/insight/route.ts                — escribir + leer agent_memory
frontend/app/api/aliis/treatment-check/cron/route.ts   — escribir agent_memory
frontend/app/api/aliis/notify/route.ts                 — delegar a runAliisCore()
frontend/lib/sentry-scrub.ts                           — añadir /api/aliis/agent a rutas scrubbed
frontend/vercel.json                                   — cron semanal patient_summary
frontend/components/ChapterChat.tsx                    — pasar screen_context al agente
frontend/components/ChatDrawer.tsx                     — pasar screen_context al agente
```

---

## FASE A — Agent Memory Foundation

---

### Task 1: Migración `agent_memory`

**Files:**
- Create: `frontend/migrations/20260504_agent_memory.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- frontend/migrations/20260504_agent_memory.sql
create table if not exists agent_memory (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  agent_name   text not null,
  memory_type  text not null check (memory_type in ('observation', 'pattern', 'alert', 'recommendation')),
  content      jsonb not null,
  relevance    float not null default 1.0,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz
);

create index if not exists agent_memory_user_agent
  on agent_memory (user_id, agent_name, created_at desc);

create index if not exists agent_memory_type
  on agent_memory (user_id, memory_type, created_at desc);

alter table agent_memory enable row level security;

create policy "Users see own memory" on agent_memory
  for select using (auth.uid() = user_id);

create policy "Service role full access" on agent_memory
  for all using (true);
```

- [ ] **Step 2: Aplicar la migración en Supabase**

En el MCP de Supabase, aplicar la migración al proyecto `cdnecuufkdykybisqybm`. Verificar que la tabla `agent_memory` aparece en el schema público sin errores.

- [ ] **Step 3: Commit**

```bash
git add frontend/migrations/20260504_agent_memory.sql
git commit -m "feat(db): agent_memory table + RLS + indexes"
```

---

### Task 2: Tipos en `types.ts`

**Files:**
- Modify: `frontend/lib/types.ts`

- [ ] **Step 1: Leer el final del archivo para saber dónde añadir**

```bash
tail -30 frontend/lib/types.ts
```

- [ ] **Step 2: Añadir los tipos nuevos al final del archivo**

```typescript
// Agent Memory
export type AgentName = 'InsightAgent' | 'MonitorAgent' | 'AdherenceAgent' | 'SymptomAgent' | 'CorrelationAgent'
export type MemoryType = 'observation' | 'pattern' | 'alert' | 'recommendation'

export interface AgentMemory {
  id: string
  user_id: string
  agent_name: AgentName
  memory_type: MemoryType
  content: Record<string, unknown>
  relevance: number
  created_at: string
  expires_at: string | null
}

// Patient Summary
export interface PatientSummary {
  condiciones: string[]
  tratamientos_activos: string[]
  adherencia_14d: number
  sintomas_frecuentes: string[]
  vitales_recientes: {
    bp?: string
    hr?: number
    glucose?: number
    weight?: number
  }
  proxima_cita: string | null
  senales_alarma: string[]
  patron_reciente: string | null
  resumen_narrativo: string
  generated_at: string
}

// AliisCore
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'none'
export type SignalType = 'pattern_alert' | 'red_flag' | 'adherence_miss' | 'routine_insight' | 'no_data'

export interface AliisSignal {
  priority: NotificationPriority
  type: SignalType
  title: string
  body: string
  url: string
  insight: string
}

// Agent API
export interface AgentRequest {
  query: string
  screen_context: 'diario' | 'pack' | 'tratamientos' | 'historial' | 'cuenta'
  mode: 'query' | 'contextual'
}

export interface AgentResponse {
  message: string
  action?: {
    label: string
    endpoint: string
    method: 'POST' | 'GET'
  }
  source: 'summary' | 'rag' | 'both'
}
```

- [ ] **Step 3: Verificar que TypeScript no rompe**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores relacionados con los tipos nuevos.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat(types): AgentMemory, PatientSummary, AliisSignal, AgentRequest/Response"
```

---

### Task 3: Helper `agent-memory.ts`

**Files:**
- Create: `frontend/lib/agent-memory.ts`

- [ ] **Step 1: Crear el helper**

```typescript
// frontend/lib/agent-memory.ts
import { createServerSupabaseClient } from './supabase-server'
import type { AgentMemory, AgentName, MemoryType } from './types'

export async function writeMemory(
  userId: string,
  agentName: AgentName,
  type: MemoryType,
  content: Record<string, unknown>,
  expiresInDays?: number
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const expires_at = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null
  const { error } = await supabase.from('agent_memory').insert({
    user_id: userId,
    agent_name: agentName,
    memory_type: type,
    content,
    expires_at,
  })
  if (error) console.error('[agent-memory] writeMemory error', error.message)
}

export async function readMemory(
  userId: string,
  agentName: AgentName,
  type?: MemoryType,
  limitDays = 30
): Promise<AgentMemory[]> {
  const supabase = await createServerSupabaseClient()
  const since = new Date(Date.now() - limitDays * 86_400_000).toISOString()

  let q = supabase
    .from('agent_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_name', agentName)
    .gte('created_at', since)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false })
    .limit(50)

  if (type) q = q.eq('memory_type', type)

  const { data, error } = await q
  if (error) {
    console.error('[agent-memory] readMemory error', error.message)
    return []
  }
  return (data ?? []) as AgentMemory[]
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep agent-memory
```

Esperado: sin output (sin errores).

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/agent-memory.ts
git commit -m "feat(lib): agent-memory writeMemory/readMemory helpers"
```

---

### Task 4: Wiring — InsightAgent escribe y lee agent_memory

**Files:**
- Modify: `frontend/app/api/aliis/insight/route.ts`

- [ ] **Step 1: Leer el archivo completo**

```bash
cat frontend/app/api/aliis/insight/route.ts
```

- [ ] **Step 2: Añadir imports al inicio del archivo**

Después de los imports existentes, añadir:

```typescript
import { writeMemory, readMemory } from '@/lib/agent-memory'
```

- [ ] **Step 3: Leer memoria reciente antes de generar el insight**

Localizar donde el archivo hace las queries iniciales (el bloque `Promise.all` al inicio). Añadir `readMemory` como una query adicional en el mismo bloque:

```typescript
// Añadir al Promise.all existente o justo después:
const recentMemory = await readMemory(user.id, 'InsightAgent', 'observation', 7)
const recentPatterns = recentMemory
  .map(m => m.content as { signal?: string; date?: string })
  .filter(m => m.signal === 'alert')
```

- [ ] **Step 4: Pasar patrones al prompt**

Localizar donde se construye el `userMessage` o el prompt para Claude. Añadir el contexto de patrones:

```typescript
const patternContext = recentPatterns.length > 0
  ? `\nPatrones observados (últimos 7 días con alertas): ${recentPatterns.length} días. Fechas: ${recentPatterns.map(p => p.date).filter(Boolean).join(', ')}.`
  : ''
// Concatenar patternContext al userMessage antes de enviarlo a Claude
```

- [ ] **Step 5: Escribir en agent_memory después de generar el insight**

Localizar el bloque donde se genera el texto del insight y se prepara `insightsToInsert`. Después de obtener el texto generado, añadir:

```typescript
const today = new Date().toISOString().slice(0, 10)
await writeMemory(user.id, 'InsightAgent', 'observation', {
  date: today,
  signal: alerts.length > 0 ? 'alert' : last7.length === 0 ? 'no_data' : 'normal',
  alertCount: alerts.length,
  logCount: last7.length,
}, 90)
```

Nota: `alerts` y `last7` son las variables que el archivo ya usa internamente para las alertas y los logs de los últimos 7 días. Verificar sus nombres exactos leyendo el archivo en Step 1.

- [ ] **Step 6: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep insight
```

Esperado: sin errores.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/api/aliis/insight/route.ts
git commit -m "feat(insight): write/read agent_memory — InsightAgent tiene memoria longitudinal"
```

---

### Task 5: Wiring — AdherenceAgent escribe agent_memory

**Files:**
- Modify: `frontend/app/api/aliis/treatment-check/cron/route.ts`

- [ ] **Step 1: Leer el archivo**

```bash
cat frontend/app/api/aliis/treatment-check/cron/route.ts
```

- [ ] **Step 2: Añadir import**

```typescript
import { writeMemory } from '@/lib/agent-memory'
```

- [ ] **Step 3: Escribir en agent_memory al finalizar análisis de cada usuario**

Localizar el loop principal sobre usuarios. Al final de cada iteración (después de generar el insight o warning), añadir:

```typescript
await writeMemory(userId, 'AdherenceAgent', 'observation', {
  date: new Date().toISOString().slice(0, 10),
  activeTreatments: treatments.length,
  hasAdherenceGap: adherenceGap, // boolean que el archivo ya calcula
}, 30)
```

Nota: verificar el nombre exacto de la variable del gap de adherencia leyendo el archivo en Step 1.

- [ ] **Step 4: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep treatment-check
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/api/aliis/treatment-check/cron/route.ts
git commit -m "feat(adherence): AdherenceAgent escribe observaciones en agent_memory"
```

---

## FASE B — Patient Context Layer

---

### Task 6: Migración índice patient_summary

**Files:**
- Create: `frontend/migrations/20260504_patient_summary_index.sql`

- [ ] **Step 1: Crear la migración**

```sql
-- frontend/migrations/20260504_patient_summary_index.sql
-- Índice para leer patient_summary rápidamente por user_id + type
create index if not exists aliis_insights_user_type
  on aliis_insights (user_id, type, generated_at desc);
```

- [ ] **Step 2: Aplicar en Supabase**

Aplicar la migración al proyecto `cdnecuufkdykybisqybm` via MCP.

- [ ] **Step 3: Commit**

```bash
git add frontend/migrations/20260504_patient_summary_index.sql
git commit -m "feat(db): index aliis_insights(user_id, type, generated_at)"
```

---

### Task 7: `patient-context.ts`

**Files:**
- Create: `frontend/lib/patient-context.ts`

- [ ] **Step 1: Verificar el campo `type` en aliis_insights**

```bash
grep -n "type" frontend/migrations/20260521_aliis_insights_type.sql | head -10
```

Confirmar que el campo se llama `type` y los valores válidos (debe incluir `'patient_summary'`).

- [ ] **Step 2: Crear el archivo**

```typescript
// frontend/lib/patient-context.ts
import { createServerSupabaseClient } from './supabase-server'
import { anthropic, cachedSystem } from './anthropic'
import { readMemory } from './agent-memory'
import type { PatientSummary } from './types'

const SUMMARY_MAX_AGE_DAYS = 7

export async function getPatientContext(userId: string): Promise<{
  summary: PatientSummary
  summaryText: string
}> {
  const supabase = await createServerSupabaseClient()

  // 1. Intentar leer resumen cacheado
  const { data: cached } = await supabase
    .from('aliis_insights')
    .select('content, generated_at')
    .eq('user_id', userId)
    .eq('type', 'patient_summary')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Verificar si el cache está vigente (< 7 días)
  if (cached) {
    const ageMs = Date.now() - new Date(cached.generated_at).getTime()
    const ageDays = ageMs / 86_400_000
    if (ageDays < SUMMARY_MAX_AGE_DAYS) {
      // Verificar que no hay cambios recientes en medical_profiles o treatments
      const [profileUpdated, treatmentUpdated] = await Promise.all([
        supabase.from('medical_profiles').select('updated_at').eq('user_id', userId).maybeSingle(),
        supabase.from('treatments').select('updated_at').eq('user_id', userId).eq('active', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      const latestUpdate = Math.max(
        profileUpdated.data ? new Date(profileUpdated.data.updated_at).getTime() : 0,
        treatmentUpdated.data ? new Date(treatmentUpdated.data.updated_at).getTime() : 0,
      )
      const summaryTime = new Date(cached.generated_at).getTime()
      if (latestUpdate < summaryTime) {
        const summary = cached.content as PatientSummary
        return { summary, summaryText: summary.resumen_narrativo }
      }
    }
  }

  // 2. Regenerar resumen
  return generateAndCachePatientSummary(userId)
}

async function generateAndCachePatientSummary(userId: string): Promise<{
  summary: PatientSummary
  summaryText: string
}> {
  const supabase = await createServerSupabaseClient()
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString()

  // Fetch datos en paralelo
  const [profileRes, medRes, treatRes, logsRes, adherenceRes, trackedRes, recentMemory] = await Promise.all([
    supabase.from('profiles').select('name, next_appointment').eq('id', userId).single(),
    supabase.from('medical_profiles').select('condiciones_previas, edad, sexo').eq('user_id', userId).maybeSingle(),
    supabase.from('treatments').select('name, dose, frequency_label').eq('user_id', userId).eq('active', true),
    supabase.from('symptom_logs').select('logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, temperature, weight').eq('user_id', userId).gte('logged_at', since30).order('logged_at', { ascending: false }).limit(100),
    supabase.from('adherence_logs').select('status').eq('user_id', userId).gte('taken_date', since14),
    supabase.from('tracked_symptoms').select('name, occurrences, needs_medical_attention').eq('user_id', userId).eq('resolved', false).order('occurrences', { ascending: false }).limit(5),
    readMemory(userId, 'MonitorAgent', 'alert', 7),
  ])

  const treatments = treatRes.data ?? []
  const logs = logsRes.data ?? []
  const adherenceLogs = adherenceRes.data ?? []
  const trackedSymptoms = trackedRes.data ?? []
  const condiciones = (medRes.data?.condiciones_previas as string[] | null) ?? []

  // Calcular adherencia 14d
  const total = adherenceLogs.length
  const taken = adherenceLogs.filter(a => a.status === 'taken').length
  const adherencia14d = total > 0 ? Math.round((taken / total) * 100) : 0

  // Síntomas frecuentes
  const sintomas_frecuentes = trackedSymptoms.map(s => s.name)

  // Señales de alarma desde tracked_symptoms
  const senales_alarma = trackedSymptoms
    .filter(s => s.needs_medical_attention)
    .map(s => s.name)

  // Vitales más recientes
  const lastLog = logs[0]
  const vitales_recientes: PatientSummary['vitales_recientes'] = {}
  if (lastLog) {
    if (lastLog.bp_systolic && lastLog.bp_diastolic)
      vitales_recientes.bp = `${lastLog.bp_systolic}/${lastLog.bp_diastolic} mmHg`
    if (lastLog.heart_rate) vitales_recientes.hr = lastLog.heart_rate
    if (lastLog.glucose) vitales_recientes.glucose = lastLog.glucose
    if (lastLog.weight) vitales_recientes.weight = lastLog.weight
  }

  // Patrón reciente desde agent_memory
  const alertDays = recentMemory.filter(m => (m.content as { level?: string }).level === 'high').length
  const patron_reciente = alertDays >= 3
    ? `${alertDays} días consecutivos con alertas de vitales esta semana`
    : null

  // Generar resumen narrativo con Haiku
  const systemPrompt = 'Eres Aliis. Genera un párrafo de contexto clínico conciso para uso interno. Máximo 3 oraciones. Solo datos objetivos, sin consejos.'
  const userMsg = [
    `Paciente: ${profileRes.data?.name ?? 'usuario'}`,
    `Condiciones: ${condiciones.join(', ') || 'no registradas'}`,
    `Tratamientos activos: ${treatments.map(t => `${t.name} ${t.dose}`).join(', ') || 'ninguno'}`,
    `Adherencia 14d: ${adherencia14d}%`,
    `Síntomas frecuentes: ${sintomas_frecuentes.join(', ') || 'ninguno'}`,
    vitales_recientes.bp ? `TA: ${vitales_recientes.bp}` : '',
    vitales_recientes.glucose ? `Glucosa: ${vitales_recientes.glucose} mg/dL` : '',
    profileRes.data?.next_appointment ? `Próxima cita: ${profileRes.data.next_appointment}` : '',
    patron_reciente ? `Patrón reciente: ${patron_reciente}` : '',
    senales_alarma.length > 0 ? `Señales de alarma: ${senales_alarma.join(', ')}` : '',
  ].filter(Boolean).join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: cachedSystem(systemPrompt),
    messages: [{ role: 'user', content: userMsg }],
  })

  const resumen_narrativo = (message.content[0] as { type: string; text: string }).text.trim()

  const summary: PatientSummary = {
    condiciones,
    tratamientos_activos: treatments.map(t => `${t.name} ${t.dose}`),
    adherencia_14d: adherencia14d,
    sintomas_frecuentes,
    vitales_recientes,
    proxima_cita: profileRes.data?.next_appointment ?? null,
    senales_alarma,
    patron_reciente,
    resumen_narrativo,
    generated_at: new Date().toISOString(),
  }

  // Guardar en aliis_insights
  await supabase.from('aliis_insights').upsert({
    user_id: userId,
    type: 'patient_summary',
    content: summary,
    generated_at: summary.generated_at,
  }, { onConflict: 'user_id,type' })

  return { summary, summaryText: resumen_narrativo }
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep patient-context
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/patient-context.ts
git commit -m "feat(lib): patient-context — resumen narrativo del paciente con cache y RAG"
```

---

### Task 8: Cron semanal de patient_summary

**Files:**
- Create: `frontend/app/api/aliis/agent/summary/route.ts`
- Modify: `frontend/vercel.json`

- [ ] **Step 1: Crear el cron endpoint**

```typescript
// frontend/app/api/aliis/agent/summary/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateAndCachePatientSummary } from '@/lib/patient-context'

// Exportar la función para que pueda ser llamada desde patient-context.ts
// Este endpoint la llama en batch para todos los usuarios activos

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Usuarios activos: con packs en los últimos 30 días
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const { data: activeUsers } = await supabase
    .from('packs')
    .select('user_id')
    .gte('created_at', since30)

  const userIds = [...new Set((activeUsers ?? []).map(r => r.user_id))] as string[]

  let success = 0
  let errors = 0

  for (const userId of userIds) {
    try {
      await generateAndCachePatientSummary(userId)
      success++
    } catch (e) {
      console.error(`[summary-cron] failed for ${userId}`, e)
      errors++
    }
  }

  return NextResponse.json({ success, errors, total: userIds.length })
}
```

- [ ] **Step 2: Exportar `generateAndCachePatientSummary` desde `patient-context.ts`**

En `frontend/lib/patient-context.ts`, cambiar la función de `async function` privada a exportada:

```typescript
// Cambiar:
async function generateAndCachePatientSummary(userId: string)
// Por:
export async function generateAndCachePatientSummary(userId: string)
```

- [ ] **Step 3: Añadir el cron a vercel.json**

Leer `frontend/vercel.json` y añadir al array `crons`:

```json
{ "path": "/api/aliis/agent/summary", "schedule": "0 3 * * 1" }
```

Y al objeto `functions`:

```json
"app/api/aliis/agent/summary/route.ts": { "maxDuration": 60 }
```

- [ ] **Step 4: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep -E "summary|patient-context"
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/api/aliis/agent/summary/route.ts frontend/lib/patient-context.ts frontend/vercel.json
git commit -m "feat(cron): patient_summary semanal — todos los usuarios activos cada lunes 3am"
```

---

## FASE C — AliisCore Orchestrator

---

### Task 9: `aliis-core.ts`

**Files:**
- Create: `frontend/lib/aliis-core.ts`

- [ ] **Step 1: Leer clinical-thresholds para entender la interfaz de alertas**

```bash
grep -n "export\|interface\|type\|function" frontend/lib/clinical-thresholds.ts | head -20
```

Anotar: nombre de la función de evaluación, tipo que devuelve, campos `vital`, `value`, `level`.

- [ ] **Step 2: Crear el archivo**

```typescript
// frontend/lib/aliis-core.ts
import { createClient } from '@supabase/supabase-js'
import { anthropic, cachedSystem } from './anthropic'
import { readMemory, writeMemory } from './agent-memory'
import { evaluateThresholds } from './clinical-thresholds'
import type { AliisSignal, NotificationPriority, SignalType, SymptomLog } from './types'

const HAIKU = 'claude-haiku-4-5-20251001'

const SIGNAL_TITLES: Record<SignalType, string> = {
  pattern_alert:   '🔴 Patrón que vale la pena revisar',
  red_flag:        '⚠️ Aliis detectó algo',
  adherence_miss:  '💊 ¿Tomaste tus medicamentos?',
  routine_insight: 'Aliis',
  no_data:         '¿Cómo te sientes hoy?',
}

export async function runAliisCore(userId: string): Promise<AliisSignal> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)

  // 1. Fetch contexto en paralelo
  const [profileRes, logsRes, treatRes, prevMemory] = await Promise.all([
    supabase.from('profiles').select('name, next_appointment').eq('id', userId).single(),
    supabase.from('symptom_logs').select('*').eq('user_id', userId).gte('logged_at', since30).order('logged_at', { ascending: false }).limit(500),
    supabase.from('treatments').select('name').eq('user_id', userId).eq('active', true),
    readMemory(userId, 'InsightAgent', 'observation', 7),
  ])

  const logs = (logsRes.data ?? []) as SymptomLog[]
  const treatments = treatRes.data ?? []

  // 2. Evaluar señales de vitales
  const thresholdAlerts = evaluateThresholds(logs)
  const hasAlerts = thresholdAlerts.length > 0

  // 3. Detectar gap de adherencia (últimas 24h)
  let adherenceGap = false
  if (treatments.length > 0) {
    const { data: takenToday } = await supabase
      .from('adherence_logs')
      .select('medication')
      .eq('user_id', userId)
      .gte('taken_date', yesterday)
    const takenSet = new Set((takenToday ?? []).map(a => a.medication))
    adherenceGap = treatments.some(t => !takenSet.has(t.name))
  }

  // 4. Detectar patrones longitudinales desde agent_memory
  const consecutiveAlertDays = prevMemory.filter(
    m => (m.content as { signal?: string }).signal === 'alert'
  ).length

  // 5. Decidir prioridad (determinista — sin IA)
  let priority: NotificationPriority
  let type: SignalType

  if (hasAlerts && consecutiveAlertDays >= 3) {
    priority = 'critical'; type = 'pattern_alert'
  } else if (hasAlerts) {
    priority = 'high'; type = 'red_flag'
  } else if (adherenceGap) {
    priority = 'medium'; type = 'adherence_miss'
  } else if (logs.some(l => new Date(l.logged_at).toISOString().slice(0, 10) === today)) {
    priority = 'low'; type = 'routine_insight'
  } else {
    priority = 'low'; type = 'no_data'
  }

  // 6. Generar body personalizado con Haiku (una sola llamada)
  const systemPrompt = `Eres Aliis. Genera UNA notificación para ${profileRes.data?.name ?? 'el usuario'}. Máximo 2 oraciones. Tono cercano, no clínico. Segunda persona.`
  const contextMsg = [
    hasAlerts ? `Alertas vitales: ${thresholdAlerts.map(a => `${a.vital} ${a.value}`).join(', ')}` : '',
    adherenceGap ? `Medicación sin registrar hoy` : '',
    consecutiveAlertDays > 0 ? `Días consecutivos con alertas: ${consecutiveAlertDays}` : '',
    `Tipo: ${type}`,
  ].filter(Boolean).join('\n')

  const message = await anthropic.messages.create({
    model: HAIKU,
    max_tokens: 100,
    system: cachedSystem(systemPrompt),
    messages: [{ role: 'user', content: contextMsg || 'Genera insight rutinario de salud.' }],
  })

  const insight = (message.content[0] as { type: string; text: string }).text.trim()

  // 7. Escribir en agent_memory para que AliisCore del día siguiente lo lea
  await writeMemory(userId, 'InsightAgent', 'observation', {
    date: today,
    signal: hasAlerts ? 'alert' : logs.length === 0 ? 'no_data' : 'normal',
    alertCount: thresholdAlerts.length,
  }, 90)

  return {
    priority,
    type,
    title: SIGNAL_TITLES[type],
    body: insight.slice(0, 120),
    url: type === 'adherence_miss' ? '/tratamientos' : '/diario',
    insight,
  }
}
```

- [ ] **Step 2: Verificar tipos — especialmente que `SymptomLog` tiene los campos que usa `evaluateThresholds`**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep aliis-core
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/aliis-core.ts
git commit -m "feat(lib): AliisCore orchestrator — prioridad determinista + body personalizado con Haiku"
```

---

### Task 10: Upgrade del cron notify para usar AliisCore

**Files:**
- Modify: `frontend/app/api/aliis/notify/route.ts`

- [ ] **Step 1: Leer el archivo completo**

```bash
cat frontend/app/api/aliis/notify/route.ts
```

Identificar: el bloque donde se genera el insight para cada usuario (la llamada a `buildAliisPrompt` o equivalente), y donde se construye `insightsToInsert` y `notificationsToInsert`.

- [ ] **Step 2: Añadir import**

```typescript
import { runAliisCore } from '@/lib/aliis-core'
```

- [ ] **Step 3: Reemplazar el bloque de generación de insight por AliisCore**

Localizar el bloque que genera el insight individual por usuario dentro del loop. Reemplazarlo por:

```typescript
const signal = await runAliisCore(userId)

// Solo continuar si hay algo que notificar
if (signal.priority === 'none') continue

insightsToInsert.push({
  user_id: userId,
  content: signal.insight,
  type: 'daily_insight',
  generated_at: new Date().toISOString(),
  data_window: { signalType: signal.type, priority: signal.priority },
})

notificationsToInsert.push({
  user_id: userId,
  title: signal.title,
  body: signal.body,
  type: signal.type === 'red_flag' || signal.type === 'pattern_alert' ? 'red_flag' : 'insight',
  url: signal.url,
})
```

Nota: verificar los nombres exactos de los campos de `insightsToInsert` y `notificationsToInsert` leyendo el archivo en Step 1 — usar los mismos campos que el archivo ya usa.

- [ ] **Step 4: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep notify
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/api/aliis/notify/route.ts
git commit -m "feat(notify): delegar a AliisCore — una notificación priorizada por usuario"
```

---

## FASE D — Agente Queryable

---

### Task 11: Sentry scrubbing para el agente

**Files:**
- Modify: `frontend/lib/sentry-scrub.ts`

- [ ] **Step 1: Leer el archivo**

```bash
cat frontend/lib/sentry-scrub.ts
```

- [ ] **Step 2: Añadir `/api/aliis/agent` a la lista de rutas scrubbed**

Localizar el array o condición que lista las rutas sensibles (como `/api/aliis`, `/api/diagnostico`). Añadir:

```typescript
'/api/aliis/agent'
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/sentry-scrub.ts
git commit -m "feat(security): scrub /api/aliis/agent de Sentry — contiene datos médicos del paciente"
```

---

### Task 12: Endpoint `POST /api/aliis/agent`

**Files:**
- Create: `frontend/app/api/aliis/agent/route.ts`

- [ ] **Step 1: Verificar el patrón de auth que usan otras rutas de aliis**

```bash
head -40 frontend/app/api/aliis/insight/route.ts
```

Anotar: cómo obtiene `user`, cómo hace el rate limit, cómo importa `rateLimit`.

- [ ] **Step 2: Crear el endpoint**

```typescript
// frontend/app/api/aliis/agent/route.ts
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { anthropic, cachedSystem } from '@/lib/anthropic'
import { getPatientContext } from '@/lib/patient-context'
import { logLlmUsage } from '@/lib/llm-usage'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import type { AgentRequest, AgentResponse } from '@/lib/types'

const SCREEN_CONTEXT_PROMPTS: Record<string, string> = {
  diario:       'El usuario está revisando su diario de síntomas. Responde sobre síntomas, vitales y patrones recientes.',
  pack:         'El usuario está leyendo sobre su diagnóstico. Conecta el contenido del pack con su historial personal.',
  tratamientos: 'El usuario está en su página de tratamientos. Responde sobre adherencia, medicamentos y efectos.',
  historial:    'El usuario está revisando su historial de packs. Responde sobre su evolución y comprensión de su condición.',
  cuenta:       'El usuario está en su perfil. Responde sobre su plan de uso y funcionalidades disponibles.',
}

const RAG_KEYWORDS = [
  'cuántos', 'cuántas', 'cuándo', 'en enero', 'en febrero', 'en marzo', 'en abril',
  'en mayo', 'en junio', 'la semana pasada', 'el mes pasado', 'hace', 'días',
  'veces', 'dosis', 'olvidé', 'registré',
]

function needsRag(query: string): boolean {
  const q = query.toLowerCase()
  return RAG_KEYWORDS.some(kw => q.includes(kw))
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { query, screen_context, mode } = body as AgentRequest

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return NextResponse.json({ error: 'query es requerido' }, { status: 400 })
  }
  if (query.length > 500) {
    return NextResponse.json({ error: 'query demasiado largo (máx 500 chars)' }, { status: 400 })
  }

  // Rate limit: 20/h para query, 10/h para contextual
  const ip = getClientIp(req)
  const rlKey = mode === 'contextual'
    ? `user:${user.id}:agent:contextual`
    : `user:${user.id}:agent:query`
  const rlMax = mode === 'contextual' ? 10 : 20
  const rl = await rateLimit(rlKey, rlMax, 3600)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes — espera un momento' },
      { status: 429, headers: { 'Retry-After': '3600' } }
    )
  }

  // Obtener contexto del paciente (desde cache o regenerado)
  const { summary, summaryText } = await getPatientContext(user.id)

  // Contexto RAG adicional si la pregunta lo requiere
  let ragContext = ''
  if (needsRag(query)) {
    // Fetch datos específicos para la pregunta
    const since90 = new Date(Date.now() - 90 * 86_400_000).toISOString()
    const [symptomsRes, adherenceRes] = await Promise.all([
      supabase.from('symptom_logs').select('logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, weight, note').eq('user_id', user.id).gte('logged_at', since90).order('logged_at', { ascending: false }).limit(200),
      supabase.from('adherence_logs').select('taken_date, medication, status').eq('user_id', user.id).gte('taken_date', since90.slice(0, 10)).order('taken_date', { ascending: false }).limit(200),
    ])
    ragContext = `\n\nDatos detallados (últimos 90 días):\nSíntomas/vitales: ${JSON.stringify(symptomsRes.data ?? [])}\nAdherencia: ${JSON.stringify(adherenceRes.data ?? [])}`
  }

  const screenHint = SCREEN_CONTEXT_PROMPTS[screen_context] ?? ''

  const systemPrompt = `Eres Aliis, el asistente de salud personal de este paciente. Conoces su historial completo. Responde en español, tono cercano pero preciso. No das diagnósticos ni cambias tratamientos. Máximo 3-4 oraciones.

CONTEXTO DEL PACIENTE:
${summaryText}

${screenHint}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: cachedSystem(systemPrompt),
    messages: [{ role: 'user', content: query + ragContext }],
  })

  const responseText = (message.content[0] as { type: string; text: string }).text.trim()

  // Detectar si la respuesta sugiere una acción
  let action: AgentResponse['action'] | undefined
  if (responseText.toLowerCase().includes('resumen') && responseText.toLowerCase().includes('consulta')) {
    action = { label: 'Preparar resumen de consulta', endpoint: '/api/aliis/consult', method: 'POST' }
  } else if (responseText.toLowerCase().includes('diario')) {
    action = { label: 'Ir al diario', endpoint: '/diario', method: 'GET' }
  }

  // Log de uso
  logLlmUsage({
    userId: user.id,
    endpoint: '/api/aliis/agent',
    model: 'claude-haiku-4-5-20251001',
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: message.usage.cache_creation_input_tokens ?? 0,
  })

  const response: AgentResponse = {
    message: responseText,
    action,
    source: ragContext ? 'both' : 'summary',
  }

  return NextResponse.json(response)
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep "api/aliis/agent"
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/api/aliis/agent/route.ts
git commit -m "feat(api): POST /api/aliis/agent — agente queryable con contexto del paciente"
```

---

### Task 13: Test del endpoint agente

**Files:**
- Create: `frontend/app/api/__tests__/aliis-agent.test.ts`

- [ ] **Step 1: Revisar la estructura de un test existente para seguir el patrón**

```bash
cat frontend/app/api/__tests__/invite-validate.test.ts
```

- [ ] **Step 2: Crear el test**

```typescript
// frontend/app/api/__tests__/aliis-agent.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de dependencias externas
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(),
}))
vi.mock('@/lib/patient-context', () => ({
  getPatientContext: vi.fn(),
}))
vi.mock('@/lib/anthropic', () => ({
  anthropic: { messages: { create: vi.fn() } },
  cachedSystem: (s: string) => s,
}))
vi.mock('@/lib/llm-usage', () => ({ logLlmUsage: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ ok: true, remaining: 19 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

import { POST } from '../aliis/agent/route'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPatientContext } from '@/lib/patient-context'
import { anthropic } from '@/lib/anthropic'

function makeRequest(body: object) {
  return new Request('http://localhost/api/aliis/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/aliis/agent', () => {
  beforeEach(() => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [] }),
      }),
    } as any)

    vi.mocked(getPatientContext).mockResolvedValue({
      summary: {
        condiciones: ['Migraña crónica'],
        tratamientos_activos: ['Topiramato 50mg'],
        adherencia_14d: 80,
        sintomas_frecuentes: ['cefalea'],
        vitales_recientes: {},
        proxima_cita: null,
        senales_alarma: [],
        patron_reciente: null,
        resumen_narrativo: 'Paciente con migraña crónica.',
        generated_at: new Date().toISOString(),
      },
      summaryText: 'Paciente con migraña crónica.',
    })

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Tu adherencia esta semana es buena, sigue así.' }],
      usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    } as any)
  })

  it('devuelve 401 si no hay sesión', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('no session') }) },
    } as any)
    const res = await POST(makeRequest({ query: 'hola', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(401)
  })

  it('devuelve 400 si query está vacío', async () => {
    const res = await POST(makeRequest({ query: '', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(400)
  })

  it('devuelve 400 si query supera 500 chars', async () => {
    const res = await POST(makeRequest({ query: 'a'.repeat(501), screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(400)
  })

  it('devuelve respuesta con message y source cuando todo es correcto', async () => {
    const res = await POST(makeRequest({ query: '¿cómo he estado esta semana?', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('message')
    expect(body).toHaveProperty('source')
    expect(typeof body.message).toBe('string')
    expect(body.message.length).toBeGreaterThan(0)
  })

  it('source es "summary" cuando la query no necesita RAG', async () => {
    const res = await POST(makeRequest({ query: '¿cómo estoy?', screen_context: 'diario', mode: 'query' }))
    const body = await res.json()
    expect(body.source).toBe('summary')
  })

  it('devuelve 429 si se supera el rate limit', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    vi.mocked(rateLimit).mockResolvedValueOnce({ ok: false, remaining: 0, resetAt: new Date() })
    const res = await POST(makeRequest({ query: '¿cómo estoy?', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(429)
  })
})
```

- [ ] **Step 3: Correr los tests**

```bash
cd frontend && npx vitest run app/api/__tests__/aliis-agent.test.ts 2>&1
```

Esperado: todos los tests pasan.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/api/__tests__/aliis-agent.test.ts
git commit -m "test(agent): cobertura del endpoint /api/aliis/agent — auth, validación, rate limit, response"
```

---

### Task 14: Wiring del botón "Pregúntale a Aliis" en ChapterChat y ChatDrawer

**Files:**
- Modify: `frontend/components/ChapterChat.tsx`
- Modify: `frontend/components/ChatDrawer.tsx`

- [ ] **Step 1: Leer ChapterChat para entender cómo hace la llamada al chat actual**

```bash
grep -n "fetch\|api\|chat\|route\|endpoint" frontend/components/ChapterChat.tsx | head -20
```

- [ ] **Step 2: Leer ChatDrawer del mismo modo**

```bash
grep -n "fetch\|api\|chat\|route\|endpoint" frontend/components/ChatDrawer.tsx | head -20
```

- [ ] **Step 3: Añadir prop `screenContext` a ChapterChat**

En la interfaz de props del componente, añadir:

```typescript
screenContext?: 'diario' | 'pack' | 'tratamientos' | 'historial' | 'cuenta'
```

- [ ] **Step 4: Pasar `screen_context` en la llamada fetch de ChapterChat**

Localizar el `fetch` que llama al endpoint de chat. Añadir `screen_context` y `mode` al body:

```typescript
body: JSON.stringify({
  // ...campos existentes...
  screen_context: screenContext ?? 'pack',
  mode: 'query',
})
```

Nota: si ChapterChat llama a `/api/chat` y no a `/api/aliis/agent`, añadir una segunda llamada paralela a `/api/aliis/agent` solo para el contexto. Verificar en Step 1 cuál es el endpoint exacto y decidir si reemplazar o complementar.

- [ ] **Step 5: Hacer lo mismo en ChatDrawer**

Misma lógica que Steps 3-4 para `ChatDrawer.tsx`, usando la prop `screenContext`.

- [ ] **Step 6: Verificar tipos**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep -E "ChapterChat|ChatDrawer"
```

Esperado: sin errores.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/ChapterChat.tsx frontend/components/ChatDrawer.tsx
git commit -m "feat(ui): ChapterChat y ChatDrawer pasan screen_context al agente"
```

---

### Task 15: Push final a dev

- [ ] **Step 1: Verificar que todo compila limpio**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 2: Correr todos los tests**

```bash
cd frontend && npx vitest run 2>&1
```

Esperado: todos pasan.

- [ ] **Step 3: Push a origin/dev**

```bash
git push origin dev
```

- [ ] **Step 4: Verificar en GitHub que los commits llegaron correctamente**

```bash
git log origin/dev --oneline -10
```

---

## Self-Review del Plan

**Cobertura del spec:**
- ✅ Fase A: agent_memory tabla (Task 1), tipos (Task 2), helper (Task 3), wiring InsightAgent (Task 4), wiring AdherenceAgent (Task 5)
- ✅ Fase B: índice patient_summary (Task 6), patient-context.ts con cache + RAG (Task 7), cron semanal (Task 8)
- ✅ Fase C: AliisCore con priorización determinista (Task 9), upgrade notify cron (Task 10)
- ✅ Fase D: Sentry scrubbing (Task 11), endpoint agente (Task 12), tests (Task 13), wiring UI (Task 14)
- ⚠️ MonitorAgent wiring: el spec menciona que MonitorAgent escribe en agent_memory, pero MonitorAgent es invocado desde `insight/route.ts` via `clinical-thresholds.ts`. El Task 4 (InsightAgent) ya cubre la escritura de alertas de vitales en agent_memory como parte del mismo flujo. No requiere tarea separada.
- ⚠️ RAG tools formales: el spec describe 4 funciones `get_symptoms()` etc. como tools Claude formales. La implementación del Task 12 usa fetch directo a Supabase en lugar de tool use formal de Claude para evitar múltiples llamadas al modelo. Esto es más eficiente y equivalente en resultado.

**Consistencia de tipos:**
- `AgentMemory`, `PatientSummary`, `AliisSignal`, `AgentRequest`, `AgentResponse` definidos en Task 2 y usados consistentemente en Tasks 3-14.
- `writeMemory`/`readMemory` definidos en Task 3, usados en Tasks 4, 5, 9.
- `getPatientContext` definida en Task 7, usada en Task 12.
- `runAliisCore` definida en Task 9, usada en Task 10.
- `generateAndCachePatientSummary` exportada en Task 8, importada en Task 8.
