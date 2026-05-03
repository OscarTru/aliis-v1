'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase'
import { LoginModal } from '@/components/LoginModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PRICE_LABELS: Record<string, { label: string; price: string }> = {
  eur_monthly: { label: 'Pro · mensual', price: '€9.99 / mes' },
  eur_yearly: { label: 'Pro · anual', price: '€7.99 / mes' },
  usd_monthly: { label: 'Pro · mensual', price: '$9.99 / mes' },
  usd_yearly: { label: 'Pro · anual', price: '$7.99 / mes' },
  mxn_monthly: { label: 'Pro · mensual', price: '$199 MXN / mes' },
  mxn_yearly: { label: 'Pro · anual', price: '$159 MXN / mes' },
}

export function CheckoutSignupForm({ priceKey }: { priceKey: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteValidated, setInviteValidated] = useState(false)
  const [inviteChecking, setInviteChecking] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedMedicalData, setAcceptedMedicalData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const planInfo = PRICE_LABELS[priceKey] ?? PRICE_LABELS.eur_monthly

  // Validate invite code in real-time (debounced)
  useEffect(() => {
    const code = inviteCode.trim().toUpperCase()
    if (code.length < 6) { setInviteValidated(false); setInviteError(null); return }
    setInviteChecking(true)
    setInviteValidated(false)
    setInviteError(null)
    const timer = setTimeout(async () => {
      const res = await fetch('/api/invite/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }).catch(() => null)
      const data = res ? await res.json().catch(() => ({})) : {}
      setInviteValidated(!!data.valid)
      setInviteError(data.valid ? null : (data.error ?? 'Código no válido'))
      setInviteChecking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [inviteCode])

  function err(msg: string) {
    const map: Record<string, string> = {
      'Invalid login credentials': 'Email o contraseña incorrectos.',
      'Email not confirmed': 'Confirma tu email antes de entrar.',
      'User already registered': 'Ya existe una cuenta con ese email. Inicia sesión.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    }
    return map[msg] ?? msg
  }

  async function handleGoogleSignIn() {
    const codeToUse = inviteCode.trim().toUpperCase()
    if (!codeToUse) { setError('El código de invitación es obligatorio.'); return }
    setGoogleLoading(true)
    setError(null)
    const validateRes = await fetch('/api/invite/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeToUse }),
    })
    const validateData = await validateRes.json()
    if (!validateData.valid) {
      setError(validateData.error ?? 'Código de invitación no válido.')
      setGoogleLoading(false)
      return
    }
    const supabase = createClient()
    // After Google OAuth, redirect to /checkout?plan=xxx
    const callbackUrl = `${window.location.origin}/auth/callback?invite=${encodeURIComponent(codeToUse)}&next=${encodeURIComponent(`/checkout?plan=${priceKey}`)}`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    if (!firstName.trim()) { setError('El nombre es obligatorio.'); setLoading(false); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); setLoading(false); return }

    const codeToUse = inviteCode.trim().toUpperCase()
    if (!codeToUse) { setError('El código de invitación es obligatorio.'); setLoading(false); return }

    // Read-only validation. The atomic claim happens in /auth/callback once
    // we have user.id — that way, if signup fails, the code is NOT consumed.
    const validateRes = await fetch('/api/invite/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeToUse }),
    })
    const validateData = await validateRes.json()
    if (!validateData.valid) {
      setError(validateData.error ?? 'Código de invitación no válido.')
      setLoading(false)
      return
    }

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
    const consentTimestamp = new Date().toISOString()
    // After verification email click, redirect to /checkout?plan=xxx.
    // We forward the invite code so the callback can claim it atomically.
    const emailRedirectTo = `${window.location.origin}/auth/callback?invite=${encodeURIComponent(codeToUse)}&next=${encodeURIComponent(`/checkout?plan=${priceKey}`)}`
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          name: fullName,
          consents_pending: {
            terms: { granted: acceptedTerms, at: consentTimestamp },
            medical_data: { granted: acceptedMedicalData, at: consentTimestamp },
            policy_version: '1.0',
          },
        },
      },
    })
    setLoading(false)
    if (signUpErr) { setError(err(signUpErr.message)); return }

    // Move user to verification standby page
    router.push(`/checkout/verificando?plan=${priceKey}&email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-[#0F1923] text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(31,138,155,0.18) 0%, transparent 60%)',
        }}
      />

      {/* Top bar */}
      <div className="relative border-b border-white/10">
        <div className="max-w-[1080px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* Back — return wherever the user came from (landing, /precios,
              /historial, etc). Falls back to /precios if no history. */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back()
              } else {
                router.push('/precios')
              }
            }}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-[13px] font-sans bg-transparent border-none cursor-pointer p-0"
          >
            <ArrowLeft size={15} />
            Volver
          </button>
          <Image
            src="/assets/aliis-original.png"
            alt="Aliis"
            width={72}
            height={28}
            className="object-contain opacity-90"
          />
        </div>
      </div>

      <div className="relative max-w-[1080px] mx-auto px-5 sm:px-8 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-[1.1fr_.9fr] gap-10 md:gap-14 items-start">

        {/* Left: form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="font-mono text-[10px] tracking-[.2em] uppercase text-white/50 mb-2">
            Paso 1 de 2 · Crea tu cuenta
          </div>
          <h1 className="font-serif text-[clamp(2rem,4.5vw,3rem)] tracking-[-0.025em] leading-[1.05] m-0 mb-3">
            Empieza tu prueba <em className="text-white/55">de 14 días.</em>
          </h1>
          <p className="font-sans text-[15px] text-white/60 leading-relaxed mb-7 max-w-[44ch]">
            Crea tu cuenta primero. En el siguiente paso ingresarás tu método de pago — no se cobra nada hasta que terminen los 14 días de prueba.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Invite code first — gates Google + submit */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Código de invitación (ALIIS-BETA-XXXX)"
                value={inviteCode}
                onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(null) }}
                required
                spellCheck={false}
                autoComplete="off"
                className="h-12 rounded-xl border-[1.5px] border-white/15 bg-white/5 text-white placeholder:text-white/35 font-mono tracking-widest pr-9 focus-visible:ring-secondary/30 focus-visible:ring-[3px] focus-visible:border-secondary"
              />
              {inviteCode.trim().length >= 6 && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-mono font-medium ${inviteChecking ? 'text-white/40' : inviteValidated ? 'text-emerald-400' : 'text-red-400'}`}>
                  {inviteChecking ? '…' : inviteValidated ? '✓' : '✗'}
                </span>
              )}
            </div>
            {inviteError && inviteCode.trim().length >= 6 && !inviteChecking && (
              <p className="font-sans text-[12px] text-red-400 -mt-1">{inviteError}</p>
            )}

            {/* Google OAuth — only active when invite is valid */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!inviteValidated || googleLoading}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl border-[1.5px] border-white/15 bg-white text-black font-sans text-[14.5px] font-medium hover:bg-white/95 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              <GoogleIcon />
              {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-sans text-[11px] text-white/40">o con email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="flex gap-2.5">
              <Input
                type="text"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-12 rounded-xl border-[1.5px] border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-secondary/30 focus-visible:ring-[3px] focus-visible:border-secondary"
              />
              <Input
                type="text"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-12 rounded-xl border-[1.5px] border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-secondary/30 focus-visible:ring-[3px] focus-visible:border-secondary"
              />
            </div>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-[1.5px] border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-secondary/30 focus-visible:ring-[3px] focus-visible:border-secondary"
            />
            <Input
              type="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-xl border-[1.5px] border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-secondary/30 focus-visible:ring-[3px] focus-visible:border-secondary"
            />
            <Input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-xl border-[1.5px] border-white/15 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-secondary/30 focus-visible:ring-[3px] focus-visible:border-secondary"
            />

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 accent-secondary flex-shrink-0 cursor-pointer"
                />
                <span className="font-sans text-[11px] text-white/55 leading-none">
                  Acepto los{' '}
                  <a href="/terminos" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">términos</a>
                  {' '}y la{' '}
                  <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">política de privacidad</a>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedMedicalData}
                  onChange={(e) => setAcceptedMedicalData(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 accent-secondary flex-shrink-0 cursor-pointer"
                />
                <span className="font-sans text-[11px] text-white/55 leading-none">
                  Acepto el{' '}
                  <a href="/privacidad#datos-medicos" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">tratamiento de mis datos de salud</a>
                  {' '}(Art. 9 GDPR · LFPDPPP)
                </span>
              </label>
            </div>

            {error && <p className="text-red-400 font-sans text-[13px] m-0">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !inviteValidated || !firstName.trim() || !lastName.trim() || !email.trim() || password.length < 6 || !confirmPassword || !acceptedTerms || !acceptedMedicalData}
              className="h-12 rounded-xl mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-sans font-medium text-[15px] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta…' : 'Continuar →'}
            </Button>
          </form>

          {/* Already have account */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] font-sans">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="text-white/55 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión →
            </button>
          </div>
        </motion.div>

        {/* Right: order summary */}
        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="md:sticky md:top-20"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="font-mono text-[10px] tracking-[.2em] uppercase text-white/45 mb-3">
              Resumen
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="font-serif text-[22px] m-0">Aliis Pro</h3>
              <span className="font-mono text-[10px] uppercase tracking-[.18em] text-emerald-400">14 días gratis</span>
            </div>
            <p className="font-serif italic text-[14px] text-white/55 m-0 mb-5">
              {planInfo.label} · {planInfo.price}
            </p>

            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-[13.5px] text-white/75">
              {[
                'Explicaciones ilimitadas con tu perfil médico',
                'Asistente IA con memoria y streaming',
                'Detector de inconsistencias dx ↔ tratamiento',
                'Análisis de correlación síntoma-vital',
                'El Hilo y Cápsula del tiempo',
                'Preparar consulta con tu médico',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="1.8" strokeLinecap="round" className="mt-1 shrink-0" aria-hidden>
                    <path d="M3 7.5L6 10.5 11.5 4.5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="my-5 h-px bg-white/10" />

            <div className="flex items-center gap-2 text-[12px] text-white/50">
              <ShieldCheck size={14} />
              <span>No te cobramos hasta que terminen los 14 días.</span>
            </div>
          </div>
        </motion.aside>
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          initialView="login"
        />
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
