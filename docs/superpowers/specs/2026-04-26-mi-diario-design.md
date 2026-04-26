# Mi Diario — Design Spec

**Date:** 2026-04-26  
**Status:** Approved

---

## Goal

Add a "Mi Diario" page to the Aliis shell dashboard that consolidates two health-tracking tools: (1) AI-generated chat notes grouped by diagnosis, and (2) an independent symptom/vitals log with trend charts.

---

## Architecture

### Route

`/diario` — new Server Component page inside the `(shell)` group. Fetches notes and symptom logs server-side for the authenticated user.

### Navigation

New sidebar entry between "Mi expediente" and "Diagnósticos":

```
{ href: '/diario', label: 'Mi diario', icon: <BookHeart size={18} /> }
```

### Database

**Existing — `pack_notes`** (no changes):
- `id` uuid PK
- `pack_id` uuid FK → packs
- `user_id` uuid FK → profiles
- `content` text
- `created_at` timestamptz

**New — `symptom_logs`**:
- `id` uuid PK default gen_random_uuid()
- `user_id` uuid NOT NULL FK → profiles
- `logged_at` timestamptz NOT NULL default now()
- `glucose` numeric nullable (mg/dL)
- `bp_systolic` int nullable (mmHg)
- `bp_diastolic` int nullable (mmHg)
- `heart_rate` int nullable (lpm)
- `weight` numeric nullable (kg)
- `temperature` numeric nullable (°C)
- `note` text nullable

RLS: users can only SELECT/INSERT/DELETE their own rows (`user_id = auth.uid()`).

---

## Page Layout

Single column, `max-w-[680px] mx-auto px-8 pt-10 pb-20` — identical to `/historial`.

### Header

```
PageHeader eyebrow="Mi diario" title={<>Tu <em>diario</em> de salud</>}
```

---

## Section 1: Apuntes

Counter line: `"X diagnósticos con apuntes"` in muted monospace.

List of packs that have at least one `pack_notes` row for the user. Each pack renders as an accordion item (shadcn `Accordion`, `type="multiple"`) with:

- **Trigger**: `pack.dx` (diagnosis name) + `created_at` formatted as relative date (e.g. "hace 3 días")
- **Content**: The note `content` rendered with `FormattedText` (same component used in ChatDrawer)

The server query joins `pack_notes` with `packs` to get `dx` and `created_at`. Ordered by pack `created_at` descending.

If no notes exist: empty state — `"Aún no tienes apuntes. Genera uno desde la conversación con Aliis."` with a link to `/historial`.

---

## Section 2: Síntomas

### Header row

`"Síntomas y signos vitales"` section label (monospace eyebrow) + `"Registrar"` button (primary style, opens the log modal).

### Log Modal (shadcn Dialog)

Title: `"Nuevo registro"`

Form fields (all optional, labeled in Spanish):
- Glucosa — number input, placeholder `"mg/dL"`
- Tensión arterial — two inputs side by side: Sistólica / Diastólica, placeholder `"mmHg"`
- Frecuencia cardíaca — number input, placeholder `"lpm"`
- Peso — number input, placeholder `"kg"`
- Temperatura — number input, placeholder `"°C"`
- Nota — textarea, placeholder `"¿Cómo te sentías?"`

Validation: at least one numeric field must have a value before enabling submit. `logged_at` is set server-side to `now()`.

Submit calls `POST /api/symptoms` → inserts into `symptom_logs` → closes modal → optimistic UI: prepend new row to local list + refresh chart data.

### Trend Chart

Library: **Recharts** (`recharts` package). `LineChart` with `ResponsiveContainer`.

X-axis: `logged_at` formatted as `dd/MM` (date-fns).  
Y-axis: auto-scaled per metric.

Each metric is a separate `<Line>` with a distinct color:
- Glucosa → `hsl(var(--primary))` (teal)
- Tensión sistólica → `#e74c3c` (red)
- Tensión diastólica → `#e67e22` (amber)
- Frecuencia cardíaca → `#8e44ad` (purple)
- Peso → `#27ae60` (green)
- Temperatura → `#2980b9` (blue)

