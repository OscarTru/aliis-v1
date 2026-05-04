import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(),
}))
vi.mock('@/lib/patient-context', () => ({
  getPatientContext: vi.fn(),
}))
vi.mock('@/lib/anthropic', () => ({
  anthropic: { messages: { create: vi.fn() } },
  cachedSystem: (s: string) => s,
}))
vi.mock('@/lib/llm-usage', () => ({ logLlmUsage: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ ok: true, remaining: 19, resetAt: new Date() }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/lib/ai-models', () => ({
  HAIKU_4_5: 'claude-haiku-4-5-20251001',
}))

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPatientContext } from '@/lib/patient-context'
import { anthropic } from '@/lib/anthropic'
import { rateLimit } from '@/lib/rate-limit'

function makeAuthedSupabase() {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [] }),
    }),
  }
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/aliis/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/aliis/agent', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.mocked(createServerSupabaseClient).mockResolvedValue(makeAuthedSupabase() as any)

    vi.mocked(getPatientContext).mockResolvedValue({
      summary: {
        condiciones: ['Migraña crónica'],
        tratamientos_activos: ['Topiramato 50mg'],
        adherencia_14d: 80,
        sintomas_frecuentes: ['cefalea'],
        vitales_recientes: {},
        proxima_cita: null,
        senales_alarma: [],
        patron_reciente: null,
        resumen_narrativo: 'Paciente con migraña crónica.',
        generated_at: new Date().toISOString(),
      },
      summaryText: 'Paciente con migraña crónica.',
    })

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Tu adherencia esta semana es buena.' }],
      usage: { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
    } as any)
  })

  it('devuelve 401 si no hay sesión', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('no session') }) },
    } as any)
    const { POST } = await import('../aliis/agent/route')
    const res = await POST(makeRequest({ query: 'hola', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(401)
  })

  it('devuelve 400 si query está vacío', async () => {
    const { POST } = await import('../aliis/agent/route')
    const res = await POST(makeRequest({ query: '', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(400)
  })

  it('devuelve 400 si query supera 500 chars', async () => {
    const { POST } = await import('../aliis/agent/route')
    const res = await POST(makeRequest({ query: 'a'.repeat(501), screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(400)
  })

  it('devuelve 200 con message y source cuando todo es correcto', async () => {
    const { POST } = await import('../aliis/agent/route')
    const res = await POST(makeRequest({ query: '¿cómo he estado esta semana?', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('message')
    expect(body).toHaveProperty('source')
    expect(typeof body.message).toBe('string')
    expect(body.message.length).toBeGreaterThan(0)
  })

  it('source es "summary" cuando la query no necesita RAG', async () => {
    const { POST } = await import('../aliis/agent/route')
    const res = await POST(makeRequest({ query: '¿cómo estoy?', screen_context: 'diario', mode: 'query' }))
    const body = await res.json()
    expect(body.source).toBe('summary')
  })

  it('devuelve 429 si se supera el rate limit', async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({ ok: false, remaining: 0, resetAt: new Date() })
    const { POST } = await import('../aliis/agent/route')
    const res = await POST(makeRequest({ query: '¿cómo estoy?', screen_context: 'diario', mode: 'query' }))
    expect(res.status).toBe(429)
  })
})
