'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, LayoutList, Zap, UserCircle, ChevronLeft, BookOpen, Settings2, CalendarDays, MessageCircle, AlertTriangle, BookMarked, Share2, Stethoscope, Pill, Heart, Library, Wrench, BookHeart } from 'lucide-react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { usePackContext } from '@/lib/pack-context'
import { useConditionContext } from '@/lib/condition-context'
import { cn } from '@/lib/utils'

const SECTION_ICON_MAP: Record<string, React.ReactNode> = {
  'que-es': <BookOpen size={14} />,
  'como-funciona': <Settings2 size={14} />,
  'que-esperar': <CalendarDays size={14} />,
  'diagnostico': <Stethoscope size={14} />,
  'tratamiento': <Pill size={14} />,
  'vivir-con': <Heart size={14} />,
  'preguntas': <MessageCircle size={14} />,
  'senales': <AlertTriangle size={14} />,
  'referencias': <BookMarked size={14} />,
}

const CHAPTER_ICON_MAP: Record<string, React.ReactNode> = {
  'que-es': <BookOpen size={14} />,
  'como-funciona': <Settings2 size={14} />,
  'que-esperar': <CalendarDays size={14} />,
  'preguntas': <MessageCircle size={14} />,
  'senales': <AlertTriangle size={14} />,
}

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  upgrade?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/ingreso',     label: 'Nuevo diagnóstico', icon: <Plus size={18} /> },
  { href: '/historial',   label: 'Mi expediente',     icon: <LayoutList size={18} /> },
  { href: '/diario',      label: 'Mi diario',         icon: <BookHeart size={18} /> },
  { href: '/condiciones', label: 'Diagnósticos',      icon: <Library size={18} /> },
]

const BOTTOM_ITEMS: NavItem[] = []

// Defined outside Sidebar so React never sees it as a new component type on re-render
function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
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
          ? 'text-primary hover:bg-primary/[0.08]'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className={cn(
        'shrink-0 flex items-center justify-center transition-colors',
        isActive ? 'text-primary' : item.upgrade ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
      )}>
        {item.icon}
      </span>

      {/* CSS-only collapse — no motion here, avoids re-animation on route change */}
      <span className={cn(
        'text-sm font-medium truncate overflow-hidden whitespace-nowrap transition-all duration-150',
        collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
        isActive ? 'text-primary' : item.upgrade ? 'text-primary' : ''
      )}>
        {item.label}
      </span>
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

