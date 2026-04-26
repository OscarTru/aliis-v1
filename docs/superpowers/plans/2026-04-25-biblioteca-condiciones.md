# Biblioteca de Condiciones Neurológicas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a patient-facing library of 30 neurological conditions at `/condiciones`, each with 8 deep sections navigable via the existing sidebar, linked from personal packs via a "Leer más" block at the end of each chapter.

**Architecture:** Two Supabase tables (`conditions` + `condition_sections`) store all content. The `/condiciones` index page lists all published conditions. `/condiciones/[slug]` reuses the existing `PackContext` pattern — on mount it registers condition data so the Sidebar renders section navigation identically to pack chapters. A `ConditionView` client component (mirrors `PackView`) renders content. The `PackView` chapter card gains a "Leer más" footer block that links to the matching condition by slug lookup.

**Tech Stack:** Next.js 15 App Router (server components), Supabase (postgres + SSR client), TypeScript, Tailwind CSS, existing `PackContext` + `Sidebar` pattern, lucide-react icons.

---

## File Structure

**New files:**
- `frontend/lib/types.ts` — add `Condition` and `ConditionSection` types (modify existing)
- `frontend/lib/condition-context.tsx` — mirrors `pack-context.tsx`, holds active condition + section state
- `frontend/components/ConditionView.tsx` — mirrors `PackView.tsx`, registers into condition context
- `frontend/app/(shell)/condiciones/page.tsx` — index: list all published conditions
- `frontend/app/(shell)/condiciones/[slug]/page.tsx` — fetch condition + sections, render ConditionView
- `frontend/app/(shell)/condiciones/[slug]/layout.tsx` — mirrors `pack/layout.tsx`, suppresses main scroll

**Modified files:**
- `frontend/lib/types.ts` — add Condition/ConditionSection interfaces
- `frontend/components/Sidebar.tsx` — add condition section nav (mirrors pack chapter nav block)
- `frontend/components/AppShell.tsx` — wrap with ConditionProvider alongside PackProvider
- `frontend/components/PackView.tsx` — add "Leer más" block at bottom of ChapterCard
- `frontend/middleware.ts` — `/condiciones` does NOT need auth (public library)

**SQL migration (run in Supabase SQL editor):**
```sql
-- conditions table
create table conditions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  subtitle text not null,
  summary text not null,
  specialty text not null default 'neurología',
  icd10 text not null,
  reviewed boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- condition_sections table
create table condition_sections (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null references conditions(id) on delete cascade,
  "order" int not null,
  slug text not null,
  title text not null,
  icon text not null,
  read_time text not null,
  content jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index on condition_sections(condition_id, "order");

-- RLS: conditions are public read, no auth required
alter table conditions enable row level security;
alter table condition_sections enable row level security;

create policy "conditions public read" on conditions for select using (published = true);
create policy "condition_sections public read" on condition_sections for select using (
  exists (select 1 from conditions c where c.id = condition_id and c.published = true)
);
```

---

### Task 1: Types + Supabase schema

**Files:**
- Modify: `frontend/lib/types.ts`
- SQL: run in Supabase SQL editor

- [ ] **Step 1: Add types to `frontend/lib/types.ts`**

Append at the end of the file:

```typescript
export interface ConditionSection {
  id: string
  condition_id: string
  order: number
  slug: string
  title: string
  icon: string
  read_time: string
  content: {
    paragraphs?: string[]
    callout?: { label: string; body: string }
    timeline?: { w: string; t: string }[]
    questions?: string[]
    alarms?: { tone: 'red' | 'amber'; t: string; d: string }[]
  }
}

export interface Condition {
  id: string
  slug: string
  name: string
  subtitle: string
  summary: string
  specialty: string
  icd10: string
  reviewed: boolean
  published: boolean
  created_at: string
  sections: ConditionSection[]
}
```

- [ ] **Step 2: Run the SQL migration in Supabase SQL editor**

Go to Supabase Studio → SQL Editor → New query. Paste and run:

