import { anthropic } from '@/lib/anthropic'
import { generateText } from 'ai'
import { models } from '@/lib/ai-providers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { HAIKU_4_5 } from '@/lib/ai-models'
import { readPrompt } from '@/lib/prompts'

export async function POST(req: Request) {
  const {
    question,
    history,
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

  if (question.trim().length > 1000) {
    return new Response(JSON.stringify({ error: 'Pregunta demasiado larga' }), {
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

  const rl = await rateLimit(`user:${authenticatedUserId}:chat`, 30, 60)
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: 'Demasiados mensajes — espera un momento' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', authenticatedUserId)
    .single()
  const userPlan = profile?.plan ?? 'free'

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

  const referenceBlock = safePackContext
    ? `Explicación completa del diagnóstico (todos los capítulos):\n${safePackContext}\n\nCapítulo activo (más relevante):\n${safeChapterContent}`
    : `Contenido del capítulo:\n${safeChapterContent}`

  const system = readPrompt('chapter-chat', 'v1')
    .replaceAll('{{DX}}', dx)
    .replace('{{CHAPTER_TITLE}}', chapterTitle ?? '')
    .replace('{{REFERENCE_BLOCK}}', referenceBlock)

  // Build conversation history — cap at last 20 turns to stay within token limits
  const safeHistory = Array.isArray(history) ? history.slice(-20) : []
  const historyMessages = safeHistory
    .filter((m: { role: string; content: string }) =>
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' && m.content.trim()
    )
    .map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content.trim().slice(0, 2000),
    }))

  async function persistChat(text: string) {
    if (packId && chapterId && text) {
      try {
        await supabase.from('pack_chats').insert([
          { pack_id: packId, user_id: authenticatedUserId, chapter_id: chapterId, role: 'user', text: question.trim() },
          { pack_id: packId, user_id: authenticatedUserId, chapter_id: chapterId, role: 'assistant', text },
        ])
      } catch {
        // Non-fatal
      }
    }
  }

  const encoder = new TextEncoder()

  // Free plan: Gemini Flash (fast, no streaming needed at this latency)
  if (userPlan !== 'pro') {
    try {
      const { text } = await generateText({
        model: models.chatFree,
        system,
        messages: [...historyMessages, { role: 'user', content: question.trim() }],
        maxOutputTokens: 600,
      })
      await persistChat(text)
      const readable = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(text))
          controller.close()
        },
      })
      return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    } catch {
      return new Response(JSON.stringify({ error: 'Error al contactar la IA' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Pro plan: Anthropic Haiku with prompt caching + real streaming
  let stream
  try {
    stream = await anthropic.messages.stream({
      model: HAIKU_4_5,
      max_tokens: 600,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [...historyMessages, { role: 'user', content: question.trim() }],
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Error al contactar la IA' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let fullResponse = ''
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }
        }
      } catch (e) {
        controller.error(e)
      } finally {
        controller.close()
        await persistChat(fullResponse)
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
