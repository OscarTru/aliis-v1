'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getPostAuthRedirect } from '@/lib/auth-redirect'
import Image from 'next/image'

type View = 'login' | 'signup' | 'forgot' | 'verify-email' | 'check-reset'

export function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

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
      const { error: signUpErr } = await supabase.auth.signUp({ email, password })
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

  function inputStyle(field: string): React.CSSProperties {
    const focused = focusedField === field
    return {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: `1.5px solid ${focused ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
      background: focused ? 'rgba(31,138,155,0.04)' : 'var(--c-surface)',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      color: 'var(--c-text)',
      outline: 'none',
      transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
      boxShadow: focused ? '0 0 0 3px rgba(31,138,155,0.12)' : 'none',
    }
  }

  const title = {
    login: 'Bienvenido de vuelta',
    signup: 'Crea tu cuenta',
    forgot: '¿Olvidaste tu contraseña?',
    'verify-email': 'Revisa tu correo',
    'check-reset': 'Revisa tu correo',
  }[view]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'var(--c-bg)',
          border: '1px solid var(--c-border)',
          borderRadius: 24,
          padding: '48px 40px 40px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 32px 80px rgba(0,0,0,0.14)',
          animation: 'ce-fade-in 0.2s ease forwards',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 999,
            border: '1px solid var(--c-border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--c-text-muted)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/assets/aliis-original.png"
            alt="Aliis"
            width={72}
            height={28}
            style={{ objectFit: 'contain', marginBottom: 16 }}
          />
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--c-text-muted)' }}>
            {title}
          </div>
        </div>

        {/* Verify email */}
        {(view === 'verify-email' || view === 'check-reset') && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999,
                background: 'rgba(31,138,155,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--c-brand-teal)',
              }}>
                <Mail size={28} strokeWidth={1.5} />
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', lineHeight: 1.6, marginBottom: 8 }}>
              {view === 'verify-email'
                ? <>Te mandamos un enlace de verificación a <strong>{email}</strong>.</>
                : <>Te mandamos las instrucciones a <strong>{email}</strong>.</>}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              {view === 'verify-email'
                ? 'Haz clic en el enlace del correo para activar tu cuenta.'
                : 'Revisa tu bandeja de entrada y sigue las instrucciones.'}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '13px 32px', borderRadius: 12, border: 'none',
                background: '#0F1923', color: '#fff',
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                boxShadow: 'var(--c-btn-primary-shadow)',
              }}
            >
              Entendido
            </button>
          </div>
        )}

        {/* Main form */}
        {(view === 'login' || view === 'signup' || view === 'forgot') && (
          <>
            {/* Google — only on login/signup */}
            {view !== 'forgot' && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '13px 20px', borderRadius: 12,
                    border: '1.5px solid var(--c-border-strong)',
                    background: '#fff',
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                    color: '#18181b', cursor: googleLoading ? 'not-allowed' : 'pointer',
                    opacity: googleLoading ? 0.7 : 1,
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)')}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {googleLoading ? 'Redirigiendo…' : 'Continuar con Google'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--c-text-faint)' }}>o continúa con email</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle('email')}
                />
              </div>

              {view !== 'forgot' && (
                <div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    minLength={6}
                    style={inputStyle('password')}
                  />
                </div>
              )}

              {view === 'login' && (
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(null) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontSize: 13,
                    color: 'var(--c-text-muted)', textAlign: 'right', padding: 0,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              {error && (
                <p style={{ color: '#dc2626', fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 20px', borderRadius: 12, border: 'none',
                  background: '#0F1923', color: '#fff',
                  fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: 4,
                  boxShadow: 'var(--c-btn-primary-shadow)',
                  transition: 'opacity 0.15s ease',
                }}
              >
                {loading ? 'Cargando…' : {
                  login: 'Iniciar sesión',
                  signup: 'Crear cuenta',
                  forgot: 'Enviar instrucciones',
                }[view]}
              </button>
            </form>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {view === 'forgot' ? (
                <button
                  onClick={() => { setView('login'); setError(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}
                >
                  ← Volver al inicio de sesión
                </button>
              ) : (
                <button
                  onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}
                >
                  {view === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
              )}

              <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--c-text-faint)' }}>
                Aliis no comparte tus datos. Nunca.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
