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
| `mobile/` | **EN DESARROLLO** — Flutter (Fase 3A en curso) | App móvil: 8 pantallas rediseñadas Figma, liquid nav iOS 26, chat funcional |
| `/app/` (raíz) | **LEGACY** | Landing anterior. Pendiente de deprecación (ADR-0006) |

## Roadmap activo

- **Fase 0** ✅ COMPLETA: AI-Native Foundation — docs, prompts versionados, subagentes, agent_memory, patient_context, streaming agent con memoria en sesión y persistente Pro
- **Fase 1** ✅ COMPLETA: Brainstorming + diseño app Flutter
- **Fase 2A** ✅ COMPLETA: 5 pantallas Flutter con datos reales — Home, Diario (wizard multi-step), Packs, Alertas (Realtime), Perfil
- **Fase 2B** ✅ COMPLETA: Push nativa FCM (Edge Functions `adherence-analyzer` + `fcm-client` + orquestador), `NotificationService`, `NotificationRouter`
- **Fase 2C** ⏳ Pendiente: OCR de recetas (escanear prescripciones con cámara)
- **Fase 3A** 🔄 EN CURSO: Onboarding, Ingreso/Captura, Destilando, PackTOC, `chapter_reads` — ver plan `2026-05-07-flutter-fase3a-ingreso-onboarding.md`
- **Fase 3B** ⏳ Pendiente: Insight semanal, Pre-consulta Pro, Correlación, Glosario, ProScreen — ver plan `2026-05-07-flutter-fase3b-pro-features.md`
- **Fase 3C** ⏳ Pendiente: HealthKit/Health Connect, offline con Drift
- **Fase 4** ⏳ Pendiente: Widgets de pantalla de inicio, ASO, submission App Store + Play Store

### Próximos pasos — plan AI-First (Capas 2-5)

Ver spec completo en `docs/superpowers/specs/2026-05-04-aliis-ai-first-design.md`.

| Capa | Estado | Descripción |
|---|---|---|
| **Capa 1** — Datos del paciente | ✅ Producción | `symptom_logs`, `adherence_logs`, `treatments`, `medical_profiles` |
| **Capa 2** — Agent Memory | ✅ Producción | `agent_memory` tabla + `lib/agent-memory.ts`. `ChatAgent` aprende de conversaciones Pro |
| **Capa 3** — Patient Context | ✅ Producción | `lib/patient-context.ts` — resumen narrativo + invalidación por cambios |
| **Capa 4** — AliisCore Orchestrator | ✅ Producción | `lib/aliis-core.ts` — agrega señales, una notificación priorizada por día |
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

### Flutter (mobile/)
```bash
cd mobile
bash run.sh              # siempre usar run.sh — carga .env.json con --dart-define-from-file
flutter build ios --release
flutter build apk --release
flutter analyze lib/     # debe dar 0 issues
```

#### Arquitectura mobile (Fase 3A+)

| Feature | Pantalla | Ruta |
|---|---|---|
| Onboarding | `onboarding_screen.dart` | `/onboarding` (redirect si `profiles.onboarding_done = false`) |
| Ingreso | `ingreso_screen.dart` | `/ingreso` — texto/foto/voz |
| Destilando | `distilling_screen.dart` | `/distilling` (extra: String diagnóstico) |
| PackTOC | `pack_toc_screen.dart` | `/packs/:packId/toc` |
| Packs | `packs_screen.dart` | `/packs` (tab shell) |
| PackReader | `pack_reader.dart` | `/packs/:packId` |
| Home | `home_screen.dart` | `/inicio` (tab shell) |
| Alertas | `alertas_screen.dart` | `/alertas` (tab shell) |
| Perfil | `perfil_screen.dart` | `/perfil` (tab shell) |
| Chat sheet | `aliis_sheet.dart` | modal desde home |
| Chat pantalla | `chat_screen.dart` | `/chat` |
| Medicación | `medicacion_screen.dart` | `/medicacion` |
| Diario | `diario_screen.dart` | `/expediente` |
| Registro wizard | `registro_wizard.dart` | `/expediente/registro` |

**Bottom nav (iOS 26 liquid pill):** fondo frosted glass blanco, pill oscura animada `easeInOutCubicEmphasized`. Tabs: Inicio · Biblioteca · [+→/ingreso] · Alertas · Perfil.

**APIs web que consume mobile:**
- `POST https://aliis.app/api/pack/generate` — genera pack (backend Railway, JWT Supabase)
- `GET https://aliis.app/api/aliis/agent` — chat streaming
- `GET https://aliis.app/api/aliis/insight` — insight semanal
- `POST https://aliis.app/api/aliis/consult` — pre-consulta Pro
- `GET https://aliis.app/api/aliis/correlation` — correlación síntomas-adherencia Pro

## Variables de entorno

Ver `frontend/.env.example` y `backend/.env.example`. Nunca commitear `.env*`.

## Orientación rápida (leer en este orden)

1. Este archivo
2. `docs/architecture/00-overview.md` — diagrama del sistema
3. `frontend/CLAUDE.md` — reglas específicas Next.js
4. `backend/CLAUDE.md` — reglas específicas Railway
5. El plan más reciente en `docs/superpowers/plans/`
