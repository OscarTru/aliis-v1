import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad · Aliis',
  description: 'Política de Privacidad y Aviso de Privacidad de Aliis. Cómo tratamos tus datos bajo GDPR, LOPDGDD, LFPDPPP y Ley 1581 de Colombia.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-[52rem] mx-auto px-6 py-16 md:py-24">
      <LegalHeader
        tag="Legal"
        title="Política de Privacidad — Aviso de Privacidad"
        version="Versión 1.0 · 26 de abril de 2026"
      />

      <LegalCallout type="info">
        Este documento es a la vez la <strong>Política de Privacidad</strong> conforme al GDPR y la LOPDGDD,
        y el <strong>Aviso de Privacidad</strong> requerido por la LFPDPPP mexicana (Art. 15). Para usuarios
        colombianos, también cumple con el deber de información de la Ley 1581 de 2012.
      </LegalCallout>

      <div className="mt-8 mb-8">
        <h3 className="font-sans font-semibold text-sm text-foreground mb-3">Normativas aplicables</h3>
        <LegalTable rows={[
          ['GDPR + ePrivacy', 'Unión Europea — Reglamento (UE) 2016/679'],
          ['LOPDGDD', 'España — Ley Orgánica 3/2018 de Protección de Datos'],
          ['LFPDPPP', 'México — Ley Federal de Protección de Datos Personales en Posesión de Particulares (2010) + Reglamento (2011)'],
          ['Ley 1581 / Decreto 1377', 'Colombia — Estatuto de Protección de Datos Personales (2012)'],
        ]} />
      </div>

      <LegalSection title="Responsable del tratamiento">
        <LegalTable rows={[
          ['Empresa', 'Cerebros Esponjosos'],
          ['Producto', 'Aliis (marca registrada propiedad de Oscar Trujillo Reyes)'],
          ['Representante legal / Responsable LFPDPPP / Responsable Ley 1581', 'Oscar Trujillo Reyes'],
          ['Correo', 'trujilloreyesoscarmi@gmail.com'],
          ['Domicilio legal', 'Alemania'],
        ]} />
        <p className="text-sm text-muted-foreground">
          Para usuarios mexicanos: la entidad que decide sobre el tratamiento de sus datos personales (Responsable
          en términos del Art. 3 LFPDPPP) es Cerebros Esponjosos, representada por Oscar Trujillo Reyes.
          Para usuarios colombianos: el Responsable del Tratamiento (Art. 3 Ley 1581) es Cerebros Esponjosos.
        </p>
      </LegalSection>

      <LegalSection title="Datos que recopilamos">
        <LegalSubsection title="2.1 Datos de cuenta">
          Dirección de correo electrónico al registrarte. Nombre o alias si lo proporcionas voluntariamente.
          Datos de uso: historial de packs generados, fecha de creación, configuración de tu cuenta.
        </LegalSubsection>
        <LegalSubsection title="2.2 Datos de salud (categoría especial)">
          El texto de diagnóstico que introduces para generar un pack educativo puede contener datos de
          salud (categoría especial bajo Art. 9 GDPR). Tratamos estos datos con las salvaguardas adicionales
          descritas en la sección 3. No almacenamos el texto original del diagnóstico más allá del tiempo
          necesario para generar el pack.
        </LegalSubsection>
        <LegalSubsection title="2.3 Datos de pago">
          Si te suscribes al plan Pro, Stripe procesa los datos de pago directamente. Aliis no almacena
          números de tarjeta ni información financiera. Conservamos el identificador de cliente de Stripe
          para gestionar la suscripción.
        </LegalSubsection>
        <LegalSubsection title="2.4 Datos técnicos">
          Dirección IP, tipo de navegador, sistema operativo, páginas visitadas y tiempos de sesión.
          Recopilados de forma automática para el funcionamiento del servicio y analítica (con tu consentimiento).
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="Tratamiento de datos de salud">
        <LegalSubsection title="3.1 GDPR Art. 9 / LOPDGDD (usuarios en la UE y España)">
          El diagnóstico médico introducido constituye un dato de categoría especial bajo el Art. 9 GDPR.
          La base legal es tu consentimiento explícito (Art. 9(2)(a) GDPR), que otorgas al aceptar este
          aviso y usar la funcionalidad de generación de packs. Puedes retirar este consentimiento en
          cualquier momento. Hemos realizado una Evaluación de Impacto (DPIA, Art. 35 GDPR) dado el
          carácter sensible de los datos procesados.
        </LegalSubsection>
        <LegalSubsection title="3.2 LFPDPPP Art. 9 (usuarios en México)">
          El diagnóstico médico es un dato sensible en términos del Art. 3, fracción VI de la LFPDPPP.
          Su tratamiento requiere consentimiento expreso y por escrito (Art. 9 LFPDPPP), que otorgas de
          forma electrónica al usar la funcionalidad de generación de packs tras leer este Aviso. Aplicamos
          las medidas de seguridad requeridas por el Art. 19. Las transferencias internacionales de datos
          sensibles cumplen con el Art. 37 LFPDPPP mediante cláusulas contractuales con nuestros subprocesadores.
        </LegalSubsection>
        <LegalSubsection title="3.3 Ley 1581 Art. 6 + Decreto 1377/2013 (usuarios en Colombia)">
          El diagnóstico médico es un dato sensible en términos del Art. 5 de la Ley 1581. Su tratamiento
          requiere autorización previa, expresa e informada del Titular (Art. 6 Ley 1581 y Art. 6 Decreto
          1377/2013), que otorgas al usar la funcionalidad de generación de packs. Tienes derecho a revocar
          esta autorización en cualquier momento (Art. 8(h) Ley 1581). Las transferencias internacionales
          de datos sensibles se realizan con garantías adecuadas conforme al Art. 13 Ley 1581.
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="Finalidades del tratamiento">
        <ul className="legal-list">
          <li><strong>Prestación del servicio:</strong> generar packs educativos, mantener el historial, gestionar tu cuenta.</li>
          <li><strong>Pagos:</strong> procesar y gestionar suscripciones Pro a través de Stripe.</li>
          <li><strong>Comunicaciones:</strong> confirmaciones de pago, avisos de cambios en el servicio, soporte.</li>
          <li><strong>Analítica:</strong> mejorar la plataforma mediante datos de uso anonimizados (con tu consentimiento).</li>
          <li><strong>Obligaciones legales:</strong> cumplir con requerimientos de las autoridades competentes.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Bases legales (GDPR)">
        <LegalTable rows={[
          ['Ejecución del contrato (Art. 6(1)(b))', 'Gestión de cuenta, generación de packs, pagos'],
          ['Consentimiento (Art. 6(1)(a) y Art. 9(2)(a))', 'Datos de salud, cookies de analítica, comunicaciones de marketing'],
          ['Interés legítimo (Art. 6(1)(f))', 'Seguridad de la plataforma, prevención de fraude'],
          ['Obligación legal (Art. 6(1)(c))', 'Conservación de datos fiscales y de facturación'],
        ]} />
      </LegalSection>

      <LegalSection title="Subprocesadores y transferencias internacionales">
        <p>Aliis utiliza los siguientes proveedores que actúan como subprocesadores:</p>
        <LegalTable rows={[
          ['Supabase (EE.UU.)', 'Base de datos y autenticación — SCC (Cláusulas Contractuales Estándar)'],
          ['Anthropic (EE.UU.)', 'Generación de contenido con IA — SCC. No usa datos de la API para entrenar modelos.'],
          ['Stripe (EE.UU.)', 'Procesamiento de pagos — PCI DSS + SCC'],
          ['Resend (EE.UU.)', 'Envío de correos transaccionales — SCC'],
          ['Vercel (EE.UU.)', 'Hosting y edge network — SCC'],
          ['Google Analytics (EE.UU.)', 'Analítica web anonimizada — SCC (solo con consentimiento)'],
        ]} />
        <p className="text-sm text-muted-foreground">
          Todas las transferencias fuera del EEE se realizan bajo Cláusulas Contractuales Estándar (SCC)
          aprobadas por la Comisión Europea, lo que garantiza un nivel de protección adecuado conforme al
          GDPR, la LFPDPPP y la Ley 1581.
        </p>
      </LegalSection>

      <LegalSection title="Conservación de datos">
        <LegalTable rows={[
          ['Datos de cuenta', 'Mientras la cuenta esté activa + 30 días tras la eliminación'],
          ['Historial de packs', 'Mientras la cuenta esté activa, o hasta que solicites su eliminación'],
          ['Datos de pago (Stripe)', 'Según las obligaciones fiscales aplicables (generalmente 7 años)'],
          ['Datos técnicos y logs', 'Máximo 12 meses'],
          ['Texto del diagnóstico (input)', 'Solo durante el proceso de generación del pack — no se almacena'],
        ]} />
      </LegalSection>

      <LegalSection title="Tus derechos">
        <LegalSubsection title="8.1 Derechos GDPR (usuarios en la UE y España)">
          Tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, a la portabilidad, a limitar
          u oponerte al tratamiento, y a retirar el consentimiento en cualquier momento. Para ejercer
          cualquier derecho, escribe a trujilloreyesoscarmi@gmail.com. Responderemos en el plazo máximo
          de 30 días. Puedes presentar una reclamación ante la autoridad supervisora de tu país.
        </LegalSubsection>
        <LegalSubsection title="8.2 Derechos ARCO (usuarios en México)">
          En términos de la LFPDPPP, tienes derecho de <strong>Acceso</strong> a tus datos personales,
          de <strong>Rectificación</strong> si son inexactos, de <strong>Cancelación</strong> (supresión
          de tus datos cuando dejen de ser necesarios), y de <strong>Oposición</strong> al tratamiento
          para finalidades específicas. Para ejercer tus derechos ARCO, envía una solicitud a
          trujilloreyesoscarmi@gmail.com. Responderemos en un plazo de 20 días hábiles conforme al Art. 32 LFPDPPP.
        </LegalSubsection>
        <LegalSubsection title="8.3 Derechos del Titular (usuarios en Colombia)">
          En términos de la Ley 1581, tienes derecho a conocer, actualizar y rectificar tus datos;
          a solicitar prueba de la autorización otorgada; a ser informado sobre el uso de tus datos;
          a presentar quejas ante la SIC; a revocar la autorización y/o solicitar la supresión de tus
          datos; y a acceder gratuitamente a los mismos. Para ejercer estos derechos, escribe a
          trujilloreyesoscarmi@gmail.com. Responderemos en un plazo de 10 días hábiles (consultas)
          o 15 días hábiles (reclamos) conforme al Art. 14 Ley 1581.
        </LegalSubsection>
        <div className="mt-4">
          <h4 className="font-sans font-medium text-sm text-foreground mb-2">Autoridades supervisoras</h4>
          <LegalTable rows={[
            ['Alemania (responsable)', 'BfDI — Bundesbeauftragter für den Datenschutz und die Informationsfreiheit'],
            ['España', 'AEPD — Agencia Española de Protección de Datos (aepd.es)'],
            ['México', 'INAI — Instituto Nacional de Transparencia (inai.org.mx)'],
            ['Colombia', 'SIC — Superintendencia de Industria y Comercio (sic.gov.co)'],
          ]} />
        </div>
      </LegalSection>

      <LegalSection title="Seguridad">
        <p>
          Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (TLS),
          cifrado en reposo, acceso restringido por roles, autenticación segura vía Supabase Auth, y
          revisiones periódicas de seguridad. Sin embargo, ningún sistema es completamente infalible.
          Si detectamos una brecha de seguridad que afecte a tus datos, te notificaremos conforme a los
          plazos legales aplicables (72 horas para el GDPR).
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Usamos cookies estrictamente necesarias para el funcionamiento del servicio y cookies de analítica
          (Google Analytics) con tu consentimiento. Consulta nuestra{' '}
          <a href="/cookies" className="text-primary underline underline-offset-4">Política de Cookies</a>{' '}
          para más detalles.
        </p>
      </LegalSection>

      <LegalSection title="Cambios en esta política">
        <p>
          Podemos actualizar esta Política. Los cambios materiales se comunicarán por correo electrónico
          con al menos 30 días de antelación. La fecha de última actualización refleja la versión vigente.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          <strong>Correo:</strong> trujilloreyesoscarmi@gmail.com<br />
          <strong>Asunto sugerido:</strong> "Privacidad — [tu consulta o derecho]"<br />
          <strong>Tiempo de respuesta:</strong> 5–10 días hábiles (hasta 30 días para solicitudes GDPR,
          20 días hábiles para ARCO México, 10–15 días hábiles para Colombia)
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
            <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap align-top w-[12rem]">{label}</td>
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
    <div className={`border rounded-lg px-4 py-3 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  )
}
