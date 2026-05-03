import { Suspense } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PackList } from '@/components/PackList'
import { PageHeader } from '@/components/PageHeader'
import { UpgradeToast } from '@/components/UpgradeToast'
import { cn } from '@/lib/utils'
import { getMedicalProfile } from '@/app/actions/medical-profile'
import { MedicalProfileSection } from './MedicalProfileSection'
import { TreatmentCheckBanner } from './TreatmentCheckBanner'
import { CondicionSugerida } from './CondicionSugerida'
import type { Profile } from '@/lib/types'

type FilterKey = 'todos' | 'sin-leer' | 'a-medias' | 'leido'

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter = 'todos' } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [packsResult, readsResult, profileResult, medicalProfile, treatmentsResult] = await Promise.all([
    supabase
      .from('packs')
      .select('id, dx, summary, created_at, chapters')
      .eq('user_id', user?.id ?? '')
      .order('created_at', { ascending: false }),
    supabase
      .from('chapter_reads')
      .select('pack_id, chapter_id')
      .eq('user_id', user?.id ?? ''),
    supabase
      .from('profiles')
      .select('plan, who')
      .eq('id', user?.id ?? '')
      .single(),
    getMedicalProfile(),
    supabase
      .from('treatments')
      .select('name, dose')
      .eq('user_id', user?.id ?? '')
      .eq('active', true),
  ])

  const packs = packsResult.data ?? []
  const reads = readsResult.data ?? []
  const userPlan: Profile['plan'] = (profileResult.data?.plan as Profile['plan']) ?? 'free'
  const userWho = (profileResult.data?.who as Profile['who']) ?? null

  // Shared set for deduplication between widgets
  const packDxSet = new Set(packs.map(p => p.dx.toLowerCase().trim()))

  // "Sin explicación aún" — condiciones del perfil que todavía no tienen pack
  const condicionesSinPack = (medicalProfile?.condiciones_previas ?? []).filter(
    c => !packDxSet.has(c.toLowerCase().trim())
  )

  // Historial médico widget — packs generados + condiciones_previas sin duplicar
  const condicionesFromPacks = [
    ...packs.map(p => p.dx),
    ...(medicalProfile?.condiciones_previas ?? []).filter(
      c => !packDxSet.has(c.toLowerCase().trim())
    ),
  ]
  // Medicamentos = tabla treatments (capitalize name for display consistency)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const medicamentosFromTreatments = (treatmentsResult.data ?? []).map(t =>
    t.dose ? `${cap(t.name)} ${t.dose}` : cap(t.name)
  )

  const readsByPack = reads.reduce<Record<string, Set<string>>>((acc, r) => {
    if (!acc[r.pack_id]) acc[r.pack_id] = new Set()
    acc[r.pack_id].add(r.chapter_id)
    return acc
  }, {})

  const withProgress = packs.map((p) => {
    const total = Array.isArray(p.chapters) ? p.chapters.length : 5
    const read = readsByPack[p.id]?.size ?? 0
    const pct = total > 0 ? read / total : 0
    return { id: p.id, dx: p.dx, summary: p.summary, created_at: p.created_at, read, total, pct }
  })

  const filtered = withProgress.filter((p) => {
    if (filter === 'sin-leer') return p.pct === 0
    if (filter === 'a-medias') return p.pct > 0 && p.pct < 1
    if (filter === 'leido') return p.pct === 1
    return true
  })

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'sin-leer', label: 'Sin leer' },
    { key: 'a-medias', label: 'A medias' },
    { key: 'leido', label: 'Completados' },
  ]

  const totalPacks = packs.length

  return (
    <>
      <Suspense fallback={null}>
        <UpgradeToast />
      </Suspense>
      <div className="px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20 max-w-[1100px] mx-auto">

        <PageHeader
          eyebrow={`${totalPacks} ${totalPacks === 1 ? 'diagnóstico' : 'diagnósticos'}`}
          title={<>Mi <em>expediente</em></>}
        />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 md:gap-8 items-start">

          {/* Left column — filtros + lista de packs */}
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex gap-1.5 flex-wrap">
                {FILTERS.map((f) => (
                  <Link
                    key={f.key}
                    href={`/historial?filter=${f.key}`}
                    className={cn(
                      'px-4 py-1.5 rounded-full border font-sans text-[13px] no-underline transition-all duration-[120ms]',
                      filter === f.key
                        ? 'border-transparent bg-foreground text-background shadow-[var(--c-btn-primary-shadow)]'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>

            <CondicionSugerida condiciones={condicionesSinPack} who={userWho} />

            {packs.length === 0 && (
              <div className="text-center pt-16">
                <p className="font-serif italic text-[17px] text-muted-foreground mb-6 leading-relaxed">
                  Todavía no tienes explicaciones.<br />Empieza con tu primer diagnóstico.
                </p>
                <Link
                  href="/ingreso"
                  className="inline-block px-7 py-3 rounded-full bg-foreground text-background no-underline font-sans text-sm font-medium shadow-[var(--c-btn-primary-shadow)]"
                >
                  Entender mi diagnóstico
                </Link>
              </div>
            )}

            {packs.length > 0 && <PackList key={filter} initialPacks={filtered} />}
          </div>

          {/* Right column — historial médico */}
          <div className="md:sticky md:top-6">
            <MedicalProfileSection
              initialMedicalProfile={medicalProfile}
              condiciones={condicionesFromPacks}
              medicamentos={medicamentosFromTreatments}
              userPlan={userPlan}
            />
            <TreatmentCheckBanner userPlan={userPlan} />
          </div>

        </div>
      </div>
    </>
  )
}
