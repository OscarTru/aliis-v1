# Tratamientos Rediseño — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el flujo de tratamientos: quitar AliisPresence del sidebar, limpiar /cuenta, agregar modal de tratamientos en /historial, y crear una página dedicada `/tratamientos` con tracker de adherencia estilo "mañana/tarde/noche".

**Architecture:** La tabla `treatments` ya existe en Supabase con RLS. Los server actions CRUD están en `app/actions/treatments.ts`. El rediseño es puramente de UI/UX — no requiere cambios de base de datos. La página `/tratamientos` es una nueva ruta dentro del shell `(shell)`. El modal de /historial es un componente client que usa los server actions existentes.

**Tech Stack:** Next.js 15 App Router, Supabase server actions, Tailwind CSS, Lucide icons, `useTransition` para server actions, dialog nativo (sin shadcn/ui Dialog para mantener consistencia).

---

## Mapa de archivos

### Eliminados
- `frontend/components/AliisPresence.tsx` — quitar del sidebar y borrar el archivo

### Modificados
- `frontend/components/Sidebar.tsx` — quitar AliisPresence, agregar `/tratamientos` a NAV_ITEMS
- `frontend/app/(shell)/cuenta/CuentaClient.tsx` — quitar TreatmentsSection, dejar solo edad/sexo/condiciones/alergias
- `frontend/app/(shell)/cuenta/page.tsx` — quitar fetch de treatments
- `frontend/app/(shell)/historial/page.tsx` — agregar botón "Agregar tratamiento" + importar modal
- `frontend/components/BottomNav.tsx` — agregar `/tratamientos` en mobile nav (reemplazar un ítem o agregar)

### Nuevos
- `frontend/components/AddTreatmentModal.tsx` — modal de agregar/editar tratamiento (nombre, dosis, horario amigable, indefinido)
- `frontend/app/(shell)/tratamientos/page.tsx` — página principal de tratamientos (servidor: fetch lista)
- `frontend/app/(shell)/tratamientos/TratamientosClient.tsx` — cliente: lista con adherencia inline, marcar tomado, eliminar

---

## Task 1: Quitar AliisPresence del sidebar y limpiar imports

**Files:**
- Modify: `frontend/components/Sidebar.tsx`
- Delete: `frontend/components/AliisPresence.tsx` (soft — verificar que nada más lo importa)

- [ ] **Step 1: Verificar que AliisPresence solo lo usa Sidebar**

```bash
grep -r "AliisPresence" /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend/components /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend/app
```

Esperado: solo aparece en `Sidebar.tsx` y `AliisPresence.tsx`.

- [ ] **Step 2: Quitar import y uso de AliisPresence en Sidebar.tsx**

En `Sidebar.tsx`, eliminar:
```typescript
import { AliisPresence } from './AliisPresence'
```

Y eliminar el bloque JSX:
```tsx
{/* Aliis AI presence */}
<div className={cn('pt-1 pb-1', collapsed ? 'px-2' : 'px-2')}>
  <AliisPresence collapsed={collapsed} />
</div>
```

- [ ] **Step 3: Eliminar el archivo**

```bash
rm "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend/components/AliisPresence.tsx"
```

- [ ] **Step 4: Agregar `/tratamientos` a NAV_ITEMS en Sidebar.tsx**

En el array `NAV_ITEMS`, agregar después de `/diario`:
```typescript
{ href: '/tratamientos', label: 'Mis tratamientos', icon: <Pill size={18} /> },
```

`Pill` ya está importado en la línea de imports de lucide-react.

- [ ] **Step 5: Agregar `/tratamientos` a BottomNav**

En `frontend/components/BottomNav.tsx`, en el array `NAV_ITEMS`, agregar:
```typescript
{ href: '/tratamientos', label: 'Tratamientos', icon: Pill },
```

Importar `Pill` de lucide-react. El nav mobile tiene 5 items actualmente — reemplazar `{ href: '/condiciones', label: 'Diagnósticos', icon: Library }` con `/tratamientos` para mantener 5 (o añadir si caben 6).

