'use client'

import { useEffect, useRef } from 'react'

const STYLE_ID = 'glare-hover-styles'

function injectStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = `
.glare-hover {
  overflow: hidden;
  position: relative;
}
.glare-hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    var(--gh-angle),
    hsla(0,0%,0%,0) 60%,
    var(--gh-rgba) 70%,
    hsla(0,0%,0%,0),
    hsla(0,0%,0%,0) 100%
  );
  transition: var(--gh-duration) ease;
  background-size: var(--gh-size) var(--gh-size), 100% 100%;
  background-repeat: no-repeat;
  background-position: -100% -100%, 0 0;
  pointer-events: none;
  z-index: 1;
}
.glare-hover:hover::before {
  background-position: 100% 100%, 0 0;
}
.glare-hover--play-once::before { transition: none; }
.glare-hover--play-once:hover::before {
  transition: var(--gh-duration) ease;
  background-position: 100% 100%, 0 0;
}
`
  document.head.appendChild(el)
}

interface GlareHoverProps {
  children: React.ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  playOnce?: boolean
  className?: string
  style?: React.CSSProperties
}

export function GlareHover({
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style = {},
}: GlareHoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { injectStyles() }, [])

  const hex = glareColor.replace('#', '')
  let rgba = glareColor
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    rgba = `rgba(${r},${g},${b},${glareOpacity})`
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    rgba = `rgba(${r},${g},${b},${glareOpacity})`
  }

  const vars = {
    '--gh-angle': `${glareAngle}deg`,
    '--gh-duration': `${transitionDuration}ms`,
    '--gh-size': `${glareSize}%`,
    '--gh-rgba': rgba,
  } as React.CSSProperties

  return (
    <div
      ref={ref}
      className={`glare-hover${playOnce ? ' glare-hover--play-once' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  )
}
