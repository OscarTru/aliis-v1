export type PackStatus = 'Nuevo' | 'A medias' | 'Leído'
export type PackTint = 'teal' | 'plum' | 'forest' | 'bronze'

export interface MockReference {
  id: string
  label: string
  url: string
}

export interface MockChapter {
  id: string
  number: string
  title: string
  subtitle: string
  body: string
  references: MockReference[]
}

export interface MockPack {
  id: string
  dx: string
  date: string
  status: PackStatus
  chaptersRead: number
  chaptersTotal: number
  tint: PackTint
  chapters: MockChapter[]
}

export const TINT_GRADIENTS: Record<PackTint, string> = {
  teal: 'linear-gradient(135deg,#14606E,#1F8A9B)',
  plum: 'linear-gradient(135deg,#1e1b2e,#2d1f3d)',
  forest: 'linear-gradient(135deg,#0f1a12,#1a2e1f)',
  bronze: 'linear-gradient(135deg,#1a1200,#2e2200)',
}

export interface PricingFeature {
  included: boolean
  text: string
  sub?: string
}

export interface PricingTier {
  name: string
  prices: { EUR: string; USD: string; MXN: string }
  cadence: string
  pitch: string
  features: PricingFeature[]
  cta: string
  highlight: boolean
}

export const PRICING_TIERS: { gratis: PricingTier; pro: PricingTier } = {
  gratis: {
    name: 'Gratis',
    prices: { EUR: '€0', USD: '$0', MXN: 'MXN 0' },
    cadence: 'para siempre',
    pitch: 'Para entender tu diagnóstico hoy.',
    features: [
      { included: true, text: 'Tu explicación médica completa', sub: 'qué es, cómo funciona, señales de alarma y preguntas para tu médico' },
      { included: true, text: 'Todo con fuentes verificables', sub: 'cada afirmación cita su referencia — PubMed, DOI, guías clínicas' },
      { included: true, text: 'Pregúntale a Aliis lo que no quedó claro', sub: 'un asistente que conoce tu explicación y responde sobre ella' },
      { included: true, text: 'Diario de síntomas y vitales', sub: 'anota cómo te sientes y registra glucosa, presión, peso o FC' },
      { included: true, text: 'Tus tratamientos en orden', sub: 'añade dosis y horarios, marca tus tomas y ve tu racha de adherencia' },
      { included: true, text: 'Aliis verifica tus medicamentos', sub: 'revisa la dosis cuando la añades y te avisa si algo no encaja' },
      { included: true, text: 'Biblioteca de más de 60 condiciones', sub: 'diagnósticos revisados por residentes de neurología, disponibles siempre' },
      { included: true, text: 'Comparte tu explicación con quien quieras', sub: 'un enlace que cualquiera puede ver, sin necesidad de cuenta' },
      { included: true, text: 'Tu historial siempre disponible', sub: 'todas tus explicaciones guardadas, sin fecha de caducidad' },
    ],
    cta: 'Crear cuenta gratis',
    highlight: false,
  },
  pro: {
    name: 'Pro',
    prices: { EUR: '€9.99', USD: '$9.99', MXN: 'MXN 199' },
    cadence: 'al mes',
    pitch: 'Para quien convive con su diagnóstico cada día.',
    features: [
      { included: true, text: 'Explicaciones sin límite, y más profundas', sub: 'sin contadores — genera todas las que necesites, cuando las necesites' },
      { included: true, text: 'Aliis conoce tu caso completo', sub: 'usa tus condiciones, medicamentos, alergias e historial al responder' },
      { included: true, text: 'Te avisa antes de que notes algo', sub: 'cada mañana revisa tus datos y te manda una señal si algo merece atención' },
      { included: true, text: 'Prepara tu próxima consulta', sub: 'resumen con preguntas concretas, listo para llevar al médico' },
      { included: true, text: 'Ve los patrones que no ves solo', sub: 'cómo se relacionan tus síntomas con tu presión, glucosa, peso y FC' },
      { included: true, text: 'Tu resumen mensual de salud', sub: 'cómo evolucionaste este mes — en lenguaje humano, no en tablas' },
      { included: true, text: 'Aliis responde desde cualquier pantalla', sub: 'en tu diario, en tus tratamientos, en tu historial — siempre con contexto' },
      { included: true, text: 'Detecta lo que no cuadra', sub: 'si un tratamiento no tiene diagnóstico o al revés, Aliis lo marca' },
      { included: true, text: 'Todo lo de Gratis, incluido', sub: 'diario, vitales, biblioteca, compartir, historial permanente' },
    ],
    cta: 'Empezar 14 días gratis',
    highlight: true,
  },
}

