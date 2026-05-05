# CLAUDE.md — Aliis

Guía de referencia del repositorio. Actualizar conforme avanza el proyecto.

## gstack

Usar el skill `/browse` de gstack para navegación web. Nunca usar `mcp__claude-in-chrome__*`.

Skills disponibles: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /connect-chrome, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /setup-gbrain, /retro, /investigate, /document-release, /codex, /cso, /autoplan, /plan-devex-review, /devex-review, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn.

## Qué es Aliis

Aliis es el acompañante de salud personal para pacientes con enfermedades crónicas. Convierte diagnósticos médicos en explicaciones claras, sostiene el seguimiento entre consultas y mejora la adherencia al tratamiento.

**Especialización inicial:** neurología (migraña, epilepsia, esclerosis múltiple, Parkinson, neuropatía, ECV) — respaldada por Cerebros Esponjosos (575K seguidores). Aliis ya cubre muchas más condiciones y seguirá expandiéndose a cardiovascular, metabólico, salud mental crónica y salud preventiva general.

**Promesa al paciente:** entender su diagnóstico, no perderse entre consultas, llegar mejor preparado al médico.

**No negociable:**
- Aliis nunca diagnostica, ajusta dosis, ni opina sobre tratamientos.
- Todas las decisiones clínicas regresan al médico tratante.
- Datos médicos del paciente son privados — no se venden, no entrenan modelos externos.

## Estado actual de producción

| Directorio | Estado | Propósito |
|---|---|---|
| `frontend/` | **PRODUCCIÓN** — Next.js 15 en Vercel | App principal: auth, packs educativos, diario, tratamientos, agentes IA, Stripe |
| `backend/` | **PRODUCCIÓN** — Express en Railway | Pipeline de generación de packs (6 capas), crons |
| `/app/` (raíz) | **LEGACY** | Landing anterior. Pendiente de deprecación (ADR-0006) |

## Roadmap activo

- **Fase 0** ✅ COMPLETA: AI-Native Foundation — docs, prompts versionados, subagentes, agent_memory, patient_context, streaming agent con memoria en sesión y persistente Pro
- **Fase 1** (semanas 2-4): Brainstorming + diseño app Flutter
- **Fase 2** (semanas 5-10): Build Flutter — HealthKit, push nativa, OCR recetas
- **Fase 3** (semanas 11-13): Widgets, ASO, submission stores

### Próximos pasos — plan AI-First (Capas 2-5)

Ver spec completo en `docs/superpowers/specs/2026-05-04-aliis-ai-first-design.md`.

| Capa | Estado | Descripción |
|---|---|---|
| **Capa 1** — Datos del paciente | ✅ Producción | `symptom_logs`, `adherence_logs`, `treatments`, `medical_profiles` |
| **Capa 2** — Agent Memory | ✅ Producción | `agent_memory` tabla + `lib/agent-memory.ts`. `ChatAgent` aprende de conversaciones Pro |
| **Capa 3** — Patient Context | ✅ Producción | `lib/patient-context.ts` — resumen narrativo + invalidación por cambios |
| **Capa 4** — AliisCore Orchestrator | ⏳ Pendiente | `lib/aliis-core.ts` — agrega señales, una notificación priorizada por día |
| **Capa 5** — Agente Queryable | ✅ Producción | `/api/aliis/agent` — streaming, RAG, historial en sesión, memoria Pro |
| **Capa 6** — Company OS | 🚫 Diferida | FinanceAgent, ProductAgent, ContentAgent — no antes de Flutter |

## Regla Vercel vs Railway

- Endpoint **disparado por usuario** + necesita **cookie SSR de Supabase** + dura **<30s** → `frontend/app/api/`
- Endpoint **disparado por cron**, **procesa múltiples usuarios**, o **tarda >30s** → `backend/src/routes/`

Si dudas, lee `docs/decisions/0007-vercel-vs-railway.md`.

## Hard Rules — sin excepciones

1. **Modelo**: siempre importar desde `frontend/lib/ai-models.ts`. Nunca string hardcodeado `'claude-haiku-...'` en otro archivo.
2. **Prompts**: todo system prompt > 5 líneas vive en `docs/prompts/<nombre>/v(N).md`. Nunca inline en route handlers.
3. **Endpoints**: todo endpoint con auth requiere los tres: auth → rate limit → validación de input.
4. **LLM usage**: toda llamada a Claude llama `logLlmUsage()` de `frontend/lib/llm-usage.ts`.
5. **PHI**: rutas que manejan datos médicos deben estar en `frontend/lib/sentry-scrub.ts`.
6. **Idioma**: español para strings al usuario. Inglés en código, comentarios y errores logueados.
7. **Pagos móvil**: Stripe vive en web únicamente. No pagos dentro de la app Flutter (Apple 3.1.1).
8. **Prompts inmutables**: nunca editar `v(N)` existente. Crear `v(N+1)` y actualizar CHANGELOG.

## Subagentes disponibles

Invocar con la tool `Agent` desde Claude Code:

| Subagente | Cuándo usarlo |
|---|---|
| `aliis-route-builder` | Endpoint nuevo — genera plantilla auth+rate+validation completa |
| `aliis-migration-writer` | Cambio de schema — genera SQL con RLS, índices y rollback |
| `aliis-prompt-engineer` | Editar prompt — crea v(N+1), actualiza CHANGELOG, nunca toca v(N) |

## Comandos

### Frontend (Next.js en Vercel)
```bash
cd frontend
npm run dev        # :3000
npm run build
npm run lint
npx tsc --noEmit   # typecheck
```

### Backend (Express en Railway)
```bash
cd backend
npm run dev        # :3001 con hot reload
npm run build
npm start
```

### Flutter (cuando exista)
```bash
cd mobile
flutter run        # simulador
flutter build ios --release
flutter build apk --release
```

## Variables de entorno

Ver `frontend/.env.example` y `backend/.env.example`. Nunca commitear `.env*`.

## Orientación rápida (leer en este orden)

1. Este archivo
2. `docs/architecture/00-overview.md` — diagrama del sistema
3. `frontend/CLAUDE.md` — reglas específicas Next.js
4. `backend/CLAUDE.md` — reglas específicas Railway
5. El plan más reciente en `docs/superpowers/plans/`
