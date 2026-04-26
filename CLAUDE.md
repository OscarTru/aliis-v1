# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aliis** ("Entiende tu diagnóstico") is an AI-powered medical diagnosis translator for Spanish-speaking patients, built by medical residents ("Cerebros Esponjosos"). It converts complex neurological diagnoses into patient-friendly explanations using Claude.

## Dual-App Architecture

This repo contains **two separate Next.js apps** plus an Express backend:

| Directory | Purpose | Port |
|-----------|---------|------|
| `/` (root) | Main public-facing app — landing page + `/api/diagnostico` API route | 3000 |
| `/frontend/` | Marketing/SaaS shell — dashboard, pricing, auth UI (no real backend yet) | varies |
| `/backend/` | Standalone Express API (alternative to Next.js API route) | 3001 |

The root app and `/frontend/` are **independent Next.js projects** with separate `package.json`, `tsconfig.json`, and `tailwind.config.ts`. Running commands from the root only affects the root app.

## Commands

### Root app
```bash
npm run dev        # Next.js dev server on :3000
npm run build      # Production build
npm run lint       # ESLint
```

### Frontend app
```bash
cd frontend
npm run dev        # Next.js dev server
npm run build
npm run lint
```

### Backend (Express)
```bash
cd backend
npm run dev        # tsx watch — hot reload
npm run build      # tsc → dist/
npm start          # node dist/index.js
```

No test framework is configured.

## Environment Variables

Both root and backend require:
```
ANTHROPIC_API_KEY=...
```

Backend optionally accepts:
```
FRONTEND_URL=http://localhost:3000   # CORS origin (defaults to *)
PORT=3001
```

## Core AI Flow

The diagnosis explanation is generated in two places (functionally identical):

- **Root app**: `app/api/diagnostico/route.ts` — Next.js route handler
- **Backend**: `backend/src/index.ts` — Express POST `/diagnostico`

Both use `claude-haiku-4-5-20251001` with prompt caching (`cache_control: { type: "ephemeral" }`) on the system prompt. The system prompt is in Spanish and instructs Claude to act as a patient educator — "destilar, no simplificar."

Input limits: diagnosis ≤ 500 chars, optional context ≤ 300 chars.

Response shape (`DiagnosticoResponse` in `frontend/lib/types.ts`):
```typescript
{
  diagnostico_recibido: string
  que_es: string
  como_funciona: string
  que_esperar: string
  preguntas_para_medico: string[]
  senales_de_alarma: string[]
  mito_frecuente: string
  nota_final: string
}
```

## Frontend Structure (root app)

- `app/page.tsx` — Main landing page with inline diagnosis demo (932 lines, all-in-one)
- `app/layout.tsx` — Root layout

## Frontend Structure (`/frontend/`)

- `app/page.tsx` — Redesigned landing (hero 2-col, HowItWorks, LiveExample, Founders, inline pricing)
- `app/dashboard/page.tsx` — Pack history with filter chips
- `app/dashboard/pack/[id]/page.tsx` — Pack detail with chapter sidebar + read tracking
- `app/precios/page.tsx` — SaaS pricing with currency switcher and comparison table
- `components/ui/` — Shared primitives: `Button`, `Capsule`, `Eyebrow`, `Glow`, `ScribbleBrain`
- `lib/mock-data.ts` — All dashboard data is mocked here (no real API calls from frontend yet)
- `lib/types.ts` — Shared TypeScript interfaces

## Path Aliases

Both apps use `@/*` mapped to the app root (e.g. `@/components/...`, `@/lib/...`).

## Styling

Tailwind CSS 3.x. No component library (shadcn/ui not installed). Custom UI primitives live in `components/ui/`. The design uses a distinctive branded aesthetic — avoid generic patterns.

## Key Constraints

- All user-facing copy is in **Spanish**.
- The `/frontend/` dashboard is currently **read-only mock UI** — no auth, no real API integration yet.
- Prompt caching must be preserved on Claude API calls (it's intentional for cost/latency).
