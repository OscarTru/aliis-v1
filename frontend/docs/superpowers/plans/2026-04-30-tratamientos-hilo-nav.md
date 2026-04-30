# Tratamientos, El Hilo mejorado y Presencia de Aliis AI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar una sección de Tratamientos con datos ricos (frecuencia, duración, último cambio), mejorar la UX de El Hilo con estado visible, y hacer que Aliis AI esté siempre presente en la navegación del shell.

**Architecture:** Tratamientos reemplaza el campo `medicamentos: string[]` de `medical_profiles` con una tabla propia `treatments` que almacena nombre, dosis, frecuencia, inicio, si es indefinido. El Hilo pasa de "generar en blanco" a mostrar cuándo se generó y desde dónde. Aliis AI aparece como chip fijo en el Sidebar/AppShell con acceso al chat.

**Tech Stack:** Next.js 15 App Router, Supabase (MCP), Server Actions, Tailwind CSS, Lucide icons, shadcn/ui dialog.

---

## Mapa de archivos

### Nuevos
- `frontend/app/api/treatments/route.ts` — GET/POST treatments del usuario
- `frontend/app/api/treatments/[id]/route.ts` — PATCH/DELETE un treatment
- `frontend/app/actions/treatments.ts` — Server actions para crear/editar/eliminar
- `frontend/components/TreatmentsSection.tsx` — UI de lista + form de tratamientos (usado en /cuenta Pro)
- `frontend/components/TreatmentsWidget.tsx` — Widget compacto de tratamientos del día (usado en /diario columna derecha)
- `frontend/components/AliisPresence.tsx` — Chip fijo "Aliis AI" con estado del último insight (sidebar desktop)

### Modificados
- `frontend/lib/types.ts` — Agregar tipo `Treatment`
- `frontend/app/(shell)/cuenta/CuentaClient.tsx` — Reemplazar TagInput de medicamentos con `TreatmentsSection`
- `frontend/app/(shell)/cuenta/page.tsx` — Fetch treatments en lugar de medical_profiles.medicamentos
- `frontend/app/(shell)/diario/page.tsx` — Agregar `TreatmentsWidget` en columna derecha, pasar medications desde treatments
- `frontend/components/Sidebar.tsx` — Agregar `AliisPresence` al fondo del sidebar
- `frontend/components/ElHilo.tsx` — Mostrar fecha de última generación, estado "generado hace X días"
- `supabase/migrations/` — Migración para tabla `treatments`

---

## Task 1: Migración de base de datos — tabla `treatments`

**Files:**
- Modify (via MCP): Supabase DB

- [ ] **Step 1: Aplicar migración via Supabase MCP**

Ejecutar este SQL via `mcp__plugin_supabase_supabase__apply_migration` con project_id `cdnecuufkdykybisqybm`:

```sql
-- Nombre: treatments_table
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  frequency TEXT NOT NULL DEFAULT 'once_daily',
  -- once_daily | twice_daily | three_daily | four_daily | as_needed | other
  frequency_label TEXT,
  -- texto libre si frequency = 'other'
  indefinite BOOLEAN NOT NULL DEFAULT true,
  started_at DATE,
  ended_at DATE,
  -- null si indefinite = true
  last_changed_at DATE,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own treatments"
  ON treatments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX treatments_user_id_idx ON treatments(user_id);
CREATE INDEX treatments_active_idx ON treatments(user_id, active);
```

- [ ] **Step 2: Verificar que la tabla existe**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'treatments' ORDER BY ordinal_position;
```

Esperado: columnas id, user_id, name, dose, frequency, frequency_label, indefinite, started_at, ended_at, last_changed_at, notes, active, created_at, updated_at.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(db): tabla treatments con RLS y frecuencia estructurada"
```

---

## Task 2: Tipo `Treatment` en types.ts

**Files:**
- Modify: `frontend/lib/types.ts`

- [ ] **Step 1: Agregar el tipo**

Agregar al final de `frontend/lib/types.ts`:

```typescript
export type TreatmentFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_daily'
  | 'four_daily'
  | 'as_needed'
  | 'other'

export const FREQUENCY_LABELS: Record<TreatmentFrequency, string> = {
  once_daily:   'Una vez al día',
  twice_daily:  'Dos veces al día',
  three_daily:  'Tres veces al día',
  four_daily:   'Cuatro veces al día',
  as_needed:    'Según sea necesario',
  other:        'Otra frecuencia',
}

export interface Treatment {
  id: string
  user_id: string
  name: string
  dose: string | null
  frequency: TreatmentFrequency
  frequency_label: string | null
  indefinite: boolean
  started_at: string | null
  ended_at: string | null
  last_changed_at: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat(types): agregar Treatment, TreatmentFrequency y FREQUENCY_LABELS"
```

