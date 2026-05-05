# ADR-0007: Vercel para user-triggered, Railway para batch

**Estado:** Activo
**Fecha:** 2026-05

## Decisión

Regla de routing de endpoints:

| Si el endpoint... | Va en... |
|---|---|
| Lo dispara el usuario directamente | Vercel (`frontend/app/api/`) |
| Necesita cookie SSR de Supabase | Vercel |
| Dura menos de 30s | Vercel |
| Lo dispara un cron o scheduler | Railway (`backend/src/routes/jobs/`) |
| Procesa múltiples usuarios en un solo request | Railway |
| Tarda más de 30s (pipelines IA pesados) | Railway |
| Maneja archivos grandes (OCR, HealthKit batch) | Railway |

## Razonamiento

- Vercel serverless tiene límite de 60s (Pro plan). Railway no tiene límite.
- Vercel cold starts son 500ms-2s. Railway worker está siempre activo.
- El pipeline de generación de packs (6 capas, múltiples llamadas a Haiku) necesita Railway.
- Los endpoints de usuario (chat, agent query) necesitan la cookie SSR de Supabase — solo funciona en Vercel Next.js.

## Futuro

Cuando Flutter llegue, los endpoints de HealthKit sync y OCR irán directamente a Railway — son batch y pueden tardar 5-15s por imagen.
