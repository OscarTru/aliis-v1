# Aliis — Arquitectura AI-First & First Company
**Fecha:** 2026-05-04  
**Alcance:** Agent Memory · Patient Context · AliisCore Orchestrator · Agente Queryable · Company OS · Interoperabilidad  
**Estrategia:** Memoria incremental compartida entre agentes + resumen narrativo + RAG on-demand + orquestador de señales

---

## Visión

Aliis tiene 12+ agentes en producción que funcionan en silos — cada uno lee los mismos datos sin saber lo que los otros observaron. Este plan los conecta en un sistema coherente con dos objetivos:

**Para el paciente:** Aliis conoce su historial completo, detecta patrones sin que el usuario lo pida, y puede ser preguntado libremente en cualquier pantalla.

**Para la empresa:** Aliis como organización es queryable — métricas, estado del producto, conocimiento de marca — accesible por cualquier IA en tiempo real.

---

## Arquitectura completa — 6 Capas

```
CAPA 1 — Datos del paciente (Supabase, ya existe)
  symptom_logs · adherence_logs · packs · treatments · medical_profiles

CAPA 2 — Agent Memory (nuevo — prerequisito de todo)
  lib/agent-memory.ts + tabla agent_memory
  → Cada agente escribe observaciones incrementales
  → Los agentes leen el historial de otros antes de generar

CAPA 3 — Patient Context Layer (nuevo)
  lib/patient-context.ts
  → Resumen narrativo construido desde agent_memory + datos crudos
  → RAG on-demand con 4 tools para preguntas específicas

CAPA 4 — AliisCore Orchestrator (nuevo)
  lib/aliis-core.ts
  → Agrega señales de todos los agentes
  → Decide qué notificar y con qué prioridad
  → Una notificación inteligente, no 3 separadas

CAPA 5 — Agente Queryable (nuevo)
  app/api/aliis/agent/route.ts
  → Query mode: el usuario pregunta libremente
  → Contextual mode: insight en pantalla
  → Proactive mode: cron detecta patrones

CAPA 6 — Company OS (nuevo)
  FinanceAgent · ProductAgent · ContentAgent · Schema API · MCP Server
  → La empresa es queryable y opera con agentes propios
```

---

## Capa 1 — Datos del paciente (Supabase)

Tablas existentes. Se listan solo los campos que los agentes consumen.

### `symptom_logs`
| Campo | Tipo | Uso |
|-------|------|-----|
| `logged_at` | timestamptz | Ordenar cronológicamente |
| `glucose` | float | Vital — glucosa (mg/dL) |
| `bp_systolic` / `bp_diastolic` | int | Vital — presión arterial |
| `heart_rate` | int | Vital — frecuencia cardíaca |
| `temperature` | float | Vital — temperatura (°C) |
| `weight` | float | Vital — peso (kg) |
| `note` | text | Nota breve del registro |
| `free_text` | text | Texto libre extraído por IA |

### `tracked_symptoms`
| Campo | Tipo | Uso |
|-------|------|-----|
| `name` | text | Nombre del síntoma normalizado |
| `occurrences` | int | Frecuencia acumulada |
| `resolved` | boolean | Filtrar síntomas activos |
| `needs_medical_attention` | boolean | Señales de alarma |
| `attention_reason` | text | Razón de la alarma |

### `adherence_logs`
| Campo | Tipo | Uso |
|-------|------|-----|
| `taken_date` | date | Fecha de la dosis |
| `medication` | text | Nombre del medicamento |
| `status` | text | `taken` \| `missed` \| `skipped` |

### `treatments`
| Campo | Tipo | Uso |
|-------|------|-----|
| `name` | text | Nombre del medicamento |
| `dose` | text | Dosis (ej: "50mg") |
| `frequency` | text | Frecuencia interna (ej: `once_daily`) |
| `frequency_label` | text | Frecuencia legible |
| `active` | boolean | Solo tratamientos activos |
| `indefinite` | boolean | Si es tratamiento crónico |

### `medical_profiles`
| Campo | Tipo | Uso |
|-------|------|-----|
| `condiciones_previas` | jsonb | Condiciones neurológicas |
| `medicamentos` | jsonb | Medicamentos capturados en onboarding |
| `alergias` | jsonb | Alergias conocidas |
| `edad` | int | Edad del paciente |
| `sexo` | text | Sexo biológico |
| `updated_at` | timestamptz | Trigger de invalidación del resumen |

### `packs`
| Campo | Tipo | Uso |
|-------|------|-----|
| `dx` | text | Diagnóstico original ingresado |
| `created_at` | timestamptz | Orden cronológico |

