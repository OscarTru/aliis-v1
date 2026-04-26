# Entiende tu Diagnóstico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una web app Next.js 15 donde pacientes hispanohablantes ingresan un diagnóstico neurológico y reciben un pack educativo personalizado generado por Claude Haiku.

**Architecture:** Single-route stateless app. Una API route POST `/api/diagnostico` recibe el diagnóstico, llama a `claude-haiku-4-5-20251001` con un system prompt especializado, extrae el JSON de la respuesta con regex y lo retorna. El componente `page.tsx` maneja tres estados (idle/loading/result) y renderiza 8 cards con animación escalonada.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v3, `@anthropic-ai/sdk ^0.39.0`

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---------|----------------|
| `app/layout.tsx` | Metadata SEO, fuente Inter, html/body wrapper |
| `app/globals.css` | Reset, animaciones fadeInUp y shimmer, clases de delay |
| `app/page.tsx` | UI completa: navbar, hero, formulario, chips, estados loading/result |
| `app/api/diagnostico/route.ts` | Validación, llamada a Claude Haiku, extracción JSON, respuesta |
| `package.json` | Dependencias del proyecto |
| `next.config.ts` | Configuración mínima de Next.js |
| `tailwind.config.ts` | Configuración de Tailwind con content paths |
| `postcss.config.js` | Plugins de PostCSS para Tailwind |
| `tsconfig.json` | Configuración TypeScript |
| `.env.local.example` | Plantilla de variables de entorno |

---

## Task 1: Scaffolding del proyecto Next.js

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `tsconfig.json`
- Create: `.env.local.example`

- [ ] **Step 1: Crear package.json**

```json
{
  "name": "entiende-tu-diagnostico",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "next": "15.3.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "postcss": "^8",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Crear next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
```

- [ ] **Step 3: Crear tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

- [ ] **Step 4: Crear postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Crear tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Crear .env.local.example**

```
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 7: Instalar dependencias**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
npm install
```

Expected: `node_modules/` creado, sin errores.

- [ ] **Step 8: Commit**

```bash
git init
git add package.json next.config.ts tailwind.config.ts postcss.config.js tsconfig.json .env.local.example
git commit -m "feat: scaffold Next.js 15 project with Tailwind and Anthropic SDK"
```

---

## Task 2: Estilos globales y animaciones

**Files:**
- Create: `app/globals.css`

- [ ] **Step 1: Crear app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

html {
  font-family: 'Inter', sans-serif;
}

body {
  background-color: #0f0f1a;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease forwards;
}

.delay-1 { animation-delay: 0.1s; opacity: 0; }
.delay-2 { animation-delay: 0.2s; opacity: 0; }
.delay-3 { animation-delay: 0.3s; opacity: 0; }
.delay-4 { animation-delay: 0.4s; opacity: 0; }
.delay-5 { animation-delay: 0.5s; opacity: 0; }
.delay-6 { animation-delay: 0.6s; opacity: 0; }
.delay-7 { animation-delay: 0.7s; opacity: 0; }
.delay-8 { animation-delay: 0.8s; opacity: 0; }

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add global styles, animations, and shimmer effect"
```

---

## Task 3: Layout raíz con metadata SEO

**Files:**
- Create: `app/layout.tsx`

- [ ] **Step 1: Crear app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Entiende tu diagnóstico · Cerebros Esponjosos',
  description:
    'Tu médico te dio un diagnóstico y no quedó del todo claro. Aquí lo desglosamos en lenguaje humano — con evidencia real, sin jerga innecesaria.',
  openGraph: {
    title: 'Entiende tu diagnóstico · Cerebros Esponjosos',
    description:
      'Escribe tu diagnóstico y recibe un pack educativo personalizado en lenguaje humano.',
    siteName: 'Cerebros Esponjosos',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0f0f1a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add root layout with SEO metadata"
```

---

## Task 4: API Route — validación y llamada a Claude Haiku

**Files:**
- Create: `app/api/diagnostico/route.ts`

