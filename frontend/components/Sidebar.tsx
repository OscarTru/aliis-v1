'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, LayoutList, Zap, UserCircle, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

const BASE_NAV: NavItem[] = [
  { href: '/ingreso', label: 'Nuevo pack', icon: <Plus size={16} /> },
  { href: '/historial', label: 'Mis explicaciones', icon: <LayoutList size={16} /> },
  { href: '/cuenta', label: 'Mi cuenta', icon: <UserCircle size={16} /> },
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

  const navItems: NavItem[] = [
    ...BASE_NAV,
    ...(plan === 'free'
      ? [{ href: '/precios', label: 'Actualizar plan', icon: <Zap size={16} /> }]
      : []),
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col shrink-0 border-r border-border bg-background overflow-hidden h-screen sticky top-0"
      >
        {/* Logo */}
        <div className={cn('flex items-center pt-5 pb-6', collapsed ? 'justify-center px-3' : 'px-4')}>
          <Link href="/historial" className="flex items-center no-underline">
            {collapsed ? (
              <Image src="/assets/aliis-logo.png" alt="Aliis" width={26} height={26} style={{ objectFit: 'contain' }} />
            ) : (
              <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} style={{ objectFit: 'contain' }} />
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 flex-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isUpgrade = item.href === '/precios'

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-[10px] transition-colors duration-100 no-underline',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : isUpgrade
                    ? 'text-primary hover:bg-muted'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span className={cn('flex shrink-0', isActive || isUpgrade ? 'text-primary' : 'text-muted-foreground')}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm truncate overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Toggle button */}
        <div className={cn('px-2 py-2', collapsed ? 'flex justify-center' : '')}>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex items-center justify-center w-full rounded-[10px] p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-100"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>

        {/* User info */}
        <div className="border-t border-border">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/cuenta"
                  className="flex items-center justify-center p-3 hover:bg-muted transition-colors no-underline"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                    {initial ?? '?'}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{email ?? 'Mi cuenta'}</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/cuenta"
              className="flex items-center gap-2.5 px-3 py-3.5 hover:bg-muted transition-colors no-underline"
            >
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                {initial ?? '?'}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="font-sans text-xs text-muted-foreground truncate min-w-0"
                  >
                    {email ?? ''}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
