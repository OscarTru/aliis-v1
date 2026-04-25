import { cn } from '@/lib/utils'

export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl opacity-20',
        'bg-primary',
        className
      )}
    />
  )
}
