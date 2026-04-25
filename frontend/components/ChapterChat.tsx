'use client'

import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; text: string }

export function ChapterChat({
  dx,
  chapterTitle,
  chapterContent,
}: {
  dx: string
  chapterTitle: string
  chapterContent: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function send() {
    const q = input.trim()
    if (!q || streaming) return

    const next: Message[] = [...messages, { role: 'user', text: q }]
    setMessages(next)
    setInput('')
    setStreaming(true)

    // Add empty assistant message to stream into
    setMessages([...next, { role: 'assistant', text: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, dx, chapterTitle, chapterContent }),
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

  return (
    <div style={{
      marginTop: 40,
      paddingTop: 32,
      borderTop: '1px solid var(--c-border)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-brand-teal)', marginBottom: 6 }}>
          · Tu consejero ·
        </div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '-.015em', color: 'var(--c-text)', margin: 0, lineHeight: 1.3 }}>
          ¿Te quedó claro? ¿Tienes más preguntas?
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)', marginTop: 6, lineHeight: 1.5 }}>
          Pregúntame lo que quieras sobre {dx}. Estoy aquí para explicarte con más detalle.
        </p>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {m.role === 'assistant' && (
                <div style={{
                  width: 28, height: 28, borderRadius: 999, background: 'var(--c-brand-teal)',
                  flexShrink: 0, marginRight: 10, marginTop: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-serif)', fontSize: 12, color: '#fff', fontWeight: 600,
                }}>
                  A
                </div>
              )}
              <div style={{
                maxWidth: '82%',
                padding: m.role === 'user' ? '10px 14px' : '14px 18px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                background: m.role === 'user' ? '#0F1923' : 'var(--c-surface)',
                border: m.role === 'assistant' ? '1px solid var(--c-border)' : 'none',
                boxShadow: m.role === 'user' ? '0 0 0 1px rgba(31,138,155,.3)' : 'none',
              }}>
                {m.role === 'assistant' && m.text === '' ? (
                  <div style={{ display: 'flex', gap: 4, padding: '2px 0' }}>
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="ce-pulse" style={{
                        width: 6, height: 6, borderRadius: 999,
                        background: 'var(--c-brand-teal)',
                        animationDelay: `${j * 0.2}s`,
                      }} />
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontFamily: m.role === 'user' ? 'var(--font-sans)' : 'var(--font-sans)',
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: m.role === 'user' ? '#fff' : 'var(--c-text)',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
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
      <div style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 14,
        padding: '10px 12px',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Pregunta algo sobre ${dx}…`}
          rows={1}
          disabled={streaming}
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)',
            resize: 'none', lineHeight: 1.5,
            minHeight: 22, maxHeight: 120, overflowY: 'auto',
          }}
          onInput={(e) => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = `${Math.min(t.scrollHeight, 120)}px`
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || streaming}
          style={{
            width: 34, height: 34, borderRadius: 10, border: 'none', flexShrink: 0,
            background: input.trim() && !streaming ? '#0F1923' : 'var(--c-border)',
            boxShadow: input.trim() && !streaming ? '0 0 0 1px rgba(31,138,155,.3)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
            transition: 'background .15s, box-shadow .15s',
            color: input.trim() && !streaming ? '#fff' : 'var(--c-text-faint)',
          }}
        >
          <Send size={15} />
        </button>
      </div>

      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--c-text-faint)', marginTop: 8, lineHeight: 1.4 }}>
        Esta conversación no reemplaza la consulta con tu médico.
      </p>
    </div>
  )
}
