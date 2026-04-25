'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, LayoutList, Zap, UserCircle, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  upgrade?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/ingreso',   label: 'Nuevo diagnóstico', icon: <Plus size={18} /> },
  { href: '/historial', label: 'Mi expediente',     icon: <LayoutList size={18} /> },
]

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/cuenta',   label: 'Mi cuenta',       icon: <UserCircle size={18} /> },
]

export function Sidebar() {
  const pathname = usePathname()
  const [email, setEmail] = useState<string | null>(null)
  const [initial, setInitial] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('aliis-sidebar-collapsed')
    if (stored !== null) setCollapsed(stored === 'true')
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('aliis-sidebar-collapsed', String(collapsed))
  }, [collapsed, mounted])

  useEffect(() => {
    const supabase = createClient()
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? null)
      setInitial(user.email?.[0]?.toUpperCase() ?? null)
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      setPlan(profile?.plan ?? 'free')
    }
    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      setEmail(u?.email ?? null)
      setInitial(u?.email?.[0]?.toUpperCase() ?? null)
      if (!u) { setPlan(null); return }
      supabase.from('profiles').select('plan').eq('id', u.id).single()
        .then(({ data }) => setPlan(data?.plan ?? 'free'))
    })
    return () => subscription.unsubscribe()
  }, [])

  const upgradeItem: NavItem = { href: '/precios', label: 'Actualizar a Pro', icon: <Zap size={18} />, upgrade: true }
  const bottomNav = plan === 'free'
    ? [...BOTTOM_ITEMS, upgradeItem]
    : BOTTOM_ITEMS

  function NavLink({ item }: { item: NavItem }) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

    const inner = (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center rounded-xl transition-all duration-150 no-underline',
          collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full',
          isActive
            ? 'bg-primary/10 text-primary'
            : item.upgrade
            ? 'text-primary hover:bg-primary/8'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <span className={cn(
          'shrink-0 flex items-center justify-center transition-colors',
          isActive ? 'text-primary' : item.upgrade ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}>
          {item.icon}
        </span>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'text-sm font-medium truncate overflow-hidden whitespace-nowrap',
                isActive ? 'text-primary' : item.upgrade ? 'text-primary' : ''
              )}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent side="right" className="font-sans text-xs">{item.label}</TooltipContent>
        </Tooltip>
      )
    }
    return inner
  }

  return (
    <TooltipProvider delayDuration={100}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 224 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative flex flex-col shrink-0 border-r border-border bg-background overflow-visible h-screen sticky top-0 select-none"
      >
        {/* Floating toggle button — sits on the border between sidebar and content */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expandir' : 'Colapsar'}
              className="absolute -right-3 top-[52px] z-50 flex items-center justify-center w-6 h-6 rounded-full border border-border bg-background text-muted-foreground/50 hover:text-foreground hover:border-border shadow-sm transition-all duration-150 hover:scale-110"
            >
              <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronLeft size={12} />
              </motion.div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-sans text-xs">
            {collapsed ? 'Expandir' : 'Colapsar'}
          </TooltipContent>
        </Tooltip>

        {/* Logo */}
        <div className={cn('flex items-center h-14 shrink-0 overflow-hidden', collapsed ? 'justify-center px-0' : 'px-4')}>
          <Link href="/historial" className="flex items-center no-underline">
            <AnimatePresence mode="wait" initial={false}>
              {collapsed ? (
                <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  <Image src="/assets/aliis-logo.png" alt="Aliis" width={28} height={28} className="object-contain" />
                </motion.div>
              ) : (
                <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  <Image src="/assets/aliis-original.png" alt="Aliis" width={80} height={30} className="object-contain" />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <Separator />

        {/* Main nav */}
        <nav className={cn('flex flex-col gap-1 flex-1 py-3', collapsed ? 'px-2 items-center' : 'px-2')}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <Separator />

        {/* Bottom nav */}
        <div className={cn('flex flex-col gap-1 py-3', collapsed ? 'px-2 items-center' : 'px-2')}>
          {bottomNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <Separator />

        {/* User */}
        <Link
          href="/cuenta"
          className={cn(
            'flex items-center shrink-0 hover:bg-muted transition-colors no-underline',
            collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-3'
          )}
        >
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-sans text-xs font-bold shrink-0">
            {initial ?? '?'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="font-sans text-xs text-foreground font-medium truncate whitespace-nowrap leading-tight">
                  {email ?? ''}
                </p>
                {plan && (
                  <p className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground leading-tight">
                    {plan === 'pro' ? 'Pro' : 'Gratis'}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

      </motion.aside>
    </TooltipProvider>
  )
}
