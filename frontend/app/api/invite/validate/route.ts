import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const code = typeof (body as Record<string, unknown>).code === 'string'
    ? ((body as Record<string, unknown>).code as string).trim().toUpperCase()
    : ''

  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
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
