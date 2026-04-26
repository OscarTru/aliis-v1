# Chat Drawer + Apuntes IA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline ChapterChat with a right-side drawer that holds all pack chat, plus an on-demand AI-generated "Mis apuntes" summary (max 1 per pack, tiered later), with a `pack_notes` Supabase table to persist them.

**Architecture:** A `ChatDrawer` component (fixed right panel, CSS transform slide-in) replaces `ChapterChat` inside `PackView`. The drawer holds the full chat UI (moved from `ChapterChat`) and a "Generar mis apuntes" button that calls a new `/api/notes/generate` route. Notes are stored in `pack_notes` (one row per pack). The "Pregúntale a Aliis" CTA at the bottom of each chapter opens the drawer and scrolls to the input. `PackContext` gains `chatOpen` / `setChatOpen` state so the Sidebar and chapter footer can both control the drawer.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Supabase (browser + server client), Claude Haiku (`claude-haiku-4-5-20251001`), TypeScript.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/lib/types.ts` | Modify | Add `PackNote` type |
| `frontend/lib/pack-context.tsx` | Modify | Add `chatOpen`, `setChatOpen`, `notes`, `setNotes` to context |
| `frontend/components/ChatDrawer.tsx` | Create | Right-side drawer with chat + apuntes section |
| `frontend/components/PackView.tsx` | Modify | Remove `ChapterChat`; add footer CTA "Pregúntale a Aliis"; render `ChatDrawer`; pass `userId` |
| `frontend/components/ChapterChat.tsx` | Modify | Remove from PackView usage (logic moves to ChatDrawer); file stays for possible future reuse but is no longer rendered inside chapters |
| `frontend/app/api/notes/generate/route.ts` | Create | POST — generate apuntes with Haiku, save to `pack_notes`, enforce 1-per-pack limit |

**Supabase (SQL — run via MCP):** Create `pack_notes` table.

---

### Task 1: Supabase — create `pack_notes` table

**Files:**
- No file — SQL via Supabase MCP (`execute_sql`, project `cdnecuufkdykybisqybm`)

- [ ] **Step 1: Run this SQL**

```sql
create table if not exists pack_notes (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  unique (pack_id, user_id)
);

create index if not exists pack_notes_pack_id_idx on pack_notes(pack_id);
create index if not exists pack_notes_user_id_idx on pack_notes(user_id);

alter table pack_notes enable row level security;

create policy "Users see own notes"
  on pack_notes for select
  using (auth.uid() = user_id);

create policy "Users insert own notes"
  on pack_notes for insert
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: Verify**

```sql
select column_name, data_type from information_schema.columns
where table_name = 'pack_notes'
order by ordinal_position;
```

Expected columns: `id`, `pack_id`, `user_id`, `content`, `created_at`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(db): add pack_notes table with unique(pack_id, user_id) and RLS"
```

---

### Task 2: Add `PackNote` type + extend `PackContext` with drawer + notes state

**Files:**
- Modify: `frontend/lib/types.ts`
- Modify: `frontend/lib/pack-context.tsx`

- [ ] **Step 1: Append `PackNote` to `frontend/lib/types.ts`**

At the end of the file, after `ChatMessage`:

```typescript
export interface PackNote {
  id: string
  pack_id: string
  user_id: string
  content: string
  created_at: string
}
```

- [ ] **Step 2: Replace `frontend/lib/pack-context.tsx` entirely**

```typescript
'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { Pack, PackNote } from '@/lib/types'

interface PackContextValue {
  pack: Pack | null
  activeIdx: number
  readChapters: Set<string>
  chatOpen: boolean
  notes: PackNote | null
  setPack: (pack: Pack | null) => void
  setActiveIdx: (i: number) => void
  markRead: (chapterId: string) => void
  setChatOpen: (open: boolean) => void
  setNotes: (note: PackNote | null) => void
}

const PackContext = createContext<PackContextValue>({
  pack: null,
  activeIdx: 0,
  readChapters: new Set(),
  chatOpen: false,
  notes: null,
  setPack: () => {},
  setActiveIdx: () => {},
  markRead: () => {},
  setChatOpen: () => {},
  setNotes: () => {},
})

