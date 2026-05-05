# Architecture Overview

## System Diagram

```
┌─────────────────── Vercel (Next.js 15) ──────────────────────┐
│                                                               │
│  app/(shell)/          app/api/                               │
│  ├── dashboard         ├── aliis/agent     (user chat)        │
│  ├── diario            ├── aliis/insight   (daily insight)    │
│  ├── tratamientos      ├── chat            (chapter chat)     │
│  ├── historial         ├── notes/generate                     │
│  └── cuenta            ├── notifications/  (web push reg)     │
│                        └── checkout/       (Stripe)           │
│                                                               │
│  app/(standalone)/                                            │
│  ├── precios                                                  │
│  ├── faq                                                      │
│  └── landing (/)                                              │
│                                                               │
└──────────────┬────────────────────────────────────────────────┘
               │ HTTPS + Bearer CRON_SECRET
               ▼
┌─────────────────── Railway (Express) ────────────────────────┐
│                                                               │
│  routes/                                                      │
│  ├── pack/generate     (pipeline 6 capas — el más pesado)    │
│  └── jobs/             (crons — pendiente migrar desde Vercel)│
│      ├── notify-daily                                         │
│      ├── treatment-check                                      │
│      └── patient-summary                                      │
│                                                               │
└──────────────┬────────────────────────────────────────────────┘
               │ Supabase JS SDK (service role)
               ▼
┌─────────────────── Supabase ─────────────────────────────────┐
│  Postgres + RLS                                               │
│  ├── profiles          medical_profiles    treatments         │
│  ├── packs             pack_chapters       pack_chats         │
│  ├── symptom_logs      adherence_logs      tracked_symptoms   │
│  ├── agent_memory      aliis_insights      llm_usage          │
│  └── push_subscriptions                                       │
│                                                               │
│  Auth (SSR cookies — solo Vercel la consume directamente)     │
│  Storage (imágenes de OCR — futuro)                           │
└───────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────── Anthropic API ────────────────────────────┐
│  Modelo base: claude-haiku-4-5-20251001                       │
│  Prompt caching activo en todos los system prompts            │
│  Prompts versionados en docs/prompts/                         │
└───────────────────────────────────────────────────────────────┘

┌─────────────────── Futuro: Flutter App ──────────────────────┐
│  iOS + Android                                                │
│  ├── Consume frontend/ API (mismos endpoints)                 │
│  ├── HealthKit / Health Connect → backend/health-sync         │
│  ├── OCR recetas → backend/ocr/prescription                   │
│  └── Push nativa APNs/FCM → backend/jobs/notify-daily        │
└───────────────────────────────────────────────────────────────┘
```

## Decision Log

Ver `docs/decisions/` para el razonamiento detrás de cada decisión arquitectural.

## Prompt Registry

Ver `docs/prompts/` para todos los system prompts versionados y su historial de cambios.
