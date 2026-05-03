'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/resend'
import { supportTicketEmail } from '@/lib/emails'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const SUPPORT_INBOX = 'hola@aliis.app'
const MAX_SUBJECT = 120
const MAX_MESSAGE = 4000
const MIN_MESSAGE = 10

export type SupportResult =
  | { ok: true }
  | { ok: false; error: string }

export async function sendSupportTicket(input: {
  subject: string
  message: string
}): Promise<SupportResult> {
  const subject = (input.subject ?? '').trim()
  const message = (input.message ?? '').trim()

  if (!subject) return { ok: false, error: 'Necesitas un asunto.' }
  if (subject.length > MAX_SUBJECT) return { ok: false, error: 'El asunto es demasiado largo.' }
  if (message.length < MIN_MESSAGE) return { ok: false, error: 'Cuéntanos un poco más para poder ayudarte.' }
  if (message.length > MAX_MESSAGE) return { ok: false, error: 'El mensaje es demasiado largo. Resúmelo si puedes.' }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }

  // Rate limit: max 3 tickets per user per hour. Prevents spam loops without
  // blocking someone with a genuine multi-question situation.
  const limit = await rateLimit(`user:${user.id}:support`, 3, 60 * 60)
  if (!limit.ok) {
    return {
      ok: false,
      error: 'Acabas de mandar varios tickets. Espera un momento antes de enviar otro.',
    }
  }

  // Read profile to determine plan + name.
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, name, last_name')
    .eq('id', user.id)
    .maybeSingle()

  const plan: 'free' | 'pro' = profile?.plan === 'pro' ? 'pro' : 'free'
  const fullName = [profile?.name, profile?.last_name].filter(Boolean).join(' ') || null
  const userEmail = user.email ?? ''

  const tpl = supportTicketEmail({
    plan,
    userId: user.id,
    email: userEmail,
    name: fullName,
    subject,
    message,
  })

  const send = await sendEmail({
    to: SUPPORT_INBOX,
    subject: tpl.subject,
    html: tpl.html,
    replyTo: tpl.replyTo,
  })

  if (!send.ok) {
    logger.error({ userId: user.id, plan, err: send.error }, 'support ticket failed to send')
    return { ok: false, error: 'No pudimos enviar tu mensaje. Intenta de nuevo en unos minutos.' }
  }

  logger.info({ userId: user.id, plan }, 'support ticket sent')
  return { ok: true }
}
