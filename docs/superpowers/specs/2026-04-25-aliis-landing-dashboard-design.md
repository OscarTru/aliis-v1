# Aliis — Landing + Pricing + Dashboard (Sub-proyectos 1 + 3) Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convertir el MVP actual en una aplicación multi-ruta navegable con landing pública refinada, página de precios, dashboard de paciente con historial mockeado, y backend Express separado listo para deploy en Railway.

**Architecture:** Monorepo con `frontend/` (Next.js 15, Vercel) y `backend/` (Express + TypeScript, Railway). El frontend actual en `/Aliis` se reorganiza bajo `frontend/`. Los componentes UI compartidos se extraen a `frontend/components/`. El backend expone un solo endpoint `POST /diagnostico` con la lógica Claude Haiku existente.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v3, CSS custom properties (design tokens), Instrument Serif + Inter, Express 4, @anthropic-ai/sdk, CORS.

---

## Estructura de archivos final

```
/ (raíz del repo)
├── frontend/
│   ├── app/
│   │   ├── globals.css              # Sin cambios
│   │   ├── layout.tsx               # Sin cambios
│   │   ├── page.tsx                 # Landing refinada
│   │   ├── precios/
│   │   │   └── page.tsx             # Pricing SaaS
│   │   └── dashboard/
│   │       ├── page.tsx             # Historial de packs (mock)
│   │       └── pack/
│   │           └── [id]/
│   │               └── page.tsx     # Vista de pack con capítulos (mock)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Eyebrow.tsx
│   │   │   ├── Capsule.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Glow.tsx
│   │   │   └── ScribbleBrain.tsx
│   │   ├── AppNav.tsx               # Nav compartido (logo, Precios, Login)
│   │   ├── LoginModal.tsx           # Modal "Próximamente"
│   │   └── Footer.tsx               # Footer compartido
│   ├── lib/
│   │   └── mock-data.ts             # Packs mockeados del dashboard
│   ├── public/assets/               # Imágenes existentes
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── postcss.config.js
│
└── backend/
    ├── src/
    │   └── index.ts                 # Express server + POST /diagnostico
    ├── package.json
    └── tsconfig.json
```

---

## Sub-proyecto 1: Landing + Pricing

### Landing (`/`)

La landing actual se refina con estos cambios:

**AppNav** (compartido, extraído a `components/AppNav.tsx`):
- Logo Aliis (imagen + wordmark en Instrument Serif)
- Link "Precios" → `/precios`
- Botón "Iniciar sesión" → abre `LoginModal`
- Sticky con backdrop blur, igual al actual

**LoginModal** (`components/LoginModal.tsx`):
- Modal centrado sobre overlay oscuro semitransparente
- Título: "Aliis" en Instrument Serif grande
- Subtítulo italic: "Tu asistente de salud cerebral"
- Dos botones deshabilitados con opacity 0.5:
  - "Continuar con Google" (ícono Google SVG)
  - "Continuar con email"
- Badge "Próximamente" en teal sobre los botones
- Botón X para cerrar en esquina superior derecha
- Click fuera del modal cierra

**Hero** (refinado desde el actual):
- Mantiene estructura editorial actual
- Botón "Ver un ejemplo" navega a `/dashboard` (no solo scroll)
- Chips Capsule: "✓ Basado en evidencia" · "✓ Referencias verificables" · "✓ No reemplaza a tu médico"

**WhatAliisDoes**: actualizar a 5 items (del diseño `screen-landing.jsx` — Traduce, Cita, Prepara, Avisa, Aprende)

**TrustSection y Footer**: sin cambios del actual

---

### Pricing (`/precios`)

Página nueva `frontend/app/precios/page.tsx`. Variante SaaS del diseño `screen-precios.jsx`.

**Estructura de la página:**

1. **AppNav** — igual al de landing (con modal login)

2. **Header centrado:**
   - Capsule teal: "💡 14 días gratis · cancelas cuando quieras"
   - H1: "Entiende tu cerebro *por menos que un café al mes.*"
   - Subtítulo sans: "Gratis funciona para un diagnóstico puntual. Pro es para quien convive con el suyo."

3. **Currency switcher + toggle anual** (UI only, sin lógica de descuento anual):
   - Switcher: EUR / USD / MXN (estado local React)
   - Toggle Mensual/Anual con Capsule "-20%" (visual only, sin cambio de precio)

