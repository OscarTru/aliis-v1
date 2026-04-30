# Aliis v1 — Análisis de Implementación
**Fecha:** 30 Abril 2026  
**Basado en:** Plan de implementación v1.0 + estado real del codebase

---

## RESUMEN EJECUTIVO

El plan de 120 días es sólido. El codebase actual está **más avanzado de lo que el plan asume** en varias áreas, lo que reduce el trabajo real en Fases 0–2. Las Fases 5–6 (mobile) son las más inciertas y merecen el mayor cuidado de planificación.

**Estado del codebase hoy:** Production-ready en core (packs, auth, checkout, diario básico). Listo para construir encima.

---

## FASE 0 — AI ENGINE + SECURITY

### S0-A: Security Fixes

**Open Redirect en Stripe Checkout**
- Estado real: `frontend/app/api/stripe/checkout/route.ts` usa `success_url` hardcodeado a `${origin}/cuenta?upgrade=success` — **NO hay open redirect**. El `origin` viene del header `req.headers.get('origin')`, no del body.
- **Acción real**: Validar que `origin` esté en allowlist de dominios (`aliis.app`, `localhost:*`). El plan original sobrestima el problema pero la validación es buena práctica.

**JWT en backend Express**
- Estado real: `backend/src/middleware/auth.ts` existe. Las rutas en `backend/src/routes/pack.ts` y `backend/src/routes/stripe.ts` necesitan confirmación de que usan este middleware. El `app.use('/api', verifySupabaseToken)` global NO está aplicado en `backend/src/index.ts` — las rutas lo aplican individualmente.
- **Acción real**: Auditar que TODAS las rutas POST/GET tienen el middleware. Considerar hacer el middleware global.

**Free tier copy**
- Estado real: El mock-data.ts ya fue actualizado a "1 pack cada 7 días" en sesiones anteriores. Hacer grep para confirmar que no quedaron restos.
- **Acción real**: Grep + fix de cualquier residuo.

**Estimación S0-A**: 30–45 min (no 1–2h). El trabajo crítico es la auditoría del middleware.

---

### S0-B: Vercel AI SDK + Provider Setup

**Estado real de dependencias:**
- Frontend usa `@anthropic-ai/sdk` directamente, NO tiene `ai` (Vercel AI SDK)
- Backend usa `@anthropic-ai/sdk` directamente
- NO hay Groq, NO hay Google AI SDK instalados

**Evaluación crítica del plan:**

El plan propone migrar a Vercel AI SDK con 3 proveedores (Anthropic, Google, Groq). Esto es válido pero tiene implicaciones:

1. **Classifier → Groq (llama-3.1-8b-instant)**: Buena idea. El classifier (`backend/src/lib/classifier.ts`) actualmente usa `claude-haiku-4-5-20251001`. Migrar a Groq puede bajar latencia de ~200ms a ~50ms y costo a casi $0.
   - **Riesgo**: Calidad del output. Llama 3.1 8B puede ser menos preciso en clasificación médica. **Recomendación**: Hacer A/B antes de migrar completamente. No es bloqueante.

2. **Chat Free → Gemini 2.0 Flash**: El chat actual en `/api/chat/route.ts` usa Haiku. Migrar a Gemini reduce costo significativamente.
   - **Riesgo bajo** — el chat es conversacional, no clínico.

3. **Prompt caching**: El sistema actual YA tiene prompt caching en `@anthropic-ai/sdk` (con `cache_control: { type: "ephemeral" }`). Vercel AI SDK soporta esto via `providerOptions.anthropic.cacheControl`. La migración debe preservar este comportamiento.

4. **`symptoms` → Gemini**: El extractor en `/api/symptoms/route.ts` usa Haiku con JSON output. Gemini tiene `responseMimeType: 'application/json'` — funciona bien para esto.

**Acción real**: 
- Instalar `ai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/groq` en frontend y backend
- Crear `lib/ai-providers.ts` con el registry de modelos
- Migrar gradualmente (classifier primero, luego symptoms, luego chat)
- NO migrar pack generator aún — demasiado crítico para una migración simultánea

**Estimación S0-B**: 3–4h (el plan dice 2–3h, subestima la migración del classifier con validación)

---

### S0-C: Free Tier Rate Limit Unification

- Estado real: Ya resuelto en sesiones anteriores. Hacer grep para confirmar.
- **Acción real**: Solo verificación. 15 min.

---

## FASE 1 — PERSONALIZACIÓN MÉDICA

### S1-A: Medical Profiles — DB + Types

- **No existen tablas de medical_profiles** — hay que crearlas.
- El plan SQL es correcto. La tabla necesita una migration nueva.
- El tipo `MedicalProfile` no existe en `frontend/lib/types.ts`.
- **Acción real**: Exactamente como describe el plan. Sin sorpresas.

### S1-B: Medical Profile UI — Onboarding Step 4

