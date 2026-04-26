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
        <div className="max-w-[72rem] mx-auto flex items-center justify-between px-6 py-3.5 gap-6">
          <Link href={initial ? '/historial' : '/'} className="flex items-center no-underline">
            <Image src="/assets/aliis-black.png" alt="Aliis" width={80} height={32} className="object-contain" />
          </Link>

          <div className="flex items-center gap-4">

            {/* Links de sección — solo en la landing */}
            {isLanding && (
              <nav className="flex items-center gap-6">
                {[
                  { label: 'Qué hace', id: 'que-hace' },
                  { label: 'Cómo funciona', id: 'como-funciona' },
                  { label: 'Ejemplo real', id: 'ejemplo' },
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
              </nav>
            )}

            {/* Lado derecho — autenticado o no */}
            {initial ? (
              <div className="flex items-center gap-3">
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
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 rounded-full border border-border bg-transparent font-sans text-sm text-foreground cursor-pointer hover:bg-muted transition-colors"
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
