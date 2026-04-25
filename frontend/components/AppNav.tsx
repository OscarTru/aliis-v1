'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoginModal } from './LoginModal'
import { createClient } from '@/lib/supabase'

export function AppNav() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [initial, setInitial] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setInitial(user.email[0].toUpperCase())
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setInitial(session?.user?.email?.[0]?.toUpperCase() ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        background: 'color-mix(in srgb, var(--c-bg) 78%, transparent)',
        borderBottom: '1px solid var(--c-border)',
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', gap: 24 }}>
          <Link href={initial ? '/historial' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <Image src="/assets/aliis-logo.png" alt="Aliis" width={30} height={30} style={{ objectFit: 'contain' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '-.02em', color: 'var(--c-text)' }}>Aliis</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!initial && (
              <Link href="/precios" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', textDecoration: 'none' }}>
                Precios
              </Link>
            )}
            {initial ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/ingreso" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', textDecoration: 'none' }}>
                  Nuevo pack
                </Link>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: 'var(--c-brand-teal-light)', color: 'var(--c-brand-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontSize: 14, border: 'none', cursor: 'pointer',
                  }}
                >
                  {initial}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--c-border)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', cursor: 'pointer' }}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
