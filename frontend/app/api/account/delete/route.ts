import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { logPhiAccess } from '@/lib/phi-audit'

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

  logPhiAccess(user.id, '/api/account/delete', 'delete')

  // Soft delete: marca deleted_at ahora, purge_deleted_profiles() lo borrará en 30 días.
  // Permite recuperación ante eliminaciones accidentales o session hijack.
  // Los datos médicos quedan inaccesibles (RLS los filtra por profiles.deleted_at)
  // pero recuperables por soporte durante la ventana de gracia.
  const { error: softDeleteError } = await admin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id)

  if (softDeleteError) {
    return NextResponse.json({ error: softDeleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, grace_days: 30 })
}
