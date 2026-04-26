# Flujo de Generación de Packs Mejorado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the pack generation flow with a combobox diagnosis selector, 4 contextual questions, library-augmented AI generation, and an optional tools chapter.

**Architecture:** The frontend `/ingreso` gains a combobox that fuzzy-matches against the library and passes `conditionSlug` to the backend. The backend gains a `library-resolver` module that loads curated content into the generator prompt. The AI returns an optional `tools[]` array rendered as a virtual chapter in PackView.

**Tech Stack:** Next.js App Router, cmdk (combobox), motion/react (animations), Supabase, Express backend, Anthropic claude-opus-4-7, TypeScript.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `frontend/lib/fuzzy-search.ts` | Shared `normalize()` + `levenshtein()` + `fuzzyMatch()` |
| Modify | `frontend/components/ConditionList.tsx` | Import from fuzzy-search.ts instead of inline |
| Create | `frontend/components/ComboboxDiagnostico.tsx` | Diagnosis input with library suggestions |
| Modify | `frontend/app/(shell)/ingreso/page.tsx` | 4-step flow (dx combobox → para → emocion → dudas) |
| Modify | `frontend/lib/types.ts` | Add `Tool`, extend `Pack` with `conditionSlug`+`tools` |
| Modify | `frontend/components/PackView.tsx` | "Leer más" pill in chapter header + herramientas virtual chapter |
| Modify | `frontend/app/(shell)/pack/[id]/page.tsx` | Use `row.condition_slug` instead of ilike lookup |
| Create | `backend/src/lib/fuzzy-search.ts` | Same normalize+levenshtein+fuzzyMatch (duplicated intentionally) |
| Create | `backend/src/lib/library-resolver.ts` | `resolveLibraryMatch()` + `formatSectionContent()` |
| Modify | `backend/src/types.ts` | Add `Tool`, extend `GeneratedPack` + `GeneratePackRequest` |
| Modify | `backend/src/lib/enricher.ts` | Add `emocion`, remove `frecuencia`, add `acompanando` to `para` |
| Modify | `backend/src/lib/generator.ts` | Accept `libraryMatch?`, extend system prompt with FUENTE DE VERDAD + HERRAMIENTAS |
| Modify | `backend/src/routes/pack.ts` | Accept `conditionSlug`, call `resolveLibraryMatch`, persist `condition_slug`+`tools` |

---

## Task 1: Extract fuzzy-search to shared frontend module

The fuzzy search logic currently lives inline in `ConditionList.tsx`. Extract it so `ComboboxDiagnostico.tsx` can reuse it.

**Files:**
- Create: `frontend/lib/fuzzy-search.ts`
- Modify: `frontend/components/ConditionList.tsx`

- [ ] **Step 1: Create `frontend/lib/fuzzy-search.ts`**

```typescript
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

export function fuzzyMatch(q: string, target: string): boolean {
  const nq = normalize(q)
  const nt = normalize(target)
  if (nt.includes(nq)) return true
  const words = nt.split(/\s+/)
  const threshold = Math.floor(nq.length / 4) + 1
  return words.some((w) => {
    if (Math.abs(w.length - nq.length) > threshold) return false
    return levenshtein(nq, w.slice(0, nq.length + threshold)) <= threshold
  })
}
```

- [ ] **Step 2: Update `frontend/components/ConditionList.tsx` to import from the new module**

Replace the three inline functions (lines 20-47) with imports. The top of the file should become:

```typescript
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fuzzyMatch } from '@/lib/fuzzy-search'
```

Remove the `normalize`, `levenshtein`, and `fuzzyMatch` function bodies from `ConditionList.tsx` — they are now imported.

- [ ] **Step 3: Verify the build compiles without errors**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to fuzzy-search or ConditionList.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/fuzzy-search.ts frontend/components/ConditionList.tsx
git commit -m "refactor(frontend): extract fuzzy-search to shared lib module"
```

---

## Task 2: Add Tool type + extend Pack type in frontend

**Files:**
- Modify: `frontend/lib/types.ts`

- [ ] **Step 1: Add `Tool` interface and extend `Pack` in `frontend/lib/types.ts`**

Add after the `Reference` interface (around line 10):

```typescript
export interface Tool {
  title: string
  description: string
}
```

Extend the `Pack` interface (currently ending at `references: Reference[]`) to add two fields:

```typescript
export interface Pack {
  id: string
  dx: string
  for: string
  createdAt: string
  summary: string
  chapters: Chapter[]
  references: Reference[]
  conditionSlug: string | null   // null when no library match
  tools: Tool[]                  // empty array when AI returned none
}
```

- [ ] **Step 2: Verify types compile**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only in files that construct `Pack` objects without the new fields (pack/[id]/page.tsx). That is expected and will be fixed in Task 6.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat(types): add Tool interface + extend Pack with conditionSlug and tools"
```

---

## Task 3: Create ComboboxDiagnostico component

**Files:**
- Create: `frontend/components/ComboboxDiagnostico.tsx`

This component shows a search input with dropdown suggestions pulled from the published library. The parent passes `conditions` pre-loaded server-side.

- [ ] **Step 1: Check whether `cmdk` is installed**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
cat package.json | grep cmdk
```

If `cmdk` is NOT present, install it:

```bash
npm install cmdk
```

- [ ] **Step 2: Create `frontend/components/ComboboxDiagnostico.tsx`**

```typescript
'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { fuzzyMatch } from '@/lib/fuzzy-search'

type ConditionSuggestion = {
  id: string
  slug: string
  name: string
}

type Props = {
  value: string
  onChange: (text: string, conditionSlug: string | null) => void
  conditions: ConditionSuggestion[]
  placeholder?: string
}

const MAX_SUGGESTIONS = 6

