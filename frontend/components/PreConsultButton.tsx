'use client'

import { useState } from 'react'
import { ClipboardList, Loader2, Copy, Check, ExternalLink } from 'lucide-react'

interface Props {
  packId: string
  userPlan: string
}

export function PreConsultButton({ packId, userPlan }: Props) {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  if (userPlan !== 'pro') return null

  const shareUrl = token ? `${window.location.origin}/c/${token}` : null

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/aliis/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error generando el resumen.')
        return
      }
      setToken(data.token)
      setOpen(true)
    } catch {
      setError('No se pudo conectar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {!token ? (
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background font-sans text-[13px] text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ClipboardList className="w-4 h-4" />
          }
          {loading ? 'Preparando resumen...' : 'Preparar consulta'}
        </button>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary shrink-0" />
            <p className="font-sans text-[13px] font-medium text-foreground">
              Resumen listo — válido 7 días
            </p>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground break-all">{shareUrl}</p>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background font-sans text-[12px] font-medium transition-opacity hover:opacity-90"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a
              href={shareUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border font-sans text-[12px] text-foreground no-underline hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver
            </a>
            <button
              onClick={() => { setToken(null); setOpen(false) }}
              className="ml-auto font-sans text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Nuevo
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-2 font-sans text-[12px] text-destructive">{error}</p>
      )}
    </div>
  )
}
