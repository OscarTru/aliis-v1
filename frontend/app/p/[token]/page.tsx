import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
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
      <header className="sticky top-0 z-40 backdrop-blur-[16px] bg-[color-mix(in_srgb,var(--c-bg)_78%,transparent)] border-b border-border px-6 py-[14px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-[10px] no-underline">
          <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} className="object-contain" />
        </Link>
        <div className="font-sans text-[13px] text-[color:var(--c-text-faint)]">
          {sharedByName ? `Compartido por ${sharedByName}` : 'Explicación compartida'} · aliis.app
        </div>
      </header>
      <PackView pack={pack} isPublic />
    </>
  )
}