### `profiles`
| Campo | Tipo | Uso |
|-------|------|-----|
| `name` | text | Personalizar respuestas |
| `next_appointment` | date | Próxima cita médica |
| `plan` | text | `free` \| `pro` — gate de features |

---

## Capa 2 — Agent Memory

**Prerequisito de todo lo demás.** Sin esta base, los agentes seguirán siendo ciegos entre sí.

### Migración: `agent_memory`

```sql
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

create index agent_memory_user_agent
  on agent_memory (user_id, agent_name, created_at desc);

create index agent_memory_type
  on agent_memory (user_id, memory_type, created_at desc);

alter table agent_memory enable row level security;

create policy "Users see own memory" on agent_memory
  for select using (auth.uid() = user_id);

create policy "Service role full access" on agent_memory
  for all using (true);
```

### Archivo: `frontend/lib/agent-memory.ts`

```typescript
export type AgentName = 'InsightAgent' | 'MonitorAgent' | 'AdherenceAgent' | 'SymptomAgent' | 'CorrelationAgent'
export type MemoryType = 'observation' | 'pattern' | 'alert' | 'recommendation'

export async function writeMemory(
  userId: string,
  agentName: AgentName,
  type: MemoryType,
  content: Record<string, unknown>,
  expiresInDays?: number
): Promise<void>

export async function readMemory(
  userId: string,
  agentName: AgentName,
  type?: MemoryType,
  limitDays?: number   // default 30
): Promise<AgentMemory[]>
```

### Wiring — qué escribe cada agente

**InsightAgent** (`insight/route.ts`) — después de generar el insight:
```typescript
await writeMemory(userId, 'InsightAgent', 'observation', {
  date: today,
  signal: alerts.length > 0 ? 'alert' : logs.length === 0 ? 'no_data' : 'normal',
  alertCount: alerts.length,
  logCount: logs.length,
}, 90)
```

Además lee memoria antes de generar:
```typescript
const recentMemory = await readMemory(userId, 'InsightAgent', 'observation', 7)
// pasa recentMemory al prompt → Aliis sabe si lleva 5 días con la misma tendencia
```

**MonitorAgent** (invocado desde `insight/route.ts` via `clinical-thresholds.ts`) — si hay alertas:
```typescript
await writeMemory(userId, 'MonitorAgent', 'alert', {
  date: today,
  alerts: alerts.map(a => ({ vital: a.vital, value: a.value, level: a.level }))
}, 30)
```

**AdherenceAgent** (`treatment-check/cron/route.ts`) — al finalizar análisis de cada usuario:
```typescript
await writeMemory(userId, 'AdherenceAgent', 'observation', {
  date: today,
  hasAdherenceGap: boolean,
  activeTreatments: number,
}, 30)
```

---

## Capa 3 — Patient Context Layer

### Archivo: `frontend/lib/patient-context.ts`

Construye el contexto del paciente para cualquier llamada al agente. **Usa `agent_memory` como fuente principal**, complementado con datos crudos.

#### `PatientSummary` — resumen persistente

Almacenado en `aliis_insights` con `type='patient_summary'`. Generado semanalmente por cron o bajo demanda si está stale.

```typescript
interface PatientSummary {
  condiciones: string[]
  tratamientos_activos: string[]
  adherencia_14d: number           // 0-100
  sintomas_frecuentes: string[]    // top 5, últimos 30 días
  vitales_recientes: {
    bp?: string                    // "120/80 mmHg"
    hr?: number
    glucose?: number
    weight?: number
  }
  proxima_cita: string | null
  senales_alarma: string[]
  patron_reciente: string | null   // "5 días consecutivos con alertas de glucosa" — desde agent_memory
  resumen_narrativo: string        // párrafo listo para system prompt
  generated_at: string
}
```

El campo `patron_reciente` es nuevo respecto al diseño original — se construye leyendo `agent_memory` de `MonitorAgent` e `InsightAgent` de los últimos 7 días. Ejemplo del `resumen_narrativo`:

> "Paciente con migraña crónica. Adherencia 78% en 14 días. Síntomas frecuentes: cefalea, náuseas. TA: 120/80 mmHg. Próxima cita: 15 mayo. Patrón reciente: glucosa elevada 5 días consecutivos."

#### Invalidación del resumen

El resumen se regenera si:
- Tiene más de 7 días
- `medical_profiles.updated_at` es más reciente que `generated_at`
- `treatments.updated_at` es más reciente que `generated_at`

Fail-open: si falla la generación, devuelve contexto mínimo desde `medical_profiles`.

#### RAG on-demand — 4 tools

Se activan solo si la query menciona fechas específicas, períodos concretos, o conteos:

```typescript
get_symptoms(days: number): SymptomLog[]
get_adherence(days: number): AdherenceLog[]
get_vitals(days: number): VitalReading[]
get_packs(): PackSummary[]
```

