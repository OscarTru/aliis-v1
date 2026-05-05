# backend/CLAUDE.md — Express Worker (Railway)

Reglas específicas del directorio `backend/`. Las reglas globales están en el CLAUDE.md raíz.

## Contexto

Express en Railway. No maneja auth de usuario directamente — recibe requests autenticados por secret (`CRON_SECRET`) desde Vercel o desde Railway Cron. Procesa jobs pesados y pipelines de IA que no caben en serverless.

## Estructura clave

- `src/routes/` — endpoints Express
- `src/lib/` — helpers del worker (generator, verifier, etc.)
- `src/index.ts` — entry point

## Reglas específicas

### Auth de endpoints
- Todo endpoint debe validar `Authorization: Bearer ${CRON_SECRET}` antes de procesar.
- Nunca exponer endpoints sin autenticación.
- No manejar cookies de Supabase aquí — si necesitas datos de usuario, recibe `userId` como parámetro validado.

### Idempotencia
- Los jobs de cron deben ser idempotentes — re-ejecutar no debe duplicar datos.
- Usar `upsert` en lugar de `insert` cuando aplique.

### PHI
- No loguear datos médicos (diagnósticos, síntomas, nombres de pacientes) en console.log ni en Sentry.
- Usar `logger.ts` con scrubbing si existe, o loguear solo IDs.

### Prompts
- Importar con `readFileSync` desde `docs/prompts/<nombre>/<version>.md`.
- Path relativo al root del repo: `join(__dirname, '../../../docs/prompts', name, '${version}.md')`.

### Modelo
- Importar constante de modelo desde un archivo central. No hardcodear strings.

## Comandos
```bash
npm run dev        # :3001 con tsx watch
npm run build      # tsc → dist/
npm start          # node dist/index.js
```
