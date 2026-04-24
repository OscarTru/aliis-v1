export function ButtonPrimary({
  children,
  onClick,
  size = 'md',
  icon,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  icon?: 'arrow'
  disabled?: boolean
}) {
  const pad = { sm: '8px 16px', md: '12px 22px', lg: '14px 28px' }[size]
  const fs = { sm: 13, md: 14, lg: 15 }[size]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: pad,
        background: disabled ? 'var(--c-surface)' : 'var(--c-invert)',
        color: disabled ? 'var(--c-text-faint)' : 'var(--c-invert-fg)',
        border: '1px solid var(--c-border)',
        borderRadius: 999,
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: fs,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity .2s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '.85' }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {children}
      {icon === 'arrow' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

export function ButtonGhost({
  children,
  onClick,
  size = 'md',
  href,
}: {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  href?: string
}) {
  const pad = { sm: '8px 16px', md: '12px 22px', lg: '14px 28px' }[size]
  const fs = { sm: 13, md: 14, lg: 15 }[size]
  const styles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: pad,
    background: 'transparent',
    color: 'var(--c-text)',
    border: '1px solid var(--c-border)',
    borderRadius: 999,
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: fs,
    cursor: 'pointer',
    transition: 'border-color .2s',
    textDecoration: 'none',
  }
  if (href) {
    return (
      <a href={href} style={styles}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-border-strong)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
      >
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} style={styles}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-border-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
    >
      {children}
    </button>
  )
}
