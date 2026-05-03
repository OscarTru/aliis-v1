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
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    async function generate() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Verify ownership before updating
      const { data: pack } = await supabase
        .from('packs')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!pack) {
        setDenied(true)
        setLoading(false)
        return
      }

      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('packs')
        .update({ shared_token: token, shared_expires_at: expiresAt })
        .eq('id', id)
        .eq('user_id', user.id)  // double-filter for defense in depth
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
      ) : denied ? (
        <div className="font-sans text-[15px] text-destructive">
          No tienes permiso para compartir esta explicación.
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
