'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase'

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
    <AppShell>
      <main style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', marginBottom: 12 }}>
          Compartir explicación
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Cualquier persona con este enlace puede ver tu explicación durante 30 días. Sin necesidad de cuenta.
        </p>
        {loading ? (
          <div className="ce-pulse" style={{ fontFamily: 'var(--font-sans)', color: 'var(--c-text-faint)' }}>
            Generando enlace…
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              readOnly
              value={url ?? ''}
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--c-border)', background: 'var(--c-surface)',
                fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--c-text)', outline: 'none',
              }}
            />
            <button
              onClick={copy}
              style={{
                padding: '12px 20px', borderRadius: 10,
                background: copied ? 'var(--c-brand-teal)' : 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                fontFamily: 'var(--font-sans)', fontSize: 14,
                color: copied ? '#fff' : 'var(--c-text)', cursor: 'pointer',
              }}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        )}
      </main>
    </AppShell>
  )
}
