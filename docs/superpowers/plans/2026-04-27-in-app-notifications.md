# In-App Notifications System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a persistent in-app notification system with a bell dropdown, unread badge, and read/read-all actions — designed to sync with a future mobile app.

**Architecture:** A `notifications` Supabase table stores all notifications per user with type, read status, and metadata. API routes handle list/read. The existing `NotificationBell` component is replaced with a full dropdown bandeja. The daily cron (`/api/aliis/notify`) inserts a notification row in addition to sending push.

**Tech Stack:** Next.js 15 App Router, Supabase (RLS), TypeScript, Tailwind CSS, lucide-react

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `frontend/migrations/20260427_notifications.sql` | Create | DB table + RLS |
| `frontend/lib/types.ts` | Modify | Add `AppNotification` interface |
| `frontend/app/api/notifications/route.ts` | Create | `GET` list (last 30), `POST` create (service role only) |
| `frontend/app/api/notifications/[id]/route.ts` | Create | `PATCH` mark single read |
| `frontend/app/api/notifications/read-all/route.ts` | Create | `PATCH` mark all read |
| `frontend/components/NotificationBell.tsx` | Replace | Full dropdown with bandeja |
| `frontend/app/api/aliis/notify/route.ts` | Modify | Insert notification row after push |

---

## Task 1: DB migration — `notifications` table

**Files:**
- Create: `frontend/migrations/20260427_notifications.sql`

- [ ] **Step 1: Create migration file**

```sql
create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  title        text not null,
  body         text not null,
  type         text not null default 'reminder',
  read         boolean not null default false,
  read_at      timestamptz,
  url          text,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_user_created
  on notifications (user_id, created_at desc);

alter table notifications enable row level security;

create policy "Users read own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users update own notifications" on notifications
  for update using (auth.uid() = user_id);

create policy "Service role insert notifications" on notifications
  for insert with check (true);
```

- [ ] **Step 2: Apply via Supabase MCP**

Use the `mcp__plugin_supabase_supabase__apply_migration` tool with:
- `project_id`: `cdnecuufkdykybisqybm`
- `name`: `20260427_notifications`
- `query`: (the SQL above)

Expected: `{"success": true}`

- [ ] **Step 3: Commit**

```bash
git add frontend/migrations/20260427_notifications.sql
git commit -m "feat(notifications): add notifications table with RLS"
```

---

## Task 2: TypeScript type

**Files:**
- Modify: `frontend/lib/types.ts`

- [ ] **Step 1: Append `AppNotification` interface**

Add at the end of `frontend/lib/types.ts`:

```typescript
export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'reminder' | 'insight' | 'red_flag' | string
  read: boolean
  read_at: string | null
  url: string | null
  created_at: string
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend && npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat(notifications): add AppNotification type"
```

---

## Task 3: GET /api/notifications + POST (service role)

**Files:**
- Create: `frontend/app/api/notifications/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — returns last 30 notifications for the authenticated user
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) return Response.json({ error: 'Error al obtener notificaciones' }, { status: 500 })
  return Response.json(data ?? [])
}

// POST — internal/service-role only, used by cron and other server code
// Requires header: x-service-key matching SUPABASE_SERVICE_ROLE_KEY
export async function POST(req: Request) {
  const serviceKey = req.headers.get('x-service-key')
  if (serviceKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Body inválido' }, { status: 400 }) }

  const b = body as Record<string, unknown>
  if (!b.user_id || !b.title || !b.body) {
    return Response.json({ error: 'user_id, title y body son requeridos' }, { status: 400 })
  }

  const { data, error } = await serviceSupabase
    .from('notifications')
    .insert({
      user_id: b.user_id as string,
      title: (b.title as string).slice(0, 100),
      body: (b.body as string).slice(0, 500),
      type: typeof b.type === 'string' ? b.type : 'reminder',
      url: typeof b.url === 'string' ? b.url : null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al crear notificación' }, { status: 500 })
  return Response.json(data, { status: 201 })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend && npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/api/notifications/route.ts"
git commit -m "feat(notifications): GET list and POST create endpoints"
```

---

## Task 4: PATCH /api/notifications/[id] — mark single read

**Files:**
- Create: `frontend/app/api/notifications/[id]/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al actualizar' }, { status: 500 })
  return Response.json(data)
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/api/notifications/[id]/route.ts"
git commit -m "feat(notifications): PATCH mark single notification read"
```

---

## Task 5: PATCH /api/notifications/read-all

**Files:**
- Create: `frontend/app/api/notifications/read-all/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) return Response.json({ error: 'Error al actualizar' }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/app/api/notifications/read-all/route.ts"
git commit -m "feat(notifications): PATCH mark all notifications read"
```

---

## Task 6: Update cron to insert notification row

**Files:**
- Modify: `frontend/app/api/aliis/notify/route.ts`

The current file sends push notifications to all subscribed users. After each successful push, also insert a `notifications` row so the in-app bandeja stays in sync.

- [ ] **Step 1: Add notification insert inside the `if (result.ok)` block**

In `frontend/app/api/aliis/notify/route.ts`, find this block:

```typescript
    if (result.ok) {
      sent++
    } else {
```

Replace it with:

