# Aliis Landing + Pricing + Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current single-page MVP into a multi-route monorepo with a refined landing, pricing page, patient dashboard with mocked packs, pack detail view, and an Express backend extracted from the Next.js API route.

**Architecture:** Monorepo root with `frontend/` (Next.js 15, Vercel) and `backend/` (Express + TypeScript, Railway). Shared UI primitives extracted to `frontend/components/`. The existing `app/api/diagnostico/route.ts` logic moves to `backend/src/index.ts`. Dashboard data is fully mocked via `frontend/lib/mock-data.ts`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v3, CSS custom properties, Instrument Serif + Inter, Express 4, @anthropic-ai/sdk ^0.39, cors, dotenv, tsx (dev runner).

**Working directory context:** Current code lives at `/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis`. All paths in this plan are relative to that root unless stated otherwise.

---

## File map

**Created:**
- `frontend/` — copy of current project files (minus `app/api/`)
- `frontend/components/ui/Eyebrow.tsx`
- `frontend/components/ui/Capsule.tsx`
- `frontend/components/ui/Button.tsx`
- `frontend/components/ui/Glow.tsx`
- `frontend/components/ui/ScribbleBrain.tsx`
- `frontend/components/AppNav.tsx`
- `frontend/components/LoginModal.tsx`
- `frontend/components/Footer.tsx`
- `frontend/lib/mock-data.ts`
- `frontend/app/precios/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dashboard/pack/[id]/page.tsx`
- `backend/src/index.ts`
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.env.example`

**Modified:**
- `frontend/app/page.tsx` — use extracted components, update fetch URL, "Ver un ejemplo" → `/dashboard`
- `frontend/app/layout.tsx` — add `/precios` link context (no change needed, AppNav handles it)

**Deleted:**
- `app/api/diagnostico/route.ts` — moved to backend

---

## Task 1: Monorepo scaffold — move frontend files

**Files:**
- Create: `frontend/` directory structure
- Delete: top-level `app/api/` after copy

- [ ] **Step 1: Create frontend directory and copy files**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
mkdir -p frontend
cp -r app frontend/app
cp -r public frontend/public
cp package.json frontend/package.json
cp package-lock.json frontend/package-lock.json
cp tailwind.config.ts frontend/tailwind.config.ts
cp tsconfig.json frontend/tsconfig.json
cp postcss.config.js frontend/postcss.config.js
cp .env.local frontend/.env.local 2>/dev/null || true
```

- [ ] **Step 2: Remove the API route from frontend (it moves to backend)**

```bash
rm -rf frontend/app/api
```

- [ ] **Step 3: Add NEXT_PUBLIC_API_URL to frontend/.env.local**

Append to `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- [ ] **Step 4: Verify frontend still has correct structure**

```bash
find frontend -type f | grep -v node_modules | sort
```

Expected output includes: `frontend/app/page.tsx`, `frontend/app/globals.css`, `frontend/app/layout.tsx`, `frontend/public/assets/aliis-logo.png`

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "chore: scaffold monorepo — copy frontend files to frontend/"
```

---

## Task 2: Backend Express server

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `backend/.env.example`

- [ ] **Step 1: Create backend/package.json**

```json
{
  "name": "aliis-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.7",
    "tsx": "^4.7.3",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Create backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create backend/.env.example**

```
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
PORT=3001
```

- [ ] **Step 4: Create backend/src/index.ts**

```typescript
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

const SYSTEM_PROMPT = `Eres el agente educativo de Cerebros Esponjosos — un proyecto de divulgación neurológica creado por médicos residentes que hablan con sus pacientes como lo haría un amigo muy informado.

Tu función es recibir un diagnóstico médico y generar un pack educativo personalizado. No eres un médico consultando — eres el puente entre lo que el médico dijo y lo que el paciente puede entender y usar.

---

VOZ Y ESTILO (Cerebros Esponjosos):

PRINCIPIO CENTRAL: Destila, no simplifiques. Extrae la esencia sin perder la profundidad. Un médico y alguien sin formación médica deben leer lo mismo y sentir que fue escrito para ellos.

CÓMO ESCRIBES:
- Conversacional con intención: suena a una conversación inteligente, no a una enciclopedia
- Empiezas desde la experiencia del paciente, nunca desde la definición académica
- Frases cortas: 8-15 palabras como norma. Ritmo variado, como se habla de verdad
- Si usas un término técnico, lo explicas en la misma frase o la siguiente
- Analogías cuando ayudan a entender el MECANISMO, no solo la apariencia
- No moralizas: describes lo que pasa. El paciente llega solo a la conclusión
- Sin adjetivos vacíos: "increíble", "fascinante" — la sustancia habla sola
- Sin enumeraciones secas: las listas tienen narrativa, contexto

EJEMPLOS DEL TONO:
❌ "La neuropatía periférica es una condición que afecta los nervios periféricos..."
✅ "Imagina que los cables que conectan tu cerebro con tus manos y pies empezaron a tener interferencia. No es que el cerebro esté fallando — son los cables."

❌ "Debe evitar el estrés"
✅ "El sistema nervioso tiene capacidad de recuperación que sorprende — pero necesita condiciones. El sueño es cuando consolida la reparación."

---

ESTRUCTURA DE RESPUESTA:
Devuelve SIEMPRE un objeto JSON válido con exactamente esta estructura.
Sin texto antes ni después del JSON:

{
  "diagnostico_recibido": "el diagnóstico tal como lo entendiste, para confirmar",
  "que_es": "2-3 párrafos. Empieza desde lo que el paciente probablemente está sintiendo. Explica qué está pasando en el cuerpo en lenguaje humano.",
  "como_funciona": "el mecanismo real. Usa analogía si ayuda al mecanismo, no solo el resultado. 1-2 párrafos.",
  "que_esperar": "progresión típica, variabilidad, factores que influyen. Sin dramatismo, con realismo. 1-2 párrafos.",
  "preguntas_para_medico": [
    "pregunta concreta y específica",
    "pregunta concreta y específica",
    "pregunta concreta y específica",
    "pregunta concreta y específica",
    "pregunta concreta y específica"
  ],
  "senales_de_alarma": [
    "señal específica de cuándo buscar atención urgente",
    "señal específica",
    "señal específica"
  ],
  "mito_frecuente": "un malentendido común, explicado con el mecanismo real. Empieza con el mito, luego la realidad.",
  "nota_final": "reflexión breve en tono CE: reconforta sin mentir, devuelve agencia al paciente, deja un eco. Máximo 3 frases."
}

---

REGLAS CRÍTICAS:
1. NUNCA diagnosticas ni cuestionas el diagnóstico dado. El médico ya lo hizo.
2. NUNCA reemplazas la consulta médica — complementas.
3. Si el diagnóstico es grave (cáncer, ELA, EM, ictus): tono más calmado, más empático, prioriza orientar al equipo médico.
4. Responde SIEMPRE en español.
5. El JSON debe ser válido. Sin comentarios. Sin texto fuera del JSON.`

