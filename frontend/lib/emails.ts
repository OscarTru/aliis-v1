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
