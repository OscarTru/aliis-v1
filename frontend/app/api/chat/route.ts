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
    userId,
    chapterId,
  } = await req.json()

  if (!question?.trim() || !dx) {
    return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 })
  }

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

Explicación completa del diagnóstico (todos los capítulos):
${packContext ?? chapterContent}

Capítulo activo (más relevante para esta pregunta):
${chapterContent}

Responde en español. Máximo 4 párrafos cortos.`

  let fullResponse = ''

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: question.trim() }],
  })

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

      if (packId && userId && chapterId) {
        try {
          const supabase = await createServerSupabaseClient()
          await supabase.from('pack_chats').insert([
            { pack_id: packId, user_id: userId, chapter_id: chapterId, role: 'user', text: question.trim() },
            { pack_id: packId, user_id: userId, chapter_id: chapterId, role: 'assistant', text: fullResponse },
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
