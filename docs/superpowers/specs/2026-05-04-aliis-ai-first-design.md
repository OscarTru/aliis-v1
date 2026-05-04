# Aliis AI-First — Diseño de Arquitectura
**Fecha:** 2026-05-04  
**Alcance:** Patient Context Layer + Agente Aliis + Asistente contextual  
**Estrategia:** Híbrido — resumen persistente + RAG on-demand  

---

## Visión

Convertir Aliis de una colección de endpoints de IA reactivos e independientes a un sistema AI-First donde **toda interacción pasa por una capa de contexto del paciente** antes de llegar al modelo. El usuario puede preguntarle libremente a Aliis en cualquier pantalla, y Aliis puede detectar patrones y notificar de forma proactiva sin que el usuario lo pida.

La superficie es el botón "Pregúntale a Aliis" que ya existe en cada sección — potenciado por debajo. No hay nueva UI principal.

---

## Arquitectura — 4 Capas

```
CAPA 1 — Datos (Supabase, ya existe)
  symptom_logs · adherence_logs · packs · treatments · medical_profiles

CAPA 2 — Patient Context Layer (nuevo)
  lib/patient-context.ts
  → Resumen persistente semanal (aliis_insights type='patient_summary')
  → RAG on-demand con 4 tools

CAPA 3 — Agente Aliis (nuevo)
  app/api/aliis/agent/route.ts
  → Query mode · Proactive mode · Contextual mode

CAPA 4 — Superficies (web + mobile consumen la misma API)
  → Botón "Pregúntale a Aliis" (ya existe, potenciado)
  → Notificaciones proactivas con acción sugerida
```

---

## Capa 2 — Patient Context Layer

### Archivo: `frontend/lib/patient-context.ts`

Responsabilidad única: construir y entregar el contexto del paciente para cualquier llamada al agente.

#### Resumen persistente (`patient_summary`)

Generado una vez por semana por un cron. Almacenado en `aliis_insights` con `type='patient_summary'`. Se invalida y regenera si el usuario actualiza su perfil médico o agrega un nuevo tratamiento.

Estructura del resumen:

```typescript
interface PatientSummary {
  condiciones: string[]                    // ["Migraña crónica", "Epilepsia focal"]
  tratamientos_activos: string[]           // ["Topiramato 50mg", "Sumatriptán"]
  adherencia_14d: number                   // 0-100, % de dosis tomadas
  sintomas_frecuentes: string[]            // top 5 síntomas últimos 30 días
  vitales_recientes: {
    bp?: string                            // "120/80 mmHg"
    hr?: number                            // 72 bpm
    glucose?: number                       // mg/dL
    weight?: number                        // kg
  }
  proxima_cita: string | null              // ISO date
  senales_alarma: string[]                 // alertas activas
  resumen_narrativo: string                // párrafo en español para el system prompt
  generated_at: string                     // ISO timestamp
}
```

El `resumen_narrativo` es el texto que se inyecta directamente en el system prompt del agente. Ejemplo:

> "Paciente con migraña crónica y epilepsia focal. Adherencia al tratamiento del 78% en los últimos 14 días. Síntomas más frecuentes: cefalea, náuseas, fatiga. Última presión arterial registrada: 120/80 mmHg. Próxima cita: 15 de mayo. Señal de alarma activa: 3 crisis en los últimos 7 días."

#### RAG on-demand — 4 tools

El agente llama estas funciones solo si la pregunta del usuario requiere datos específicos (fechas, conteos, tendencias):

```typescript
get_symptoms(days: number): SymptomLog[]
get_adherence(days: number): AdherenceLog[]
get_vitals(days: number): VitalReading[]
get_packs(): PackSummary[]
```

**Criterio para activar RAG:** si la query menciona fechas específicas, períodos concretos ("en marzo", "la semana pasada"), o conteos ("cuántas veces", "cuántas dosis").

#### Función principal

```typescript
export async function getPatientContext(userId: string): Promise<{
  summary: PatientSummary
  summaryText: string   // listo para inyectar en system prompt
}>
```

- Intenta leer `patient_summary` de `aliis_insights` (cache)
- Si no existe o tiene más de 7 días → regenera síncronamente y guarda
- Fail-open: si falla la generación, devuelve un contexto mínimo desde `medical_profiles`

---

## Capa 3 — Agente Aliis

### Archivo: `frontend/app/api/aliis/agent/route.ts`

#### Contrato de la API

```typescript
// POST /api/aliis/agent
// Auth: requiere sesión activa (mismo patrón que el resto de rutas)

// Request
interface AgentRequest {
  query: string           // pregunta del usuario en lenguaje natural
  screen_context: string  // "diario" | "pack" | "tratamientos" | "historial" | "cuenta"
  mode: "query" | "proactive" | "contextual"
}

// Response
interface AgentResponse {
  message: string         // respuesta en lenguaje natural, español
  action?: {
    label: string         // "Preparar resumen de consulta"
    endpoint: string      // "/api/aliis/consult"
    method: "POST" | "GET"
  }
  source: "summary" | "rag" | "both"
}
```

#### Flujo interno

1. **Auth** — verificar sesión, obtener `user_id`
2. **Rate limit** — 20 req/hora por usuario (mismo patrón que `/api/aliis/correlation`)
3. **Patient context** — `getPatientContext(userId)` → `summaryText`
4. **Decisión RAG** — evaluar si `query` requiere datos específicos → llamar tools necesarias
5. **Llamada a Claude** — una sola llamada con:
   - System prompt: identidad de Aliis + `summaryText` + `screen_context`
   - User message: `query`
   - Prompt caching en system prompt (mismo patrón del singleton)