export function ComboboxDiagnostico({ value, onChange, conditions, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [displayedValue, setDisplayedValue] = useState(value)

  // Sync displayedValue when parent resets value externally
  useEffect(() => {
    setDisplayedValue(value)
  }, [value])

  const suggestions = useMemo(() => {
    const q = displayedValue.trim()
    if (q.length < 2) return conditions.slice(0, 4)
    return conditions.filter((c) => fuzzyMatch(q, c.name)).slice(0, MAX_SUGGESTIONS)
  }, [displayedValue, conditions])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setDisplayedValue(text)
    setActiveIdx(-1)
    // Debounce the parent onChange for performance
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(text, null)
    }, 150)
  }, [onChange])

  function selectCondition(c: ConditionSuggestion) {
    setDisplayedValue(c.name)
    onChange(c.name, c.slug)
    setOpen(false)
    setActiveIdx(-1)
  }

  function selectFreeText() {
    const text = displayedValue.trim()
    onChange(text, null)
    setOpen(false)
    setActiveIdx(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const total = suggestions.length + 1 // +1 for "Usar texto literal"
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % total)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i - 1 + total) % total)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && activeIdx < suggestions.length) {
        selectCondition(suggestions[activeIdx])
      } else {
        selectFreeText()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={displayedValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Escribe tu diagnóstico o busca en la biblioteca…'}
          className="w-full pl-10 pr-4 py-[14px] rounded-[14px] border border-border bg-muted font-sans text-[15px] text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20 transition-colors placeholder:text-muted-foreground/50"
          autoComplete="off"
        />
      </div>

      <AnimatePresence>
        {open && (suggestions.length > 0 || displayedValue.trim().length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 bg-background border border-border rounded-[14px] shadow-lg overflow-hidden"
          >
            <ul ref={listRef} className="py-1.5">
              {suggestions.map((c, i) => (
                <li key={c.id}>
                  <button
                    onMouseDown={() => selectCondition(c)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors',
                      activeIdx === i ? 'bg-muted' : 'hover:bg-muted/60'
                    )}
                  >
                    <span className="font-sans text-[15px] text-foreground">{c.name}</span>
                    <span className="shrink-0 font-mono text-[9px] tracking-[.15em] uppercase text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full">
                      En biblioteca
                    </span>
                  </button>
                </li>
              ))}
              {displayedValue.trim().length >= 2 && (
                <li>
                  <button
                    onMouseDown={selectFreeText}
                    className={cn(
                      'w-full text-left px-4 py-3 font-sans text-[14px] text-muted-foreground transition-colors border-t border-border',
                      activeIdx === suggestions.length ? 'bg-muted' : 'hover:bg-muted/60'
                    )}
                  >
                    + Usar &ldquo;{displayedValue.trim()}&rdquo; como diagnóstico
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 3: Verify types compile**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
npx tsc --noEmit 2>&1 | grep ComboboxDiagnostico
```

Expected: no errors for this file.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/ComboboxDiagnostico.tsx
git commit -m "feat(frontend): add ComboboxDiagnostico with library fuzzy suggestions"
```

---

## Task 4: Rewrite `/ingreso` page — 4-step flow

Replace the current 3-step flow (dx → frecuencia → dudas) with 4-step flow (dx-combobox → para → emocion → dudas). The generating step is unchanged.

**Files:**
- Modify: `frontend/app/(shell)/ingreso/page.tsx`

The page is a Server Component boundary: it preloads `conditions` from Supabase, then renders the Client Component inline (since the page is already `'use client'`, it stays that way and loads conditions via a server fetch at the top using a separate data-loader approach — but since the page is already `'use client'`, we load conditions client-side on mount using a `useEffect` that calls the Supabase client).

Wait — `app/(shell)/ingreso/page.tsx` is currently `'use client'`. We need `conditions` from Supabase. The cleanest approach: keep it `'use client'`, add a `useEffect` that fetches `conditions` on mount from Supabase client (same pattern as Sidebar). `conditions` is just `id, slug, name` — small payload, fine for client fetch.

- [ ] **Step 1: Replace `frontend/app/(shell)/ingreso/page.tsx` with the 4-step version**

```typescript
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { UpgradeModal } from '@/components/UpgradeModal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ComboboxDiagnostico } from '@/components/ComboboxDiagnostico'

type Step = 'dx' | 'para' | 'emocion' | 'dudas' | 'generating'

type ConditionSuggestion = { id: string; slug: string; name: string }

const STAGES = [
  'Leyendo tu diagnóstico con cuidado…',
  'Entendiendo qué significa esto para ti…',
  'Buscando en fuentes médicas indexadas…',
  'Revisando estudios recientes sobre este tema…',
  'Verificando que las referencias sean reales…',
  'Estructurando una explicación que tenga sentido…',
  'Escribiendo en un lenguaje que puedas leer…',
  'Preparando las preguntas que querrás hacerle a tu médico…',
  'Dándole formato para que sea fácil de navegar…',
  'Revisando que todo esté claro antes de mostrártelo…',
]

const PARA_OPTIONS = [
  { value: 'yo', label: 'Para mí', sub: 'El diagnóstico es mío' },
  { value: 'familiar', label: 'Para un familiar', sub: 'Me lo diagnosticaron a un ser querido' },
  { value: 'acompanando', label: 'Acompañando a alguien', sub: 'Quiero entenderlo para apoyar' },
] as const

const EMOCION_OPTIONS = [
  { value: 'tranquilo', label: 'Tranquilo, con dudas', sub: 'Estoy bien, solo quiero entender' },
  { value: 'asustado', label: 'Asustado', sub: 'Me preocupa lo que esto significa' },
  { value: 'abrumado', label: 'Abrumado', sub: 'Es mucha información de golpe' },
  { value: 'enojado', label: 'Enojado', sub: 'No entiendo por qué me pasó esto' },
]

const DUDAS_OPTIONS = [
  { value: 'Qué esperar', label: 'Qué esperar', sub: 'Evolución y pronóstico' },
  { value: 'Medicamentos', label: 'Mis medicamentos', sub: 'Cómo funcionan y para qué' },
  { value: 'Estilo de vida', label: 'Estilo de vida', sub: 'Alimentación, ejercicio, rutinas' },
  { value: 'Compartir con familia', label: 'Explicárselo a alguien', sub: 'Cómo contárselo' },
  { value: 'Por qué me pasó', label: 'Por qué me pasó esto', sub: 'Causas y factores' },
  { value: 'Día a día', label: 'Cómo afecta mi día a día', sub: 'Trabajo, sueño, energía' },
  { value: 'Cuándo preocuparme', label: 'Cuándo preocuparme', sub: 'Señales de alarma, qué es normal' },
  { value: 'Hablar con médico', label: 'Cómo hablar con mi médico', sub: 'Preguntas que llevar' },
]

export default function IngresoPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('dx')
  const [conditions, setConditions] = useState<ConditionSuggestion[]>([])
  const [dxText, setDxText] = useState('')
  const [conditionSlug, setConditionSlug] = useState<string | null>(null)
  const [para, setPara] = useState<'yo' | 'familiar' | 'acompanando' | ''>('')
  const [emocion, setEmocion] = useState('')
  const [emocionCustom, setEmocionCustom] = useState('')
  const [dudas, setDudas] = useState('')
  const [dudasCustom, setDudasCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingPackId, setPendingPackId] = useState<string | null>(null)
  const [stageIdx, setStageIdx] = useState(0)
  const [stageVisible, setStageVisible] = useState(true)
  const [progressPct, setProgressPct] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const circleRef = useRef<SVGCircleElement>(null)
  const CIRCUMFERENCE = 2 * Math.PI * 18

  // Reset on every mount so "Nuevo diagnóstico" always starts fresh
  useEffect(() => {
    setStep('dx')
    setDxText('')
    setConditionSlug(null)
    setPara('')
    setEmocion('')
    setEmocionCustom('')
    setDudas('')
    setDudasCustom('')
    setPendingPackId(null)
    setStageIdx(0)
    setStageVisible(true)
    setProgressPct(0)
  }, [])

  // Load conditions for combobox
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('conditions')
      .select('id, slug, name')
      .eq('published', true)
      .order('name')
      .then(({ data }) => setConditions(data ?? []))
  }, [])

  const startProgress = useCallback(() => {
    setProgressPct(0)
    startTimeRef.current = performance.now()

    function tick(now: number) {
      const elapsed = (now - startTimeRef.current) / 1000
      const pct = 88 * (1 - Math.exp(-elapsed / 18))
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct / 100))
      }
      if (Math.round(elapsed * 4) % 1 === 0) {
        setProgressPct(Math.round(pct))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [CIRCUMFERENCE])

  const completeProgress = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (circleRef.current) circleRef.current.style.strokeDashoffset = '0'
    setProgressPct(100)
  }, [])

  useEffect(() => {
    if (step !== 'generating') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    setStageIdx(0)
    setStageVisible(true)
    setProgressPct(0)
    startProgress()
    const interval = setInterval(() => {
      setStageVisible(false)
      setTimeout(() => {
        setStageIdx((i) => (i + 1) % STAGES.length)
        setStageVisible(true)
      }, 350)
    }, 4000)
    return () => {
      clearInterval(interval)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [step, startProgress])

  useEffect(() => {
    if (!pendingPackId) return
    const supabase = createClient()
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('packs')
        .select('id')
        .eq('id', pendingPackId)
        .single()
      if (data) {
        clearInterval(poll)
        completeProgress()
        setTimeout(() => router.push(`/pack/${pendingPackId}`), 400)
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [pendingPackId, router, completeProgress])

  function emocionFinal() {
    return emocion === '__custom' ? emocionCustom.trim() : emocion
  }

  function dudasFinal() {
    return dudas === '__custom' ? dudasCustom.trim() : dudas
  }

  async function handleGenerate() {
    const d = dudasFinal()
    if (!d || !para) return
    setLoading(true)
    setStep('generating')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      const userPlan = profile?.plan ?? 'free'

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/pack/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnostico: dxText,
          conditionSlug: conditionSlug ?? undefined,
          contexto: {
            para,
            emocion: emocionFinal() || undefined,
            dudas: d,
          },
          userId: user.id,
          userPlan,
        }),
      })

      if (!res.ok) { setStep('dudas'); return }

      const data = await res.json() as {
        limitReached?: boolean
        emergencyResponse?: string
        blockedReason?: string
        blockedMessage?: string
        pack?: { id: string }
      }

      if (data.limitReached) { setShowUpgrade(true); setStep('dudas'); return }
      if (data.pack?.id) { setPendingPackId(data.pack.id); return }
      setStep('dudas')
    } catch {
      setStep('dudas')
    } finally {
      setLoading(false)
    }
  }

  // Chip component used by para, emocion, dudas steps
  function Chip({
    value: optValue, label, sub, selected, onClick,
  }: { value: string; label: string; sub: string; selected: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'px-5 py-4 rounded-[14px] cursor-pointer text-left border-2 flex items-center justify-between gap-3 transition-[border-color,background] duration-150',
          selected ? 'border-primary bg-primary/5' : 'border-border bg-muted'
        )}
      >
        <div>
          <div className="font-sans text-[15px] font-medium text-foreground mb-[2px]">{label}</div>
          <div className="font-sans text-[13px] text-muted-foreground">{sub}</div>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Check size={10} color="white" strokeWidth={3} />
          </div>
        )}
      </button>
    )
  }

  return (
    <>
      <div className={cn(step === 'generating' ? 'flex items-center justify-center min-h-screen' : 'max-w-[560px] mx-auto px-6 pt-12 pb-20')}>

        {/* ── Step 1: diagnóstico (combobox) ── */}
        {step === 'dx' && (
          <div className="ce-fade">
            <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
              Paso 1 de 4
            </p>
            <h1 className="font-serif leading-[1.15] tracking-[-0.025em] mb-2 text-[clamp(26px,5vw,38px)]">
              ¿Qué te dijo tu médico?
            </h1>
            <p className="font-sans text-[15px] text-muted-foreground mb-8 leading-relaxed">
              Escribe el diagnóstico, copia lo que dice tu receta, o busca en nuestra biblioteca.
            </p>

            <ComboboxDiagnostico
              value={dxText}
              onChange={(text, slug) => {
                setDxText(text)
                setConditionSlug(slug)
              }}
              conditions={conditions}
            />

            <Button
              onClick={() => { if (dxText.trim()) setStep('para') }}
              disabled={!dxText.trim()}
              className={cn(
                'w-full mt-4 py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                dxText.trim()
                  ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                  : 'bg-border text-muted-foreground cursor-not-allowed'
              )}
            >
              Continuar →
            </Button>
          </div>
        )}

        {/* ── Step 2: para quién ── */}
        {step === 'para' && (
          <div className="ce-fade">
            <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
              Paso 2 de 4
            </p>
            <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
              ¿Para quién es este pack?
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground mb-7 leading-relaxed">
              Adaptamos el tono según quién lo va a leer.
            </p>

            <div className="flex flex-col gap-[10px] mb-5">
              {PARA_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={para === opt.value}
                  onClick={() => setPara(opt.value)}
                />
              ))}
            </div>

            <Button
              onClick={() => { if (para) setStep('emocion') }}
              disabled={!para}
              className={cn(
                'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                para
                  ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                  : 'bg-border text-muted-foreground cursor-not-allowed'
              )}
            >
              Continuar →
            </Button>

            <button
              onClick={() => setStep('dx')}
              className="mt-3 w-full bg-transparent border-none font-sans text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* ── Step 3: emoción ── */}
        {step === 'emocion' && (
          <div className="ce-fade">
            <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
              Paso 3 de 4
            </p>
            <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
              ¿Cómo te sientes con este diagnóstico?
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground mb-7 leading-relaxed">
              Queremos que la explicación llegue en el momento correcto.
            </p>

            <div className="flex flex-col gap-[10px] mb-5">
              {EMOCION_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={emocion === opt.value}
                  onClick={() => { setEmocion(opt.value); setEmocionCustom('') }}
                />
              ))}

              <button
                onClick={() => { setEmocion('__custom'); setEmocionCustom('') }}
                className={cn(
                  'px-5 py-[14px] rounded-[14px] cursor-pointer text-left border-2 font-sans text-[14px] text-muted-foreground transition-[border-color,background] duration-150',
                  emocion === '__custom' ? 'border-primary bg-primary/5' : 'border-border bg-muted'
                )}
              >
                Otro…
              </button>
              {emocion === '__custom' && (
                <Input
                  autoFocus
                  value={emocionCustom}
                  onChange={(e) => setEmocionCustom(e.target.value)}
                  placeholder="Cuéntame cómo te sientes…"
                  className="h-12 rounded-[12px] border-primary bg-muted font-sans text-[15px] focus-visible:ring-primary/20"
                />
              )}
            </div>

            <Button
              onClick={() => { if (emocionFinal()) setStep('dudas') }}
              disabled={!emocionFinal()}
              className={cn(
                'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                emocionFinal()
                  ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                  : 'bg-border text-muted-foreground cursor-not-allowed'
              )}
            >
              Continuar →
            </Button>

            <button
              onClick={() => setStep('para')}
              className="mt-3 w-full bg-transparent border-none font-sans text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* ── Step 4: dudas ── */}
        {step === 'dudas' && (
          <div className="ce-fade">
            <p className="font-serif italic text-[13px] text-muted-foreground mb-3 tracking-[.04em] uppercase">
              Paso 4 de 4
            </p>
            <h2 className="font-serif leading-[1.2] tracking-[-0.02em] mb-2 text-[clamp(22px,4vw,32px)]">
              ¿Qué te gustaría entender mejor?
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground mb-7 leading-relaxed">
              Aliis enfocará la explicación en lo que más te importa.
            </p>

            <div className="flex flex-col gap-[10px] mb-5">
              {DUDAS_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={dudas === opt.value}
                  onClick={() => { setDudas(opt.value); setDudasCustom('') }}
                />
              ))}

              <button
                onClick={() => { setDudas('__custom'); setDudasCustom('') }}
                className={cn(
                  'px-5 py-[14px] rounded-[14px] cursor-pointer text-left border-2 font-sans text-[14px] text-muted-foreground transition-[border-color,background] duration-150',
                  dudas === '__custom' ? 'border-primary bg-primary/5' : 'border-border bg-muted'
                )}
              >
                Tengo otra pregunta…
              </button>
              {dudas === '__custom' && (
                <Input
                  autoFocus
                  value={dudasCustom}
                  onChange={(e) => setDudasCustom(e.target.value)}
                  placeholder="¿Qué quieres entender?"
                  className="h-12 rounded-[12px] border-primary bg-muted font-sans text-[15px] focus-visible:ring-primary/20"
                />
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!dudasFinal() || loading}
              className={cn(
                'w-full py-[14px] h-auto rounded-[12px] font-sans text-[15px] font-medium transition-[background,box-shadow] duration-150',
                dudasFinal()
                  ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                  : 'bg-border text-muted-foreground cursor-not-allowed'
              )}
            >
              {loading ? 'Preparando tu diagnóstico…' : 'Generar mi diagnóstico'}
            </Button>

            <button
              onClick={() => setStep('emocion')}
              className="mt-3 w-full bg-transparent border-none font-sans text-[13px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* ── Generating ── */}
        {step === 'generating' && (
          <div className="ce-fade flex flex-col items-center justify-center gap-8 min-h-[60vh] w-full">
            <div className="flex items-end gap-[6px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-[11px] h-[11px] rounded-[3px] bg-primary"
                  style={{ animation: `aliis-bounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
                />
              ))}
            </div>

            <div className="text-center px-6">
              <Eyebrow>· Trabajando en tu explicación ·</Eyebrow>
              <h2
                aria-live="polite"
                className="font-serif text-[20px] tracking-[-0.02em] mt-3 min-h-[56px] flex items-center justify-center transition-opacity duration-300"
                style={{ opacity: stageVisible ? 1 : 0 }}
              >
                {STAGES[stageIdx]}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <circle
                  ref={circleRef}
                  cx="22" cy="22" r="18" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE}
                />
              </svg>
              <span className="font-mono text-[15px] text-foreground/70 tabular-nums w-12">
                {progressPct}%
              </span>
            </div>

            <p className="font-sans text-[12px] text-muted-foreground/50 tracking-wide">
              Esto toma entre 20 y 40 segundos
            </p>
          </div>
        )}

      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in ingreso/page.tsx.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(shell\)/ingreso/page.tsx
