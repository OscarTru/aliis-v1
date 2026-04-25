import { cn } from '@/lib/utils'

export function Capsule({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode
  tone?: 'default' | 'teal' | 'ghost'
  className?: string
}) {
  const toneVariants = {
    default: 'border-border bg-muted text-muted-foreground',
    teal: 'border-teal-400/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
    ghost: 'border-border/50 bg-transparent text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
        'border',
        'font-mono text-xs font-medium',
        'tracking-wide uppercase',
        toneVariants[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
