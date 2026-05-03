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
    // Split layout, identical to /checkout (step 2) so the visual transition
    // between paso 1 → paso 2 is seamless. Same proportions, same colors,
    // same back-button placement.
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">

      {/* Left — editorial, dark bg */}
      <div className="bg-[#0a0a0a] flex flex-col px-10 py-12 lg:px-16 lg:py-16">
        {/* Back */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back()
            } else {
              router.push('/precios')
            }
          }}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.12em] uppercase text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer p-0 self-start mb-12"
        >
          <ArrowLeft size={11} />
          Volver
        </button>

        <div className="flex flex-col gap-8 flex-1">
          {/* Logo */}
          <Image
            src="/assets/aliis-black-single.png"
            alt="Aliis"
            width={36}
            height={36}
            className="object-contain"
          />

          {/* Step indicator */}
          <div className="font-mono text-[10px] tracking-[.18em] uppercase text-[#1f8a9b]">
            Paso 1 de 2 · Crea tu cuenta
          </div>

          {/* Headline */}
          <div>
            <p className="font-mono text-[10px] tracking-[.18em] uppercase text-white/30 mb-3">
              Aliis Pro
            </p>
            <h1 className="font-serif text-[clamp(2rem,3.5vw,2.8rem)] leading-[1.15] text-white">
              Empieza tu prueba{' '}
              <em className="text-white/40">de 14 días.</em>
            </h1>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {[
              'Explicaciones ilimitadas con tu perfil médico',
              'Asistente IA con memoria y streaming',
              'Detector de inconsistencias dx ↔ tratamiento',
              'Análisis de correlación síntoma-vital',
              'Preparar consulta con tu médico',
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="text-[#1f8a9b] mt-0.5 text-[15px]">✓</span>
                <span className="font-sans text-[14px] text-white/60">{f}</span>
              </li>
            ))}
          </ul>

          {/* Price — at bottom */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-[42px] font-bold text-white leading-none">
                {planInfo.price}
              </span>
              <span className="font-sans text-[15px] text-white/40">
                /{priceKey.endsWith('_yearly') ? 'año' : 'mes'}
              </span>
            </div>
            <p className="font-sans text-[13px] text-[#1f8a9b] mt-2">
              14 días gratis · no se cobra nada hasta que termine la prueba
            </p>
          </div>
        </div>
      </div>

      {/* Right — signup form */}
      <div className="bg-background flex flex-col items-center justify-center px-6 py-10 lg:px-16 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]"
        >
          <h2 className="font-serif text-[24px] text-foreground mb-2">
            Crea tu cuenta
          </h2>
          <p className="font-sans text-[13.5px] text-muted-foreground leading-relaxed mb-6">
            En el siguiente paso ingresarás tu método de pago. No se cobra nada hasta que terminen los 14 días.
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
                className="h-11 rounded-xl border border-border bg-muted text-foreground placeholder:text-[12px] placeholder:text-muted-foreground/70 font-mono tracking-widest pr-9 focus-visible:border-primary/50"
              />
              {inviteCode.trim().length >= 6 && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-mono font-medium ${inviteChecking ? 'text-muted-foreground' : inviteValidated ? 'text-emerald-500' : 'text-destructive'}`}>
                  {inviteChecking ? '…' : inviteValidated ? '✓' : '✗'}
                </span>
              )}
            </div>
            {inviteError && inviteCode.trim().length >= 6 && !inviteChecking && (
              <p className="font-sans text-[12px] text-destructive -mt-1">{inviteError}</p>
            )}

            {/* Google OAuth — only active when invite is valid */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!inviteValidated || googleLoading}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-sans text-[14px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <GoogleIcon />
              {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="font-sans text-[11px] text-muted-foreground">o con email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex gap-2.5">
              <Input
                type="text"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-11 rounded-xl border border-border bg-muted text-foreground placeholder:text-[13px] placeholder:text-muted-foreground/70 focus-visible:border-primary/50"
              />
              <Input
                type="text"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-11 rounded-xl border border-border bg-muted text-foreground placeholder:text-[13px] placeholder:text-muted-foreground/70 focus-visible:border-primary/50"
              />
            </div>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl border border-border bg-muted text-foreground placeholder:text-[13px] placeholder:text-muted-foreground/70 focus-visible:border-primary/50"
            />
            <Input
              type="password"
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 rounded-xl border border-border bg-muted text-foreground placeholder:text-[13px] placeholder:text-muted-foreground/70 focus-visible:border-primary/50"
            />
            <Input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 rounded-xl border border-border bg-muted text-foreground placeholder:text-[13px] placeholder:text-muted-foreground/70 focus-visible:border-primary/50"
            />

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
                />
                <span className="font-sans text-[11.5px] text-muted-foreground leading-snug">
                  Acepto los{' '}
                  <a href="/terminos" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">términos</a>
                  {' '}y la{' '}
                  <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">política de privacidad</a>
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedMedicalData}
                  onChange={(e) => setAcceptedMedicalData(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
                />
                <span className="font-sans text-[11.5px] text-muted-foreground leading-snug">
                  Acepto el{' '}
                  <a href="/privacidad#datos-medicos" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">tratamiento de mis datos de salud</a>
                  {' '}(Art. 9 GDPR · LFPDPPP)
                </span>
              </label>
            </div>

            {error && <p className="text-destructive font-sans text-[13px] m-0">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !inviteValidated || !firstName.trim() || !lastName.trim() || !email.trim() || password.length < 6 || !confirmPassword || !acceptedTerms || !acceptedMedicalData}
              className="h-11 rounded-xl mt-2 bg-foreground text-background hover:bg-foreground/90 font-sans font-medium text-[14.5px] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta…' : 'Continuar →'}
            </Button>
          </form>

          {/* Already have account */}
          <div className="mt-5 text-[13px] font-sans text-center">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión →
            </button>
          </div>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-[11.5px] text-muted-foreground">
            <ShieldCheck size={13} />
            <span>No te cobramos hasta que terminen los 14 días</span>
          </div>
        </motion.div>
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
