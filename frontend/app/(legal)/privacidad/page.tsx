import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad · Aliis',
  description: 'Política de Privacidad v1.1 de Aliis. Retención de datos de salud, cifrado AES-256-GCM, soft delete con 30 días de gracia. GDPR, LOPDGDD, LFPDPPP y Ley 1581.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-[52rem] mx-auto px-6 py-16 md:py-24">
      <LegalHeader
        tag="Legal"
        title="Política de Privacidad — Aviso de Privacidad"
        version="Versión 1.1 · 6 de mayo de 2026"
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
          ['Correo', 'hola@cerebrosesponjosos.com'],
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
          Aliis recopila y procesa los siguientes datos de salud, que constituyen categoría especial bajo Art. 9 GDPR:
          (a) el texto de diagnóstico que introduces para generar un pack educativo — solo se retiene durante la generación;
          (b) los registros que introduces voluntariamente en el Diario de síntomas (síntomas, signos vitales, notas libres);
          (c) los tratamientos y medicamentos que registras;
          (d) el perfil médico (condiciones previas, alergias) que configuras voluntariamente;
          (e) las observaciones que el agente Aliis genera a partir de tus conversaciones, almacenadas cifradas con AES-256-GCM.
          Todos estos datos se tratan con las salvaguardas adicionales descritas en la sección 3 y los plazos de conservación de la sección 7.
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
          ['Groq (EE.UU.)', 'Clasificación de intención de consultas (modelo Llama) — SCC. Procesa el texto del diagnóstico antes de pasarlo al generador principal.'],
          ['Stripe (EE.UU.)', 'Procesamiento de pagos — PCI DSS + SCC'],
          ['Resend (EE.UU.)', 'Envío de correos transaccionales — SCC'],
          ['Vercel (EE.UU.)', 'Hosting y edge network — SCC'],
          ['Sentry (EE.UU.)', 'Monitoreo de errores — SCC. Los eventos se someten a un proceso de scrubbing automático para eliminar datos de salud antes de su envío.'],
          ['Google Analytics (EE.UU.)', 'Analítica web anonimizada — SCC (solo con consentimiento)'],
        ]} />
        <p className="text-sm text-muted-foreground">
          Todas las transferencias fuera del EEE se realizan bajo Cláusulas Contractuales Estándar (SCC)
          aprobadas por la Comisión Europea, lo que garantiza un nivel de protección adecuado conforme al
          GDPR, la LFPDPPP y la Ley 1581.
        </p>
      </LegalSection>

      <LegalSection title="Conservación de datos">
        <p className="text-sm text-muted-foreground mb-4">
          Los plazos a continuación son el máximo por categoría. Puedes solicitar la eliminación anticipada
          en cualquier momento desde Configuración → Eliminar cuenta, o escribiendo a hola@cerebrosesponjosos.com.
        </p>
        <LegalTable rows={[
          ['Datos de cuenta (email, nombre)', 'Mientras la cuenta esté activa. Tras solicitar la eliminación, se aplica un período de gracia de 30 días antes del borrado definitivo, durante el cual puedes cancelar la solicitud escribiéndonos.'],
          ['Historial de packs educativos', 'Mientras la cuenta esté activa, o hasta que solicites su eliminación.'],
          ['Registros de síntomas y signos vitales (symptom_logs)', 'Máximo 3 años desde la fecha del registro, o hasta que solicites su eliminación. Base legal Art. 5(1)(e) GDPR — limitación del plazo de conservación.'],
          ['Registros de adherencia a tratamientos (adherence_logs)', 'Máximo 3 años desde la fecha del registro, o hasta que solicites su eliminación.'],
          ['Perfil médico (diagnósticos, condiciones previas)', 'Mientras la cuenta esté activa. Se elimina junto con la cuenta.'],
          ['Memoria del agente Aliis (agent_memory)', 'Máximo 30 días por entrada (ventana deslizante automática). Los datos se almacenan cifrados con AES-256-GCM.'],
          ['Observaciones e insights del agente', 'Máximo 90 días desde su generación.'],
          ['Datos de pago (identificador Stripe)', 'Mientras la suscripción esté activa + según las obligaciones fiscales aplicables (generalmente 7 años).'],
          ['Datos técnicos y logs de acceso', 'Máximo 12 meses.'],
          ['Registro de accesos a datos de salud (audit log)', 'Máximo 90 días.'],
          ['Texto del diagnóstico (input para generación de packs)', 'Solo durante el proceso de generación — no se almacena de forma persistente.'],
        ]} />
        <p className="text-sm text-muted-foreground mt-3">
          <strong>Eliminación de cuenta:</strong> al solicitar la eliminación, tu cuenta y todos tus datos médicos
          quedan inmediatamente inaccesibles. El borrado definitivo de los servidores se completa en un máximo de
          30 días (período de gracia de recuperación). Transcurrido ese plazo, los datos se eliminan de forma
          permanente e irrecuperable, salvo los que deban conservarse por obligación legal (ej. datos fiscales).
        </p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <LegalSubsection title="8.1 Derechos GDPR (usuarios en la UE y España)">
          Tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, a la portabilidad, a limitar
          u oponerte al tratamiento, y a retirar el consentimiento en cualquier momento. Para ejercer
          cualquier derecho, escribe a hola@cerebrosesponjosos.com. Responderemos en el plazo máximo
          de 30 días. Puedes presentar una reclamación ante la autoridad supervisora de tu país.
        </LegalSubsection>
        <LegalSubsection title="8.2 Derechos ARCO (usuarios en México)">
          En términos de la LFPDPPP, tienes derecho de <strong>Acceso</strong> a tus datos personales,
          de <strong>Rectificación</strong> si son inexactos, de <strong>Cancelación</strong> (supresión
          de tus datos cuando dejen de ser necesarios), y de <strong>Oposición</strong> al tratamiento
          para finalidades específicas. Para ejercer tus derechos ARCO, envía una solicitud a
          hola@cerebrosesponjosos.com. Responderemos en un plazo de 20 días hábiles conforme al Art. 32 LFPDPPP.
        </LegalSubsection>
        <LegalSubsection title="8.3 Derechos del Titular (usuarios en Colombia)">
          En términos de la Ley 1581, tienes derecho a conocer, actualizar y rectificar tus datos;
          a solicitar prueba de la autorización otorgada; a ser informado sobre el uso de tus datos;
          a presentar quejas ante la SIC; a revocar la autorización y/o solicitar la supresión de tus
          datos; y a acceder gratuitamente a los mismos. Para ejercer estos derechos, escribe a
          hola@cerebrosesponjosos.com. Responderemos en un plazo de 10 días hábiles (consultas)
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
          Implementamos medidas técnicas y organizativas para proteger tus datos:
        </p>
        <LegalTable rows={[
          ['Cifrado en tránsito', 'TLS 1.3 en todas las comunicaciones. HSTS con preload activado.'],
          ['Cifrado en reposo', 'AES-256 a nivel de volumen (Supabase). Las observaciones del agente Aliis se cifran adicionalmente con AES-256-GCM a nivel de aplicación — ilegibles sin la clave, incluso con acceso directo a la base de datos.'],
          ['Control de acceso', 'Row Level Security (RLS) en PostgreSQL: cada usuario solo puede acceder a sus propios datos, incluso con credenciales de base de datos comprometidas.'],
          ['Autenticación', 'Supabase Auth con tokens JWT de corta duración y refresco automático. Tokens almacenados en iOS Keychain / Android Keystore en la app móvil.'],
          ['Audit log', 'Registro inmutable de accesos a datos de salud, conservado 90 días.'],
          ['Notificación de brechas', 'En caso de brecha de seguridad que afecte tus datos, te notificaremos en el plazo máximo de 72 horas desde su detección (Art. 33 GDPR).'],
        ]} />
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
          <strong>Correo:</strong> hola@cerebrosesponjosos.com<br />
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
