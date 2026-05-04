'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { AliisAgentProvider, useAliisAgentContext } from '@/lib/aliis-agent-context'
import { AliisAgentDrawer } from '@/components/AliisAgentDrawer'
import { Icon } from '@iconify/react'

const FAB_HIDDEN_PATHS = ['/pack/', '/condiciones/', '/ingreso', '/compartir/']

function AliisAgentFAB() {
  const { open, setOpen } = useAliisAgentContext()
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)

  if (open) return null
  if (FAB_HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null

  return (
    <motion.button
      onClick={() => setOpen(true)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.94 }}
      aria-label="Pregúntale a Aliis"
      className="fixed bottom-[calc(64px+12px+env(safe-area-inset-bottom))] md:bottom-6 right-4 z-50 flex items-center gap-1.5 h-11 rounded-full bg-foreground text-background border-none cursor-pointer shadow-[var(--c-btn-primary-shadow)] overflow-hidden"
      animate={{ paddingLeft: 12, paddingRight: hovered ? 16 : 12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Icon icon="solar:chat-round-bold-duotone" width={20} className="shrink-0" />
      <AnimatePresence initial={false}>
        {hovered && (
          <motion.span
            key="label"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="hidden md:inline overflow-hidden whitespace-nowrap font-sans text-[13px] font-medium"
          >
            Pregúntale a Aliis
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
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
