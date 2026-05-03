'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'
import { Input } from '@/components/ui/input'
import { sendSupportTicket } from '@/app/actions/support'

const MAX_SUBJECT = 120
const MAX_MESSAGE = 4000

export function SupportSection({ plan, anchorId }: { plan: 'free' | 'pro'; anchorId?: string }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()
  const sectionRef = useRef<HTMLDivElement>(null)

  // If the page is opened with `#soporte` (or whatever anchorId), scroll to it.
  useEffect(() => {
    if (!anchorId) return
    if (typeof window === 'undefined') return
    if (window.location.hash !== `#${anchorId}`) return
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [anchorId])

  function reset() {
    setSubject('')
    setMessage('')
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await sendSupportTicket({ subject, message })
      if (res.ok) {
        setSent(true)
        reset()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div ref={sectionRef} id={anchorId} className="mb-10 scroll-mt-20">
      <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-4 flex items-center gap-2">
        Soporte
        {plan === 'pro' && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono text-[9px] tracking-[.15em] normal-case">
            <Icon icon="solar:crown-bold-duotone" width={11} />
            Prioritario
          </span>
        )}
      </div>

      <div className="bg-background border border-border rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-border">
          <p className="font-sans text-[14px] text-foreground m-0 mb-1">
            ¿Algo no funciona o tienes una pregunta sobre tu cuenta?
          </p>
          <p className="font-sans text-[13px] text-muted-foreground m-0">
            Mándanos un mensaje y te respondemos al correo de tu cuenta.
            {plan === 'pro' && ' Como suscriptor Pro, tu ticket entra a la cola prioritaria.'}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 sm:px-6 py-8 flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/15 ring-1 ring-secondary/30 flex items-center justify-center">
                <Icon icon="solar:check-circle-bold-duotone" width={26} className="text-secondary" />
              </div>
              <div>
                <div className="font-serif italic text-[18px] text-foreground mb-1">
                  Mensaje enviado.
                </div>
                <div className="font-sans text-[13px] text-muted-foreground">
                  Te respondemos al correo de tu cuenta. Suele tardar entre unas horas y un día hábil.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-2 px-4 py-2 rounded-[10px] border border-border bg-transparent font-sans text-[13px] text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit}
              className="px-4 sm:px-6 py-5 flex flex-col gap-3"
            >
              <div>
                <label className="font-sans text-[12px] text-muted-foreground mb-1.5 block">Asunto</label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setError(null) }}
                  maxLength={MAX_SUBJECT}
                  placeholder="Ej: No me llega el correo de verificación"
                  required
                  className="h-11 rounded-xl border-[1.5px] focus-visible:ring-secondary/20 focus-visible:ring-[3px] focus-visible:border-secondary bg-muted font-sans text-[14px]"
                />
              </div>

              <div>
                <label className="font-sans text-[12px] text-muted-foreground mb-1.5 block">Mensaje</label>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setError(null) }}
                  maxLength={MAX_MESSAGE}
                  rows={5}
                  placeholder="Cuéntanos qué pasa, qué intentaste y desde qué dispositivo. Mientras más detalle, más rápido podemos ayudarte."
                  required
                  className="w-full rounded-xl border-[1.5px] border-border focus:ring-secondary/20 focus:ring-[3px] focus:border-secondary focus:outline-none bg-muted font-sans text-[14px] px-3 py-3 resize-y min-h-[120px]"
                />
                <div className="font-mono text-[10px] text-muted-foreground/50 text-right mt-1">
                  {message.length} / {MAX_MESSAGE}
                </div>
              </div>

              <p className="font-sans text-[11.5px] text-muted-foreground/70 leading-relaxed -mt-1">
                Soporte cubre temas de cuenta, suscripción y problemas técnicos. Para preguntas médicas, usa el asistente IA dentro de tu explicación.
              </p>

              {error && (
                <p className="font-sans text-[13px] text-destructive m-0">{error}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="submit"
                  disabled={pending || !subject.trim() || message.trim().length < 10}
                  className="px-5 py-2.5 rounded-[10px] border-none bg-secondary text-secondary-foreground font-sans text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 shadow-[var(--c-btn-primary-shadow)] hover:bg-secondary/90 transition-colors duration-150"
                >
                  {pending ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
