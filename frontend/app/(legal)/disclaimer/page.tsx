import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer Médico · Aliis',
  description: 'Aliis es una plataforma educativa, no un servicio médico. Lee el disclaimer completo antes de usar la plataforma.',
}

export default function DisclaimerPage() {
  return (
    <div className="max-w-[52rem] mx-auto px-6 py-16 md:py-24">
      <LegalHeader
        tag="Aviso importante"
        title="Disclaimer Médico"
        version="Versión 1.0 · 26 de abril de 2026"
      />

      <LegalCallout type="emergency">
        <strong>Si estás en una emergencia médica, deja de leer y llama ahora:</strong>
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
          <span>🇪🇸 España: <strong>112</strong></span>
          <span>🇲🇽 México: <strong>911</strong></span>
          <span>🇨🇴 Colombia: <strong>123</strong></span>
          <span>🇦🇷 Argentina: <strong>107 / 911</strong></span>
          <span>Resto de Europa: <strong>112</strong></span>
        </div>
      </LegalCallout>

      <LegalSection title="Qué es Aliis y qué no es">
        <p>
          <strong>Aliis es una plataforma educativa. No es un médico, no actúa como médico y no reemplaza
          a ningún médico.</strong> Genera explicaciones educativas sobre diagnósticos médicos usando
          inteligencia artificial. El objetivo es ayudarte a <em>entender</em> lo que te han dicho en la
          consulta — no a reemplazar esa consulta.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-lg border border-border p-4">
            <p className="font-sans font-semibold text-sm text-primary mb-2">Lo que Aliis hace</p>
            <ul className="legal-list">
              <li>Traduce términos médicos a lenguaje comprensible.</li>
              <li>Explica mecanismos, causas, síntomas y tratamientos de forma educativa.</li>
              <li>Te da preguntas que puedes hacerle a tu médico.</li>
              <li>Te señala señales de alarma que merecen atención.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="font-sans font-semibold text-sm text-destructive mb-2">Lo que Aliis NO hace</p>
            <ul className="legal-list">
              <li><strong>No diagnostica.</strong> El contenido generado no es un diagnóstico médico.</li>
              <li><strong>No prescribe.</strong> Ninguna información constituye recomendación de tratamiento.</li>
              <li><strong>No reemplaza la consulta médica.</strong> La evaluación clínica presencial es insustituible.</li>
              <li><strong>No garantiza exactitud absoluta.</strong> La IA puede contener errores.</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Sobre la inteligencia artificial y sus limitaciones">
        <p>
          El contenido de los packs educativos es generado por modelos de lenguaje de inteligencia
          artificial (Anthropic Claude). Estos modelos son herramientas poderosas para sintetizar y
          explicar información, pero tienen limitaciones importantes:
        </p>
        <ul className="legal-list">
          <li>
            <strong>No conocen tu historial médico completo.</strong> Solo procesan el texto de diagnóstico
            que introduces, sin acceso a tu historia clínica, analíticas, imágenes diagnósticas ni
            contexto personal.
          </li>
          <li>
            <strong>Pueden cometer errores.</strong> Los modelos de IA pueden generar información incorrecta,
            desactualizada o inapropiada para tu caso específico (lo que técnicamente se llama "alucinación").
          </li>
          <li>
            <strong>No tienen contexto clínico.</strong> Un diagnóstico idéntico puede tener implicaciones
            completamente distintas dependiendo de la edad, el sexo, las comorbilidades, los medicamentos
            actuales y decenas de otros factores que solo tu médico conoce.
          </li>
          <li>
            <strong>No sustituyen el juicio clínico.</strong> La medicina combina conocimiento científico
            con experiencia clínica, observación directa y relación terapéutica. Ninguna IA puede replicar eso.
          </li>
        </ul>
        <p>
          Por estas razones, <strong>todo el contenido generado por Aliis debe interpretarse como un punto
          de partida para la conversación con tu médico, no como una conclusión definitiva.</strong>
        </p>
      </LegalSection>

      <LegalSection title="Sobre el equipo de Aliis">
        <p>
          Aliis es una marca registrada, producto de <strong>Cerebros Esponjosos</strong>, empresa liderada
          por Oscar Trujillo Reyes, médico residente de neurología en Alemania. La formación médica del
          equipo informa el diseño de la plataforma y la calidad del contenido de la biblioteca estática.
        </p>
        <p>Sin embargo:</p>
        <ul className="legal-list">
          <li>El equipo de Aliis <strong>no actúa como médico tratante</strong> de los usuarios de la plataforma.</li>
          <li>La condición de residente médico implica formación en curso — no equivale a la habilitación completa como médico especialista.</li>
          <li>El contenido de los packs es generado por IA, no redactado manualmente por el equipo médico.</li>
          <li>Aliis no establece una relación médico-paciente con sus usuarios.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Variabilidad individual">
        <p>
          La medicina no es una ciencia exacta en el sentido de que los mismos síntomas, el mismo
          diagnóstico y el mismo tratamiento pueden producir resultados muy distintos en personas
          diferentes. Factores como la genética, la edad, el sexo biológico, otras condiciones de salud,
          medicamentos, estilo de vida, y muchos otros influyen en cómo se manifiesta y evoluciona
          cualquier condición.
        </p>
        <p>
          El contenido educativo de Aliis describe patrones generales basados en la evidencia científica
          disponible. No puede predecir, ni pretende predecir, cómo evolucionará tu caso particular.
        </p>
      </LegalSection>

      <LegalSection title="Poblaciones que requieren atención especial">
        <p>
          Es especialmente importante que cualquier información de salud —incluida la generada por Aliis—
          sea revisada y contextualizada por un profesional si perteneces a alguno de estos grupos:
        </p>
        <ul className="legal-list">
          <li><strong>Embarazo y lactancia:</strong> muchas recomendaciones estándar cambian significativamente.</li>
          <li><strong>Niños y adolescentes:</strong> dosis, síntomas esperados y tratamientos frecuentemente difieren en pediatría.</li>
          <li><strong>Adultos mayores:</strong> la polifarmacia y las comorbilidades hacen el manejo especialmente complejo.</li>
          <li><strong>Personas con condiciones crónicas múltiples:</strong> las interacciones requieren evaluación personalizada.</li>
          <li><strong>Personas con condiciones de salud mental:</strong> el contexto psiquiátrico afecta cómo se gestiona cualquier otro diagnóstico.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Qué hacer si tienes dudas o síntomas preocupantes">
        <ol className="list-decimal list-outside ml-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li><strong>Contacta a tu médico o especialista.</strong> Si tienes una consulta próxima, anota tus preguntas. Si no, busca una cita.</li>
          <li><strong>Llama a una línea de atención médica.</strong> Muchos sistemas de salud tienen líneas de orientación disponibles 24 horas.</li>
          <li><strong>Acude a urgencias</strong> si los síntomas son graves, se deterioran rápidamente o incluyen señales de alarma.</li>
          <li><strong>Llama al número de emergencias local</strong> si la situación es una emergencia.</li>
        </ol>
      </LegalSection>

      <LegalSection title="Limitación de responsabilidad">
        <p>
          Aliis y sus responsables no serán responsables de ningún daño, perjuicio o consecuencia
          derivada de:
        </p>
        <ul className="legal-list">
          <li>Decisiones médicas o de tratamiento tomadas basándose en el contenido generado por la plataforma.</li>
          <li>Retrasos en buscar atención médica profesional.</li>
          <li>Interpretaciones erróneas del contenido educativo.</li>
          <li>Errores en el contenido generado por inteligencia artificial.</li>
          <li>Auto-diagnósticos realizados a partir de la información de la plataforma.</li>
        </ul>
        <p>
          El uso de Aliis implica la aceptación de este disclaimer y la comprensión de que el contenido
          es educativo, no clínico.
        </p>
      </LegalSection>

      <LegalSection title="Consentimiento informado para el uso del servicio">
        <p>Al usar la funcionalidad de generación de packs en Aliis, declaras que:</p>
        <ol className="list-decimal list-outside ml-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>Has leído y comprendido este Disclaimer Médico.</li>
          <li>Entiendes que el contenido generado es educativo y no constituye consejo médico.</li>
          <li>No utilizarás el contenido generado como sustituto de la consulta con un profesional de la salud.</li>
          <li>Compartes el texto de tu diagnóstico de forma voluntaria y bajo tu responsabilidad.</li>
          <li>En caso de duda, síntoma preocupante o emergencia, buscarás atención médica profesional.</li>
        </ol>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          Si tienes preguntas sobre este Disclaimer o sobre el alcance del servicio:
        </p>
        <p>
          <strong>Correo:</strong> trujilloreyesoscarmi@gmail.com<br />
          <strong>Tiempo de respuesta:</strong> 5–10 días hábiles
        </p>
      </LegalSection>

      <div className="mt-12 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          ¿Tienes más preguntas sobre cómo protegemos tu información?{' '}
          <Link href="/privacidad" className="text-primary underline underline-offset-4">Política de Privacidad</Link>
          {' · '}
          <Link href="/terminos" className="text-primary underline underline-offset-4">Términos y Condiciones</Link>
        </p>
      </div>
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

function LegalCallout({ type, children }: { type: 'emergency' | 'info'; children: React.ReactNode }) {
  const styles = {
    emergency: 'bg-destructive/5 border-destructive/20 text-destructive',
    info: 'bg-primary/5 border-primary/20 text-primary',
  }
  return (
    <div className={`border rounded-lg px-5 py-4 mb-8 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  )
}