- `frontend/app/onboarding/page.tsx` existe pero necesito ver su estructura actual.
- No hay componente `TagInput` en `frontend/components/ui/`.
- No hay `Select` de Radix/shadcn instalado — verificar si hay alternativa en `components/ui/`.
- **Alerta**: El plan usa `<Select>` y `<SelectItem>` que pueden no existir. Usar `<select>` HTML nativo con estilos Tailwind o verificar disponibilidad en `components/ui/`.
- **Acción real**: Verificar componentes disponibles antes de implementar. TagInput necesita crearse desde cero.

### S1-C: Enricher con Medical Context

- `backend/src/lib/enricher.ts` existe con `enrichContext()`.
- El plan extiende `EnrichedContext` correctamente.
- **Consideración**: El enricher hace queries a Supabase desde el backend. El backend tiene `SUPABASE_SERVICE_ROLE_KEY` — puede leer `medical_profiles` con RLS bypass. Esto es correcto.
- **Acción real**: Como describe el plan. Verificar que `backend/src/lib/enricher.ts` efectivamente tiene la interfaz `EnrichedContext` exportada.

---

## FASE 2 — DIARIO AGÉNTICO

### S2-A: Clinical Thresholds

- No existe `frontend/lib/clinical-thresholds.ts` — hay que crearlo.
- El `aliis-prompt.ts` existe. La integración es directa.
- **Consideración**: Los thresholds son valores médicos — deben ser revisados por Stephanie (médico del equipo) antes de producción. El plan no menciona esto. **Agregar en acceptance tests**: revisión médica de los valores.
- **Acción real**: Crear el módulo, integrarlo al prompt, pero flag para revisión clínica.

### S2-B: Adherence Logs + Streak UI

- No existe tabla `adherence_logs` — hay que crearla.
- La lógica del streak en `lib/adherence.ts` es correcta pero asume UTC. Los usuarios mexicanos están en UTC-6 — hay que usar `date-fns-tz` o manejar timezone en el cliente.
- **Acción real**: Calcular streak en el cliente (donde se conoce el timezone), no en el servidor.

### S2-C: Correlación Síntomas-Adherencia

- Depende de S2-B tener datos suficientes. En beta temprana puede que pocos usuarios tengan 30 días de datos.
- **Recomendación**: Bajar el mínimo de 30 días a 7 días para el MVP. Mencionar "datos de X días" en lugar de "del mes".
- **Acción real**: Implementar con umbral flexible (param `days`, default 30, mínimo 7).

---

## FASE 3 — CONSULTA LOOP

### S3-A: Pre-Consult Summary + Share Token

- No existe ruta `/c/[token]` — hay que crearla.
- No existe tabla `consult_summaries` — hay que crearla.
- **Alerta de seguridad**: La política RLS `"Public read by token"` con `USING (true)` expone TODOS los registros sin auth. El `share_token` actúa como secreto pero esto es un pattern frágil. **Recomendación**: Usar un service-role client en el server component, no una política pública. Así el token se valida en código, no en DB.
- **Acción real**: Usar `createServerClientServiceRole()` para la ruta pública, sin política RLS pública.

### S3-B: Cápsula del Tiempo

- `vercel.json` existe con 1 cron. Agregar el segundo cron es directo.
- El patrón del cron con `CRON_SECRET` ya existe en `/api/aliis/notify/route.ts` — replicarlo.
- **Acción real**: Como describe el plan.

### S3-C: Motor de Consulta (Recordatorio de Cita)

- Agregar columnas a `profiles` con `ALTER TABLE ADD COLUMN IF NOT EXISTS` — safe.
- La lógica de `differenceInDays` requiere `date-fns` que ya está instalado.
- **Acción real**: Como describe el plan.

---

## FASE 4 — RETENCIÓN PROFUNDA

### S4-A: Diario Libre con Extracción IA

- `ALTER TABLE symptom_logs ADD COLUMN IF NOT EXISTS free_text TEXT` — safe migration.
- El extractor de síntomas ya existe en `/api/symptoms/route.ts` — extenderlo para aceptar `free_text`.
- **Acción real**: La migración y la UI son straightforward. El cambio a Gemini depende de S0-B.

### S4-B: El Hilo — Narrativa Longitudinal

- No existe `/api/aliis/hilo/route.ts` — hay que crearlo.
- **Consideración de costo**: Sonnet 4.6 para narrativa mensual es caro si se llama frecuentemente. El plan propone cache en `sessionStorage` que mitiga esto. Para Free users que lo pueden usar 1 vez/mes, considerar guardar en DB con timestamp (como `aliis_insights`).
- **Acción real**: Guardar en `aliis_insights` con `type: 'hilo'` en lugar de solo sessionStorage.

---

## FASE 5 — MOBILE FOUNDATION

### S5-A: Monorepo Setup