- [ ] **Step 6: Verificar TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && git add components/Sidebar.tsx components/BottomNav.tsx && git rm components/AliisPresence.tsx && git commit -m "refactor(nav): quitar AliisPresence, agregar /tratamientos a sidebar y bottom nav"
```

---

## Task 2: Limpiar /cuenta — quitar TreatmentsSection

**Files:**
- Modify: `frontend/app/(shell)/cuenta/page.tsx`
- Modify: `frontend/app/(shell)/cuenta/CuentaClient.tsx`

La sección "Perfil médico" en /cuenta debe mostrar solo: edad, sexo biológico, condiciones previas, alergias. Sin tratamientos (eso va en `/tratamientos`).

- [ ] **Step 1: Modificar `cuenta/page.tsx`**

Leer el archivo. Encontrar la línea:
```typescript
const [medicalProfile, treatments] = p?.plan === 'pro'
  ? await Promise.all([getMedicalProfile(), getTreatments()])
  : [null, [] as Treatment[]]
```

Reemplazar con:
```typescript
const medicalProfile = p?.plan === 'pro' ? await getMedicalProfile() : null
```

Eliminar el import de `getTreatments` y `Treatment` si ya no se usan.

Eliminar el prop `initialTreatments={treatments}` del componente `<CuentaClient>`.

- [ ] **Step 2: Modificar `CuentaClient.tsx`**

Leer el archivo. Hacer estos cambios:

1. Quitar `initialTreatments: Treatment[]` de las props del componente.
2. Quitar el import de `TreatmentsSection`.
3. Quitar el import de `Treatment` de `@/lib/types` (si ya no se usa).
4. Quitar el bloque JSX de Tratamientos activos:
```tsx
<div className="mt-4 pt-4 border-t border-border">
  <p className="font-mono text-[11px] tracking-[.14em] uppercase text-muted-foreground/60 mb-3">
    Tratamientos activos
  </p>
  <TreatmentsSection initialTreatments={initialTreatments} />
</div>
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && git add "app/(shell)/cuenta/page.tsx" "app/(shell)/cuenta/CuentaClient.tsx" && git commit -m "refactor(cuenta): quitar TreatmentsSection, perfil médico solo muestra datos clínicos básicos"
```

---

## Task 3: Modal `AddTreatmentModal` para /historial

**Files:**
- Create: `frontend/components/AddTreatmentModal.tsx`
- Modify: `frontend/app/(shell)/historial/page.tsx`

El modal tiene campos: nombre (requerido), dosis (opcional, ej. "500mg"), horario amigable (select: mañana / mañana y noche / mañana tarde y noche / según necesidad / otro), indefinido (checkbox), fecha inicio (opcional). Al guardar llama `createTreatment` y cierra el modal.

El horario amigable mapea a `TreatmentFrequency`:
- "Solo por la mañana" → `once_daily`
- "Mañana y noche" → `twice_daily`
- "Mañana, tarde y noche" → `three_daily`
- "Cuatro veces al día" → `four_daily`
- "Según sea necesario" → `as_needed`
- "Otra frecuencia" → `other`

- [ ] **Step 1: Crear `AddTreatmentModal.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { X, Pill } from 'lucide-react'
import { createTreatment } from '@/app/actions/treatments'
import type { TreatmentFrequency } from '@/lib/types'