- [ ] **Step 1: Crear app/api/diagnostico/route.ts**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body inválido' }, { status: 400 })
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('diagnostico' in body) ||
    typeof (body as Record<string, unknown>).diagnostico !== 'string'
  ) {
    return NextResponse.json(
      { error: 'El campo "diagnostico" es requerido y debe ser texto' },
      { status: 400 }
    )
  }

  const { diagnostico, contexto } = body as { diagnostico: string; contexto?: string }

  const diagnosticoTrimmed = diagnostico.trim()
  if (!diagnosticoTrimmed) {
    return NextResponse.json(
      { error: 'El diagnóstico no puede estar vacío' },
      { status: 400 }
    )
  }
  if (diagnosticoTrimmed.length > 500) {
    return NextResponse.json(
      { error: 'El diagnóstico no puede superar los 500 caracteres' },
      { status: 400 }
    )
  }

  const contextoTrimmed = typeof contexto === 'string' ? contexto.trim() : ''
  if (contextoTrimmed.length > 300) {
    return NextResponse.json(
      { error: 'El contexto no puede superar los 300 caracteres' },
      { status: 400 }
    )
  }

  const userMessage = contextoTrimmed
    ? `Diagnóstico: ${diagnosticoTrimmed}\n\nContexto: ${contextoTrimmed}`
    : `Diagnóstico: ${diagnosticoTrimmed}`

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No se recibió respuesta del modelo' },
        { status: 500 }
      )
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'El modelo no devolvió un JSON válido' },
        { status: 500 }
      )
    }

    const result: DiagnosticoResponse = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error llamando a Claude:', error)
    return NextResponse.json(
      { error: 'Error al procesar tu diagnóstico. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Verificar que TypeScript no tiene errores**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add app/api/diagnostico/route.ts
git commit -m "feat: add diagnostico API route with Claude Haiku and prompt caching"
```

---

## Task 5: Componente principal — page.tsx

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Crear app/page.tsx**

```typescript
'use client'

import { useState, useRef } from 'react'
import type { DiagnosticoResponse } from './api/diagnostico/route'

const EJEMPLOS = ['Migraña', 'Vértigo', 'Epilepsia', 'Temblor esencial', 'Insomnio']

function BrainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400">
      <path
        d="M12 3C9.5 3 7.5 4.5 7 6.5C5.5 6.5 4 7.8 4 9.5C4 10.5 4.5 11.4 5.2 12C4.5 12.6 4 13.5 4 14.5C4 16.2 5.5 17.5 7 17.5C7.5 19.5 9.5 21 12 21C14.5 21 16.5 19.5 17 17.5C18.5 17.5 20 16.2 20 14.5C20 13.5 19.5 12.6 18.8 12C19.5 11.4 20 10.5 20 9.5C20 7.8 18.5 6.5 17 6.5C16.5 4.5 14.5 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 3V21M7 6.5C8 8 9 9.5 12 10M17 6.5C16 8 15 9.5 12 10M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="h-5 w-40 shimmer rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-full shimmer rounded" />
        <div className="h-4 w-5/6 shimmer rounded" />
        <div className="h-4 w-4/6 shimmer rounded" />
      </div>
    </div>
  )
}

interface SectionCardProps {
  icon?: string
  title: string
  children: React.ReactNode
  className?: string
  delay?: number
}

