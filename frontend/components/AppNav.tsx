'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LoginModal } from './LoginModal'

export function AppNav({
  user,
}: {
  user?: { initial: string }
}) {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'color-mix(in srgb, var(--c-bg) 78%, transparent)',
          borderBottom: '1px solid var(--c-border)',
        }}
      >
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            gap: 24,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
            }}
          >
            <Image
              src="/assets/aliis-logo.png"
              alt="Aliis"
              width={30}
              height={30}
              style={{ objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 19,
                letterSpacing: '-.02em',
                color: 'var(--c-text)',
              }}
            >
              Aliis
            </span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              href="/precios"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--c-text-muted)',
                textDecoration: 'none',
              }}
            >
              Precios
            </Link>

            {user ? (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: 'var(--c-brand-teal-light)',
                  color: 'var(--c-brand-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {user.initial}
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: '1px solid var(--c-border)',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: 'var(--c-text)',
                  cursor: 'pointer',
                  transition: 'border-color .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-border-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
