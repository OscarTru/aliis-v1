export function Capsule({
  children,
  tone = 'default',
  style = {},
}: {
  children: React.ReactNode
  tone?: 'default' | 'teal' | 'ghost'
  style?: React.CSSProperties
}) {
  const tones = {
    default: { bg: 'var(--c-surface)', fg: 'var(--c-text-muted)', bd: 'var(--c-border)' },
    teal: { bg: 'rgba(31,138,155,.08)', fg: 'var(--c-brand-teal-deep)', bd: 'rgba(31,138,155,.22)' },
    ghost: { bg: 'transparent', fg: 'var(--c-text-subtle)', bd: 'var(--c-border)' },
  }
  const t = tones[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '.18em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
