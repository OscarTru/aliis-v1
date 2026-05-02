import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}))

beforeEach(() => {
  mockInsert.mockReset()
  mockInsert.mockResolvedValue({ data: null, error: null })
})

describe('logLlmUsage', () => {
  it('inserts usage row with token counts', async () => {
    const { logLlmUsage } = await import('../llm-usage')
    await logLlmUsage({
      userId: 'user-123',
      endpoint: 'aliis_insight',
      model: 'claude-haiku-4-5-20251001',
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 200,
        cache_creation_input_tokens: 0,
      },
    })
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      endpoint: 'aliis_insight',
      model: 'claude-haiku-4-5-20251001',
      input_tokens: 100,
      output_tokens: 50,
      cache_read_tokens: 200,
      cache_creation_tokens: 0,
    })
  })

  it('uses defaults when usage missing', async () => {
    const { logLlmUsage } = await import('../llm-usage')
    await logLlmUsage({
      userId: null,
      endpoint: 'test',
      model: 'haiku',
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: null,
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_creation_tokens: 0,
      })
    )
  })

  it('swallows errors instead of throwing', async () => {
    const { logLlmUsage } = await import('../llm-usage')
    mockInsert.mockRejectedValue(new Error('DB down'))
    await expect(
      logLlmUsage({ userId: 'x', endpoint: 'y', model: 'z' })
    ).resolves.toBeUndefined()
  })
})