function SectionCard({ icon, title, children, className = '', delay = 0 }: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up delay-${delay} ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function Home() {
  const [diagnostico, setDiagnostico] = useState('')
  const [contexto, setContexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<DiagnosticoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resultadoRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!diagnostico.trim() || loading) return

    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico, contexto }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error inesperado')
        return
      }

      setResultado(data)
      setTimeout(() => {
        resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch {
      setError('No se pudo conectar. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResultado(null)
    setError(null)
    setDiagnostico('')
    setContexto('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Navbar */}
      <nav className="bg-[#0f0f1a] border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainIcon />
            <span className="font-bold text-purple-400">Cerebros Esponjosos</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-800/60 text-gray-400 border border-white/10">
            Beta
          </span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6">
        {/* Hero */}
        <div className="pt-14 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Información validada · En lenguaje humano
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Entiende tu{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
              diagnóstico
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-base leading-relaxed">
            Tu médico usó términos que no quedaron del todo claros. Escríbelos aquí y te los
            explicamos en lenguaje humano — con evidencia real detrás.
          </p>
        </div>

        {/* Formulario */}
        {!resultado && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                ¿Cuál es tu diagnóstico?
              </label>
              <textarea
                rows={3}
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ej: Migraña con aura, Neuropatía periférica diabética, Epilepsia focal..."
                maxLength={500}
                disabled={loading}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {EJEMPLOS.map((ejemplo) => (
                <button
                  key={ejemplo}
                  type="button"
                  onClick={() => setDiagnostico(ejemplo)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {ejemplo}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Contexto adicional{' '}
                <span className="text-gray-600">(opcional)</span>
              </label>
              <textarea
                rows={2}
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Edad, síntomas que tienes, medicación que te recetaron..."
                maxLength={300}
                disabled={loading}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!diagnostico.trim() || loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analizando...
                </span>
              ) : (
                'Entender mi diagnóstico →'
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </form>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-4 mb-8">
            <p className="text-purple-300 text-sm text-center animate-pulse">
              Analizando tu diagnóstico...
            </p>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Resultados */}
        {resultado && (
          <div ref={resultadoRef} className="space-y-4 mb-12">
            {/* Card 0: Confirmación */}
            <div className="rounded-2xl p-6 bg-purple-900/40 border border-purple-500/20 animate-fade-in-up delay-1">
              <p className="text-xs text-purple-300 mb-1 uppercase tracking-wide font-medium">
                Diagnóstico recibido
              </p>
              <p className="text-white font-semibold text-lg">
                {resultado.diagnostico_recibido}
              </p>
            </div>

            {/* Card 1: Qué es */}
            <SectionCard icon="🔍" title="¿Qué es esto, exactamente?" className="bg-white" delay={2}>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {resultado.que_es}
              </p>
            </SectionCard>

            {/* Card 2: Cómo funciona */}
            <SectionCard icon="⚙️" title="¿Cómo funciona por dentro?" className="bg-white" delay={3}>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {resultado.como_funciona}
              </p>
            </SectionCard>

            {/* Card 3: Qué esperar */}
            <SectionCard icon="📅" title="¿Qué puedes esperar?" className="bg-white" delay={4}>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {resultado.que_esperar}
              </p>
            </SectionCard>

            {/* Card 4: Preguntas para el médico */}
            <SectionCard icon="💬" title="Preguntas para tu próxima consulta" className="bg-white" delay={5}>
              <ol className="space-y-2">
                {resultado.preguntas_para_medico.map((pregunta, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {pregunta}
                  </li>
                ))}
              </ol>
            </SectionCard>

            {/* Card 5: Señales de alarma */}
            <SectionCard
              icon="🚨"
              title="Cuándo buscar atención urgente"
              className="bg-white border-red-100"
              delay={6}
            >
              <ul className="space-y-2">
                {resultado.senales_de_alarma.map((senal, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-red-500 mt-0.5">·</span>
                    {senal}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Card 6: Mito frecuente */}
            <SectionCard icon="💡" title="Algo que mucha gente malentiende" className="bg-white" delay={7}>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {resultado.mito_frecuente}
                </p>
              </div>
            </SectionCard>

            {/* Card 7: Nota final */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-900/30 to-violet-900/20 border border-purple-500/10 animate-fade-in-up delay-8">
              <p className="text-purple-200 text-sm leading-relaxed italic">
                {resultado.nota_final}
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-gray-600 text-xs pb-2">
              Esta información es educativa y no reemplaza tu consulta médica.
            </p>

            {/* Botón reset */}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-colors"
            >
              ← Consultar otro diagnóstico
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add main page with form, chips, loading skeleton, and result cards"
```

---

## Task 6: Verificación final y arranque

**Files:** ninguno nuevo

- [ ] **Step 1: Crear .env.local con la API key**

Copiar `.env.local.example` a `.env.local` y completar con la API key real:

```bash
cp "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/.env.local.example" \
   "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/.env.local"
```

Luego editar `.env.local` y reemplazar `sk-ant-...` con la API key real de Anthropic.

- [ ] **Step 2: Verificar TypeScript sin errores**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
npx tsc --noEmit
```

Expected: sin output (sin errores).

- [ ] **Step 3: Arrancar el servidor de desarrollo**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis"
npm run dev
```

Expected: `▲ Next.js 15.3.1` y `Local: http://localhost:3000`

- [ ] **Step 4: Probar el flujo completo en el navegador**

Abrir `http://localhost:3000` y verificar:

1. La navbar muestra el ícono de cerebro y "Cerebros Esponjosos" en purple
2. El hero muestra el headline con "diagnóstico" en degradado
3. Los chips "Migraña", "Vértigo", "Epilepsia", "Temblor esencial", "Insomnio" aparecen
4. Click en un chip rellena el textarea
5. Presionar "Entender mi diagnóstico →" muestra spinner + skeleton cards
6. Las 8 cards aparecen con animación escalonada
7. El botón "← Consultar otro diagnóstico" resetea el formulario correctamente

- [ ] **Step 5: Crear .gitignore**

```bash
cat > "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/.gitignore" << 'EOF'
# dependencies
node_modules/

# Next.js
.next/
out/

# environment variables
.env.local
.env.*.local

# misc
.DS_Store
*.pem
EOF
```

- [ ] **Step 6: Commit final**

```bash
git add .gitignore
git commit -m "feat: add gitignore"
```

---

## Self-review checklist

- [x] **Spec coverage:** Navbar ✓, Hero ✓, Chips simplificados (B) ✓, Formulario con validación ✓, Loading skeleton ✓, 8 cards de resultado ✓, Disclaimer discreto (A) ✓, Botón reset ✓, Modelo `claude-haiku-4-5-20251001` ✓, Prompt caching ✓, Validaciones max chars ✓
- [x] **Sin placeholders:** todos los pasos tienen código completo
- [x] **Consistencia de tipos:** `DiagnosticoResponse` definida en `route.ts` e importada en `page.tsx`, todos los campos usados en las cards coinciden con la interfaz
- [x] **Scope:** un solo plan, un solo deploy