export function PackProvider({ children }: { children: React.ReactNode }) {
  const [pack, setPack] = useState<Pack | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set())
  const [chatOpen, setChatOpen] = useState(false)
  const [notes, setNotes] = useState<PackNote | null>(null)

  const handleSetPack = useCallback((p: Pack | null) => {
    setPack(p)
    setActiveIdx(0)
    setReadChapters(new Set())
    setChatOpen(false)
    setNotes(null)
  }, [])

  const handleSetActiveIdx = useCallback((i: number) => setActiveIdx(i), [])

  const markRead = useCallback((chapterId: string) => {
    setReadChapters((prev) => new Set([...prev, chapterId]))
  }, [])

  return (
    <PackContext.Provider value={{
      pack,
      activeIdx,
      readChapters,
      chatOpen,
      notes,
      setPack: handleSetPack,
      setActiveIdx: handleSetActiveIdx,
      markRead,
      setChatOpen,
      setNotes,
    }}>
      {children}
    </PackContext.Provider>
  )
}

export function usePackContext() {
  return useContext(PackContext)
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/types.ts frontend/lib/pack-context.tsx
git commit -m "feat(context): add chatOpen, notes state to PackContext; add PackNote type"
```

---

### Task 3: Create `/api/notes/generate` route

**Files:**
- Create: `frontend/app/api/notes/generate/route.ts`

This route:
1. Authenticates via session (never trusts body userId).
2. Checks `pack_notes` for an existing note for this pack+user — if found, returns it directly (1-per-pack limit, free tier).
3. Fetches all `pack_chats` messages for this pack+user from Supabase.
4. If fewer than 3 user messages exist, returns 400 ("Necesitas más conversación para generar apuntes").
5. Calls Claude Haiku to generate structured apuntes from the conversation.
6. Inserts the note into `pack_notes` (upsert — safe if race condition).
7. Returns `{ content: string }`.

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend/app/api/notes/generate"
```

- [ ] **Step 2: Write `frontend/app/api/notes/generate/route.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const NOTES_SYSTEM = `Eres el asistente educativo de Aliis. Tu tarea es generar un resumen de apuntes personales a partir de una conversación entre un paciente y el asistente de Aliis sobre su diagnóstico.

Los apuntes deben:
- Estar escritos en primera persona del paciente ("Aprendí que...", "Entendí que...", "Tengo que preguntar...")
- Capturar las dudas que el paciente expresó y las explicaciones clave que recibió
- Incluir al final una sección "Preguntas para llevar a mi médico" con las preguntas que surgieron
- Ser concisos: máximo 5 puntos de aprendizaje + máximo 3 preguntas para el médico
- Estar en español
- NO incluir consejos médicos, dosis ni tratamientos
- NUNCA usar el guión largo (—). Para frases parentéticas usa paréntesis.

Formato de salida — texto plano con estas secciones, sin markdown ni asteriscos:

LO QUE APRENDÍ
1. ...
2. ...
(máximo 5 puntos)

PREGUNTAS PARA MI MÉDICO
1. ...
2. ...
(máximo 3 preguntas)`

export async function POST(req: Request) {
  const { packId, dx } = await req.json()

  if (!packId || typeof packId !== 'string') {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Return existing note if already generated (1-per-pack limit for free tier)
  const { data: existingNote } = await supabase
    .from('pack_notes')
    .select('*')
    .eq('pack_id', packId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingNote) {
    return new Response(JSON.stringify({ content: existingNote.content, alreadyExists: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch all chat messages for this pack
  const { data: messages, error: messagesError } = await supabase
    .from('pack_chats')
    .select('role, text, created_at')
    .eq('pack_id', packId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (messagesError) {
    return new Response(JSON.stringify({ error: 'Error al obtener conversación' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const userMessages = (messages ?? []).filter((m) => m.role === 'user')
  if (userMessages.length < 3) {
    return new Response(JSON.stringify({ error: 'Necesitas al menos 3 preguntas para generar apuntes' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const conversationText = (messages ?? [])
    .map((m) => `${m.role === 'user' ? 'Paciente' : 'Aliis'}: ${m.text}`)
    .join('\n\n')

  const userPrompt = `Diagnóstico del paciente: ${dx ?? 'no especificado'}

Conversación:
${conversationText}`

  let noteContent: string
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: [{ type: 'text', text: NOTES_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')
    noteContent = textBlock.text.trim()
  } catch {
    return new Response(JSON.stringify({ error: 'Error al generar apuntes' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Upsert — safe against race conditions
  const { data: inserted, error: insertError } = await supabase
    .from('pack_notes')
    .upsert({ pack_id: packId, user_id: user.id, content: noteContent }, { onConflict: 'pack_id,user_id' })
    .select()
    .single()

  if (insertError) {
    return new Response(JSON.stringify({ error: 'Error al guardar apuntes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ content: inserted.content }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/api/notes/generate/route.ts
git commit -m "feat(api): POST /api/notes/generate — Haiku apuntes, 1-per-pack limit, RLS"
```

---

### Task 4: Create `ChatDrawer` component

**Files:**
- Create: `frontend/components/ChatDrawer.tsx`

This component is a full-height right-side drawer. It:
- Slides in from the right with CSS transition (`translate-x-full` → `translate-x-0`)
- Has two tabs at the top: "Chat" and "Mis apuntes"
- "Chat" tab: the full chat UI currently in `ChapterChat` (messages, input, streaming) — context is the full pack, not per-chapter
- "Mis apuntes" tab: shows existing note or a "Generar mis apuntes" button (disabled if <3 user messages); calls `/api/notes/generate`
- Closes with an X button or pressing Escape
- Width: 380px on desktop, full width on mobile (`w-full sm:w-[380px]`)
- Renders as a fixed overlay on the right side of the viewport, full height, above all content (`z-40`)
- A semi-transparent backdrop covers the main content when open (`z-30`)

- [ ] **Step 1: Create `frontend/components/ChatDrawer.tsx`**

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Send, Sparkles, Loader2, BookText } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { usePackContext } from '@/lib/pack-context'
import { cn } from '@/lib/utils'
import type { PackNote } from '@/lib/types'

