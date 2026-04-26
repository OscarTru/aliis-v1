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