export function Sidebar({
  initialName = null,
  initialEmail = null,
  initialPlan = 'free',
  initialInitial = null,
}: {
  initialName?: string | null
  initialEmail?: string | null
  initialPlan?: string
  initialInitial?: string | null
}) {
  const pathname = usePathname()
  const { pack, activeIdx, readChapters, setActiveIdx, chatOpen } = usePackContext()
  const { condition, activeIdx: conditionActiveIdx, setActiveIdx: setConditionActiveIdx } = useConditionContext()
  const verifiedRefs = pack?.references.filter((r) => r.verified !== false) ?? []
  const [email, setEmail] = useState<string | null>(initialEmail)
  const [name, setName] = useState<string | null>(initialName)
  const [initial, setInitial] = useState<string | null>(initialInitial)
  const [plan, setPlan] = useState<string | null>(initialPlan)
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
    if (chatOpen) setCollapsed(true)
  }, [chatOpen])

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { setEmail(null); setPlan(null); setName(null); setInitial(null); return }
      const u = session?.user
      if (!u) return
      setEmail(u.email ?? null)
      supabase.from('profiles').select('plan,name').eq('id', u.id).single()
        .then(({ data }) => {
          setPlan(data?.plan ?? 'free')
          const n = data?.name ?? null
          setName(n)
          setInitial((n?.[0] ?? u.email?.[0] ?? '?').toUpperCase())
        })
    })
    return () => subscription.unsubscribe()
  }, [])

  const upgradeItem: NavItem = { href: '/precios', label: 'Actualizar a Pro', icon: <Zap size={18} />, upgrade: true }
  const bottomNav = plan === 'free'
    ? [...BOTTOM_ITEMS, upgradeItem]
    : BOTTOM_ITEMS

  return (
    <TooltipProvider delayDuration={100}>
      {/* initial={false} prevents width animation on first mount / route changes */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 224 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative hidden md:flex flex-col shrink-0 border-r border-border bg-background overflow-visible h-screen sticky top-0 select-none"
      >
        {/* Floating toggle button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expandir' : 'Colapsar'}
              className="absolute -right-3 top-14 z-50 flex items-center justify-center w-6 h-6 rounded-full border border-border bg-background text-muted-foreground/50 hover:text-foreground hover:border-border shadow-sm transition-all duration-150 hover:scale-110"
            >
              <motion.div initial={false} animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronLeft size={12} />
              </motion.div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-sans text-xs">
            {collapsed ? 'Expandir' : 'Colapsar'}
          </TooltipContent>
        </Tooltip>

        {/* Logo */}
        <div className="flex items-center justify-center shrink-0 w-full px-3 pt-5 pb-2">
          <Link href="/historial" className="flex items-center justify-center no-underline w-full">
            {collapsed ? (
              <>
                <Image src="/assets/aliis-black-single.png" alt="Aliis" width={30} height={30} className="object-contain dark:hidden" />
                <Image src="/assets/aliis-black-single.png" alt="Aliis" width={30} height={30} className="object-contain hidden dark:block dark:invert" />
              </>
            ) : (
              <>
                <Image src="/assets/aliis-original.png" alt="Aliis" width={88} height={32} className="object-contain dark:hidden" />
                <Image src="/assets/aliis-black.png" alt="Aliis" width={88} height={32} className="object-contain hidden dark:block dark:invert" />
              </>
            )}
          </Link>
        </div>

        {/* Main nav */}
        <nav className={cn('flex flex-col gap-1 py-3', collapsed ? 'px-2 items-center' : 'px-2')}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
          ))}
        </nav>

        {/* Pack chapter nav — shown when viewing a pack */}
        {pack && !collapsed && (
          <>
            <Separator />
            <div className="px-3 pt-3 pb-1">
              <div className="font-mono text-[9px] tracking-[.15em] uppercase text-muted-foreground/50 mb-1">
                Esta explicación
              </div>
              <div className="font-serif text-[12px] leading-[1.3] text-muted-foreground truncate">
                {pack.dx}
              </div>
            </div>
            <nav className="flex flex-col gap-0 px-2 pb-2 overflow-y-auto max-h-[40vh]">
              {pack.chapters.map((ch, i) => {
                const isActive = i === activeIdx
                const isRead = readChapters.has(ch.id)
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      'w-full text-left px-2.5 py-[7px] rounded-[9px] border-none cursor-pointer flex items-center gap-2 transition-colors duration-100',
                      isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-muted'
                    )}
                  >
                    <span className={cn('shrink-0 inline-flex', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
                      {CHAPTER_ICON_MAP[ch.id] ?? '•'}
                    </span>
                    <span className={cn(
                      'font-sans text-[12px] truncate leading-[1.2] flex-1',
                      isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                    )}>
                      {ch.kicker}
                    </span>
                    {isRead && !isActive && <div className="w-[5px] h-[5px] rounded-full bg-primary shrink-0" />}
                  </button>
                )
              })}
              {pack.tools.length > 0 && (
                <button
                  onClick={() => setActiveIdx(pack.chapters.length)}
                  className={cn(
                    'w-full text-left px-2.5 py-[7px] rounded-[9px] border-none cursor-pointer flex items-center gap-2',
                    activeIdx === pack.chapters.length ? 'bg-primary/10' : 'bg-transparent hover:bg-muted'
                  )}
                >
                  <span className={cn('inline-flex', activeIdx === pack.chapters.length ? 'text-primary' : 'text-muted-foreground/50')}>
                    <Wrench size={14} />
                  </span>
                  <span className={cn('font-sans text-[12px]', activeIdx === pack.chapters.length ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    Herramientas
                  </span>
                </button>
              )}
              {verifiedRefs.length > 0 && (() => {
                const refsIdx = pack.chapters.length + (pack.tools.length > 0 ? 1 : 0)
                return (
                  <button
                    onClick={() => setActiveIdx(refsIdx)}
                    className={cn(
                      'w-full text-left px-2.5 py-[7px] rounded-[9px] border-none cursor-pointer flex items-center gap-2',
                      activeIdx === refsIdx ? 'bg-primary/10' : 'bg-transparent hover:bg-muted'
                    )}
                  >
                    <span className={cn('inline-flex', activeIdx === refsIdx ? 'text-primary' : 'text-muted-foreground/50')}>
                      <BookMarked size={14} />
                    </span>
                    <span className={cn('font-sans text-[12px]', activeIdx === refsIdx ? 'text-primary font-medium' : 'text-muted-foreground')}>
                      Referencias
                    </span>
                  </button>
                )
              })()}
              <Link
                href={`/compartir/${pack.id}`}
                className="flex items-center gap-2 px-2.5 py-[7px] rounded-[9px] no-underline font-sans text-[12px] text-muted-foreground hover:bg-muted transition-colors"
              >
                <span className="flex text-muted-foreground/50"><Share2 size={14} /></span>
                Compartir
              </Link>
            </nav>
          </>
        )}

        {/* Condition section nav — shown when viewing a condition */}
        {condition && !collapsed && (
          <>
            <Separator />
            <div className="px-3 pt-3 pb-1">
              <div className="font-mono text-[9px] tracking-[.15em] uppercase text-muted-foreground/50 mb-1">
                Diagnósticos
              </div>
              <div className="font-serif text-[12px] leading-[1.3] text-muted-foreground truncate">
                {condition.name}
              </div>
            </div>
            <nav className="flex flex-col gap-0 px-2 pb-2 overflow-y-auto max-h-[40vh]">
              {condition.sections.map((sec, i) => {
                const isActive = i === conditionActiveIdx
                return (
                  <button
                    key={sec.id}
                    onClick={() => setConditionActiveIdx(i)}
                    className={cn(
                      'w-full text-left px-2.5 py-[7px] rounded-[9px] border-none cursor-pointer flex items-center gap-2 transition-colors duration-100',
                      isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-muted'
                    )}
                  >
                    <span className={cn('shrink-0 inline-flex', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
                      {SECTION_ICON_MAP[sec.slug] ?? '•'}
                    </span>
                    <span className={cn(
                      'font-sans text-[12px] truncate leading-[1.2] flex-1',
                      isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                    )}>
                      {sec.title}
                    </span>
                  </button>
                )
              })}
            </nav>
          </>
        )}

        {/* Spacer — always pushes bottom nav down */}
        <div className="flex-1" />

        {/* Bottom nav (upgrade item only when free) */}
        {bottomNav.length > 0 && (
          <div className={cn('flex flex-col gap-1 py-3', collapsed ? 'px-2 items-center' : 'px-2')}>
            {bottomNav.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
            ))}
          </div>
        )}

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
          <div className={cn(
            'min-w-0 overflow-hidden transition-all duration-150',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}>
            <p className="font-sans text-xs text-foreground font-medium truncate whitespace-nowrap leading-tight">
              {name ?? email ?? ''}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground leading-tight truncate whitespace-nowrap">
              {name ? (email ?? '') : (plan === 'pro' ? 'Pro' : 'Gratis')}
            </p>
          </div>
        </Link>

      </motion.aside>
    </TooltipProvider>
  )
}
