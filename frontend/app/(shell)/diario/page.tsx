import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DiarioNotesSection } from '@/components/DiarioNotesSection'
import { SymptomsSection } from '@/components/SymptomsSection'
import { SymptomsTracker } from '@/components/SymptomsTracker'
import { AliisInsight } from '@/components/AliisInsight'
import { PushPermissionPrompt } from '@/components/PushPermissionPrompt'
import { AdherenceWrapper } from '@/components/AdherenceWrapper'
import { CorrelationAnalysis } from '@/components/CorrelationAnalysis'
import type { NoteWithPack, SymptomLog, TrackedSymptom, AdherenceLog } from '@/lib/types'

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
    supabase
      .from('feature_flags')
      .select('enabled, rollout_pct, user_ids, plan_restriction')
      .eq('flag_name', 'adherence_checklist')
      .single(),
    supabase
      .from('adherence_logs')
      .select('*')
      .eq('user_id', uid)
      .order('taken_date', { ascending: false })
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
  const trackedSymptoms: TrackedSymptom[] = (trackedResult.data ?? []) as TrackedSymptom[]

  const userPlan: string = profileResult.data?.plan ?? 'free'
  const flag = adherenceFlagResult.data
  const adherenceLogs: AdherenceLog[] = (adherenceLogsResult.data ?? []) as AdherenceLog[]

  const showAdherence = (() => {
    if (!flag?.enabled) return false
    if (flag.plan_restriction && userPlan !== flag.plan_restriction) return false
    if (flag.user_ids?.includes(uid)) return true
    if (flag.rollout_pct >= 100) return true
    const hash = parseInt(uid.replace(/-/g, '').slice(-4), 16) % 100
    return hash < flag.rollout_pct
  })()

  // Medications from medical_profile (server-side fetch)
  let medications: string[] = []
  if (showAdherence) {
    const { data: medProfile } = await supabase
      .from('medical_profiles')
      .select('medicamentos')
      .eq('user_id', uid)
      .maybeSingle()
    medications = medProfile?.medicamentos ?? []
  }

  return (
    <div className="px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20 max-w-[1200px] mx-auto">
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

      {/* Aliis insight */}
      <AliisInsight />

      {/* Adherence checklist — Pro feature flag */}
      {showAdherence && medications.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 md:p-6 mb-6">
          <AdherenceWrapper medications={medications} initialLogs={adherenceLogs} />
        </div>
      )}

      {/* Correlation analysis — Pro only */}
      {userPlan === 'pro' && (
        <CorrelationAnalysis userId={uid} />
      )}

      {/* Symptoms + vitals — full width */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 mb-6">
        <SymptomsSection initialLogs={logs} />
        <SymptomsTracker initialSymptoms={trackedSymptoms} logs={logs} />
      </div>

      {/* Notes — full width below */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
        <DiarioNotesSection notes={notes} />
      </div>
    </div>
  )
}