---

## Task 3: Server action `treatments.ts`

**Files:**
- Create: `frontend/app/actions/treatments.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Treatment, TreatmentFrequency } from '@/lib/types'

export interface TreatmentInput {
  name: string
  dose?: string
  frequency: TreatmentFrequency
  frequency_label?: string
  indefinite: boolean
  started_at?: string
  ended_at?: string
  last_changed_at?: string
  notes?: string
}

export async function getTreatments(): Promise<Treatment[]> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('treatments')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: true })
  return (data ?? []) as Treatment[]
}

export async function createTreatment(input: TreatmentInput): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { error } = await supabase.from('treatments').insert({
    user_id: user.id,
    name: input.name.trim(),
    dose: input.dose?.trim() || null,
    frequency: input.frequency,
    frequency_label: input.frequency_label?.trim() || null,
    indefinite: input.indefinite,
    started_at: input.started_at || null,
    ended_at: input.indefinite ? null : (input.ended_at || null),
    last_changed_at: input.last_changed_at || null,
    notes: input.notes?.trim() || null,
  })
  return { error: error?.message }
}

export async function updateTreatment(id: string, input: Partial<TreatmentInput>): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  const { error } = await supabase
    .from('treatments')
    .update({
      ...input,
      dose: input.dose?.trim() || null,
      frequency_label: input.frequency_label?.trim() || null,
      ended_at: input.indefinite ? null : (input.ended_at || null),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
  return { error: error?.message }
}

export async function deleteTreatment(id: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  // Soft delete
  const { error } = await supabase
    .from('treatments')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
  return { error: error?.message }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/actions/treatments.ts
git commit -m "feat(actions): CRUD de treatments con server actions"
```

---

## Task 4: Componente `TreatmentsSection` para /cuenta

**Files:**
- Create: `frontend/components/TreatmentsSection.tsx`

Este componente reemplaza el TagInput de medicamentos en CuentaClient. Muestra la lista de tratamientos activos con nombre, dosis, frecuencia, inicio y si es indefinido. Permite agregar/editar/eliminar.

- [ ] **Step 1: Crear el componente**

