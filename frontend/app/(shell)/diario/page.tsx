import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DiarioNotesSection } from '@/components/DiarioNotesSection'
import { SymptomsSection } from '@/components/SymptomsSection'
import { SymptomsTracker } from '@/components/SymptomsTracker'
import { AliisInsight } from '@/components/AliisInsight'
import { PushPermissionPrompt } from '@/components/PushPermissionPrompt'
import { CorrelationAnalysis } from '@/components/CorrelationAnalysis'
import { CapsulaDeTiempo } from '@/components/CapsulaDeTiempo'
import { ElHilo } from '@/components/ElHilo'
import { getTreatments } from '@/app/actions/treatments'
import { TreatmentsWidget } from '@/components/TreatmentsWidget'
import type { NoteWithPack, SymptomLog, TrackedSymptom, AdherenceLog } from '@/lib/types'
import { ScreenContextSetter } from '@/components/ScreenContextSetter'

export default async function DiarioPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const uid = user.id

  const [notesResult, symptomsResult, trackedResult, profileResult, adherenceFlagResult, adherenceLogsResult] = await Promise.all([
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
    supabase
      .from('tracked_symptoms')
      .select('*')
      .eq('user_id', uid)
      .order('last_seen_at', { ascending: false }),
    supabase.from('profiles').select('plan').eq('id', uid).single(),
    supabase.rpc('is_feature_enabled_for', {
      p_flag_name: 'adherence_checklist',
      p_user_id: uid,
    }),
    supabase
      .from('adherence_logs')
      .select('*')
      .eq('user_id', uid)
      .order('taken_date', { ascending: false })
      .limit(90),
  ])

  const todayDate = new Intl.DateTimeFormat('en-CA').format(new Date())

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
  const trackedSymptoms: TrackedSymptom[] = (trackedResult.data ?? []) as TrackedSymptom[]

  const userPlan: string = profileResult.data?.plan ?? 'free'
  const adherenceLogs: AdherenceLog[] = (adherenceLogsResult.data ?? []) as AdherenceLog[]

  // RPC returns boolean — server-side check that doesn't leak the user_ids[] allowlist.
  const showAdherence = adherenceFlagResult.data === true

  // Cápsula del tiempo — most recent this month
  const thisMonth = new Date().toISOString().slice(0, 7)
  const { data: capsulaData } = await supabase
    .from('aliis_insights')
    .select('content, generated_at')
    .eq('user_id', uid)
    .eq('type', 'capsula')
    .gte('generated_at', `${thisMonth}-01T00:00:00Z`)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const capsula = capsulaData ?? null

  // Medications from treatments table
  const treatments = await getTreatments()
  const medications = showAdherence
    ? treatments.map(t => t.dose ? `${t.name} ${t.dose}` : t.name)
    : []

  return (
    <div className="px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20 max-w-[1200px] mx-auto">
      <ScreenContextSetter value="diario" />
      {/* Page header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-1">
          Mi diario
        </p>
        <h1 className="font-serif text-[28px] leading-[1.2] text-foreground m-0">
          Tu <em>diario</em> de salud
        </h1>
      </div>

      {/* Push permission prompt — shown once if not yet granted */}
      <PushPermissionPrompt />

      {/* Cápsula del tiempo — full width, only when present */}
      {capsula && <CapsulaDeTiempo content={capsula.content} generatedAt={capsula.generated_at} />}

      {/* Two-column grid on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left column — main content */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Aliis insight */}
          <AliisInsight />

          {/* Symptoms + vitals */}
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <SymptomsSection initialLogs={logs} />
            <SymptomsTracker initialSymptoms={trackedSymptoms} logs={logs} />
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <DiarioNotesSection notes={notes} />
          </div>
        </div>

        {/* Right column — widgets */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Treatments widget with inline adherence chips */}
          <TreatmentsWidget
            treatments={treatments}
            initialTodayLogs={adherenceLogs.filter(l => l.taken_date === todayDate)}
            todayDate={todayDate}
          />

          {/* El Hilo */}
          <ElHilo userId={uid} />

          {/* Correlation analysis — Pro feature, upsell for free */}
          <CorrelationAnalysis userId={uid} userPlan={userPlan} />
        </div>

      </div>
    </div>
  )
}
