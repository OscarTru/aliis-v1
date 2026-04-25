'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { createClient } from '@/lib/supabase'

type Profile = {
  name: string | null
  who: 'yo' | 'familiar' | null
  plan: 'free' | 'pro'
  email: string | null
}

type FocusedField = 'name' | 'email' | 'password' | 'confirm' | null

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    border: `1.5px solid ${focused ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
    background: focused ? 'rgba(31,138,155,0.04)' : 'var(--c-surface)',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--c-text)',
    outline: 'none',
    transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
    boxShadow: focused ? '0 0 0 3px rgba(31,138,155,0.12)' : 'none',
    boxSizing: 'border-box',
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: 'var(--c-text-faint)',
        marginBottom: 16,
      }}>
        {title}
      </div>
      <div style={{
        background: 'var(--c-bg)',
        border: '1px solid var(--c-border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 24,
      padding: '20px 24px',
      borderBottom: '1px solid var(--c-border)',
    }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', paddingTop: 2, flexShrink: 0, minWidth: 120 }}>
        {label}
      </div>
      <div style={{ flex: 1, maxWidth: 360 }}>{children}</div>
    </div>
  )
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        marginTop: 10,
        padding: '10px 20px',
        borderRadius: 10,
        border: 'none',
        background: '#0F1923',
        color: '#fff',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        boxShadow: 'var(--c-btn-primary-shadow)',
        transition: 'opacity 0.15s ease',
      }}
    >
      {loading ? 'Guardando…' : 'Guardar'}
    </button>
  )
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      padding: '12px 20px',
      borderRadius: 12,
      background: ok ? '#0F1923' : '#dc2626',
      color: '#fff',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      animation: 'ce-fade-in 0.2s ease forwards',
      zIndex: 200,
    }}>
      {msg}
    </div>
  )
}

export default function CuentaPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  // Name
  const [name, setName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)

  // Who
  const [who, setWho] = useState<'yo' | 'familiar' | null>(null)
  const [whoLoading, setWhoLoading] = useState(false)

  // Email
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Password
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // Focus
  const [focused, setFocused] = useState<FocusedField>(null)

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUserId(user.id)
      setNewEmail(user.email ?? '')

      const providers = user.identities?.map(i => i.provider) ?? []
      setIsGoogleUser(providers.includes('google') && !providers.includes('email'))

      const { data: p } = await supabase.from('profiles').select('name,who,plan').eq('id', user.id).single()
      setProfile({ name: p?.name ?? null, who: p?.who ?? null, plan: p?.plan ?? 'free', email: user.email ?? null })
      setName(p?.name ?? '')
      setWho(p?.who ?? null)
    }
    load()
  }, [router])

  async function saveName() {
    if (!userId) return
    setNameLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ name: name.trim() || null }).eq('id', userId)
    setNameLoading(false)
    showToast(error ? 'Error al guardar.' : 'Nombre actualizado.', !error)
  }

  async function saveWho(value: 'yo' | 'familiar') {
    if (!userId) return
    setWho(value)
    setWhoLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ who: value }).eq('id', userId)
    setWhoLoading(false)
    showToast(error ? 'Error al guardar.' : 'Preferencia actualizada.', !error)
  }

  async function saveEmail() {
    if (!newEmail.trim()) return
    setEmailLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setEmailLoading(false)
    showToast(error ? error.message : 'Te mandamos un enlace de confirmación.', !error)
  }

  async function savePassword() {
    if (password !== confirmPw) { showToast('Las contraseñas no coinciden.', false); return }
    if (password.length < 6) { showToast('Mínimo 6 caracteres.', false); return }
    setPwLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setPwLoading(false)
    if (!error) { setPassword(''); setConfirmPw('') }
    showToast(error ? error.message : 'Contraseña actualizada.', !error)
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (!res.ok) {
      const { error } = await res.json()
      setDeleteLoading(false)
      setShowDeleteDialog(false)
      showToast(error ?? 'Error al eliminar la cuenta.', false)
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!profile) return null

  return (
    <AppShell>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginBottom: 6 }}>
            Mi cuenta
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
            {profile.email}
            {profile.plan === 'pro' && (
              <span style={{
                marginLeft: 10,
                padding: '2px 10px',
                borderRadius: 999,
                background: 'rgba(31,138,155,0.12)',
                color: 'var(--c-brand-teal)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}>
                Pro
              </span>
            )}
          </div>
        </div>

        {/* Perfil */}
        <Section title="Perfil">
          <Row label="Nombre">
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              style={inputStyle(focused === 'name')}
            />
            <SaveButton loading={nameLoading} onClick={saveName} />
          </Row>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-border)' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 12 }}>
              Aliis es para
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['yo', 'familiar'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => saveWho(option)}
                  disabled={whoLoading}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 10,
                    border: `1.5px solid ${who === option ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
                    background: who === option ? 'rgba(31,138,155,0.08)' : 'transparent',
                    color: who === option ? 'var(--c-brand-teal)' : 'var(--c-text-muted)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {option === 'yo' ? 'Para mí' : 'Para un familiar'}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Acceso — solo si no es Google */}
        {!isGoogleUser && (
          <Section title="Acceso">
            <Row label="Email">
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={inputStyle(focused === 'email')}
              />
              <SaveButton loading={emailLoading} onClick={saveEmail} />
            </Row>
            <Row label="Contraseña">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'password')}
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'confirm')}
                />
              </div>
              <SaveButton loading={pwLoading} onClick={savePassword} />
            </Row>
          </Section>
        )}

        {isGoogleUser && (
          <Section title="Acceso">
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
                  Cuenta vinculada con Google. El acceso se gestiona desde ahí.
                </span>
              </div>
            </div>
          </Section>
        )}

        {/* Plan */}
        <Section title="Plan">
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', marginBottom: 4 }}>
                {profile.plan === 'pro' ? 'Plan Pro' : 'Plan Gratuito'}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>
                {profile.plan === 'pro' ? 'Explicaciones ilimitadas, acceso completo.' : 'Explicaciones limitadas.'}
              </div>
            </div>
            {profile.plan === 'free' && (
              <a
                href="/precios"
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#0F1923',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  boxShadow: 'var(--c-btn-primary-shadow)',
                  whiteSpace: 'nowrap',
                }}
              >
                Actualizar
              </a>
            )}
          </div>
        </Section>

        {/* Zona peligrosa */}
        <Section title="Zona peligrosa">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', marginBottom: 3 }}>Cerrar sesión</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>Salir de tu cuenta en este dispositivo.</div>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/')
              }}
              style={{
                padding: '9px 18px', borderRadius: 10,
                border: '1px solid var(--c-border)',
                background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 14,
                color: 'var(--c-text-muted)', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Cerrar sesión
            </button>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#dc2626', marginBottom: 3 }}>Eliminar cuenta</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>Borra tu cuenta y toda tu información permanentemente.</div>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              style={{
                padding: '9px 18px', borderRadius: 10,
                border: '1px solid rgba(220,38,38,0.3)',
                background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 14,
                color: '#dc2626', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Eliminar
            </button>
          </div>
        </Section>

      </div>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <ConfirmDialog
        open={showDeleteDialog}
        variant="danger"
        title="Eliminar cuenta"
        description="Esta acción borrará tu cuenta y todas tus explicaciones permanentemente. No se puede deshacer."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        loading={deleteLoading}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </AppShell>
  )
}
