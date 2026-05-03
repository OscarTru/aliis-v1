import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies · Aliis',
  description: 'Política de Cookies de Aliis. Qué cookies usamos, para qué sirven y cómo controlarlas bajo el GDPR y la Directiva ePrivacy.',
}

export default function CookiesPage() {
  return (
    <div className="max-w-[52rem] mx-auto px-6 py-16 md:py-24">
      <LegalHeader
        tag="Legal"
        title="Política de Cookies"
        version="Versión 1.0 · 26 de abril de 2026"
      />

      <LegalSection title="¿Qué es una cookie?">
        <p>
          Una cookie es un pequeño archivo de texto que se almacena en tu dispositivo cuando visitas un
          sitio web. Las cookies permiten que el sitio recuerde información sobre tu visita —como tu
          sesión iniciada— para mejorar la experiencia de uso. Esta política se aplica conforme al
          <strong> GDPR</strong> y la <strong>Directiva ePrivacy</strong> de la Unión Europea.
        </p>
      </LegalSection>

      <LegalSection title="Cookies estrictamente necesarias">
        <p className="text-sm text-muted-foreground mb-3">
          Estas cookies son esenciales para que Aliis funcione. <strong>No requieren tu consentimiento.</strong>{' '}
          Sin ellas no podrías iniciar sesión ni navegar por el servicio.
        </p>
        <LegalCookieTable cookies={[
          { name: 'sb-auth-token', provider: 'Supabase', duration: 'Sesión / 1 hora (renovable)', purpose: 'Token de autenticación JWT. Mantiene tu sesión activa.' },
          { name: 'sb-refresh-token', provider: 'Supabase', duration: '60 días', purpose: 'Token de renovación de sesión. Evita que tengas que iniciar sesión cada hora.' },
          { name: '__Host-next-auth.*', provider: 'Next.js', duration: 'Sesión', purpose: 'Gestión de estado de sesión en el frontend.' },
          { name: 'aliis_cookie_consent', provider: 'Aliis', duration: '1 año', purpose: 'Almacena tus preferencias de consentimiento para no volverte a preguntar.' },
        ]} />
        <p className="text-xs text-muted-foreground">
          Base legal: Art. 6(1)(b) GDPR — ejecución del contrato / interés legítimo (funcionamiento técnico).
        </p>
      </LegalSection>

      <LegalSection title="Cookies de analítica">
        <p className="text-sm text-muted-foreground mb-3">
          Estas cookies nos ayudan a entender cómo se usa Aliis para mejorarlo.
          <strong> Requieren tu consentimiento.</strong> Toda la información recopilada es anonimizada o seudonimizada.
          Si no las aceptas, seguirás pudiendo usar Aliis con total funcionalidad.
        </p>
        <LegalCookieTable cookies={[
          { name: '_ga', provider: 'Google Analytics', duration: '2 años', purpose: 'Identificador anónimo de usuario para analítica de uso.' },
          { name: '_ga_[ID]', provider: 'Google Analytics', duration: '2 años', purpose: 'Almacena el estado de la sesión en GA4.' },
          { name: '_gid', provider: 'Google Analytics', duration: '24 horas', purpose: 'Distingue usuarios individuales en el mismo día.' },
        ]} />
        <p className="text-xs text-muted-foreground">
          Base legal: Art. 6(1)(a) GDPR — consentimiento.
        </p>
      </LegalSection>

      <LegalSection title="Cookies de terceros (pagos)">
        <p className="text-sm text-muted-foreground mb-3">
          Si te suscribes al plan Pro, Stripe establece cookies durante el proceso de pago. Se activan
          únicamente en el flujo de pago y son necesarias para procesar la transacción de forma segura.
        </p>
        <LegalCookieTable cookies={[
          { name: '__stripe_mid', provider: 'Stripe', duration: '1 año', purpose: 'Prevención de fraude en transacciones.' },
          { name: '__stripe_sid', provider: 'Stripe', duration: '30 minutos', purpose: 'Identificador de sesión durante el proceso de pago.' },
        ]} />
        <p className="text-xs text-muted-foreground">
          Base legal: Art. 6(1)(b) GDPR — ejecución del contrato.
        </p>
      </LegalSection>

      <LegalSection title="Lo que Aliis NO hace con cookies">
        <ul className="legal-list">
          <li>No usa cookies de rastreo publicitario o retargeting.</li>
          <li>No comparte datos de cookies con redes publicitarias.</li>
          <li>No usa cookies para crear perfiles de comportamiento con fines comerciales.</li>
          <li>No utiliza fingerprinting de dispositivo como alternativa a las cookies.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Almacenamiento local">
        <p>
          Además de cookies, Aliis puede usar el <strong>almacenamiento local del navegador</strong>{' '}
          (localStorage) para guardar preferencias de interfaz como el tema visual o el estado del
          panel lateral. Estos datos permanecen en tu dispositivo y no se envían a nuestros servidores.
        </p>
      </LegalSection>

      <LegalSection title="Cómo gestionar tus preferencias">
        <LegalSubsection title="6.1 Banner de consentimiento">
          Al visitar Aliis por primera vez, verás un banner que te permite aceptar todas las cookies,
          usar solo las necesarias, o personalizar categoría por categoría. Puedes cambiar tus preferencias
          en cualquier momento desde el enlace "Preferencias de cookies" en el pie de página.
        </LegalSubsection>
        <LegalSubsection title="6.2 Configuración del navegador">
          También puedes gestionar o eliminar cookies directamente desde tu navegador. Ten en cuenta
          que bloquear todas las cookies puede impedir el correcto funcionamiento del inicio de sesión.
        </LegalSubsection>
        <div className="mt-2 mb-4">
          <LegalTable rows={[
            ['Chrome', 'Configuración → Privacidad y seguridad → Cookies y otros datos de sitios'],
            ['Firefox', 'Preferencias → Privacidad y seguridad → Cookies y datos del sitio'],
            ['Safari', 'Preferencias → Privacidad → Gestionar datos del sitio web'],
            ['Edge', 'Configuración → Privacidad, búsqueda y servicios → Cookies'],
          ]} />
        </div>
        <LegalSubsection title="6.3 Opt-out de Google Analytics">
          Puedes desactivar el seguimiento de Google Analytics instalando el complemento de inhabilitación
          en{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            tools.google.com/dlpage/gaoptout
          </a>.
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="Transferencias internacionales">
        <p>
          Google Analytics y Stripe están ubicados en Estados Unidos. La transferencia de datos a estos
          proveedores se realiza bajo <strong>Cláusulas Contractuales Estándar (SCC)</strong> aprobadas
          por la Comisión Europea, lo que garantiza un nivel de protección adecuado.
        </p>
      </LegalSection>

      <LegalSection title="Cambios en esta política">
        <p>
          Podemos actualizar esta Política cuando cambiemos las cookies que usamos. La fecha de "última
          actualización" refleja la versión vigente. Los cambios materiales se comunicarán mediante el
          banner de cookies.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          <strong>Correo:</strong> hola@cerebrosesponjosos.com<br />
          <strong>Asunto sugerido:</strong> "Cookies — [tu consulta]"
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
            <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap align-top w-[10rem]">{label}</td>
            <td className="py-2.5 text-muted-foreground">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface CookieRow {
  name: string
  provider: string
  duration: string
  purpose: string
}

function LegalCookieTable({ cookies }: { cookies: CookieRow[] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-3 text-left font-mono font-medium text-muted-foreground">Cookie</th>
            <th className="py-2 pr-3 text-left font-mono font-medium text-muted-foreground">Proveedor</th>
            <th className="py-2 pr-3 text-left font-mono font-medium text-muted-foreground">Duración</th>
            <th className="py-2 text-left font-mono font-medium text-muted-foreground">Propósito</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((c) => (
            <tr key={c.name} className="border-b border-border last:border-0">
              <td className="py-2.5 pr-3 font-mono text-foreground align-top">{c.name}</td>
              <td className="py-2.5 pr-3 text-muted-foreground align-top whitespace-nowrap">{c.provider}</td>
              <td className="py-2.5 pr-3 text-muted-foreground align-top whitespace-nowrap">{c.duration}</td>
              <td className="py-2.5 text-muted-foreground align-top">{c.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
