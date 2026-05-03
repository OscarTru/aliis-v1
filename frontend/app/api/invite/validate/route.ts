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

  // claim=true: atomically mark the code as used in the same request.
  // Used during the final signup submit so the code is consumed before
  // signUp() is called — no session required, no fire-and-forget race.
  const claim = b.claim === true

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (claim) {
    // Atomic UPDATE: only succeeds if used=false right now.
    // If two requests race, only one UPDATE touches a row.
    const { data: claimed } = await supabase
      .from('invite_codes')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('code', code)
      .eq('used', false)
      .select('id')
      .maybeSingle()

    if (!claimed) {
      return NextResponse.json({ valid: false, error: 'Este código ya fue utilizado' }, { status: 200 })
    }
    return NextResponse.json({ valid: true, id: claimed.id }, { status: 200 })
  }

  // Non-claiming check (real-time debounce while user types)
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
