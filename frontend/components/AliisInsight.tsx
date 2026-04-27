'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function AliisInsight() {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/aliis/insight')
      .then(r => r.json())
      .then(d => setContent(d.content ?? null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 mb-6 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary/20" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
          <Image src="/assets/aliis-logo.png" alt="Aliis" width={28} height={28} className="object-contain" />
        </div>
        <span className="font-mono text-[10px] tracking-[.12em] text-primary">Aliis</span>
      </div>
      <p className="font-serif text-[15px] leading-relaxed text-foreground italic">
        {content}
      </p>
    </div>
  )
}
