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
    await resend.emails.send({
      from: 'Aliis <hola@aliis.app>',
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })
    return { ok: true as const }
  } catch (err) {
    console.error('Resend error:', err)
    return { ok: false as const, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
