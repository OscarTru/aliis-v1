import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-9', className)}>
      {eyebrow && (
        <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-[clamp(26px,3.5vw,38px)] tracking-[-0.022em] leading-[1.1] mb-0">
        {title}
      </h1>
      {subtitle && (
        <p className="font-sans text-[15px] text-muted-foreground mt-2 leading-[1.6] mb-0">
          {subtitle}
        </p>
      )}
    </div>
  )
}
