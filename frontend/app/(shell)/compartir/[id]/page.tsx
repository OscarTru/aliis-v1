'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function CompartirPage() {
  const { id } = useParams<{ id: string }>()
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function generate() {
      const supabase = createClient()
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('packs')
        .update({ shared_token: token, shared_expires_at: expiresAt })
        .eq('id', id)
      setUrl(`${window.location.origin}/p/${token}`)
      setLoading(false)
    }
    generate()
  }, [id])

  async function copy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-[480px] mx-auto mt-20 px-6 text-center">
      <h1 className="font-serif text-[32px] tracking-[-0.02em] mb-3">
        Compartir explicación
      </h1>
      <p className="font-sans text-[15px] text-muted-foreground leading-relaxed mb-8">
        Cualquier persona con este enlace puede ver tu explicación durante 30 días. Sin necesidad de cuenta.
      </p>
      {loading ? (
        <div className="font-sans text-muted-foreground/60 animate-pulse">
          Generando enlace…
        </div>
      ) : (
        <div className="flex gap-2.5">
          <input
            readOnly
            value={url ?? ''}
            className="flex-1 px-3.5 py-3 rounded-[10px] border border-border bg-muted font-mono text-[13px] text-foreground outline-none"
          />
          <button
            onClick={copy}
            className={cn(
              'px-5 py-3 rounded-[10px] border border-border font-sans text-sm cursor-pointer transition-colors',
              copied
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground'
            )}
          >
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  )
}