- **Consideración importante**: El plan propone `shared/` como paquete compartido. En la práctica, hacer esto funcionar con Expo + Next.js + TypeScript paths aliases es complejo. 
- **Recomendación alternativa**: Copiar `types.ts` a `mobile/lib/types.ts` y mantenerlo sincronizado manualmente. El shared package agrega complejidad de build que puede bloquear el desarrollo.
- Si se decide hacer shared package, usar **Turborepo** o simplemente `npm workspaces`.
- **Acción real**: Empezar con copia manual. Abstraer a shared package solo si se necesita activamente.

### S5-B: Mobile Auth

- `expo-secure-store` para persistencia de sesión es el approach correcto.
- Supabase tiene documentación oficial para Expo — seguirla exactamente.
- **Acción real**: Como describe el plan.

### S5-C & S5-D: Mobile Pack + Diario + Push

- La lógica de negocio ya existe en el backend Express. La app mobile puede llamar directamente al mismo backend.
- Para push en móvil: **Expo Push Service** es diferente a Web Push (VAPID). El backend necesita distinguir entre ambos. El plan lo contempla correctamente.
- **Acción real**: Como describe el plan pero verificar que el backend Express tiene CORS configurado para la app mobile (debería funcionar con el mismo setup actual).

---

## FASE 6 — MOBILE AGENTIC + APP STORE

### S6-A: HealthKit / Health Connect

- Requiere `react-native-health` (iOS) y `react-native-health-connect` (Android).
- Ambas librerías requieren configuración nativa (Info.plist en iOS, permisos en Android).
- **No compatible con Expo Go** — requiere development build con `expo-dev-client`.
- **Acción real**: Esto es la feature más compleja del plan. Reservar 6–8h, no 4h.

### S6-B: OCR de Prescripciones

- Claude tiene capacidades de visión — usar `anthropic.messages.create` con `image` content block.
- `expo-camera` + `expo-image-picker` para captura.
- Subir a Supabase Storage (bucket privado) antes de procesar.
- **Acción real**: Como describe el plan.

### S6-C: App Store Submission

- Apple requiere Privacy Nutrition Labels para apps de salud — no menciona datos de glucosa, presión, etc.
- Google Play requiere declaración de datos sensibles de salud.
- **Acción real**: El plan es correcto. Agregar 2h extra para configurar Privacy Manifests de iOS.

---

## GAPS DEL PLAN ORIGINAL

1. **No hay feature flags implementados** — el plan los menciona como prerequisito pero no hay una sesión dedicada a crearlos. Agregar como S0-D o como primera tarea de S1-A.

2. **No hay Sentry/error monitoring** — el plan menciona "0 errores en Sentry" como criterio de éxito pero Sentry no está integrado. Agregar integración básica en S0-A o como S0-D.

3. **No hay plan de migración de datos para `symptom_logs`** — al agregar `free_text` en S4-A, las filas existentes quedan con NULL. La UI necesita manejar este caso.

4. **Shared types entre frontend y backend son divergentes** — `frontend/lib/types.ts` y `backend/src/types.ts` son archivos separados que pueden desincronizarse. El plan de shared package (S5-A) resuelve esto, pero antes de eso hay riesgo.

5. **El plan no contempla rate limiting** — varias rutas de IA pueden ser abusadas. Añadir rate limiting básico (por userId + tiempo) en las rutas de generación costosas.

---

## PRIORIDADES REALES VS. PLAN

| Prioridad | Sesión | Impacto | Esfuerzo real |
|-----------|--------|---------|---------------|
| 🔴 CRÍTICO | S0-A middleware audit | Seguridad | 45 min |
| 🔴 CRÍTICO | Feature flags table | Prerequisito de todo | 30 min |
| 🟡 ALTO | S0-B Vercel AI SDK | Costo/latencia | 3–4h |
| 🟡 ALTO | S1-A/B/C Medical profiles | Feature Pro clave | 6h total |
| 🟡 ALTO | S2-B Adherence + Streak | Retención | 4–5h |
| 🟢 MEDIO | S3-A Pre-consult summary | Diferenciador | 4h |
| 🟢 MEDIO | S4-B El Hilo | Retención Free | 3h |
| 🟢 MEDIO | S5-A/B Mobile setup | Foundation | 5h |
| ⚪ BAJO | S2-C Correlación | Nice-to-have | 3h |
| ⚪ BAJO | S6-A HealthKit | Complejidad alta | 6–8h |

---

## ESTIMACIÓN AJUSTADA DE TIEMPOS

| Fase | Plan original | Estimación real | Delta |
|------|--------------|-----------------|-------|
| Fase 0 | 5 días | 3–4 días | -1 día |
| Fase 1 | 15 días | 12–14 días | -2 días |
| Fase 2 | 18 días | 15–16 días | -2 días |
| Fase 3 | 14 días | 12–13 días | -1 día |
| Fase 4 | 13 días | 10–12 días | -2 días |
| Fase 5 | 30 días | 35–40 días | +8 días |
| Fase 6 | 25 días | 28–30 días | +4 días |
| **Total** | **120 días** | **115–125 días** | **±5 días** |

La Fase 5 (Mobile) es la mayor incertidumbre. Todo lo demás está bien estimado o subestimado levemente.
