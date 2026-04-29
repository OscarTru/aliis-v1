'use client'

import { usePackContext } from '@/lib/pack-context'
import { NotificationBell } from '@/components/NotificationBell'

export function NotificationBellWrapper() {
  const { chatOpen } = usePackContext()
  if (chatOpen) return null
  return <NotificationBell />
}
