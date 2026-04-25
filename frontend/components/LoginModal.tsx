'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getPostAuthRedirect } from '@/lib/auth-redirect'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type View = 'login' | 'signup' | 'forgot' | 'verify-email' | 'check-reset'

export function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: fullName } },
      })
      setLoading(false)
      if (signUpErr) { setError(err(signUpErr.message)); return }
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
      <DialogContent className="max-w-[400px] rounded-3xl p-10 border border-border bg-background shadow-2xl">
        <VisuallyHidden><DialogTitle>Iniciar sesión</DialogTitle></VisuallyHidden>
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/assets/aliis-original.png"
            alt="Aliis"
            width={72}
            height={28}
            className="object-contain mx-auto mb-4"
          />
          <p className="font-serif italic text-[17px] text-muted-foreground m-0">{title[view]}</p>
        </div>

        {/* Verify email / check reset */}
        {(view === 'verify-email' || view === 'check-reset') && (
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail size={28} strokeWidth={1.5} />
              </div>
            </div>
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
          </div>
        )}

        {/* Main form */}
        {(view === 'login' || view === 'signup' || view === 'forgot') && (
          <>
            {view !== 'forgot' && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border-[1.5px] border-border bg-white text-foreground font-sans text-[15px] font-medium shadow-sm hover:shadow-md transition-shadow duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
                </button>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-sans text-xs text-muted-foreground/60">o continúa con email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {view === 'signup' && (
                <div className="flex gap-2.5">
                  <Input
                    type="text"
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
                  />
                  <Input
                    type="text"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
                  />
                </div>
              )}

              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
              />

              {view !== 'forgot' && (
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
                />
              )}

              {view === 'signup' && (
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
                />
              )}

              {view === 'login' && (
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(null) }}
                  className="self-end font-sans text-[13px] text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              {error && (
                <p className="text-destructive font-sans text-[13px] m-0">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl mt-1 bg-secondary text-secondary-foreground font-sans font-medium text-[15px] hover:bg-secondary/90 shadow-[var(--c-btn-primary-shadow)] disabled:opacity-70"
              >
                {loading ? 'Cargando…' : (
                  { login: 'Iniciar sesión', signup: 'Crear cuenta', forgot: 'Enviar instrucciones' }[view]
                )}
              </Button>
            </form>

            <div className="mt-5 flex flex-col items-center gap-2.5">
              {view === 'forgot' ? (
                <button
                  onClick={() => { setView('login'); setError(null) }}
                  className="font-sans text-[13px] text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer transition-colors"
                >
                  ← Volver al inicio de sesión
                </button>
              ) : (
                <button
                  onClick={() => {
                    setView(view === 'login' ? 'signup' : 'login')
                    setError(null)
                    setPassword('')
                    setConfirmPassword('')
                    setFirstName('')
                    setLastName('')
                  }}
                  className="font-sans text-[13px] text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer transition-colors"
                >
                  {view === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
              )}
              <p className="m-0 font-serif italic text-xs text-muted-foreground/50">
                Aliis no comparte tus datos. Nunca.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