```typescript
'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Check, Pill } from 'lucide-react'
import { createTreatment, updateTreatment, deleteTreatment } from '@/app/actions/treatments'
import { FREQUENCY_LABELS } from '@/lib/types'
import type { Treatment, TreatmentFrequency, TreatmentInput } from '@/lib/types'

const FREQUENCIES: TreatmentFrequency[] = [
  'once_daily', 'twice_daily', 'three_daily', 'four_daily', 'as_needed', 'other'
]

function emptyInput(): TreatmentInput {
  return {
    name: '',
    dose: '',
    frequency: 'once_daily',
    frequency_label: '',
    indefinite: true,
    started_at: '',
    ended_at: '',
    last_changed_at: '',
    notes: '',
  }
}

interface FormProps {
  initial?: TreatmentInput
  onSave: (data: TreatmentInput) => void
  onCancel: () => void
  loading: boolean
}

function TreatmentForm({ initial, onSave, onCancel, loading }: FormProps) {
  const [data, setData] = useState<TreatmentInput>(initial ?? emptyInput())

  function set<K extends keyof TreatmentInput>(key: K, value: TreatmentInput[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-muted/30">
      <div className="flex gap-2">
        <input
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
          placeholder="Nombre del medicamento *"
          value={data.name}
          onChange={e => set('name', e.target.value)}
        />
        <input
          className="h-10 w-28 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
          placeholder="Dosis"
          value={data.dose ?? ''}
          onChange={e => set('dose', e.target.value)}
        />
      </div>

      <select
        className="h-10 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
        value={data.frequency}
        onChange={e => set('frequency', e.target.value as TreatmentFrequency)}
      >
        {FREQUENCIES.map(f => (
          <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
        ))}
      </select>

      {data.frequency === 'other' && (
        <input
          className="h-10 rounded-lg border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
          placeholder="Describe la frecuencia"
          value={data.frequency_label ?? ''}
          onChange={e => set('frequency_label', e.target.value)}
        />
      )}

      <div className="flex gap-3 items-center">
        <label className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={data.indefinite}
            onChange={e => set('indefinite', e.target.checked)}
            className="accent-primary"
          />
          Tratamiento indefinido
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-sans text-[11px] text-muted-foreground/70 mb-1 block">Fecha de inicio</label>
          <input
            type="date"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50"
            value={data.started_at ?? ''}
            onChange={e => set('started_at', e.target.value)}
          />
        </div>
        {!data.indefinite && (
          <div>
            <label className="font-sans text-[11px] text-muted-foreground/70 mb-1 block">Fecha de fin</label>
            <input
              type="date"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50"
              value={data.ended_at ?? ''}
              onChange={e => set('ended_at', e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="font-sans text-[11px] text-muted-foreground/70 mb-1 block">Último cambio de dosis</label>
          <input
            type="date"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50"
            value={data.last_changed_at ?? ''}
            onChange={e => set('last_changed_at', e.target.value)}
          />
        </div>
      </div>

      <textarea
        className="rounded-lg border border-border bg-background px-3 py-2 font-sans text-[13px] focus:outline-none focus:border-primary/50 resize-none"
        placeholder="Notas (indicación, instrucciones especiales...)"
        rows={2}
        value={data.notes ?? ''}
        onChange={e => set('notes', e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={() => onSave(data)}
          disabled={loading || !data.name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:opacity-60 shadow-[var(--c-btn-primary-shadow)]"
        >
          <Check size={14} />
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border bg-transparent font-sans text-sm text-muted-foreground cursor-pointer"
        >
          <X size={14} />
          Cancelar
        </button>
      </div>
    </div>
  )
}

interface TreatmentRowProps {
  treatment: Treatment
  onEdit: () => void
  onDelete: () => void
}

function TreatmentRow({ treatment, onEdit, onDelete }: TreatmentRowProps) {
  const freq = treatment.frequency === 'other'
    ? (treatment.frequency_label ?? 'Otra frecuencia')
    : FREQUENCY_LABELS[treatment.frequency]

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Pill className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-[14px] font-medium text-foreground">{treatment.name}</span>
          {treatment.dose && (
            <span className="font-mono text-[11px] text-muted-foreground">{treatment.dose}</span>
          )}
        </div>
        <p className="font-sans text-[12px] text-muted-foreground mt-0.5">{freq}</p>
        <div className="flex gap-3 mt-1">
          {treatment.started_at && (
            <span className="font-mono text-[11px] text-muted-foreground/60">
              Desde {new Date(treatment.started_at + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </span>
          )}
          {treatment.indefinite && (
            <span className="font-mono text-[11px] text-muted-foreground/60">Indefinido</span>
          )}
          {treatment.last_changed_at && (
            <span className="font-mono text-[11px] text-muted-foreground/60">
              Cambio: {new Date(treatment.last_changed_at + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        {treatment.notes && (
          <p className="font-sans text-[12px] text-muted-foreground/70 mt-1 italic">{treatment.notes}</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-none bg-transparent cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

interface Props {
  initialTreatments: Treatment[]
}

export function TreatmentsSection({ initialTreatments }: Props) {
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate(data: TreatmentInput) {
    startTransition(async () => {
      const result = await createTreatment(data)
      if (!result.error) {
        // Refetch is handled by router.refresh() in parent — for now optimistic
        const optimistic: Treatment = {
          id: crypto.randomUUID(),
          user_id: '',
          name: data.name,
          dose: data.dose ?? null,
          frequency: data.frequency,
          frequency_label: data.frequency_label ?? null,
          indefinite: data.indefinite,
          started_at: data.started_at ?? null,
          ended_at: data.ended_at ?? null,
          last_changed_at: data.last_changed_at ?? null,
          notes: data.notes ?? null,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTreatments(prev => [...prev, optimistic])
        setShowForm(false)
      }
    })
  }

  function handleUpdate(id: string, data: TreatmentInput) {
    startTransition(async () => {
      const result = await updateTreatment(id, data)
      if (!result.error) {
        setTreatments(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
        setEditingId(null)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTreatment(id)
      if (!result.error) {
        setTreatments(prev => prev.filter(t => t.id !== id))
      }
    })
  }

  return (
    <div>
      {treatments.length === 0 && !showForm && (
        <p className="font-sans text-[13px] text-muted-foreground mb-4">
          No tienes tratamientos registrados.
        </p>
      )}

      {treatments.map(t => (
        editingId === t.id ? (
          <TreatmentForm
            key={t.id}
            initial={{
              name: t.name,
              dose: t.dose ?? '',
              frequency: t.frequency,
              frequency_label: t.frequency_label ?? '',
              indefinite: t.indefinite,
              started_at: t.started_at ?? '',
              ended_at: t.ended_at ?? '',
              last_changed_at: t.last_changed_at ?? '',
              notes: t.notes ?? '',
            }}
            onSave={(data) => handleUpdate(t.id, data)}
            onCancel={() => setEditingId(null)}
            loading={isPending}
          />
        ) : (
          <TreatmentRow
            key={t.id}
            treatment={t}
            onEdit={() => setEditingId(t.id)}
            onDelete={() => handleDelete(t.id)}
          />
        )
      ))}

      {showForm && (
        <TreatmentForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={isPending}
        />
      )}

      {!showForm && editingId === null && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-[10px] border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-sans text-[13px] cursor-pointer bg-transparent transition-colors"
        >
          <Plus size={14} />
          Agregar tratamiento
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/TreatmentsSection.tsx
git commit -m "feat(ui): TreatmentsSection con form completo y CRUD optimista"
```

