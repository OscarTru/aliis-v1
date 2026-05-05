'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { useAliisAgentContext } from '@/lib/aliis-agent-context'
import { usePackContext } from '@/lib/pack-context'

const NAV_ITEMS = [
  { href: '/ingreso',      label: 'Nuevo',        iconActive: 'solar:add-circle-bold-duotone',          iconIdle: 'solar:add-circle-linear' },
  { href: '/historial',    label: 'Expediente',   iconActive: 'solar:folder-with-files-bold-duotone',   iconIdle: 'solar:folder-with-files-linear' },
  { href: '/diario',       label: 'Diario',        iconActive: 'solar:notebook-bold-duotone',            iconIdle: 'solar:notebook-linear' },
  { href: '/tratamientos', label: 'Tratamientos',  iconActive: 'solar:pills-bold-duotone',               iconIdle: 'solar:pills-linear' },
  { href: '/cuenta',       label: 'Cuenta',        iconActive: 'solar:user-circle-bold-duotone',         iconIdle: 'solar:user-circle-linear' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { open: agentOpen } = useAliisAgentContext()
  const { chatOpen } = usePackContext()
  const hidden = agentOpen || chatOpen

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-xl transition-transform duration-300',
        hidden ? 'translate-y-full' : 'translate-y-0'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ href, label, iconActive, iconIdle }) => {
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
            <Icon icon={isActive ? iconActive : iconIdle} width={24} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