git commit -m "feat(ingreso): rewrite to 4-step flow with ComboboxDiagnostico"
```

---

## Task 5: Backend — SQL migration (add condition_slug + tools columns)

Run the migration against Supabase. This adds two columns to `packs` table: `condition_slug text` and `tools jsonb default '[]'`.

**Files:** None (SQL migration via Supabase MCP)

- [ ] **Step 1: Run migration via Supabase MCP**

Execute this SQL against the project's Supabase database:

```sql
alter table packs add column if not exists condition_slug text;
alter table packs add column if not exists tools jsonb default '[]'::jsonb;
create index if not exists packs_condition_slug_idx on packs(condition_slug) where condition_slug is not null;
```

Use the Supabase MCP tool `execute_sql` or run manually in the Supabase dashboard SQL editor.

- [ ] **Step 2: Verify columns exist**

```sql
select column_name, data_type, column_default
from information_schema.columns
where table_name = 'packs'
  and column_name in ('condition_slug', 'tools');
```

Expected: 2 rows — `condition_slug text null`, `tools jsonb default '[]'`.

- [ ] **Step 3: Commit a migration marker file**

```bash
cat > backend/migrations/20260426_packs_condition_slug_tools.sql << 'EOF'
-- Migration: add condition_slug and tools to packs
alter table packs add column if not exists condition_slug text;
alter table packs add column if not exists tools jsonb default '[]'::jsonb;
create index if not exists packs_condition_slug_idx on packs(condition_slug) where condition_slug is not null;
EOF
git add backend/migrations/20260426_packs_condition_slug_tools.sql
git commit -m "chore(db): migration — add condition_slug and tools columns to packs"
```

---

## Task 6: Backend — fuzzy-search module

Create the backend fuzzy-search module (duplicated from frontend intentionally — two separate `package.json` projects).

**Files:**
- Create: `backend/src/lib/fuzzy-search.ts`

- [ ] **Step 1: Create `backend/src/lib/fuzzy-search.ts`**

```typescript
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

