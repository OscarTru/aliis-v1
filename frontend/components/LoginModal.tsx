'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase'
import { getPostAuthRedirect } from '@/lib/auth-redirect'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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

export function LoginModal({ onClose, initialView }: { onClose: () => void; initialView?: View }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<View>(initialView ?? 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteValidated, setInviteValidated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Pre-fill invite code from URL ?invite=
  useEffect(() => {
    const code = searchParams?.get('invite')
    if (code) {
      setInviteCode(code.toUpperCase())
      setView('signup')
    }
  }, [searchParams])

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

      // Validate invite code server-side
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
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: fullName } },
      })
      setLoading(false)
      if (signUpErr) { setError(err(signUpErr.message)); return }

      // Mark code as used (best-effort, non-blocking — user is now created)
      fetch('/api/invite/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse }),
      }).catch(() => {})

      setInviteValidated(true)
      setView('verify-email')
      return
    }

    const { data, error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
    if (loginErr) { setError(err(loginErr.message)); setLoading(false); return }
    const redirect = await getPostAuthRedirect(supabase, data.user.id)
    router.push(redirect)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-[400px] rounded-3xl p-10 border border-border bg-background shadow-2xl overflow-hidden">
        <VisuallyHidden><DialogTitle>Iniciar sesión</DialogTitle></VisuallyHidden>

        {/* Logo — siempre visible */}
        <div className="text-center mb-6">
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
              <Divider />
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputCls} />
                <button type="button" onClick={() => goTo('forgot')} className={linkCls + ' self-end'}>
                  ¿Olvidaste tu contraseña?
                </button>
                {error && <p className="text-destructive font-sans text-[13px] m-0">{error}</p>}
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
                <div className="flex gap-2.5">
                  <Input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
                  <Input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputCls} />
                </div>
                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputCls} />
                <Input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={inputCls} />
                <Input
                  type="text"
                  placeholder="Código de invitación (ALIIS-BETA-XXXX)"
                  value={inviteCode}
                  onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(null) }}
                  required
                  className={inputCls + ' font-mono tracking-widest'}
                  spellCheck={false}
                  autoComplete="off"
                />
                {error && <p className="text-destructive font-sans text-[13px] m-0">{error}</p>}
                <Button type="submit" disabled={loading} className={submitCls}>
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
      </DialogContent>
    </Dialog>
  )
}

/* ─── helpers ─── */

const inputCls = 'h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]'
const submitCls = 'h-12 rounded-xl mt-1 bg-secondary text-secondary-foreground font-sans font-medium text-[15px] hover:bg-secondary/90 shadow-[var(--c-btn-primary-shadow)] disabled:opacity-70'
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
