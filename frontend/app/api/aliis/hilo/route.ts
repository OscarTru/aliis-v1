import { generateText } from 'ai'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { models } from '@/lib/ai-providers'
import type { SymptomLog, TrackedSymptom } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  // Check monthly cache
  const thisMonth = new Date().toISOString().slice(0, 7)
  const { data: cached } = await supabase
    .from('aliis_insights')
    .select('content, generated_at')
    .eq('user_id', user.id)
    .eq('type', 'hilo')
    .gte('generated_at', `${thisMonth}-01T00:00:00Z`)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cached) return Response.json({ content: cached.content, generatedAt: cached.generated_at, cached: true })

  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [profileRes, packsRes, logsRes, trackedRes, medRes] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).single(),
    supabase.from('packs').select('dx, created_at').eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('symptom_logs').select('*').eq('user_id', user.id).gte('logged_at', since90).order('logged_at', { ascending: true }),
    supabase.from('tracked_symptoms').select('name, occurrences, resolved, needs_medical_attention').eq('user_id', user.id).order('first_seen_at', { ascending: true }),
    supabase.from('medical_profiles').select('medicamentos, condiciones_previas, edad, sexo').eq('user_id', user.id).maybeSingle(),
  ])

  const userName = profileRes.data?.name ?? 'tú'
  const packs = packsRes.data ?? []
  const logs = (logsRes.data ?? []) as SymptomLog[]
  const tracked = (trackedRes.data ?? []) as Pick<TrackedSymptom, 'name' | 'occurrences' | 'resolved' | 'needs_medical_attention'>[]
  const med = medRes.data

  if (packs.length === 0 && logs.length === 0) {
    return Response.json({ error: 'Aún no hay suficiente historia para generar El Hilo. Sigue registrando.' }, { status: 422 })
  }

  const avg = (vals: (number | null)[]): number | null => {
    const nums = vals.filter((v): v is number => v !== null)
    return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
  }

  const vitalsAvg = {
    glucose: avg(logs.map(l => l.glucose)),
    bp_systolic: avg(logs.map(l => l.bp_systolic)),
    bp_diastolic: avg(logs.map(l => l.bp_diastolic)),
    heart_rate: avg(logs.map(l => l.heart_rate)),
    weight: avg(logs.map(l => l.weight)),
  }

  const vitalsLines: string[] = []
  if (vitalsAvg.glucose !== null) vitalsLines.push(`Glucosa promedio: ${vitalsAvg.glucose} mg/dL`)
  if (vitalsAvg.bp_systolic !== null) vitalsLines.push(`Presión promedio: ${vitalsAvg.bp_systolic}/${vitalsAvg.bp_diastolic} mmHg`)
  if (vitalsAvg.heart_rate !== null) vitalsLines.push(`Frecuencia cardíaca promedio: ${vitalsAvg.heart_rate} bpm`)
  if (vitalsAvg.weight !== null) vitalsLines.push(`Peso promedio: ${vitalsAvg.weight} kg`)

  const dxLines = packs.map(p =>
    `- ${new Date(p.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}: ${p.dx}`
  ).join('\n')

  const activeSymptoms = tracked.filter(s => !s.resolved)
  const resolvedSymptoms = tracked.filter(s => s.resolved)

  const systemPrompt = `Eres Aliis, el agente de salud personal. Generas "El Hilo" — una narrativa longitudinal cálida y honesta que conecta la historia de salud del usuario.

El Hilo no es un resumen clínico. Es una narración en primera persona que ayuda al usuario a entender su trayectoria: de dónde viene, cómo ha evolucionado, y hacia dónde puede ir.

Reglas:
- Habla en segunda persona (tú, has, tienes)
- Primera persona para lo que observas ("he seguido", "noto que", "lo que me llama la atención")
- 4-6 oraciones. No más.
- Menciona diagnósticos específicos si los hay — no generalices
- Si hay síntomas resueltos: celébralo
- Si hay síntomas activos con atención médica: menciónalo con cuidado
- Conecta los puntos temporalmente: "cuando llegaste con X, ahora estás en Y"
- Tono: como un médico amigo que te ha acompañado durante meses
- Nunca diagnostiques ni recomiendes tratamientos
- Responde siempre en español`

  const medParts: string[] = []
  if (med?.edad) medParts.push(`${med.edad} años`)
  if (med?.sexo && med.sexo !== 'prefiero_no_decir') medParts.push(med.sexo)
  if (med?.condiciones_previas?.length) medParts.push(`Antecedentes: ${med.condiciones_previas.join(', ')}`)
  if (med?.medicamentos?.length) medParts.push(`Medicamentos: ${med.medicamentos.join(', ')}`)

  const userMessage = `Usuario: ${userName}
${medParts.length ? `Perfil: ${medParts.join(' | ')}` : ''}

DIAGNÓSTICOS (cronológico):
${dxLines || 'Sin diagnósticos registrados'}

SÍNTOMAS ACTIVOS (${activeSymptoms.length}):
${activeSymptoms.map(s => `- ${s.name} (${s.occurrences} veces${s.needs_medical_attention ? ', requiere atención' : ''})`).join('\n') || 'Ninguno'}

SÍNTOMAS RESUELTOS (${resolvedSymptoms.length}):
${resolvedSymptoms.map(s => `- ${s.name}`).join('\n') || 'Ninguno'}

SIGNOS VITALES (últimos 90 días, ${logs.length} registros):
${vitalsLines.join('\n') || 'Sin registros'}

Genera El Hilo para este usuario.`

  const { text } = await generateText({
    model: models.insight,
    system: systemPrompt,
    prompt: userMessage,
    maxOutputTokens: 250,
  })

  const content = text.trim()

  await supabase.from('aliis_insights').insert({
    user_id: user.id,
    content,
    type: 'hilo',
    data_window: { packs: packs.length, logs: logs.length, tracked: tracked.length },
  })

  return Response.json({ content, generatedAt: new Date().toISOString(), cached: false })
}
