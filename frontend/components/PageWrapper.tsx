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
    <div className={cn(
      'transition-all duration-300 ease-out',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      className
    )}>
      {children}
    </div>
  )
}
