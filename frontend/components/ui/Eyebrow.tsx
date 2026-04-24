export function Eyebrow({
  children,
  centered = false,
  style = {},
}: {
  children: React.ReactNode
  centered?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '.22em',
        color: 'var(--c-text-subtle)',
        textAlign: centered ? 'center' : 'left',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