---

## Task 5: Integrar `TreatmentsSection` en `/cuenta`

**Files:**
- Modify: `frontend/app/(shell)/cuenta/page.tsx`
- Modify: `frontend/app/(shell)/cuenta/CuentaClient.tsx`

- [ ] **Step 1: Modificar `cuenta/page.tsx` para fetchear treatments**

Reemplazar la línea:
```typescript
const medicalProfile = p?.plan === 'pro' ? await getMedicalProfile() : null
```

Con:
```typescript
import { getTreatments } from '@/app/actions/treatments'
import type { Treatment } from '@/lib/types'

// dentro de la función:
const [medicalProfile, treatments] = p?.plan === 'pro'
  ? await Promise.all([getMedicalProfile(), getTreatments()])
  : [null, [] as Treatment[]]
```

Y pasar `initialTreatments={treatments}` a `CuentaClient`.

- [ ] **Step 2: Modificar `CuentaClient.tsx`**

Agregar prop `initialTreatments: Treatment[]` al tipo de props.

Reemplazar la sección "Perfil médico" (actualmente el bloque de TagInput con medicamentos) con:

```tsx
import { TreatmentsSection } from '@/components/TreatmentsSection'

{/* Dentro de <Section title="Perfil médico"> — reemplazar TagInput medicamentos por: */}
<p className="font-sans text-[13px] text-muted-foreground mb-4">
  Aliis usa este contexto para personalizar tus explicaciones y El Hilo.
</p>
{/* Mantener edad, sexo, condiciones_previas, alergias */}
{/* Agregar debajo de todo: */}
<div className="mt-2">
  <p className="font-mono text-[11px] tracking-[.14em] uppercase text-muted-foreground/60 mb-3">
    Tratamientos activos
  </p>
  <TreatmentsSection initialTreatments={initialTreatments} />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(shell)/cuenta/page.tsx frontend/app/(shell)/cuenta/CuentaClient.tsx
git commit -m "feat(cuenta): integrar TreatmentsSection en perfil médico Pro"
```

---

## Task 6: Widget `TreatmentsWidget` para /diario

**Files:**
- Create: `frontend/components/TreatmentsWidget.tsx`
- Modify: `frontend/app/(shell)/diario/page.tsx`

El widget es compacto — muestra los tratamientos activos del día con su frecuencia. No permite editar (eso es en /cuenta).

- [ ] **Step 1: Crear el widget**

```typescript
import { Pill } from 'lucide-react'
import type { Treatment } from '@/lib/types'
import { FREQUENCY_LABELS } from '@/lib/types'
import Link from 'next/link'

interface Props {
  treatments: Treatment[]
}

export function TreatmentsWidget({ treatments }: Props) {
  if (treatments.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-0.5">
            Tratamientos
          </p>
          <h3 className="font-serif text-[15px] text-foreground leading-none">
            Mis <em>medicamentos</em>
          </h3>
        </div>
        <Link
          href="/cuenta"
          className="font-mono text-[10px] text-primary/60 hover:text-primary transition-colors no-underline"
        >
          Editar
        </Link>
      </div>

      <ul className="space-y-2">
        {treatments.map(t => {
          const freq = t.frequency === 'other'
            ? (t.frequency_label ?? '')
            : FREQUENCY_LABELS[t.frequency]
          return (
            <li key={t.id} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Pill className="w-3 h-3 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-[13px] font-medium text-foreground leading-tight">
                  {t.name}
                  {t.dose && <span className="font-normal text-muted-foreground ml-1">{t.dose}</span>}
                </p>
                <p className="font-sans text-[11px] text-muted-foreground">{freq}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Integrar en `diario/page.tsx`**

En `diario/page.tsx`, dentro del bloque de queries paralelas, agregar fetch de treatments:

```typescript
import { getTreatments } from '@/app/actions/treatments'
import { TreatmentsWidget } from '@/components/TreatmentsWidget'