// Returns a score 0..1: 1 = exact match, 0 = no match.
// Threshold: best word score must be >= minScore to be considered a match.
export function fuzzyScore(q: string, target: string): number {
  const nq = normalize(q)
  const nt = normalize(target)
  if (nt === nq) return 1
  if (nt.includes(nq)) return 0.95
  const words = nt.split(/\s+/)
  let best = 0
  for (const w of words) {
    const maxLen = Math.max(nq.length, w.length)
    if (maxLen === 0) continue
    const dist = levenshtein(nq, w)
    const score = 1 - dist / maxLen
    if (score > best) best = score
  }
  return best
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/backend
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/lib/fuzzy-search.ts
git commit -m "feat(backend): add fuzzy-search lib with scored matching"
```

---

## Task 7: Backend — library-resolver module

**Files:**
- Create: `backend/src/lib/library-resolver.ts`

- [ ] **Step 1: Create `backend/src/lib/library-resolver.ts`**

```typescript
import { supabase } from '../index'
import { fuzzyScore } from './fuzzy-search'

export interface MatchedCondition {
  slug: string
  name: string
  sections: Array<{
    slug: string
    title: string
    content: Record<string, unknown>
  }>
}

const MATCH_THRESHOLD = 0.85

function formatSectionContent(content: Record<string, unknown>): string {
  const lines: string[] = []

  const paragraphs = content.paragraphs as string[] | undefined
  if (paragraphs) lines.push(...paragraphs)

  const callout = content.callout as { label?: string; body?: string } | undefined
  if (callout?.body) lines.push(`[${callout.label ?? 'Nota'}] ${callout.body}`)

  const timeline = content.timeline as Array<{ w: string; t: string }> | undefined
  if (timeline) {
    for (const item of timeline) lines.push(`${item.w}: ${item.t}`)
  }

  const questions = content.questions as string[] | undefined
  if (questions) {
    for (const q of questions) lines.push(`- ${q}`)
  }

  const alarms = content.alarms as Array<{ tone: string; t: string; d: string }> | undefined
  if (alarms) {
    for (const a of alarms) lines.push(`[${a.tone === 'red' ? 'URGENTE' : 'CONSULTA PRONTO'}] ${a.t}: ${a.d}`)
  }

  return lines.join('\n')
}

async function loadSections(conditionId: string): Promise<MatchedCondition['sections']> {
  const { data } = await supabase
    .from('condition_sections')
    .select('slug, title, content')
    .eq('condition_id', conditionId)
    .order('order')
  return (data ?? []).map((s: { slug: string; title: string; content: Record<string, unknown> }) => ({
    slug: s.slug,
    title: s.title,
    content: s.content,
  }))
}

export async function resolveLibraryMatch(
  dx: string,
  conditionSlug?: string | null
): Promise<MatchedCondition | null> {
  // Path 1: slug provided by frontend combobox selection — direct lookup
  if (conditionSlug) {
    const { data } = await supabase
      .from('conditions')
      .select('id, slug, name')
      .eq('slug', conditionSlug)
      .eq('published', true)
      .single()
    if (!data) return null
    const sections = await loadSections(data.id)
    return { slug: data.slug, name: data.name, sections }
  }

  // Path 2: free-text dx — fuzzy match with high threshold
  const { data: all } = await supabase
    .from('conditions')
    .select('id, slug, name')
    .eq('published', true)
  if (!all || all.length === 0) return null

  let bestScore = 0
  let bestCondition: { id: string; slug: string; name: string } | null = null

  for (const c of all as Array<{ id: string; slug: string; name: string }>) {
    const score = fuzzyScore(dx, c.name)
    if (score > bestScore) {
      bestScore = score
      bestCondition = c
    }
  }

  if (bestScore < MATCH_THRESHOLD || !bestCondition) return null

  const sections = await loadSections(bestCondition.id)
  return { slug: bestCondition.slug, name: bestCondition.name, sections }
}

export { formatSectionContent }
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/backend
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/lib/library-resolver.ts
git commit -m "feat(backend): add library-resolver — loads curated condition content for augmentation"
```

---

## Task 8: Backend — extend types + enricher

**Files:**
- Modify: `backend/src/types.ts`
- Modify: `backend/src/lib/enricher.ts`

- [ ] **Step 1: Extend `backend/src/types.ts`**

Add `Tool` interface and extend `GeneratedPack` and `GeneratePackRequest`:

```typescript
export interface Tool {
  title: string
  description: string
}

// In GeneratedPack, add tools field:
export interface GeneratedPack {
  summary: string
  chapters: Chapter[]
  references: Reference[]
  tools: Tool[]
}

// In GeneratePackRequest, extend contexto and add conditionSlug:
export interface GeneratePackRequest {
  diagnostico: string
  medicamentos?: string[]
  conditionSlug?: string | null     // NEW
  contexto?: {
    para?: 'yo' | 'familiar' | 'acompanando'  // extended
    emocion?: string                           // NEW
    dudas?: string
    nombre?: string
    // frecuencia REMOVED
  }
  userId: string
  userPlan: 'free' | 'pro'
}
```

- [ ] **Step 2: Update `backend/src/lib/enricher.ts`**

Replace the entire file content:

```typescript
import { supabase } from '../index'

export interface EnrichedContext {
  para: 'yo' | 'familiar' | 'acompanando'
  emocion?: string
  dudas?: string
  nombre: string | null
  previousDx: string[]
}

export async function enrichContext(
  userId: string,
  contexto?: {
    para?: 'yo' | 'familiar' | 'acompanando'
    emocion?: string
    dudas?: string
    nombre?: string
  }
): Promise<EnrichedContext> {
  const [profileResult, packsResult] = await Promise.all([
    supabase.from('profiles').select('name, who').eq('id', userId).single(),
    supabase
      .from('packs')
      .select('dx')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  const profile = profileResult.data
  const previousDx = (packsResult.data ?? []).map((p: { dx: string }) => p.dx)

  return {
    para: contexto?.para ?? (profile?.who as 'yo' | 'familiar' | 'acompanando' | null) ?? 'yo',
    nombre: contexto?.nombre ?? profile?.name ?? null,
    previousDx,
    emocion: contexto?.emocion,
    dudas: contexto?.dudas,
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/backend
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors only in generator.ts (next task) and pack.ts (Task 9) because they still use old signatures.

- [ ] **Step 4: Commit**

```bash
git add backend/src/types.ts backend/src/lib/enricher.ts
git commit -m "feat(backend): extend types — Tool, conditionSlug, emocion; remove frecuencia"
```

---

## Task 9: Backend — extend generator with library augmentation + tools

**Files:**
- Modify: `backend/src/lib/generator.ts`

- [ ] **Step 1: Replace `backend/src/lib/generator.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedPack, Tool } from '../types'
import type { EnrichedContext } from './enricher'
import type { MatchedCondition } from './library-resolver'
import { formatSectionContent } from './library-resolver'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GENERATOR_SYSTEM_BASE = `Eres el agente educativo de Aliis — plataforma creada por médicos residentes de neurología (Cerebros Esponjosos).

Tu función: recibir un diagnóstico médico y generar un pack educativo con 5 capítulos + referencias científicas.

VOZ Y ESTILO:
- Escribe como un médico residente de neurología que es también tu amigo de confianza.
- Empieza siempre desde la experiencia vivida del paciente, nunca desde la definición del libro.
- Frases cortas. Ritmo variado. Una idea por párrafo.
- Cuando uses un término técnico, lo explicas en la misma oración o la siguiente. Sin excepciones.
- Nada de "es importante destacar", "cabe señalar", "en este contexto". Eso es lenguaje de IA, no de persona.
- Las analogías deben ser concretas y visuales: electrodomésticos, tráfico, tuberías, circuitos. No metáforas abstractas.
- Sin adjetivos vacíos: "grave", "importante", "relevante" no dicen nada sin contexto.
- Responde siempre en español.

ESTRUCTURA DE RESPUESTA — JSON estricto, sin texto antes ni después:

{
  "summary": "1-2 frases que capturan la esencia del diagnóstico desde la perspectiva del paciente",
  "chapters": [
    {
      "id": "que-es",
      "n": "01",
      "kicker": "¿Qué es",
      "kickerItalic": "exactamente?",
      "readTime": "3 min",
      "tldr": "Una frase que resume este capítulo en palabras del paciente",
      "paragraphs": ["párrafo 1", "párrafo 2", "párrafo 3"],
      "callout": { "label": "Para imaginarlo así", "body": "analogía concreta y visual del diagnóstico" }
    },
    {
      "id": "como-funciona",
      "n": "02",
      "kicker": "¿Qué pasa",
      "kickerItalic": "en mi cuerpo?",
      "readTime": "4 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "callout": { "label": "La analogía", "body": "metáfora visual del mecanismo fisiopatológico" }
    },
    {
      "id": "que-esperar",
      "n": "03",
      "kicker": "¿Qué",
      "kickerItalic": "esperar?",
      "readTime": "3 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "timeline": [
        { "w": "Primeras semanas", "t": "qué suele pasar al principio" },
        { "w": "1-3 meses", "t": "cambios típicos en este período" },
        { "w": "Largo plazo", "t": "qué esperar con el tiempo" }
      ]
    },
    {
      "id": "preguntas",
      "n": "04",
      "kicker": "¿Qué preguntar",
      "kickerItalic": "en mi consulta?",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "questions": ["¿...?", "¿...?", "¿...?", "¿...?", "¿...?"]
    },
    {
      "id": "senales",
      "n": "05",
      "kicker": "¿Cuándo",
      "kickerItalic": "actuar?",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "alarms": [
        { "tone": "red", "t": "título accionable", "d": "descripción concreta de la señal y qué hacer" },
        { "tone": "amber", "t": "título accionable", "d": "descripción concreta y cuándo llamar al médico" }
      ]
    }
  ],
  "references": [
    {
      "id": 1,
      "authors": "Apellido A, Apellido B",
      "journal": "Nombre revista",
      "year": 2023,
      "doi": "10.xxxx/xxxxxx",
      "quote": "Hallazgo clave de este paper en una frase"
    }
  ],
  "tools": []
}

REGLAS:
1. Exactamente 5 capítulos con los ids: que-es, como-funciona, que-esperar, preguntas, senales
2. callout es OBLIGATORIO en que-es y como-funciona
3. Entre 3 y 5 referencias reales con DOIs válidos (formato 10.xxxx/xxxxxx)
4. Nunca diagnosticas ni cuestionas el diagnóstico dado
5. JSON válido, sin comentarios, sin texto fuera del JSON
6. Nada de lenguaje genérico de IA ("es importante", "cabe destacar", "en conclusión")
7. NUNCA uses el guión largo (—) en ningún texto. Para frases parentéticas usa paréntesis: (así). Para continuar una cláusula usa coma. El guión largo está prohibido sin excepción.`

const TOOLS_SECTION = `
== HERRAMIENTAS PARA EL DÍA A DÍA ==
Además de los 5 capítulos, incluye el campo "tools" en el JSON con un array de herramientas y prácticas concretas que el paciente puede hacer en su día a día para vivir mejor con su diagnóstico.

REGLAS ESTRICTAS para tools:
- SOLO herramientas, prácticas, técnicas no farmacológicas, hábitos concretos
- NUNCA medicamentos, dosis, esquemas de tratamiento, suplementos
- NUNCA pruebas diagnósticas o indicaciones de consultar especialistas
- Cada herramienta = { "title": "título de 3-6 palabras", "description": "descripción concreta de 1-2 frases" }
- Si no hay nada genuino y útil que sugerir para este diagnóstico específico, devuelve "tools": []
- Máximo 4 herramientas. Calidad sobre cantidad.
- Ejemplos VÁLIDOS: "Diario de síntomas", "Técnica de respiración 4-7-8", "Rutina de sueño consistente", "Ejercicio aeróbico moderado"
- Ejemplos INVÁLIDOS: "Tomar ibuprofeno", "Hacerse resonancia magnética", "Consultar neurologo"`

function buildLibrarySection(libraryMatch: MatchedCondition): string {
  const formatted = libraryMatch.sections
    .map((s) => `## ${s.title}\n${formatSectionContent(s.content)}`)
    .join('\n\n')

  return `
== FUENTE DE VERDAD (BIBLIOTECA ALIIS) ==
Este diagnóstico tiene una guía curada por médicos residentes. Úsala como tu fuente de verdad médica: todos los hechos clínicos, mecanismos, evolución típica y señales de alarma deben venir de aquí o ser consistentes con esto. Personaliza el tono y enfoque según el contexto del paciente, pero NO contradigas estos hechos.

CONDICIÓN: ${libraryMatch.name}

CONTENIDO CURADO:
${formatted}`
}

function buildSystemPrompt(libraryMatch?: MatchedCondition | null): string {
  let prompt = GENERATOR_SYSTEM_BASE
  if (libraryMatch) prompt += '\n' + buildLibrarySection(libraryMatch)
  prompt += '\n' + TOOLS_SECTION
  return prompt
}

function isValidGeneratedPack(v: unknown): v is GeneratedPack {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.summary === 'string' &&
    Array.isArray(p.chapters) &&
    p.chapters.length === 5 &&
    Array.isArray(p.references) &&
    (p.tools === undefined || Array.isArray(p.tools))
  )
}

function normalizePack(raw: GeneratedPack): GeneratedPack {
  return {
    ...raw,
    tools: Array.isArray(raw.tools) ? raw.tools.filter(isValidTool) : [],
  }
}

function isValidTool(t: unknown): t is Tool {
  if (!t || typeof t !== 'object') return false
  const obj = t as Record<string, unknown>
  return typeof obj.title === 'string' && typeof obj.description === 'string'
}

export async function generatePack(
  diagnostico: string,
  context: EnrichedContext,
  libraryMatch?: MatchedCondition | null
): Promise<GeneratedPack> {
  const systemPrompt = buildSystemPrompt(libraryMatch)

  const paraLine = context.para === 'familiar'
    ? 'Este pack es para un familiar del paciente.'
    : context.para === 'acompanando'
    ? 'El lector está acompañando a alguien con este diagnóstico.'
    : null

  const userPrompt = [
    `Diagnóstico: ${diagnostico}`,
    context.nombre ? `Paciente: ${context.nombre}` : null,
    paraLine,
    context.emocion ? `Estado emocional del paciente: ${context.emocion}` : null,
    context.dudas ? `Dudas principales: ${context.dudas}` : null,
    context.previousDx.length > 0
      ? `Diagnósticos previos del paciente: ${context.previousDx.join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  async function attempt(): Promise<GeneratedPack> {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    const parsed: unknown = JSON.parse(match[0])
    if (!isValidGeneratedPack(parsed)) throw new Error('Invalid pack structure')

    return normalizePack(parsed as GeneratedPack)
  }

  try {
    return await attempt()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg === 'No JSON in response' || msg === 'Invalid pack structure') {
      return await attempt()
    }
    throw err
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/backend
npx tsc --noEmit 2>&1 | head -20
```

Expected: errors only in pack.ts (fixed in next task).

- [ ] **Step 3: Commit**

```bash
git add backend/src/lib/generator.ts
git commit -m "feat(backend): extend generator with library augmentation and tools generation"
```

---

## Task 10: Backend — update pack route to wire everything together

**Files:**
- Modify: `backend/src/routes/pack.ts`

- [ ] **Step 1: Replace `backend/src/routes/pack.ts`**

```typescript
import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { classifyIntent } from '../lib/classifier'
import { enrichContext } from '../lib/enricher'
import { generatePack } from '../lib/generator'
import { verifyReferences } from '../lib/verifier'
import { resolveLibraryMatch } from '../lib/library-resolver'
import { EMERGENCY_RESPONSE, BLOCKED_MESSAGES } from '../lib/emergency'
import { supabase } from '../index'
import type { GeneratePackRequest } from '../types'

export const packRouter = Router()

function isValidRequest(body: unknown): body is GeneratePackRequest {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.diagnostico === 'string' && (b.diagnostico as string).trim().length > 0 &&
    typeof b.userId === 'string' && (b.userId as string).trim().length > 0 &&
    typeof b.userPlan === 'string' && (b.userPlan as string).trim().length > 0
  )
}

packRouter.post('/generate', async (req, res) => {
  console.log('[pack/generate] body:', JSON.stringify(req.body))
  if (!isValidRequest(req.body)) {
    console.log('[pack/generate] invalid request body')
    res.status(400).json({ error: 'diagnostico, userId y userPlan son requeridos' })
    return
  }

  const { diagnostico, conditionSlug, contexto, userId, userPlan } = req.body
  const dx = diagnostico.trim()

  if (!dx) {
    res.status(400).json({ error: 'El diagnóstico no puede estar vacío' })
    return
  }
  if (dx.length > 500) {
    res.status(400).json({ error: 'El diagnóstico no puede superar 500 caracteres' })
    return
  }

  // Free tier limit: 1 pack per 7 days
  if (userPlan === 'free') {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('packs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since)

    if (countError) {
      res.status(500).json({ error: 'Error comprobando límite de uso.' })
      return
    }
    if ((count ?? 0) >= 1) {
      res.json({ limitReached: true })
      return
    }
  }

  // Layer 1: classify intent
  console.log('[pack/generate] classifying intent for:', dx)
  let intent
  try {
    intent = await classifyIntent(dx)
  } catch (err) {
    console.error('[pack/generate] classifier error:', err)
    res.status(500).json({ error: 'Error en clasificador.' })
    return
  }
  console.log('[pack/generate] intent:', intent)

  if (intent === 'EMERG') {
    res.json({ emergencyResponse: EMERGENCY_RESPONSE })
    return
  }

  if (intent !== 'SAFE') {
    res.json({
      blockedReason: intent as 'DOSE' | 'DIAGN' | 'OOD',
      blockedMessage: BLOCKED_MESSAGES[intent as keyof typeof BLOCKED_MESSAGES],
    })
    return
  }

  // Layer 2: enrich context
  console.log('[pack/generate] enriching context')
  let context
  try {
    context = await enrichContext(userId, contexto)
  } catch (err) {
    console.error('[pack/generate] enricher error:', err)
    res.status(500).json({ error: 'Error enriqueciendo contexto.' })
    return
  }

  // Layer 3: resolve library match
  console.log('[pack/generate] resolving library match')
  let libraryMatch = null
  try {
    libraryMatch = await resolveLibraryMatch(dx, conditionSlug)
    console.log('[pack/generate] library match:', libraryMatch?.slug ?? 'none')
  } catch (err) {
    console.error('[pack/generate] library resolver error (non-fatal):', err)
    // Non-fatal: if resolver fails, proceed without library augmentation
  }

  // Layer 4: generate pack
  console.log('[pack/generate] generating pack')
  let generated
  try {
    generated = await generatePack(dx, context, libraryMatch)
    console.log('[pack/generate] pack generated OK, tools:', generated.tools.length)
  } catch (err) {
    console.error('[pack/generate] generator error:', err)
    res.status(500).json({ error: 'Error generando el pack. Intenta de nuevo.' })
    return
  }

  // Layer 5: verify DOIs
  const verifiedRefs = await verifyReferences(generated.references)

  // Persist to Supabase
  const packId = uuidv4()
  const { error: insertError } = await supabase.from('packs').insert({
    id: packId,
    user_id: userId,
    dx,
    summary: generated.summary,
    chapters: generated.chapters,
    refs: verifiedRefs,
    condition_slug: libraryMatch?.slug ?? null,
    tools: generated.tools,
  })

  if (insertError) {
    console.error('Error saving pack:', insertError)
    res.status(500).json({ error: 'Error guardando el pack.' })
    return
  }

  res.json({
    pack: {
      id: packId,
      dx,
      for: context.para,
      createdAt: new Date().toISOString(),
      summary: generated.summary,
      chapters: generated.chapters,
      references: verifiedRefs,
      conditionSlug: libraryMatch?.slug ?? null,
      tools: generated.tools,
    },
  })
})
```

- [ ] **Step 2: Verify full backend TypeScript compiles clean**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/backend
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/pack.ts
git commit -m "feat(backend): wire library-resolver + tools into pack generation route"
```

---

## Task 11: Frontend — update Pack page to use condition_slug from DB

**Files:**
- Modify: `frontend/app/(shell)/pack/[id]/page.tsx`

Remove the `ilike` lookup. Read `condition_slug` directly from the DB row and pass it to `PackView`. Also pass `tools`.

- [ ] **Step 1: Replace `frontend/app/(shell)/pack/[id]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PackView } from '@/components/PackView'
import type { Pack } from '@/lib/types'

export default async function PackPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: row } = await supabase
    .from('packs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id ?? '')
    .single()

  if (!row) notFound()

  const pack: Pack = {
    id: row.id,
    dx: row.dx,
    for: 'yo',
    createdAt: row.created_at,
    summary: row.summary ?? '',
    chapters: row.chapters ?? [],
    references: row.refs ?? [],
    conditionSlug: row.condition_slug ?? null,
    tools: Array.isArray(row.tools) ? row.tools : [],
  }

  return <PackView pack={pack} userId={user?.id} />
}
```

Note: `conditionSlug` prop is removed from `PackView` — it now reads from `pack.conditionSlug` directly.

- [ ] **Step 2: Verify types compile**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
npx tsc --noEmit 2>&1 | head -20
```

Expected: error in PackView.tsx because it still accepts `conditionSlug` as a separate prop (fixed in Task 12).

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(shell\)/pack/\[id\]/page.tsx
git commit -m "feat(pack-page): read condition_slug and tools from DB row, drop ilike lookup"
```

---

## Task 12: Frontend — update PackView with "Leer más" pill + Herramientas chapter

**Files:**
- Modify: `frontend/components/PackView.tsx`

Changes:
1. Remove `conditionSlug` prop — read from `pack.conditionSlug` instead
2. Add "✦ Leer más →" pill in ChapterCard header
3. Remove the old "Leer más sobre este diagnóstico →" block at end of ChapterCard
4. Compute `chaptersWithTools` — append virtual herramientas chapter when `pack.tools.length > 0`
5. Use `chaptersWithTools` everywhere instead of `pack.chapters`

- [ ] **Step 1: Update `frontend/components/PackView.tsx`**

Replace the entire file:

```typescript
'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { HelpCircle, MessageCircle } from 'lucide-react'
import type { Pack, Chapter, Tool } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { ChatDrawer } from '@/components/ChatDrawer'
import { usePackContext } from '@/lib/pack-context'
import { cn } from '@/lib/utils'

function AlarmBadge({ tone, t, d }: { tone: 'red' | 'amber'; t: string; d: string }) {
  const isRed = tone === 'red'
  return (
    <div className={cn(
      'p-[18px_22px] rounded-[14px] mb-2.5 border',
      isRed ? 'bg-[rgba(192,57,43,.05)] border-[rgba(192,57,43,.2)]' : 'bg-[rgba(161,98,7,.05)] border-[rgba(161,98,7,.2)]'
    )}>
      <div className={cn('font-mono text-[10px] tracking-[.15em] uppercase mb-2', isRed ? 'text-destructive' : 'text-amber-700')}>
        {isRed ? '— urgente' : '— consulta pronto'}
      </div>
      <div className="font-serif text-[16px] tracking-[-0.01em] text-foreground mb-1.5 leading-[1.3]">{t}</div>
      <div className="font-sans text-[14px] text-muted-foreground leading-[1.6]">{d}</div>
    </div>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="p-[18px_22px] rounded-[14px] border border-border bg-muted/40">
      <div className="font-serif text-[17px] tracking-[-0.01em] text-foreground mb-1.5">{tool.title}</div>
      <div className="font-sans text-[14px] text-muted-foreground leading-[1.6]">{tool.description}</div>
    </div>
  )
}

function ChapterCard({
  chapter, packId, userId, dx, onRead, conditionSlug, packContext, onOpenChat,
}: {
  chapter: Chapter; packId: string; userId?: string; dx: string; onRead?: (id: string) => void; conditionSlug?: string | null; packContext: string; onOpenChat: () => void
}) {
  const markedRef = useRef(false)

  useEffect(() => {
    markedRef.current = false
  }, [chapter.id])

  useEffect(() => {
    if (!userId || markedRef.current) return
    const timer = setTimeout(async () => {
      markedRef.current = true
      onRead?.(chapter.id)
      const supabase = createClient()
      await supabase.from('chapter_reads').upsert({ pack_id: packId, user_id: userId, chapter_id: chapter.id })
    }, 30000)
    return () => clearTimeout(timer)
  }, [chapter.id, packId, userId, onRead])

  const isHerramientas = chapter.id === 'herramientas'

  return (
    <div className="h-full overflow-y-auto px-12 py-10 pb-20">
      {/* Chapter header row: label + "Leer más" pill */}
      <div className="flex items-start justify-between gap-4 mb-2.5">
        <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60">
          {chapter.n} · {chapter.readTime}
        </div>
        {conditionSlug && !isHerramientas && (
          <Link
            href={`/condiciones/${conditionSlug}`}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors no-underline font-mono text-[10px] tracking-[.12em] uppercase text-primary/80"
          >
            ✦ Leer más →
          </Link>
        )}
      </div>

      <h2 className="font-serif tracking-[-0.022em] leading-[1.12] mb-2.5 text-[clamp(26px,3.5vw,38px)]">
        {chapter.kicker} <em className="text-muted-foreground">{chapter.kickerItalic}</em>
      </h2>
      <p className="font-serif italic text-muted-foreground text-[16px] mb-8 leading-[1.55]">{chapter.tldr}</p>

      {chapter.paragraphs?.map((p, i) => (
        <p key={i} className="font-sans text-[16px] leading-[1.8] text-foreground mb-5">{p}</p>
      ))}

      {chapter.callout && (
        <div className="my-7 p-[20px_24px] bg-[rgba(31,138,155,.06)] border border-[rgba(31,138,155,.18)] rounded-[14px]">
          <div className="font-mono text-[10px] tracking-[.15em] uppercase text-primary mb-2.5">{chapter.callout.label}</div>
          <p className="font-serif text-[16px] leading-[1.6] text-foreground m-0">{chapter.callout.body}</p>
        </div>
      )}

      {chapter.timeline && (
        <div className="my-7 flex flex-col gap-0">
          {chapter.timeline.map((item, i) => (
            <div key={i} className="flex gap-5 items-start pb-5 border-l-2 border-border pl-5 relative">
              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary" />
              <div>
                <div className="font-mono text-[11px] text-primary mb-1">{item.w}</div>
                <div className="font-sans text-[15px] text-foreground leading-[1.55]">{item.t}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {chapter.questions && (
        <ul className="list-none p-0 mt-2 flex flex-col gap-2.5">
          {chapter.questions.map((q, i) => (
            <li key={i} className="flex gap-3.5 items-start px-[18px] py-3.5 bg-muted rounded-xl">
              <span className="text-primary shrink-0 flex pt-0.5"><HelpCircle size={16} /></span>
              <span className="font-sans text-[15px] text-foreground leading-[1.5]">{q}</span>
            </li>
          ))}
        </ul>
      )}

      {chapter.alarms && (
        <div className="mt-2 flex flex-col gap-0.5">
          {chapter.alarms.map((a, i) => <AlarmBadge key={i} {...a} />)}
        </div>
      )}

      {/* Herramientas chapter body — tools array rendered as cards */}
      {isHerramientas && chapter.tools && (
        <div className="flex flex-col gap-3 mt-4">
          {chapter.tools.map((tool, i) => <ToolCard key={i} tool={tool} />)}
        </div>
      )}

      <div className="mt-8 px-4 py-3 bg-muted rounded-[10px] font-sans text-[12px] text-muted-foreground/60 italic">
        Esta información es educativa y no reemplaza la consulta con tu médico.
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 px-5 py-4 bg-muted rounded-[14px]">
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.4] m-0">
          ¿Cómo entendiste? ¿Tienes dudas?
        </p>
        <button
          onClick={onOpenChat}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background border-none font-sans text-[13px] font-medium cursor-pointer shadow-[var(--c-btn-primary-shadow)] transition-opacity hover:opacity-90"
        >
          <MessageCircle size={13} />
          Pregúntale a Aliis
        </button>
      </div>
    </div>
  )
}

function buildHerramientasChapter(tools: Tool[]): Chapter & { tools: Tool[] } {
  return {
    id: 'herramientas',
    n: String(6).padStart(2, '0'),
    kicker: '¿Qué',
    kickerItalic: 'puedes hacer en tu día a día?',
    readTime: '2 min',
    tldr: 'Herramientas y prácticas que pueden ayudarte.',
    tools,
  }
}

export function PackView({ pack, userId }: { pack: Pack; userId?: string }) {
  const { activeIdx, readChapters, setPack, setActiveIdx, markRead, setChatOpen } = usePackContext()
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)

  // Append herramientas chapter if pack has tools
  const chaptersWithTools: (Chapter & { tools?: Tool[] })[] = [
    ...pack.chapters,
    ...(pack.tools.length > 0 ? [buildHerramientasChapter(pack.tools)] : []),
  ]

  const chapter = chaptersWithTools[activeIdx]
  const isLast = activeIdx === chaptersWithTools.length - 1
  const total = chaptersWithTools.length

  const visitedCount = Math.max(readChapters.size, activeIdx + 1)
  const progressPct = Math.min(visitedCount / total, 1)

  const packContext = pack.chapters.map((ch) =>
    [`## ${ch.kicker} ${ch.kickerItalic}`, ch.tldr, ...(ch.paragraphs ?? [])].join('\n')
  ).join('\n\n')

  useEffect(() => {
    setPack(pack)
    return () => setPack(null)
  }, [pack, setPack])

  return (
    <div className="flex flex-col h-full">
      <ChatDrawer
        dx={pack.dx}
        packId={pack.id}
        userId={userId}
        packContext={packContext}
      />

      {activeIdx < chaptersWithTools.length ? (
        <>
          <div className="flex-1 overflow-hidden">
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              packId={pack.id}
              userId={userId}
              dx={pack.dx}
              onRead={markRead}
              conditionSlug={pack.conditionSlug}
              packContext={packContext}
              onOpenChat={() => setChatOpen(true)}
            />
          </div>

          <div className="border-t border-border bg-background shrink-0">
            <div className="h-[2px] bg-muted w-full">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${Math.round(progressPct * 100)}%` }}
              />
            </div>

            <div className="px-12 py-3.5 flex items-center justify-between">
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className={cn(
                  'px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] flex items-center gap-1.5',
                  activeIdx === 0 ? 'cursor-not-allowed text-muted-foreground/60' : 'cursor-pointer text-foreground'
                )}
              >
                ← Anterior
              </button>

              <span className="font-mono text-[11px] text-muted-foreground/50 tracking-[.08em]">
                {activeIdx + 1} / {total}
              </span>

              <button
                onClick={() => setActiveIdx(Math.min(chaptersWithTools.length, activeIdx + 1))}
                className={cn(
                  'px-5 py-2.5 rounded-full font-sans text-[14px] font-medium cursor-pointer flex items-center gap-1.5',
                  isLast
                    ? 'border border-border bg-transparent text-muted-foreground'
                    : 'border-none bg-foreground text-background shadow-[var(--c-btn-primary-shadow)]'
                )}
              >
                {isLast ? 'Ver referencias' : 'Siguiente'} →
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-12 py-10 pb-20">
          <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60 mb-5">
            Referencias verificadas
          </div>
          <div className="flex flex-col gap-4">
            {verifiedRefs.map((ref) => (
              <div key={ref.id} className="p-[18px_20px] bg-muted rounded-xl">
                <div className="font-sans text-[14px] font-medium mb-1">
                  {ref.authors} ({ref.year}). <em>{ref.journal}</em>
                </div>
                <div className="font-serif italic text-[14px] text-muted-foreground mb-2.5">&ldquo;{ref.quote}&rdquo;</div>
                <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-primary no-underline">
                  doi:{ref.doi} ↗
                </a>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveIdx(chaptersWithTools.length - 1)}
            className="mt-8 px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] text-foreground cursor-pointer"
          >
            ← Volver al último capítulo
          </button>
        </div>
      )}
    </div>
  )
}
```

Note: `Chapter` type needs a `tools?` field for the virtual chapter. Add it to `frontend/lib/types.ts`:

```typescript
export interface Chapter {
  // ... existing fields ...
  tools?: Tool[]  // only present on virtual herramientas chapter
}
```

- [ ] **Step 2: Add `tools?: Tool[]` to `Chapter` in `frontend/lib/types.ts`**

In `frontend/lib/types.ts`, in the `Chapter` interface, add after `practices?`:

```typescript
tools?: Tool[]
```

- [ ] **Step 3: Verify full frontend TypeScript compiles clean**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/PackView.tsx frontend/lib/types.ts
git commit -m "feat(pack-view): add Leer más pill, herramientas chapter, drop conditionSlug prop"
```

---

## Task 13: Smoke test end-to-end

Manual verification checklist. No automated tests exist in this project.

- [ ] **Step 1: Start both servers**

```bash
# Terminal 1
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend
npm run dev

# Terminal 2
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/backend
npm run dev
```

- [ ] **Step 2: Test combobox — library match path**

1. Navigate to `/ingreso`
2. Click the diagnosis input
3. Type "sinkope" — verify "Síncope" appears with "En biblioteca" badge
4. Click "Síncope" — verify input fills and continues to step 2
5. Complete steps 2 (para), 3 (emocion), 4 (dudas) — verify "Paso N de 4" indicators show correctly
6. Generate the pack — verify generation completes and redirects to `/pack/[id]`

- [ ] **Step 3: Verify pack page — condition match**

1. On the pack page, verify "✦ Leer más →" pill appears in each chapter header
2. Click the pill — verify it navigates to `/condiciones/sincope` (or whatever slug)
3. If the AI returned tools, verify the "Herramientas" chapter appears in the sidebar and is navigable

- [ ] **Step 4: Test free-text path (no library match)**

1. Go to `/ingreso`
2. Type "Neuropatía diabética periférica severa" — a diagnosis unlikely to match library
3. If no suggestions appear from library, click "Usar [texto] como diagnóstico"
4. Generate — verify pack creates successfully
5. Verify "✦ Leer más →" pill does NOT appear (conditionSlug is null)

- [ ] **Step 5: Commit any fixes from smoke test**

```bash
git add -A
git commit -m "fix: smoke test corrections"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered in task |
|---|---|
| Combobox with library suggestions | Task 3 (ComboboxDiagnostico) |
| Fuzzy match shared module | Task 1 (frontend), Task 6 (backend) |
| 4-step flow (dx, para, emocion, dudas) | Task 4 |
| "Paso N de 4" indicators | Task 4 |
| `conditionSlug` sent to backend | Task 4 |
| Backend library-resolver module | Task 7 |
| EnrichedContext: emocion + acompanando, no frecuencia | Task 8 |
| Generator: FUENTE DE VERDAD injection | Task 9 |
| Generator: HERRAMIENTAS section | Task 9 |
| tools[] validation + normalization | Task 9 |
| SQL migration: condition_slug + tools columns | Task 5 |
| Route: resolveLibraryMatch called | Task 10 |
| Route: persist condition_slug + tools | Task 10 |
| Pack page: read from row.condition_slug | Task 11 |
| PackView: "✦ Leer más →" pill | Task 12 |
| PackView: herramientas virtual chapter | Task 12 |
| Pack type: conditionSlug + tools | Task 2 |
| Tool type | Task 2 |
| Smoke test | Task 13 |

All spec requirements are covered. No placeholders found. Types are consistent across tasks.
