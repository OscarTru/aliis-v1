import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { PackView } from '@/components/PackView'
import type { Pack } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'

export default async function SharedPackPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServerSupabaseClient()

  const { data: row } = await supabase
    .from('packs')
    .select('*, profiles(name)')
    .eq('shared_token', token)
    .gt('shared_expires_at', new Date().toISOString())
    .single()

  if (!row) notFound()

  const pack: Pack = {
    id: row.id,
    dx: row.dx,
    for: 'yo',
    createdAt: row.created_at,
    summary: row.summary ?? '',
    chapters: row.chapters ?? [],
    references: row.refs ?? [],
  }

  const sharedByName = (row as { profiles?: { name?: string | null } }).profiles?.name

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        backdropFilter: 'blur(16px)',
        background: 'color-mix(in srgb, var(--c-bg) 78%, transparent)',
        borderBottom: '1px solid var(--c-border)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/assets/aliis-logo.png" alt="Aliis" width={26} height={26} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--c-text)' }}>Aliis</span>
        </Link>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-faint)' }}>
          {sharedByName ? `Compartido por ${sharedByName}` : 'Explicación compartida'} · aliis.app
        </div>
      </header>
      <PackView pack={pack} isPublic />
    </>
  )
}
