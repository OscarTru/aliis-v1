'use client'

import { usePackContext } from '@/lib/pack-context'
import { NotificationBell } from '@/components/NotificationBell'
import { cn } from '@/lib/utils'

export function NotificationBellClient({ initialUnread }: { initialUnread: number }) {
  const { chatOpen } = usePackContext()
  return (
    <div className={cn(
      'transition-all duration-300',
      chatOpen ? 'md:mr-[380px]' : 'md:mr-0'
    )}>
      <NotificationBell initialUnread={initialUnread} />
    </div>
  )
}
