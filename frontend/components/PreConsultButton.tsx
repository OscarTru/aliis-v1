'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Copy, Check, ExternalLink, X } from 'lucide-react'
import { Icon } from '@iconify/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const LOADING_PHRASES = [
  'Preparando consulta',
  'Leyendo tus diagnósticos',
  'Analizando tus signos',
  'Revisando tu historial',
  'Generando resumen',
]

function CyclingText() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LOADING_PHRASES.length), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="whitespace-nowrap text-shimmer-ai"
        >
          {LOADING_PHRASES[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

interface Props {
  packId: string
  iconOnly?: 'mobile'
}

export function PreConsultButton({ packId, iconOnly }: Props) {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const base = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const shareUrl = token ? `${base}/c/${token}` : null

  // On mount, check if a valid summary already exists for this pack (last 7 days)
  useEffect(() => {
    fetch('/api/aliis/consult/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.token) setToken(d.token) })
      .catch(() => {})
  }, [packId])

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
      if (!res.ok) { setError(data.error ?? 'Error generando el resumen.'); return }
      setToken(data.token)
      setShowPanel(true)
    } catch {
      setError('No se pudo conectar.')
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

  // If no token yet, the click triggers generate(). If token exists, click opens the popover.
  // Radix Popover handles open state when there's a token; otherwise the button generates first.
  const triggerButton = (
    <motion.button
      onClick={token ? undefined : generate}
      disabled={loading}
      whileTap={{ scale: 0.96 }}
      className="btn-ai-border flex items-center gap-1.5 px-3 h-[30px] rounded-full bg-background font-sans text-[12px] text-foreground disabled:opacity-80 cursor-pointer relative overflow-visible"
    >
      <span className="shrink-0 flex">
        <Icon icon="solar:clipboard-check-bold-duotone" width={14} />
      </span>
      <span className={iconOnly === 'mobile' ? 'hidden md:inline-flex' : 'inline-flex'}>
        {loading ? (
          <CyclingText />
        ) : (
          <span>{token ? 'Ver resumen' : 'Preparar consulta'}</span>
        )}
      </span>
    </motion.button>
  )

  return (
    <div className="relative inline-flex">
      {token && shareUrl ? (
        <Popover open={showPanel} onOpenChange={setShowPanel}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={10}
            collisionPadding={12}
            className="w-[min(320px,calc(100vw-1.5rem))] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="solar:clipboard-check-bold-duotone" width={16} className="text-primary shrink-0" />
                <p className="font-sans text-[13px] font-medium text-foreground">Resumen listo</p>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>

            <p className="font-mono text-[10px] text-muted-foreground/60 break-all leading-relaxed">
              {shareUrl}
            </p>

            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background font-sans text-[12px] font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border font-sans text-[12px] text-foreground no-underline hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver
              </a>
            </div>

            <p className="font-mono text-[10px] text-muted-foreground/40 text-center">Válido 7 días</p>
          </PopoverContent>
        </Popover>
      ) : (
        triggerButton
      )}

      {error && (
        <p className="absolute top-[calc(100%+8px)] left-0 font-sans text-[11px] text-destructive bg-background border border-border px-2 py-1 rounded-lg whitespace-nowrap z-50">
          {error}
        </p>
      )}
    </div>
  )
}