```typescript
    if (result.ok) {
      sent++
      // insert in-app notification row
      await supabase.from('notifications').insert({
        user_id: sub.user_id,
        title: 'Aliis',
        body: content.slice(0, 500),
        type: 'reminder',
        url: '/diario',
      })
    } else {
```

Note: `supabase` in this file is already the service-role client (created at the top of the file with `SUPABASE_SERVICE_ROLE_KEY`), so no changes needed to the client setup.

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend && npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/api/aliis/notify/route.ts
git commit -m "feat(notifications): insert in-app notification row on cron push"
```

---

## Task 7: Replace NotificationBell with full dropdown bandeja

**Files:**
- Replace: `frontend/components/NotificationBell.tsx`

This is the main UI task. The component must:

1. On mount, fetch `/api/notifications` and store the list
2. Show unread count badge on the bell icon (red dot with number if >0)
3. On click, toggle a dropdown panel (max-h scrollable, w-80)
4. Dropdown header: "Notificaciones" + "Marcar todas leídas" button (only if unread exist)
5. Each notification row: title bold, body text-sm, relative time, dot indicator for unread
6. Clicking a notification: marks it read via PATCH, navigates to `notification.url` if present
7. Empty state: "Sin notificaciones por ahora"
8. The existing push-subscription logic (subscribe on click when not granted) stays — but only shown as a footer row inside the dropdown when `status !== 'granted'`

- [ ] **Step 1: Write the full component**

Replace the entire contents of `frontend/components/NotificationBell.tsx` with:

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, BellOff, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/lib/types'

type PushStatus = 'unknown' | 'granted' | 'denied' | 'unsupported'

export function NotificationBell() {
  const router = useRouter()
  const [pushStatus, setPushStatus] = useState<PushStatus>('unknown')
  const [subscribing, setSubscribing] = useState(false)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Detect push permission on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushStatus('unsupported')
      return
    }
    setPushStatus(
      Notification.permission === 'granted' ? 'granted'
      : Notification.permission === 'denied' ? 'denied'
      : 'unknown'
    )
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setNotifications(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function subscribe() {
    setSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setPushStatus('denied'); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      await fetch('/api/aliis/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      setPushStatus('granted')
    } catch {
      // silently fail
    } finally {
      setSubscribing(false)
    }
  }

  async function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {})
  }

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await fetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
  }

  async function handleNotificationClick(n: AppNotification) {
    if (!n.read) await markRead(n.id)
    setOpen(false)
    if (n.url) router.push(n.url)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notificaciones"
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-full border transition-colors cursor-pointer',
          open
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 border border-background flex items-center justify-center font-mono text-[9px] text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-border bg-popover shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-sans text-[13px] font-semibold text-foreground">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="font-sans text-[11px] text-primary hover:text-primary/80 transition-colors border-none bg-transparent cursor-pointer"
                >
                  Marcar todas leídas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground/50 hover:text-foreground transition-colors border-none bg-transparent cursor-pointer p-0.5"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-[360px]">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="font-serif italic text-[13px] text-muted-foreground text-center py-10 px-4">
                Sin notificaciones por ahora.
              </p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border/50 last:border-0 transition-colors cursor-pointer flex items-start gap-3',
                    n.read ? 'bg-transparent hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'
                  )}
                >
                  {/* Unread dot */}
                  <span className={cn(
                    'mt-1.5 shrink-0 w-2 h-2 rounded-full',
                    n.read ? 'bg-transparent' : 'bg-primary'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-sans text-[12px] leading-snug',
                      n.read ? 'text-muted-foreground' : 'text-foreground font-medium'
                    )}>
                      {n.title}
                    </p>
                    <p className="font-sans text-[12px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Push subscribe footer — only shown when not granted */}
          {pushStatus !== 'granted' && pushStatus !== 'unsupported' && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between gap-3">
              <p className="font-sans text-[11px] text-muted-foreground leading-snug">
                {pushStatus === 'denied'
                  ? 'Notificaciones push bloqueadas en el navegador.'
                  : 'Activa notificaciones push para avisos en tiempo real.'}
              </p>
              {pushStatus === 'unknown' && (
                <button
                  onClick={subscribe}
                  disabled={subscribing}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white font-sans text-[11px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer border-none"
                >
                  {subscribing ? '…' : 'Activar'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend && npx tsc --noEmit 2>&1 | grep -v tailwind
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/NotificationBell.tsx
git commit -m "feat(notifications): NotificationBell con bandeja dropdown completa"
```

---

## Self-Review

**Spec coverage:**
- ✅ `notifications` table with type, read, url, created_at
- ✅ GET list endpoint (auth, last 30)
- ✅ PATCH single read
- ✅ PATCH read-all
- ✅ Bell with unread badge
- ✅ Dropdown with list, empty state, mark-all-read
- ✅ Cron inserts notification row on push
- ✅ Push subscribe footer in dropdown (replaces PushPermissionPrompt)
- ✅ Extensible `type` field for mobile sync

**Placeholder scan:** None found — all steps have complete code.

**Type consistency:** `AppNotification` defined in Task 2, used in Tasks 3, 4, 5, 7. Field names consistent throughout (`read`, `read_at`, `url`, `type`).
