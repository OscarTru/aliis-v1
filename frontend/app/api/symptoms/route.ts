import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { glucose, bp_systolic, bp_diastolic, heart_rate, weight, temperature, note } = body

  // Validate at least one numeric field
  const numericFields = { glucose, bp_systolic, bp_diastolic, heart_rate, weight, temperature }
  const hasNumeric = Object.values(numericFields).some(v => v !== undefined && v !== null && v !== '')
  if (!hasNumeric) {
    return Response.json({ error: 'Ingresa al menos un valor numérico' }, { status: 400 })
  }

  // Range validation
  if (glucose !== undefined && glucose !== null && (glucose < 1 || glucose > 1000)) {
    return Response.json({ error: 'Glucosa fuera de rango (1–1000)' }, { status: 400 })
  }
  if (bp_systolic !== undefined && bp_systolic !== null && (bp_systolic < 1 || bp_systolic > 300)) {
    return Response.json({ error: 'Tensión sistólica fuera de rango (1–300)' }, { status: 400 })
  }
  if (bp_diastolic !== undefined && bp_diastolic !== null && (bp_diastolic < 1 || bp_diastolic > 300)) {
    return Response.json({ error: 'Tensión diastólica fuera de rango (1–300)' }, { status: 400 })
  }
  if (heart_rate !== undefined && heart_rate !== null && (heart_rate < 1 || heart_rate > 300)) {
    return Response.json({ error: 'Frecuencia cardíaca fuera de rango (1–300)' }, { status: 400 })
  }
  if (weight !== undefined && weight !== null && (weight < 1 || weight > 500)) {
    return Response.json({ error: 'Peso fuera de rango (1–500)' }, { status: 400 })
  }
  if (temperature !== undefined && temperature !== null && (temperature < 30 || temperature > 45)) {
    return Response.json({ error: 'Temperatura fuera de rango (30–45)' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('symptom_logs')
    .insert([{
      user_id: user.id,
      glucose: glucose ?? null,
      bp_systolic: bp_systolic ?? null,
      bp_diastolic: bp_diastolic ?? null,
      heart_rate: heart_rate ?? null,
      weight: weight ?? null,
      temperature: temperature ?? null,
      note: note?.trim() || null,
    }])
    .select()
    .single()

  if (error) {
    return Response.json({ error: 'Error al guardar' }, { status: 500 })
  }

  return Response.json(data)
}
