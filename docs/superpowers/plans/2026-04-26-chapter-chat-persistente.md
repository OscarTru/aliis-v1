# ChapterChat Persistente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist ChapterChat conversations in Supabase per pack, sending full pack context (all chapters) to Claude Haiku so responses are richer and cross-chapter aware.

**Architecture:** A `pack_chats` table stores messages (role + text) per pack per user. The existing `/api/chat` Next.js route is upgraded to (a) accept full pack context, (b) save each exchange to Supabase after streaming completes. `ChapterChat` is updated to load prior messages on mount and send full pack context. `PackView` passes the full `pack` object down to `ChapterChat`.

**Tech Stack:** Next.js App Router, Supabase (postgres + JS client), Claude Haiku (`claude-haiku-4-5-20251001`) with streaming, TypeScript.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/lib/types.ts` | Modify | Add `ChatMessage` type |
| `frontend/app/api/chat/route.ts` | Modify | Accept full pack context + save messages to Supabase after stream |
| `frontend/components/ChapterChat.tsx` | Modify | Load prior messages on mount; send full pack context; show chapter badge on each message |
| `frontend/components/PackView.tsx` | Modify | Pass `pack` + `packId` + `userId` into ChapterChat |

**Supabase (SQL — run manually via MCP or Supabase console):** Create `pack_chats` table.

---

### Task 1: Supabase — create `pack_chats` table

**Files:**
- No file to edit — SQL run via Supabase MCP or console

This task has no automated test. Verify by querying the table after creation.

- [ ] **Step 1: Run this SQL in Supabase (MCP tool `execute_sql`, project `cdnecuufkdykybisqybm`)**

```sql
create table if not exists pack_chats (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references packs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null,
  role text not null check (role in ('user', 'assistant')),
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists pack_chats_pack_id_idx on pack_chats(pack_id);
create index if not exists pack_chats_user_id_idx on pack_chats(user_id);

alter table pack_chats enable row level security;

create policy "Users see own chats"
  on pack_chats for select
  using (auth.uid() = user_id);

create policy "Users insert own chats"
  on pack_chats for insert
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: Verify table exists**

Run:
```sql
select column_name, data_type from information_schema.columns
where table_name = 'pack_chats'
order by ordinal_position;
```

Expected output: columns `id`, `pack_id`, `user_id`, `chapter_id`, `role`, `text`, `created_at`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(db): add pack_chats table with RLS"
```

---

### Task 2: Add `ChatMessage` type to `frontend/lib/types.ts`

**Files:**
- Modify: `frontend/lib/types.ts`

- [ ] **Step 1: Open `frontend/lib/types.ts` and append this type at the end of the file**

```typescript
export interface ChatMessage {
  id?: string
  pack_id: string
  user_id: string
  chapter_id: string
  role: 'user' | 'assistant'
  text: string
  created_at?: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing ones unrelated to this file).

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/types.ts
git commit -m "feat(types): add ChatMessage for pack_chats persistence"
```

---

### Task 3: Update `/api/chat` route — full pack context + persist messages

**Files:**
- Modify: `frontend/app/api/chat/route.ts`

The route currently accepts `{ question, dx, chapterTitle, chapterContent }` and streams a Haiku response. We need it to:
1. Also accept `{ packId, userId, chapterId, packContext }` (full pack summary as a pre-built string).
2. Stream the response as before.
3. After the stream ends, insert both the user message and assistant message into `pack_chats`.

Note: The Supabase service-role client is needed here (not the browser client) because this is a server-side route. Use `createServerSupabaseClient` from `@/lib/supabase-server`.

- [ ] **Step 1: Replace the full contents of `frontend/app/api/chat/route.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const {
    question,
    dx,
    chapterTitle,
    chapterContent,
    packContext,
    packId,
    userId,
    chapterId,
  } = await req.json()

  if (!question?.trim() || !dx) {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 })
  }

  const system = `Eres el consejero de salud de Aliis — una plataforma creada por médicos residentes de neurología para ayudar a pacientes a entender sus diagnósticos.

El paciente está leyendo su explicación completa sobre: ${dx}.
Capítulo activo: "${chapterTitle}".

Tu rol:
- Eres un médico residente de neurología que también es su amigo de confianza.
- Respondes SOLO preguntas relacionadas con su diagnóstico (${dx}) o su salud en general.
- Si preguntan algo fuera de su salud, rediriges amablemente: "Eso queda fuera de lo que puedo ayudarte, pero si tienes dudas sobre tu diagnóstico, con gusto te ayudo."
- Nunca diagnosticas ni modificas el diagnóstico existente.
- Nunca das dosis ni reemplazas la consulta médica — siempre refuerza consultar con su médico.
- Empiezas desde la experiencia del paciente, no desde definiciones de libro.
- Frases cortas. Una idea por párrafo. Sin lenguaje de IA ("es importante destacar", "en conclusión").
- Puedes referenciar cualquier parte de la explicación completa para dar contexto más rico.
- Al final de cada respuesta, si es natural, ofrece un tip práctico o una pregunta de seguimiento.
- NUNCA uses el guión largo (—). Para frases parentéticas usa paréntesis. Para continuar una cláusula usa coma.

Explicación completa del diagnóstico (todos los capítulos):
${packContext ?? chapterContent}

Capítulo activo (más relevante para esta pregunta):
${chapterContent}

Responde en español. Máximo 4 párrafos cortos.`

  let fullResponse = ''

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: question.trim() }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()

      if (packId && userId && chapterId) {
        try {
          const supabase = await createServerSupabaseClient()
          await supabase.from('pack_chats').insert([
            { pack_id: packId, user_id: userId, chapter_id: chapterId, role: 'user', text: question.trim() },
            { pack_id: packId, user_id: userId, chapter_id: chapterId, role: 'assistant', text: fullResponse },
          ])
        } catch {
          // Non-fatal — chat still worked, just not persisted
        }
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/api/chat/route.ts
git commit -m "feat(api): persist chat messages to pack_chats, send full pack context to Haiku"
```

---

### Task 4: Update `PackView` — pass pack + userId into ChapterChat

**Files:**
- Modify: `frontend/components/PackView.tsx` (lines ~122–130)

Currently `ChapterChat` receives `{ dx, chapterTitle, chapterContent }`. We need to pass `packId`, `userId`, `chapterId`, and a pre-built `packContext` string (all chapters joined). `PackView` already receives `pack` and `userId` as props, so this is a wiring task.

- [ ] **Step 1: Find the `packContext` build and the `ChapterChat` call in `PackView.tsx`**

The `ChapterChat` call is inside `ChapterCard`. `ChapterCard` already receives `packId`, `userId`, `dx`. We need to also pass `packContext` (a string built from the full pack) and the current `chapter.id`.

Open `frontend/components/PackView.tsx` and locate the `ChapterCard` function signature (around line 31) and the `ChapterChat` JSX (around line 122).

- [ ] **Step 2: Update `ChapterCard` props type to include `packContext`**

Find this in `PackView.tsx`:
```typescript
function ChapterCard({
  chapter, packId, userId, dx, onRead, conditionSlug,
}: {
  chapter: Chapter; packId: string; userId?: string; dx: string; onRead?: (id: string) => void; conditionSlug?: string | null
}) {
```

Replace with:
```typescript
function ChapterCard({
  chapter, packId, userId, dx, onRead, conditionSlug, packContext,
}: {
  chapter: Chapter; packId: string; userId?: string; dx: string; onRead?: (id: string) => void; conditionSlug?: string | null; packContext: string
}) {
```

- [ ] **Step 3: Update the `ChapterChat` JSX call inside `ChapterCard`**

Find:
```tsx
      <ChapterChat
        dx={dx}
        chapterTitle={`${chapter.kicker} ${chapter.kickerItalic}`}
        chapterContent={[
          chapter.tldr,
          ...(chapter.paragraphs ?? []),
          chapter.callout?.body ?? '',
          ...(chapter.timeline?.map((t) => `${t.w}: ${t.t}`) ?? []),
          ...(chapter.questions ?? []),
          ...(chapter.alarms?.map((a) => `${a.t}: ${a.d}`) ?? []),
        ].filter(Boolean).join('\n\n')}
      />
```

Replace with:
```tsx
      <ChapterChat
        dx={dx}
        packId={packId}
        userId={userId}
        chapterId={chapter.id}
        chapterTitle={`${chapter.kicker} ${chapter.kickerItalic}`}
        chapterContent={[
          chapter.tldr,
          ...(chapter.paragraphs ?? []),
          chapter.callout?.body ?? '',
          ...(chapter.timeline?.map((t) => `${t.w}: ${t.t}`) ?? []),
          ...(chapter.questions ?? []),
          ...(chapter.alarms?.map((a) => `${a.t}: ${a.d}`) ?? []),
        ].filter(Boolean).join('\n\n')}
        packContext={packContext}
      />
```

- [ ] **Step 4: Build `packContext` string and pass it to `ChapterCard`**

In `PackView`, find where `ChapterCard` is rendered (inside `PackView` function body). It looks like:
```tsx
{chapter && (
  <ChapterCard
    chapter={chapter}
    packId={pack.id}
    userId={userId}
    dx={pack.dx}
    onRead={markRead}
    conditionSlug={conditionSlug}
  />
)}
```

Replace with:
```tsx
{chapter && (
  <ChapterCard
    chapter={chapter}
    packId={pack.id}
    userId={userId}
    dx={pack.dx}
    onRead={markRead}
    conditionSlug={conditionSlug}
    packContext={pack.chapters.map((ch) =>
      [`## ${ch.kicker} ${ch.kickerItalic}`, ch.tldr, ...(ch.paragraphs ?? [])].join('\n')
    ).join('\n\n')}
  />
)}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/PackView.tsx
git commit -m "feat(PackView): pass full pack context and ids to ChapterChat"
```

---

### Task 5: Update `ChapterChat` — load prior messages + send full context

**Files:**
- Modify: `frontend/components/ChapterChat.tsx`

Changes needed:
1. Accept new props: `packId`, `userId`, `chapterId`, `packContext`.
2. On mount (and when `packId` or `chapterId` changes), fetch prior messages from Supabase for this pack+chapter and populate the `messages` state.
3. Pass `packId`, `userId`, `chapterId`, `packContext` in the fetch body to `/api/chat`.
4. Show a subtle "Historial" label if prior messages are loaded.

- [ ] **Step 1: Replace the full contents of `frontend/components/ChapterChat.tsx`**

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; text: string }

export function ChapterChat({
  dx,
  chapterTitle,
  chapterContent,
  packContext,
  packId,
  userId,
  chapterId,
}: {
  dx: string
  chapterTitle: string
  chapterContent: string
  packContext?: string
  packId?: string
  userId?: string
  chapterId?: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!packId || !chapterId || !userId) return
    setMessages([])
    setLoadingHistory(true)
    const supabase = createClient()
    supabase
      .from('pack_chats')
      .select('role, text, created_at')
      .eq('pack_id', packId)
      .eq('chapter_id', chapterId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages(data.map((row) => ({ role: row.role as 'user' | 'assistant', text: row.text })))
        }
        setLoadingHistory(false)
      })
  }, [packId, chapterId, userId])

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
          chapterTitle,
          chapterContent,
          packContext,
          packId,
          userId,
          chapterId,
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
    } finally {
      setStreaming(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isActive = Boolean(input.trim()) && !streaming

  return (
    <div className="mt-10 pt-8 border-t border-border">
      {/* Header */}
      <div className="mb-5">
        <div className="font-mono text-[10px] tracking-[.15em] uppercase text-primary mb-1.5">
          · Tu consejero ·
        </div>
        <p className="font-serif text-[18px] tracking-[-0.015em] text-foreground m-0 leading-[1.3]">
          ¿Te quedó claro? ¿Tienes más preguntas?
        </p>
        <p className="font-sans text-[13px] text-muted-foreground mt-1.5 leading-[1.5]">
          Pregúntame lo que quieras sobre {dx}. Estoy aquí para explicarte con más detalle.
        </p>
      </div>

      {/* History loading state */}
      {loadingHistory && (
        <div className="flex gap-1.5 items-center mb-4">
          {[0, 1, 2].map((j) => (
            <div key={j} className="ce-pulse w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animationDelay: `${j * 0.2}s` }} />
          ))}
          <span className="font-sans text-[12px] text-muted-foreground/60 ml-1">Cargando conversación anterior…</span>
        </div>
      )}

      {/* Prior history label */}
      {!loadingHistory && messages.length > 0 && packId && (
        <div className="font-mono text-[9px] tracking-[.15em] uppercase text-muted-foreground/40 mb-3">
          Conversación guardada
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-4 mb-5">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary shrink-0 mr-2.5 mt-0.5 flex items-center justify-center font-serif text-[12px] text-white font-semibold">
                  A
                </div>
              )}
              <div className={cn(
                'max-w-[82%]',
                m.role === 'user'
                  ? 'bg-foreground shadow-[var(--c-btn-primary-shadow)] rounded-[14px_14px_4px_14px] px-[14px] py-[10px]'
                  : 'bg-muted border border-border rounded-[4px_14px_14px_14px] px-[18px] py-[14px]'
              )}>
                {m.role === 'assistant' && m.text === '' ? (
                  <div className="flex gap-1 py-0.5">
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="ce-pulse w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: `${j * 0.2}s` }} />
                    ))}
                  </div>
                ) : (
                  <p className={cn(
                    'font-sans text-[14px] leading-[1.65] m-0 whitespace-pre-wrap',
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
      )}

      {/* Input */}
      <div className="flex gap-2.5 items-end bg-muted border border-border rounded-[14px] px-3 py-2.5">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Pregunta algo sobre ${dx}…`}
          rows={1}
          disabled={streaming}
          className="flex-1 border-none bg-transparent outline-none font-sans text-[14px] text-foreground resize-none leading-[1.5] min-h-[22px] max-h-[120px] overflow-y-auto"
          onInput={(e) => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = `${Math.min(t.scrollHeight, 120)}px`
          }}
        />
        <button
          onClick={send}
          disabled={!isActive}
          className={cn(
            'w-[34px] h-[34px] rounded-[10px] border-none shrink-0 flex items-center justify-center transition-colors duration-150',
            isActive
              ? 'bg-foreground shadow-[var(--c-btn-primary-shadow)] cursor-pointer text-background'
              : 'bg-border cursor-not-allowed text-muted-foreground/60'
          )}
        >
          <Send size={15} />
        </button>
      </div>

      <p className="font-sans text-[11px] text-muted-foreground/60 mt-2 leading-[1.4]">
        Esta conversación no reemplaza la consulta con tu médico.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Start dev server and manually test**

```bash
cd frontend && npm run dev
```

1. Open `http://localhost:3000/pack/<any-pack-id>` (must be logged in).
2. Navigate to any chapter, type a question, send it.
3. Verify: response streams in, messages appear.
4. Refresh the page, navigate to the same chapter.
5. Verify: prior messages reappear with "Conversación guardada" label.
6. Navigate to a different chapter, verify: empty chat (no cross-chapter bleed).

- [ ] **Step 4: Commit**

```bash
git add frontend/components/ChapterChat.tsx
git commit -m "feat(ChapterChat): load history from Supabase, send full pack context to Haiku"
```

---

## Self-Review

**Spec coverage:**
- ✅ Messages persisted in Supabase → Task 1 (table) + Task 3 (insert after stream)
- ✅ Full pack context sent to Claude → Task 3 (system prompt uses `packContext`) + Task 4 (build string from all chapters)
- ✅ History loaded on mount per chapter → Task 5 (useEffect with Supabase query)
- ✅ Haiku model used → already in route, preserved in Task 3
- ✅ RLS so users only see their own messages → Task 1 (policies)
- ✅ Non-fatal persistence (stream still works if DB insert fails) → Task 3 (try/catch)

**Placeholder scan:** No TBDs, no "handle edge cases", no vague steps. All code blocks complete.

**Type consistency:**
- `ChatMessage` type defined in Task 2 (not used in component directly — Supabase returns raw rows mapped inline, keeping it simple)
- Props added in Task 4 match what Task 5 consumes: `packId`, `userId`, `chapterId`, `packContext` — all strings or `string | undefined`
- `pack_chats` columns in Task 1 match the insert in Task 3: `pack_id`, `user_id`, `chapter_id`, `role`, `text`
