'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { createClient } from '@/lib/supabase'

export function AppNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isLanding = pathname === '/'
  const [showLogin, setShowLogin] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [initial, setInitial] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'no-invite') {
      setLoginError('No encontramos una cuenta con ese email. Para registrarte necesitas un código de invitación.')
      setShowLogin(true)
      router.replace('/', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setInitial(user.email[0].toUpperCase())
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { setInitial(null); return }
      if (session?.user?.email) setInitial(session.user.email[0].toUpperCase())
    })
    return () => subscription.unsubscribe()
  }, [])

  const NAV_LINKS = [
    { label: 'Qué es', id: 'que-hace' },
    { label: 'Cómo funciona', id: 'como-funciona' },
    { label: 'Demo', id: 'ejemplo' },
  ]

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-border bg-background/80">
        <div className="max-w-[72rem] mx-auto flex items-center justify-between px-4 md:px-6 py-3.5">
          {/* Logo */}
          <Link href={initial ? '/historial' : '/'} className="flex items-center no-underline">
            <Image src="/assets/aliis-original.png" alt="Aliis" width={80} height={32} className="object-contain logo-hide-dark" />
            <Image src="/assets/aliis-black.png" alt="Aliis" width={80} height={32} className="object-contain logo-show-dark" />
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="font-sans text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0 transition-colors"
                >
                  {label}
                </button>
              ))}
              <Link href="/precios" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">Precios</Link>
              <a href="mailto:hola@aliis.app" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">Contacto</a>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            {initial ? (
              <>
                {!isLanding && (
                  <Link href="/ingreso" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">
                    Nuevo pack
                  </Link>
                )}
                {isLanding && (
                  <Link href="/historial" className="hidden md:block font-sans text-sm text-muted-foreground hover:text-foreground no-underline">
                    Mi expediente
                  </Link>
                )}
                <Link href="/historial" className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif text-sm font-semibold no-underline">
                  {initial}
                </Link>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 md:px-5 py-2 rounded-full bg-foreground text-background font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity shadow-[0_0_0_1px_rgba(31,138,155,.3),0_4px_16px_rgba(31,138,155,.15)]"
              >
                Iniciar sesión
              </button>
            )}

            {/* Hamburger — only on mobile, only on landing */}
            {isLanding && (
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-foreground bg-transparent border-none cursor-pointer"
                aria-label="Menú"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isLanding && menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full text-left font-sans text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2.5 transition-colors"
              >
                {label}
              </button>
            ))}
            <Link href="/precios" onClick={() => setMenuOpen(false)} className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline py-2.5">
              Precios
            </Link>
            <a href="mailto:hola@aliis.app" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline py-2.5">
              Contacto
            </a>
          </div>
        )}
      </header>
      {showLogin && <LoginModal onClose={() => { setShowLogin(false); setLoginError(null) }} initialError={loginError ?? undefined} />}
    </>
  )
}