export interface DiagnosticoResponse {
  diagnostico_recibido: string
  que_es: string
  como_funciona: string
  que_esperar: string
  preguntas_para_medico: string[]
  senales_de_alarma: string[]
  mito_frecuente: string
  nota_final: string
}

app.post('/diagnostico', async (req, res) => {
  const body = req.body as unknown

  if (
    !body ||
    typeof body !== 'object' ||
    !('diagnostico' in body) ||
    typeof (body as Record<string, unknown>).diagnostico !== 'string'
  ) {
    res.status(400).json({ error: 'El campo "diagnostico" es requerido y debe ser texto' })
    return
  }

  const { diagnostico, contexto } = body as { diagnostico: string; contexto?: string }
  const diagnosticoTrimmed = diagnostico.trim()

  if (!diagnosticoTrimmed) {
    res.status(400).json({ error: 'El diagnóstico no puede estar vacío' })
    return
  }
  if (diagnosticoTrimmed.length > 500) {
    res.status(400).json({ error: 'El diagnóstico no puede superar los 500 caracteres' })
    return
  }

  const contextoTrimmed = typeof contexto === 'string' ? contexto.trim() : ''
  if (contextoTrimmed.length > 300) {
    res.status(400).json({ error: 'El contexto no puede superar los 300 caracteres' })
    return
  }

  const userMessage = contextoTrimmed
    ? `Diagnóstico: ${diagnosticoTrimmed}\n\nContexto: ${contextoTrimmed}`
    : `Diagnóstico: ${diagnosticoTrimmed}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    })

    const textContent = response.content.find((b) => b.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      res.status(500).json({ error: 'No se recibió respuesta del modelo' })
      return
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      res.status(500).json({ error: 'El modelo no devolvió un JSON válido' })
      return
    }

    let result: DiagnosticoResponse
    try {
      result = JSON.parse(jsonMatch[0]) as DiagnosticoResponse
    } catch {
      console.error('JSON malformado del modelo:', jsonMatch[0].slice(0, 200))
      res.status(500).json({ error: 'El modelo devolvió un JSON malformado' })
      return
    }

    res.json(result)
  } catch (error) {
    console.error('Error llamando a Claude:', error)
    res.status(500).json({ error: 'Error al procesar tu diagnóstico. Intenta de nuevo.' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend Aliis escuchando en :${PORT}`))
```

- [ ] **Step 5: Install backend dependencies**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/backend"
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Copy API key to backend**

Create `backend/.env` (not committed):
```
ANTHROPIC_API_KEY=<same value as in frontend/.env.local>
FRONTEND_URL=http://localhost:3000
PORT=3001
```

- [ ] **Step 7: Test backend starts**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/backend"
npm run dev &
sleep 3
curl -s -X POST http://localhost:3001/diagnostico \
  -H "Content-Type: application/json" \
  -d '{"diagnostico":"migraña con aura"}' | head -c 200
```

Expected: JSON response beginning with `{"diagnostico_recibido":` (may take 5-10s for Claude).