6. **Detección de acción** — si la respuesta sugiere algo accionable → adjuntar `action`
7. **Log LLM usage** — `logLlmUsage()` (mismo patrón)
8. **Retornar** `AgentResponse`

#### Los 3 modos

**Query mode** — activado por el botón "Pregúntale a Aliis". El usuario escribe una pregunta libre. El agente responde con contexto completo del paciente.

**Proactive mode** — activado por cron. No hay `query` del usuario. El system prompt instruye a Claude a revisar el `patient_summary` y determinar si hay algo relevante que notificar. Si Claude responde con contenido → crear notificación. Si responde vacío → no hacer nada. Este modo es más barato: solo usa el resumen, no hace RAG.

**Contextual mode** — el botón "Pregúntale a Aliis" en una pantalla específica sin query explícita. Aliis genera un insight relevante a `screen_context` usando solo el resumen. Ej: en `/diario` → analiza síntomas recientes. En `/tratamientos` → revisa adherencia.

#### System prompt por screen_context

```
diario:       "El usuario está revisando su diario de síntomas. Responde sobre síntomas, vitales y patrones recientes."
pack:         "El usuario está leyendo sobre su diagnóstico. Responde conectando el contenido del pack con su historial personal."
tratamientos: "El usuario está en su página de tratamientos. Responde sobre adherencia, medicamentos y efectos."
historial:    "El usuario está revisando su historial de packs. Responde sobre su evolución y comprensión de su condición."
cuenta:       "El usuario está en su perfil. Responde sobre su plan de uso y funcionalidades disponibles."
```

---

## Capa 4 — Superficies

### Botón "Pregúntale a Aliis" (ya existe, se potencia)

El botón actual en cada capítulo del pack abre un chat con contexto del capítulo. Se extiende para:

1. Pasar `screen_context` al endpoint del agente
2. Usar `POST /api/aliis/agent` en lugar de (o además de) el chat actual
3. Mostrar `action` sugerida en la respuesta si viene en el payload

No hay cambio visual para el usuario — misma UX, respuestas más inteligentes.

El mismo botón se añade a `/diario`, `/tratamientos`, e `/historial` (si no existe ya).

### Notificaciones proactivas

El cron proactivo (diario, integrado al cron de `notify` existente) genera notificaciones con:

```typescript
{
  title: "Aliis detectó algo",
  body: "Tus cefaleas aumentaron un 40% esta semana.",
  action: {
    label: "Preparar resumen de consulta",
    endpoint: "/api/aliis/consult"
  }
}
```

La notificación in-app muestra el `body` + botón con `action.label`. El push notification muestra `title` + `body`.

---

## Migración incremental — 4 semanas

Cada semana es deployable de forma independiente. Si algo falla, el resto de la app no se afecta.

| Semana | Qué se construye | Impacto en usuario |
|--------|-----------------|-------------------|
| 1 | `lib/patient-context.ts` + cron semanal de `patient_summary` | Ninguno — solo datos |
| 2 | `POST /api/aliis/agent` + chat de packs lo consume | Respuestas más contextuales en packs |
| 3 | Botón en `/diario`, `/tratamientos`, `/historial` con `screen_context` | Aliis disponible en toda la app |
| 4 | Cron proactivo integrado a `notify` — detección de patrones | Notificaciones inteligentes |

---

## Consideraciones técnicas

### Costo y latencia

- El resumen pre-computado elimina el costo de RAG para el 80% de las preguntas comunes
- RAG solo se activa para preguntas específicas (fechas, conteos) — estimado 20% de queries
- El cron proactivo en modo `proactive` solo usa el resumen → costo mínimo por usuario
- Prompt caching en el system prompt (mismo patrón del singleton `lib/anthropic.ts`)

### Stale summary

- El resumen se invalida automáticamente si `medical_profiles.updated_at` o `treatments.updated_at` es más reciente que `patient_summary.generated_at`
- Fail-open: si el resumen no está disponible, el agente opera con solo `medical_profiles` como contexto mínimo

### Mobile

- `POST /api/aliis/agent` es el único endpoint que la app mobile necesita para toda la capa de IA
- El contrato de request/response es estable — React Native lo consume igual que Next.js
- `screen_context` en mobile mapea a la pantalla activa del navigator

### Rate limiting

- Query mode: 20 req/hora por usuario (mismo patrón que correlation/hilo)
- Proactive mode (cron): sin rate limit — es interno
- Contextual mode: 10 req/hora por usuario (menos agresivo, es automático)

### Privacidad y Sentry scrubbing

- El `patient_summary` contiene datos médicos sensibles — añadir `'/api/aliis/agent'` a la lista de rutas scrubbed en `lib/sentry-scrub.ts`
- El body del request y response nunca se loguea en Sentry

---

## Archivos nuevos

```
frontend/lib/patient-context.ts          — Patient Context Layer
frontend/app/api/aliis/agent/route.ts    — Agente Aliis (3 modos)
frontend/app/api/aliis/agent/summary/route.ts  — Cron semanal de patient_summary
frontend/migrations/20260504_patient_summary_index.sql  — índice en aliis_insights por type
```

## Archivos modificados

```
frontend/app/api/aliis/notify/route.ts   — añadir modo proactive al cron
frontend/lib/sentry-scrub.ts             — añadir /api/aliis/agent a rutas scrubbed
frontend/vercel.json                     — añadir cron semanal para patient_summary
frontend/components/ChapterChat.tsx      — pasar screen_context al agente
frontend/components/ChatDrawer.tsx       — pasar screen_context al agente
```
