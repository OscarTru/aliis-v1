'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase'

type Profile = {
  name: string | null
  who: 'yo' | 'familiar' | null
  plan: 'free' | 'pro'
  email: string | null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-4">
        {title}
      </div>
      <div className="bg-background border border-border rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 px-6 py-5 border-b border-border">
      <div className="font-sans text-sm text-muted-foreground pt-0.5 shrink-0 min-w-[120px]">
        {label}
      </div>
      <div className="flex-1 max-w-[360px]">{children}</div>
    </div>
  )
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-2.5 px-5 py-2.5 rounded-[10px] border-none bg-[#0F1923] text-white font-sans text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 shadow-[var(--c-btn-primary-shadow)] transition-opacity duration-150"
    >
      {loading ? 'Guardando…' : 'Guardar'}
    </button>
  )
}

export default function CuentaPage() {
  const router = useRouter()
  const { toast } = useToast()
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

  // Dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function showToast(msg: string, ok = true) {
    toast({
      title: msg,
      duration: 3000,
      variant: ok ? 'default' : 'destructive',
    })
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
      <div className="max-w-[640px] mx-auto px-6 pt-12 pb-20">

        {/* Header */}
        <div className="mb-10">
          <div className="font-serif text-[28px] tracking-[-0.02em] mb-1.5">
            Mi cuenta
          </div>
          <div className="font-sans text-sm text-muted-foreground">
            {profile.email}
            {profile.plan === 'pro' && (
              <span className="ml-2.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] tracking-[.1em] uppercase">
                Pro
              </span>
            )}
          </div>
        </div>

        {/* Perfil */}
        <Section title="Perfil">
          <Row label="Nombre">
            <Input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
            />
            <SaveButton loading={nameLoading} onClick={saveName} />
          </Row>
          <div className="px-6 py-5 border-b border-border">
            <div className="font-sans text-sm text-muted-foreground mb-3">
              Aliis es para
            </div>
            <div className="flex gap-2.5">
              {(['yo', 'familiar'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => saveWho(option)}
                  disabled={whoLoading}
                  className={[
                    'px-5 py-2 rounded-[10px] border-[1.5px] font-sans text-sm cursor-pointer transition-all duration-150',
                    who === option
                      ? 'border-primary bg-primary/8 text-primary'
                      : 'border-border bg-transparent text-muted-foreground',
                  ].join(' ')}
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
              <Input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
              />
              <SaveButton loading={emailLoading} onClick={saveEmail} />
            </Row>
            <Row label="Contraseña">
              <div className="flex flex-col gap-2.5">
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
                />
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
                />
              </div>
              <SaveButton loading={pwLoading} onClick={savePassword} />
            </Row>
          </Section>
        )}

        {isGoogleUser && (
          <Section title="Acceso">
            <div className="px-6 py-5">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="font-sans text-sm text-muted-foreground">
                  Cuenta vinculada con Google. El acceso se gestiona desde ahí.
                </span>
              </div>
            </div>
          </Section>
        )}

        {/* Plan */}
        <Section title="Plan">
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <div className="font-sans text-[15px] text-foreground mb-1">
                {profile.plan === 'pro' ? 'Plan Pro' : 'Plan Gratuito'}
              </div>
              <div className="font-sans text-[13px] text-muted-foreground">
                {profile.plan === 'pro' ? 'Explicaciones ilimitadas, acceso completo.' : 'Explicaciones limitadas.'}
              </div>
            </div>
            {profile.plan === 'free' && (
              <a
                href="/precios"
                className="px-4 py-2.5 rounded-[10px] border-none bg-[#0F1923] text-white font-sans text-sm font-medium no-underline shadow-[var(--c-btn-primary-shadow)] whitespace-nowrap"
              >
                Actualizar
              </a>
            )}
          </div>
        </Section>

        {/* Zona peligrosa */}
        <Section title="Zona peligrosa">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-6">
            <div>
              <div className="font-sans text-sm text-foreground mb-0.5">Cerrar sesión</div>
              <div className="font-sans text-[13px] text-muted-foreground">Salir de tu cuenta en este dispositivo.</div>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="px-4 py-2.5 rounded-[10px] border border-border bg-transparent font-sans text-sm text-muted-foreground cursor-pointer whitespace-nowrap"
            >
              Cerrar sesión
            </button>
          </div>
          <div className="px-6 py-5 flex items-center justify-between gap-6">
            <div>
              <div className="font-sans text-sm text-destructive mb-0.5">Eliminar cuenta</div>
              <div className="font-sans text-[13px] text-muted-foreground">Borra tu cuenta y toda tu información permanentemente.</div>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2.5 rounded-[10px] border border-destructive/30 bg-transparent font-sans text-sm text-destructive cursor-pointer whitespace-nowrap"
            >
              Eliminar
            </button>
          </div>
        </Section>

      </div>

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
