'use client'

import { useEffect } from 'react'

export default function CondicionShellLayout({ children }: { children: React.ReactNode }) {
  // Prevent the parent <main> from scrolling while in condition view
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const prev = main.style.overflow
    main.style.overflow = 'hidden'
    return () => { main.style.overflow = prev }
  }, [])

  return <div className="h-full flex flex-col">{children}</div>
}