```sql
create table conditions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  subtitle text not null,
  summary text not null,
  specialty text not null default 'neurología',
  icd10 text not null,
  reviewed boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table condition_sections (
  id uuid primary key default gen_random_uuid(),
  condition_id uuid not null references conditions(id) on delete cascade,
  "order" int not null,
  slug text not null,
  title text not null,
  icon text not null,
  read_time text not null,
  content jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index on condition_sections(condition_id, "order");

alter table conditions enable row level security;
alter table condition_sections enable row level security;

create policy "conditions public read" on conditions for select using (published = true);
create policy "condition_sections public read" on condition_sections for select using (
  exists (select 1 from conditions c where c.id = condition_id and c.published = true)
);
```

- [ ] **Step 3: Insert one test condition so the UI has data to render**

In Supabase SQL editor:

```sql
-- Insert test condition
insert into conditions (slug, name, subtitle, summary, icd10, published)
values (
  'epilepsia',
  'Epilepsia',
  'Guía completa para pacientes y familias',
  'La epilepsia es una enfermedad neurológica crónica caracterizada por la predisposición a presentar crisis epilépticas recurrentes. Afecta a más de 50 millones de personas en el mundo.',
  'G40',
  true
);

-- Get the id of the inserted condition
-- Insert first section
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select 
  c.id,
  1,
  'que-es',
  '¿Qué es?',
  'BookOpen',
  '6 min',
  '{
    "paragraphs": [
      "La epilepsia es una enfermedad del sistema nervioso central en la que la actividad cerebral se vuelve anormal, causando crisis o períodos de comportamiento inusual, sensaciones y a veces pérdida de conciencia.",
      "Una crisis epiléptica ocurre cuando hay una descarga eléctrica anormal y excesiva en las neuronas del cerebro. Cuando estas descargas se repiten sin una causa identificable y corregible, hablamos de epilepsia.",
      "Es importante saber que una sola crisis no significa epilepsia. El diagnóstico requiere al menos dos crisis no provocadas con más de 24 horas de diferencia, o una crisis con alto riesgo de recurrencia.",
      "La epilepsia no es una enfermedad única sino un síndrome con muchas causas posibles. Puede deberse a factores genéticos, lesiones cerebrales, tumores, infecciones, o puede no tener causa identificable (epilepsia idiopática)."
    ],
    "callout": {
      "label": "Dato clave",
      "body": "El 70% de las personas con epilepsia puede controlar sus crisis con medicación adecuada. La epilepsia no define quién eres — millones de personas llevan vidas plenas y activas con este diagnóstico."
    }
  }'::jsonb
from conditions c where c.slug = 'epilepsia';
```

- [ ] **Step 4: Verify data in Supabase Studio**

Go to Table Editor → `conditions` → confirm 1 row with `published = true`.
Go to Table Editor → `condition_sections` → confirm 1 row with `slug = 'que-es'`.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat(condiciones): add Condition + ConditionSection types"
```

---

### Task 2: ConditionContext (mirrors PackContext)

**Files:**
- Create: `frontend/lib/condition-context.tsx`
- Modify: `frontend/components/AppShell.tsx`

- [ ] **Step 1: Create `frontend/lib/condition-context.tsx`**

```typescript
'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { Condition } from '@/lib/types'

interface ConditionContextValue {
  condition: Condition | null
  activeIdx: number
  setCondition: (c: Condition | null) => void
  setActiveIdx: (i: number) => void
}

const ConditionContext = createContext<ConditionContextValue>({
  condition: null,
  activeIdx: 0,
  setCondition: () => {},
  setActiveIdx: () => {},
})

export function ConditionProvider({ children }: { children: React.ReactNode }) {
  const [condition, setConditionState] = useState<Condition | null>(null)
  const [activeIdx, setActiveIdxState] = useState(0)

  const setCondition = useCallback((c: Condition | null) => {
    setConditionState(c)
    setActiveIdxState(0)
  }, [])

  const setActiveIdx = useCallback((i: number) => setActiveIdxState(i), [])

  return (
    <ConditionContext.Provider value={{ condition, activeIdx, setCondition, setActiveIdx }}>
      {children}
    </ConditionContext.Provider>
  )
}

