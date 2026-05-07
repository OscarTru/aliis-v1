import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Aliis <hola@cerebrosesponjosos.com>',
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })
    if (error) {
      console.error('Resend error:', error)
      return { ok: false as const, error: error.message }
    }
    console.log('Resend sent:', data?.id)
    return { ok: true as const }
  } catch (err) {
    console.error('Resend exception:', err)
    return { ok: false as const, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
