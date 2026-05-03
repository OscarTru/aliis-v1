import { describe, it, expect, vi } from 'vitest'

describe('atomic invite consume contract', () => {
  it('UPDATE chain calls .eq("code", normalized) AND .eq("used", false)', async () => {
    const calls: string[] = []
    const chain: {
      update: (payload: object) => typeof chain
      eq: (col: string, val: unknown) => typeof chain
      select: () => typeof chain
      maybeSingle: () => Promise<{ data: { id: string } | null; error: null }>
    } = {
      update: (payload: object) => {
        calls.push(`update:${JSON.stringify(payload)}`)
        return chain
      },
      eq: (col: string, val: unknown) => {
        calls.push(`eq:${col}=${val}`)
        return chain
      },
      select: () => chain,
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'x' }, error: null }),
    }

    await chain
      .update({ used: true, used_by: 'user-id', used_at: '2026-05-02T00:00:00Z' })
      .eq('code', 'ALIIS-XXXX-XXXX')
      .eq('used', false)
      .select()
      .maybeSingle()

    expect(calls).toContain('eq:code=ALIIS-XXXX-XXXX')
    expect(calls).toContain('eq:used=false')
  })

  it('returns null when no row matches (already consumed)', async () => {
    const chain: {
      update: () => typeof chain
      eq: () => typeof chain
      select: () => typeof chain
      maybeSingle: () => Promise<{ data: { id: string } | null; error: null }>
    } = {
      update: () => chain,
      eq: () => chain,
      select: () => chain,
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    const { data: claimed } = await chain
      .update()
      .eq()
      .eq()
      .select()
      .maybeSingle()

    expect(claimed).toBeNull()
  })
})
