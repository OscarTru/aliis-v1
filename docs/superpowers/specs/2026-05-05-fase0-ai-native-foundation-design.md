# Fase 0 — AI-Native Foundation Design

## Goal

Establecer la base documental, de prompts y de subagentes que acelera el desarrollo de la app Flutter y los próximos 12 meses de escala, sin reescribir nada del producto existente.

## Architecture

Tres capas independientes que se construyen en orden:

1. **Documentación** — `CLAUDE.md` jerárquico + `docs/` estructurado + ADRs
2. **Prompts versionados** — extraer system prompts del código a `docs/prompts/<name>/v1.md`
3. **Subagentes** — 3 agentes especializados en `.claude/agents/`

Ninguna capa toca lógica de producto. Todo es aditivo — nada se rompe.

## Tech Stack

- Markdown para docs, ADRs, runbooks y prompts
- `.claude/agents/` para subagentes (Claude Code native)
- `fs.readFileSync` cacheado para importar prompts en route handlers (Next.js 15 + tsx)

---

## Sección 1: Estructura de archivos

```
aliis-v1/
├── CLAUDE.md                              # Actualizado — estado real + roadmap
├── frontend/
│   └── CLAUDE.md                          # Nuevo — reglas Next.js
├── backend/
│   └── CLAUDE.md                          # Nuevo — reglas Railway worker
├── docs/
│   ├── architecture/
│   │   └── 00-overview.md                 # Diagrama Vercel + Railway + Supabase
│   ├── prompts/
│   │   ├── CHANGELOG.md                   # Historial de cambios de prompts
│   │   ├── README.md                      # Cómo se versionan los prompts
│   │   ├── aliis-agent/
│   │   │   └── v1.md                      # ← agent/route.ts system prompt
│   │   ├── chapter-chat/
│   │   │   └── v1.md                      # ← chat/route.ts system prompt
│   │   ├── aliis-core/
│   │   │   └── v1.md                      # ← aliis-core.ts system prompt
│   │   ├── patient-context/
│   │   │   └── v1.md                      # ← patient-context.ts system prompt
│   │   └── pack-generator/
│   │       └── v1.md                      # ← backend/src/lib/generator.ts
│   ├── runbooks/
│   │   ├── deploy-frontend.md
│   │   ├── deploy-backend.md
│   │   ├── rollback-prompt.md
│   │   └── add-new-llm-endpoint.md
│   ├── decisions/
│   │   ├── 0001-haiku-only.md
│   │   ├── 0002-flutter-over-rn.md
│   │   ├── 0003-stripe-web-not-iap.md
│   │   ├── 0004-supabase-as-backend.md
│   │   ├── 0005-prompt-caching-policy.md
│   │   ├── 0006-app-root-deprecation.md
│   │   └── 0007-vercel-vs-railway.md
│   └── superpowers/                       # Ya existe — no tocar
└── .claude/
    └── agents/
        ├── aliis-route-builder.md
        ├── aliis-migration-writer.md
        └── aliis-prompt-engineer.md
```

---

## Sección 2: CLAUDE.md raíz

### Contenido

**Qué es Aliis** — acompañante de salud para pacientes con enfermedades crónicas. Especialización inicial en neurología (comunidad CE, 575K seguidores). Expansión futura a cardiovascular, metabólico, salud mental crónica.

**Estado actual de producción:**
- `frontend/` — Next.js 15 en Vercel. Auth (Supabase SSR), Stripe checkout, agentes IA, diario, tratamientos, packs educativos. **Es la app real.**
- `backend/` — Express en Railway. Pipeline de generación de packs (6 capas). **Producción real.**
- `/app/` raíz — Landing legacy. Pendiente de deprecación (ADR-0006).

**Roadmap activo:**
- Fase 0 (semana actual): AI-Native Foundation
- Fase 1 (semanas 2-4): Brainstorming + diseño app Flutter
- Fase 2 (semanas 5-10): Build Flutter con HealthKit, push, OCR
- Fase 3+: Widgets, ASO, submission stores

**Regla Vercel vs Railway** — si el endpoint es user-triggered y necesita cookie SSR de Supabase → Vercel. Si es cron, batch, procesa múltiples usuarios, o tarda >30s → Railway.

**Hard rules** (sin excepciones):
1. Modelo siempre desde `ai-models.ts` — nunca string hardcodeado
2. Prompts > 5 líneas siempre en `docs/prompts/<name>/v(N).md`
3. Todo endpoint: auth → rate limit → validación de input
4. Toda llamada LLM: `logLlmUsage()`
5. PHI: rutas con datos médicos en `sentry-scrub.ts`
6. Español para strings al usuario. Inglés en código y comentarios.
7. No pagos dentro de la app móvil (Apple 3.1.1) — Stripe vive en web

**Subagentes disponibles:**
- `aliis-route-builder` — endpoint nuevo (auth + rate + validation automáticos)
- `aliis-migration-writer` — SQL migration con RLS y rollback
- `aliis-prompt-engineer` — editar prompt (crea v(N+1), nunca edita v(N))

