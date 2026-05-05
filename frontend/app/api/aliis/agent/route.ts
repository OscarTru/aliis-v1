import { createServerSupabaseClient } from '@/lib/supabase-server'
import { anthropic, cachedSystem } from '@/lib/anthropic'
import { getPatientContext } from '@/lib/patient-context'
import { logLlmUsage } from '@/lib/llm-usage'
import { rateLimit } from '@/lib/rate-limit'
import { HAIKU_4_5 } from '@/lib/ai-models'
import { readPrompt } from '@/lib/prompts'
import type { AgentRequest, AgentResponse } from '@/lib/types'

const SCREEN_CONTEXT_PROMPTS: Record<string, string> = {
  diario:       'El usuario está revisando su diario de síntomas. Responde sobre síntomas, vitales y patrones recientes.',
  pack:         'El usuario está leyendo sobre su diagnóstico. Conecta el contenido del pack con su historial personal.',
  tratamientos: 'El usuario está en su página de tratamientos. Responde sobre adherencia, medicamentos y efectos.',
  historial:    'El usuario está revisando su historial de packs. Responde sobre su evolución y comprensión de su condición.',
  cuenta:       'El usuario está en su perfil. Responde sobre su plan de uso y funcionalidades disponibles.',
}

const RAG_KEYWORDS = [
  'cuántos', 'cuántas', 'cuándo', 'en enero', 'en febrero', 'en marzo', 'en abril',
  'en mayo', 'en junio', 'la semana pasada', 'el mes pasado', 'hace', 'días',
  'veces', 'dosis', 'olvidé', 'registré',
]

function needsRag(query: string): boolean {
  const q = query.toLowerCase()
  return RAG_KEYWORDS.some(kw => q.includes(kw))
}

function detectAction(text: string): AgentResponse['action'] | undefined {
  const t = text.toLowerCase()
  if (t.includes('resumen') && t.includes('consulta')) {
    return { label: 'Preparar resumen de consulta', endpoint: '/api/aliis/consult', method: 'POST' }
  }
  if (t.includes('diario')) {
    return { label: 'Ir al diario', endpoint: '/diario', method: 'GET' }
  }
  return undefined
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Solicitud inválida' }), { status: 400 })
  }

  const { query, history = [], screen_context, mode } = body as AgentRequest

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'query es requerido' }), { status: 400 })
  }
  if (query.length > 500) {
    return new Response(JSON.stringify({ error: 'query demasiado largo (máx 500 chars)' }), { status: 400 })
  }

  const rlKey = mode === 'contextual'
    ? `user:${user.id}:agent:contextual`
    : `user:${user.id}:agent:query`
  const rlMax = mode === 'contextual' ? 10 : 20
  const rl = await rateLimit(rlKey, rlMax, 3600)
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes — espera un momento' }), {
      status: 429,
      headers: { 'Retry-After': '3600' },
    })
  }

  const [{ summaryText }, profileRes] = await Promise.all([
    getPatientContext(user.id),
    supabase.from('profiles').select('name').eq('id', user.id).single(),
  ])
  const userName = profileRes.data?.name ?? null

  let ragContext = ''
  if (needsRag(query)) {
    const since90 = new Date(Date.now() - 90 * 86_400_000).toISOString()
    const [symptomsRes, adherenceRes] = await Promise.all([
      supabase.from('symptom_logs').select('logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, weight, note').eq('user_id', user.id).gte('logged_at', since90).order('logged_at', { ascending: false }).limit(200),
      supabase.from('adherence_logs').select('taken_date, medication, status').eq('user_id', user.id).gte('taken_date', since90.slice(0, 10)).order('taken_date', { ascending: false }).limit(200),
    ])
    ragContext = `\n\nDatos detallados (últimos 90 días):\nSíntomas/vitales: ${JSON.stringify(symptomsRes.data ?? [])}\nAdherencia: ${JSON.stringify(adherenceRes.data ?? [])}`
  }

  const screenHint = SCREEN_CONTEXT_PROMPTS[screen_context] ?? ''
  const userNameBlock = userName
    ? `"${userName}" — úsalo de forma natural, no en cada frase, solo cuando dé calidez`
    : 'desconocido — habla directamente con "tú", nunca "usted", nunca "el paciente"'

  const systemPrompt = readPrompt('aliis-agent', 'v1')
    .replace('{{USER_NAME_BLOCK}}', userNameBlock)
    .replace('{{PATIENT_CONTEXT}}', summaryText)
    .replace('{{SCREEN_HINT}}', screenHint)

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      let fullText = ''

      try {
        // Build message history — last 10 turns max to avoid token bloat
        const historyMessages = history.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const anthropicStream = anthropic.messages.stream({
          model: HAIKU_4_5,
          max_tokens: 500,
          system: cachedSystem(systemPrompt),
          messages: [
            ...historyMessages,
            { role: 'user', content: query + ragContext },
          ],
        })

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = event.delta.text
            fullText += chunk
            controller.enqueue(enc.encode(chunk))
          }
        }

        const finalMessage = await anthropicStream.finalMessage()
        const action = detectAction(fullText)

        // Send action as a final JSON sentinel line
        if (action) {
          controller.enqueue(enc.encode(`\n__ACTION__${JSON.stringify(action)}`))
        }

        // Log usage after stream completes
        await logLlmUsage({
          userId: user.id,
          endpoint: 'aliis_agent',
          model: HAIKU_4_5,
          usage: finalMessage.usage,
        })
      } catch {
        controller.enqueue(enc.encode('Hubo un error. Intenta de nuevo.'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
