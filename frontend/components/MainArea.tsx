'use client'

import { useAliisAgentContext } from '@/lib/aliis-agent-context'
import { cn } from '@/lib/utils'

export function MainArea({ children }: { children: React.ReactNode }) {
  const { open } = useAliisAgentContext()
  return (
    <main
      className={cn(
        'flex-1 overflow-y-auto relative transition-all duration-300',
        open ? 'md:mr-[380px]' : 'md:mr-0'
      )}
    >
      {children}
    </main>
  )
}
