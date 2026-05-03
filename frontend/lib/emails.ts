export function welcomeEmail(name?: string | null) {
  const greeting = name ? `Hola, ${name}` : 'Hola'
  return {
    subject: 'Bienvenido a Aliis',
    html: `<p>${greeting} — ya tienes acceso a Aliis.</p>
<p>Empieza con tu primera explicación en <a href="https://aliis.app/ingreso">aliis.app/ingreso</a>.</p>
<p>— El equipo de Cerebros Esponjosos</p>`,
  }
}

export function paymentConfirmationEmail(name?: string | null) {
  const greeting = name ? `Hola, ${name}` : 'Hola'
  return {
    subject: 'Tu suscripción Pro está activa',
    html: `<p>${greeting} — tu plan Pro ya está activo.</p>
<p>Tienes acceso a explicaciones ilimitadas. <a href="https://aliis.app/ingreso">Empieza ahora</a>.</p>
<p>Si tienes cualquier duda, responde a este email.</p>
<p>— El equipo de Cerebros Esponjosos</p>`,
  }
}

/* ─── Support tickets ─────────────────────────────────────────
 * Email sent to the support inbox when a user submits a ticket
 * from /cuenta. Subject is auto-tagged so we can filter Pro tickets
 * for prioritized response.
 */
export function supportTicketEmail({
  plan,
  userId,
  email,
  name,
  subject,
  message,
}: {
  plan: 'free' | 'pro'
  userId: string
  email: string
  name: string | null
  subject: string
  message: string
}) {
  const tag = plan === 'pro' ? '[PRO PRIORITARIO]' : '[FREE]'
  // Truncate the user-provided subject to keep email client previews readable.
  const trimmedSubject = subject.trim().slice(0, 80)
  const fullSubject = `${tag} ${trimmedSubject}`

  // Escape user input before embedding in HTML.
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const body = escape(message).replace(/\n/g, '<br>')
  const safeName = name ? escape(name) : '—'
  const safeEmail = escape(email)
  const safeSubject = escape(subject)

  const html = `<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:1.6;color:#0F1923;">
  <p style="margin:0 0 16px;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.15em;color:#666;">
    ${tag} · ${plan.toUpperCase()}
  </p>
  <h2 style="margin:0 0 18px;font-size:18px;line-height:1.3;">${safeSubject}</h2>
  <table style="border-collapse:collapse;margin-bottom:18px;font-size:13px;">
    <tr><td style="padding:3px 12px 3px 0;color:#666;">Plan</td><td style="padding:3px 0;"><strong>${plan.toUpperCase()}</strong></td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#666;">Nombre</td><td style="padding:3px 0;">${safeName}</td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#666;">Email</td><td style="padding:3px 0;"><a href="mailto:${safeEmail}" style="color:#1F8A9B;">${safeEmail}</a></td></tr>
    <tr><td style="padding:3px 12px 3px 0;color:#666;">User ID</td><td style="padding:3px 0;font-family:ui-monospace,monospace;font-size:11px;color:#666;">${userId}</td></tr>
  </table>
  <div style="border-left:3px solid #1F8A9B;padding:8px 14px;background:#f6f6f6;">
    ${body}
  </div>
  <p style="margin:18px 0 0;color:#999;font-size:12px;">
    Responde directamente a este email — la respuesta llegará a ${safeEmail}.
  </p>
</div>`

  return {
    subject: fullSubject,
    html,
    replyTo: email,
  }
}