// En el return, columna derecha, antes del AdherenceWrapper:
<TreatmentsWidget treatments={treatments} />
```

El `AdherenceWrapper` existente pasa `medications` — actualizar para que lea los nombres de los `treatments` activos:

```typescript
// En diario/page.tsx:
const treatments = showAdherence ? await getTreatments() : []
const medications = treatments.map(t => t.dose ? `${t.name} ${t.dose}` : t.name)
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/TreatmentsWidget.tsx frontend/app/(shell)/diario/page.tsx
git commit -m "feat(diario): TreatmentsWidget en columna derecha, medications desde treatments"
```

---

## Task 7: Mejorar `ElHilo` — fecha visible y estado generado

**Files:**
- Modify: `frontend/components/ElHilo.tsx`

El Hilo actualmente no muestra cuándo se generó. El usuario no sabe si es de este mes o de hace 3 días.

- [ ] **Step 1: Agregar fecha al cache key y mostrarla**

Modificar `ElHilo.tsx` para que el localStorage almacene `{ content, generatedAt }` en lugar de solo el string:

```typescript
// Cambiar el tipo de cache
interface CachedHilo {
  content: string
  generatedAt: string // ISO string
}

// En useEffect:
const raw = localStorage.getItem(CACHE_KEY(userId))
if (raw) {
  try {
    const parsed: CachedHilo = JSON.parse(raw)
    setContent(parsed.content)
    setGeneratedAt(parsed.generatedAt)
    setFromCache(true)
  } catch {
    // Legacy string cache
    setContent(raw)
    setFromCache(true)
  }
}

