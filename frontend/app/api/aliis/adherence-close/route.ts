import { createClient } from '@supabase/supabase-js'
import { verifyCronAuth } from '@/lib/cron-auth'
import { logger } from '@/lib/logger'

/**
 * Daily cron — runs early morning UTC (configured in vercel.json).
 *
 * For yesterday's date, fills in `status='missed'` rows for any scheduled
 * dose that has no `taken` log. After this runs, every (user, treatment,
 * slot, date) for fixed-dose treatments has an explicit row indicating
 * 'taken' or 'missed'. As-needed treatments (prn, as_needed, other) are
 * intentionally skipped — they don't have a fixed schedule.
 *
 * This unlocks longitudinal analytics: an agent can compute streaks,
 * weekday-specific drop-off patterns, and adherence % over arbitrary
 * windows by querying the rows directly.
 */

// Mirrors TreatmentsWidget.tsx — must match exactly so medication keys line up
const SCHEDULE_SLOTS: Record<string, string[]> = {
  once_daily:  ['M'],
  twice_daily: ['M', 'T'],
  three_daily: ['M', 'T', 'N'],
  four_daily:  ['M', 'MD', 'T', 'N'],
  // Excluded: prn, as_needed, other (no fixed schedule, not part of streak)
}

function slotKey(name: string, dose: string | null, slot: string): string {
  const base = dose ? `${name} ${dose}` : name
  return `${base} (${slot})`
}

interface TreatmentRow {
  user_id: string
  name: string
  dose: string | null
  frequency: string
  active: boolean
  started_at: string | null
}

interface AdherenceLogRow {
  user_id: string
  medication: string
}

export async function GET(req: Request) {
  const authError = verifyCronAuth(req)
  if (authError) return authError

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Yesterday's date in YYYY-MM-DD (UTC). The cron runs ~04:05 UTC, so
  // yesterday is fully closed across all timezones we serve.
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  // Fetch all active treatments with fixed schedules
  const { data: treatments, error: tErr } = await supabase
    .from('treatments')
    .select('user_id, name, dose, frequency, active, started_at')
    .eq('active', true)
    .in('frequency', Object.keys(SCHEDULE_SLOTS))

  if (tErr) {
    logger.error({ err: tErr }, 'adherence-close: failed to load treatments')
    return Response.json({ error: 'load_treatments_failed' }, { status: 500 })
  }
  if (!treatments || treatments.length === 0) {
    return Response.json({ inserted: 0, treatments: 0 })
  }

  const treatmentRows = treatments as TreatmentRow[]

  // Skip treatments that started after yesterday (they didn't apply yet)
  const applicable = treatmentRows.filter(t => !t.started_at || t.started_at <= yesterday)

  // Build the full set of expected (user, slot-key) pairs for yesterday
  const expected: Array<{ user_id: string; medication: string }> = []
  for (const t of applicable) {
    const slots = SCHEDULE_SLOTS[t.frequency] ?? []
    for (const slot of slots) {
      expected.push({ user_id: t.user_id, medication: slotKey(t.name, t.dose, slot) })
    }
  }
  if (expected.length === 0) {
    return Response.json({ inserted: 0, treatments: applicable.length })
  }

  // Fetch existing logs for yesterday — both taken and missed (idempotent retry safety)
  const userIds = [...new Set(expected.map(e => e.user_id))]
  const { data: existing, error: lErr } = await supabase
    .from('adherence_logs')
    .select('user_id, medication')
    .in('user_id', userIds)
    .eq('taken_date', yesterday)

  if (lErr) {
    logger.error({ err: lErr }, 'adherence-close: failed to load existing logs')
    return Response.json({ error: 'load_logs_failed' }, { status: 500 })
  }
  const existingSet = new Set(
    (existing as AdherenceLogRow[] | null ?? []).map(l => `${l.user_id}|${l.medication}`)
  )

  // Compute the missed rows to insert
  const missedRows = expected
    .filter(e => !existingSet.has(`${e.user_id}|${e.medication}`))
    .map(e => ({
      user_id: e.user_id,
      medication: e.medication,
      taken_date: yesterday,
      status: 'missed' as const,
    }))

  if (missedRows.length === 0) {
    return Response.json({ inserted: 0, treatments: applicable.length, expected: expected.length })
  }

  // Insert in chunks of 500 to be polite to PostgREST
  let inserted = 0
  for (let i = 0; i < missedRows.length; i += 500) {
    const chunk = missedRows.slice(i, i + 500)
    const { error } = await supabase
      .from('adherence_logs')
      .insert(chunk)
    if (error) {
      logger.error({ err: error, chunkSize: chunk.length }, 'adherence-close: insert failed')
    } else {
      inserted += chunk.length
    }
  }

  logger.info(
    { inserted, treatments: applicable.length, expected: expected.length, date: yesterday },
    'adherence-close cron complete'
  )
  return Response.json({ inserted, treatments: applicable.length, expected: expected.length, date: yesterday })
}
