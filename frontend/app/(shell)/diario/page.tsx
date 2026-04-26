import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PageHeader } from '@/components/PageHeader'
import { DiarioNotesSection } from '@/components/DiarioNotesSection'
import { SymptomsSection } from '@/components/SymptomsSection'
import type { NoteWithPack, SymptomLog } from '@/lib/types'

export default async function DiarioPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const uid = user.id

  const [notesResult, symptomsResult] = await Promise.all([
    supabase
      .from('pack_notes')
      .select('id, pack_id, content, created_at, packs!inner(dx, created_at)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false }),
    supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', uid)
      .order('logged_at', { ascending: false })
      .limit(90),
  ])

  const notes: NoteWithPack[] = (notesResult.data ?? []).map((row: {
    id: string
    pack_id: string
    content: string
    created_at: string
    packs: { dx: string; created_at: string } | { dx: string; created_at: string }[]
  }) => {
    const pack = Array.isArray(row.packs) ? row.packs[0] : row.packs
    return {
      id: row.id,
      pack_id: row.pack_id,
      content: row.content,
      created_at: row.created_at,
      dx: pack?.dx ?? '',
      pack_created_at: pack?.created_at ?? row.created_at,
    }
  })

  const logs: SymptomLog[] = (symptomsResult.data ?? []) as SymptomLog[]

  return (
    <div className="max-w-[680px] mx-auto px-8 pt-10 pb-20">
      <PageHeader
        eyebrow="Mi diario"
        title={<>Tu <em>diario</em> de salud</>}
      />
      <DiarioNotesSection notes={notes} />
      <SymptomsSection initialLogs={logs} />
    </div>
  )
}
