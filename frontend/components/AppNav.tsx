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
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-border bg-background/80">
        <div className="max-w-[72rem] mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3.5">
          {/* Logo — izquierda */}
          <Link href={initial ? '/historial' : '/'} className="flex items-center no-underline">
            <Image src="/assets/aliis-black.png" alt="Aliis" width={80} height={32} className="object-contain" />
          </Link>

          {/* Nav — centro */}
          {isLanding && (
            <nav className="flex items-center gap-6">
              {[
                { label: 'Qué es', id: 'que-hace' },
                { label: 'Cómo funciona', id: 'como-funciona' },
                { label: 'Demo', id: 'ejemplo' },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="font-sans text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0 transition-colors"
                >
                  {label}
                </button>
              ))}
              <Link href="/precios" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">Precios</Link>
              <a href="mailto:hola@aliis.app" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">Contacto</a>
            </nav>
          )}
          {!isLanding && <div />}

          {/* Derecha */}
          <div className="flex items-center gap-3 justify-end">
            {initial ? (
              <>
                {!isLanding && (
                  <Link href="/ingreso" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">
                    Nuevo pack
                  </Link>
                )}
                {isLanding && (
                  <Link href="/historial" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">
                    Mis explicaciones
                  </Link>
                )}
                <Link href="/historial" className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif text-sm font-semibold no-underline">
                  {initial}
                </Link>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-5 py-2 rounded-full bg-foreground text-background font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity shadow-[0_0_0_1px_rgba(31,138,155,.3),0_4px_16px_rgba(31,138,155,.15)]"
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
