import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle, eq: mockEq }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
    rpc: vi.fn().mockResolvedValue({ data: 1, error: null }),
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ ok: true, remaining: 9, resetAt: new Date() }),
  getClientIp: vi.fn(() => '1.2.3.4'),
}))

beforeEach(() => {
  mockSingle.mockReset()
})

describe('POST /api/invite/validate', () => {
  it('returns 400 on invalid JSON body', async () => {
    const { POST } = await import('@/app/api/invite/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns valid:false when code does not exist', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'no rows' } })
    const { POST } = await import('@/app/api/invite/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'ALIIS-XXXX-XXXX' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(false)
  })

  it('returns valid:true when code is unused', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'invite-id', used: false }, error: null })
    const { POST } = await import('@/app/api/invite/validate/route')
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'ALIIS-OK01-OK02' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.id).toBe('invite-id')
  })
})