### Jerarquía

`CLAUDE.md` raíz define las reglas globales. `frontend/CLAUDE.md` y `backend/CLAUDE.md` añaden reglas específicas de cada contexto — nunca contradicen el raíz.

---

## Sección 3: Prompts versionados

### Convención de versionado

- Cada prompt vive en `docs/prompts/<nombre>/v1.md`, `v2.md`, etc.
- Nunca se edita una versión existente — siempre se crea `v(N+1)`
- `CHANGELOG.md` registra: fecha, prompt, versión anterior → nueva, razón del cambio
- El route handler importa la versión activa explícitamente: `readPrompt('aliis-agent', 'v1')`

### Helper de importación

```typescript
// frontend/lib/prompts.ts
import { readFileSync } from 'fs'
import { join } from 'path'

export function readPrompt(name: string, version: string): string {
  const path = join(process.cwd(), '..', 'docs', 'prompts', name, `${version}.md`)
  return readFileSync(path, 'utf-8')
}
```

### Prompts a extraer

| Prompt | Origen | Líneas aprox |
|--------|--------|--------------|
| `aliis-agent` | `app/api/aliis/agent/route.ts` | ~150 |
| `chapter-chat` | `app/api/chat/route.ts` | ~80 |
| `aliis-core` | `lib/aliis-core.ts` | ~60 |
| `patient-context` | `lib/patient-context.ts` | ~40 |
| `pack-generator` | `backend/src/lib/generator.ts` | ~50 |

---

## Sección 4: Subagentes

Todos en español. Todos conocen las hard rules del `CLAUDE.md` raíz.

### `aliis-route-builder`

**Cuándo usarlo**: cuando necesitas un endpoint nuevo en `frontend/app/api/` o `backend/src/routes/`.

**Qué hace**: genera el archivo completo siguiendo la plantilla canónica:
1. Auth (`createServerSupabaseClient` + `getUser`)
2. Rate limit (`rateLimit()`)
3. Validación de input (tipo, longitud, formato)
4. Lógica core (importa helpers de `lib/`)
5. `logLlmUsage()` si llama a LLM
6. Registro en `sentry-scrub.ts` si maneja PHI

**No hace**: lógica de negocio nueva — solo la estructura. Tú le das la lógica, él la envuelve correctamente.

### `aliis-migration-writer`

**Cuándo usarlo**: cuando necesitas cambiar el schema de Supabase.

**Qué hace**: genera archivo `frontend/migrations/YYYYMMDD_<nombre>.sql` con:
- `CREATE TABLE` o `ALTER TABLE`
- RLS policies (`enable row level security`, `create policy`)
- Índices necesarios
- Comentario de rollback al final

**No hace**: decide el schema — tú le describes qué necesitas, él lo traduce a SQL correcto.

### `aliis-prompt-engineer`

**Cuándo usarlo**: cuando necesitas modificar un system prompt existente o crear uno nuevo.

**Qué hace**:
- Lee `docs/prompts/<nombre>/v(N).md`
- Crea `docs/prompts/<nombre>/v(N+1).md` con los cambios
- Actualiza `docs/prompts/CHANGELOG.md`
- Nunca toca la versión anterior

**No hace**: decide qué cambiar — tú le das la dirección, él ejecuta el cambio respetando el versionado.

---

## ADRs a documentar

| ID | Decisión | Estado |
|----|----------|--------|
| 0001 | Haiku como modelo base | Activo |
| 0002 | Flutter sobre React Native | Activo |
| 0003 | Stripe en web, no IAP | Activo |
| 0004 | Supabase como backend de datos | Activo |
| 0005 | Prompt caching siempre activo | Activo |
| 0006 | Deprecación de `/app/` raíz | Pendiente |
| 0007 | Vercel para user-triggered, Railway para batch | Activo |

---

## Runbooks a escribir

| Runbook | Cuándo se usa |
|---------|---------------|
| `deploy-frontend.md` | Push a master → Vercel |
| `deploy-backend.md` | Push a Railway |
| `rollback-prompt.md` | Prompt produce respuestas malas |
| `add-new-llm-endpoint.md` | Endpoint nuevo que llama a Claude |

---

## Checklist de salida Fase 0

- [ ] `CLAUDE.md` raíz refleja estado real + roadmap Flutter
- [ ] `frontend/CLAUDE.md` y `backend/CLAUDE.md` creados
- [ ] `docs/architecture/00-overview.md` con diagrama del sistema
- [ ] 5 prompts extraídos a `docs/prompts/` e importados desde route handlers
- [ ] `docs/prompts/CHANGELOG.md` y `README.md` creados
- [ ] 7 ADRs en `docs/decisions/`
- [ ] 4 runbooks en `docs/runbooks/`
- [ ] 3 subagentes en `.claude/agents/` probados con caso real
- [ ] 0 strings de modelo hardcodeados fuera de `ai-models.ts`
- [ ] Build de frontend pasa sin errores tras los cambios
