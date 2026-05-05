# frontend/CLAUDE.md — Next.js App (Vercel)

Reglas específicas del directorio `frontend/`. Las reglas globales están en el CLAUDE.md raíz.

## Contexto

Next.js 15 con App Router. Desplegado en Vercel. Auth con Supabase SSR (cookies). Stripe para pagos. Tailwind CSS sin componentes externos.

## Estructura clave

- `app/api/` — route handlers (todos user-triggered, usan auth SSR)
- `app/(shell)/` — páginas autenticadas
- `app/(standalone)/` — páginas públicas (precios, faq, landing)
- `app/(checkout)/` — flujo de pago
- `lib/` — helpers compartidos
- `migrations/` — SQL de Supabase (numeradas por fecha)
- `components/` — componentes React

## Reglas específicas

### Auth
- Siempre usar `createServerSupabaseClient()` de `@/lib/supabase-server` en route handlers.
- Nunca confiar en `userId` del body — siempre extraer de `supabase.auth.getUser()`.
- El cliente de Supabase con `service_role` bypasea RLS — solo para operaciones admin explícitas.

### Rate limiting
- Todo endpoint público o autenticado llama `rateLimit()` de `@/lib/rate-limit` antes de procesar.
- Keys de rate limit: `user:<id>:<endpoint>`.

### Prompts
- Importar con `readPrompt(name, version)` de `@/lib/prompts`.
- El prompt caching (`cachedSystem()`) sigue aplicando — `readPrompt` devuelve string, se pasa a `cachedSystem`.

### Migraciones
- Archivo: `migrations/YYYYMMDD_nombre_descriptivo.sql`
- Siempre incluir: `enable row level security`, policies de SELECT/INSERT/UPDATE/DELETE por `auth.uid()`.
- Nunca editar migraciones anteriores. Siempre crear archivo nuevo.
- Usar `aliis-migration-writer` para generarlas.

### Modelo
- Importar `HAIKU_4_5` de `@/lib/ai-models`. Nunca string directo.

### Scrub de PHI
- Si el endpoint maneja datos médicos (diagnósticos, síntomas, medicamentos), agregar la ruta a `lib/sentry-scrub.ts`.

## Comandos
```bash
npm run dev        # :3000
npm run build      # también valida tipos
npm run lint
npx tsc --noEmit
```