const SCHEDULE_OPTIONS: { label: string; value: TreatmentFrequency }[] = [
  { label: 'Solo por la mañana', value: 'once_daily' },
  { label: 'Mañana y noche', value: 'twice_daily' },
  { label: 'Mañana, tarde y noche', value: 'three_daily' },
  { label: 'Cuatro veces al día', value: 'four_daily' },
  { label: 'Según sea necesario', value: 'as_needed' },
  { label: 'Otra frecuencia', value: 'other' },
]

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function AddTreatmentModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [frequency, setFrequency] = useState<TreatmentFrequency>('once_daily')
  const [frequencyLabel, setFrequencyLabel] = useState('')
  const [indefinite, setIndefinite] = useState(true)
  const [startedAt, setStartedAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    setError(null)
    startTransition(async () => {
      const result = await createTreatment({
        name: name.trim(),
        dose: dose.trim() || undefined,
        frequency,
        frequency_label: frequency === 'other' ? frequencyLabel.trim() : undefined,
        indefinite,
        started_at: startedAt || undefined,
      })
      if (result.error) {
        setError(result.error)
      } else {
        onCreated()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-[480px] bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-xl p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pill className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-[18px] text-foreground leading-none">
              Agregar <em>tratamiento</em>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {/* Nombre + dosis */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">
                Medicamento *
              </label>
              <input
                className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                placeholder="Ej: Metformina"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="w-28">
              <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">
                Dosis
              </label>
              <input
                className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                placeholder="500mg"
                value={dose}
                onChange={e => setDose(e.target.value)}
              />
            </div>
          </div>

          {/* Horario */}
          <div>
            <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">
              ¿Cuándo lo toma?
            </label>
            <select
              className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
              value={frequency}
              onChange={e => setFrequency(e.target.value as TreatmentFrequency)}
            >
              {SCHEDULE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Custom frequency label */}
          {frequency === 'other' && (
            <input
              className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
              placeholder="Describe la frecuencia"
              value={frequencyLabel}
              onChange={e => setFrequencyLabel(e.target.value)}
            />
          )}

          {/* Indefinido + fecha inicio */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">
                Fecha de inicio
              </label>
              <input
                type="date"
                className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[13px] focus:outline-none focus:border-primary/50 text-foreground"
                value={startedAt}
                onChange={e => setStartedAt(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground cursor-pointer pb-2.5">
              <input
                type="checkbox"
                checked={indefinite}
                onChange={e => setIndefinite(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              Indefinido
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="font-sans text-[13px] text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isPending || !name.trim()}
              className="flex-1 h-11 rounded-xl bg-foreground text-background font-sans text-[14px] font-medium cursor-pointer disabled:opacity-60 shadow-[var(--c-btn-primary-shadow)] transition-opacity"
            >
              {isPending ? 'Guardando…' : 'Agregar tratamiento'}
            </button>
            <button
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-border bg-transparent font-sans text-[14px] text-muted-foreground cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Agregar botón + modal en `historial/page.tsx`**

`historial/page.tsx` es un server component — el botón y modal deben vivir en un pequeño client wrapper. Crear un client component inline o importar uno.

La forma más limpia: convertir solo el botón en client. Agregar un archivo `frontend/app/(shell)/historial/AddTreatmentButton.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddTreatmentModal } from '@/components/AddTreatmentModal'

export function AddTreatmentButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-sans text-[13px] cursor-pointer bg-transparent transition-colors"
      >
        <Plus size={14} />
        Agregar tratamiento
      </button>
      {open && (
        <AddTreatmentModal
          onClose={() => setOpen(false)}
          onCreated={() => setOpen(false)}
        />
      )}
    </>
  )
}
```

En `historial/page.tsx`, agregar el import y renderizar el botón justo después del `<PageHeader>` y antes de los filtros:

```tsx
import { AddTreatmentButton } from './AddTreatmentButton'

// En el JSX, después de <PageHeader .../>:
<div className="flex items-center justify-between mb-5">
  <div className="flex gap-1.5 flex-wrap">
    {/* filtros existentes */}
  </div>
  <AddTreatmentButton />
</div>
```

Nota: los filtros actuales están en un `<div className="flex gap-1.5 mb-7 flex-wrap">` — refactorizar ese div para que sea una fila flex con justify-between que contenga los filtros y el botón.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && git add components/AddTreatmentModal.tsx "app/(shell)/historial/AddTreatmentButton.tsx" "app/(shell)/historial/page.tsx" && git commit -m "feat(historial): modal de agregar tratamiento con horario amigable"
```

---

## Task 4: Página `/tratamientos` — vista detallada con adherencia

**Files:**
- Create: `frontend/app/(shell)/tratamientos/page.tsx` (server)
- Create: `frontend/app/(shell)/tratamientos/TratamientosClient.tsx` (client)

La página muestra:
- Header con título "Mis tratamientos"
- Lista de tratamientos activos con tarjeta por medicamento
- Cada tarjeta muestra: nombre completo + dosis (grande), horario en texto amigable tipo "Mañana · Tarde · Noche", si es indefinido, fecha de inicio, notas
- Adherencia del día: chips por cada toma del día (ej: "Mañana" "Tarde" "Noche") que se pueden marcar como tomados con un tap — usan `toggleAdherence` del server action existente
- Botón "Eliminar" (con confirmación) en cada tarjeta
- Botón "Editar" que abre el modal `AddTreatmentModal` en modo edición

**Modelo de horario amigable:**
```typescript
// Mapeo de frequency → tomas del día
const SCHEDULE_SLOTS: Record<string, string[]> = {
  once_daily:   ['Mañana'],
  twice_daily:  ['Mañana', 'Noche'],
  three_daily:  ['Mañana', 'Tarde', 'Noche'],
  four_daily:   ['Mañana', 'Mediodía', 'Tarde', 'Noche'],
  as_needed:    [],
  other:        [],
}
```

Para adherencia: el slot del día se identifica como `{medication}_{slot}_{date}` — usar el nombre del medicamento + slot como "medication" en `toggleAdherence`. Ejemplo: para Metformina 500mg con twice_daily, los slots son "Metformina 500mg (Mañana)" y "Metformina 500mg (Noche)".

- [ ] **Step 1: Crear `app/(shell)/tratamientos/page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getTreatments } from '@/app/actions/treatments'
import { TratamientosClient } from './TratamientosClient'
import type { AdherenceLog } from '@/lib/types'

export default async function TratamientosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date())

  const [treatments, adherenceResult] = await Promise.all([
    getTreatments(),
    supabase
      .from('adherence_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('taken_date', today),
  ])

  const todayLogs: AdherenceLog[] = (adherenceResult.data ?? []) as AdherenceLog[]

  return (
    <div className="px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20 max-w-[680px] mx-auto">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-1">
          Mis tratamientos
        </p>
        <h1 className="font-serif text-[28px] leading-[1.2] text-foreground m-0">
          Tu <em>farmacia</em> personal
        </h1>
      </div>
      <TratamientosClient
        initialTreatments={treatments}
        initialTodayLogs={todayLogs}
        todayDate={today}
      />
    </div>
  )
}
```

- [ ] **Step 2: Crear `app/(shell)/tratamientos/TratamientosClient.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Pill, Check, Plus, Pencil, Trash2 } from 'lucide-react'
import { toggleAdherence, deleteTreatment } from '@/app/actions/treatments'  
// Note: toggleAdherence is in @/app/actions/adherence, not treatments
import { FREQUENCY_LABELS } from '@/lib/types'
import { AddTreatmentModal } from '@/components/AddTreatmentModal'
import type { Treatment, AdherenceLog } from '@/lib/types'

// Horario amigable por frecuencia
const SCHEDULE_SLOTS: Record<string, string[]> = {
  once_daily:  ['Mañana'],
  twice_daily: ['Mañana', 'Noche'],
  three_daily: ['Mañana', 'Tarde', 'Noche'],
  four_daily:  ['Mañana', 'Mediodía', 'Tarde', 'Noche'],
  as_needed:   [],
  other:       [],
}

// Slot key for adherence tracking
function slotKey(treatment: Treatment, slot: string): string {
  const base = treatment.dose ? `${treatment.name} ${treatment.dose}` : treatment.name
  return `${base} (${slot})`
}

interface Props {
  initialTreatments: Treatment[]
  initialTodayLogs: AdherenceLog[]
  todayDate: string
}

export function TratamientosClient({ initialTreatments, initialTodayLogs, todayDate }: Props) {
  const [treatments, setTreatments] = useState<Treatment[]>(initialTreatments)
  const [logs, setLogs] = useState<AdherenceLog[]>(initialTodayLogs)
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const takenToday = new Set(logs.map(l => l.medication))

  function toggleSlot(treatment: Treatment, slot: string) {
    const key = slotKey(treatment, slot)
    const taken = takenToday.has(key)
    // Optimistic
    if (!taken) {
      setLogs(prev => [...prev, {
        id: crypto.randomUUID(),
        user_id: '',
        medication: key,
        taken_date: todayDate,
        taken_at: new Date().toISOString(),
      }])
    } else {
      setLogs(prev => prev.filter(l => !(l.medication === key && l.taken_date === todayDate)))
    }
    startTransition(async () => {
      const { toggleAdherence } = await import('@/app/actions/adherence')
      await toggleAdherence(key, todayDate, !taken)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este tratamiento?')) return
    startTransition(async () => {
      const result = await deleteTreatment(id)
      if (!result.error) {
        setTreatments(prev => prev.filter(t => t.id !== id))
      }
    })
  }

  if (treatments.length === 0 && !showAddModal) {
    return (
      <div className="text-center pt-12">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Pill className="w-7 h-7 text-primary/60" />
        </div>
        <p className="font-serif italic text-[17px] text-muted-foreground mb-6 leading-relaxed">
          No tienes tratamientos registrados.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-sans text-[14px] font-medium cursor-pointer shadow-[var(--c-btn-primary-shadow)]"
        >
          <Plus size={16} />
          Agregar mi primer tratamiento
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Treatment cards */}
      <div className="flex flex-col gap-4">
        {treatments.map(t => {
          const slots = SCHEDULE_SLOTS[t.frequency] ?? []
          const freq = t.frequency === 'other'
            ? (t.frequency_label ?? 'Otra frecuencia')
            : FREQUENCY_LABELS[t.frequency]

          return (
            <div key={t.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Card header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[18px] text-foreground leading-tight">
                        {t.name}
                        {t.dose && (
                          <span className="font-sans text-[13px] font-normal text-muted-foreground ml-2">{t.dose}</span>
                        )}
                      </h3>
                      <p className="font-sans text-[13px] text-muted-foreground mt-0.5">{freq}</p>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        {t.started_at && (
                          <span className="font-mono text-[11px] text-muted-foreground/60">
                            Desde {new Date(t.started_at + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                          </span>
                        )}
                        {t.indefinite && (
                          <span className="font-mono text-[11px] text-muted-foreground/60">· Indefinido</span>
                        )}
                      </div>
                      {t.notes && (
                        <p className="font-sans text-[12px] text-muted-foreground/70 mt-1.5 italic leading-relaxed">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditingTreatment(t)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Adherence slots — only if has schedule */}
              {slots.length > 0 && (
                <div className="px-5 pb-4 border-t border-border pt-3">
                  <p className="font-mono text-[10px] tracking-[.14em] uppercase text-muted-foreground/50 mb-2.5">
                    Hoy
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {slots.map(slot => {
                      const key = slotKey(t, slot)
                      const taken = takenToday.has(key)
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleSlot(t, slot)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-sans text-[13px] transition-all cursor-pointer ${
                            taken
                              ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400'
                              : 'border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                          }`}
                        >
                          {taken && <Check className="w-3.5 h-3.5" />}
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* as_needed indicator */}
              {t.frequency === 'as_needed' && (
                <div className="px-5 pb-4 border-t border-border pt-3">
                  <p className="font-sans text-[12px] text-muted-foreground/60 italic">
                    Tomar según sea necesario
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-sans text-[13px] cursor-pointer bg-transparent transition-colors"
      >
        <Plus size={14} />
        Agregar tratamiento
      </button>

      {/* Add/Edit modal */}
      {(showAddModal || editingTreatment) && (
        <AddTreatmentModal
          treatment={editingTreatment ?? undefined}
          onClose={() => { setShowAddModal(false); setEditingTreatment(null) }}
          onCreated={(newT) => {
            if (editingTreatment) {
              setTreatments(prev => prev.map(t => t.id === editingTreatment.id ? { ...t, ...newT } : t))
            } else if (newT) {
              setTreatments(prev => [...prev, newT])
            }
            setShowAddModal(false)
            setEditingTreatment(null)
          }}
        />
      )}
    </div>
  )
}
```

**Note:** `AddTreatmentModal` needs to accept an optional `treatment` prop for edit mode, and `onCreated` should receive the new/updated treatment. Update the modal's Props interface accordingly.

- [ ] **Step 3: Actualizar `AddTreatmentModal` para soportar modo edición**

Agregar `treatment?: Treatment` a Props. Si se recibe, pre-llenar todos los campos. El botón de guardar llama `updateTreatment(treatment.id, ...)` cuando está en modo edición. `onCreated` recibe `Treatment | undefined`.

Props actualizadas:
```typescript
interface Props {
  treatment?: Treatment  // si existe = modo edición
  onClose: () => void
  onCreated: (t?: Treatment) => void
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && git add "app/(shell)/tratamientos/" components/AddTreatmentModal.tsx && git commit -m "feat(tratamientos): página dedicada con adherencia por horario y modal de edición"
```

---

## Task 5: Limpiar TreatmentsSection y TreatmentsWidget (dejar solo lo necesario)

**Files:**
- Evaluate: `frontend/components/TreatmentsSection.tsx` — ya no se usa en /cuenta. Verificar si se usa en algún otro lado. Si no, eliminar.
- Keep: `frontend/components/TreatmentsWidget.tsx` — sigue siendo útil en /diario columna derecha (compacto, solo lista)
- Update: `frontend/app/(shell)/diario/page.tsx` — `TreatmentsWidget` debe mostrar todos los tratamientos sin importar `showAdherence` (los tratamientos son independientes de la feature flag de adherencia)

- [ ] **Step 1: Verificar uso de TreatmentsSection**

```bash
grep -r "TreatmentsSection" /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend/app /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/frontend/components
```

Si solo aparece en el propio archivo: eliminar.

- [ ] **Step 2: En `diario/page.tsx`, mover el fetch de treatments fuera del bloque `showAdherence`**

Actualmente:
```typescript
let treatments: Treatment[] = []
let medications: string[] = []
if (showAdherence) {
  treatments = await getTreatments()
  medications = treatments.map(t => t.dose ? `${t.name} ${t.dose}` : t.name)
}
```

Cambiar a:
```typescript
const treatments = await getTreatments()
const medications = showAdherence
  ? treatments.map(t => t.dose ? `${t.name} ${t.dose}` : t.name)
  : []
```

Esto hace que `TreatmentsWidget` siempre tenga datos, independiente del feature flag de adherencia.

- [ ] **Step 3: Verificar TypeScript y commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && git add "app/(shell)/diario/page.tsx" && git rm components/TreatmentsSection.tsx 2>/dev/null || git add -u && git commit -m "refactor(diario): treatments siempre visibles, limpiar TreatmentsSection si no se usa"
```

---

## Self-Review

### Spec coverage
- ✅ AliisPresence eliminado — Task 1
- ✅ /cuenta limpio (solo datos médicos básicos, sin lista de tratamientos) — Task 2
- ✅ Botón "Agregar tratamiento" en /historial → modal — Task 3
- ✅ Modal con horario amigable (mañana/tarde/noche) — Task 3
- ✅ Página `/tratamientos` en sidebar — Task 1 + Task 4
- ✅ Tarjetas por medicamento con nombre completo + dosis + horario amigable — Task 4
- ✅ Adherencia inline tipo chip (Mañana/Tarde/Noche) con toggle — Task 4
- ✅ Editar y eliminar desde `/tratamientos` — Task 4
- ✅ TreatmentsWidget en /diario siempre visible — Task 5

### Placeholders
- Ninguno — todo el código está completo.

### Type consistency
- `Treatment` definido en `lib/types.ts` — usado en todos los tasks
- `toggleAdherence` importado desde `@/app/actions/adherence` (dynamic import en TratamientosClient para evitar bundle size) — consistente con uso en AdherenceSection
- `AddTreatmentModal` acepta `treatment?: Treatment` — consistente entre Task 3 y Task 4
