'use client'

import { usePathname } from 'next/navigation'
import { AliisAgentProvider, useAliisAgentContext } from '@/lib/aliis-agent-context'
import { AliisAgentDrawer } from '@/components/AliisAgentDrawer'
import { Icon } from '@iconify/react'

const FAB_HIDDEN_PATHS = ['/pack/', '/condiciones/']

function AliisAgentFAB() {
  const { open, setOpen } = useAliisAgentContext()
  const pathname = usePathname()
  if (open) return null
  if (FAB_HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Pregúntale a Aliis"
      className="fixed bottom-[calc(64px+12px+env(safe-area-inset-bottom))] md:bottom-6 right-4 z-50 w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center shadow-[var(--c-btn-primary-shadow)] border-none cursor-pointer"
    >
      <Icon icon="solar:chat-round-bold-duotone" width={20} />
    </button>
  )
}

export function AliisAgentIsland({ children }: { children: React.ReactNode }) {
  return (
    <AliisAgentProvider>
      {children}
      <AliisAgentFAB />
      <AliisAgentDrawer />
    </AliisAgentProvider>
  )
}
