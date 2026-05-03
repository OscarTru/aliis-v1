'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function VerifyStandby({ priceKey, email }: { priceKey: string; email: string }) {
  const router = useRouter()
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  // Listener: when the user clicks the verification link from the same browser,
  // Supabase fires SIGNED_IN / USER_UPDATED here. We send them to checkout.
  useEffect(() => {
    const supabase = createClient()
    const checkoutUrl = `/checkout?plan=${priceKey}`

    // Maybe they're already verified by the time they land here (race).
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email_confirmed_at) router.replace(checkoutUrl)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') && session?.user?.email_confirmed_at) {
        router.replace(checkoutUrl)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, priceKey])

  // Polling fallback: if the user verifies from another device, the auth state
  // listener won't fire here. Poll every 5s for up to 15 minutes.
  useEffect(() => {
    const supabase = createClient()
    const checkoutUrl = `/checkout?plan=${priceKey}`
    const startedAt = Date.now()
    const MAX_MS = 15 * 60 * 1000

    const poll = setInterval(async () => {
      if (Date.now() - startedAt > MAX_MS) {
        clearInterval(poll)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        clearInterval(poll)
        router.replace(checkoutUrl)
      }
    }, 5000)

    return () => clearInterval(poll)
  }, [router, priceKey])

  async function handleManualCheck() {
    setManualError(null)
    setChecking(true)
    const supabase = createClient()
    // Force a refresh to pick up the latest verification status
    await supabase.auth.refreshSession()
    const { data: { user } } = await supabase.auth.getUser()
    setChecking(false)
    if (user?.email_confirmed_at) {
      router.replace(`/checkout?plan=${priceKey}`)
      return
    }
    setManualError('Aún no detectamos la verificación. Revisa tu correo y haz click en el enlace.')
  }

  async function handleResend() {
    if (!email) return
    setResendError(null)
    setResending(true)
    const supabase = createClient()
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/checkout?plan=${priceKey}`)}`
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo },
    })
    setResending(false)
    if (error) {
      setResendError('No pudimos reenviar el correo. Espera un minuto e intenta de nuevo.')
      return
    }
    setResent(true)
  }

  return (
    <div className="min-h-screen bg-[#0F1923] text-white relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(31,138,155,0.18) 0%, transparent 60%)',
        }}
      />

      <div className="relative border-b border-white/10">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link
            href="/precios"
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-[13px] font-sans no-underline"
          >
            <ArrowLeft size={15} />
            Volver
          </Link>
          <Image
            src="/assets/aliis-original.png"
            alt="Aliis"
            width={72}
            height={28}
            className="object-contain opacity-90"
          />
        </div>
      </div>

      <div className="relative max-w-[560px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center"
        >
          <div className="font-mono text-[10px] tracking-[.2em] uppercase text-white/45 mb-2">
            Paso 1.5 · Verifica tu correo
          </div>

          <div className="mx-auto w-20 h-20 rounded-full bg-secondary/15 ring-1 ring-secondary/30 flex items-center justify-center mb-6 relative">
            <Mail size={32} className="text-secondary" strokeWidth={1.5} />
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-secondary/40"
              animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          </div>

          <h1 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] tracking-[-0.02em] leading-[1.1] m-0 mb-3">
            Revisa tu correo <em className="text-white/55">para continuar.</em>
          </h1>

          <p className="font-sans text-[15px] text-white/65 leading-relaxed mb-8">
            Te mandamos un enlace de verificación{email ? <> a <span className="text-white font-medium">{email}</span></> : ''}.
            Cuando hagas click, te traemos automáticamente a la pantalla de pago.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 flex items-center justify-center gap-2.5 text-[13px] text-white/55">
            <Loader2 size={14} className="animate-spin text-secondary" />
            Esperando que verifiques tu correo…
          </div>

          {/* Manual check (fallback for cross-device verification) */}
          <Button
            onClick={handleManualCheck}
            disabled={checking}
            className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-sans font-medium text-[15px] mb-3"
          >
            {checking ? 'Comprobando…' : 'Ya verifiqué mi correo →'}
          </Button>

          {manualError && (
            <p className="font-sans text-[12.5px] text-amber-400/90 mb-3">{manualError}</p>
          )}

          {/* Resend */}
          <div className="flex flex-col items-center gap-1 text-[13px] font-sans">
            {!resent ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email}
                className="text-white/55 hover:text-white bg-transparent border-none cursor-pointer transition-colors disabled:opacity-50"
              >
                {resending ? 'Reenviando…' : '¿No te llegó? Reenviar correo'}
              </button>
            ) : (
              <span className="text-emerald-400/90 font-mono text-[11px] tracking-[.12em] uppercase">
                ✓ Correo reenviado
              </span>
            )}
            {resendError && (
              <span className="text-red-400/90 text-[12px]">{resendError}</span>
            )}
          </div>

          <p className="font-mono text-[10px] tracking-[.15em] uppercase text-white/35 mt-10">
            Si cierras esta página, vuelve a abrir el enlace del correo cuando lo recibas
          </p>
        </motion.div>
      </div>
    </div>
  )
}