4. **Dos cards de pricing** (grid 1fr 1fr):

   **Aliis Gratis — €0 / $0 / MXN 0:**
   - Badge ghost: "Basado en evidencia"
   - Pitch italic: "Para entender un diagnóstico puntual."
   - Features (8): 1 explicación/semana ✓, Referencias ✓, Leer compartidos ✓, Historial 30 días ✓, Ilimitadas ✗, Audio ✗, Diario ✗, PDF sin marca ✗
   - CTA ghost: "Empezar gratis" → abre LoginModal

   **Aliis Pro — €9.99 / $9.99 / MXN 199 al mes:**
   - Badge teal: "Referencias verificables"
   - Pill "Nuestra recomendación" en top-left
   - Pitch italic: "Para quien convive con su diagnóstico."
   - Features (8): todas ✓ con subtítulos descriptivos
   - CTA primary: "Empezar 14 días gratis" → abre LoginModal
   - Card con `background: var(--c-surface)`, `border: 1px solid var(--c-text)`

5. **Comparison table** (border radius 20, background surface):
   - Header: "Compara todo, sin trampas."
   - 8 filas: Explicaciones/semana · Referencias · Historial · Audio · Compartir · Diario · PDF · Soporte
   - Columnas: Funcionalidad · Gratis · Pro

6. **Trust pillars** (3 columnas, background surface):
   - Evidencia / Límite / Origen — igual al actual TrustSection

7. **FAQ** (grid 2 columnas):
   - 4 preguntas: IA que se inventa / Cancelar / Calidad gratis vs pro / Reemplaza médico

8. **Footer** — igual al de landing

**Datos de pricing** en `lib/mock-data.ts`:
```typescript
export const PRICING_TIERS = {
  gratis: {
    name: "Aliis Gratis",
    prices: { EUR: "€0", USD: "$0", MXN: "MXN 0" },
    cadence: "para siempre",
    pitch: "Para entender un diagnóstico puntual.",
    features: [
      { included: true, text: "1 explicación por semana", sub: "basta para una consulta ocasional" },
      { included: true, text: "Referencias verificables", sub: "cada dato con su fuente" },
      { included: true, text: "Leer explicaciones que te compartan", sub: "sin límite" },
      { included: true, text: "Historial de 30 días", sub: "luego se archivan" },
      { included: false, text: "Explicaciones ilimitadas" },
      { included: false, text: "Audio narrado" },
      { included: false, text: "Diario de síntomas" },
      { included: false, text: "Descarga en PDF sin marca de agua" },
    ],
    cta: "Empezar gratis",
    highlight: false,
  },
  pro: {
    name: "Aliis Pro",
    prices: { EUR: "€9.99", USD: "$9.99", MXN: "MXN 199" },
    cadence: "al mes",
    pitch: "Para quien convive con su diagnóstico.",
    features: [
      { included: true, text: "Explicaciones ilimitadas", sub: "sin contadores, sin fricción" },
      { included: true, text: "Referencias verificables y desplegables", sub: "con DOI, PubMed, guías clínicas" },
      { included: true, text: "Audio narrado en cada explicación", sub: "para caminar o conducir" },
      { included: true, text: "Historial permanente", sub: "búsqueda por síntoma o fármaco" },
      { included: true, text: "Compartir sin límite", sub: "con familiares, pareja, médicos" },
      { included: true, text: "Diario de síntomas", sub: "que tu próxima consulta agradecerá" },
      { included: true, text: "PDF sin marca de agua", sub: "para adjuntar al historial" },
      { included: true, text: "Soporte prioritario", sub: "respondemos en menos de 24h" },
    ],
    cta: "Empezar 14 días gratis",
    highlight: true,
  },
}
```

---

## Sub-proyecto 3: Dashboard del paciente

### Mock data (`lib/mock-data.ts`)

```typescript
export type PackStatus = "Nuevo" | "A medias" | "Leído"
export type PackTint = "teal" | "plum" | "forest" | "bronze"

export interface MockPack {
  id: string
  dx: string
  date: string
  status: PackStatus
  chaptersRead: number
  chaptersTotal: number
  tint: PackTint
  chapters: MockChapter[]
}

export interface MockChapter {
  id: string
  number: string
  title: string
  subtitle: string
  body: string  // HTML string con <p>, <strong>, <em>
  references: MockReference[]
}

export interface MockReference {
  id: string
  label: string
  url: string
}
```

