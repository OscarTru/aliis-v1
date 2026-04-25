'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LoginModal } from './LoginModal'
import { createClient } from '@/lib/supabase'

export function AppNav() {
  const router = useRouter()
  const pathname = usePathname()
  const isLanding = pathname === '/'
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
          <Link href={initial ? '/historial' : '/'} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/assets/aliis-original.png" alt="Aliis" width={80} height={32} style={{ objectFit: 'contain' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Links de sección — solo en la landing */}
            {isLanding && (
              <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {[
                  { label: 'Qué hace', id: 'que-hace' },
                  { label: 'Cómo funciona', id: 'como-funciona' },
                  { label: 'Ejemplo real', id: 'ejemplo' },
                ].map(({ label, id }) => (
                  <button
                    key={id}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {label}
                  </button>
                ))}
                <Link href="/precios" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', textDecoration: 'none' }}>Precios</Link>
              </nav>
            )}

            {/* Lado derecho — autenticado o no */}
            {initial ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {!isLanding && (
                  <Link href="/ingreso" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', textDecoration: 'none' }}>
                    Nuevo pack
                  </Link>
                )}
                {isLanding && (
                  <Link href="/historial" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', textDecoration: 'none' }}>
                    Mis explicaciones
                  </Link>
                )}
                <Link href="/historial" style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: 'var(--c-brand-teal)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {initial}
                </Link>
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
