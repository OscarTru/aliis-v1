'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SECTIONS = [
  {
    title: 'Sobre Aliis',
    items: [
      {
        q: '¿Qué es Aliis exactamente?',
        a: 'Aliis es tu acompañante de salud personal. Convierte diagnósticos médicos en explicaciones claras, recuerda tu historial, analiza tus datos y te avisa si algo merece atención. No es un médico — es lo que te ayuda a entender lo que te dijeron y a llegar mejor preparado a tu próxima cita.',
      },
      {
        q: '¿Quién está detrás de Aliis?',
        a: 'Oscar y Stephanie, residentes de neurología y creadores de Cerebros Esponjosos — la cuenta con más de 575,000 personas que ya confían en su forma de explicar medicina. Aliis es la misma voz, disponible cuando no tienes un médico al lado.',
      },
      {
        q: '¿Esto reemplaza a mi médico?',
        a: 'No, y Aliis lo tiene claro en cada pantalla. No diagnostica, no recomienda qué medicamento tomar ni en qué dosis, y no es para emergencias. Es lo que te prepara para ir con mejores preguntas y entender mejor lo que ya te dijeron.',
      },
      {
        q: '¿En qué idioma funciona?',
        a: 'Aliis funciona completamente en español. Todas las explicaciones, el asistente y los análisis están pensados para pacientes hispanohablantes.',
      },
    ],
  },
  {
    title: 'Explicaciones médicas',
    items: [
      {
        q: '¿Cómo genera Aliis las explicaciones?',
        a: 'Introduces el nombre de tu diagnóstico o pegas lo que te dijo tu médico. Aliis genera seis capítulos: qué es, cómo funciona en tu cuerpo, qué puedes esperar, señales de alarma, preguntas para llevar al médico y un mito frecuente. Cada afirmación cita su fuente.',
      },
      {
        q: '¿Cómo sé que Aliis no se inventa las cosas?',
        a: 'Cada afirmación va con su fuente verificable — PubMed, DOI, guías clínicas. Antes de escribir algo, el sistema comprueba que la referencia exista. Si la evidencia no soporta una frase, Aliis no la incluye. Puedes desplegar cada cita cuando quieras.',
      },
      {
        q: '¿Puedo buscar mi diagnóstico aunque no recuerde el nombre exacto?',
        a: 'Sí. Puedes escribir el nombre como lo recuerdas, pegar el texto exacto que te dio el médico, o buscar en la biblioteca de más de 60 condiciones revisadas por especialistas.',
      },
      {
        q: '¿Puedo compartir mi explicación con un familiar?',
        a: 'Sí. Cada explicación tiene un botón para compartir por enlace o por WhatsApp. Cualquier persona puede verla sin necesidad de crear una cuenta. El enlace es válido por 30 días.',
      },
    ],
  },
  {
    title: 'Diario y tratamientos',
    items: [
      {
        q: '¿Para qué sirve el diario de síntomas?',
        a: 'Para registrar cómo te sientes día a día. Puedes anotar síntomas con texto y registrar signos vitales: glucosa, presión arterial, frecuencia cardíaca o peso. Aliis extrae los síntomas automáticamente y los ordena para que los tengas listos en tu próxima consulta.',
      },
      {
        q: '¿Qué hace Aliis con mis tratamientos?',
        a: 'Puedes añadir tus medicamentos con dosis y horario. Aliis verifica la dosis cuando la añades y te avisa si algo no encaja. Después puedes marcar tus tomas del día y ver tu racha de adherencia para saber qué tan constante has sido.',
      },
      {
        q: '¿Aliis puede detectar si algo no cuadra entre mis diagnósticos y mis medicamentos?',
        a: 'Sí, en el plan Pro. Aliis revisa si hay una condición sin tratamiento asociado o un medicamento sin diagnóstico que lo justifique, y te lo marca para que puedas consultarlo con tu médico.',
      },
    ],
  },
  {
    title: 'El asistente Aliis',
    items: [
      {
        q: '¿Qué puede hacer el asistente de Aliis?',
        a: 'Puedes preguntarle sobre tu diagnóstico, tus medicamentos, lo que registraste en el diario o cualquier término médico que no entendiste. Aliis responde desde tu historial real — no desde cero cada vez. En Pro, tiene acceso completo a tus condiciones, tratamientos y vitales.',
      },
      {
        q: '¿Aliis me avisa si algo en mis datos merece atención?',
        a: 'Sí, en el plan Pro. Cada mañana Aliis revisa tus datos recientes y te manda una señal si detecta algo que vale la pena revisar — sin que tengas que preguntar. No es una alarma clínica, es una observación para que estés al tanto.',
      },
      {
        q: '¿Puedo pedirle a Aliis que me prepare para mi consulta médica?',
        a: 'Sí. En Pro, Aliis genera un resumen con las preguntas más relevantes según tu historial reciente, tus vitales y tus tratamientos activos. Lo puedes llevar en el celular o compartirlo directamente.',
      },
    ],
  },
  {
    title: 'Planes y precios',
    items: [
      {
        q: '¿Qué incluye el plan Gratis?',
        a: 'Tu explicación médica completa con referencias verificables, el asistente para resolver dudas, diario de síntomas y vitales, control de tratamientos con verificación de dosis, biblioteca de más de 60 condiciones, compartir tu explicación y tu historial permanente. Todo sin fecha de caducidad.',
      },
      {
        q: '¿Qué gano de verdad con Pro?',
        a: 'En Pro, Aliis conoce tu caso completo: condiciones, medicamentos, alergias e historial. Puede personalizar tus explicaciones, avisarte si algo en tus datos merece atención, prepararte para tu consulta, mostrarte patrones entre tus síntomas y vitales, y darte un resumen mensual de cómo has evolucionado.',
      },
      {
        q: '¿Puedo probar Pro antes de pagar?',
        a: 'Sí. Pro incluye 14 días de prueba gratuita. No te pedimos tarjeta hasta que decidas quedarte.',
      },
      {
        q: '¿Qué pasa si cancelo Pro?',
        a: 'No pierdes nada. Tu historial, tu diario, tus tratamientos y todas tus explicaciones siguen disponibles. Simplemente vuelves al plan Gratis.',
      },
    ],
  },
  {
    title: 'Privacidad y datos',
    items: [
      {
        q: '¿Mis datos médicos son privados?',
        a: 'Sí. Tu diario, tus síntomas, tu perfil médico y tus conversaciones con Aliis son solo tuyos. No vendemos datos ni los usamos para entrenar modelos de inteligencia artificial.',
      },
      {
        q: '¿Puedo borrar mi cuenta y mis datos?',
        a: 'Sí, en cualquier momento desde tu perfil. Al borrar tu cuenta se eliminan todos tus datos permanentemente.',
      },
    ],
  },
]

