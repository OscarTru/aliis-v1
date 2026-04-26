'use client'

import { useEffect } from 'react'

export default function PackShellLayout({ children }: { children: React.ReactNode }) {
  // Lock main's scroll — PackView handles its own internal scroll
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    const prev = main.style.overflow
    main.style.overflow = 'hidden'
    return () => { main.style.overflow = prev }
  }, [])

  return <div className="h-full flex flex-col">{children}</div>
}
