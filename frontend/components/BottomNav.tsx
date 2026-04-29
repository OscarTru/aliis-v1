'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, LayoutList, BookHeart, Library } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/ingreso',     label: 'Nuevo',        icon: Plus },
  { href: '/historial',   label: 'Expediente',   icon: LayoutList },
  { href: '/diario',      label: 'Diario',       icon: BookHeart },
  { href: '/condiciones', label: 'Diagnósticos', icon: Library },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 no-underline transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