export function useConditionContext() {
  return useContext(ConditionContext)
}
```

- [ ] **Step 2: Modify `frontend/components/AppShell.tsx` — wrap with both providers**

```typescript
import { Sidebar } from '@/components/Sidebar'
import { PackProvider } from '@/lib/pack-context'
import { ConditionProvider } from '@/lib/condition-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PackProvider>
      <ConditionProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </ConditionProvider>
    </PackProvider>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/condition-context.tsx frontend/components/AppShell.tsx
git commit -m "feat(condiciones): add ConditionContext + wrap AppShell"
```

---

### Task 3: Sidebar — condition section nav

**Files:**
- Modify: `frontend/components/Sidebar.tsx`

The Sidebar already has a pack chapter nav block (lines ~192–260). We add an identical block for conditions, shown when `condition` is set in context and `pack` is null.

- [ ] **Step 1: Add `useConditionContext` import to Sidebar**

In `frontend/components/Sidebar.tsx`, find the imports block and add:

```typescript
import { useConditionContext } from '@/lib/condition-context'
```

Also ensure these icons are imported (add any missing from the existing lucide-react import line):
`BookOpen, Settings2, Activity, ClipboardList, Pill, Heart, MessageCircle, BookMarked`

- [ ] **Step 2: Add condition context consumption inside the `Sidebar` function**

After the existing line:
```typescript
const { pack, activeIdx, readChapters, setActiveIdx } = usePackContext()
```

Add:
```typescript
const { condition, activeIdx: condActiveIdx, setActiveIdx: setCondActiveIdx } = useConditionContext()
```

- [ ] **Step 3: Add condition section icon map**

After the existing `CHAPTER_ICON_MAP` constant (near top of file, after imports), add:

```typescript
const SECTION_ICON_MAP: Record<string, React.ReactNode> = {
  'que-es':       <BookOpen size={14} />,
  'causas':       <Activity size={14} />,
  'sintomas':     <Activity size={14} />,
  'diagnostico':  <ClipboardList size={14} />,
  'tratamientos': <Pill size={14} />,
  'vida-diaria':  <Heart size={14} />,
  'preguntas':    <MessageCircle size={14} />,
  'fuentes':      <BookMarked size={14} />,
}
```

- [ ] **Step 4: Add condition nav block in the Sidebar JSX**

Find the existing pack nav block which starts with:
```typescript
{pack && !collapsed && (
```

Immediately after its closing `)}`, add the condition nav block:

```typescript
{condition && !collapsed && (
  <>
    <Separator />
    <div className="px-3 pt-3 pb-1">
      <div className="font-mono text-[9px] tracking-[.15em] uppercase text-muted-foreground/50 mb-1">
        Condición
      </div>
      <div className="font-serif text-[12px] leading-[1.3] text-muted-foreground truncate">
        {condition.name}
      </div>
    </div>
    <nav className="flex flex-col gap-0 px-2 pb-2 flex-1 overflow-y-auto">
      {condition.sections.map((sec, i) => {
        const isActive = i === condActiveIdx
        return (
          <button
            key={sec.id}
            onClick={() => setCondActiveIdx(i)}
            className={cn(
              'w-full text-left px-2.5 py-[7px] rounded-[9px] border-none cursor-pointer flex items-center gap-2 transition-colors duration-100',
              isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-muted'
            )}
          >
            <span className={cn('shrink-0 inline-flex', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
              {SECTION_ICON_MAP[sec.slug] ?? <BookOpen size={14} />}
            </span>
            <span className={cn(
              'font-sans text-[12px] truncate leading-[1.2] flex-1',
              isActive ? 'font-medium text-primary' : 'text-muted-foreground'
            )}>
              {sec.title}
            </span>
          </button>
        )
      })}
    </nav>
  </>
)}

{!pack && !condition && <div className="flex-1" />}
```

Also update the existing spacer line — find:
```typescript
{!pack && <div className="flex-1" />}
```
Replace with:
```typescript
{!pack && !condition && <div className="flex-1" />}
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/Sidebar.tsx
git commit -m "feat(condiciones): condition section nav in Sidebar"
```

---

### Task 4: ConditionView component

**Files:**
- Create: `frontend/components/ConditionView.tsx`

This component mirrors `PackView.tsx`. It registers the condition into `ConditionContext` on mount (so Sidebar shows section nav), and renders the active section content.

- [ ] **Step 1: Create `frontend/components/ConditionView.tsx`**

```typescript
'use client'

import { useEffect } from 'react'
import { BookOpen, Settings2, Activity, ClipboardList, Pill, Heart, MessageCircle, BookMarked, HelpCircle, ExternalLink } from 'lucide-react'
import type { Condition, ConditionSection } from '@/lib/types'
import { useConditionContext } from '@/lib/condition-context'
import { cn } from '@/lib/utils'

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'que-es':       <BookOpen size={18} />,
  'causas':       <Activity size={18} />,
  'sintomas':     <Activity size={18} />,
  'diagnostico':  <ClipboardList size={18} />,
  'tratamientos': <Pill size={18} />,
  'vida-diaria':  <Heart size={18} />,
  'preguntas':    <MessageCircle size={18} />,
  'fuentes':      <BookMarked size={18} />,
}

function SectionContent({ section }: { section: ConditionSection }) {
  const c = section.content
  return (
    <div className="h-full overflow-y-auto px-12 py-10 pb-24 max-w-[720px]">
      {/* Kicker */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-primary">{SECTION_ICONS[section.slug] ?? <BookOpen size={18} />}</span>
        <span className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60">
          {section.read_time}
        </span>
      </div>

      <h2 className="font-serif tracking-[-0.022em] leading-[1.12] mb-8 text-[clamp(28px,3.5vw,42px)]">
        {section.title}
      </h2>

      {c.paragraphs?.map((p, i) => (
        <p key={i} className="font-sans text-[16px] leading-[1.8] text-foreground mb-5">{p}</p>
      ))}

      {c.callout && (
        <div className="my-7 p-[20px_24px] bg-[rgba(31,138,155,.06)] border border-[rgba(31,138,155,.18)] rounded-[14px]">
          <div className="font-mono text-[10px] tracking-[.15em] uppercase text-primary mb-2.5">{c.callout.label}</div>
          <p className="font-serif text-[16px] leading-[1.6] text-foreground m-0">{c.callout.body}</p>
        </div>
      )}

      {c.timeline && (
        <div className="my-7 flex flex-col gap-0">
          {c.timeline.map((item, i) => (
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

      {c.questions && (
        <ul className="list-none p-0 mt-2 flex flex-col gap-2.5">
          {c.questions.map((q, i) => (
            <li key={i} className="flex gap-3.5 items-start px-[18px] py-3.5 bg-muted rounded-xl">
              <span className="text-primary shrink-0 flex pt-0.5"><HelpCircle size={16} /></span>
              <span className="font-sans text-[15px] text-foreground leading-[1.5]">{q}</span>
            </li>
          ))}
        </ul>
      )}

      {c.alarms && (
        <div className="mt-4 flex flex-col gap-2">
          {c.alarms.map((a, i) => (
            <div key={i} className={cn(
              'p-[18px_22px] rounded-[14px] border',
              a.tone === 'red'
                ? 'bg-[rgba(192,57,43,.05)] border-[rgba(192,57,43,.2)]'
                : 'bg-[rgba(161,98,7,.05)] border-[rgba(161,98,7,.2)]'
            )}>
              <div className={cn('font-mono text-[10px] tracking-[.15em] uppercase mb-2',
                a.tone === 'red' ? 'text-destructive' : 'text-amber-700')}>
                {a.tone === 'red' ? '— urgente' : '— consulta pronto'}
              </div>
              <div className="font-serif text-[16px] text-foreground mb-1.5 leading-[1.3]">{a.t}</div>
              <div className="font-sans text-[14px] text-muted-foreground leading-[1.6]">{a.d}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 px-4 py-3 bg-muted rounded-[10px] font-sans text-[12px] text-muted-foreground/60 italic">
        Esta información es educativa y no reemplaza la consulta con tu médico o neurólogo.
      </div>
    </div>
  )
}

export function ConditionView({ condition }: { condition: Condition }) {
  const { activeIdx, setCondition, setActiveIdx } = useConditionContext()
  const section = condition.sections[activeIdx]
  const isLast = activeIdx === condition.sections.length - 1

  useEffect(() => {
    setCondition(condition)
    return () => setCondition(null)
  }, [condition, setCondition])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        {section && <SectionContent key={section.id} section={section} />}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-border px-12 py-3.5 flex items-center justify-between bg-background shrink-0">
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

        {/* Dots */}
        <div className="flex gap-1.5 items-center">
          {condition.sections.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'h-1.5 rounded-full border-none cursor-pointer p-0 transition-all duration-200',
                i === activeIdx ? 'w-5 bg-primary' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIdx(Math.min(condition.sections.length - 1, activeIdx + 1))}
          className={cn(
            'px-5 py-2.5 rounded-full font-sans text-[14px] font-medium cursor-pointer flex items-center gap-1.5',
            isLast
              ? 'border border-border bg-transparent text-muted-foreground cursor-not-allowed'
              : 'border-none bg-foreground text-background shadow-[var(--c-btn-primary-shadow)]'
          )}
          disabled={isLast}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ConditionView.tsx
git commit -m "feat(condiciones): ConditionView component"
```

---

### Task 5: Route `/condiciones/[slug]` + layout

**Files:**
- Create: `frontend/app/(shell)/condiciones/[slug]/page.tsx`
- Create: `frontend/app/(shell)/condiciones/[slug]/layout.tsx`

- [ ] **Step 1: Create the layout — mirrors `pack/layout.tsx`**

Create `frontend/app/(shell)/condiciones/[slug]/layout.tsx`:

```typescript
'use client'

import { useEffect } from 'react'

export default function CondicionLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const prev = main.style.overflow
    main.style.overflow = 'hidden'
    return () => { main.style.overflow = prev }
  }, [])

  return <div className="h-full flex flex-col">{children}</div>
}
```

- [ ] **Step 2: Create `frontend/app/(shell)/condiciones/[slug]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ConditionView } from '@/components/ConditionView'
import type { Condition } from '@/lib/types'

export default async function CondicionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: row } = await supabase
    .from('conditions')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!row) notFound()

  const { data: sections } = await supabase
    .from('condition_sections')
    .select('*')
    .eq('condition_id', row.id)
    .order('order', { ascending: true })

  const condition: Condition = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    summary: row.summary,
    specialty: row.specialty,
    icd10: row.icd10,
    reviewed: row.reviewed,
    published: row.published,
    created_at: row.created_at,
    sections: sections ?? [],
  }

  return <ConditionView condition={condition} />
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test in browser**

Navigate to `/condiciones/epilepsia`. Expected:
- Sidebar shows "Condición" label + "Epilepsia" + "¿Qué es?" section button highlighted
- Main content shows the section title "¿Qué es?" and paragraphs
- Bottom nav shows dots + Siguiente → button

- [ ] **Step 5: Commit**

```bash
git add frontend/app/(shell)/condiciones/
git commit -m "feat(condiciones): /condiciones/[slug] route + layout"
```

---

### Task 6: Index page `/condiciones`

**Files:**
- Create: `frontend/app/(shell)/condiciones/page.tsx`

- [ ] **Step 1: Create `frontend/app/(shell)/condiciones/page.tsx`**

```typescript
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cn } from '@/lib/utils'

const ICD_COLOR: Record<string, string> = {
  G: 'text-primary',
  I: 'text-rose-500',
  E: 'text-amber-600',
  C: 'text-violet-500',
  F: 'text-sky-500',
  H: 'text-teal-500',
}

function icdColor(icd10: string) {
  return ICD_COLOR[icd10[0]] ?? 'text-muted-foreground'
}

export default async function CondicionesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: conditions } = await supabase
    .from('conditions')
    .select('slug, name, subtitle, summary, icd10')
    .eq('published', true)
    .order('name', { ascending: true })

  const list = conditions ?? []

  return (
    <div className="max-w-[720px] mx-auto px-8 pt-10 pb-20">
      {/* Header */}
      <div className="mb-9">
        <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-2">
          {list.length} condiciones
        </p>
        <h1 className="font-serif text-[clamp(24px,3.5vw,36px)] tracking-tight leading-tight mb-3">
          Biblioteca <em className="text-primary">neurológica</em>
        </h1>
        <p className="font-sans text-[15px] text-muted-foreground leading-relaxed max-w-[520px]">
          Información detallada, basada en evidencia, escrita para pacientes y familias. Selecciona una condición para leer.
        </p>
      </div>

      {/* Grid */}
      {list.length === 0 ? (
        <p className="font-serif italic text-muted-foreground text-[16px]">
          Próximamente — estamos preparando el contenido.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((c) => (
            <Link
              key={c.slug}
              href={`/condiciones/${c.slug}`}
              className="group block p-5 rounded-2xl border border-border bg-background hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-150 no-underline"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif text-[17px] tracking-[-0.01em] text-foreground leading-tight">
                      {c.name}
                    </h2>
                    <span className={cn('font-mono text-[10px] tracking-wider', icdColor(c.icd10))}>
                      {c.icd10}
                    </span>
                  </div>
                  <p className="font-sans text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                    {c.summary}
                  </p>
                </div>
                <span className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add "Biblioteca" link to Sidebar nav items**

In `frontend/components/Sidebar.tsx`, find the `NAV_ITEMS` array:

```typescript
const NAV_ITEMS: NavItem[] = [
  { href: '/ingreso',   label: 'Nuevo diagnóstico', icon: <Plus size={18} /> },
  { href: '/historial', label: 'Mi expediente',     icon: <LayoutList size={18} /> },
]
```

Replace with:

```typescript
const NAV_ITEMS: NavItem[] = [
  { href: '/ingreso',      label: 'Nuevo diagnóstico', icon: <Plus size={18} /> },
  { href: '/historial',    label: 'Mi expediente',     icon: <LayoutList size={18} /> },
  { href: '/condiciones',  label: 'Biblioteca',        icon: <Library size={18} /> },
]
```

Add `Library` to the lucide-react import line in the same file.

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test in browser**

Navigate to `/condiciones`. Expected:
- Header "Biblioteca neurológica" visible
- 1 card: "Epilepsia · G40" with summary text
- Click card → goes to `/condiciones/epilepsia` with sidebar section nav

- [ ] **Step 5: Commit**

```bash
git add frontend/app/(shell)/condiciones/page.tsx frontend/components/Sidebar.tsx
git commit -m "feat(condiciones): index page + Biblioteca nav item in Sidebar"
```

---

### Task 7: "Leer más" block in PackView chapters

**Files:**
- Modify: `frontend/components/PackView.tsx`

When a user is reading a pack chapter, a block at the bottom of ChapterCard links to the matching condition. The match is passed as a prop from the server page (which queries Supabase for a matching condition slug).

- [ ] **Step 1: Modify `frontend/app/(shell)/pack/[id]/page.tsx` to fetch matching condition**

Find the existing page and replace fully:

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

  const [packResult, conditionsResult] = await Promise.all([
    supabase
      .from('packs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id ?? '')
      .single(),
    supabase
      .from('conditions')
      .select('slug, name')
      .eq('published', true),
  ])

  if (!packResult.data) notFound()
  const row = packResult.data

  const pack: Pack = {
    id: row.id,
    dx: row.dx,
    for: 'yo',
    createdAt: row.created_at,
    summary: row.summary ?? '',
    chapters: row.chapters ?? [],
    references: row.refs ?? [],
  }

  // Find matching condition by checking if any condition name appears in the dx string
  const conditions = conditionsResult.data ?? []
  const matchedCondition = conditions.find((c) =>
    pack.dx.toLowerCase().includes(c.name.toLowerCase()) ||
    c.name.toLowerCase().includes(pack.dx.toLowerCase().split(' ').slice(0, 2).join(' '))
  )

  return <PackView pack={pack} userId={user?.id} conditionSlug={matchedCondition?.slug ?? null} conditionName={matchedCondition?.name ?? null} />
}
```

- [ ] **Step 2: Update `PackView` props and `ChapterCard` to accept + render the "Leer más" block**

In `frontend/components/PackView.tsx`:

**a) Update `ChapterCard` signature** — add `conditionSlug` and `conditionName` props:

```typescript
function ChapterCard({
  chapter, packId, userId, dx, onRead, conditionSlug, conditionName,
}: {
  chapter: Chapter; packId: string; userId?: string; dx: string; onRead?: (id: string) => void
  conditionSlug: string | null; conditionName: string | null
}) {
```

**b) At the end of the `ChapterCard` return**, after the disclaimer div and before closing `</div>`, add:

```typescript
{conditionSlug && conditionName && (
  <div className="mt-8 p-5 rounded-2xl border border-primary/20 bg-primary/[0.03]">
    <div className="font-mono text-[10px] tracking-[.15em] uppercase text-primary mb-2">
      Profundiza
    </div>
    <p className="font-serif text-[15px] text-foreground mb-3 leading-[1.4]">
      Leer la guía completa sobre <strong>{conditionName}</strong> — 8 secciones, ~30 min
    </p>
    <Link
      href={`/condiciones/${conditionSlug}`}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white font-sans text-[13px] font-medium no-underline hover:bg-primary/90 transition-colors"
    >
      Ir a la guía →
    </Link>
  </div>
)}
```

**c) Add `import Link from 'next/link'`** at the top of PackView.tsx if not already present (check — it may already be there from a previous version; if not, add it).

**d) Update `PackView` component signature** — add the new props and pass them to `ChapterCard`:

```typescript
export function PackView({ pack, userId, conditionSlug, conditionName }: {
  pack: Pack; userId?: string; conditionSlug?: string | null; conditionName?: string | null
}) {
```

And in the `ChapterCard` call inside PackView's return:

```typescript
<ChapterCard
  key={chapter.id}
  chapter={chapter}
  packId={pack.id}
  userId={userId}
  dx={pack.dx}
  onRead={markRead}
  conditionSlug={conditionSlug ?? null}
  conditionName={conditionName ?? null}
/>
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test in browser**

Open a pack whose `dx` contains "Epilepsia" or "Esclerosis". Expected:
- At the bottom of each chapter, after the disclaimer, a teal card appears: "Leer la guía completa sobre X — 8 secciones, ~30 min" with "Ir a la guía →" button.
- Clicking takes to `/condiciones/[slug]`.

If `dx` doesn't match any condition, no block appears — that's correct.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/PackView.tsx frontend/app/(shell)/pack/[id]/page.tsx
git commit -m "feat(condiciones): Leer más block in pack chapters linking to condition"
```

---

## Self-Review

**Spec coverage:**
- ✅ Supabase tables `conditions` + `condition_sections` — Task 1
- ✅ `Condition` + `ConditionSection` TypeScript types — Task 1
- ✅ ConditionContext (mirrors PackContext) — Task 2
- ✅ Sidebar section nav for conditions — Task 3
- ✅ ConditionView component with bottom nav + dots — Task 4
- ✅ `/condiciones/[slug]` route + layout — Task 5
- ✅ `/condiciones` index page — Task 6
- ✅ "Biblioteca" in Sidebar nav — Task 6
- ✅ "Leer más" block at bottom of pack chapters — Task 7
- ✅ 8 sections: que-es, causas, síntomas, diagnóstico, tratamientos, vida-diaria, preguntas, fuentes — covered in types + ConditionView icons + Sidebar icon map

**Placeholder scan:** No TBDs, no "implement later", all code blocks complete.

**Type consistency:**
- `Condition.sections: ConditionSection[]` — defined Task 1, used consistently in Tasks 4, 5
- `ConditionContext.condition: Condition | null` — Task 2, consumed in Task 3 (Sidebar) and Task 4 (ConditionView)
- `PackView` new props `conditionSlug: string | null`, `conditionName: string | null` — defined and passed in Task 7
