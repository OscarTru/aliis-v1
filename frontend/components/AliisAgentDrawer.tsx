'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ArrowUp } from 'lucide-react'
import { useAliisAgentContext } from '@/lib/aliis-agent-context'
import { cn } from '@/lib/utils'
import type { AgentResponse } from '@/lib/types'
import { FormattedText } from '@/components/FormattedText'

type Message = {
  role: 'user' | 'assistant'
  text: string
  action?: AgentResponse['action']
}

const SCREEN_LABELS: Record<string, string> = {
  diario: 'Tu diario de salud',
  tratamientos: 'Tus tratamientos',
  historial: 'Tu historial',
  cuenta: 'Tu cuenta',
}

export function AliisAgentDrawer() {
  const { open, setOpen, screenContext } = useAliisAgentContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const rafRef = useRef<number | null>(null)
  const accRef = useRef('')

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  // Focus textarea when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [open])

  // Auto-scroll after new message
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function send() {
    const q = input.trim()
    if (!q || loading) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const next = [...messages, { role: 'user' as const, text: q }]
    setInput('')
    setLoading(true)
    setMessages([...next, { role: 'assistant', text: '' }])
    accRef.current = ''

    try {
      const res = await fetch('/api/aliis/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          history: messages
            .filter((m) => m.text !== '')
            .map((m) => ({ role: m.role, content: m.text })),
          screen_context: screenContext,
          mode: 'query',
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        setMessages([...next, { role: 'assistant', text: 'Hubo un error. Intenta de nuevo.' }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      const flush = (final = false) => {
        let text = accRef.current
        let action: AgentResponse['action'] | undefined

        // Extract action sentinel from end of accumulated text
        const sentinelIdx = text.indexOf('\n__ACTION__')
        if (sentinelIdx !== -1) {
          try { action = JSON.parse(text.slice(sentinelIdx + 11)) } catch { /* ignore */ }
          text = text.slice(0, sentinelIdx)
        }

        setMessages([...next, { role: 'assistant', text: text || (final ? 'Sin respuesta. Intenta de nuevo.' : ''), action }])
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
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages([...next, { role: 'assistant', text: 'Hubo un error de conexión. Intenta de nuevo.' }])
      }
    } finally {
      setLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function handleActionClick(action: NonNullable<AgentResponse['action']>) {
    // Fire and forget — no UX change needed
    fetch(action.endpoint, { method: action.method }).catch(() => undefined)
  }

  const screenLabel = SCREEN_LABELS[screenContext] ?? 'Aliis'
  const isActive = Boolean(input.trim()) && !loading

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 bg-foreground/20 transition-opacity duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-40 w-full sm:w-[380px] bg-background border-l border-border flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none',
          'h-[100dvh] md:h-[100dvh]',
          open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-background border border-border shrink-0 flex items-center justify-center overflow-hidden">
              <Image src="/assets/aliis-logo.png" alt="Aliis" width={16} height={16} className="object-contain" />
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-[.18em] uppercase text-primary/70 mb-0.5">
                · Aliis ·
              </div>
              <div className="font-serif text-[15px] text-foreground leading-tight">
                {screenLabel}
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-none cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 min-h-0">
          <div
            className="h-full overflow-y-auto px-4 pt-4 pb-8"
            style={{ maskImage: 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)' }}
          >
          {messages.length === 0 && (
            <div className="text-center pt-8 pb-4">
              <p className="font-serif text-[16px] text-foreground mb-2 leading-[1.4]">
                ¿Tienes alguna duda sobre tu salud?
              </p>
              <p className="font-sans text-[13px] text-muted-foreground leading-[1.5]">
                Pregúntame lo que necesites.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-background border border-border shrink-0 mr-2 mt-0.5 flex items-center justify-center overflow-hidden">
                      <Image src="/assets/aliis-logo.png" alt="Aliis" width={16} height={16} className="object-contain" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%]',
                      m.role === 'user'
                        ? 'bg-foreground rounded-[12px_12px_3px_12px] px-3 py-2'
                        : 'bg-muted border border-border rounded-[3px_12px_12px_12px] px-4 py-3'
                    )}
                  >
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
                    ) : (
                      <FormattedText text={m.text} />
                    )}
                  </div>
                </div>

                {/* Action button */}
                {m.role === 'assistant' && m.action && (
                  <button
                    onClick={() => handleActionClick(m.action!)}
                    className="ml-8 mt-1.5 text-[12px] font-sans rounded-full border border-border px-3 py-1 text-foreground hover:bg-muted transition-colors cursor-pointer bg-transparent"
                  >
                    {m.action.label}
                  </button>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
        </div>

        {/* Input */}
        <div className="px-4 pt-2 pb-4 shrink-0">
          <div className={cn(
            'btn-ai-border flex gap-2 items-center bg-background border rounded-2xl px-4 py-2.5 transition-colors',
            focused ? 'border-transparent [&::before]:opacity-40' : 'border-border'
          )}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pregunta a Aliis…"
              rows={1}
              disabled={loading}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
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
      </div>
    </>
  )
}
