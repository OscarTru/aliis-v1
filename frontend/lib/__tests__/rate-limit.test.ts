import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc: mockRpc }),
}))

beforeEach(() => {
  mockRpc.mockReset()
})

describe('rateLimit', () => {
  it('returns ok=true when count <= limit', async () => {
    mockRpc.mockResolvedValue({ data: 3, error: null })
    const { rateLimit } = await import('../rate-limit')
    const result = await rateLimit('test-key', 10, 60)
    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(7)
  })

  it('returns ok=false when count exceeds limit', async () => {
    mockRpc.mockResolvedValue({ data: 11, error: null })
    const { rateLimit } = await import('../rate-limit')
    const result = await rateLimit('test-key', 10, 60)
    expect(result.ok).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('fails open on RPC error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('RPC down') })
    const { rateLimit } = await import('../rate-limit')
    const result = await rateLimit('test-key', 10, 60)
    expect(result.ok).toBe(true)
  })
})

describe('getClientIp', () => {
  it('uses x-forwarded-for first header value', async () => {
    const { getClientIp } = await import('../rate-limit')
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', async () => {
    const { getClientIp } = await import('../rate-limit')
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    })
    expect(getClientIp(req)).toBe('9.9.9.9')
  })

  it('returns "unknown" when no headers present', async () => {
    const { getClientIp } = await import('../rate-limit')
    const req = new Request('http://localhost')
    expect(getClientIp(req)).toBe('unknown')
  })
})
