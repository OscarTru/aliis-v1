import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const NOTES_SYSTEM = `Eres el asistente educativo de Aliis. Tu tarea es generar un resumen de apuntes personales a partir de una conversación entre un paciente y el asistente de Aliis sobre su diagnóstico.

Los apuntes deben:
- Estar escritos en primera persona del paciente ("Aprendí que...", "Entendí que...", "Tengo que preguntar...")
- Capturar las dudas que el paciente expresó y las explicaciones clave que recibió
- Incluir al final una sección "Preguntas para llevar a mi médico" con las preguntas que surgieron
- Ser concisos: máximo 5 puntos de aprendizaje + máximo 3 preguntas para el médico
- Estar en español
- NO incluir consejos médicos, dosis ni tratamientos
- NUNCA usar el guión largo (—). Para frases parentéticas usa paréntesis.

Formato de salida — texto plano con estas secciones, sin markdown ni asteriscos:

LO QUE APRENDÍ
1. ...
2. ...
(máximo 5 puntos)

PREGUNTAS PARA MI MÉDICO
1. ...
2. ...
(máximo 3 preguntas)`

export async function POST(req: Request) {
  let body: { packId?: unknown; dx?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo de solicitud inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const { packId, dx } = body

  if (!packId || typeof packId !== 'string') {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const safeDx = typeof dx === 'string' ? dx.slice(0, 500) : undefined

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: packOwner } = await supabase
    .from('packs')
    .select('id')
    .eq('id', packId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!packOwner) {
    return new Response(JSON.stringify({ error: 'Pack no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Return existing note if already generated (1-per-pack limit for free tier)
  const { data: existingNote } = await supabase
    .from('pack_notes')
    .select('*')
    .eq('pack_id', packId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingNote) {
    return new Response(JSON.stringify({ content: existingNote.content, alreadyExists: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch all chat messages for this pack
  const { data: messages, error: messagesError } = await supabase
    .from('pack_chats')
    .select('role, text, created_at')
    .eq('pack_id', packId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(50)

  if (messagesError) {
    return new Response(JSON.stringify({ error: 'Error al obtener conversación' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const userMessages = (messages ?? []).filter((m) => m.role === 'user')
  if (userMessages.length < 3) {
    return new Response(JSON.stringify({ error: 'Necesitas al menos 3 preguntas para generar apuntes' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const conversationText = (messages ?? [])
    .map((m) => `${m.role === 'user' ? 'Paciente' : 'Aliis'}: ${m.text}`)
    .join('\n\n')

  const userPrompt = `Diagnóstico del paciente: ${safeDx ?? 'no especificado'}

Conversación:
${conversationText}`

  let noteContent: string
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: [{ type: 'text', text: NOTES_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')
    noteContent = textBlock.text.trim()
  } catch (err) {
    console.error('[notes/generate] Claude API error:', err)
    return new Response(JSON.stringify({ error: 'Error al generar apuntes' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Upsert — safe against race conditions
  const { data: inserted, error: insertError } = await supabase
    .from('pack_notes')
    .upsert({ pack_id: packId, user_id: user.id, content: noteContent }, { onConflict: 'pack_id,user_id' })
    .select()
    .single()

  if (insertError) {
    return new Response(JSON.stringify({ error: 'Error al guardar apuntes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ content: inserted.content }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