---

## Capa 4 — AliisCore Orchestrator

### Archivo: `frontend/lib/aliis-core.ts`

Agrega todas las señales del día y decide qué notificar. Reemplaza la lógica dispersa en el cron de `notify`.

#### Prioridad de señales

```typescript
type NotificationPriority = 'critical' | 'high' | 'medium' | 'low' | 'none'

type SignalType =
  | 'pattern_alert'    // critical: alerta repetida 3+ días consecutivos
  | 'red_flag'         // high: alerta de vital hoy
  | 'adherence_miss'   // medium: medicación sin registrar
  | 'routine_insight'  // low: insight diario normal
  | 'no_data'          // low: el usuario no registró nada
```

#### Lógica de decisión

```
Lee agent_memory de los últimos 7 días (InsightAgent + MonitorAgent + AdherenceAgent)
  ↓
¿MonitorAgent registró alerta Y llevan 3+ días? → priority: critical, type: pattern_alert
¿MonitorAgent registró alerta hoy?              → priority: high,     type: red_flag
¿AdherenceAgent registró gap hoy?              → priority: medium,   type: adherence_miss
¿hay logs recientes?                            → priority: low,      type: routine_insight
¿sin logs?                                      → priority: low,      type: no_data
```

#### Output

```typescript
interface AliisSignal {
  priority: NotificationPriority
  type: SignalType
  title: string        // "⚠️ Aliis detectó algo"
  body: string         // max 120 chars, generado por Haiku
  url: string          // "/diario" | "/tratamientos"
  insight: string      // texto completo para aliis_insights
}
```

Una sola llamada a Haiku al final para personalizar el `body`. El `type` y `priority` se determinan sin IA, solo leyendo `agent_memory`.

#### Integración con notify cron

`notify/route.ts` reemplaza su bloque de generación por:
```typescript
const signal = await runAliisCore(userId)
if (signal.priority === 'none') continue
// guardar en aliis_insights, crear notificación, enviar push
```

Una notificación por usuario por día, priorizada, con contexto longitudinal.

---

## Capa 5 — Agente Queryable

### Archivo: `frontend/app/api/aliis/agent/route.ts`

#### Contrato

```typescript
// POST /api/aliis/agent
// Auth: sesión activa requerida

interface AgentRequest {
  query: string
  screen_context: 'diario' | 'pack' | 'tratamientos' | 'historial' | 'cuenta'
  mode: 'query' | 'contextual'   // proactive es interno, lo invoca AliisCore
}

interface AgentResponse {
  message: string
  action?: {
    label: string      // "Preparar resumen de consulta"
    endpoint: string   // "/api/aliis/consult"
    method: 'POST' | 'GET'
  }
  source: 'summary' | 'rag' | 'both'
}
```

#### Flujo interno

1. Auth + rate limit (20 req/h query, 10 req/h contextual)
2. `getPatientContext(userId)` → `summaryText` (desde Capa 3)
3. Decisión RAG: ¿la query necesita datos específicos?
4. Una llamada a Claude con: system prompt + `summaryText` + `screen_context` + query
5. Detectar si la respuesta sugiere acción → adjuntar `action`
6. `logLlmUsage()` + retornar

#### System prompts por pantalla

```
diario:       Síntomas, vitales y patrones recientes del usuario.
pack:         Conecta el contenido del pack con el historial personal del usuario.
tratamientos: Adherencia, medicamentos y efectos basados en su historial.
historial:    Evolución y comprensión de su condición a lo largo del tiempo.
cuenta:       Plan de uso y funcionalidades disponibles según su tier.
```

#### Superficie

El botón "Pregúntale a Aliis" que ya existe en `ChapterChat.tsx` y `ChatDrawer.tsx` — sin cambio visual. Se extiende para pasar `screen_context` y consumir `/api/aliis/agent`. El mismo botón se añade a `/diario`, `/tratamientos`, `/historial`.

Mobile y web consumen el mismo endpoint — `screen_context` mapea a la pantalla activa del navigator en React Native.

---

## Capa 6 — Company OS

### FinanceAgent — MRR en tiempo real

**Tabla:** `company_state` (id=1, singleton)

```sql
create table company_state (
  id           int primary key default 1,
  mrr_eur      float not null default 0,
  active_pro   int not null default 0,
  total_users  int not null default 0,
  updated_at   timestamptz not null default now()
);
```

Se actualiza en cada evento de Stripe (`customer.subscription.*`) via el webhook existente `stripe/webhook/route.ts`. No requiere cron — es event-driven.

Endpoint: `GET /api/company/metrics` — solo service role / internal.

### ProductAgent — Weekly Pulse