export default function FaqPage() {
  const router = useRouter()
  const [open, setOpen] = useState<string | null>(null)

  function toggle(key: string) {
    setOpen(prev => prev === key ? null : key)
  }

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[72rem] mx-auto px-4 sm:px-6 h-14 flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <Icon icon="solar:arrow-left-bold-duotone" width={16} />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-[52rem] mx-auto px-4 sm:px-6 pt-14 pb-[120px]">
        <div className="text-center mb-14">
          <div className="font-mono text-[10px] tracking-[.22em] uppercase text-muted-foreground/50 mb-4">· Preguntas frecuentes ·</div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.2rem)] leading-[1.06] tracking-[-0.02em] mb-4 m-0">
            Todo lo que quieres saber{' '}
            <em className="text-muted-foreground/55">antes de empezar.</em>
          </h1>
          <p className="font-sans text-[15px] text-muted-foreground leading-relaxed max-w-[44ch] mx-auto mt-4">
            Si no encuentras lo que buscas, escríbenos a{' '}
            <a href="mailto:hola@cerebrosesponjosos.com" className="text-foreground underline underline-offset-2">hola@cerebrosesponjosos.com</a>
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="font-mono text-[10px] tracking-[.22em] uppercase text-muted-foreground/50 mb-5">
                · {section.title} ·
              </div>
              <div className="flex flex-col border-t border-border">
                {section.items.map((item, i) => {
                  const key = `${section.title}-${i}`
                  const isOpen = open === key
                  return (
                    <div key={key} className="border-b border-border">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left bg-transparent border-none cursor-pointer p-0 px-0"
                      >
                        <span className="font-serif text-[17px] leading-[1.35]">{item.q}</span>
                        <Icon
                          icon={isOpen ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'}
                          width={16}
                          className="text-muted-foreground/50 shrink-0 transition-transform"
                        />
                      </button>
                      {isOpen && (
                        <p className="font-sans text-[14px] text-muted-foreground leading-[1.7] pb-5 mt-0 m-0">
                          {item.a}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-border text-center">
          <p className="font-serif italic text-[15px] text-muted-foreground mb-6">
            ¿Listo para entender tu diagnóstico?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] bg-foreground text-background font-sans text-[14px] font-medium no-underline hover:opacity-90 transition-opacity"
          >
            Empezar gratis
            <Icon icon="solar:arrow-right-bold-duotone" width={15} />
          </Link>
        </div>
      </div>
    </>
  )
}
