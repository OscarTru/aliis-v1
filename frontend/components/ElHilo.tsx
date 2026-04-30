'use client'

import { useState, useEffect } from 'react'
import { GitBranch, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

interface Props {
  userId: string
}

const CACHE_KEY = (userId: string) => {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return `aliis_hilo_${userId}_${month}`
}

export function ElHilo({ userId }: Props) {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY(userId))
    if (cached) {
      setContent(cached)
      setFromCache(true)
    }
  }, [userId])

  async function generate() {
    setLoading(true)
    setError(null)
    setExpanded(true)
    try {
      const res = await fetch('/api/aliis/hilo', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error generando El Hilo.')
        setLoading(false)
        return
      }
      setContent(data.content)
      setFromCache(false)
      localStorage.setItem(CACHE_KEY(userId), data.content)
    } catch {
      setError('No se pudo conectar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
      {/* Header */}
      <button
        onClick={() => {
          if (!content && !loading) {
            generate()
          } else {
            setExpanded(e => !e)
          }
        }}
        className="w-full flex items-center gap-3 px-4 md:px-6 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <GitBranch className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50">
            Tu historia de salud
          </p>
          <p className="font-serif text-[16px] text-foreground leading-tight">
            {content ? 'El Hilo' : 'Generar El Hilo'}
          </p>
        </div>
        {loading ? (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
        ) : content ? (
          expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : null}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 md:px-6 pb-5 pt-1 border-t border-border">
          {loading && (
            <p className="font-sans text-[14px] text-muted-foreground animate-pulse">
              Aliis está tejiendo tu historia...
            </p>
          )}
          {error && (
            <p className="font-sans text-[14px] text-muted-foreground">{error}</p>
          )}
          {content && !loading && (
            <>
              <div className="flex items-center gap-2 mb-3 mt-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                  <Image src="/assets/aliis-logo.png" alt="Aliis" width={24} height={24} className="object-contain" />
                </div>
                <span className="font-mono text-[10px] tracking-[.12em] text-primary">Aliis</span>
              </div>
              <p className="font-serif text-[15px] leading-relaxed text-foreground italic">{content}</p>
              {fromCache && (
                <div className="flex items-center justify-between mt-4">
                  <p className="font-mono text-[10px] text-muted-foreground/50">
                    Generado este mes
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); generate() }}
                    className="font-mono text-[10px] text-primary/70 hover:text-primary transition-colors"
                  >
                    Regenerar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
