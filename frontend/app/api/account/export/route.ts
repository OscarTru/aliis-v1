import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GDPR Art. 15 — right of access. Returns a complete JSON dump of every
 * row across the database that belongs to the requesting user.
 *
 * Format: machine-readable JSON. Filename: aliis-export-<userId>-<date>.json
 * Rate limited to 5 exports/hour/user (heavy query, abuse prevention).
 */
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  // Rate limit: 5 exports per hour per user
  const rl = await rateLimit(`user:${user.id}:export`, 5, 3600)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Demasiadas exportaciones — intenta en una hora.' },
      { status: 429, headers: { 'Retry-After': '3600' } }
    )
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Tables that hold user-owned data. Each query is independent — Promise.all
  // for parallelism. Errors are logged but the export continues with partial data.
  const tableNames = [
    'profiles',
    'packs',
    'pack_chats',
    'pack_notes',
    'chapter_reads',
    'consult_summaries',
    'tracked_symptoms',
    'symptom_logs',
    'adherence_logs',
    'aliis_insights',
    'notifications',
    'medical_profiles',
    'treatments',
    'llm_usage',
  ] as const

  const queries = tableNames.map(async (table) => {
    // profiles uses `id` as PK, others use `user_id`
    const filterCol = table === 'profiles' ? 'id' : 'user_id'
    const { data, error } = await admin.from(table).select('*').eq(filterCol, user.id)
    if (error) {
      return [table, { error: error.message, rows: [] as unknown[] }] as const
    }
    return [table, { rows: (data ?? []) as unknown[] }] as const
  })

  const results = await Promise.all(queries)
  const dump: Record<string, { rows: unknown[]; error?: string }> = {}
  for (const [table, payload] of results) {
    dump[table] = { ...payload }
  }

  // Don't dump push_subscriptions raw (contains crypto keys). Replace with count + endpoint metadata.
  const { data: pushSubs } = await admin
    .from('push_subscriptions')
    .select('endpoint, created_at')
    .eq('user_id', user.id)
  dump.push_subscriptions = {
    rows: (pushSubs ?? []).map((s) => ({
      endpoint_host: new URL(s.endpoint).host,
      created_at: s.created_at,
    })),
  }

  const exportPayload = {
    schema_version: 1,
    exported_at: new Date().toISOString(),
    user_id: user.id,
    user_email: user.email ?? null,
    note:
      'Este archivo contiene todos tus datos almacenados en Aliis a la fecha de exportación. ' +
      'Cumple con el derecho de acceso GDPR Art. 15, LFPDPPP Art. 23, Ley 1581 Art. 8(b).',
    data: dump,
  }

  const filename = `aliis-export-${user.id.slice(0, 8)}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
