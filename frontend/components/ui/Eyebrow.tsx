import { cn } from '@/lib/utils'
import React from 'react'

export function Eyebrow({
  children,
  centered = false,
  className,
  style,
}: {
  children: React.ReactNode
  centered?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <p
      className={cn(
        'font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 m-0',
        centered && 'text-center',
        className
      )}
      style={style}
    >
      {children}
    </p>
  )
}