Cron los lunes a las 8am UTC (`/api/aliis/weekly-pulse`). Lee `company_state` + métricas de Supabase, genera reporte con Haiku, lo guarda en `aliis_insights` y lo envía como notificación in-app a Oscar.

Incluye: MRR, nuevos usuarios 7d, conversiones Pro 7d, packs generados 7d, delta vs semana anterior, y 1-2 alertas si algo empeoró.

### ContentAgent — Guiones desde el vault

`POST /api/content/guion` — recibe `{ tema, serie }`, lee los archivos de identidad del vault de Obsidian (voz, estructura, hooks), busca la ficha del concepto médico si existe, genera el guión con Sonnet.

Requiere: `ALIIS_VAULT_PATH` env var apuntando al repo local del vault.

La voz de Cerebros Esponjosos está en el sistema, no en la cabeza de Oscar.

### Company Schema API

`GET /api/company/schema` — devuelve el estado actual de la empresa en JSON. Incluye: stage, MRR, usuarios, agentes activos, moat, founders, roadmap phase.

Cualquier IA puede consultar quién es Aliis sin leer documentación.

### MCP Server (opcional, Fase D)

Servidor MCP `aliis-mcp/` que expone resources del vault (fichas médicas, identidad de marca) y tools (`generate_guion`, `query_vault`, `get_company_status`). Permite que Claude Code y Claude Desktop consulten el vault directamente como herramienta.

---

## Migración incremental — 5 fases

Cada fase es deployable de forma independiente.

| Fase | Qué se construye | Duración est. | Impacto |
|------|-----------------|---------------|---------|
| **A** | `agent_memory` tabla + helper + wiring en 3 agentes | ~3h | Solo datos, ninguno en usuario |
| **B** | `patient-context.ts` usando agent_memory + cron patient_summary | ~2h | Respuestas más contextuales en packs |
| **C** | `AliisCore` + upgrade notify cron | ~4.5h | Notificación única priorizada |
| **D** | `/api/aliis/agent` + botón en diario/tratamientos/historial | ~3h | Aliis queryable en toda la app |
| **E** | Company OS: FinanceAgent + ProductAgent + ContentAgent | ~7.5h | Weekly Pulse + guiones automáticos |

**Total estimado: ~20h de sesiones**

El orden importa: A es prerequisito de B y C. B y C pueden ir en paralelo. D puede ir después de B. E es independiente de A-D.

---

## Consideraciones técnicas

### Costo

- `agent_memory` elimina re-cómputo: los agentes no repiten observaciones ya registradas
- `patient_summary` pre-computado resuelve el 80% de queries sin RAG
- RAG activo solo en ~20% de queries (preguntas con fechas/conteos específicos)
- `AliisCore` usa Haiku solo para personalizar el body — la decisión de prioridad es determinista
- Prompt caching en todos los system prompts (patrón del singleton `lib/anthropic.ts`)

### Privacidad

- `agent_memory` tiene RLS: cada usuario solo ve la suya
- `/api/aliis/agent` añadir a rutas scrubbed en `lib/sentry-scrub.ts`
- Body de request/response del agente nunca se loguea en Sentry

### Mobile

- `/api/aliis/agent` es el único endpoint que React Native necesita para toda la capa de IA
- `screen_context` mapea a la pantalla activa del navigator
- El contrato de request/response es estable y versionable

---

## Archivos nuevos

```
frontend/migrations/20260504_agent_memory.sql
frontend/migrations/20260504_company_state.sql
frontend/migrations/20260504_patient_summary_index.sql
frontend/lib/agent-memory.ts
frontend/lib/patient-context.ts
frontend/lib/aliis-core.ts
frontend/lib/company-metrics.ts
frontend/app/api/aliis/agent/route.ts
frontend/app/api/aliis/agent/summary/route.ts     — cron semanal patient_summary
frontend/app/api/aliis/weekly-pulse/route.ts      — ProductAgent cron
frontend/app/api/company/metrics/route.ts
frontend/app/api/company/schema/route.ts
frontend/app/api/content/guion/route.ts           — ContentAgent
```

## Archivos modificados

```
frontend/app/api/aliis/insight/route.ts           — escribe + lee agent_memory
frontend/app/api/aliis/notify/route.ts            — delega a AliisCore
frontend/app/api/aliis/treatment-check/cron/route.ts — escribe agent_memory
frontend/app/api/stripe/webhook/route.ts          — actualiza company_state
frontend/lib/sentry-scrub.ts                      — añadir /api/aliis/agent
frontend/vercel.json                              — crons: patient_summary + weekly-pulse
frontend/components/ChapterChat.tsx               — pasar screen_context al agente
frontend/components/ChatDrawer.tsx                — pasar screen_context al agente
frontend/lib/types.ts                             — AgentMemory + AliisSignal types
```