4 packs mockeados:
- `migrana-aura` — Migraña con aura, 24 abr 2026, Nuevo, 0/6 capítulos, tint teal
- `insomnio-cronico` — Insomnio crónico, 03 mar 2026, Leído, 5/5, tint plum
- `vertigo-vppb` — Vértigo posicional (VPPB), 17 feb 2026, A medias, 3/5, tint forest
- `temblor-esencial` — Temblor esencial, 22 ene 2026, Leído, 5/5, tint bronze

El pack `migrana-aura` tiene 6 capítulos con contenido completo (reutilizando el pack generado por la API en el MVP actual).

---

### Dashboard (`/dashboard`)

`frontend/app/dashboard/page.tsx` — Client component.

**Estructura:**
1. AppNav con `user={{ initial: "M" }}` mockeado
2. Header: Eyebrow "· Mis explicaciones ·" + H1 "Lo que has entendido, *junto.*" + botón "Nueva explicación" → `/`
3. Filter chips (estado local, solo visual — no filtra datos realmente): Todos · Sin leer · A medias · Compartidos · Este año. El activo tiene `background: var(--c-invert)`.
4. Grid `repeat(auto-fit, minmax(300px, 1fr))` de PackCard
5. Empty state al fondo con ScribbleBrain + botón "Empezar nueva explicación" → `/`

**PackCard:**
- Header con gradiente de color por tint (120px altura):
  - Gradientes: teal `#14606E→#1F8A9B`, plum `#1e1b2e→#2d1f3d`, forest `#0f1a12→#1a2e1f`, bronze `#1a1200→#2e2200`
  - Fecha en top-left (font-mono, blanco)
  - Status badge en top-right (blanco si Leído/A medias, casi-blanco sólido si Nuevo)
  - Barra de progreso en bottom (segmentos, blanco/transparente)
- Body: H3 con diagnosis en Instrument Serif + "X/Y capítulos · Abrir →" en font-mono
- Click navega a `/dashboard/pack/[id]`

---

### Vista de pack (`/dashboard/pack/[id]`)

`frontend/app/dashboard/pack/[id]/page.tsx` — Client component. Lee `params.id`, busca en mock data.

**Layout dos columnas (sidebar + main):**

**Sidebar izquierda** (260px, sticky):
- Back link "← Mis explicaciones" → `/dashboard`
- Título del pack en Instrument Serif
- Lista de capítulos: número + título, el activo con `background: var(--c-surface)` y borde izquierdo teal
- Progreso global (X/Y capítulos leídos)

**Área principal:**
- Eyebrow con número de capítulo (01, 02…)
- H1 en Instrument Serif grande
- Subtítulo italic en text-muted
- Cuerpo en sans 16px, line-height 1.75
- Sección de referencias desplegables (accordion): cada referencia con label + URL
- Navegación prev/next en footer del capítulo

**Estado activo:** primer capítulo por defecto. Click en sidebar cambia capítulo (estado local). Marcar como leído al abrir cada capítulo (estado local del array de leídos).

---

## Backend Express

`backend/src/index.ts`:

```typescript
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const client = new Anthropic()  // ANTHROPIC_API_KEY desde env

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

app.post('/diagnostico', async (req, res) => {
  // Misma lógica que el route.ts actual
  // req.body: { diagnostico: string, contexto?: string }
  // res: DiagnosticoResponse JSON
})

app.listen(process.env.PORT || 3001)
```

`backend/package.json` deps: `express`, `cors`, `@anthropic-ai/sdk`, `@types/express`, `@types/cors`, `typescript`, `tsx` (dev runner), `dotenv`.

El frontend actualiza `fetch` de `/api/diagnostico` a `process.env.NEXT_PUBLIC_API_URL + '/diagnostico'`.

---

## Reorganización del monorepo

El paso inicial es mover los archivos actuales de `/Aliis` a `/Aliis/frontend/`:
- `app/` → `frontend/app/`
- `public/` → `frontend/public/`
- `package.json`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js` → `frontend/`
- Eliminar `app/api/` (se mueve al backend)

El `.env.local` existente se mueve a `frontend/.env.local` y se añade `NEXT_PUBLIC_API_URL=http://localhost:3001`.

---

## Lo que NO está en este spec

- Supabase Auth (sub-proyecto 2)
- Stripe / paywall (sub-proyecto 4)
- Funcionalidad real de filtros en dashboard
- Audio narrado
- Compartir packs
- Diario de síntomas
- Mobile breakpoints optimizados (responsive básico sí)
