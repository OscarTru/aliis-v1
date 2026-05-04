'use client'

import { usePackContext } from '@/lib/pack-context'
import { useAliisAgentContext } from '@/lib/aliis-agent-context'
import { NotificationBell } from '@/components/NotificationBell'
import { cn } from '@/lib/utils'

export function NotificationBellClient({ initialUnread }: { initialUnread: number }) {
  const { chatOpen } = usePackContext()
  const { open: agentOpen } = useAliisAgentContext()
  return (
    <div className={cn(
      'hidden md:block fixed top-4 z-50 transition-all duration-300',
      chatOpen || agentOpen ? 'md:right-[396px]' : 'md:right-4'
    )}>
      <NotificationBell initialUnread={initialUnread} />
    </div>
  )
}
