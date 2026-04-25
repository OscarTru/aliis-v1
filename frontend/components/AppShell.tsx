'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, LayoutList, Zap, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { href: '/ingreso', label: 'Nuevo pack', icon: <Plus size={16} /> },
  { href: '/historial', label: 'Mis explicaciones', icon: <LayoutList size={16} /> },
  { href: '/cuenta', label: 'Mi cuenta', icon: <UserCircle size={16} /> },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [email, setEmail] = useState<string | null>(null)
  const [initial, setInitial] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? null)
      setInitial(user.email?.[0]?.toUpperCase() ?? null)

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      setPlan(profile?.plan ?? 'free')
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      setEmail(u?.email ?? null)
      setInitial(u?.email?.[0]?.toUpperCase() ?? null)
      if (!u) { setPlan(null); return }
      supabase
        .from('profiles')
        .select('plan')
        .eq('id', u.id)
        .single()
        .then(({ data }) => setPlan(data?.plan ?? 'free'))
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    ...NAV_ITEMS,
    ...(plan === 'free'
      ? [{ href: '/precios', label: 'Actualizar plan', icon: <Zap size={16} /> }]
      : []),
  ]

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid var(--c-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px 16px',
        background: 'var(--c-bg)',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <Link href="/historial" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '0 6px', marginBottom: 24 }}>
          <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} style={{ objectFit: 'contain' }} />
        </Link>

        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isUpgrade = item.href === '/precios'
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  background: isActive ? 'rgba(31,138,155,.1)' : 'transparent',
                  color: isActive
                    ? 'var(--c-brand-teal)'
                    : isUpgrade
                    ? 'var(--c-brand-teal)'
                    : 'var(--c-text-muted)',
                  transition: 'background .12s, color .12s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--c-surface)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                }}
              >
                <span style={{ color: isActive || isUpgrade ? 'var(--c-brand-teal)' : 'var(--c-text-muted)', display: 'flex', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        <Link
          href="/cuenta"
          style={{
            borderTop: '1px solid var(--c-border)',
            paddingTop: 14,
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            padding: '14px 10px 8px',
            borderRadius: 10,
            transition: 'background .12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 999,
            background: 'var(--c-brand-teal)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 600,
            flexShrink: 0,
          }}>
            {initial ?? '?'}
          </div>
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: 12,
            color: 'var(--c-text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
          }}>
            {email ?? ''}
          </span>
        </Link>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
