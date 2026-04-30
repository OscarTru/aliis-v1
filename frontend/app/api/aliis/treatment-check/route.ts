import { generateText } from 'ai'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { models } from '@/lib/ai-providers'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const forceRefresh = searchParams.get('refresh') === '1'

  const { data: profileData } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profileData?.plan !== 'pro') {
    return Response.json({ error: 'Solo disponible para usuarios pro' }, { status: 403 })
  }

  // Cache check — valid for 30 days (skip if force refresh)
  if (!forceRefresh) {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: cached } = await supabase
      .from('aliis_insights')
      .select('content')
      .eq('user_id', user.id)
      .gte('generated_at', since30d)
      .contains('data_window', { type: 'treatment_check' })
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cached) {
      return Response.json(JSON.parse(cached.content))
    }
  }

  // Fetch data — treatments filtered to active only
  const [medRes, treatRes, packsRes] = await Promise.all([
    supabase
      .from('medical_profiles')
      .select('condiciones_previas')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('treatments')
      .select('name, dose, frequency')
      .eq('user_id', user.id)
      .eq('active', true),
    supabase
      .from('packs')
      .select('dx')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const condiciones: string[] = medRes.data?.condiciones_previas ?? []
  const tratamientos = treatRes.data ?? []
  const diagnosticos: string[] = packsRes.data?.map((p) => p.dx) ?? []

  if (condiciones.length === 0 && diagnosticos.length === 0 && tratamientos.length === 0) {
    return Response.json({ alerts: [], flags: [] })
  }

  // Build structured response from Claude
  interface Item { mensaje: string; tipo: 'dx_sin_tto' | 'tto_sin_dx'; dx?: string; tratamiento?: string }
  let result: { items: Item[] } = { items: [] }

  try {
    const { text } = await generateText({
      model: models.insight,
      maxOutputTokens: 600,
      system: `Eres Aliis, compañero de salud del paciente. Hablas de tú, con calidez y sin alarmar.
NUNCA diagnostiques. NUNCA recomiendes medicamentos específicos. NUNCA afirmes que algo es incorrecto.

Responde SOLO con JSON válido, sin markdown:
{
  "items": [
    {
      "mensaje": "mensaje conversacional para el paciente",
      "tipo": "dx_sin_tto | tto_sin_dx",
      "dx": "nombre del diagnóstico si aplica (solo para dx_sin_tto)",
      "tratamiento": "nombre del tratamiento si aplica (solo para tto_sin_dx)"
    }
  ]
}

Máximo 3 items. Cada item tiene UN mensaje Y su acción asociada (no los separes).

Situaciones a detectar:
- tipo "tto_sin_dx": tratamiento cuyo uso principal corresponde a una enfermedad no registrada (Ramipril→hipertensión, Atorvastatina→dislipidemia, Metformina→diabetes). El campo "tratamiento" es el nombre del medicamento.
- tipo "dx_sin_tto": diagnóstico que típicamente requiere tratamiento y no hay ninguno registrado. Para migraña u otros dolores episódicos, solo marca si no hay NINGÚN analgésico ni tratamiento prn. El campo "dx" es el nombre del diagnóstico.

Lenguaje cálido. Ej:
- { "mensaje": "Tomas Ramipril, que se usa para la hipertensión — pero no la veo en tu historial. Si es tu caso, agrégala para que todo esté claro.", "tipo": "tto_sin_dx", "tratamiento": "Ramipril" }
- { "mensaje": "Para tu migraña no tienes ningún tratamiento registrado. Si tomas algo cuando te duele, puedes agregarlo como 'por razón necesaria'.", "tipo": "dx_sin_tto", "dx": "Migraña" }

Si no hay discordancias, devuelve items:[].`,
      prompt: `Diagnósticos generados por Aliis: ${diagnosticos.length ? diagnosticos.join(' | ') : 'ninguno'}
Condiciones previas manuales: ${condiciones.length ? condiciones.join(' | ') : 'ninguna'}
Tratamientos activos: ${tratamientos.length ? tratamientos.map(t => `${t.name}${t.dose ? ' ' + t.dose : ''}${t.frequency === 'prn' ? ' (por razón necesaria)' : ''}`).join(' | ') : 'ninguno'}

Analiza y devuelve el JSON.`,
    })

    const cleaned = text.trim().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed.items)) {
      result = { items: parsed.items }
    }
  } catch {
    result = { items: [] }
  }

  // Save to cache
  await supabase.from('aliis_insights').insert({
    user_id: user.id,
    content: JSON.stringify(result),
    data_window: { type: 'treatment_check' },
  })

  return Response.json(result)
}
