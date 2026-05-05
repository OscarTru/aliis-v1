'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ArrowUp } from 'lucide-react'
import { Icon } from '@iconify/react'
import { createClient } from '@/lib/supabase'
import { usePackContext } from '@/lib/pack-context'
import { cn } from '@/lib/utils'
import type { PackNote } from '@/lib/types'
import { FormattedText } from '@/components/FormattedText'

type Message = { role: 'user' | 'assistant'; text: string }
type Tab = 'chat' | 'apuntes'

export function ChatDrawer({
  dx,
  packId,
  userId,
  packContext,
  screenContext,
}: {
  dx: string
  packId: string
  userId?: string
  packContext: string
  screenContext?: 'diario' | 'pack' | 'tratamientos' | 'historial' | 'cuenta'
}) {
  const { chatOpen, setChatOpen, notes, setNotes } = usePackContext()
  const [tab, setTab] = useState<Tab>('chat')

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [hadHistory, setHadHistory] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const rafRef = useRef<number | null>(null)
  const accRef = useRef('')

  // Notes state
  const [generating, setGenerating] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [userMessageCount, setUserMessageCount] = useState(0)

  // Load history once when drawer opens and userId is known
  useEffect(() => {
    if (!chatOpen || !packId || !userId) return
    let cancelled = false
    setHadHistory(false)
    setLoadingHistory(true)
    const supabase = createClient()
    supabase
      .from('pack_chats')
      .select('role, text, created_at')
      .eq('pack_id', packId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data && data.length > 0) {
          setHadHistory(true)
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

  // Abort in-flight stream when drawer closes
  useEffect(() => {
    if (!chatOpen) abortRef.current?.abort()
  }, [chatOpen])

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

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const next: Message[] = [...messages, { role: 'user', text: q }]
    setInput('')
    setStreaming(true)
    setMessages([...next, { role: 'assistant', text: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history: messages.map((m) => ({ role: m.role, content: m.text })),
          dx,
          chapterTitle: 'Tu explicación completa',
          chapterContent: packContext,
          packContext,
          packId,
          chapterId: 'pack',
          screen_context: screenContext ?? 'pack',
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        setMessages([...next, { role: 'assistant', text: 'Hubo un error. Intenta de nuevo.' }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      accRef.current = ''

      const flush = (final = false) => {
        const text = accRef.current
        setMessages([...next, { role: 'assistant', text: text || (final ? 'Sin respuesta. Intenta de nuevo.' : '') }])
        if (final) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accRef.current += decoder.decode(value, { stream: true })
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => flush())
      }
      accRef.current += decoder.decode()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      flush(true)
      if (accRef.current) setUserMessageCount((c) => c + 1)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages([...next, { role: 'assistant', text: 'Hubo un error de conexión. Intenta de nuevo.' }])
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
      if (data?.content) {
        setNotes({ id: packId, pack_id: packId, user_id: '', content: data.content } as PackNote)
      } else {
        setNotesError(data?.error ?? 'Respuesta inválida del servidor.')
      }
    } catch {
      setNotesError('Error de conexión. Intenta de nuevo.')
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
  const totalUserMessages = userMessageCount + messages.filter((m) => m.role === 'user').length
  const canGenerateNotes = totalUserMessages >= 3 && !notes

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        onClick={() => setChatOpen(false)}
        className={cn(
          'fixed inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 bg-foreground/20 transition-opacity duration-300 md:hidden',
          chatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-40 w-full sm:w-[380px] bg-background border-l border-border flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none',
          'h-[100dvh]',
          chatOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
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
                'flex-1 py-2.5 font-sans text-[13px] font-medium border-none cursor-pointer transition-colors bg-transparent',
                tab === t
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'chat' ? 'Chat' : 'Mis apuntes'}
            </button>
          ))}
        </div>

        {/* Chat tab */}
        {tab === 'chat' && (
          <>
            <div className="flex-1 min-h-0">
              <div
                className="h-full overflow-y-auto px-4 pt-4 pb-8"
                style={{ maskImage: 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)' }}
              >
              {loadingHistory && (
                <div className="flex gap-1.5 items-center mb-4">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="ce-pulse w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animationDelay: `${j * 0.2}s` }} />
                  ))}
                  <span className="font-sans text-[12px] text-muted-foreground/60 ml-1">Cargando conversación…</span>
                </div>
              )}

              {!loadingHistory && hadHistory && messages.length > 0 && (
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
                      <div className="w-6 h-6 rounded-full bg-background border border-border shrink-0 mr-2 mt-0.5 flex items-center justify-center overflow-hidden">
                        <Image src="/assets/aliis-logo.png" alt="Aliis" width={16} height={16} className="object-contain" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[85%]',
                      m.role === 'user'
                        ? 'bg-foreground rounded-[12px_12px_3px_12px] px-3 py-2'
                        : 'bg-muted border border-border rounded-[3px_12px_12px_12px] px-4 py-3'
                    )}>
                      {m.role === 'user' ? (
                        <p className="font-sans text-[13px] leading-[1.65] m-0 text-background whitespace-pre-wrap">
                          {m.text}
                        </p>
                      ) : m.text === '' ? (
                        <div className="flex items-center gap-2 py-0.5">
                          <div className="flex gap-[3px]">
                            {[0, 1, 2].map((j) => (
                              <div
                                key={j}
                                className="w-1 h-1 rounded-full bg-primary"
                                style={{
                                  animation: 'aliis-bounce 1.2s ease-in-out infinite',
                                  animationDelay: `${j * 0.18}s`,
                                }}
                              />
                            ))}
                          </div>
                          <span className="font-mono text-[9px] tracking-widest text-shimmer-ai">
                            pensando
                          </span>
                        </div>
                      ) : streaming && i === messages.length - 1 ? (
                        (() => {
                          const chunkSize = 18
                          const tail = m.text.length % chunkSize
                          const cutoff = m.text.length - (tail || chunkSize)
                          const stable = m.text.slice(0, cutoff)
                          const incoming = m.text.slice(cutoff)
                          const chunkKey = Math.floor(m.text.length / chunkSize)
                          return (
                            <span className="whitespace-pre-wrap">
                              {stable}
                              <span key={chunkKey} className="ai-stream-text">{incoming}</span>
                            </span>
                          )
                        })()
                      ) : (
                        <FormattedText text={m.text} />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </div>
            </div>

            {/* Input */}
            <div className="px-4 pt-3 pb-4 border-t border-border shrink-0">
              <div className="flex gap-2 items-center bg-background border border-border rounded-2xl px-4 py-2.5 focus-within:border-foreground/30 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Pregunta sobre ${dx}…`}
                  rows={1}
                  disabled={streaming}
                  className="flex-1 border-none bg-transparent outline-none font-sans text-[16px] md:text-[13px] text-foreground placeholder:text-muted-foreground/50 resize-none leading-[1.5] min-h-[20px] max-h-[100px] overflow-y-auto"
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
                    'w-7 h-7 rounded-full border-none shrink-0 flex items-center justify-center transition-all duration-150',
                    isActive
                      ? 'bg-foreground cursor-pointer text-background hover:opacity-80'
                      : 'bg-muted cursor-not-allowed text-muted-foreground/40'
                  )}
                >
                  <ArrowUp size={14} />
                </button>
              </div>
              <p className="font-sans text-[10px] text-muted-foreground/40 mt-2 leading-[1.4] text-center">
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
                  <Icon icon="solar:notes-bold-duotone" width={14} className="text-primary shrink-0" />
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
                  <Icon icon="solar:magic-stick-3-bold-duotone" width={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-serif text-[17px] text-foreground mb-2 leading-[1.3]">
                    Genera tus apuntes
                  </p>
                  <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] max-w-[260px]">
                    {totalUserMessages < 3
                      ? `Necesitas al menos 3 preguntas para generar apuntes. Llevas ${totalUserMessages}.`
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
                      <Icon icon="solar:refresh-bold-duotone" width={14} className="animate-spin" />
                      Generando…
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:magic-stick-3-bold-duotone" width={14} />
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
