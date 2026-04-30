'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface Props {
  userId: string
}

const CACHE_KEY = (userId: string) => {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return `aliis_correlation_${userId}_${month}`
}

export function CorrelationAnalysis({ userId }: Props) {
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

  async function analyze() {
    setLoading(true)
    setError(null)
    setExpanded(true)
    try {
      const res = await fetch('/api/aliis/correlation?days=30')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al analizar los datos.')
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
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header / trigger */}
      <button
        onClick={() => {
          if (!content && !loading) {
            analyze()
          } else {
            setExpanded(e => !e)
          }
        }}
        className="w-full flex items-center gap-3 px-4 md:px-6 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50">
            Pro · Análisis mensual
          </p>
          <p className="font-serif text-[16px] text-foreground leading-tight">
            {content ? 'Tu análisis de este mes' : 'Analizar mi mes'}
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
              Aliis está analizando tus registros...
            </p>
          )}
          {error && (
            <p className="font-sans text-[14px] text-muted-foreground">{error}</p>
          )}
          {content && !loading && (
            <>
              <p className="font-sans text-[14px] text-foreground leading-relaxed">{content}</p>
              {fromCache && (
                <div className="flex items-center justify-between mt-3">
                  <p className="font-mono text-[10px] text-muted-foreground/50">
                    Análisis de este mes
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); analyze() }}
                    className="font-mono text-[10px] text-primary/70 hover:text-primary transition-colors"
                  >
                    Actualizar
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
