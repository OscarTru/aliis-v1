import { createServerSupabaseClient } from '@/lib/supabase-server'

function parseNumeric(v: unknown, label: string, lo: number, hi: number): number | null {
  if (v === undefined || v === null) return null
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new RangeError(`${label} debe ser un número válido`)
  }
  if (v < lo || v > hi) {
    throw new RangeError(`${label} fuera de rango (${lo}–${hi})`)
  }
  return v
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('auth error:', authError)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Request body inválido' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Request body inválido' }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  let glucose: number | null
  let bp_systolic: number | null
  let bp_diastolic: number | null
  let heart_rate: number | null
  let weight: number | null
  let temperature: number | null

  try {
    glucose = parseNumeric(b.glucose, 'Glucosa', 1, 1000)
    bp_systolic = parseNumeric(b.bp_systolic, 'Tensión sistólica', 1, 300)
    bp_diastolic = parseNumeric(b.bp_diastolic, 'Tensión diastólica', 1, 300)
    heart_rate = parseNumeric(b.heart_rate, 'Frecuencia cardíaca', 1, 300)
    weight = parseNumeric(b.weight, 'Peso', 1, 500)
    temperature = parseNumeric(b.temperature, 'Temperatura', 30, 45)
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 })
  }

  const hasNumeric = [glucose, bp_systolic, bp_diastolic, heart_rate, weight, temperature].some(v => v !== null)
  if (!hasNumeric) {
    return Response.json({ error: 'Ingresa al menos un valor numérico' }, { status: 400 })
  }

  const noteStr = typeof b.note === 'string' ? b.note.trim().slice(0, 500) || null : null

  const { data, error } = await supabase
    .from('symptom_logs')
    .insert([{
      user_id: user.id,
      glucose,
      bp_systolic,
      bp_diastolic,
      heart_rate,
      weight,
      temperature,
      note: noteStr,
    }])
    .select()
    .single()

  if (error) {
    console.error('supabase error:', error)
    return Response.json({ error: 'Error al guardar' }, { status: 500 })
  }

  return Response.json(data)
}
