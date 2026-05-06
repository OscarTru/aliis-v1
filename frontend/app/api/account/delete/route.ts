import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  // Re-auth: require current password before wiping all data.
  // OAuth users (no password) skip this check — they already re-authenticated
  // via the OAuth flow and have no password to verify against.
  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* empty body ok */ }

  const password = typeof body.password === 'string' ? body.password : null
  const isPasswordUser = user.app_metadata?.provider === 'email'

  if (isPasswordUser) {
    if (!password) {
      return NextResponse.json({ error: 'Se requiere tu contraseña para confirmar.' }, { status: 400 })
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })
    if (signInError) {
      return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 403 })
    }
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // GDPR Art. 17 — right to erasure. Delete every table that holds user data.
  // Order: leaf tables first, then parents. Each .delete() is idempotent
  // (missing rows = no-op), so the loop never blocks on missing data.
  const tablesToWipe = [
    'pack_chats',
    'pack_notes',
    'chapter_reads',
    'consult_summaries',
    'tracked_symptoms',
    'symptom_logs',
    'adherence_logs',
    'aliis_insights',
    'notifications',
    'push_subscriptions',
    'medical_profiles',
    'treatments',
    'llm_usage',
    'packs',
  ] as const

  for (const table of tablesToWipe) {
    const { error } = await admin.from(table).delete().eq('user_id', user.id)
    if (error) {
      // Log and continue — best-effort deletion. Don't abort partial cleanup.
      console.error(`[account/delete] failed to delete from ${table}:`, error.message)
    }
  }

  // invite_codes uses `used_by` (not user_id). Anonymize instead of deleting
  // the row — keeps audit trail of code consumption without holding user FK.
  await admin.from('invite_codes').update({ used_by: null }).eq('used_by', user.id)

  // profiles last (FK target for many of the above already wiped)
  await admin.from('profiles').delete().eq('id', user.id)

  // Finally remove the auth.users record
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
