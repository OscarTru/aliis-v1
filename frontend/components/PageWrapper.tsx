'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className={cn(
        'h-full transition-all duration-300 ease-out',
        // Mobile: leave room for the fixed BottomNav (~64px) + iOS safe area.
        // Desktop: sidebar is rendered next to content, no bottom padding needed.
        'pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        className
      )}
    >
      {children}
    </div>
  )
}