type Message = { role: 'user' | 'assistant'; text: string }
type Tab = 'chat' | 'apuntes'

export function ChatDrawer({
  dx,
  packId,
  userId,
  packContext,
}: {
  dx: string
  packId: string
  userId?: string
  packContext: string
}) {
  const { chatOpen, setChatOpen, notes, setNotes } = usePackContext()
  const [tab, setTab] = useState<Tab>('chat')

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const hadHistoryRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Notes state
  const [generating, setGenerating] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [userMessageCount, setUserMessageCount] = useState(0)

  // Load history once when drawer opens and userId is known
  useEffect(() => {
    if (!chatOpen || !packId || !userId) return
    let cancelled = false
    hadHistoryRef.current = false
    setLoadingHistory(true)
    const supabase = createClient()
    supabase
      .from('pack_chats')
      .select('role, text, created_at')
      .eq('pack_id', packId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data && data.length > 0) {
          hadHistoryRef.current = true
          const msgs = data.map((r) => ({ role: r.role as 'user' | 'assistant', text: r.text }))
          setMessages(msgs)
          setUserMessageCount(msgs.filter((m) => m.role === 'user').length)
        }
        setLoadingHistory(false)
      })
    return () => { cancelled = true }
  }, [chatOpen, packId, userId])

  // Load existing note
  useEffect(() => {
    if (!chatOpen || !packId || !userId || notes) return
    const supabase = createClient()
    supabase
      .from('pack_notes')
      .select('*')
      .eq('pack_id', packId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setNotes(data as PackNote)
      })
  }, [chatOpen, packId, userId, notes, setNotes])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setChatOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setChatOpen])

  // Focus textarea when drawer opens on chat tab
  useEffect(() => {
    if (chatOpen && tab === 'chat') {
      setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [chatOpen, tab])

  async function send() {
    const q = input.trim()
    if (!q || streaming) return

    const next: Message[] = [...messages, { role: 'user', text: q }]
    setMessages(next)
    setInput('')
    setStreaming(true)
    setMessages([...next, { role: 'assistant', text: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          dx,
          chapterTitle: 'Tu explicación completa',
          chapterContent: packContext,
          packContext,
          packId,
          chapterId: 'pack',
        }),
      })

      if (!res.ok || !res.body) {
        setMessages([...next, { role: 'assistant', text: 'Hubo un error. Intenta de nuevo.' }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages([...next, { role: 'assistant', text: full }])
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      full += decoder.decode()
      if (full) {
        setMessages([...next, { role: 'assistant', text: full }])
        setUserMessageCount((c) => c + 1)
      }
    } finally {
      setStreaming(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  async function generateNotes() {
    if (generating) return
    setGenerating(true)
    setNotesError(null)
    try {
      const res = await fetch('/api/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, dx }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNotesError(data.error ?? 'Error al generar apuntes')
        return
      }
      setNotes(data as PackNote)
    } finally {
      setGenerating(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isActive = Boolean(input.trim()) && !streaming
  const canGenerateNotes = userMessageCount >= 3 && !notes

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setChatOpen(false)}
        className={cn(
          'fixed inset-0 z-30 bg-foreground/20 transition-opacity duration-300',
          chatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-40 h-screen w-full sm:w-[380px] bg-background border-l border-border flex flex-col transition-transform duration-300 ease-in-out shadow-xl',
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <div className="font-mono text-[9px] tracking-[.18em] uppercase text-primary/70 mb-0.5">
              · Aliis ·
            </div>
            <div className="font-serif text-[15px] text-foreground leading-tight truncate max-w-[260px]">
              {dx}
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-none cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {(['chat', 'apuntes'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 font-sans text-[13px] font-medium border-none cursor-pointer transition-colors',
                tab === t
                  ? 'text-primary border-b-2 border-primary bg-transparent'
                  : 'text-muted-foreground bg-transparent hover:text-foreground'
              )}
            >
              {t === 'chat' ? 'Chat' : 'Mis apuntes'}
            </button>
          ))}
        </div>

        {/* Chat tab */}
        {tab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingHistory && (
                <div className="flex gap-1.5 items-center mb-4">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="ce-pulse w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animationDelay: `${j * 0.2}s` }} />
                  ))}
                  <span className="font-sans text-[12px] text-muted-foreground/60 ml-1">Cargando conversación…</span>
                </div>
              )}

              {!loadingHistory && hadHistoryRef.current && messages.length > 0 && (
                <div className="font-mono text-[9px] tracking-[.15em] uppercase text-muted-foreground/40 mb-3">
                  Conversación guardada
                </div>
              )}

              {messages.length === 0 && !loadingHistory && (
                <div className="text-center pt-8 pb-4">
                  <p className="font-serif text-[16px] text-foreground mb-2 leading-[1.4]">
                    ¿Te quedó claro? ¿Tienes dudas?
                  </p>
                  <p className="font-sans text-[13px] text-muted-foreground leading-[1.5]">
                    Pregúntame lo que quieras sobre {dx}.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-primary shrink-0 mr-2 mt-0.5 flex items-center justify-center font-serif text-[11px] text-white font-semibold">
                        A
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[85%]',
                      m.role === 'user'
                        ? 'bg-foreground rounded-[12px_12px_3px_12px] px-3 py-2'
                        : 'bg-muted border border-border rounded-[3px_12px_12px_12px] px-4 py-3'
                    )}>
                      {m.role === 'assistant' && m.text === '' ? (
                        <div className="flex gap-1 py-0.5">
                          {[0, 1, 2].map((j) => (
                            <div key={j} className="ce-pulse w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: `${j * 0.2}s` }} />
                          ))}
                        </div>
                      ) : (
                        <p className={cn(
                          'font-sans text-[13px] leading-[1.65] m-0 whitespace-pre-wrap',
                          m.role === 'user' ? 'text-white' : 'text-foreground'
                        )}>
                          {m.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <div className="flex gap-2 items-end bg-muted border border-border rounded-[12px] px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Pregunta sobre ${dx}…`}
                  rows={1}
                  disabled={streaming}
                  className="flex-1 border-none bg-transparent outline-none font-sans text-[13px] text-foreground resize-none leading-[1.5] min-h-[20px] max-h-[100px] overflow-y-auto"
                  onInput={(e) => {
                    const t = e.currentTarget
                    t.style.height = 'auto'
                    t.style.height = `${Math.min(t.scrollHeight, 100)}px`
                  }}
                />
                <button
                  onClick={send}
                  disabled={!isActive}
                  className={cn(
                    'w-[30px] h-[30px] rounded-[8px] border-none shrink-0 flex items-center justify-center transition-colors duration-150',
                    isActive
                      ? 'bg-foreground cursor-pointer text-background'
                      : 'bg-border cursor-not-allowed text-muted-foreground/60'
                  )}
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="font-sans text-[10px] text-muted-foreground/50 mt-1.5 leading-[1.4] text-center">
                Esta conversación no reemplaza la consulta con tu médico.
              </p>
            </div>
          </>
        )}

        {/* Apuntes tab */}
        {tab === 'apuntes' && (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {notes ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <BookText size={14} className="text-primary shrink-0" />
                  <div className="font-mono text-[9px] tracking-[.18em] uppercase text-muted-foreground/60">
                    Mis apuntes · {dx}
                  </div>
                </div>
                <div className="font-sans text-[14px] leading-[1.75] text-foreground whitespace-pre-wrap">
                  {notes.content}
                </div>
                <div className="mt-6 px-4 py-3 bg-muted rounded-[10px] font-sans text-[11px] text-muted-foreground/60 italic">
                  Estos apuntes son un resumen de tu conversación con Aliis y no reemplazan la consulta con tu médico.
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center pt-8 gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-serif text-[17px] text-foreground mb-2 leading-[1.3]">
                    Genera tus apuntes
                  </p>
                  <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] max-w-[260px]">
                    {userMessageCount < 3
                      ? `Necesitas al menos 3 preguntas para generar apuntes. Llevas ${userMessageCount}.`
                      : 'Aliis resume lo que aprendiste en esta conversación en puntos clave y preguntas para tu médico.'}
                  </p>
                </div>

                {notesError && (
                  <p className="font-sans text-[12px] text-destructive">{notesError}</p>
                )}

                <button
                  onClick={generateNotes}
                  disabled={!canGenerateNotes || generating}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[14px] font-medium transition-colors border-none',
                    canGenerateNotes && !generating
                      ? 'bg-foreground text-background cursor-pointer shadow-[var(--c-btn-primary-shadow)]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {generating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generando…
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generar mis apuntes
                    </>
                  )}
                </button>

                <p className="font-sans text-[11px] text-muted-foreground/50 leading-[1.4]">
                  Máximo 1 vez por explicación (por ahora)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ChatDrawer.tsx
git commit -m "feat(ChatDrawer): right-side drawer with chat + apuntes tab, 1-per-pack limit"
```

---

### Task 5: Update `PackView` — replace ChapterChat with drawer CTA + render ChatDrawer

**Files:**
- Modify: `frontend/components/PackView.tsx`

Changes:
1. Remove `ChapterChat` import and its JSX from `ChapterCard`.
2. Add a footer CTA at the bottom of `ChapterCard`: one line with "¿Cómo entendiste? ¿Tienes dudas?" and a button "Pregúntale a Aliis" that calls `setChatOpen(true)`.
3. Import and render `ChatDrawer` inside `PackView` (outside `ChapterCard`, at the root level), passing `dx`, `packId`, `userId`, `packContext`.
4. Build `packContext` once in `PackView` and pass it to both `ChapterCard` (already does) and `ChatDrawer`.

- [ ] **Step 1: Read `frontend/components/PackView.tsx` fully before editing**

- [ ] **Step 2: Replace the imports block at top of `PackView.tsx`**

Remove `ChapterChat` import, add `ChatDrawer` import:

```typescript
'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { HelpCircle, MessageCircle } from 'lucide-react'
import type { Pack, Chapter } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { ChatDrawer } from '@/components/ChatDrawer'
import { usePackContext } from '@/lib/pack-context'
import { cn } from '@/lib/utils'
```

- [ ] **Step 3: Update `ChapterCard` — remove `ChapterChat` JSX, add "Pregúntale a Aliis" CTA**

`ChapterCard` already receives `packId`, `userId`, `dx`, `conditionSlug`, `packContext`. We need to also pass a `onOpenChat` callback so the button can open the drawer.

Update the `ChapterCard` props type:

```typescript
function ChapterCard({
  chapter, packId, userId, dx, onRead, conditionSlug, packContext, onOpenChat,
}: {
  chapter: Chapter
  packId: string
  userId?: string
  dx: string
  onRead?: (id: string) => void
  conditionSlug?: string | null
  packContext: string
  onOpenChat: () => void
}) {
```

Then at the bottom of `ChapterCard`'s return (after the `conditionSlug` link block, replacing `<ChapterChat ... />`), add:

```tsx
      {/* Chat CTA — replaces inline ChapterChat */}
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
```

- [ ] **Step 4: Update `PackView` — build packContext once, pass `onOpenChat` to ChapterCard, render `ChatDrawer`**

In the `PackView` function, compute `packContext` as a `const` before the return, then use it in both `ChapterCard` and `ChatDrawer`:

```typescript
export function PackView({ pack, userId, conditionSlug }: { pack: Pack; userId?: string; conditionSlug?: string | null }) {
  const { activeIdx, readChapters, setPack, setActiveIdx, markRead, setChatOpen } = usePackContext()
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)
  const chapter = pack.chapters[activeIdx]
  const isLast = activeIdx === pack.chapters.length - 1

  const packContext = pack.chapters.map((ch) =>
    [`## ${ch.kicker} ${ch.kickerItalic}`, ch.tldr, ...(ch.paragraphs ?? [])].join('\n')
  ).join('\n\n')

  useEffect(() => {
    setPack(pack)
    return () => setPack(null)
  }, [pack, setPack])

  return (
    <div className="flex flex-col h-full">
      {/* ChatDrawer — rendered once at pack level, always present when pack is active */}
      <ChatDrawer
        dx={pack.dx}
        packId={pack.id}
        userId={userId}
        packContext={packContext}
      />

      {activeIdx < pack.chapters.length ? (
        <>
          <div className="flex-1 overflow-hidden">
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              packId={pack.id}
              userId={userId}
              dx={pack.dx}
              onRead={markRead}
              conditionSlug={conditionSlug}
              packContext={packContext}
              onOpenChat={() => setChatOpen(true)}
            />
          </div>
          {/* ... rest of footer nav unchanged ... */}
```

Keep the footer navigation (← Anterior, dots, Siguiente →) and the references view unchanged.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors. Fix any that appear.

- [ ] **Step 6: Start dev server and test manually**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Aliis/frontend" && npm run dev
```

1. Open a pack page (`/pack/<id>`) while logged in.
2. Verify: no inline chat at the bottom of each chapter — only the "Pregúntale a Aliis" CTA bar.
3. Click "Pregúntale a Aliis" — drawer slides in from right.
4. Send a message — streams correctly.
5. Switch chapters — drawer stays open, chat history is the same (pack-level, not chapter-level).
6. Press Escape — drawer closes.
7. Click backdrop — drawer closes.
8. Open drawer, go to "Mis apuntes" tab — shows prompt to generate if <3 messages.
9. After ≥3 messages, click "Generar mis apuntes" — apuntes appear.
10. Reload page, reopen drawer, go to "Mis apuntes" — note persisted.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/PackView.tsx
git commit -m "feat(PackView): replace inline ChapterChat with drawer CTA + render ChatDrawer"
```

---

## Self-Review

**Spec coverage:**
- ✅ Right-side drawer (Opción B) → Task 4 (`ChatDrawer` with CSS slide-in)
- ✅ "¿Cómo entendiste? ¿Tienes dudas?" + "Pregúntale a Aliis" button at chapter bottom → Task 5 (ChapterCard CTA)
- ✅ Chat is pack-level (not per-chapter) — `chapterId: 'pack'` in fetch body → Task 4
- ✅ On-demand apuntes via "Generar mis apuntes" button → Task 3 (API) + Task 4 (UI)
- ✅ Max 1 apuntes per pack (unique constraint in DB + API early-return) → Task 1 + Task 3
- ✅ Minimum 3 user messages before generating → Task 3 (API check) + Task 4 (UI disabled state)
- ✅ Apuntes persisted in `pack_notes` → Task 1 + Task 3
- ✅ Existing notes loaded on drawer open → Task 4 (`useEffect` querying `pack_notes`)
- ✅ Close with X or Escape → Task 4
- ✅ Backdrop closes drawer → Task 4
- ✅ `PackContext` extended with `chatOpen`/`setChatOpen`/`notes`/`setNotes` → Task 2
- ✅ `PackNote` type → Task 2

**Placeholder scan:** No TBDs, no vague steps. All code blocks complete.

**Type consistency:**
- `PackNote` defined in Task 2, used in `ChatDrawer` (Task 4) and `pack-context.tsx` (Task 2) — all match.
- `chatOpen`, `setChatOpen`, `notes`, `setNotes` defined in Task 2 context, consumed in Task 4 (`ChatDrawer`) and Task 5 (`PackView`).
- `onOpenChat: () => void` added to `ChapterCard` props in Task 5 — callback signature is simple and matches `() => setChatOpen(true)` at call site.
- `/api/notes/generate` returns `{ content: string }` (Task 3), consumed in `ChatDrawer.generateNotes()` as `data as PackNote` — note: the API returns `inserted` which has all `PackNote` fields, so this cast is valid.