export const MOCK_PACKS: MockPack[] = [
  {
    id: 'migrana-aura',
    dx: 'Migraña con aura',
    date: '24 abr 2026',
    status: 'Nuevo',
    chaptersRead: 0,
    chaptersTotal: 6,
    tint: 'teal',
    chapters: [
      {
        id: 'que-es',
        number: '01',
        title: 'Qué es',
        subtitle: 'y por qué pasa.',
        body: `La migraña con aura es una cefalea que viene anunciada. Antes del dolor, el cerebro genera señales que puedes ver, sentir o escuchar — las llaman aura. No es peligroso en sí mismo, pero sí es la forma que tiene tu sistema nervioso de decirte que algo está a punto de pasar.\n\nEl aura ocurre porque una ola de actividad eléctrica recorre la corteza cerebral, seguida de una fase de calma. Ese contraste —activación y silencio— es lo que genera los fenómenos visuales típicos: luces en zigzag, puntos ciegos, líneas brillantes. En la mayoría de casos dura 20-60 minutos y desaparece sola.\n\nLo que sientes después —el dolor pulsátil, la sensibilidad a la luz y el sonido, las náuseas— es la fase de cefalea propiamente dicha. Son dos procesos distintos que ocurren en secuencia.`,
        references: [
          { id: 'ref1', label: 'Headache Classification Committee, ICHD-3 (2018)', url: 'https://doi.org/10.1177/0333102417738202' },
          { id: 'ref2', label: 'Viana M et al. Cephalalgia 2022', url: 'https://pubmed.ncbi.nlm.nih.gov/35441554' },
        ],
      },
      {
        id: 'como-funciona',
        number: '02',
        title: 'Cómo funciona',
        subtitle: 'por dentro.',
        body: `Imagina que la corteza visual de tu cerebro es una pradera seca. El aura empieza como una chispa que prende en un punto y se propaga lentamente —a unos 3 milímetros por minuto— hacia los bordes. Esa ola se llama depresión cortical propagada.\n\nLo interesante es que "depresión" aquí no significa tristeza: es una reducción de la actividad eléctrica. Las neuronas se silencian mientras la ola pasa, y ese silencio temporal es lo que genera los síntomas visuales. Cuando la ola termina, la actividad vuelve —y ahí empieza el dolor.\n\nEl sumatriptán que te recetaron actúa en los receptores de serotonina de los vasos cerebrales. Los contrae cuando se han dilatado en exceso durante la fase de cefalea, y eso reduce el dolor. Por eso funciona mejor tomado pronto: cuando la inflamación ya está instalada, cuesta más revertirla.`,
        references: [
          { id: 'ref3', label: 'Lauritzen M. Physiol Rev 1994', url: 'https://pubmed.ncbi.nlm.nih.gov/7938227' },
        ],
      },
      {
        id: 'que-esperar',
        number: '03',
        title: 'Qué puedes esperar',
        subtitle: 'en el tiempo.',
        body: `La frecuencia varía mucho entre personas. Hay quienes tienen una crisis al año y quienes las tienen cada semana. Los factores que más influyen son el sueño irregular, el estrés sostenido, los cambios hormonales y ciertos alimentos —aunque la relación con la dieta es más débil de lo que se suele decir.\n\nCon tratamiento preventivo adecuado (y el topiramato que te recetaron entra en esa categoría), la mayoría de personas reduce la frecuencia a la mitad o más en los primeros tres meses. No es una cura, pero sí un cambio real en la calidad de vida.`,
        references: [
          { id: 'ref4', label: 'Silberstein SD et al. Neurology 2012', url: 'https://pubmed.ncbi.nlm.nih.gov/22529202' },
        ],
      },
      {
        id: 'preguntas',
        number: '04',
        title: 'Preguntas para',
        subtitle: 'tu próxima consulta.',
        body: `1. ¿A qué dosis tengo que llegar con el topiramato, y en cuántas semanas?\n2. ¿Con cuántas crisis al mes considerarías que el tratamiento funciona?\n3. ¿Qué hago si el sumatriptán no me hace efecto en la primera dosis?\n4. ¿Hay algún desencadenante específico que deba registrar en mi diario?\n5. ¿Cuándo debería volver antes de los 6 meses si algo cambia?`,
        references: [],
      },
      {
        id: 'alarmas',
        number: '05',
        title: 'Cuándo buscar',
        subtitle: 'atención urgente.',
        body: `El dolor de cabeza "en trueno" —el más intenso de tu vida, que llega en segundos— siempre requiere valoración urgente, aunque tengas migraña de base.\n\nTambién si el aura dura más de 60 minutos, si aparecen síntomas nuevos como debilidad en un lado del cuerpo o dificultad para hablar, o si tienes fiebre además del dolor.\n\nFuera de esos casos, una migraña con aura típica —la que ya conoces— no es una emergencia, aunque sea muy incapacitante.`,
        references: [
          { id: 'ref5', label: 'Ducros A. Lancet Neurol 2012', url: 'https://pubmed.ncbi.nlm.nih.gov/22571124' },
        ],
      },
      {
        id: 'mito',
        number: '06',
        title: 'Algo que mucha gente',
        subtitle: 'malentiende.',
        body: `El mito más común: "el aura significa que tengo riesgo de ictus". La realidad es más matizada. Las personas con migraña con aura tienen un riesgo cardiovascular ligeramente elevado en términos estadísticos, pero ese riesgo en términos absolutos es muy bajo —especialmente si no fumas y no tomas anticonceptivos orales combinados. Tu neurólogo ya lo ha valorado. Si te lo recetó igualmente, es porque el balance riesgo-beneficio sale a tu favor.`,
        references: [
          { id: 'ref6', label: 'Kurth T et al. BMJ 2016', url: 'https://doi.org/10.1136/bmj.i2610' },
        ],
      },
    ],
  },
  {
    id: 'insomnio-cronico',
    dx: 'Insomnio crónico',
    date: '03 mar 2026',
    status: 'Leído',
    chaptersRead: 5,
    chaptersTotal: 5,
    tint: 'plum',
    chapters: [
      { id: 'que-es', number: '01', title: 'Qué es', subtitle: 'el insomnio crónico.', body: 'El insomnio crónico es la dificultad persistente para iniciar o mantener el sueño, con consecuencias durante el día, durante al menos tres meses.', references: [] },
      { id: 'como-funciona', number: '02', title: 'Cómo funciona', subtitle: 'el ciclo del insomnio.', body: 'El insomnio se perpetúa porque la cama se asocia con vigilia y alerta. La TCC-I actúa sobre esa asociación condicionada.', references: [] },
      { id: 'que-esperar', number: '03', title: 'Qué puedes esperar', subtitle: 'con tratamiento.', body: 'La TCC-I tiene mejor resultado a largo plazo que los hipnóticos. Los primeros 2-3 meses son los más difíciles.', references: [] },
      { id: 'preguntas', number: '04', title: 'Preguntas para', subtitle: 'tu médico.', body: '1. ¿Me recomiendas un programa de TCC-I digital o con terapeuta?\n2. ¿Cuánto tiempo debo mantener la restricción de sueño?', references: [] },
      { id: 'alarmas', number: '05', title: 'Señales de alerta', subtitle: 'a tener en cuenta.', body: 'Si aparece somnolencia excesiva durante el día que te impide funcionar, o si el insomnio se acompaña de ronquidos intensos, vale la pena descartar apnea.', references: [] },
    ],
  },
  {
    id: 'vertigo-vppb',
    dx: 'Vértigo posicional (VPPB)',
    date: '17 feb 2026',
    status: 'A medias',
    chaptersRead: 3,
    chaptersTotal: 5,
    tint: 'forest',
    chapters: [
      { id: 'que-es', number: '01', title: 'Qué es', subtitle: 'el VPPB.', body: 'El vértigo posicional benigno paroxístico es la causa más común de vértigo. Ocurre cuando cristales de carbonato de calcio del oído interno se desplazan a los canales semicirculares.', references: [] },
      { id: 'como-funciona', number: '02', title: 'Cómo funciona', subtitle: 'el oído interno.', body: 'Los canales semicirculares detectan rotación. Cuando un cristal (otolito) entra en uno de ellos, el cerebro recibe señales de movimiento que no corresponden a la realidad — y eso genera el vértigo.', references: [] },
      { id: 'que-esperar', number: '03', title: 'Qué puedes esperar', subtitle: 'con las maniobras.', body: 'La maniobra de Epley resuelve el VPPB en una o dos sesiones en el 80% de los casos. Las recurrencias son frecuentes pero igual de tratables.', references: [] },
      { id: 'preguntas', number: '04', title: 'Preguntas para', subtitle: 'tu médico.', body: '1. ¿Puedo hacer la maniobra yo solo en casa?\n2. ¿Hay ejercicios de Brandt-Daroff que me recomiendas?', references: [] },
      { id: 'alarmas', number: '05', title: 'Señales de alerta', subtitle: 'que no son VPPB.', body: 'Vértigo con dolor de cabeza intenso, visión doble, dificultad para caminar o hablar requiere valoración urgente — puede ser origen central, no del oído.', references: [] },
    ],
  },
  {
    id: 'temblor-esencial',
    dx: 'Temblor esencial',
    date: '22 ene 2026',
    status: 'Leído',
    chaptersRead: 5,
    chaptersTotal: 5,
    tint: 'bronze',
    chapters: [
      { id: 'que-es', number: '01', title: 'Qué es', subtitle: 'el temblor esencial.', body: 'El temblor esencial es el trastorno del movimiento más frecuente. Es un temblor de acción —aparece al hacer cosas, no en reposo— que afecta principalmente las manos y la voz.', references: [] },
      { id: 'como-funciona', number: '02', title: 'Cómo funciona', subtitle: 'el circuito del temblor.', body: 'Hay un circuito entre el cerebelo y el tálamo que oscila con una frecuencia de 4-12 Hz. En el temblor esencial ese circuito está ligeramente desregulado.', references: [] },
      { id: 'que-esperar', number: '03', title: 'Qué puedes esperar', subtitle: 'a largo plazo.', body: 'Progresa lentamente. El propranolol y el primidona son los fármacos de primera línea y funcionan en el 50-70% de personas. No es Parkinson — son enfermedades distintas.', references: [] },
      { id: 'preguntas', number: '04', title: 'Preguntas para', subtitle: 'tu médico.', body: '1. ¿A qué dosis empieza el propranolol y cómo la subo?\n2. ¿Hay alguna situación en que deba tomar la dosis extra?', references: [] },
      { id: 'alarmas', number: '05', title: 'Señales de alerta', subtitle: 'que cambiarían el diagnóstico.', body: 'Si el temblor aparece también en reposo, si hay lentitud de movimientos o rigidez, o si cambia tu forma de caminar — cuéntaselo a tu neurólogo. Esos síntomas juntos orientan hacia otra causa.', references: [] },
    ],
  },
]
