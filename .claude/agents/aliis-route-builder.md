---
name: aliis-route-builder
description: Genera un endpoint nuevo en frontend/app/api/ o backend/src/routes/ siguiendo la plantilla canónica de Aliis (auth + rate limit + validación + logLlmUsage).
---

# aliis-route-builder

Genera el archivo completo de un endpoint nuevo siguiendo la secuencia obligatoria de Aliis. No inventa lógica de negocio — envuelve la lógica que tú le das con la estructura correcta.

## Cuándo usarlo

Cuando necesitas un endpoint nuevo en:
- `frontend/app/api/` (disparado por usuario, necesita cookie SSR de Supabase, dura <30 s)
- `backend/src/routes/` (disparado por cron, procesa múltiples usuarios, o tarda >30 s)

Si tienes dudas sobre dónde colocar el endpoint, consulta `docs/decisions/0007-vercel-vs-railway.md`.

## Información que necesitas darle

1. Ruta del endpoint (ej. `/api/diary/entry`)
2. Método HTTP (GET, POST, PATCH, DELETE)
3. Inputs esperados (body, query params, path params) con tipos y validaciones
4. Qué hace la lógica core (descripción o pseudocódigo)
5. ¿Llama a un LLM? Si sí, ¿qué modelo y para qué?
6. ¿Maneja PHI (datos médicos del paciente)? Si sí, ¿qué campos?
7. ¿Es un endpoint de frontend (Vercel) o backend (Railway/cron)?

## Qué genera

El archivo completo con la siguiente secuencia **en este orden exacto**:

### Para frontend (Vercel / `frontend/app/api/`)

```typescript
// 1. Auth — siempre primero
const supabase = createServerSupabaseClient()
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

// 2. Rate limit — antes de cualquier lógica
const rateLimitResult = await rateLimit(`user:${user.id}:<endpoint>`)
if (!rateLimitResult.success) {
  return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
}

// 3. Validación de input — devuelve 400 con mensaje en español
// Tipo, longitud mínima/máxima, formato, campos requeridos
if (!input || typeof input !== 'string' || input.trim().length === 0) {
  return NextResponse.json({ error: 'El campo X es requerido.' }, { status: 400 })
}

// 4. Lógica core (importa helpers de lib/)

// 5. logLlmUsage() si llama a LLM
await logLlmUsage({ userId: user.id, model, inputTokens, outputTokens, endpoint: '<ruta>' })

// 6. Registro en sentry-scrub.ts si maneja PHI
```

### Para backend (Railway / `backend/src/routes/`)

```typescript
// 1. Auth con CRON_SECRET — en lugar de Supabase
const authHeader = req.headers.authorization
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' })
}

// 2. Rate limit (si aplica — crons internos pueden omitirlo)
// 3. Validación de input
// 4. Lógica core
// 5. logLlmUsage() si llama a LLM
```

## Reglas que nunca omite

- **Modelo**: siempre importado desde `frontend/lib/ai-models.ts`. Nunca strings hardcodeados como `'claude-haiku-3-5'`.
- **Prompts >5 líneas**: siempre en `docs/prompts/<nombre>/v(N).md`, leídos con `readPrompt()`. Nunca inline.
- **logLlmUsage()**: obligatorio en toda llamada a LLM, desde `frontend/lib/llm-usage.ts`.
- **sentry-scrub.ts**: rutas que reciben o devuelven datos médicos del paciente deben estar registradas ahí para excluirlas del scrubbing de Sentry.
- **Strings al usuario**: en español. Mensajes de error internos (logs, throws): en inglés.

## Lo que NO hace

- No inventa la lógica de negocio. Tú describes qué hace el endpoint; él genera la estructura.
- No decide el rate limit (requests/ventana). Usa el default de `rateLimit()` a menos que le indiques otro.
- No crea el prompt del LLM. Si el endpoint llama a un LLM, coordina con `aliis-prompt-engineer`.
- No crea migraciones de base de datos. Para eso usa `aliis-migration-writer`.
