import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones · Aliis',
  description: 'Términos y Condiciones de uso de Aliis, plataforma de educación médica de Cerebros Esponjosos.',
}

export default function TerminosPage() {
  return (
    <div className="max-w-[52rem] mx-auto px-6 py-16 md:py-24">
      <LegalHeader
        tag="Legal"
        title="Términos y Condiciones de Uso"
        version="Versión 1.0 · 26 de abril de 2026"
      />

      <LegalSection title="Información del titular">
        <LegalTable rows={[
          ['Empresa', 'Cerebros Esponjosos'],
          ['Producto', 'Aliis (marca registrada propiedad de Oscar Trujillo Reyes, producto de Cerebros Esponjosos)'],
          ['Representante legal', 'Oscar Trujillo Reyes'],
          ['Correo de contacto', 'trujilloreyesoscarmi@gmail.com'],
          ['Domicilio legal', 'Alemania'],
        ]} />
      </LegalSection>

      <LegalSection title="Descripción del servicio">
        <p>
          Aliis es una plataforma digital que utiliza inteligencia artificial para generar materiales educativos
          personalizados sobre diagnósticos médicos. El servicio permite introducir un diagnóstico médico recibido
          de un profesional de la salud y recibir un pack educativo con explicaciones en lenguaje accesible,
          consultar una biblioteca de condiciones médicas, y gestionar el historial de packs generados.
        </p>
        <p>
          <strong>Aliis no es un servicio médico.</strong> No proporciona diagnósticos, prescribe medicamentos,
          ni sustituye la consulta con un profesional de la salud. El contenido generado es exclusivamente
          educativo. Consulta el <a href="/disclaimer" className="text-primary underline underline-offset-4">Disclaimer Médico</a>.
        </p>
      </LegalSection>

      <LegalSection title="Acceso y registro">
        <LegalSubsection title="3.1 Cuenta de usuario">
          Para acceder a las funciones principales debes crear una cuenta con una dirección de correo válida.
          Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades
          realizadas bajo tu cuenta.
        </LegalSubsection>
        <LegalSubsection title="3.2 Edad mínima">
          Debes tener al menos 16 años para usar Aliis de forma independiente. Si eres menor de 16 años,
          necesitas el consentimiento de un tutor legal.
        </LegalSubsection>
        <LegalSubsection title="3.3 Veracidad de los datos">
          Al registrarte, te comprometes a proporcionar información veraz y actualizada. Aliis puede suspender
          cuentas con datos falsos o suplantación de identidad.
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="Planes y pagos">
        <LegalSubsection title="4.1 Plan gratuito (Free)">
          El plan gratuito permite generar hasta <strong>1 explicación por semana</strong> sin coste. Incluye
          acceso a la biblioteca de condiciones médicas.
        </LegalSubsection>
        <LegalSubsection title="4.2 Plan Pro">
          El plan Pro está disponible por <strong>€9,99 al mes</strong> (IVA incluido donde aplique) y ofrece
          generación ilimitada de packs educativos y funciones avanzadas de historial y exportación.
        </LegalSubsection>
        <LegalSubsection title="4.3 Facturación y renovación">
          El plan Pro se factura mensualmente de forma automática a través de <strong>Stripe</strong>. La
          renovación ocurre en la misma fecha de cada mes. Recibirás confirmación de pago por correo.
        </LegalSubsection>
        <LegalSubsection title="4.4 Cambios de precio">
          Aliis se reserva el derecho de modificar los precios con un aviso mínimo de <strong>30 días</strong>{' '}
          por correo electrónico. El nuevo precio se aplicará a partir del siguiente ciclo de facturación.
        </LegalSubsection>
        <LegalSubsection title="4.5 Derecho de desistimiento (usuarios en la UE)">
          De acuerdo con la Directiva 2011/83/UE, tienes derecho a desistir de la suscripción Pro dentro de
          los <strong>14 días naturales</strong> desde la contratación, siempre que no hayas hecho uso del
          servicio durante ese periodo. Para ejercerlo, envía un correo a trujilloreyesoscarmi@gmail.com.
        </LegalSubsection>
        <LegalSubsection title="4.6 Cancelación">
          Puedes cancelar tu suscripción Pro en cualquier momento desde la configuración de tu cuenta. La
          cancelación tiene efecto al final del período de facturación en curso. No se realizan reembolsos
          proporcionales por el período no utilizado, salvo que aplique el derecho de desistimiento.
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="Uso aceptable">
        <p>Al usar Aliis te comprometes a:</p>
        <ul className="legal-list">
          <li>Usar el servicio únicamente para fines educativos y personales.</li>
          <li>No introducir información de diagnósticos de terceros sin su consentimiento.</li>
          <li>No intentar extraer, copiar o redistribuir de forma masiva el contenido generado por la IA.</li>
          <li>No usar la Plataforma para actividades ilegales o que puedan causar daño a terceros.</li>
          <li>No intentar vulnerar los sistemas de seguridad o acceder a cuentas ajenas.</li>
          <li>No usar herramientas automatizadas (bots, scrapers) para acceder al servicio.</li>
        </ul>
        <p>
          Aliis puede suspender o eliminar cuentas que incumplan estas condiciones, sin previo aviso y sin
          derecho a reembolso.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer médico y limitación de responsabilidad">
        <p>
          Todo el contenido generado por Aliis tiene exclusivamente carácter informativo y educativo. No
          constituye diagnóstico médico, prescripción de tratamiento ni consejo médico personalizado.
          El contenido es generado mediante inteligencia artificial (modelos de Anthropic). El equipo incluye
          residentes médicos con formación en neurología, pero <strong>no actúan como médicos tratantes</strong>{' '}
          de los usuarios.
        </p>
        <p>
          Aliis no será responsable de decisiones médicas tomadas basándose en el contenido de la Plataforma,
          daños derivados del uso del servicio, ni errores en el contenido generado por IA. La responsabilidad
          máxima queda limitada al importe pagado por el usuario en los 12 meses anteriores al evento.
        </p>
        <LegalCallout type="emergency">
          Si estás experimentando una emergencia médica, llama inmediatamente a los servicios de emergencia
          (112 en Europa, 911 en México/Colombia/EE.UU.).
        </LegalCallout>
      </LegalSection>

      <LegalSection title="Propiedad intelectual">
        <p>
          La Plataforma, su diseño, código, la marca registrada <strong>Aliis</strong> (propiedad de Oscar
          Trujillo Reyes, producto de Cerebros Esponjosos), y la marca <strong>Cerebros Esponjosos</strong>{' '}
          están protegidos por las leyes de propiedad intelectual aplicables en Alemania y los países donde
          opera el servicio. Los packs educativos generados son de uso personal y no comercial del usuario.
        </p>
      </LegalSection>

      <LegalSection title="Ley aplicable y resolución de conflictos">
        <p>
          Estos Términos se rigen por la ley alemana. Cualquier disputa se someterá a los tribunales
          competentes de Alemania, sin perjuicio de los derechos irrenunciables de los consumidores en sus
          países de residencia.
        </p>
        <ul className="legal-list">
          <li><strong>España:</strong> No se limitan los derechos del Real Decreto Legislativo 1/2007 (LGDCU).</li>
          <li><strong>México:</strong> Se respetan los derechos de la Ley Federal de Protección al Consumidor. Puedes acudir a la <a href="https://www.profeco.gob.mx" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">PROFECO</a>.</li>
          <li><strong>Colombia:</strong> Se respeta el Estatuto del Consumidor (Ley 1480 de 2011). Puedes acudir a la <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">SIC</a>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          <strong>Correo:</strong> trujilloreyesoscarmi@gmail.com<br />
          <strong>Tiempo de respuesta estimado:</strong> 5 días hábiles
        </p>
      </LegalSection>
    </div>
  )
}

// ─── Shared Legal Components ───────────────────────────────────────────────────

function LegalHeader({ tag, title, version }: { tag: string; title: string; version: string }) {
  return (
    <div className="mb-12">
      <span className="font-mono text-xs tracking-widest uppercase text-primary block mb-3">{tag}</span>
      <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground mb-4">{title}</h1>
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">{version}</p>
    </div>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-sans font-semibold text-base tracking-tight text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="legal-prose">{children}</div>
    </section>
  )
}

function LegalSubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-sans font-medium text-sm text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}

function LegalTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-sm border-collapse mb-4">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-border last:border-0">
            <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap w-[10rem]">{label}</td>
            <td className="py-2.5 text-muted-foreground">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LegalCallout({ type, children }: { type: 'emergency' | 'info'; children: React.ReactNode }) {
  const styles = {
    emergency: 'bg-destructive/5 border-destructive/20 text-destructive',
    info: 'bg-primary/5 border-primary/20 text-primary',
  }
  return (
    <div className={`border rounded-lg px-4 py-3 mt-4 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  )
}