// En generate():
const generatedAt = data.generatedAt ?? new Date().toISOString()
setContent(data.content)
setGeneratedAt(generatedAt)
localStorage.setItem(CACHE_KEY(userId), JSON.stringify({ content: data.content, generatedAt }))
```

Agregar estado `generatedAt`:
```typescript
const [generatedAt, setGeneratedAt] = useState<string | null>(null)
```

Mostrar en el header del botón cuando hay contenido:
```typescript
// En el subtítulo del botón (bajo "El Hilo"):
{content && generatedAt && (
  <p className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">
    {new Date(generatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
  </p>
)}
```

Y en el footer del contenido expandido, reemplazar "Generado este mes" con la fecha exacta:
```typescript
<p className="font-mono text-[10px] text-muted-foreground/50">
  Generado el {generatedAt
    ? new Date(generatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'este mes'}
</p>
```

- [ ] **Step 2: Actualizar API route para devolver `generatedAt`**

En `frontend/app/api/aliis/hilo/route.ts`, en las dos respuestas (`cached` y `generated`):

```typescript
// Cached:
return Response.json({ content: cached.content, generatedAt: cached.generated_at, cached: true })

// Generated:
return Response.json({ content, generatedAt: new Date().toISOString(), cached: false })
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ElHilo.tsx frontend/app/api/aliis/hilo/route.ts
git commit -m "feat(hilo): mostrar fecha de generación en header y footer"
```

---

## Task 8: `AliisPresence` — chip persistente en sidebar

**Files:**
- Create: `frontend/components/AliisPresence.tsx`
- Modify: `frontend/components/Sidebar.tsx` (leer primero)

Este componente va al fondo del Sidebar (desktop) y en el AppShell. Muestra el logo de Aliis con un indicador de "activo" y el texto "Aliis AI" — al hacer click abre el chat drawer existente.

- [ ] **Step 1: Leer Sidebar.tsx primero**

```bash
cat frontend/components/Sidebar.tsx
```

- [ ] **Step 2: Crear `AliisPresence.tsx`**

```typescript
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'

interface Props {
  packId?: string
  chapterId?: string
}

export function AliisPresence({ packId, chapterId }: Props) {
  const [pulse, setPulse] = useState(true)

  // Si hay packId, abrir ChatDrawer; si no, navegar a /diario
  function handleClick() {
    if (packId) {
      // dispatch custom event que ChatDrawer escucha
      window.dispatchEvent(new CustomEvent('aliis:open-chat', { detail: { packId, chapterId } }))
    } else {
      window.location.href = '/diario'
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-colors border-none bg-transparent cursor-pointer text-left group"
    >
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
          <Image src="/assets/aliis-logo.png" alt="Aliis" width={32} height={32} className="object-contain" />
        </div>
        {pulse && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] font-medium text-foreground leading-none">Aliis AI</p>
        <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5 truncate">
          {packId ? 'Pregúntame algo' : 'Tu agente de salud'}
        </p>
      </div>
      <Sparkles className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
    </button>
  )
}
```

- [ ] **Step 3: Agregar al Sidebar**

Leer `Sidebar.tsx` para ver su estructura exacta. Agregar `<AliisPresence />` al fondo del sidebar, antes del cierre del nav, con un separador:

```typescript
import { AliisPresence } from './AliisPresence'

// Al fondo del sidebar, antes de cerrar:
<div className="mt-auto pt-3 border-t border-border">
  <AliisPresence />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/components/AliisPresence.tsx frontend/components/Sidebar.tsx
git commit -m "feat(nav): AliisPresence chip persistente en sidebar"
```

---

## Task 9: Actualizar `hilo/route.ts` para usar treatments en vez de medicamentos

**Files:**
- Modify: `frontend/app/api/aliis/hilo/route.ts`

Actualmente El Hilo lee `medicamentos` de `medical_profiles`. Con la nueva tabla `treatments`, debe leer de ahí para que el nombre + dosis + frecuencia enriquezcan la narrativa.

- [ ] **Step 1: Actualizar el fetch en `hilo/route.ts`**

Reemplazar:
```typescript
supabase.from('medical_profiles').select('medicamentos, condiciones_previas, edad, sexo').eq('user_id', user.id).maybeSingle(),
```

Con:
```typescript
supabase.from('treatments').select('name, dose, frequency, frequency_label, indefinite').eq('user_id', user.id).eq('active', true),
```

Actualizar la construcción del prompt:
```typescript
const treatments = treatmentsRes.data ?? []
const treatmentLines = treatments.map(t => {
  const freq = t.frequency === 'other' ? (t.frequency_label ?? '') : FREQUENCY_LABELS_MAP[t.frequency]
  return `- ${t.name}${t.dose ? ` ${t.dose}` : ''} — ${freq}${t.indefinite ? ' (indefinido)' : ''}`
}).join('\n')

// En userMessage, reemplazar la sección de medicamentos:
`TRATAMIENTOS ACTIVOS:\n${treatmentLines || 'Ninguno'}`
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/api/aliis/hilo/route.ts
git commit -m "feat(hilo): usar tabla treatments con frecuencia para narrativa enriquecida"
```

---

## Self-Review

### Spec coverage
- ✅ Tratamientos con frecuencia (once/twice/three/four daily, as_needed, other) — Task 1-2
- ✅ Tratamiento indefinido vs con fecha de fin — Task 1-2
- ✅ Último cambio de dosis (`last_changed_at`) — Task 1-2
- ✅ UI de tratamientos en /cuenta Pro — Task 4-5
- ✅ Widget de tratamientos en /diario — Task 6
- ✅ AdherenceSection lee de treatments — Task 6
- ✅ El Hilo muestra cuándo se generó — Task 7
- ✅ El Hilo usa treatments enriquecidos — Task 9
- ✅ AliisPresence en sidebar — Task 8

### Gaps identificados
- La migración mantiene `medical_profiles.medicamentos` intacto — compatibilidad backward OK, no hay breaking change
- `TreatmentsWidget` es server component (no client) — sin estado client, más simple y correcto
- `AliisPresence` usa `window.dispatchEvent` para comunicarse con ChatDrawer — revisar si ChatDrawer escucha ese evento antes de implementar Task 8 (ajustar si no)

### Type consistency
- `Treatment` definido en Task 2 y usado en Tasks 3, 4, 5, 6, 9 — consistente
- `FREQUENCY_LABELS` exportado desde `types.ts` — usado en TreatmentsSection, TreatmentsWidget, hilo/route.ts
- `TreatmentInput` definido en `actions/treatments.ts` — usado en TreatmentForm y handlers — consistente
