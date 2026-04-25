'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '@/components/AppNav'
import { UpgradeModal } from '@/components/UpgradeModal'
import { createClient } from '@/lib/supabase'

type BotMessage = { role: 'bot'; text: string; chips?: string[] }
type UserMessage = { role: 'user'; text: string }
type Message = BotMessage | UserMessage

type Step = 'dx' | 'confirm' | 'done'

const FRECUENCIA_CHIPS = ['Recién diagnosticado', 'Hace meses', 'Llevo años con esto']
const DUDAS_CHIPS = ['Qué esperar', 'Medicamentos', 'Estilo de vida', 'Compartir con familia']

export default function IngresoPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Hola! Cuéntame el diagnóstico que quieres entender.' },
  ])
  const [step, setStep] = useState<Step>('dx')
  const [dx, setDx] = useState('')
  const [frecuencia, setFrecuencia] = useState('')
  const [dudas, setDudas] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg])
  }

  function handleDxSubmit(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    addMessage({ role: 'user', text: trimmed })
    setDx(trimmed)
    setTimeout(() => {
      addMessage({ role: 'bot', text: `Entendido: "${trimmed}". ¿Cuándo te lo diagnosticaron?`, chips: FRECUENCIA_CHIPS })
    }, 400)
    setStep('confirm')
    setInput('')
  }

  function handleChip(chip: string) {
    if (step === 'confirm') {
      addMessage({ role: 'user', text: chip })
      setFrecuencia(chip)
      setTimeout(() => {
        addMessage({ role: 'bot', text: '¿Qué te gustaría entender mejor?', chips: DUDAS_CHIPS })
      }, 300)
      setStep('done')
    } else if (step === 'done' && !dudas) {
      addMessage({ role: 'user', text: chip })
      setDudas(chip)
    }
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      const userPlan = profile?.plan ?? 'free'

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/pack/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnostico: dx,
          contexto: { frecuencia, dudas },
          userId: user.id,
          userPlan,
        }),
      })

      if (!res.ok) {
        addMessage({ role: 'bot', text: 'Hubo un error. Por favor intenta de nuevo.' })
        return
      }

      const data = await res.json() as {
        limitReached?: boolean
        emergencyResponse?: string
        blockedReason?: string
        blockedMessage?: string
        pack?: { id: string }
      }

      if (data.limitReached) { setShowUpgrade(true); return }
      if (data.emergencyResponse) { addMessage({ role: 'bot', text: data.emergencyResponse }); return }
      if (data.blockedReason) { addMessage({ role: 'bot', text: data.blockedMessage ?? 'No puedo ayudarte con eso.' }); return }
      if (data.pack?.id) {
        router.push(`/loading?packId=${data.pack.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const showGenerateButton = step === 'done' && dudas !== ''

  return (
    <>
      <AppNav />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '24px 24px 140px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} className="ce-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'var(--c-brand-teal)' : 'var(--c-surface)',
                color: msg.role === 'user' ? '#fff' : 'var(--c-text)',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                lineHeight: 1.5,
              }}>
                {msg.text}
              </div>
              {msg.role === 'bot' && (msg as BotMessage).chips && (msg as BotMessage).chips!.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(msg as BotMessage).chips!.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChip(chip)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 999,
                        border: '1px solid var(--c-border)',
                        background: 'var(--c-bg)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        color: 'var(--c-text)',
                        cursor: 'pointer',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {showGenerateButton && (
            <div className="ce-fade" style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  padding: '14px 40px',
                  borderRadius: 999,
                  background: 'var(--c-brand-teal)',
                  color: '#fff',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Generando pack…' : 'Generar mi pack'}
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Sticky composer — only shown during dx input step */}
      {step === 'dx' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          borderTop: '1px solid var(--c-border)',
          background: 'color-mix(in srgb, var(--c-bg) 90%, transparent)',
          backdropFilter: 'blur(12px)',
          padding: '16px 24px',
        }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleDxSubmit(input) }}
            style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 12 }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe el diagnóstico…"
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 999,
                border: '1px solid var(--c-border)', background: 'var(--c-surface)',
                fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px', borderRadius: 999,
                background: 'var(--c-brand-teal)', color: '#fff',
                border: 'none', fontFamily: 'var(--font-sans)',
                fontSize: 15, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
