import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const ip = getClientIp(req)
  const rl = await rateLimit(`ip:${ip}:invite-validate`, 10, 60)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes — espera un minuto' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const b = body as Record<string, unknown>

  const code = typeof b.code === 'string' ? b.code.trim().toUpperCase() : ''
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  // READ-ONLY endpoint. Used to give users instant feedback while they type
  // their invite code, and as a pre-check before signup. The atomic claim
  // (UPDATE used=true, used_by=user.id) happens ONLY in /auth/callback once
  // we have a verified user.id — so if signup fails for any reason, the
  // code is not consumed, and we always have a proper audit trail.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('invite_codes')
    .select('id, used')
    .eq('code', code)
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false, error: 'Código no válido' }, { status: 200 })
  }

  if (data.used) {
    return NextResponse.json({ valid: false, error: 'Este código ya fue utilizado' }, { status: 200 })
  }

  return NextResponse.json({ valid: true, id: data.id }, { status: 200 })
}
