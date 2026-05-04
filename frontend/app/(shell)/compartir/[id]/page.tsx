'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

export default function CompartirPage() {
  const { id } = useParams<{ id: string }>()
  const [url, setUrl] = useState<string | null>(null)
  const [dx, setDx] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    async function generate() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: pack } = await supabase
        .from('packs')
        .select('id, dx, shared_token, shared_expires_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!pack) { setDenied(true); setLoading(false); return }

      setDx(pack.dx ?? '')

      // Reutiliza el token si sigue vigente (más de 1 día restante)
      const existing = pack.shared_token && pack.shared_expires_at
        && new Date(pack.shared_expires_at) > new Date(Date.now() + 86_400_000)
        ? pack.shared_token : null

      const token = existing ?? crypto.randomUUID()

      if (!existing) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        await supabase
          .from('packs')
          .update({ shared_token: token, shared_expires_at: expiresAt })
          .eq('id', id)
          .eq('user_id', user.id)
      }

      setUrl(`${window.location.origin}/p/${token}`)
      setLoading(false)
    }
    generate()
  }, [id])

  async function copy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function shareWhatsApp() {
    if (!url) return
    const text = dx
      ? `Te comparto mi explicación de *${dx}* en Aliis:\n${url}`
      : `Te comparto una explicación médica en Aliis:\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function shareNative() {
    if (!url || !navigator.share) return
    navigator.share({
      title: dx ? `Explicación: ${dx}` : 'Explicación médica',
      text: dx ? `Mi explicación de ${dx} en Aliis` : 'Una explicación médica en Aliis',
      url,
    }).catch(() => undefined)
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="h-full flex items-center justify-center px-6">
    <div className="w-full max-w-[480px] text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Icon icon="solar:share-circle-bold-duotone" width={24} className="text-primary" />
      </div>

      <h1 className="font-serif text-[30px] tracking-[-0.02em] mb-2">
        Compartir explicación
      </h1>
      {dx && (
        <p className="font-serif italic text-muted-foreground text-[16px] mb-3 leading-snug">
          {dx}
        </p>
      )}
      <p className="font-sans text-[14px] text-muted-foreground leading-relaxed mb-8">
        Cualquier persona con este enlace puede ver tu explicación durante 30 días, sin necesidad de cuenta.
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60 font-sans text-[14px]">
          <Icon icon="solar:refresh-bold-duotone" width={16} className="animate-spin" />
          Generando enlace…
        </div>
      ) : denied ? (
        <div className="font-sans text-[14px] text-destructive">
          No tienes permiso para compartir esta explicación.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* URL row */}
          <div className="flex gap-2">
            <input
              readOnly
              value={url ?? ''}
              onClick={(e) => e.currentTarget.select()}
              className="flex-1 px-3.5 py-2.5 rounded-[10px] border border-border bg-muted font-mono text-[12px] text-foreground outline-none cursor-text truncate"
            />
            <button
              onClick={copy}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] border font-sans text-[13px] font-medium cursor-pointer transition-all duration-200',
                copied
                  ? 'bg-primary border-primary text-white'
                  : 'bg-muted border-border text-foreground hover:bg-muted/80'
              )}
            >
              <Icon
                icon={copied ? 'solar:check-circle-bold-duotone' : 'solar:copy-bold-duotone'}
                width={15}
              />
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={shareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] bg-[#25D366] text-white font-sans text-[14px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity"
            >
              <Icon icon="solar:chat-round-bold-duotone" width={18} />
              WhatsApp
            </button>

            {hasNativeShare && (
              <button
                onClick={shareNative}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] bg-muted border border-border text-foreground font-sans text-[14px] font-medium cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <Icon icon="solar:upload-bold-duotone" width={18} />
                Compartir
              </button>
            )}
          </div>

          <p className="font-sans text-[11px] text-muted-foreground/50 mt-1">
            El enlace expira en 30 días.
          </p>
        </div>
      )}
    </div>
    </div>
  )
}