**Metric chips**: row of toggle chips above the chart (one per metric). Active chip = filled background. Only active metrics show their line. Default: all active.

**Data window**: last 90 `symptom_logs` rows for the user, ordered by `logged_at` ascending. Loaded server-side and passed as prop to a Client Component `<SymptomsSection>`.

If fewer than 2 data points: chart is hidden, show message `"Necesitas al menos 2 registros para ver tendencias."`.

### Recent Logs List

Below the chart: chronological list (newest first) of all `symptom_logs` rows. Each row shows:
- Date + time (formatted)
- Non-null metric values as small pills: e.g. `Glucosa 95 mg/dL`, `TA 120/80`, `FC 72 lpm`
- Note text if present (muted, italic)
- Delete button (icon, calls `DELETE /api/symptoms/[id]` → removes row + refreshes)

---

## API Routes

### `POST /api/symptoms`

Auth-gated (server-side session). Body:
```typescript
{
  glucose?: number
  bp_systolic?: number
  bp_diastolic?: number
  heart_rate?: number
  weight?: number
  temperature?: number
  note?: string
}
```
Validates at least one numeric field is present and within sane ranges (glucose 1–1000, bp 1–300, hr 1–300, weight 1–500, temp 30–45). Inserts into `symptom_logs` with `user_id` from session. Returns inserted row.

### `DELETE /api/symptoms/[id]`

Auth-gated. Verifies `user_id = auth.uid()` before deleting. Returns `{ ok: true }`.

---

## Component Decomposition

| File | Type | Responsibility |
|------|------|----------------|
| `app/(shell)/diario/page.tsx` | Server | Fetch notes + symptom logs, render layout |
| `components/DiarioNotesSection.tsx` | Client | Accordion of notes with FormattedText |
| `components/SymptomsSection.tsx` | Client | Chart + modal + log list (all symptom interactivity) |
| `app/api/symptoms/route.ts` | API | POST — insert symptom log |
| `app/api/symptoms/[id]/route.ts` | API | DELETE — remove symptom log |

`FormattedText` is reused from `ChatDrawer.tsx` — extract to `components/FormattedText.tsx` as a shared module.

---

## Types (additions to `frontend/lib/types.ts`)

```typescript
export interface SymptomLog {
  id: string
  user_id: string
  logged_at: string
  glucose: number | null
  bp_systolic: number | null
  bp_diastolic: number | null
  heart_rate: number | null
  weight: number | null
  temperature: number | null
  note: string | null
}

export interface NoteWithPack {
  id: string
  pack_id: string
  content: string
  created_at: string
  dx: string
  pack_created_at: string
}
```

---

## Data Flow

```
/diario (Server Component)
  ├── supabase: pack_notes JOIN packs WHERE user_id = X → NoteWithPack[]
  ├── supabase: symptom_logs WHERE user_id = X ORDER BY logged_at ASC LIMIT 90 → SymptomLog[]
  ├── <DiarioNotesSection notes={NoteWithPack[]} />  [Client]
  └── <SymptomsSection logs={SymptomLog[]} />        [Client]
        ├── State: activeMetrics (Set<string>), modalOpen, localLogs
        ├── Recharts LineChart (filtered by activeMetrics)
        ├── Log modal → POST /api/symptoms → prepend to localLogs
        └── Delete → DELETE /api/symptoms/[id] → remove from localLogs
```

---

## Constraints

- All copy in Spanish.
- No mock data — everything from real Supabase.
- Recharts must be added as a dependency (`npm install recharts` in `/frontend/`).
- `FormattedText` extracted from ChatDrawer before building DiarioNotesSection.
- RLS policies on `symptom_logs` must be created alongside the table migration.
- The page must not break the existing scroll behavior (keep `h-full` chain in shell layout).
