'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase'
import { getPostAuthRedirect } from '@/lib/auth-redirect'
import Image from 'next/image'
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type View = 'login' | 'signup' | 'forgot' | 'verify-email' | 'check-reset'

const SLIDE = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: { duration: 0.18, ease: [0.25, 0, 0, 1] as const },
}

export function LoginModal({ onClose, initialView, initialError, initialInviteCode }: { onClose: () => void; initialView?: View; initialError?: string; initialInviteCode?: string }) {
  const router = useRouter()
  const [view, setView] = useState<View>(initialView ?? 'login')
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
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Pre-fill invite code from URL ?invite= (passed as prop from AppNav)
  useEffect(() => {
    if (initialInviteCode) {
      setInviteCode(initialInviteCode.toUpperCase())
      setView('signup')
    }
  }, [initialInviteCode])

  // Validate invite code in real-time (debounced)
  useEffect(() => {
    if (view !== 'signup') return
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
  }, [inviteCode, view])

  const title: Record<View, string> = {
    login: 'Bienvenido de vuelta',
    signup: 'Crea tu cuenta',
    forgot: '¿Olvidaste tu contraseña?',
    'verify-email': 'Revisa tu correo',
    'check-reset': 'Revisa tu correo',
  }

  function err(msg: string) {
    const map: Record<string, string> = {
      'Invalid login credentials': 'Email o contraseña incorrectos.',
      'Email not confirmed': 'Confirma tu email antes de entrar.',
      'User already registered': 'Ya existe una cuenta con ese email.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    }
    return map[msg] ?? msg
  }

  function goTo(next: View) {
    setView(next)
    setError(null)
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
    setInviteValidated(false)
    setInviteError(null)
    setAcceptedTerms(false)
    setAcceptedMedicalData(false)
  }

  async function handleGoogleSignIn(requireInvite = false) {
    const codeToUse = inviteCode.trim().toUpperCase()
    if (requireInvite) {
      if (!codeToUse) { setError('El código de invitación es obligatorio.'); return }
      setGoogleLoading(true)
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
    } else {
      setGoogleLoading(true)
    }
    const supabase = createClient()
    const callbackUrl = requireInvite
      ? `${window.location.origin}/auth/callback?invite=${encodeURIComponent(codeToUse)}`
      : `${window.location.origin}/auth/callback`
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

    if (view === 'forgot') {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      })
      setLoading(false)
      if (resetErr) { setError(err(resetErr.message)); return }
      setView('check-reset')
      return
    }

    if (view === 'signup') {
      if (!firstName.trim()) { setError('El nombre es obligatorio.'); setLoading(false); return }
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); setLoading(false); return }

      // Validate the invite code (read-only check) before creating the account.
      // The actual claim happens atomically in /auth/callback after the user
      // verifies their email — that way, if signup fails for any reason, the
      // code is NOT consumed. The callback ties the claim to user.id, which is
      // also our audit trail (used_by column).
      const codeToUse = inviteCode.trim().toUpperCase()
      if (!codeToUse) { setError('El código de invitación es obligatorio.'); setLoading(false); return }

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
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Forward the invite code to the callback so it can be claimed
          // atomically there (when we have user.id available).
          emailRedirectTo: `${window.location.origin}/auth/callback?invite=${encodeURIComponent(codeToUse)}`,
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

      setInviteValidated(true)
      setView('verify-email')
      return
    }

    const { data, error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
    if (loginErr) {
      if (loginErr.message === 'Invalid login credentials') {
        setError('Email o contraseña incorrectos. Si aún no tienes cuenta, necesitas un código de invitación para registrarte.')
      } else {
        setError(err(loginErr.message))
      }
      setLoading(false)
      return
    }
    const redirect = await getPostAuthRedirect(supabase, data.user.id)
    router.push(redirect)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-4 pointer-events-none">
        <div className="relative w-full sm:max-w-[400px] bg-background rounded-2xl border border-border shadow-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 pointer-events-auto">
        <VisuallyHidden><DialogTitle>Iniciar sesión</DialogTitle></VisuallyHidden>

        {/* Logo — siempre visible */}
        <div className="text-center mb-4">
          <Image
            src="/assets/aliis-original.png"
            alt="Aliis"
            width={96}
            height={36}
            className="object-contain mx-auto mb-4 logo-hide-dark"
          />
          <Image
            src="/assets/aliis-black.png"
            alt="Aliis"
            width={96}
            height={36}
            className="object-contain mx-auto mb-4 logo-show-dark"
          />
        </div>

        {/* Contenido animado por view */}
        <AnimatePresence mode="wait" initial={false}>

          {/* Verify email / check-reset */}
          {(view === 'verify-email' || view === 'check-reset') && (
            <motion.div key={view} {...SLIDE} className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={28} strokeWidth={1.5} />
                </div>
              </div>
              <p className="font-serif italic text-[17px] text-muted-foreground mb-4">
                {title[view]}
              </p>
              <p className="font-sans text-[15px] text-foreground leading-relaxed mb-2">
                {view === 'verify-email'
                  ? <span>Te mandamos un enlace de verificación a <strong>{email}</strong>.</span>
                  : <span>Te mandamos las instrucciones a <strong>{email}</strong>.</span>}
              </p>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-7">
                {view === 'verify-email'
                  ? 'Haz clic en el enlace del correo para activar tu cuenta.'
                  : 'Revisa tu bandeja de entrada y sigue las instrucciones.'}
              </p>
              <Button
                onClick={onClose}
                className="px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[var(--c-btn-primary-shadow)]"
              >
                Entendido
              </Button>
            </motion.div>
          )}

          {/* Login */}
          {view === 'login' && (
            <motion.div key="login" {...SLIDE}>
              <p className="font-serif italic text-[17px] text-muted-foreground text-center mb-6">
                {title.login}
              </p>
              <button
                type="button"
                onClick={() => handleGoogleSignIn(false)}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border-[1.5px] border-border bg-white text-black font-sans text-[15px] font-medium shadow-sm hover:shadow-md transition-shadow duration-150 disabled:opacity-70 disabled:cursor-not-allowed mb-5"
              >
                <GoogleIcon />
                {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
              </button>
              <Divider />
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputCls} />
                <button type="button" onClick={() => goTo('forgot')} className={linkCls + ' self-end'}>
                  ¿Olvidaste tu contraseña?
                </button>
                {error && (
                  <div className="flex flex-col gap-1">
                    <p className="text-destructive font-sans text-[13px] m-0">{error}</p>
                    {error.includes('código de invitación') && (
                      <button type="button" onClick={() => goTo('signup')} className={linkCls + ' self-start'}>
                        Crear cuenta con código →
                      </button>
                    )}
                  </div>
                )}
                <Button type="submit" disabled={loading} className={submitCls}>
                  {loading ? 'Cargando…' : 'Iniciar sesión'}
                </Button>
              </form>
              <Footer>
                <button onClick={() => goTo('signup')} className={linkCls}>¿No tienes cuenta? Regístrate</button>
                <Tagline />
              </Footer>
            </motion.div>
          )}

          {/* Signup */}
          {view === 'signup' && (
            <motion.div key="signup" {...SLIDE}>
              <p className="font-serif italic text-[17px] text-muted-foreground text-center mb-6">
                {title.signup}
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Invite code first — gates Google button */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Código de invitación (ALIIS-BETA-XXXX)"
                    value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(null) }}
                    required
                    className={inputCls + ' font-mono tracking-widest pr-8'}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {inviteCode.trim().length >= 6 && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-mono font-medium ${inviteChecking ? 'text-muted-foreground/50' : inviteValidated ? 'text-emerald-500' : 'text-destructive'}`}>
                      {inviteChecking ? '…' : inviteValidated ? '✓' : '✗'}
                    </span>
                  )}
                </div>

                {inviteError && inviteCode.trim().length >= 6 && !inviteChecking && (
                  <p className="font-sans text-[12px] text-destructive -mt-1">{inviteError}</p>
                )}

                {/* Google — only active when invite is valid */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(true)}
                  disabled={!inviteValidated || googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border-[1.5px] border-border bg-white text-black font-sans text-[15px] font-medium shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <GoogleIcon />
                  {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
                </button>
                <Divider />

                <div className="flex gap-2.5">
                  <Input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
                  <Input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputCls} />
                </div>
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputCls} />
                <Input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={inputCls} />
                <div className="flex flex-col gap-1.5 mt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
                    />
                    <span className="font-sans text-[11px] text-muted-foreground/80 leading-none">
                      Acepto los{' '}
                      <a href="/terminos" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                        términos
                      </a>
                      {' '}y la{' '}
                      <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                        política de privacidad
                      </a>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptedMedicalData}
                      onChange={(e) => setAcceptedMedicalData(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
                    />
                    <span className="font-sans text-[11px] text-muted-foreground/80 leading-none">
                      Acepto el{' '}
                      <a href="/privacidad#datos-medicos" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                        tratamiento de mis datos de salud
                      </a>
                      {' '}(Art. 9 GDPR · LFPDPPP)
                    </span>
                  </label>
                </div>
                {error && <p className="text-destructive font-sans text-[13px] m-0">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading || !inviteValidated || !firstName.trim() || !lastName.trim() || !email.trim() || password.length < 6 || !confirmPassword || !acceptedTerms || !acceptedMedicalData}
                  className={submitCls}
                >
                  {loading ? 'Verificando…' : 'Crear cuenta'}
                </Button>
              </form>
              <Footer>
                <button onClick={() => goTo('login')} className={linkCls}>¿Ya tienes cuenta? Inicia sesión</button>
                <Tagline />
              </Footer>
            </motion.div>
          )}

          {/* Forgot password */}
          {view === 'forgot' && (
            <motion.div key="forgot" {...SLIDE}>
              <p className="font-serif italic text-[17px] text-muted-foreground text-center mb-6">
                {title.forgot}
              </p>
              <p className="font-sans text-sm text-muted-foreground text-center mb-5 leading-relaxed">
                Escribe tu email y te mandamos un enlace para restablecer tu contraseña.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                {error && <p className="text-destructive font-sans text-[13px] m-0">{error}</p>}
                <Button type="submit" disabled={loading} className={submitCls}>
                  {loading ? 'Enviando…' : 'Enviar instrucciones'}
                </Button>
              </form>
              <Footer>
                <button onClick={() => goTo('login')} className={linkCls}>← Volver al inicio de sesión</button>
              </Footer>
            </motion.div>
          )}

        </AnimatePresence>
        </div>
        </div>
      </DialogPortal>
    </Dialog>
  )
}

/* ─── helpers ─── */

const inputCls = 'h-11 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[14px]'
const submitCls = 'h-11 rounded-xl mt-1 bg-secondary text-secondary-foreground font-sans font-medium text-[15px] hover:bg-secondary/90 shadow-[var(--c-btn-primary-shadow)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-secondary transition-opacity duration-150'
const linkCls   = 'font-sans text-[13px] text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer transition-colors'

function Divider() {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 h-px bg-border" />
      <span className="font-sans text-xs text-muted-foreground/60">o continúa con email</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex flex-col items-center gap-2.5">{children}</div>
}

function Tagline() {
  return (
    <p className="m-0 font-serif italic text-xs text-muted-foreground/50">
      Aliis no comparte tus datos. Nunca.
    </p>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}
