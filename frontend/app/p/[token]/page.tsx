import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PackViewPublic } from '@/components/PackViewPublic'
import type { Pack } from '@/lib/types'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Block search engines from indexing token-shared packs (patient medical content).
export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

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
    conditionSlug: row.condition_slug ?? null,
    tools: row.tools ?? [],
  }

  const sharedByName = (row as { profiles?: { name?: string | null } }).profiles?.name

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="shrink-0 z-40 backdrop-blur-[16px] bg-background/80 border-b border-border px-6 py-[14px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-[10px] no-underline">
          <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} className="object-contain" />
        </Link>
        <div className="font-sans text-[13px] text-muted-foreground/60">
          {sharedByName ? `Compartido por ${sharedByName}` : 'Explicación compartida'} · aliis.app
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <PackViewPublic pack={pack} />
      </div>
    </div>
  )
}
