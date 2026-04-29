'use client'

import { usePackContext } from '@/lib/pack-context'
import { NotificationBell } from '@/components/NotificationBell'
import { cn } from '@/lib/utils'

export function NotificationBellClient({ initialUnread }: { initialUnread: number }) {
  const { chatOpen } = usePackContext()
  return (
    <div className={cn(
      'hidden md:block fixed top-4 z-50 transition-all duration-300',
      chatOpen ? 'md:right-[396px]' : 'md:right-4'
    )}>
      <NotificationBell initialUnread={initialUnread} />
    </div>
  )
}