- [ ] **Step 8: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add backend/
git commit -m "feat(backend): Express server with POST /diagnostico — extracted from Next.js API route"
```

---

## Task 3: Extract shared UI components

**Files:**
- Create: `frontend/components/ui/Eyebrow.tsx`
- Create: `frontend/components/ui/Capsule.tsx`
- Create: `frontend/components/ui/Button.tsx`
- Create: `frontend/components/ui/Glow.tsx`
- Create: `frontend/components/ui/ScribbleBrain.tsx`

These are extracted verbatim from `frontend/app/page.tsx` and made into named exports.

- [ ] **Step 1: Create frontend/components/ui/Eyebrow.tsx**

```tsx
export function Eyebrow({
  children,
  centered = false,
  style = {},
}: {
  children: React.ReactNode
  centered?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '.22em',
        color: 'var(--c-text-subtle)',
        textAlign: centered ? 'center' : 'left',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create frontend/components/ui/Capsule.tsx**

```tsx
export function Capsule({
  children,
  tone = 'default',
  style = {},
}: {
  children: React.ReactNode
  tone?: 'default' | 'teal' | 'ghost'
  style?: React.CSSProperties
}) {
  const tones = {
    default: { bg: 'var(--c-surface)', fg: 'var(--c-text-muted)', bd: 'var(--c-border)' },
    teal: { bg: 'rgba(31,138,155,.08)', fg: 'var(--c-brand-teal-deep)', bd: 'rgba(31,138,155,.22)' },
    ghost: { bg: 'transparent', fg: 'var(--c-text-subtle)', bd: 'var(--c-border)' },
  }
  const t = tones[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '.18em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 3: Create frontend/components/ui/Button.tsx**

```tsx
export function ButtonPrimary({
  children,
  onClick,
  size = 'md',
  icon,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  icon?: 'arrow'
  disabled?: boolean
}) {
  const pad = { sm: '8px 16px', md: '12px 22px', lg: '14px 28px' }[size]
  const fs = { sm: 13, md: 14, lg: 15 }[size]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: pad,
        background: disabled ? 'var(--c-surface)' : 'var(--c-invert)',
        color: disabled ? 'var(--c-text-faint)' : 'var(--c-invert-fg)',
        border: '1px solid var(--c-border)',
        borderRadius: 999,
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: fs,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity .2s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '.85' }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {children}
      {icon === 'arrow' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

export function ButtonGhost({
  children,
  onClick,
  size = 'md',
  href,
}: {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  href?: string
}) {
  const pad = { sm: '8px 16px', md: '12px 22px', lg: '14px 28px' }[size]
  const fs = { sm: 13, md: 14, lg: 15 }[size]
  const styles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: pad,
    background: 'transparent',
    color: 'var(--c-text)',
    border: '1px solid var(--c-border)',
    borderRadius: 999,
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: fs,
    cursor: 'pointer',
    transition: 'border-color .2s',
    textDecoration: 'none',
  }
  if (href) {
    return (
      <a href={href} style={styles}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-border-strong)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
      >
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} style={styles}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-border-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Create frontend/components/ui/Glow.tsx**

```tsx
export function Glow() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '70%',
          aspectRatio: '1/1',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(31,138,155,0.06),transparent 62%)',
          animation: 'ce-breathe 8s ease-in-out infinite',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 5: Create frontend/components/ui/ScribbleBrain.tsx**

```tsx
export function ScribbleBrain({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden style={{ display: 'block' }}>
      <g stroke="var(--c-brand-scribble)" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28,60 C18,50 18,32 34,26 C40,16 58,14 66,24 C78,18 94,28 92,42 C100,50 98,66 86,72 C86,86 70,94 58,86 C46,94 30,86 30,74 C22,70 22,62 28,60 Z" />
        <path d="M40,42 C48,38 56,44 60,50" opacity=".7" />
        <path d="M66,56 C74,54 80,60 78,66" opacity=".7" />
        <path d="M46,66 C52,70 58,68 62,72" opacity=".6" />
        <path d="M54,30 C58,36 56,44 62,48" opacity=".5" />
        <circle cx="58" cy="58" r="1.8" fill="var(--c-brand-scribble)" stroke="none" opacity=".7" />
        <circle cx="72" cy="48" r="1.2" fill="var(--c-brand-scribble)" stroke="none" opacity=".6" />
        <circle cx="42" cy="56" r="1" fill="var(--c-brand-scribble)" stroke="none" opacity=".5" />
      </g>
    </svg>
  )
}
```

- [ ] **Step 6: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/components/ui/
git commit -m "feat(frontend): extract shared UI primitives to components/ui/"
```

---

## Task 4: AppNav, LoginModal, Footer components

**Files:**
- Create: `frontend/components/AppNav.tsx`
- Create: `frontend/components/LoginModal.tsx`
- Create: `frontend/components/Footer.tsx`

- [ ] **Step 1: Create frontend/components/LoginModal.tsx**

```tsx
'use client'

import { useEffect } from 'react'

export function LoginModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'var(--c-bg)',
          border: '1px solid var(--c-border)',
          borderRadius: 24,
          padding: '48px 40px 40px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 999,
            border: '1px solid var(--c-border)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--c-text-muted)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 36,
              letterSpacing: '-.025em',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            Aliis
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--c-text-muted)',
            }}
          >
            Tu asistente de salud cerebral
          </div>
        </div>

        {/* Próximamente badge */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 20,
            padding: '8px 16px',
            background: 'rgba(31,138,155,.08)',
            border: '1px solid rgba(31,138,155,.22)',
            borderRadius: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'var(--c-brand-teal-deep)',
          }}
        >
          Próximamente · En desarrollo
        </div>

        {/* Disabled auth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.45 }}>
          <button
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '13px 20px',
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 12,
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--c-text)',
              cursor: 'not-allowed',
              width: '100%',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <button
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '13px 20px',
              background: 'var(--c-invert)',
              border: '1px solid var(--c-invert)',
              borderRadius: 12,
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--c-invert-fg)',
              cursor: 'not-allowed',
              width: '100%',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Continuar con email
          </button>
        </div>

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--c-text-faint)',
          }}
        >
          Aliis no comparte tus datos. Nunca.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create frontend/components/AppNav.tsx**

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LoginModal } from './LoginModal'

export function AppNav({
  user,
}: {
  user?: { initial: string }
}) {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'color-mix(in srgb, var(--c-bg) 78%, transparent)',
          borderBottom: '1px solid var(--c-border)',
        }}
      >
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            gap: 24,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
            }}
          >
            <Image
              src="/assets/aliis-logo.png"
              alt="Aliis"
              width={30}
              height={30}
              style={{ objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 19,
                letterSpacing: '-.02em',
                color: 'var(--c-text)',
              }}
            >
              Aliis
            </span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              href="/precios"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--c-text-muted)',
                textDecoration: 'none',
              }}
            >
              Precios
            </Link>

            {user ? (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: 'var(--c-brand-teal-light)',
                  color: 'var(--c-brand-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {user.initial}
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: '1px solid var(--c-border)',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: 'var(--c-text)',
                  cursor: 'pointer',
                  transition: 'border-color .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-border-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
```

- [ ] **Step 3: Create frontend/components/Footer.tsx**

```tsx
import Image from 'next/image'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--c-border)', padding: '72px 24px 36px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 32,
            marginBottom: 48,
          }}
        >
          <div style={{ maxWidth: '28rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Image src="/assets/aliis-logo.png" alt="Aliis" width={40} height={40} style={{ objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, letterSpacing: '-.02em', color: 'var(--c-text)' }}>
                Aliis
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--c-text-faint)', margin: 0, lineHeight: 1.55 }}>
              Tu AI Assistant de salud cerebral. Un producto de Cerebros Esponjosos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 56, fontFamily: 'var(--font-sans)', fontSize: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 4 }}>
                Producto
              </div>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="/precios">Precios</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="/dashboard">Ver ejemplo</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 4 }}>
                Cerebros Esponjosos
              </div>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Instagram</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Newsletter</a>
            </div>
          </div>
        </div>
        <div
          style={{
            paddingTop: 24,
            borderTop: '1px solid var(--c-border)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '.2em',
            color: 'var(--c-text-faint)',
          }}
        >
          <span>© 2026 · Cerebros Esponjosos</span>
          <span>Aliis no sustituye a tu neurólogo</span>
          <span>Basado en evidencia</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/components/
git commit -m "feat(frontend): AppNav with login modal, LoginModal placeholder, Footer"
```

---

## Task 5: Mock data

**Files:**
- Create: `frontend/lib/mock-data.ts`

- [ ] **Step 1: Create frontend/lib/mock-data.ts**

```typescript
export type PackStatus = 'Nuevo' | 'A medias' | 'Leído'
export type PackTint = 'teal' | 'plum' | 'forest' | 'bronze'

export interface MockReference {
  id: string
  label: string
  url: string
}

export interface MockChapter {
  id: string
  number: string
  title: string
  subtitle: string
  body: string
  references: MockReference[]
}

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

export const TINT_GRADIENTS: Record<PackTint, string> = {
  teal: 'linear-gradient(135deg,#14606E,#1F8A9B)',
  plum: 'linear-gradient(135deg,#1e1b2e,#2d1f3d)',
  forest: 'linear-gradient(135deg,#0f1a12,#1a2e1f)',
  bronze: 'linear-gradient(135deg,#1a1200,#2e2200)',
}

export const MOCK_PACKS: MockPack[] = [
  {
    id: 'migrana-aura',
    dx: 'Migraña con aura',
    date: '24 abr 2026',
    status: 'Nuevo',
    chaptersRead: 0,
    chaptersTotal: 6,
    tint: 'teal',
    chapters: [
      {
        id: 'que-es',
        number: '01',
        title: 'Qué es',
        subtitle: 'y por qué pasa.',
        body: `La migraña con aura es una cefalea que viene anunciada. Antes del dolor, el cerebro genera señales que puedes ver, sentir o escuchar — las llaman aura. No es peligroso en sí mismo, pero sí es la forma que tiene tu sistema nervioso de decirte que algo está a punto de pasar.\n\nEl aura ocurre porque una ola de actividad eléctrica recorre la corteza cerebral, seguida de una fase de calma. Ese contraste —activación y silencio— es lo que genera los fenómenos visuales típicos: luces en zigzag, puntos ciegos, líneas brillantes. En la mayoría de casos dura 20-60 minutos y desaparece sola.\n\nLo que sientes después —el dolor pulsátil, la sensibilidad a la luz y el sonido, las náuseas— es la fase de cefalea propiamente dicha. Son dos procesos distintos que ocurren en secuencia.`,
        references: [
          { id: 'ref1', label: 'Headache Classification Committee, ICHD-3 (2018)', url: 'https://doi.org/10.1177/0333102417738202' },
          { id: 'ref2', label: 'Viana M et al. Cephalalgia 2022', url: 'https://pubmed.ncbi.nlm.nih.gov/35441554' },
        ],
      },
      {
        id: 'como-funciona',
        number: '02',
        title: 'Cómo funciona',
        subtitle: 'por dentro.',
        body: `Imagina que la corteza visual de tu cerebro es una pradera seca. El aura empieza como una chispa que prende en un punto y se propaga lentamente —a unos 3 milímetros por minuto— hacia los bordes. Esa ola se llama depresión cortical propagada.\n\nLo interesante es que "depresión" aquí no significa tristeza: es una reducción de la actividad eléctrica. Las neuronas se silencian mientras la ola pasa, y ese silencio temporal es lo que genera los síntomas visuales. Cuando la ola termina, la actividad vuelve —y ahí empieza el dolor.\n\nEl sumatriptán que te recetaron actúa en los receptores de serotonina de los vasos cerebrales. Los contrae cuando se han dilatado en exceso durante la fase de cefalea, y eso reduce el dolor. Por eso funciona mejor tomado pronto: cuando la inflamación ya está instalada, cuesta más revertirla.`,
        references: [
          { id: 'ref3', label: 'Lauritzen M. Physiol Rev 1994', url: 'https://pubmed.ncbi.nlm.nih.gov/7938227' },
        ],
      },
      {
        id: 'que-esperar',
        number: '03',
        title: 'Qué puedes esperar',
        subtitle: 'en el tiempo.',
        body: `La frecuencia varía mucho entre personas. Hay quienes tienen una crisis al año y quienes las tienen cada semana. Los factores que más influyen son el sueño irregular, el estrés sostenido, los cambios hormonales y ciertos alimentos —aunque la relación con la dieta es más débil de lo que se suele decir.\n\nCon tratamiento preventivo adecuado (y el topiramato que te recetaron entra en esa categoría), la mayoría de personas reduce la frecuencia a la mitad o más en los primeros tres meses. No es una cura, pero sí un cambio real en la calidad de vida.`,
        references: [
          { id: 'ref4', label: 'Silberstein SD et al. Neurology 2012', url: 'https://pubmed.ncbi.nlm.nih.gov/22529202' },
        ],
      },
      {
        id: 'preguntas',
        number: '04',
        title: 'Preguntas para',
        subtitle: 'tu próxima consulta.',
        body: `1. ¿A qué dosis tengo que llegar con el topiramato, y en cuántas semanas?\n2. ¿Con cuántas crisis al mes considerarías que el tratamiento funciona?\n3. ¿Qué hago si el sumatriptán no me hace efecto en la primera dosis?\n4. ¿Hay algún desencadenante específico que deba registrar en mi diario?\n5. ¿Cuándo debería volver antes de los 6 meses si algo cambia?`,
        references: [],
      },
      {
        id: 'alarmas',
        number: '05',
        title: 'Cuándo buscar',
        subtitle: 'atención urgente.',
        body: `El dolor de cabeza "en trueno" —el más intenso de tu vida, que llega en segundos— siempre requiere valoración urgente, aunque tengas migraña de base.\n\nTambién si el aura dura más de 60 minutos, si aparecen síntomas nuevos como debilidad en un lado del cuerpo o dificultad para hablar, o si tienes fiebre además del dolor.\n\nFuera de esos casos, una migraña con aura típica —la que ya conoces— no es una emergencia, aunque sea muy incapacitante.`,
        references: [
          { id: 'ref5', label: 'Ducros A. Lancet Neurol 2012', url: 'https://pubmed.ncbi.nlm.nih.gov/22571124' },
        ],
      },
      {
        id: 'mito',
        number: '06',
        title: 'Algo que mucha gente',
        subtitle: 'malentiende.',
        body: `El mito más común: "el aura significa que tengo riesgo de ictus". La realidad es más matizada. Las personas con migraña con aura tienen un riesgo cardiovascular ligeramente elevado en términos estadísticos, pero ese riesgo en términos absolutos es muy bajo —especialmente si no fumas y no tomas anticonceptivos orales combinados. Tu neurólogo ya lo ha valorado. Si te lo recetó igualmente, es porque el balance riesgo-beneficio sale a tu favor.`,
        references: [
          { id: 'ref6', label: 'Kurth T et al. BMJ 2016', url: 'https://doi.org/10.1136/bmj.i2610' },
        ],
      },
    ],
  },
  {
    id: 'insomnio-cronico',
    dx: 'Insomnio crónico',
    date: '03 mar 2026',
    status: 'Leído',
    chaptersRead: 5,
    chaptersTotal: 5,
    tint: 'plum',
    chapters: [
      { id: 'que-es', number: '01', title: 'Qué es', subtitle: 'el insomnio crónico.', body: 'El insomnio crónico es la dificultad persistente para iniciar o mantener el sueño, con consecuencias durante el día, durante al menos tres meses.', references: [] },
      { id: 'como-funciona', number: '02', title: 'Cómo funciona', subtitle: 'el ciclo del insomnio.', body: 'El insomnio se perpetúa porque la cama se asocia con vigilia y alerta. La TCC-I actúa sobre esa asociación condicionada.', references: [] },
      { id: 'que-esperar', number: '03', title: 'Qué puedes esperar', subtitle: 'con tratamiento.', body: 'La TCC-I tiene mejor resultado a largo plazo que los hipnóticos. Los primeros 2-3 meses son los más difíciles.', references: [] },
      { id: 'preguntas', number: '04', title: 'Preguntas para', subtitle: 'tu médico.', body: '1. ¿Me recomiendas un programa de TCC-I digital o con terapeuta?\n2. ¿Cuánto tiempo debo mantener la restricción de sueño?', references: [] },
      { id: 'alarmas', number: '05', title: 'Señales de alerta', subtitle: 'a tener en cuenta.', body: 'Si aparece somnolencia excesiva durante el día que te impide funcionar, o si el insomnio se acompaña de ronquidos intensos, vale la pena descartar apnea.', references: [] },
    ],
  },
  {
    id: 'vertigo-vppb',
    dx: 'Vértigo posicional (VPPB)',
    date: '17 feb 2026',
    status: 'A medias',
    chaptersRead: 3,
    chaptersTotal: 5,
    tint: 'forest',
    chapters: [
      { id: 'que-es', number: '01', title: 'Qué es', subtitle: 'el VPPB.', body: 'El vértigo posicional benigno paroxístico es la causa más común de vértigo. Ocurre cuando cristales de carbonato de calcio del oído interno se desplazan a los canales semicirculares.', references: [] },
      { id: 'como-funciona', number: '02', title: 'Cómo funciona', subtitle: 'el oído interno.', body: 'Los canales semicirculares detectan rotación. Cuando un cristal (otolito) entra en uno de ellos, el cerebro recibe señales de movimiento que no corresponden a la realidad — y eso genera el vértigo.', references: [] },
      { id: 'que-esperar', number: '03', title: 'Qué puedes esperar', subtitle: 'con las maniobras.', body: 'La maniobra de Epley resuelve el VPPB en una o dos sesiones en el 80% de los casos. Las recurrencias son frecuentes pero igual de tratables.', references: [] },
      { id: 'preguntas', number: '04', title: 'Preguntas para', subtitle: 'tu médico.', body: '1. ¿Puedo hacer la maniobra yo solo en casa?\n2. ¿Hay ejercicios de Brandt-Daroff que me recomiendas?', references: [] },
      { id: 'alarmas', number: '05', title: 'Señales de alerta', subtitle: 'que no son VPPB.', body: 'Vértigo con dolor de cabeza intenso, visión doble, dificultad para caminar o hablar requiere valoración urgente — puede ser origen central, no del oído.', references: [] },
    ],
  },
  {
    id: 'temblor-esencial',
    dx: 'Temblor esencial',
    date: '22 ene 2026',
    status: 'Leído',
    chaptersRead: 5,
    chaptersTotal: 5,
    tint: 'bronze',
    chapters: [
      { id: 'que-es', number: '01', title: 'Qué es', subtitle: 'el temblor esencial.', body: 'El temblor esencial es el trastorno del movimiento más frecuente. Es un temblor de acción —aparece al hacer cosas, no en reposo— que afecta principalmente las manos y la voz.', references: [] },
      { id: 'como-funciona', number: '02', title: 'Cómo funciona', subtitle: 'el circuito del temblor.', body: 'Hay un circuito entre el cerebelo y el tálamo que oscila con una frecuencia de 4-12 Hz. En el temblor esencial ese circuito está ligeramente desregulado.', references: [] },
      { id: 'que-esperar', number: '03', title: 'Qué puedes esperar', subtitle: 'a largo plazo.', body: 'Progresa lentamente. El propranolol y el primidona son los fármacos de primera línea y funcionan en el 50-70% de personas. No es Parkinson — son enfermedades distintas.', references: [] },
      { id: 'preguntas', number: '04', title: 'Preguntas para', subtitle: 'tu médico.', body: '1. ¿A qué dosis empieza el propranolol y cómo la subo?\n2. ¿Hay alguna situación en que deba tomar la dosis extra?', references: [] },
      { id: 'alarmas', number: '05', title: 'Señales de alerta', subtitle: 'que cambiarían el diagnóstico.', body: 'Si el temblor aparece también en reposo, si hay lentitud de movimientos o rigidez, o si cambia tu forma de caminar — cuéntaselo a tu neurólogo. Esos síntomas juntos orientan hacia otra causa.', references: [] },
    ],
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/lib/
git commit -m "feat(frontend): mock data for dashboard — 4 packs with full chapter content"
```

---

## Task 6: Update frontend/app/page.tsx

**Files:**
- Modify: `frontend/app/page.tsx`

Replace the existing `page.tsx` with a version that:
1. Imports `AppNav`, `Footer` from `components/`
2. Imports primitives from `components/ui/`
3. Updates fetch URL to use `process.env.NEXT_PUBLIC_API_URL`
4. Changes "Ver un ejemplo" button `href` to `/dashboard`
5. Updates `WhatAliisDoes` to 5 items (adds "Aprende contigo")

- [ ] **Step 1: Update imports and fetch URL in frontend/app/page.tsx**

Replace the top of the file (lines 1-10) with:

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { AppNav } from '../components/AppNav'
import { Footer } from '../components/Footer'
import { Eyebrow } from '../components/ui/Eyebrow'
import { Capsule } from '../components/ui/Capsule'
import { ButtonPrimary, ButtonGhost } from '../components/ui/Button'
import { Glow } from '../components/ui/Glow'
import { ScribbleBrain } from '../components/ui/ScribbleBrain'
import type { DiagnosticoResponse } from '../lib/types'

const EJEMPLOS = ['Migraña con aura', 'Vértigo posicional', 'Epilepsia focal', 'Temblor esencial', 'Insomnio crónico']
```

- [ ] **Step 2: Create frontend/lib/types.ts with DiagnosticoResponse**

Since `app/api/` was removed, the type must live in `lib/`:

```typescript
export interface DiagnosticoResponse {
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

- [ ] **Step 3: Update fetch URL in handleSubmit**

In `handleSubmit`, change:
```tsx
const res = await fetch('/api/diagnostico', {
```
to:
```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const res = await fetch(`${API_URL}/diagnostico`, {
```

- [ ] **Step 4: Update Hero "Ver un ejemplo" button**

In the `Hero` component, change:
```tsx
<ButtonGhost size="lg">Cómo funciona</ButtonGhost>
```
to:
```tsx
<ButtonGhost size="lg" href="/dashboard">Ver un ejemplo</ButtonGhost>
```

- [ ] **Step 5: Remove inline AppNav and Footer — use imported ones**

In `Home()`, replace `<AppNav onReset={handleReset} />` with:
```tsx
<AppNav />
```

Replace `<Footer />` with the imported `<Footer />` (no props needed).

Remove the inline `AppNav`, `Footer` function definitions from `page.tsx` — they now live in `components/`.

- [ ] **Step 6: Update WhatAliisDoes to 5 items**

Replace the `items` array in `WhatAliisDoes`:

```tsx
const items = [
  { n: '01', t: 'Traduce', i: 'lo que te dijeron', d: 'Del lenguaje médico al tuyo. Sin inflar, sin asustar. Pensado para que lo lea un familiar que nunca abrió un libro de medicina.' },
  { n: '02', t: 'Cita sus fuentes,', i: 'siempre', d: 'Cada afirmación lleva su referencia desplegable. PubMed, DOI, guías clínicas oficiales. Si no hay evidencia, Aliis te lo dice.' },
  { n: '03', t: 'Prepara tu próxima', i: 'consulta', d: 'Cinco preguntas que importan, escritas para que las copies tal cual. Aliis estudia tu diagnóstico y sugiere qué contarle al neurólogo.' },
  { n: '04', t: 'Te avisa', i: 'cuando algo no cuadra', d: 'Señales de alarma sin alarmismo. Cuándo vuelves a urgencias, cuándo llamas, cuándo respiras y esperas a la cita.' },
  { n: '05', t: 'Aprende', i: 'contigo', d: 'Guarda tus diagnósticos, cruza síntomas, recuerda fármacos. Cada pregunta nueva llega con el contexto de todas las anteriores.' },
]
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/app/page.tsx frontend/lib/types.ts
git commit -m "feat(frontend): update landing page — use shared components, new API URL, 5-item WhatAliisDoes"
```

---

## Task 7: Pricing page

**Files:**
- Create: `frontend/app/precios/page.tsx`

- [ ] **Step 1: Create frontend/app/precios/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { AppNav } from '../../components/AppNav'
import { Footer } from '../../components/Footer'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { Capsule } from '../../components/ui/Capsule'
import { LoginModal } from '../../components/LoginModal'
import { PRICING_TIERS } from '../../lib/mock-data'

type Currency = 'EUR' | 'USD' | 'MXN'

const COMPARISON_ROWS = [
  ['Explicaciones por semana', '1', 'Ilimitadas'],
  ['Referencias verificables', '✓', '✓ con DOI desplegable'],
  ['Historial', '30 días', 'Permanente'],
  ['Audio narrado', '—', '✓'],
  ['Compartir', '3 por explicación', 'Sin límite'],
  ['Diario de síntomas', '—', '✓'],
  ['PDF sin marca de agua', '—', '✓'],
  ['Soporte prioritario', '—', '✓'],
]

const FAQ = [
  {
    q: '¿Cómo sé que la IA no se inventa cosas?',
    a: 'Cada afirmación de cada explicación va con su referencia desplegable — PubMed, DOI, guías clínicas. Si una fuente no existe o no soporta la frase, el sistema no la escribe.',
  },
  {
    q: '¿Qué pasa si cancelo?',
    a: 'Tus explicaciones siguen ahí hasta 30 días. Si vuelves antes, retomas donde estabas. Después se archivan.',
  },
  {
    q: '¿Las explicaciones gratis son peores?',
    a: 'No. Son las mismas explicaciones, con las mismas referencias. La diferencia es cuántas puedes crear, el audio y el historial largo.',
  },
  {
    q: '¿Esto reemplaza a mi médico?',
    a: 'Nunca. Es lo que te prepara para ir a tu médico con mejores preguntas. Aparece como disclaimer en cada pantalla.',
  },
]

export default function PreciosPage() {
  const [currency, setCurrency] = useState<Currency>('EUR')
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '72px 24px 120px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <Capsule tone="teal">💡 14 días gratis · cancelas cuando quieras</Capsule>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem,5vw,3.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-.02em',
            margin: '0 0 14px',
          }}>
            Entiende tu cerebro{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>por menos que un café al mes.</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--c-text-muted)', maxWidth: '54ch', margin: '0 auto' }}>
            Gratis funciona para un diagnóstico puntual. Pro es para quien convive con el suyo.
          </p>
        </div>

        {/* Currency switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 999 }}>
            {(['EUR', 'USD', 'MXN'] as Currency[]).map((c) => (
              <button key={c} onClick={() => setCurrency(c)}
                style={{
                  background: currency === c ? 'var(--c-invert)' : 'transparent',
                  color: currency === c ? 'var(--c-invert-fg)' : 'var(--c-text-muted)',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '.15em',
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, marginBottom: 56 }}>
          {([PRICING_TIERS.gratis, PRICING_TIERS.pro] as const).map((tier) => (
            <article key={tier.name}
              style={{
                position: 'relative',
                padding: '36px 36px 40px',
                background: tier.highlight ? 'var(--c-surface)' : 'transparent',
                border: `1px solid ${tier.highlight ? 'var(--c-text)' : 'var(--c-border)'}`,
                borderRadius: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tier.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: 32,
                  padding: '4px 12px',
                  background: 'var(--c-text)', color: 'var(--c-bg)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
                }}>
                  Nuestra recomendación
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <Capsule tone={tier.highlight ? 'teal' : 'ghost'}>
                  {tier.highlight ? 'Referencias verificables' : 'Basado en evidencia'}
                </Capsule>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', margin: '0 0 8px', lineHeight: 1.05 }}>
                {tier.name}
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--c-text-muted)', margin: '0 0 24px' }}>
                {tier.pitch}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 52, letterSpacing: '-.03em', lineHeight: 1 }}>
                  {tier.prices[currency]}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
                  {tier.cadence}
                </span>
              </div>

              <div style={{ margin: '24px 0', height: 1, background: 'var(--c-border)' }} />

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: f.included ? 1 : 0.4 }}>
                    <span style={{ flexShrink: 0, marginTop: 4, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {f.included ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--c-brand-teal-deep)" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                          <path d="M3 7.5L6 10.5 11.5 4.5" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                          <path d="M2 2l6 6M8 2l-6 6" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.4 }}>{f.text}</div>
                      {f.sub && (
                        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--c-text-faint)', marginTop: 2 }}>
                          {f.sub}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '13px 20px',
                  borderRadius: 12,
                  background: tier.highlight ? 'var(--c-invert)' : 'transparent',
                  color: tier.highlight ? 'var(--c-invert-fg)' : 'var(--c-text)',
                  border: `1px solid ${tier.highlight ? 'var(--c-invert)' : 'var(--c-border)'}`,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {tier.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </article>
          ))}
        </div>

        {/* Comparison table */}
        <div style={{ border: '1px solid var(--c-border)', borderRadius: 20, overflow: 'hidden', background: 'var(--c-surface)', marginBottom: 56 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, margin: 0 }}>Compara todo, sin trampas.</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--c-bg)' }}>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-subtle)' }}>Funcionalidad</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-subtle)' }}>Gratis</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text)' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '14px 24px' }}>{r[0]}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--c-text-muted)' }}>{r[1]}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500 }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trust pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, padding: 40, background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 20, marginBottom: 56 }}>
          {[
            { eyebrow: 'Evidencia', title: 'Basado en evidencia científica', body: 'Cada afirmación con su referencia. Desplegables para comprobar.' },
            { eyebrow: 'Límite', title: 'No reemplaza a tu médico', body: 'Disclaimer visible siempre. Es preparación, no diagnóstico.' },
            { eyebrow: 'Origen', title: 'Por Cerebros Esponjosos', body: 'La misma voz que ya sigues. La misma obsesión por explicar bien.' },
          ].map((p, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 14 }}>· {p.eyebrow} ·</div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.25, letterSpacing: '-.01em', margin: '0 0 10px' }}>{p.title}</h4>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.65, color: 'var(--c-text-muted)', margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, textAlign: 'center', marginBottom: 32 }}>Preguntas frecuentes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28 }}>
            {FAQ.map((f, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 8, lineHeight: 1.35 }}>{f.q}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', lineHeight: 1.65 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
```

- [ ] **Step 2: Add `prices` and `features` types to mock-data.ts**

The `PRICING_TIERS` object in mock-data.ts needs to be accessed in pricing page. Verify the type exported matches what the page uses: `tier.prices[currency]` and `tier.features[i].included`, `tier.features[i].text`, `tier.features[i].sub`.

These are already defined in Task 5 Step 1. No changes needed.

- [ ] **Step 3: TypeScript check**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/app/precios/
git commit -m "feat(frontend): pricing page — SaaS variant with currency switcher, comparison table, FAQ"
```

---

## Task 8: Dashboard — historial de packs

**Files:**
- Create: `frontend/app/dashboard/page.tsx`

- [ ] **Step 1: Create frontend/app/dashboard/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '../../components/AppNav'
import { Footer } from '../../components/Footer'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { ButtonPrimary } from '../../components/ui/Button'
import { ScribbleBrain } from '../../components/ui/ScribbleBrain'
import { MOCK_PACKS, TINT_GRADIENTS, type MockPack } from '../../lib/mock-data'

const FILTERS = ['Todos', 'Sin leer', 'A medias', 'Compartidos', 'Este año'] as const

function PackCard({ pack, onClick }: { pack: MockPack; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--c-surface)',
        border: `1px solid ${hovered ? 'var(--c-border-strong)' : 'var(--c-border)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color .2s',
      }}
    >
      {/* Color header */}
      <div style={{ position: 'relative', height: 130, background: TINT_GRADIENTS[pack.tint], overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.55),transparent 70%)' }} />
        <span style={{ position: 'absolute', top: 14, left: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', color: 'rgba(255,255,255,.85)' }}>
          {pack.date.toUpperCase()}
        </span>
        <span style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase',
          background: pack.status === 'Nuevo' ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.16)',
          color: pack.status === 'Nuevo' ? 'var(--c-brand-ink)' : '#fff',
          backdropFilter: 'blur(6px)',
          borderRadius: 999,
        }}>
          {pack.status}
        </span>
        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display: 'flex', gap: 3 }}>
          {Array.from({ length: pack.chaptersTotal }).map((_, j) => (
            <div key={j} style={{ flex: 1, height: 3, borderRadius: 2, background: j < pack.chaptersRead ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)' }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 22px 24px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.2, letterSpacing: '-.01em', margin: '0 0 10px' }}>
          {pack.dx}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)' }}>
          <span>{pack.chaptersRead}/{pack.chaptersTotal} capítulos</span>
          <span>Abrir →</span>
        </div>
      </div>
    </article>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState(0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav user={{ initial: 'M' }} />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '60px 24px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 48 }}>
          <div>
            <Eyebrow style={{ marginBottom: 16 }}>· Mis explicaciones ·</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem,5vw,3.5rem)', lineHeight: 1.04, letterSpacing: '-.025em', margin: 0 }}>
              Lo que has entendido,{' '}
              <em style={{ color: 'var(--c-text-faint)' }}>junto.</em>
            </h1>
          </div>
          <ButtonPrimary icon="arrow" onClick={() => router.push('/')}>
            Nueva explicación
          </ButtonPrimary>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {FILTERS.map((f, i) => (
            <button key={f} onClick={() => setActiveFilter(i)}
              style={{
                padding: '7px 14px',
                background: i === activeFilter ? 'var(--c-invert)' : 'transparent',
                color: i === activeFilter ? 'var(--c-invert-fg)' : 'var(--c-text-muted)',
                border: `1px solid ${i === activeFilter ? 'var(--c-invert)' : 'var(--c-border)'}`,
                borderRadius: 999,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Pack grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {MOCK_PACKS.map((p) => (
            <PackCard key={p.id} pack={p} onClick={() => router.push(`/dashboard/pack/${p.id}`)} />
          ))}
        </div>

        {/* Empty state CTA */}
        <div style={{ marginTop: 64, padding: '40px 24px', textAlign: 'center', border: '1px dashed var(--c-border-strong)', borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <ScribbleBrain size={56} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 16 }}>
            ¿Saliste hoy de consulta?{' '}
            <em style={{ color: 'var(--c-text-faint)' }}>Pégalo ya, mientras está fresco.</em>
          </div>
          <ButtonPrimary size="sm" icon="arrow" onClick={() => router.push('/')}>
            Empezar nueva explicación
          </ButtonPrimary>
        </div>
      </div>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/app/dashboard/page.tsx
git commit -m "feat(frontend): dashboard — pack history with filter chips and pack cards"
```

---

## Task 9: Pack detail view with chapter sidebar

**Files:**
- Create: `frontend/app/dashboard/pack/[id]/page.tsx`

- [ ] **Step 1: Create frontend/app/dashboard/pack/[id]/page.tsx**

```tsx
'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '../../../../components/AppNav'
import { Eyebrow } from '../../../../components/ui/Eyebrow'
import { MOCK_PACKS, type MockChapter } from '../../../../lib/mock-data'

export default function PackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const pack = MOCK_PACKS.find((p) => p.id === id)

  const [activeChapterId, setActiveChapterId] = useState<string>(pack?.chapters[0]?.id ?? '')
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set())

  if (!pack) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 16 }}>Pack no encontrado</div>
          <button onClick={() => router.push('/dashboard')}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-brand-teal)', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Volver al historial
          </button>
        </div>
      </div>
    )
  }

  const activeChapter = pack.chapters.find((c) => c.id === activeChapterId) ?? pack.chapters[0]
  const activeIndex = pack.chapters.findIndex((c) => c.id === activeChapterId)

  function openChapter(chapter: MockChapter) {
    setActiveChapterId(chapter.id)
    setReadChapters((prev) => new Set([...prev, chapter.id]))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalRead = readChapters.size

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav user={{ initial: 'M' }} />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '48px 24px 100px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 80 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Mis explicaciones
          </button>

          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.2, letterSpacing: '-.015em', marginBottom: 8 }}>
            {pack.dx}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 24 }}>
            {totalRead}/{pack.chapters.length} leídos
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 28 }}>
            {pack.chapters.map((c) => (
              <div key={c.id} style={{ flex: 1, height: 3, borderRadius: 2, background: readChapters.has(c.id) ? 'var(--c-brand-teal)' : 'var(--c-border)' }} />
            ))}
          </div>

          {/* Chapter list */}
          <nav>
            {pack.chapters.map((chapter) => {
              const isActive = chapter.id === activeChapterId
              const isRead = readChapters.has(chapter.id)
              return (
                <button key={chapter.id} onClick={() => openChapter(chapter)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 12px',
                    background: isActive ? 'var(--c-surface)' : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? 'var(--c-brand-teal)' : 'transparent'}`,
                    borderRadius: '0 8px 8px 0',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 2,
                    transition: 'background .15s',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.18em', color: isActive ? 'var(--c-brand-teal)' : 'var(--c-text-faint)', flexShrink: 0, width: 20 }}>
                    {chapter.number}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)', lineHeight: 1.35, flex: 1 }}>
                    {chapter.title}
                  </span>
                  {isRead && !isActive && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-brand-teal)" strokeWidth="2.5" aria-hidden>
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow style={{ marginBottom: 20 }}>Capítulo {activeChapter.number}</Eyebrow>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.05, letterSpacing: '-.025em', margin: '0 0 10px' }}>
            {activeChapter.title}
          </h1>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--c-text-muted)', marginBottom: 48 }}>
            {activeChapter.subtitle}
          </div>

          {/* Body */}
          <div>
            {activeChapter.body.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.8, color: 'var(--c-text)', margin: '0 0 20px' }}>
                {para}
              </p>
            ))}
          </div>

          {/* References accordion */}
          {activeChapter.references.length > 0 && (
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--c-border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-subtle)', marginBottom: 16 }}>
                Referencias
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeChapter.references.map((ref) => (
                  <a key={ref.id} href={ref.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: 'var(--c-surface)',
                      border: '1px solid var(--c-border)',
                      borderRadius: 10,
                      textDecoration: 'none',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      color: 'var(--c-text-muted)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-brand-teal)" strokeWidth="2" aria-hidden flexShrink={0}>
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                    {ref.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Prev / Next navigation */}
          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            {activeIndex > 0 ? (
              <button onClick={() => openChapter(pack.chapters[activeIndex - 1])}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid var(--c-border)', borderRadius: 999, padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
                {pack.chapters[activeIndex - 1].title}
              </button>
            ) : <div />}

            {activeIndex < pack.chapters.length - 1 && (
              <button onClick={() => openChapter(pack.chapters[activeIndex + 1])}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--c-invert)', border: '1px solid var(--c-invert)', borderRadius: 999, padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-invert-fg)', marginLeft: 'auto' }}>
                {pack.chapters[activeIndex + 1].title}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/app/dashboard/
git commit -m "feat(frontend): pack detail view — sidebar chapter navigation with read tracking"
```

---

## Task 10: Frontend install, dev test, and final cleanup

**Files:**
- Modify: `frontend/app/layout.tsx` — verify no reference to deleted API route type

- [ ] **Step 1: Install frontend deps in new location**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npm install
```

Expected: `node_modules/` created.

- [ ] **Step 2: Start frontend dev server**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npm run dev -- --port 3000 &
sleep 5
curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>'
```

Expected: `<title>Aliis · Entiende tu diagnóstico neurológico</title>`

- [ ] **Step 3: Check /precios renders**

```bash
curl -s http://localhost:3000/precios | grep -o 'café al mes' | head -1
```

Expected: `café al mes`

- [ ] **Step 4: Check /dashboard renders**

```bash
curl -s http://localhost:3000/dashboard | grep -o 'Migraña con aura' | head -1
```

Expected: `Migraña con aura`

- [ ] **Step 5: Check /dashboard/pack/migrana-aura renders**

```bash
curl -s http://localhost:3000/dashboard/pack/migrana-aura | grep -o 'depresión cortical' | head -1
```

Expected: `depresión cortical`

- [ ] **Step 6: Start backend dev server and test end-to-end**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/backend"
npm run dev &
sleep 3
curl -s -X POST http://localhost:3001/diagnostico \
  -H "Content-Type: application/json" \
  -d '{"diagnostico":"temblor esencial"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('diagnostico_recibido','FAIL'))"
```

Expected: something like `Temblor esencial` (Claude's interpretation).

- [ ] **Step 7: Final TypeScript check on frontend**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend"
npx tsc --noEmit 2>&1
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
git add frontend/
git commit -m "chore: verify frontend installs and all routes render correctly"
```

---

## Self-Review

**Spec coverage check:**

- ✅ Monorepo structure `frontend/` + `backend/` — Task 1 + 2
- ✅ Backend Express POST /diagnostico — Task 2
- ✅ Shared UI primitives extracted — Task 3
- ✅ AppNav with "Precios" link + "Iniciar sesión" → LoginModal — Task 4
- ✅ LoginModal placeholder "Próximamente" — Task 4
- ✅ Footer shared — Task 4
- ✅ Mock data 4 packs with full chapter content — Task 5
- ✅ Landing updated: fetch URL, "Ver un ejemplo" → /dashboard, 5-item WhatAliisDoes — Task 6
- ✅ DiagnosticoResponse type moved to lib/types.ts — Task 6
- ✅ Pricing page SaaS: currency switcher, 2 cards, comparison table, trust pillars, FAQ — Task 7
- ✅ Dashboard with filter chips, pack card grid, empty state — Task 8
- ✅ Pack detail view: sidebar with chapters, read tracking, prev/next nav, references — Task 9
- ✅ End-to-end smoke test — Task 10

**Placeholder scan:** No TBDs found.

**Type consistency:**
- `MockPack.tint` is `PackTint` — used consistently in dashboard and mock-data
- `PRICING_TIERS.gratis.prices[currency]` — `currency` typed as `'EUR' | 'USD' | 'MXN'`, matches `prices` object keys
- `DiagnosticoResponse` moved to `frontend/lib/types.ts` — imported in `page.tsx` from correct path
- `params` in Next.js 15 pack detail page is `Promise<{id: string}>` — unwrapped with `use()` ✅
