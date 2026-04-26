import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const {
    question,
    dx,
    chapterTitle,
    chapterContent,
    packContext,
    packId,
    chapterId,
  } = await req.json()

  if (!question?.trim() || !dx) {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fix 1 (Critical): Extract authenticated user from session — never trust userId from body.
  // The service-role Supabase client bypasses RLS, so we must verify identity server-side.
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const authenticatedUserId = user.id

  // Fix 2 (Critical): Validate and cap field lengths to prevent prompt injection / token abuse.
  // OWASP A03:2021 — Injection; A05:2021 — Security Misconfiguration (resource limits).
  if (typeof dx !== 'string' || dx.length > 500) {
    return new Response(JSON.stringify({ error: 'dx inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const safeChapterContent = (typeof chapterContent === 'string' ? chapterContent : '').slice(0, 8000)
  const safePackContext = typeof packContext === 'string' ? packContext.slice(0, 16000) : undefined

  const system = `Eres el consejero de salud de Aliis — una plataforma creada por médicos residentes de neurología para ayudar a pacientes a entender sus diagnósticos.

El paciente está leyendo su explicación completa sobre: ${dx}.
Capítulo activo: "${chapterTitle}".

Tu rol:
- Eres un médico residente de neurología que también es su amigo de confianza.
- Respondes SOLO preguntas relacionadas con su diagnóstico (${dx}) o su salud en general.
- Si preguntan algo fuera de su salud, rediriges amablemente: "Eso queda fuera de lo que puedo ayudarte, pero si tienes dudas sobre tu diagnóstico, con gusto te ayudo."
- Nunca diagnosticas ni modificas el diagnóstico existente.
- Nunca das dosis ni reemplazas la consulta médica — siempre refuerza consultar con su médico.
- Empiezas desde la experiencia del paciente, no desde definiciones de libro.
- Frases cortas. Una idea por párrafo. Sin lenguaje de IA ("es importante destacar", "en conclusión").
- Puedes referenciar cualquier parte de la explicación completa para dar contexto más rico.
- Al final de cada respuesta, si es natural, ofrece un tip práctico o una pregunta de seguimiento.
- NUNCA uses el guión largo (—). Para frases parentéticas usa paréntesis. Para continuar una cláusula usa coma.

${safePackContext
  ? `Explicación completa del diagnóstico (todos los capítulos):\n${safePackContext}\n\nCapítulo activo (más relevante para esta pregunta):\n${safeChapterContent}`
  : `Contenido del capítulo:\n${safeChapterContent}`
}

Responde en español. Máximo 4 párrafos cortos.`

  let fullResponse = ''

  // Fix 3 (Important): Wrap stream initialization in try/catch to return a clean 502
  // instead of an unhandled rejection if the Anthropic API is unreachable or returns an error.
  let stream
  try {
    stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: question.trim() }],
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Error al contactar la IA' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()

      // Fix 1 cont.: Persist using authenticatedUserId from session, not body-supplied userId.
      // Reuses the supabase instance created above — no redundant client instantiation.
      if (packId && chapterId) {
        try {
          await supabase.from('pack_chats').insert([
            { pack_id: packId, user_id: authenticatedUserId, chapter_id: chapterId, role: 'user', text: question.trim() },
            { pack_id: packId, user_id: authenticatedUserId, chapter_id: chapterId, role: 'assistant', text: fullResponse },
          ])
        } catch {
          // Non-fatal — stream succeeded, persistence failed silently
        }
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
