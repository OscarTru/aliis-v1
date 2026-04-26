import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const { code } = body as { code?: string }
  if (!code?.trim()) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const supabase = await createServerSupabaseClient()

  // Get authenticated user from session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const normalized = code.trim().toUpperCase()

  const { data: invite } = await supabase
    .from('invite_codes')
    .select('id, used')
    .eq('code', normalized)
    .single()

  if (!invite || invite.used) {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  await supabase
    .from('invite_codes')
    .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
    .eq('id', invite.id)

  return NextResponse.json({ ok: true })
}
