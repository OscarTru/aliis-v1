import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { sendEmail } from '@/lib/resend'
import { welcomeEmail } from '@/lib/emails'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret) {
    // Fail closed — refuse all requests if webhook secret isn't configured.
    return new Response('Webhook not configured', { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Timing-safe compare to prevent secret enumeration via response timing.
  const expected = `Bearer ${secret}`
  const a = Buffer.from(authHeader)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Supabase sends { type: 'INSERT', table: 'users', record: { email, raw_user_meta_data, ... } }
  const payload = await request.json()

  if (payload.type === 'INSERT' && payload.table === 'users') {
    const email: string | undefined = payload.record?.email
    const name: string | null = payload.record?.raw_user_meta_data?.name ?? null

    if (email) {
      const { subject, html } = welcomeEmail(name)
      await sendEmail({ to: email, subject, html })
    }
  }

  return NextResponse.json({ ok: true })
}
