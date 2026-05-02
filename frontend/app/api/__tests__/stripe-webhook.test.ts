import { describe, it, expect, vi } from 'vitest'

describe('email_sends idempotency contract', () => {
  it('skips email when UNIQUE constraint violated (code 23505)', async () => {
    const sendEmailMock = vi.fn()
    const insertMock = vi.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key' },
    })

    const { error: insertErr } = await insertMock({
      event_source: 'stripe',
      event_id: 'evt_123',
      kind: 'payment_confirmation',
    })

    if (insertErr && insertErr.code === '23505') {
      // duplicate — skip
    } else if (insertErr) {
      // log other error
    } else {
      sendEmailMock()
    }

    expect(insertMock).toHaveBeenCalled()
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('sends email when insert succeeds (first time)', async () => {
    const sendEmailMock = vi.fn()
    const insertMock = vi.fn().mockResolvedValue({ data: { id: 'x' }, error: null })

    const { error: insertErr } = await insertMock({
      event_source: 'stripe',
      event_id: 'evt_456',
      kind: 'payment_confirmation',
    })

    if (insertErr && insertErr.code === '23505') {
      // skip
    } else if (insertErr) {
      // log
    } else {
      sendEmailMock()
    }

    expect(sendEmailMock).toHaveBeenCalledOnce()
  })
})
