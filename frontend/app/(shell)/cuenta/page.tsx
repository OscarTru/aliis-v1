'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Profile = {
  name: string | null
  last_name: string | null
  birth_date: string | null
  location: string | null
  who: 'yo' | 'familiar' | null
  plan: 'free' | 'pro'
  email: string | null
  trial_end: string | null
  subscription_status: string | null
  stripe_customer_id: string | null
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
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
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
      className="mt-2.5 px-5 py-2.5 rounded-[10px] border-none bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 shadow-[var(--c-btn-primary-shadow)] transition-opacity duration-150"
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
  const [nameEditing, setNameEditing] = useState(false)
  const [nameLoading, setNameLoading] = useState(false)

  // Extra profile fields
  const [lastName, setLastName] = useState('')
  const [lastNameEditing, setLastNameEditing] = useState(false)
  const [lastNameLoading, setLastNameLoading] = useState(false)

  const [birthDate, setBirthDate] = useState('')
  const [birthDateEditing, setBirthDateEditing] = useState(false)
  const [birthDateLoading, setBirthDateLoading] = useState(false)

  const [location, setLocation] = useState('')
  const [locationEditing, setLocationEditing] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

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

  // Billing
  const [billingLoading, setBillingLoading] = useState(false)

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

      const { data: p } = await supabase.from('profiles').select('name,last_name,birth_date,location,who,plan,trial_end,subscription_status,stripe_customer_id').eq('id', user.id).single()
      setProfile({
        name: p?.name ?? null,
        last_name: p?.last_name ?? null,
        birth_date: p?.birth_date ?? null,
        location: p?.location ?? null,
        who: p?.who ?? null,
        plan: p?.plan ?? 'free',
        email: user.email ?? null,
        trial_end: p?.trial_end ?? null,
        subscription_status: p?.subscription_status ?? null,
        stripe_customer_id: p?.stripe_customer_id ?? null,
      })
      const savedName = p?.name ?? ''
      const googleName = user.user_metadata?.full_name ?? ''
      setName(savedName || googleName)
      setLastName(p?.last_name ?? '')
      setBirthDate(p?.birth_date ?? '')
      setLocation(p?.location ?? '')
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
    if (!error) setNameEditing(false)
    showToast(error ? 'Error al guardar.' : 'Nombre actualizado.', !error)
  }

  async function saveLastName() {
    if (!userId) return
    setLastNameLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ last_name: lastName.trim() || null }).eq('id', userId)
    setLastNameLoading(false)
    if (!error) setLastNameEditing(false)
    showToast(error ? 'Error al guardar.' : 'Apellido actualizado.', !error)
  }

  async function saveBirthDate() {
    if (!userId) return
    setBirthDateLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ birth_date: birthDate || null }).eq('id', userId)
    setBirthDateLoading(false)
    if (!error) setBirthDateEditing(false)
    showToast(error ? 'Error al guardar.' : 'Fecha actualizada.', !error)
  }

  async function saveLocation() {
    if (!userId) return
    setLocationLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ location: location.trim() || null }).eq('id', userId)
    setLocationLoading(false)
    if (!error) setLocationEditing(false)
    showToast(error ? 'Error al guardar.' : 'Ubicación actualizada.', !error)
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

  async function handleUpgrade() {
    setBillingLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceKey: 'mxn-monthly' }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { showToast('Error al iniciar el pago.', false); setBillingLoading(false) }
  }

  async function handleManageBilling() {
    setBillingLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { showToast('Error al abrir el portal de facturación.', false); setBillingLoading(false) }
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
    <>
      <div className="max-w-[680px] mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20">

        <PageHeader
          eyebrow={profile.email ?? undefined}
          title={<>Mi <em>cuenta</em></>}
        />

        {/* Perfil */}
        <Section title="Perfil">
          <Row label="Nombre">
            {nameEditing ? (
              <>
                <Input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]"
                />
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={saveName}
                    disabled={nameLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border-none bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:opacity-70 shadow-[var(--c-btn-primary-shadow)]"
                  >
                    <Check size={14} />
                    {nameLoading ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => { setNameEditing(false); setName(profile.name ?? '') }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border bg-transparent font-sans text-sm text-muted-foreground cursor-pointer"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-[15px] text-foreground">
                  {name || <span className="text-muted-foreground">Sin nombre</span>}
                </span>
                <button
                  onClick={() => setNameEditing(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </Row>
          <Row label="Apellido">
            {lastNameEditing ? (
              <>
                <Input type="text" placeholder="Tu apellido" value={lastName} onChange={e => setLastName(e.target.value)} autoFocus className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]" />
                <div className="flex gap-2 mt-2.5">
                  <button onClick={saveLastName} disabled={lastNameLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border-none bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:opacity-70 shadow-[var(--c-btn-primary-shadow)]"><Check size={14} />{lastNameLoading ? 'Guardando…' : 'Guardar'}</button>
                  <button onClick={() => { setLastNameEditing(false); setLastName(profile.last_name ?? '') }} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border bg-transparent font-sans text-sm text-muted-foreground cursor-pointer"><X size={14} />Cancelar</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-[15px] text-foreground">{lastName || <span className="text-muted-foreground">Sin apellido</span>}</span>
                <button onClick={() => setLastNameEditing(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"><Pencil size={14} /></button>
              </div>
            )}
          </Row>
          <Row label="Fecha de nacimiento">
            {birthDateEditing ? (
              <>
                <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} autoFocus className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]" />
                <div className="flex gap-2 mt-2.5">
                  <button onClick={saveBirthDate} disabled={birthDateLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border-none bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:opacity-70 shadow-[var(--c-btn-primary-shadow)]"><Check size={14} />{birthDateLoading ? 'Guardando…' : 'Guardar'}</button>
                  <button onClick={() => { setBirthDateEditing(false); setBirthDate(profile.birth_date ?? '') }} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border bg-transparent font-sans text-sm text-muted-foreground cursor-pointer"><X size={14} />Cancelar</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-[15px] text-foreground">
                  {birthDate ? new Date(birthDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-muted-foreground">Sin fecha</span>}
                </span>
                <button onClick={() => setBirthDateEditing(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"><Pencil size={14} /></button>
              </div>
            )}
          </Row>
          <Row label="Lugar de residencia">
            {locationEditing ? (
              <>
                <Input type="text" placeholder="Ciudad, País" value={location} onChange={e => setLocation(e.target.value)} autoFocus className="h-12 rounded-xl border-[1.5px] focus-visible:ring-primary/20 focus-visible:ring-[3px] focus-visible:border-primary bg-muted font-sans text-[15px]" />
                <div className="flex gap-2 mt-2.5">
                  <button onClick={saveLocation} disabled={locationLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border-none bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:opacity-70 shadow-[var(--c-btn-primary-shadow)]"><Check size={14} />{locationLoading ? 'Guardando…' : 'Guardar'}</button>
                  <button onClick={() => { setLocationEditing(false); setLocation(profile.location ?? '') }} className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border bg-transparent font-sans text-sm text-muted-foreground cursor-pointer"><X size={14} />Cancelar</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-[15px] text-foreground">{location || <span className="text-muted-foreground">Sin ubicación</span>}</span>
                <button onClick={() => setLocationEditing(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"><Pencil size={14} /></button>
              </div>
            )}
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
                  aria-pressed={who === option}
                  className={cn(
                    'px-5 py-2 rounded-[10px] border-[1.5px] font-sans text-sm cursor-pointer transition-all duration-150',
                    who === option
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-transparent text-muted-foreground',
                  )}
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
              <span className="font-sans text-[15px] text-foreground">{newEmail}</span>
              <p className="font-sans text-[12px] text-muted-foreground/60 mt-1">
                Para cambiar tu email escríbenos a hola@aliis.app
              </p>
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
          <div className="px-6 py-5 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="font-sans text-[15px] text-foreground font-medium">
                {profile.plan === 'pro' ? 'Plan Pro' : 'Plan Gratuito'}
              </div>
              <div className="font-sans text-[13px] text-muted-foreground">
                {profile.plan === 'pro'
                  ? 'Explicaciones ilimitadas, acceso completo a la biblioteca.'
                  : 'Explicaciones limitadas. Actualiza para acceso completo.'}
              </div>
              {profile.plan === 'pro' && profile.trial_end && new Date(profile.trial_end) > new Date() && (
                <div className="font-sans text-[12px] text-amber-500 mt-0.5">
                  Prueba activa — termina el {new Date(profile.trial_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {profile.plan === 'pro' && profile.subscription_status === 'canceled' && (
                <div className="font-sans text-[12px] text-muted-foreground/60 mt-0.5">
                  Suscripción cancelada — acceso activo hasta fin del período.
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {profile.plan === 'free' || !profile.stripe_customer_id ? (
                <button
                  onClick={handleUpgrade}
                  disabled={billingLoading}
                  className="px-4 py-2.5 rounded-[10px] border-none bg-foreground text-background font-sans text-sm font-medium cursor-pointer disabled:opacity-70 shadow-[var(--c-btn-primary-shadow)] whitespace-nowrap"
                >
                  {billingLoading ? 'Cargando…' : 'Actualizar a Pro'}
                </button>
              ) : (
                <button
                  onClick={handleManageBilling}
                  disabled={billingLoading}
                  className="px-4 py-2.5 rounded-[10px] border border-border bg-transparent font-sans text-sm text-foreground cursor-pointer disabled:opacity-70 whitespace-nowrap hover:bg-muted transition-colors"
                >
                  {billingLoading ? 'Cargando…' : 'Gestionar suscripción'}
                </button>
              )}
            </div>
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
    </>
  )
}
