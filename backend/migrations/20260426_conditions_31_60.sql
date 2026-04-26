-- =================================================================
-- ALIIS — Biblioteca del Paciente: Condiciones 31-60
-- Generado el 2026-04-26
-- Ejecutar en Supabase SQL Editor después de las condiciones 1-30
-- =================================================================

-- Condiciones 31-37: Salud Mental
-- Generado para Aliis — plataforma educativa para pacientes

-- ============================================================
-- CONDICIÓN 31: Trastorno de Ansiedad Generalizada (TAG)
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'ansiedad-generalizada',
  'Trastorno de Ansiedad Generalizada',
  'Preocupación excesiva y persistente que interfiere con tu vida diaria',
  'El TAG es un trastorno en el que la preocupación constante sobre múltiples temas —trabajo, salud, familia— se vuelve difícil de controlar y genera síntomas físicos. Es uno de los trastornos de ansiedad más comunes y tiene tratamientos muy efectivos.',
  'psiquiatría',
  'F41.1',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "El Trastorno de Ansiedad Generalizada (TAG) es una condición en la que experimentas preocupación excesiva y difícil de controlar sobre muchas situaciones cotidianas —tu trabajo, tu salud, tus finanzas, tus seres queridos— la mayoría de los días durante al menos seis meses. Imagina tener una alarma interna que nunca se apaga, aunque no haya ningún peligro real.",
      "A diferencia de la preocupación normal que todos sentimos, en el TAG los pensamientos de preocupación son desproporcionados, saltan de un tema a otro, y se sienten imposibles de detener. No es falta de voluntad ni exageración: es un patrón neurológico real que involucra el sistema de respuesta al estrés del cerebro.",
      "El TAG afecta aproximadamente al 5-6% de la población a lo largo de su vida, según el DSM-5 (Manual Diagnóstico y Estadístico de los Trastornos Mentales). Es más frecuente en mujeres que en hombres en una proporción de 2:1, y suele comenzar en la adolescencia o adultez temprana, aunque puede aparecer a cualquier edad.",
      "La buena noticia es que el TAG responde muy bien al tratamiento. La combinación de psicoterapia cognitivo-conductual y, cuando es necesario, medicación, permite que la gran mayoría de las personas recuperen una vida funcional y satisfactoria.",
      "Vivir con TAG no significa que estés 'loco' ni que seas débil. Significa que tu sistema nervioso aprendió a estar en alerta máxima, y que con el apoyo adecuado puedes enseñarle a calibrarse de nuevo."
    ],
    "callout": {"label": "Dato clave", "body": "El TAG es crónico pero muy tratable. Entre el 50-60% de los pacientes logran remisión con tratamiento adecuado, según las guías NICE 2019."}
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- Sección 2: Causas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El TAG no tiene una causa única. Es el resultado de una combinación de factores biológicos, psicológicos y ambientales que interactúan entre sí.",
      "Factores biológicos: Existe un componente genético importante. Si tienes familiares de primer grado con ansiedad o depresión, tu riesgo es mayor. A nivel cerebral, se observan diferencias en la actividad de la amígdala (el centro de alarma del cerebro) y en los sistemas de neurotransmisores como el GABA, la serotonina y la noradrenalina.",
      "Factores psicológicos: Las personas con TAG suelen tener una mayor intolerancia a la incertidumbre —les resulta muy difícil tolerar no saber qué va a pasar—, tienden a sobreestimar los peligros y a subestimar su capacidad de afrontamiento. Experiencias tempranas de inseguridad o control excesivo también pueden contribuir.",
      "Factores ambientales: El estrés crónico, los eventos de vida negativos (pérdidas, traumas, cambios grandes), y crecer en entornos de alta exigencia o impredecibilidad pueden activar o intensificar el TAG en personas con predisposición.",
      "Tener estos factores de riesgo no significa que inevitablemente vayas a desarrollar TAG, y tener TAG no significa que hayas hecho algo mal. Es una condición médica, no una elección."
    ]
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- Sección 3: Síntomas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El síntoma principal del TAG es la preocupación excesiva y persistente. Pero también aparecen síntomas físicos importantes. Para recibir el diagnóstico, según el DSM-5, debes presentar al menos 3 de los siguientes síntomas físicos/cognitivos durante la mayoría de los días en los últimos 6 meses:",
      "Síntomas cognitivos y emocionales: preocupación difícil de controlar, pensamientos catastróficos, dificultad para concentrarse, sensación de que la mente se queda en blanco, irritabilidad.",
      "Síntomas físicos: tensión muscular (especialmente en cuello y hombros), fatiga, inquietud o sensación de estar 'al límite', problemas para dormir (dificultad para conciliar o mantener el sueño), dolores de cabeza, malestar gastrointestinal.",
      "Estos síntomas causan malestar significativo o interfieren con el trabajo, las relaciones o las actividades diarias."
    ],
    "alarms": [
      {"tone": "red", "t": "Pensamientos de hacerse daño", "d": "Si tienes pensamientos de hacerte daño o de que estarías mejor muerto, busca ayuda de emergencia inmediatamente. Llama a tu médico, ve a urgencias o llama a una línea de crisis."},
      {"tone": "red", "t": "Incapacidad total para funcionar", "d": "Si la ansiedad te impide levantarte, comer, trabajar o cuidarte durante varios días seguidos, necesitas evaluación médica urgente."},
      {"tone": "amber", "t": "Síntomas físicos inexplicables frecuentes", "d": "Palpitaciones, dificultad para respirar, mareos o dolores físicos que tu médico no ha podido explicar pueden estar relacionados con la ansiedad. Consulta pronto."},
      {"tone": "amber", "t": "Evitación creciente", "d": "Si empiezas a evitar situaciones, personas o lugares por miedo, y esto limita tu vida, es momento de consultar a un profesional de salud mental."},
      {"tone": "amber", "t": "Uso de alcohol u otras sustancias para calmarte", "d": "Si usas alcohol, cannabis u otras sustancias para manejar la ansiedad, consulta pronto ya que esto puede empeorar el problema a largo plazo."}
    ]
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- Sección 4: Diagnóstico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El TAG se diagnostica clínicamente: no hay ningún análisis de sangre ni imagen cerebral que lo confirme. El médico o psiquiatra realiza una entrevista estructurada siguiendo los criterios del DSM-5 o la CIE-11 para determinar si tus síntomas cumplen los criterios diagnósticos.",
      "Es importante descartar primero causas médicas. Condiciones como el hipertiroidismo, arritmias cardíacas, o ciertos medicamentos pueden causar síntomas similares a la ansiedad. Por eso es habitual que tu médico pida algunos análisis básicos antes o al mismo tiempo que evalúa tu salud mental.",
      "Herramientas de evaluación: El médico puede usar cuestionarios estandarizados como el GAD-7 (Generalized Anxiety Disorder 7-item scale), que es breve, validado en español y muy útil para medir la severidad de los síntomas.",
      "El diagnóstico puede tardar en llegar porque los síntomas físicos suelen aparecer antes que la persona conecte su malestar físico con la ansiedad. Muchos pacientes consultan primero a médicos generales, cardiólogos o gastroenterólogos."
    ],
    "callout": {"label": "El cuestionario GAD-7", "body": "El GAD-7 es una escala de 7 preguntas que puedes responder en 2 minutos. Una puntuación de 10 o más sugiere TAG moderado-severo y recomienda evaluación profesional. Puedes pedirle a tu médico que te lo aplique."},
    "timeline": [
      {"w": "Paso 1", "t": "Consulta médica general: descartar causas físicas y evaluación inicial"},
      {"w": "Paso 2", "t": "Evaluación psiquiátrica o psicológica: entrevista clínica y cuestionarios"},
      {"w": "Paso 3", "t": "Diagnóstico y explicación del plan de tratamiento"},
      {"w": "Paso 4", "t": "Inicio de tratamiento y seguimiento periódico"}
    ]
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- Sección 5: Tratamientos
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El TAG tiene tratamientos muy efectivos. Las guías internacionales (NICE, APA) recomiendan como primera línea la psicoterapia cognitivo-conductual (TCC) y/o la medicación, según la severidad.",
      "Psicoterapia cognitivo-conductual (TCC): Es el tratamiento psicológico con más evidencia para el TAG. Típicamente consta de 12-20 sesiones. Te enseña a identificar y modificar los patrones de pensamiento catastrófico, a tolerar la incertidumbre, y a reducir los comportamientos de evitación. La TCC tiene efectos duraderos que persisten después de terminar el tratamiento.",
      "Medicación de primera línea: Los inhibidores selectivos de la recaptación de serotonina (ISRS) como la sertralina, escitalopram o paroxetina, y los inhibidores de la recaptación de serotonina-noradrenalina (IRSN) como la venlafaxina o duloxetina son los más usados. Tardan 2-4 semanas en hacer efecto completo. No generan dependencia y son seguros con uso prolongado.",
      "Otras opciones: La buspirona es un ansiolítico no benzodiacepínico efectivo para TAG. La pregabalina también tiene evidencia sólida. Las benzodiacepinas (como el alprazolam o el clonazepam) pueden usarse a corto plazo para alivio rápido, pero no se recomiendan como tratamiento prolongado por el riesgo de dependencia.",
      "Estrategias complementarias con evidencia: El ejercicio aeróbico regular (30 min/día, 5 días/semana) reduce significativamente los síntomas de ansiedad. Las técnicas de mindfulness y relajación muscular progresiva son complementos útiles, aunque no reemplazan la TCC ni la medicación cuando son necesarias."
    ],
    "callout": {"label": "Tiempo de respuesta", "body": "La medicación para el TAG suele tardar 4-8 semanas en mostrar su beneficio completo. No la abandones antes si no sientes efecto inmediato. Siempre habla con tu médico antes de hacer cambios."}
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- Sección 6: Vida diaria
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con TAG requiere construir una rutina que apoye tu sistema nervioso. No se trata de eliminar toda preocupación —eso no es posible ni deseable— sino de aprender a relacionarte diferente con ella.",
      "Higiene del sueño: El TAG y el insomnio se retroalimentan. Mantén horarios regulares, evita pantallas antes de dormir, y limita la cafeína después del mediodía. Si el insomnio persiste, coméntaselo a tu médico.",
      "Movimiento físico: El ejercicio es una de las herramientas más potentes para reducir la ansiedad. No necesitas hacer deporte de élite: caminar 30 minutos al día tiene efectos documentados sobre el estado de ánimo y la ansiedad.",
      "Gestión de la preocupación: Una técnica útil es el 'tiempo de preocupación': asigna 20-30 minutos al día para preocuparte activamente, y cuando los pensamientos aparezcan fuera de ese horario, recuérdate que los atenderás en ese momento. Esto no suprime la preocupación, sino que le da un lugar.",
      "Red de apoyo: Compartir lo que vives con personas de confianza reduce el aislamiento. Si tu entorno no entiende el TAG, los grupos de apoyo (presenciales o en línea) pueden ser muy útiles.",
      "Seguimiento médico: El TAG es crónico y puede tener recaídas, especialmente ante el estrés. El seguimiento regular con tu médico o psicólogo te ayuda a detectar señales tempranas y ajustar el tratamiento."
    ]
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- Sección 7: Preguntas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": ["Lleva estas preguntas a tu próxima consulta para aprovecharla al máximo."],
    "questions": [
      "¿Estoy seguro de tener TAG o podría ser otra condición?",
      "¿Qué tan severo es mi caso y cómo lo medimos?",
      "¿Me recomienda empezar con psicoterapia, medicación o ambas?",
      "Si me receta medicación, ¿cuáles son los efectos secundarios más comunes?",
      "¿Cuánto tiempo tendré que tomar la medicación?",
      "¿Cómo sabemos si el tratamiento está funcionando?",
      "¿Qué hago si siento que la medicación no me está ayudando?",
      "¿Puede el TAG desaparecer completamente o es algo que manejaré toda la vida?",
      "¿Qué señales deben llevarme a buscar atención urgente?",
      "¿Hay algo en mi estilo de vida que esté empeorando mi ansiedad?",
      "¿Me puede recomendar un psicólogo con experiencia en TCC para TAG?",
      "¿El TAG puede afectar mi trabajo o mis relaciones a largo plazo?"
    ]
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- Sección 8: Fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.). APA Publishing. — Criterios diagnósticos del TAG (DSM-5).",
      "National Institute for Health and Care Excellence. (2019). Generalised anxiety disorder and panic disorder in adults: management. NICE Clinical Guideline CG113. https://www.nice.org.uk/guidance/cg113",
      "Kessler, R. C., et al. (2005). Lifetime prevalence and age-of-onset distributions of DSM-IV disorders in the National Comorbidity Survey Replication. Archives of General Psychiatry, 62(6), 593–602.",
      "Hofmann, S. G., et al. (2012). The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses. Cognitive Therapy and Research, 36(5), 427–440.",
      "Baldwin, D. S., et al. (2014). Evidence-based pharmacological treatment of anxiety disorders, post-traumatic stress disorder and obsessive-compulsive disorder. Journal of Psychopharmacology, 28(5), 403–439.",
      "Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of Internal Medicine, 166(10), 1092–1097.",
      "Smits, J. A. J., & Zvolensky, M. J. (2006). Emotional vulnerability as a function of physical activity among individuals with panic disorder. Depression and Anxiety, 23(2), 102–106."
    ]
  }'::jsonb
from conditions c where c.slug = 'ansiedad-generalizada';

-- ============================================================
-- CONDICIÓN 32: Depresión Mayor
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'depresion-mayor',
  'Depresión Mayor',
  'Tristeza profunda y pérdida de interés que va más allá de la tristeza normal',
  'La depresión mayor es un trastorno del estado de ánimo caracterizado por tristeza persistente, pérdida de interés en actividades que antes disfrutabas, y síntomas físicos que afectan tu capacidad de funcionar. No es debilidad: es una enfermedad con base biológica y tratamiento efectivo.',
  'psiquiatría',
  'F32.1',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "La depresión mayor —también llamada trastorno depresivo mayor o episodio depresivo mayor— es mucho más que sentirse triste. Es un cambio profundo en cómo funciona tu cerebro que afecta tu estado de ánimo, tus pensamientos, tu cuerpo y tu comportamiento durante al menos dos semanas consecutivas.",
      "Imagina que algo apagó el color de tu mundo: las cosas que antes te daban placer ya no lo hacen, levantarte se siente como escalar una montaña, y tu mente se llena de pensamientos negativos sobre ti mismo, el futuro y el mundo. Esto no es una elección ni una señal de carácter débil: es lo que hace la depresión al cerebro.",
      "Según el DSM-5, la depresión mayor es uno de los trastornos mentales más prevalentes del mundo. La Organización Mundial de la Salud (OMS) estima que afecta a más de 280 millones de personas globalmente y es la principal causa de discapacidad a nivel mundial.",
      "Existen diferentes tipos: depresión mayor con episodio único, depresión recurrente (múltiples episodios), depresión con características melancólicas, depresión postparto, y otros. Tu médico determinará cuál es tu presentación específica para ajustar el tratamiento.",
      "La depresión mayor es altamente tratable. Entre el 60-80% de los pacientes responden bien al tratamiento con psicoterapia, medicación o ambas. Buscar ayuda no es señal de debilidad: es la decisión más valiente que puedes tomar."
    ],
    "callout": {"label": "Dato clave", "body": "La depresión no es tristeza normal. La diferencia clave es la duración (más de 2 semanas), la intensidad y el impacto en tu funcionamiento diario. Si duda, consulta."}
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- Sección 2: Causas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La depresión es el resultado de la interacción entre factores biológicos, psicológicos y sociales. No existe una única causa.",
      "Factores biológicos: Hay un componente genético claro —si tienes familiares con depresión, tu riesgo es entre 2 y 3 veces mayor. A nivel cerebral, se producen cambios en los sistemas de serotonina, noradrenalina y dopamina, y en áreas como el hipocampo y la corteza prefrontal. También influyen desequilibrios hormonales (tiroides, cortisol) y enfermedades crónicas.",
      "Factores psicológicos: Estilos de pensamiento negativos y rígidos, baja autoestima, dificultad para manejar el estrés o experiencias tempranas de trauma o negligencia aumentan la vulnerabilidad. Ciertos patrones de pensamiento —como la autocrítica severa o la visión catastrófica— son a la vez síntoma y factor de riesgo.",
      "Factores sociales y ambientales: Pérdidas importantes (un ser querido, un trabajo, una relación), aislamiento social, estrés crónico, violencia o abuso, pobreza y falta de apoyo social son desencadenantes frecuentes. A veces la depresión aparece sin un evento precipitante claro.",
      "Sexo y etapa de vida: Las mujeres tienen el doble de probabilidad de experimentar depresión, posiblemente por diferencias hormonales y factores sociales. Los períodos de mayor riesgo incluyen la adolescencia, el postparto y la perimenopausia."
    ]
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- Sección 3: Síntomas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Para diagnosticar depresión mayor, el DSM-5 requiere al menos 5 de los siguientes síntomas durante el mismo período de 2 semanas, y al menos uno de ellos debe ser estado de ánimo deprimido o pérdida de interés/placer.",
      "Síntomas emocionales y cognitivos: tristeza persistente o vacío emocional, pérdida de interés o placer en casi todas las actividades (anhedonia), sentimientos de inutilidad o culpa excesiva, pensamientos recurrentes de muerte o suicidio, dificultad para pensar, concentrarse o tomar decisiones.",
      "Síntomas físicos: cambios en el apetito o peso (aumento o pérdida significativa), insomnio o hipersomnia (dormir demasiado), fatiga o pérdida de energía casi todos los días, agitación o enlentecimiento psicomotor (visible para otros).",
      "No todos los episodios depresivos se parecen. Algunas personas lloran mucho; otras no pueden llorar. Algunos se sienten agitados e irritables; otros completamente apagados. La depresión en hombres a menudo se manifiesta más como irritabilidad, agresividad o abuso de sustancias."
    ],
    "alarms": [
      {"tone": "red", "t": "Pensamientos de suicidio o de hacerse daño", "d": "Cualquier pensamiento de quitarte la vida o hacerte daño requiere atención de emergencia inmediata. Ve a urgencias, llama al 112 o a una línea de crisis. No estés solo/a."},
      {"tone": "red", "t": "Incapacidad de cuidarte", "d": "Si no puedes comer, no puedes levantarte, no te bañas durante varios días o no puedes cuidar a personas que dependen de ti, necesitas evaluación médica urgente."},
      {"tone": "amber", "t": "Síntomas que duran más de 2 semanas", "d": "Si llevas más de dos semanas sintiéndote triste, sin energía o sin interés en nada, es momento de consultar a tu médico aunque creas que se te pasará solo."},
      {"tone": "amber", "t": "Uso de alcohol u otras sustancias", "d": "Si estás usando alcohol u otras sustancias para sentirte mejor, consulta pronto. La depresión y el abuso de sustancias se retroalimentan peligrosamente."},
      {"tone": "amber", "t": "Aislamiento social progresivo", "d": "Si has dejado de ver a personas que te importan, de responder mensajes o de salir de casa durante semanas, busca ayuda profesional."}
    ]
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- Sección 4: Diagnóstico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "La depresión mayor se diagnostica clínicamente mediante una entrevista médica detallada. No existe una prueba de laboratorio que la confirme, pero sí es importante descartar causas médicas antes o al mismo tiempo.",
      "Evaluación médica inicial: Tu médico probablemente pedirá análisis de sangre básicos para descartar hipotiroidismo, anemia y otras condiciones que pueden causar síntomas similares. También revisará tus medicamentos, ya que algunos pueden causar depresión.",
      "Entrevista clínica: El médico o psiquiatra evaluará la presencia, duración e intensidad de los síntomas del DSM-5, el impacto en tu funcionamiento, antecedentes de episodios previos, historia familiar, y riesgo de suicidio.",
      "Herramientas de evaluación: El PHQ-9 (Patient Health Questionnaire) es el cuestionario más usado para detectar y medir la severidad de la depresión. Una puntuación de 10 o más sugiere depresión moderada a severa. Es breve, está validado en español y puede ayudarte a monitorear tu progreso."
    ],
    "callout": {"label": "Importante", "body": "El diagnóstico correcto es crucial. La depresión mayor debe diferenciarse del trastorno bipolar (donde también hay episodios de euforia), el duelo normal y la depresión secundaria a enfermedades médicas, porque el tratamiento es diferente."},
    "timeline": [
      {"w": "Semana 1-2", "t": "Consulta médica: evaluación inicial, análisis de laboratorio, cuestionarios"},
      {"w": "Semana 2-4", "t": "Evaluación psiquiátrica o psicológica: entrevista clínica completa"},
      {"w": "Semana 4-6", "t": "Diagnóstico y plan de tratamiento personalizado"},
      {"w": "Seguimiento", "t": "Revisiones periódicas para ajustar el tratamiento según la respuesta"}
    ]
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- Sección 5: Tratamientos
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "La depresión mayor tiene tratamientos con amplia evidencia. La elección depende de la severidad, tus preferencias y tu historia de respuesta a tratamientos previos.",
      "Psicoterapia: La terapia cognitivo-conductual (TCC) es la más estudiada y tiene evidencia sólida tanto para episodios depresivos agudos como para la prevención de recaídas. Otras psicoterapias con evidencia incluyen la terapia de activación conductual, la terapia interpersonal (TIP) y la terapia de aceptación y compromiso (ACT). La psicoterapia es especialmente recomendada en depresión leve-moderada y siempre como complemento de la medicación en casos severos.",
      "Antidepresivos: Los ISRS (fluoxetina, sertralina, escitalopram, paroxetina) son la primera línea de tratamiento farmacológico. Tardan 2-4 semanas en hacer efecto completo. Si el primero no funciona, existen múltiples alternativas. Los IRSN (venlafaxina, duloxetina) y otros antidepresivos (mirtazapina, bupropión) son opciones de segunda línea o cuando los ISRS no son suficientes.",
      "Tratamientos para casos resistentes: Si dos o más antidepresivos no han funcionado, existen opciones especializadas: potenciación con litio o antipsicóticos atípicos, ketamina intranasal (esketamina), estimulación magnética transcraneal (TMS) o terapia electroconvulsiva (TEC). La TEC tiene mala fama injustificada: es segura y muy efectiva en depresión severa resistente.",
      "Combinación: Para la mayoría de los pacientes con depresión moderada a severa, la combinación de medicación y psicoterapia es más efectiva que cualquiera de los dos por separado."
    ],
    "callout": {"label": "Sobre los antidepresivos", "body": "Los antidepresivos no crean dependencia ni cambian tu personalidad. Su objetivo es restaurar el funcionamiento normal de tu cerebro. Es normal probar más de uno antes de encontrar el adecuado para ti."}
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- Sección 6: Vida diaria
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con depresión requiere ser amable contigo mismo y construir pequeñas estructuras que apoyen tu recuperación, especialmente cuando la motivación está muy baja.",
      "Acción antes de motivación: Uno de los trucos más contraintuitivos de la depresión es que no necesitas sentirte motivado para actuar. La activación conductual funciona al revés: haces la actividad primero (aunque no quieras), y el estado de ánimo mejora después. Empieza con algo pequeño.",
      "Rutina básica: Mantener horarios regulares de sueño, comida y actividad física es más poderoso de lo que parece. No necesitas una rutina perfecta, solo consistente.",
      "Ejercicio: El ejercicio aeróbico tiene efectos antidepresivos documentados comparables a la medicación en casos leves-moderados. 30 minutos de caminata al día pueden marcar la diferencia.",
      "Conexión social: La depresión te empuja al aislamiento, que a su vez empeora la depresión. Mantener aunque sea un contacto mínimo con personas de confianza es protector. No tienes que explicar todo: solo estar.",
      "Prevención de recaídas: La depresión mayor tiende a recurrir. Aprender a reconocer tus señales tempranas de recaída y tener un plan de acción con tu médico puede ayudarte a intervenir antes de que el episodio se agrave."
    ]
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- Sección 7: Preguntas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
    "questions": [
      "¿Estoy seguro de tener depresión mayor o podría ser otra condición?",
      "¿Qué tan severa es mi depresión y qué tratamiento recomienda para este nivel?",
      "¿Me recomienda empezar con psicoterapia, medicación o las dos?",
      "Si empiezo medicación, ¿cuánto tiempo tardaré en sentir efecto?",
      "¿Cuáles son los efectos secundarios más comunes del antidepresivo que me receta?",
      "¿Cuánto tiempo tendré que tomar la medicación?",
      "¿Cómo sé si el tratamiento está funcionando?",
      "¿Qué hago si me siento peor después de empezar la medicación?",
      "¿Tengo riesgo de volver a tener un episodio depresivo?",
      "¿Qué señales deben alarmarme para buscar ayuda urgente?",
      "¿Puedo combinar el tratamiento médico con ejercicio u otras intervenciones?",
      "¿Hay grupos de apoyo para personas con depresión que me pueda recomendar?"
    ]
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- Sección 8: Fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.). APA Publishing.",
      "World Health Organization. (2023). Depressive disorder (depression). WHO Fact Sheet. https://www.who.int/news-room/fact-sheets/detail/depression",
      "National Institute for Health and Care Excellence. (2022). Depression in adults: treatment and management. NICE Clinical Guideline CG90 (updated). https://www.nice.org.uk/guidance/ng222",
      "Cuijpers, P., et al. (2019). Psychotherapies for depression: a network meta-analysis covering efficacy, acceptability and long-term outcomes of all main treatment types. World Psychiatry, 18(1), 92–107.",
      "Cipriani, A., et al. (2018). Comparative efficacy and acceptability of 21 antidepressant drugs for the acute treatment of adults with major depressive disorder. The Lancet, 391(10128), 1357–1366.",
      "Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613.",
      "Blumenthal, J. A., et al. (2007). Exercise and pharmacotherapy in the treatment of major depressive disorder. Psychosomatic Medicine, 69(7), 587–596."
    ]
  }'::jsonb
from conditions c where c.slug = 'depresion-mayor';

-- ============================================================
-- CONDICIÓN 33: Trastorno Bipolar
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'trastorno-bipolar',
  'Trastorno Bipolar',
  'Episodios alternantes de euforia intensa y depresión profunda',
  'El trastorno bipolar es una condición del estado de ánimo caracterizada por episodios de manía o hipomanía (euforia, energía excesiva) que alternan con episodios de depresión. No es un cambio normal de humor: son cambios intensos que afectan tu funcionamiento. Con tratamiento adecuado, la mayoría de las personas lleva una vida estable y plena.',
  'psiquiatría',
  'F31',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "El trastorno bipolar es una condición del estado de ánimo en la que el cerebro alterna entre dos polos extremos: por un lado, episodios de manía o hipomanía, caracterizados por euforia, energía desbordante, poco sueño y a veces comportamientos de riesgo; por otro lado, episodios de depresión profunda con tristeza, falta de energía y pérdida de interés.",
      "Existen principalmente dos tipos. El Trastorno Bipolar I se caracteriza por episodios de manía completa (que pueden requerir hospitalización) y generalmente también episodios depresivos. El Trastorno Bipolar II tiene hipomanía (manía menos intensa que no lleva a hospitalización) y episodios depresivos, que suelen ser predominantes y prolongados.",
      "Imagina un termostato que se desregula: en los momentos de manía todo está al máximo —te sientes increíble, con superpoderes, con ideas brillantes— pero el calor excesivo daña el sistema. En los momentos de depresión todo cae: el frío es paralizante. El objetivo del tratamiento es mantener el termostato en un rango estable.",
      "El trastorno bipolar afecta aproximadamente al 1-2% de la población mundial (bipolar I) y al 2-3% si se incluye el bipolar II. Afecta por igual a hombres y mujeres, aunque los episodios de manía son más frecuentes en hombres y los depresivos en mujeres.",
      "Es una condición crónica pero muy manejable. Las personas con trastorno bipolar bien tratado pueden llevar vidas plenas, con carreras, relaciones y proyectos significativos. El tratamiento preventivo —no solo en las crisis— es clave."
    ],
    "callout": {"label": "Dato clave", "body": "El trastorno bipolar tarda en promedio 6-10 años en diagnosticarse correctamente, ya que los episodios depresivos suelen aparecer primero. Si tienes depresión y también has tenido períodos de energía inusualmente alta, coméntalo con tu médico."}
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- Sección 2: Causas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El trastorno bipolar tiene una de las bases genéticas más fuertes entre los trastornos mentales. Si un familiar de primer grado tiene bipolar I, el riesgo de desarrollarlo es hasta 10 veces mayor que en la población general.",
      "Factores biológicos: Múltiples genes contribuyen al riesgo, ninguno de forma determinante. A nivel cerebral se observan diferencias en el volumen de ciertas áreas (como el hipocampo y la corteza prefrontal) y en los sistemas de dopamina, serotonina y glutamato. Los ritmos circadianos (el ciclo sueño-vigilia) están profundamente alterados en el trastorno bipolar.",
      "Factores desencadenantes: Aunque la predisposición es biológica, los episodios suelen estar desencadenados por factores como: privación de sueño, estrés intenso, consumo de sustancias (especialmente estimulantes y cannabis), cambios hormonales, y a veces el inicio de antidepresivos sin protección con estabilizadores del ánimo.",
      "Factores protectores: La estabilidad del sueño y la rutina son los factores protectores más poderosos contra los episodios bipolares. También lo son el apoyo social, el tratamiento preventivo continuo y el reconocimiento temprano de señales de alerta.",
      "El trastorno bipolar no es consecuencia de una mala crianza ni de debilidad personal. Es una condición neurobiológica con fuerte componente hereditario."
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- Sección 3: Síntomas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El trastorno bipolar se manifiesta en episodios claramente delimitados. Los síntomas varían según el tipo de episodio.",
      "Episodio maníaco: euforia o irritabilidad elevada de forma persistente, autoestima exagerada o grandiosidad, disminución de la necesidad de sueño (duermes 3 horas y te sientes con energía), mayor locuacidad, pensamiento acelerado, distracción, aumento de actividades orientadas a metas o agitación, comportamientos de riesgo (gastos impulsivos, hipersexualidad, decisiones imprudentes). Dura al menos 7 días o requiere hospitalización.",
      "Episodio hipomaníaco: mismos síntomas que la manía pero menos intensos, sin comportamientos que requieran hospitalización, y la persona puede funcionar (aunque mejor de lo usual). Dura al menos 4 días.",
      "Episodio depresivo: tristeza, vacío, anhedonia, cambios en sueño y apetito, fatiga, dificultad para concentrarse, sentimientos de inutilidad, pensamientos de muerte. Los episodios depresivos en el bipolar suelen ser más prolongados que los maníacos."
    ],
    "alarms": [
      {"tone": "red", "t": "Pensamientos de suicidio", "d": "El riesgo de suicidio en el trastorno bipolar es significativamente mayor que en la población general, especialmente durante los episodios depresivos o los estados mixtos. Busca ayuda de emergencia inmediatamente."},
      {"tone": "red", "t": "Episodio maníaco con comportamientos de riesgo", "d": "Si estás tomando decisiones impulsivas muy costosas, teniendo conductas sexuales de riesgo, o actuando de forma que podría dañarte a ti o a otros, necesitas evaluación urgente. A veces la persona en manía no se da cuenta del riesgo."},
      {"tone": "amber", "t": "Disminución brusca del sueño sin cansancio", "d": "Dormir 3-4 horas y sentirte con energía es una señal temprana frecuente de episodio maníaco. Contacta a tu médico de inmediato para intervención temprana."},
      {"tone": "amber", "t": "Estado mixto", "d": "Los estados mixtos (manía y depresión al mismo tiempo: energía alta pero pensamiento depresivo) son especialmente peligrosos. Si te sientes agitado, con energía, pero también muy oscuro por dentro, busca ayuda."},
      {"tone": "amber", "t": "Abandono del tratamiento", "d": "Dejar la medicación sin supervisión médica es el principal factor de recaída. Si sientes que el tratamiento no está funcionando o tienes muchos efectos secundarios, habla con tu médico antes de hacer cambios."}
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- Sección 4: Diagnóstico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico del trastorno bipolar requiere una evaluación clínica cuidadosa. No existe ninguna prueba de laboratorio o imagen que lo confirme.",
      "La entrevista clínica es fundamental. El psiquiatra evaluará toda la historia de episodios del estado de ánimo —no solo el actual, sino episodios pasados—, ya que el bipolar a menudo se presenta primero como depresión y el componente maníaco se descubre más tarde.",
      "Es especialmente importante: descartar causas médicas (como hipotiroidismo o enfermedades neurológicas), descartar el efecto de sustancias o medicamentos, y distinguir el trastorno bipolar de la depresión mayor (el tratamiento es diferente), el TDAH, y el trastorno límite de la personalidad.",
      "Herramientas diagnósticas: El Mood Disorder Questionnaire (MDQ) es un cuestionario validado que puede ayudar a identificar síntomas hipomaníacos o maníacos pasados. El registro del estado de ánimo (mood chart) —un diario diario del ánimo, sueño y actividad— es muy útil para el seguimiento y el diagnóstico."
    ],
    "callout": {"label": "Sé honesto sobre tus episodios de euforia", "body": "Muchas personas no mencionan los episodios de euforia porque se sienten bien durante ellos o porque no los reconocen como síntomas. Sin esta información, el médico puede diagnosticar solo depresión. Cuéntale a tu médico si alguna vez has tenido períodos de energía, creatividad o euforia inusualmente altas."}
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- Sección 5: Tratamientos
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El trastorno bipolar requiere tratamiento de mantenimiento (no solo en las crisis). El objetivo es prevenir nuevos episodios y estabilizar el estado de ánimo a largo plazo.",
      "Estabilizadores del ánimo: Son la base del tratamiento. El litio es el estabilizador con más evidencia y el único que ha demostrado reducir el riesgo de suicidio en trastorno bipolar. Requiere monitoreo regular de niveles en sangre y función renal. El valproato (ácido valproico) y la lamotrigina son otras opciones; la lamotrigina es especialmente útil para la prevención de episodios depresivos.",
      "Antipsicóticos atípicos: Quetiapina, aripiprazol, olanzapina y otros tienen eficacia demostrada tanto para el tratamiento de episodios agudos como para el mantenimiento. Algunos tienen indicación específica para depresión bipolar.",
      "Antidepresivos: Se usan con precaución en el trastorno bipolar. Sin un estabilizador del ánimo, pueden desencadenar un episodio maníaco. Si se usan, siempre en combinación con un estabilizador.",
      "Psicoterapia: La terapia cognitivo-conductual adaptada para trastorno bipolar, la terapia de ritmo interpersonal y social (IPSRT) —que trabaja especialmente la estabilidad del sueño y las rutinas— y la psicoeducación han demostrado reducir el número de recaídas y mejorar el funcionamiento.",
      "Psicoeducación: Entender tu condición es una parte fundamental del tratamiento. Saber reconocer tus señales de alarma personales, mantener un registro del ánimo y contar con un plan de crisis son herramientas que salvan vidas."
    ],
    "callout": {"label": "El litio y los análisis de sangre", "body": "Si tomas litio, necesitarás análisis periódicos de litemia (nivel en sangre), función renal y tiroides. No es opcional: es para tu seguridad. El rango terapéutico es estrecho y el monitoreo garantiza que el medicamento sea seguro y efectivo."}
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- Sección 6: Vida diaria
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "La estabilidad de los ritmos biológicos es la piedra angular de la vida con trastorno bipolar. El sueño es especialmente crítico: la privación de sueño puede desencadenar episodios maníacos y mantener patrones regulares puede prevenirlos.",
      "Rutinas como anclaje: Intenta mantener horarios fijos para levantarte, comer y acostarte, incluso los fines de semana. Las variaciones grandes en el horario de sueño son uno de los principales desencadenantes de episodios.",
      "Registro del estado de ánimo: Llevar un mood chart —anotar cada día tu ánimo (de -5 a +5), horas de sueño y nivel de estrés— te ayuda a identificar patrones y señales tempranas de episodio antes de que sean severos. Hay apps específicas para esto.",
      "Alcohol y drogas: El consumo de sustancias es especialmente peligroso en el trastorno bipolar. El alcohol es depresor del sistema nervioso y puede desencadenar episodios depresivos; el cannabis y la cocaína pueden desencadenar manía o psicosis. Evitar las sustancias no es opcional si quieres estabilidad.",
      "Plan de crisis: Trabaja con tu médico y tus personas de confianza para tener un plan escrito: ¿cuáles son tus señales de alarma personales? ¿A quién llamar? ¿Qué hacer si no puedes tomar buenas decisiones? Tener este plan listo cuando estás estable puede marcar la diferencia en una crisis.",
      "Identidad más allá del diagnóstico: El trastorno bipolar es parte de tu vida, no toda tu vida. Muchas personas con esta condición —artistas, científicos, emprendedores, médicos— han construido vidas significativas y exitosas. El tratamiento adecuado abre posibilidades, no las cierra."
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- Sección 7: Preguntas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
    "questions": [
      "¿Tengo bipolar I o bipolar II, y qué diferencia hace en mi tratamiento?",
      "¿Qué estabilizador del ánimo recomienda para mí y por qué?",
      "¿Cuánto tiempo tendré que tomar medicación?",
      "¿Qué análisis de sangre necesito hacer y con qué frecuencia?",
      "¿Puedo tomar antidepresivos de forma segura con mi diagnóstico?",
      "¿Cuáles son mis señales de alerta personales para un episodio maníaco o depresivo?",
      "¿Qué hago si siento que estoy entrando en un episodio?",
      "¿El alcohol y el cannabis son realmente tan riesgosos para mí?",
      "¿Qué tipo de psicoterapia es mejor para el trastorno bipolar?",
      "¿Cómo debo manejar el sueño para prevenir recaídas?",
      "¿Puedo tener hijos de forma segura con este diagnóstico y tratamiento?",
      "¿Cómo involucro a mi familia para que me ayude a identificar señales de alerta?"
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- Sección 8: Fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.). APA Publishing.",
      "Yatham, L. N., et al. (2018). Canadian Network for Mood and Anxiety Treatments (CANMAT) and International Society for Bipolar Disorders (ISBD) 2018 guidelines for the management of patients with bipolar disorder. Bipolar Disorders, 20(2), 97–170.",
      "Cipriani, A., et al. (2013). Lithium in the prevention of suicide in mood disorders: updated systematic review and meta-analysis. BMJ, 346, f3646.",
      "Frank, E., et al. (2005). Two-year outcomes for interpersonal and social rhythm therapy in individuals with bipolar I disorder. Archives of General Psychiatry, 62(9), 996–1004.",
      "Geddes, J. R., & Miklowitz, D. J. (2013). Treatment of bipolar disorder. The Lancet, 381(9878), 1672–1682.",
      "Merikangas, K. R., et al. (2011). Prevalence and correlates of bipolar spectrum disorder in the world mental health survey initiative. Archives of General Psychiatry, 68(3), 241–251.",
      "Miklowitz, D. J. (2008). Adjunctive psychotherapy for bipolar disorder: state of the evidence. American Journal of Psychiatry, 165(11), 1408–1419."
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-bipolar';

-- ============================================================
-- CONDICIÓN 34: Trastorno Obsesivo-Compulsivo (TOC)
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'toc',
  'Trastorno Obsesivo-Compulsivo (TOC)',
  'Pensamientos intrusivos persistentes y rituales para aliviar la angustia',
  'El TOC es un trastorno caracterizado por obsesiones (pensamientos, imágenes o impulsos intrusivos que generan angustia) y compulsiones (comportamientos o actos mentales repetitivos para reducir esa angustia). No es una manía de orden ni excentricidad: es una condición seria con tratamientos muy efectivos.',
  'psiquiatría',
  'F42',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "El Trastorno Obsesivo-Compulsivo (TOC) es una condición en la que experimentas dos tipos de síntomas que se retroalimentan: obsesiones y compulsiones. Las obsesiones son pensamientos, imágenes o impulsos intrusivos, repetitivos y no deseados que generan una angustia intensa. Las compulsiones son comportamientos o actos mentales que realizas para aliviar esa angustia, aunque solo temporalmente.",
      "Imagina un pensamiento que se te 'pega' sin que lo invites —por ejemplo, el miedo de haber dejado el gas abierto o de contaminar a alguien— y que te genera una angustia tan intensa que sientes que tienes que hacer algo para aliviarla. Ese algo (revisar el gas 15 veces, lavarte las manos durante media hora) alivia la angustia momentáneamente, pero refuerza el ciclo, haciendo que el pensamiento vuelva con más fuerza.",
      "El TOC NO es ser ordenado o perfeccionista. Las obsesiones del TOC son pensamientos egodistónicos —es decir, son vividos como ajenos a uno mismo, perturbadores y no deseados, lo opuesto a los valores de la persona. A veces incluyen pensamientos de daño, temas religiosos, o de tipo sexual, que causan muchísima vergüenza.",
      "Afecta aproximadamente al 1-2% de la población mundial y aparece típicamente en la infancia tardía, adolescencia o adultez temprana. Afecta por igual a hombres y mujeres.",
      "El TOC tiene tratamientos muy efectivos. La terapia de exposición y prevención de respuesta (EPR) es el tratamiento psicológico gold standard, y la medicación con ISRS a dosis altas es muy eficaz. La mayoría de las personas con TOC mejoran significativamente con tratamiento adecuado."
    ],
    "callout": {"label": "Dato clave", "body": "Los pensamientos intrusivos perturbadores (de daño, sexuales, blasfemos) son una manifestación común del TOC, no una señal de maldad. La angustia que causan y el esfuerzo por suprimirlos son precisamente lo que los diferencia de los pensamientos de las personas que realmente quieren actuar sobre ellos."}
  }'::jsonb
from conditions c where c.slug = 'toc';

-- Sección 2: Causas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El TOC tiene causas múltiples que incluyen factores genéticos, neurobiológicos y ambientales.",
      "Factores genéticos: Existe un componente hereditario moderado. Tener un familiar de primer grado con TOC aumenta el riesgo, aunque no de forma determinante. Los genes parecen influir en la vulnerabilidad al TOC más que en su presentación específica.",
      "Factores neurobiológicos: Los estudios de neuroimagen muestran diferencias en el circuito córtico-estriado-tálamo-cortical —un circuito que regula el control de impulsos y el procesamiento de errores. El sistema serotoninérgico también está implicado, lo que explica la eficacia de los ISRS.",
      "Factores psicológicos: La fusión pensamiento-acción (creer que pensar algo es tan malo como hacerlo), la sobreestimación de la amenaza, el perfeccionismo y la intolerancia a la incertidumbre son factores cognitivos que mantienen el TOC.",
      "Factores ambientales: El estrés, los traumas, las enfermedades infecciosas (existe el PANDAS —TOC de inicio agudo post-estreptocócico en niños—), y los cambios hormonales pueden desencadenar o empeorar el TOC en personas con predisposición.",
      "Una nota importante: el TOC no es causado por una crianza deficiente ni por debilidad moral. Es una condición neurobiológica real."
    ]
  }'::jsonb
from conditions c where c.slug = 'toc';

-- Sección 3: Síntomas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El TOC se manifiesta a través de obsesiones y compulsiones. Las compulsiones pueden ser comportamientos visibles o actos mentales (rezar, contar, repetir palabras mentalmente).",
      "Temas obsesivos comunes: contaminación y gérmenes; daño (a uno mismo o a otros); simetría y orden; pensamientos inaceptables (de tipo sexual, religioso o violento); acumulación; y verificación.",
      "Compulsiones comunes: lavado y limpieza excesivos; verificar (puertas, gas, electrodomésticos); ordenar y organizar hasta lograr que se sienta 'correcto'; repetir acciones un número específico de veces; buscar reaseguración en otras personas; neutralizar con actos mentales.",
      "El criterio clave del DSM-5: Las obsesiones y compulsiones consumen más de 1 hora diaria O causan malestar significativo O interfieren con el funcionamiento en el trabajo, las relaciones o las actividades diarias."
    ],
    "alarms": [
      {"tone": "red", "t": "Pensamientos de hacerse daño o daño a otros que generan terror", "d": "Es importante distinguir entre los pensamientos egodistónicos del TOC (que causan angustia y son no deseados) y pensamientos que generan deseo real de actuar. Si tienes dudas, consulta con un profesional de salud mental."},
      {"tone": "red", "t": "Incapacidad total de funcionar", "d": "Si las compulsiones te toman la mayor parte del día y no puedes trabajar, salir de casa o relacionarte, necesitas evaluación urgente."},
      {"tone": "amber", "t": "Más de 1 hora diaria en rituales", "d": "Si tus rituales o pensamientos intrusivos consumen más de una hora al día y esto lleva varias semanas, es momento de buscar evaluación profesional."},
      {"tone": "amber", "t": "Evitación de situaciones por miedo a obsesiones", "d": "Si empiezas a evitar lugares, objetos o personas por miedo a desencadenar tus obsesiones, el TOC está limitando tu vida y necesitas tratamiento."},
      {"tone": "amber", "t": "Secretismo y vergüenza extremos", "d": "Si sientes tanta vergüenza por tus pensamientos que no se los has contado a nadie, recuerda que los terapeutas especializados en TOC conocen todos los tipos de obsesiones y no te juzgarán."}
    ]
  }'::jsonb
from conditions c where c.slug = 'toc';

-- Sección 4: Diagnóstico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El TOC se diagnostica clínicamente mediante entrevista. Es fundamental buscar a un profesional con experiencia en TOC, ya que los temas de las obsesiones a veces generan malentendidos.",
      "El médico evaluará: presencia de obsesiones y compulsiones, tiempo que consumen, grado de insight (la persona reconoce que los miedos son excesivos), impacto en el funcionamiento, y diagnósticos diferenciales.",
      "Herramientas diagnósticas: La Yale-Brown Obsessive Compulsive Scale (Y-BOCS) es el instrumento más usado para medir la severidad del TOC. Evalúa por separado las obsesiones y las compulsiones en tiempo, interferencia, angustia, resistencia y control.",
      "Diagnóstico diferencial: Es importante distinguir el TOC del trastorno de ansiedad generalizada, el trastorno dismórfico corporal (en el que las obsesiones se centran en defectos físicos percibidos), el trastorno de acumulación, y los tics. Todos requieren aproximaciones terapéuticas distintas."
    ],
    "callout": {"label": "El insight en el TOC", "body": "La mayoría de las personas con TOC saben racionalmente que sus miedos son irracionales, pero aun así sienten que deben realizar las compulsiones. Este 'saber que es absurdo pero no poder parar' es muy característico del TOC y no significa que estés perdiendo la razón."}
  }'::jsonb
from conditions c where c.slug = 'toc';

-- Sección 5: Tratamientos
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El TOC responde muy bien a dos intervenciones principales: la terapia de exposición y prevención de respuesta (EPR) y los ISRS a dosis altas.",
      "Exposición y Prevención de Respuesta (EPR): Es el tratamiento psicológico con mayor evidencia para el TOC, avalado por el NICE, la APA y guías internacionales. Consiste en exponerse gradualmente a las situaciones que desencadenan obsesiones (exposición) y abstenerse de realizar las compulsiones (prevención de respuesta), permitiendo que la ansiedad disminuya sola con el tiempo. Es un proceso gradual, siempre a tu ritmo, y muy efectivo cuando se hace con un terapeuta especializado.",
      "Medicación con ISRS: La clomipramina (un antidepresivo tricíclico), la fluoxetina, la fluvoxamina, la paroxetina y la sertralina tienen aprobación para el TOC. Se usan a dosis más altas que en la depresión y tardan más en hacer efecto (8-12 semanas). Son seguros para uso prolongado.",
      "Combinación: La combinación de EPR + ISRS suele ser más efectiva que cualquiera por separado en TOC moderado-severo.",
      "TOC resistente: Si dos ISRS no han funcionado, existen estrategias de potenciación (añadir antipsicóticos como risperidona o aripiprazol). La estimulación cerebral profunda (DBS) tiene aprobación de la FDA para TOC severo y resistente.",
      "Importante: Evita los enfoques que solo buscan reducir la ansiedad de forma inmediata (como las benzodiacepinas de forma continua) sin trabajar la EPR, ya que refuerzan el ciclo del TOC a largo plazo."
    ],
    "callout": {"label": "La EPR es difícil pero funciona", "body": "La exposición y prevención de respuesta puede parecer aterradora al principio: estás haciendo exactamente lo contrario a lo que el TOC te pide. Pero la evidencia es contundente: es el tratamiento que produce los mayores cambios duraderos. Un buen terapeuta te guiará paso a paso."}
  }'::jsonb
from conditions c where c.slug = 'toc';

-- Sección 6: Vida diaria
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con TOC requiere aprender a relacionarse de forma diferente con los pensamientos: no son órdenes, no son señales de peligro real, y no dicen nada sobre quién eres.",
      "No luches contra los pensamientos: La supresión activa de los pensamientos intrusivos los hace volver con más fuerza (el efecto del oso blanco). La EPR te enseña a dejar que los pensamientos pasen sin responder a ellos. Piénsalos como ruido de fondo, no como alarmas reales.",
      "Resiste las compulsiones: Cada vez que realizas una compulsión, alivias la angustia a corto plazo pero refuerzas el ciclo. Resistir —aunque sea un poco, aunque sea un poco más de tiempo que la vez anterior— debilita el circuito del TOC gradualmente.",
      "No busques reaseguración: Pedir a familiares o amigos que te confirmen que no ha pasado nada malo es una compulsión de reaseguración. Tu entorno puede ayudarte mejor no respondiendo a estas peticiones, con amabilidad.",
      "Comunica tu diagnóstico a tu entorno cercano: Que las personas que te rodean entiendan el TOC ayuda a que no participen involuntariamente en los rituales (lo que se llama acomodación familiar, que mantiene el TOC).",
      "El progreso no es lineal: Habrá días mejores y peores. Las recaídas son parte del proceso, no un fracaso. Retoma el trabajo con tu terapeuta."
    ]
  }'::jsonb
from conditions c where c.slug = 'toc';

-- Sección 7: Preguntas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
    "questions": [
      "¿Qué tan severo es mi TOC y cómo lo medimos?",
      "¿Me recomienda empezar con EPR, medicación o las dos?",
      "¿Puede recomendarme un terapeuta especializado en EPR para TOC?",
      "¿Qué ISRS recomienda para mí y a qué dosis?",
      "¿Cuánto tiempo tardaré en sentir efecto con la medicación?",
      "¿Mis pensamientos intrusivos (aunque sean muy perturbadores) son típicos del TOC?",
      "¿Cómo debo responder cuando tengo una obsesión intensa?",
      "¿Qué le digo a mi familia para que me ayude sin participar en los rituales?",
      "¿El TOC puede desaparecer completamente o es algo de por vida?",
      "¿Hay grupos de apoyo para TOC en mi ciudad o en línea?",
      "¿Qué pasa si el primer ISRS no me funciona?",
      "¿Puedo hacer EPR sola/solo con libros o apps, o necesito un terapeuta?"
    ]
  }'::jsonb
from conditions c where c.slug = 'toc';

-- Sección 8: Fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.). APA Publishing.",
      "National Institute for Health and Care Excellence. (2005). Obsessive-compulsive disorder and body dysmorphic disorder: treatment. NICE Clinical Guideline CG31. https://www.nice.org.uk/guidance/cg31",
      "Foa, E. B., et al. (2005). Randomized, placebo-controlled trial of exposure and ritual prevention, clomipramine, and their combination in the treatment of obsessive-compulsive disorder. American Journal of Psychiatry, 162(1), 151–161.",
      "Abramowitz, J. S., Taylor, S., & McKay, D. (2009). Obsessive-compulsive disorder. The Lancet, 374(9688), 491–499.",
      "Goodman, W. K., et al. (1989). The Yale-Brown Obsessive Compulsive Scale: I. Development, use, and reliability. Archives of General Psychiatry, 46(11), 1006–1011.",
      "Simpson, H. B., et al. (2013). Treatment of obsessive-compulsive disorder complicated by comorbid eating disorders. Cognitive Behaviour Therapy, 42(1), 64–76.",
      "Sookman, D., & Steketee, G. (2010). Specialized cognitive behavior therapy for treatment resistant obsessive compulsive disorder. In D. Sookman & R. Leahy (Eds.), Treatment Resistant Anxiety Disorders. Routledge."
    ]
  }'::jsonb
from conditions c where c.slug = 'toc';

-- ============================================================
-- CONDICIÓN 35: Trastorno de Estrés Postraumático (PTSD)
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'ptsd',
  'Trastorno de Estrés Postraumático (PTSD)',
  'Respuesta intensa y persistente del sistema nervioso ante un trauma vivido',
  'El PTSD es una condición que puede desarrollarse después de vivir o presenciar un evento traumático. Se caracteriza por revivir el trauma, evitar recordatorios, cambios negativos en el estado de ánimo y activación excesiva del sistema nervioso. Es una respuesta normal del cerebro ante experiencias anormales, y tiene tratamientos muy efectivos.',
  'psiquiatría',
  'F43.1',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "El Trastorno de Estrés Postraumático (PTSD, por sus siglas en inglés) es una condición que puede desarrollarse después de que una persona experimenta, presencia o se entera de un evento traumático —como violencia, accidentes, desastres naturales, guerra, abuso sexual o la muerte violenta de un ser querido.",
      "Lo que hace el PTSD es que el sistema de memoria y alarma del cerebro queda 'atascado' en el trauma: en lugar de procesar el evento como un recuerdo del pasado, el cerebro lo siente como si estuviera ocurriendo ahora. Por eso las personas con PTSD reviven el trauma con una intensidad aterradora.",
      "No todas las personas que viven un trauma desarrollan PTSD. La mayoría experimenta reacciones de estrés agudo que se resuelven en semanas. El PTSD se diagnostica cuando los síntomas persisten más de un mes y afectan significativamente el funcionamiento. Desarrollar PTSD no es señal de debilidad: refleja la intensidad del trauma y la biología individual.",
      "Según el DSM-5, el PTSD afecta aproximadamente al 8-9% de la población a lo largo de la vida. Es más frecuente en mujeres (2 veces más que en hombres), posiblemente porque están más expuestas a traumas de tipo interpersonal (violencia, abuso), que tienen mayor probabilidad de causar PTSD.",
      "El PTSD es altamente tratable. Las terapias centradas en el trauma —como la terapia de procesamiento cognitivo (TPC) y la desensibilización y reprocesamiento por movimientos oculares (EMDR)— tienen evidencia sólida y permiten que muchas personas alcancen la remisión completa."
    ],
    "callout": {"label": "Dato clave", "body": "El PTSD no es señal de debilidad. Es la respuesta de un cerebro normal a experiencias anormales. La pregunta no es '¿qué tiene esta persona?', sino '¿qué le pasó?'"}
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- Sección 2: Causas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El PTSD se desarrolla como resultado de la exposición a un trauma, pero no todos los que viven traumas desarrollan PTSD. La probabilidad de desarrollarlo depende de factores relacionados con el trauma, la biología individual y el contexto.",
      "Factores relacionados con el trauma: Los traumas interpersonales (violación, tortura, abuso) tienen mayor probabilidad de causar PTSD que los traumas no interpersonales (accidentes, desastres naturales). La duración, la severidad, la cercanía al peligro y la implicación personal aumentan el riesgo.",
      "Factores biológicos: Existen diferencias en el eje hipotálamo-hipófisis-adrenal (el sistema de respuesta al estrés) y en la amígdala (el centro de alarma) que hacen a algunas personas más vulnerables. Hay un componente genético moderado.",
      "Factores de riesgo psicológicos: Historia de trauma previo (especialmente en la infancia), trastornos mentales previos, bajo apoyo social después del trauma y respuesta de pánico intensa en el momento del trauma aumentan el riesgo.",
      "Factores protectores: Un apoyo social sólido después del trauma es el factor protector más potente. El acceso rápido a intervención psicológica (primeros auxilios psicológicos) también reduce el riesgo de PTSD."
    ]
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- Sección 3: Síntomas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El DSM-5 agrupa los síntomas del PTSD en 4 grupos, todos presentes durante más de 1 mes y causando malestar o deterioro significativo.",
      "1. Síntomas de reexperimentación: flashbacks (revivir el trauma como si ocurriera ahora), pesadillas, angustia intensa ante recordatorios del trauma, reacciones físicas ante recordatorios (palpitaciones, sudoración).",
      "2. Síntomas de evitación: evitar pensamientos o sentimientos relacionados con el trauma; evitar personas, lugares, conversaciones o situaciones que lo recuerdan.",
      "3. Cambios negativos en cognición y estado de ánimo: incapacidad de recordar aspectos importantes del trauma, creencias negativas persistentes sobre uno mismo o el mundo, culpa distorsionada, emociones negativas persistentes (miedo, horror, culpa, vergüenza), pérdida de interés, sentimiento de estar alejado de los demás, incapacidad de experimentar emociones positivas.",
      "4. Cambios en activación y reactividad: irritabilidad o arrebatos de ira, comportamiento temerario, hipervigilancia (estar siempre alerta al peligro), respuesta de sobresalto exagerada, dificultades para concentrarse, trastornos del sueño."
    ],
    "alarms": [
      {"tone": "red", "t": "Pensamientos de suicidio", "d": "El PTSD aumenta significativamente el riesgo de suicidio. Si tienes pensamientos de quitarte la vida, busca ayuda de emergencia inmediatamente. Ve a urgencias o llama a una línea de crisis."},
      {"tone": "red", "t": "Disociación severa", "d": "Si experimentas episodios en los que no sabes dónde estás, quién eres o sientes que te estás desconectando de la realidad de forma frecuente, busca evaluación urgente."},
      {"tone": "amber", "t": "Uso de sustancias para manejar el trauma", "d": "El uso de alcohol u otras sustancias para bloquear los recuerdos o las emociones es muy común en PTSD y empeora el pronóstico. Consulta pronto."},
      {"tone": "amber", "t": "Aislamiento social progresivo", "d": "Si has dejado de ver a personas que te importan o sientes que nadie puede entenderte, el aislamiento empeora el PTSD. Busca apoyo profesional."},
      {"tone": "amber", "t": "Síntomas que persisten más de un mes", "d": "Reacciones de estrés después de un trauma son normales. Si después de un mes sigues experimentando flashbacks, pesadillas o evitación intensa, consulta a un profesional."}
    ]
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- Sección 4: Diagnóstico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El PTSD se diagnostica mediante una entrevista clínica cuidadosa. Es importante crear un entorno seguro para hablar del trauma, ya que muchas personas sienten vergüenza o miedo de revelar lo que vivieron.",
      "El médico o psicólogo evaluará: el tipo de trauma vivido, la presencia e intensidad de los 4 grupos de síntomas del DSM-5, la duración de los síntomas (más de 1 mes) y el impacto en el funcionamiento diario.",
      "Herramientas diagnósticas: El PTSD Checklist for DSM-5 (PCL-5) es un cuestionario de 20 ítems, autoaplicado y validado en español, que mide la severidad de los síntomas. La Clinician-Administered PTSD Scale (CAPS-5) es la entrevista estructurada más completa para diagnóstico formal.",
      "No es necesario entrar en todos los detalles del trauma para recibir el diagnóstico. El terapeuta especializado sabe cómo evaluar sin re-traumatizar."
    ],
    "callout": {"label": "Hablar del trauma no siempre es necesario de inmediato", "body": "No necesitas contar todos los detalles del trauma para recibir ayuda. El diagnóstico inicial puede hacerse evaluando los síntomas. El trabajo con el trauma en sí se hace de forma gradual y segura en la terapia."}
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- Sección 5: Tratamientos
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El PTSD tiene tratamientos muy efectivos. Las guías internacionales (NICE, APA, OMS) recomiendan como primera línea las psicoterapias centradas en el trauma.",
      "Terapia de Procesamiento Cognitivo (TPC): Ayuda a identificar y modificar los pensamientos y creencias negativas que se formaron como consecuencia del trauma (como 'fue mi culpa', 'el mundo es completamente peligroso'). Es estructurada, habitualmente 12 sesiones, y tiene evidencia sólida.",
      "Terapia de Exposición Prolongada (EP): Implica procesar gradualmente los recuerdos traumáticos y exponerse de forma segura a situaciones evitadas. Permite que el cerebro 'aprenda' que los recuerdos, aunque dolorosos, no son peligrosos en el presente.",
      "EMDR (Desensibilización y Reprocesamiento por Movimientos Oculares): Es un enfoque terapéutico en el que el paciente evoca recuerdos traumáticos mientras el terapeuta dirige movimientos oculares bilaterales. Tiene amplia evidencia y es recomendado por la OMS. Funciona facilitando el procesamiento natural de la memoria traumática.",
      "Medicación: Los ISRS (sertralina, paroxetina) tienen aprobación de la FDA para PTSD y pueden ser útiles, especialmente para síntomas de depresión, ansiedad o insomnio asociados. La medicación es un complemento de la terapia, no un sustituto.",
      "Estabilización antes del procesamiento: En traumas complejos o cuando la persona no está estable, el tratamiento empieza con estrategias de regulación emocional y estabilización antes de trabajar directamente con los recuerdos traumáticos."
    ],
    "callout": {"label": "El EMDR no es magia", "body": "El EMDR tiene una base de evidencia sólida y es recomendado por la OMS, APA y NICE. Aunque su mecanismo exacto no está completamente explicado, múltiples ensayos clínicos demuestran que es efectivo para el PTSD. No te fíes de críticas que confunden el mecanismo con la efectividad."}
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- Sección 6: Vida diaria
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con PTSD requiere construir seguridad —interna y externa— y aprender a manejar las reacciones del sistema nervioso que el trauma dejó activadas.",
      "Seguridad primero: Si el trauma fue a manos de una persona con quien todavía tienes contacto, el primer paso es asegurar tu seguridad física. Sin seguridad básica, el tratamiento no puede avanzar.",
      "Regulación del sistema nervioso: El PTSD mantiene el sistema nervioso en alerta máxima. Técnicas de regulación como la respiración profunda, el grounding (anclarse al presente a través de los sentidos) y el movimiento físico ayudan a 'bajar la guardia'.",
      "Rutina y predictibilidad: El cerebro traumatizado necesita predictibilidad para sentirse seguro. Mantener rutinas regulares —horarios de sueño, comidas, actividad— reduce la hiperactivación.",
      "Red de apoyo: Hablar de lo que vives (aunque no sea del trauma en sí) con personas de confianza reduce el aislamiento. Existen grupos de apoyo para supervivientes de trauma que pueden ser muy útiles.",
      "Paciencia con el proceso: La recuperación del PTSD no es lineal. Habrá días en que el trauma se siente más presente. Esto no significa que estés empeorando: forma parte del procesamiento. Con tiempo y tratamiento adecuado, la mayoría de las personas mejoran significativamente."
    ]
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- Sección 7: Preguntas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
    "questions": [
      "¿Tengo PTSD o podría ser otra condición relacionada con el trauma?",
      "¿Qué tipo de terapia recomienda para mi caso: TPC, Exposición Prolongada o EMDR?",
      "¿Necesito medicación además de la terapia?",
      "¿Tengo que contar todos los detalles del trauma para que la terapia funcione?",
      "¿Cuánto tiempo suele durar el tratamiento del PTSD?",
      "¿Qué hago cuando tengo un flashback o un episodio de angustia intensa?",
      "¿Cómo sé si la terapia está funcionando?",
      "¿Cómo puedo manejar el insomnio y las pesadillas mientras empiezo el tratamiento?",
      "¿Mi familia o personas cercanas deberían saber algo sobre el PTSD para apoyarme mejor?",
      "¿Hay riesgo de que mis síntomas empeoren al hablar del trauma en terapia?",
      "¿Puedo combinar la terapia con ejercicio u otras estrategias de autocuidado?",
      "¿Existe algún grupo de apoyo para personas con PTSD que me pueda recomendar?"
    ]
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- Sección 8: Fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.). APA Publishing.",
      "National Institute for Health and Care Excellence. (2018). Post-traumatic stress disorder. NICE Guideline NG116. https://www.nice.org.uk/guidance/ng116",
      "World Health Organization. (2013). Guidelines for the management of conditions specifically related to stress. WHO Press.",
      "Foa, E. B., et al. (2007). Prolonged exposure therapy for PTSD: Emotional processing of traumatic experiences. Oxford University Press.",
      "Shapiro, F. (2018). Eye movement desensitization and reprocessing (EMDR) therapy: Basic principles, protocols, and procedures (3rd ed.). Guilford Press.",
      "Resick, P. A., et al. (2008). A randomized clinical trial to dismantle components of cognitive processing therapy for posttraumatic stress disorder in female victims of interpersonal violence. Journal of Consulting and Clinical Psychology, 76(2), 243–258.",
      "Kessler, R. C., et al. (1995). Posttraumatic stress disorder in the National Comorbidity Survey. Archives of General Psychiatry, 52(12), 1048–1060."
    ]
  }'::jsonb
from conditions c where c.slug = 'ptsd';

-- ============================================================
-- CONDICIÓN 36: Trastorno de Pánico
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'trastorno-de-panico',
  'Trastorno de Pánico',
  'Ataques de pánico inesperados y miedo a que vuelvan a ocurrir',
  'El trastorno de pánico se caracteriza por ataques de pánico recurrentes e inesperados —episodios intensos de miedo con síntomas físicos intensos— y por la preocupación persistente por futuros ataques. Los ataques de pánico son aterradores pero no peligrosos. Con tratamiento, la gran mayoría de las personas los supera completamente.',
  'psiquiatría',
  'F41.0',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "El trastorno de pánico se caracteriza por ataques de pánico recurrentes e inesperados, seguidos de al menos un mes de preocupación persistente por futuros ataques o cambios significativos de comportamiento para evitarlos (como dejar de salir solo, evitar el transporte público o hacer ejercicio).",
      "Un ataque de pánico es un episodio de miedo intenso que alcanza su pico en minutos y durante el cual se presentan síntomas físicos muy intensos: palpitaciones, sudoración, temblor, sensación de ahogo, dolor en el pecho, mareos, entumecimiento, escalofríos, y a menudo la certeza de estar muriendo, perdiendo el control o 'volviéndose loco'. Es una de las experiencias más aterradoras que puede vivir una persona.",
      "Lo paradójico del ataque de pánico es que, aunque se siente como una emergencia médica, no es peligroso. Lo que ocurre es que el sistema de alarma del cerebro (la respuesta de lucha-huida) se activa sin un peligro real. El cuerpo prepara una respuesta de emergencia —acelera el corazón, redistribuye el flujo sanguíneo, tensa los músculos— pero al no haber amenaza real, todas esas sensaciones se vuelven el centro de la atención, creando más miedo.",
      "El trastorno de pánico afecta al 2-3% de la población y es más frecuente en mujeres. Suele comenzar en la adultez temprana, aunque puede aparecer a cualquier edad.",
      "El pronóstico es excelente. Con tratamiento adecuado, la mayoría de las personas dejan de tener ataques de pánico y recuperan su funcionalidad completamente. No tendrás pánico para siempre."
    ],
    "callout": {"label": "Los ataques de pánico no matan", "body": "Durante un ataque de pánico, el corazón se acelera, pero no va a fallar. Las sensaciones de ahogo son reales, pero el oxígeno en tu sangre está bien. El pánico es aterrador, pero no peligroso. Esta información, aunque difícil de creer en el momento, es la base del tratamiento."}
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- Sección 2: Causas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El trastorno de pánico surge de la interacción entre una predisposición biológica y factores psicológicos y ambientales.",
      "Factores biológicos: Existe una heredabilidad moderada. El sistema de alarma del cerebro —especialmente la amígdala y el locus coeruleus (centro noradrenérgico)— tiende a ser más sensible en personas con trastorno de pánico. Algunas personas son más sensibles a las sensaciones físicas de activación autonómica (ansiedad interoceptiva).",
      "El modelo cognitivo del pánico: El modelo más aceptado (Clark, 1986) propone que el pánico surge de una interpretación catastrófica de sensaciones corporales normales. Por ejemplo: el corazón late más rápido (tal vez por café o ejercicio) → 'estoy teniendo un infarto' → más ansiedad → más palpitaciones → más miedo → ataque de pánico. Es un círculo que se retroalimenta.",
      "Factores desencadenantes: El primer ataque de pánico suele ocurrir en un momento de estrés elevado, después de una enfermedad, con estimulantes (cafeína, anfetaminas), durante cambios hormonales, o aparentemente de la nada. Después del primer ataque, el miedo a que vuelva puede convertirse en el principal mantenedor.",
      "Factores ambientales: El estrés crónico, las experiencias de pérdida o cambio importante, y haber crecido en entornos de alta ansiedad o sobreprotección pueden contribuir."
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- Sección 3: Síntomas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "El síntoma central es el ataque de pánico: un episodio de miedo o malestar intenso que alcanza su máxima intensidad en minutos. El DSM-5 requiere al menos 4 de los siguientes síntomas durante el ataque:",
      "Síntomas físicos del ataque: palpitaciones o taquicardia, sudoración, temblores, sensación de ahogo o de falta de aire, sensación de asfixia, dolor o malestar en el pecho, náuseas o malestar abdominal, mareos o sensación de desmayo, escalofríos o sofocos, entumecimiento u hormigueo.",
      "Síntomas cognitivos del ataque: despersonalización (sentirse separado de uno mismo) o desrealización (sentir que el entorno no es real), miedo a perder el control o 'volverse loco', miedo a morir.",
      "Síntomas entre ataques (que definen el trastorno): preocupación persistente por tener más ataques, preocupación por las consecuencias del ataque (infarto, locura), y cambios de comportamiento para evitarlos (agorafobia, evitar ejercicio, cafeína, lugares concurridos)."
    ],
    "alarms": [
      {"tone": "red", "t": "Primer ataque de pánico — descartar causa médica", "d": "El primer episodio de síntomas intensos (dolor de pecho, taquicardia, falta de aire) siempre debe evaluarse médicamente para descartar causas cardíacas o respiratorias. Una vez descartadas, el diagnóstico de pánico es más sólido."},
      {"tone": "red", "t": "Agorafobia severa", "d": "Si el miedo a los ataques de pánico te ha llevado a no poder salir de casa o a necesitar siempre a alguien contigo para salir, necesitas evaluación y tratamiento urgente para evitar mayor deterioro."},
      {"tone": "amber", "t": "Evitación creciente", "d": "Si cada semana evitas más lugares, situaciones o actividades por miedo a tener un ataque, el trastorno se está agravando. Consulta pronto."},
      {"tone": "amber", "t": "Ataques frecuentes (más de 1 por semana)", "d": "Si tienes más de un ataque por semana, el impacto en tu calidad de vida es alto y necesitas tratamiento especializado."},
      {"tone": "amber", "t": "Uso de alcohol o sedantes para controlar el pánico", "d": "Usar sustancias para reducir la ansiedad o prevenir ataques de pánico crea dependencia y empeora el trastorno a largo plazo. Consulta con tu médico."}
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- Sección 4: Diagnóstico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico del trastorno de pánico es clínico, pero es fundamental descartar primero causas médicas, especialmente cardiovasculares y endocrinas, que pueden presentarse con síntomas similares.",
      "Evaluación médica: análisis de sangre (tiroides, glucosa, electrolitos), electrocardiograma, y si hay síntomas respiratorios, evaluación pulmonar. Esto no es burocracia: es asegurarse de que no hay una causa tratable que se esté pasando por alto.",
      "Una vez descartadas las causas médicas, el médico o psiquiatra realizará la entrevista clínica evaluando: frecuencia y características de los ataques, presencia de agorafobia (miedo a situaciones de las que sería difícil escapar durante un ataque), impacto en el funcionamiento, y antecedentes.",
      "Herramientas: El Panic Disorder Severity Scale (PDSS) y el Agoraphobic Cognitions Questionnaire son instrumentos útiles para medir la severidad. El diario de ataques de pánico (registrar cuándo, dónde, intensidad y qué estaba haciendo) es muy valioso para el diagnóstico y el seguimiento."
    ],
    "callout": {"label": "La ruta diagnóstica típica", "body": "La mayoría de las personas con trastorno de pánico pasan primero por urgencias o cardiología antes de llegar al psiquiatra o psicólogo. Que los estudios médicos sean normales no significa que lo que sientes sea imaginario: significa que la causa es funcional (el sistema nervioso), no estructural, y que tiene solución."}
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- Sección 5: Tratamientos
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El trastorno de pánico tiene tratamientos con una de las tasas de éxito más altas entre los trastornos de ansiedad.",
      "Terapia cognitivo-conductual (TCC): Es el tratamiento de primera línea con mayor evidencia. Incluye psicoeducación (entender qué es el pánico), reestructuración cognitiva (cambiar las interpretaciones catastróficas), exposición interoceptiva (exponerse de forma gradual a las sensaciones físicas del pánico en un ambiente seguro), y exposición situacional (volver a los lugares evitados). Típicamente 12-15 sesiones.",
      "Medicación: Los ISRS (sertralina, fluoxetina, escitalopram) y los IRSN (venlafaxina) son la primera línea farmacológica para el trastorno de pánico. Tardan 2-4 semanas en hacer efecto completo. La imipramina (antidepresivo tricíclico) también tiene evidencia sólida.",
      "Benzodiacepinas: Pueden usarse a corto plazo para el alivio agudo, pero no se recomiendan como tratamiento principal por el riesgo de dependencia y porque interfieren con el aprendizaje que ocurre en la TCC.",
      "Combinación: La combinación de TCC + ISRS suele ser más efectiva que cualquiera por separado en casos moderados a severos o con agorafobia significativa.",
      "Técnicas de regulación: La respiración diafragmática y la relajación muscular progresiva son complementos útiles para manejar la activación autonómica, aunque no sustituyen a la TCC."
    ],
    "callout": {"label": "La exposición interoceptiva", "body": "Una parte de la TCC para el pánico involucra provocar deliberadamente algunas sensaciones del pánico en un contexto seguro (por ejemplo, hiperventilar por 30 segundos o dar vueltas en una silla). Esto parece contraintuitivo, pero enseña al cerebro que esas sensaciones no son peligrosas. Es muy efectivo y siempre se hace con guía terapéutica."}
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- Sección 6: Vida diaria
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con trastorno de pánico requiere aprender a no tenerle miedo al miedo. La evitación es el principal combustible del pánico: cada vez que evitas algo por miedo, le dices a tu cerebro que tenía razón en asustarse.",
      "Durante un ataque de pánico: recuerda que el ataque pasará (generalmente en 10-20 minutos), que no es peligroso y que no te vas a morir ni a 'volverte loco'. Enfoca tu atención en el entorno (5 cosas que ves, 4 que tocas, 3 que escuchas). Respira lento, desde el abdomen.",
      "Afronta en lugar de evitar: Cada vez que afrontas una situación temida y el ataque de pánico no ocurre —o si ocurre, lo superas— tu cerebro aprende que puede manejarlo. La recuperación se construye con pequeñas victorias de afrontamiento.",
      "Reduce los estimulantes: La cafeína, la nicotina y los estimulantes aumentan la activación del sistema nervioso y pueden desencadenar ataques. Reducirlos puede disminuir la frecuencia.",
      "Ejercicio regular: Aunque puede generar sensaciones físicas similares al pánico (taquicardia, sudoración), el ejercicio regular desensibiliza al sistema nervioso a esas sensaciones y reduce la ansiedad a largo plazo. Empieza gradual si tienes mucho miedo a las sensaciones físicas.",
      "Comunica tu condición: Si hay personas cercanas que te acompañan durante los ataques, explícales que la mejor ayuda es mantenerse tranquilos, no alarmarse y recordarte que el ataque pasará. El pánico de las personas que te cuidan retroalimenta el tuyo."
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- Sección 7: Preguntas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
    "questions": [
      "¿Se ha descartado alguna causa médica de mis síntomas?",
      "¿Tengo trastorno de pánico con o sin agorafobia?",
      "¿Qué tratamiento recomienda: TCC, medicación o los dos?",
      "Si me receta medicación, ¿cuánto tiempo tardará en hacer efecto?",
      "¿Las benzodiacepinas que tomo actualmente pueden estar dificultando mi recuperación?",
      "¿Qué debo hacer durante un ataque de pánico?",
      "¿Puedo hacer ejercicio de forma segura aunque me genere palpitaciones?",
      "¿Cuánto tiempo dura normalmente el tratamiento del trastorno de pánico?",
      "¿Puede el trastorno de pánico desaparecer completamente?",
      "¿Qué hace que el pánico vuelva después de mejorar?",
      "¿Hay algo en mi estilo de vida (cafeína, sueño, estrés) que esté empeorando los ataques?",
      "¿Me puede recomendar un psicólogo con experiencia en TCC para trastorno de pánico?"
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- Sección 8: Fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.). APA Publishing.",
      "National Institute for Health and Care Excellence. (2019). Generalised anxiety disorder and panic disorder in adults: management. NICE Clinical Guideline CG113. https://www.nice.org.uk/guidance/cg113",
      "Clark, D. M. (1986). A cognitive approach to panic. Behaviour Research and Therapy, 24(4), 461–470.",
      "Barlow, D. H., et al. (2000). Cognitive-behavioral therapy, imipramine, or their combination for panic disorder: A randomized controlled trial. JAMA, 283(19), 2529–2536.",
      "Pompoli, A., et al. (2016). Psychological therapies for panic disorder with or without agoraphobia in adults: a network meta-analysis. Cochrane Database of Systematic Reviews, (4), CD011004.",
      "Bandelow, B., et al. (2015). Efficacy of treatments for anxiety disorders: a meta-analysis. International Clinical Psychopharmacology, 30(4), 183–192.",
      "Craske, M. G., & Barlow, D. H. (2008). Panic disorder and agoraphobia. In D. H. Barlow (Ed.), Clinical handbook of psychological disorders (4th ed.). Guilford Press."
    ]
  }'::jsonb
from conditions c where c.slug = 'trastorno-de-panico';

-- ============================================================
-- CONDICIÓN 37: Fobia Social (Trastorno de Ansiedad Social)
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'fobia-social',
  'Fobia Social (Trastorno de Ansiedad Social)',
  'Miedo intenso a las situaciones sociales por temor al juicio o la vergüenza',
  'La fobia social es un miedo intenso y persistente a situaciones sociales o de actuación en las que la persona teme ser juzgada, humillada o actuar de forma embarazosa. Va mucho más allá de la timidez normal y puede limitar enormemente las relaciones, el trabajo y la calidad de vida. Tiene tratamientos muy efectivos.',
  'psiquiatría',
  'F40.1',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "La fobia social —también llamada trastorno de ansiedad social— es un miedo intenso y persistente a situaciones sociales o de actuación en las que la persona teme ser evaluada negativamente por otros. No es timidez. La timidez es una variante del temperamento normal; la fobia social es una condición que causa malestar significativo y limita la vida.",
      "Imagina que cada conversación, reunión de trabajo, llamada telefónica o cena social se convierte en una prueba de la que estás convencido de que vas a salir mal. Antes de ir, te preocupas durante días. Durante el evento, tu corazón se acelera, te ruborizas, y tu mente se queda en blanco o se llena de pensamientos sobre lo mal que lo estás haciendo. Después, repasas durante horas todo lo que 'salió mal'. Eso es la fobia social.",
      "El trastorno de ansiedad social es uno de los trastornos de ansiedad más frecuentes: afecta aproximadamente al 7-12% de la población a lo largo de la vida según el DSM-5. Suele comenzar en la adolescencia y, sin tratamiento, tiende a ser crónico.",
      "Existen dos presentaciones: la fobia social específica (miedo a uno o pocos tipos de situaciones, como hablar en público) y la fobia social generalizada (miedo a la mayoría de las situaciones sociales). La forma generalizada es más severa y está más asociada a dificultades laborales y relacionales.",
      "La buena noticia es que la fobia social responde muy bien a la terapia cognitivo-conductual y a la medicación. Con tratamiento adecuado, la mayoría de las personas logran participar en la vida social y profesional con mucha menos angustia."
    ],
    "callout": {"label": "Dato clave", "body": "La fobia social no es introversión ni timidez. La persona con fobia social quiere conectar con otros y participar en la vida social, pero el miedo intenso y la anticipación del rechazo se lo impiden. Esta distinción es importante para el diagnóstico y el tratamiento."}
  }'::jsonb
from conditions c where c.slug = 'fobia-social';

-- Sección 2: Causas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La fobia social resulta de la interacción entre predisposición biológica, experiencias de aprendizaje y factores culturales.",
      "Factores biológicos: Existe un componente genético moderado. El temperamento inhibido —la tendencia a ser cauteloso y retraído ante lo nuevo desde la infancia— es un factor de riesgo para desarrollar fobia social. A nivel cerebral se observa una respuesta exagerada de la amígdala a estímulos sociales amenazantes.",
      "Factores de aprendizaje: Experiencias de humillación, burlas, bullying o crítica severa en la infancia o adolescencia pueden condicionar respuestas de miedo a las situaciones sociales. También puede desarrollarse por observación (ver a otros ser humillados) o por información (mensajes muy críticos sobre el desempeño social).",
      "Factores cognitivos: Las personas con fobia social tienden a: centrar la atención en sí mismas durante las interacciones (en lugar de en la conversación), sobreestimar la probabilidad y las consecuencias de actuar de forma embarazosa, y subestimar sus habilidades sociales (en realidad suelen ser más competentes de lo que creen).",
      "Factores culturales: La prevalencia varía entre culturas. En culturas con alta preocupación por el honor social o el juicio del grupo, la fobia social puede tener características diferentes (en Japón, por ejemplo, el Taijin Kyofusho es una variante centrada en el miedo a ofender a otros)."
    ]
  }'::jsonb
from conditions c where c.slug = 'fobia-social';

-- Sección 3: Síntomas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Los síntomas de la fobia social aparecen en tres niveles: cognitivo (lo que piensas), físico (lo que sientes en el cuerpo) y conductual (lo que haces).",
      "Síntomas cognitivos: pensamientos negativos automáticos sobre el desempeño social ('voy a quedar como un idiota', 'se van a dar cuenta de que estoy nervioso'), creencias de que la actuación social perfecta es necesaria para ser aceptado, análisis exhaustivo después del evento social ('post-event processing').",
      "Síntomas físicos durante situaciones sociales: rubor, sudoración, temblor, taquicardia, voz temblorosa, tensión muscular, malestar estomacal, dificultad para concentrarse.",
      "Síntomas conductuales: evitación de situaciones sociales temidas, comportamientos de seguridad (no mirar a los ojos, hablar poco, prepararse en exceso), llegar tarde o irse pronto de eventos sociales, rechazar oportunidades laborales o sociales por el miedo.",
      "Situaciones típicamente temidas: hablar en público, conocer personas nuevas, comer o beber en público, iniciar o mantener conversaciones, ser el centro de atención, firmar o escribir delante de otros, usar baños públicos."
    ],
    "alarms": [
      {"tone": "red", "t": "Depresión severa asociada", "d": "La fobia social no tratada tiene alto riesgo de llevar a depresión mayor y aislamiento social severo. Si junto con la ansiedad social sientes tristeza profunda, pérdida de interés o pensamientos de no querer vivir, busca ayuda urgente."},
      {"tone": "red", "t": "Uso de alcohol para funcionar socialmente", "d": "Usar alcohol para poder participar en situaciones sociales es un riesgo importante de desarrollar dependencia al alcohol. Es una señal de que necesitas tratamiento especializado."},
      {"tone": "amber", "t": "Rechazo de oportunidades de trabajo o estudio", "d": "Si has rechazado empleos, ascensos, oportunidades de estudio o relaciones importantes por miedo a situaciones sociales, el impacto en tu vida es significativo. Busca evaluación profesional."},
      {"tone": "amber", "t": "Aislamiento social creciente", "d": "Si tu círculo social se ha ido reduciendo progresivamente y pasas cada vez más tiempo solo/a por evitar situaciones sociales, el trastorno está avanzando."},
      {"tone": "amber", "t": "Ansiedad anticipatoria de días antes", "d": "Si empiezas a preocuparte por un evento social días o semanas antes y esto interfiere con tu sueño o concentración, es momento de buscar ayuda."}
    ]
  }'::jsonb
from conditions c where c.slug = 'fobia-social';

-- Sección 4: Diagnóstico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "La fobia social se diagnostica mediante entrevista clínica. El médico o psicólogo evaluará el tipo y número de situaciones sociales temidas, la intensidad de la ansiedad, el grado de evitación y el impacto en el funcionamiento.",
      "Criterios clave del DSM-5: miedo marcado a situaciones sociales, miedo a actuar de modo que sea humillante o embarazoso, las situaciones siempre provocan ansiedad, se evitan o soportan con angustia intensa, el miedo es desproporcionado al riesgo real, dura al menos 6 meses, y causa malestar o deterioro significativo.",
      "Herramientas diagnósticas: La Liebowitz Social Anxiety Scale (LSAS) es el instrumento más usado para medir la severidad de la fobia social. Evalúa el miedo y la evitación en 24 situaciones sociales y de actuación diferentes. El Social Phobia Inventory (SPIN) es una alternativa más breve.",
      "Diagnóstico diferencial: Es importante distinguir la fobia social de la timidez normal (que no genera deterioro), del trastorno de pánico (el miedo está en las sensaciones físicas, no en el juicio social), de la depresión (el aislamiento es por anhedonia, no por miedo al juicio), y del trastorno de personalidad por evitación (que es más pervasivo)."
    ],
    "callout": {"label": "La fobia social es infradiagnosticada", "body": "Muchas personas con fobia social nunca buscan ayuda porque asumen que son 'así', que es su carácter o que no hay solución. El promedio de tiempo entre el inicio de los síntomas y la búsqueda de tratamiento es de más de 10 años. Si reconoces estos síntomas, busca evaluación: tiene solución."}
  }'::jsonb
from conditions c where c.slug = 'fobia-social';

-- Sección 5: Tratamientos
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "La fobia social responde muy bien a dos intervenciones principales: la terapia cognitivo-conductual (TCC) y la medicación con ISRS.",
      "Terapia cognitivo-conductual (TCC): Es el tratamiento de primera línea. Incluye reestructuración cognitiva (identificar y cambiar pensamientos automáticos negativos sobre el desempeño social), exposición gradual (afrontar de forma progresiva las situaciones sociales temidas, primero en imaginación y luego en vivo), y entrenamiento en habilidades sociales cuando es necesario. El formato grupal de TCC tiene ventajas adicionales porque el grupo mismo es una herramienta terapéutica.",
      "Medicación: Los ISRS (sertralina, paroxetina, fluvoxamina, escitalopram) y los IRSN (venlafaxina) son la primera línea farmacológica para la fobia social generalizada. Tardan 2-4 semanas en hacer efecto. La moclobemida (IMAO reversible) también tiene evidencia.",
      "Para situaciones específicas: Los betabloqueantes (como el propranolol) pueden ayudar en situaciones concretas de actuación (una presentación, un examen oral) reduciendo los síntomas físicos como el temblor y las palpitaciones. No son útiles para la fobia social generalizada.",
      "Terapia de aceptación y compromiso (ACT): Es una alternativa con evidencia creciente que enseña a aceptar la ansiedad social en lugar de luchar contra ella, y a actuar según los valores personales aunque la ansiedad esté presente.",
      "Combinación: En fobia social moderada-severa, la combinación de TCC + ISRS es generalmente más efectiva que cualquiera por separado."
    ],
    "callout": {"label": "Las habilidades sociales no son el problema", "body": "La mayoría de las personas con fobia social tienen habilidades sociales adecuadas. El problema no es que no sepan cómo comportarse: es que la ansiedad bloquea el acceso a esas habilidades. Por eso el tratamiento principal es la exposición y la reestructuración cognitiva, no simplemente practicar habilidades sociales."}
  }'::jsonb
from conditions c where c.slug = 'fobia-social';

-- Sección 6: Vida diaria
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "La clave para mejorar la fobia social es la exposición gradual y consistente. La evitación es el mantenedor más potente del trastorno: cada situación social evitada confirma al cerebro que era peligrosa.",
      "Exposición gradual: Crea una jerarquía de situaciones sociales, de la menos a la más temida. Empieza por las más manejables y ve avanzando. No necesitas hacerlo solo: un terapeuta puede guiarte, pero también puedes empezar con pequeños pasos por tu cuenta.",
      "Elimina los comportamientos de seguridad: Hablar muy poco, no mirar a los ojos, prepararse en exceso, llegar con alguien que 'te rescate', revisar el teléfono constantemente. Estos comportamientos reducen la ansiedad a corto plazo pero impiden que aprendas que puedes manejar la situación.",
      "Cambia el foco de atención: En lugar de estar monitoreando constantemente cómo lo estás haciendo tú, intenta poner el foco en la otra persona, en la conversación, en el entorno. La atención auto-focalizada alimenta la ansiedad.",
      "Procesa sin rumiar: Es normal analizar cómo fueron las situaciones sociales, pero el repaso mental interminable de 'lo mal que lo hiciste' (post-event processing) es dañino. Cuando notes que estás en este bucle, redirige la atención.",
      "Conecta con tus valores: ¿Qué tipo de vida quieres vivir? ¿Qué relaciones, trabajo o experiencias son importantes para ti? Usar esos valores como guía —actuar a pesar de la ansiedad porque algo importa— es más poderoso que intentar eliminar la ansiedad antes de vivir."
    ]
  }'::jsonb
from conditions c where c.slug = 'fobia-social';

-- Sección 7: Preguntas
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
    "questions": [
      "¿Mi ansiedad social es fobia social generalizada o específica?",
      "¿Qué tratamiento recomienda para mi caso: TCC, medicación o los dos?",
      "¿Existe terapia de grupo para fobia social en mi área?",
      "Si me receta medicación, ¿cuánto tiempo tardaré en notar efecto?",
      "¿Los betabloqueantes podrían ayudarme para situaciones concretas como presentaciones?",
      "¿Cómo puedo empezar a exponerme a situaciones sociales de forma gradual?",
      "¿Qué son los 'comportamientos de seguridad' y cómo los identifico en mí?",
      "¿Cuánto tiempo lleva normalmente el tratamiento de la fobia social?",
      "¿Puede la fobia social desaparecer completamente o es algo que manejaré siempre?",
      "¿Hay algo que esté haciendo sin saberlo que esté empeorando mi ansiedad social?",
      "¿Cómo puedo manejar la ansiedad en situaciones sociales que no puedo evitar mientras empiezo el tratamiento?",
      "¿Me puede recomendar recursos o libros de autoayuda basados en evidencia para fobia social?"
    ]
  }'::jsonb
from conditions c where c.slug = 'fobia-social';

-- Sección 8: Fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Psychiatric Association. (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.). APA Publishing.",
      "National Institute for Health and Care Excellence. (2013). Social anxiety disorder: recognition, assessment and treatment. NICE Clinical Guideline CG159. https://www.nice.org.uk/guidance/cg159",
      "Liebowitz, M. R. (1987). Social phobia. Modern Problems of Pharmacopsychiatry, 22, 141–173.",
      "Heimberg, R. G., et al. (1998). Cognitive behavioral group therapy vs phenelzine therapy for social phobia: 12-week outcome. Archives of General Psychiatry, 55(12), 1133–1141.",
      "Blanco, C., et al. (2003). Pharmacological treatment of social anxiety disorder: a meta-analysis. Depression and Anxiety, 18(1), 29–40.",
      "Kessler, R. C., et al. (2005). Lifetime prevalence and age-of-onset distributions of DSM-IV disorders in the National Comorbidity Survey Replication. Archives of General Psychiatry, 62(6), 593–602.",
      "Clark, D. M., et al. (2006). Cognitive therapy versus exposure and applied relaxation in social phobia: A randomized controlled trial. Journal of Consulting and Clinical Psychology, 74(3), 568–578."
    ]
  }'::jsonb
from conditions c where c.slug = 'fobia-social';


-- Condiciones 38-42: Cardiovascular
-- Generado para Aliis — plataforma educativa para pacientes

-- ============================================================
-- CONDICIÓN 38: Hipertensión Arterial
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'hipertension-arterial',
  'Hipertensión Arterial',
  'La presión alta que silenciosamente daña tu corazón y arterias',
  'La hipertensión arterial ocurre cuando la fuerza de la sangre contra las paredes de tus arterias es persistentemente demasiado alta. A menudo no produce síntomas, pero con el tiempo daña el corazón, los riñones y el cerebro si no se trata.',
  'cardiología',
  'I10',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "Imagina que tienes una manguera de jardín conectada a un grifo. Si abres el grifo demasiado o la manguera está muy apretada, la presión del agua aumenta y con el tiempo puede dañar la manguera. Tu sistema circulatorio funciona de manera similar: el corazón bombea sangre a través de tus arterias, y la presión con que lo hace se llama presión arterial.",
      "La presión arterial se mide con dos números: el primero (sistólica) es la presión cuando el corazón late; el segundo (diastólica) es la presión cuando el corazón descansa entre latidos. Se expresa como, por ejemplo, 120/80 mmHg. La hipertensión se diagnostica cuando esta presión es igual o mayor a 130/80 mmHg de forma sostenida, según las guías ACC/AHA 2017.",
      "La hipertensión arterial es conocida como 'el asesino silencioso' porque en la mayoría de los casos no produce síntomas evidentes durante años. Sin embargo, esa presión elevada va dañando lentamente las paredes de las arterias, haciéndolas más rígidas y estrechas, lo que aumenta el riesgo de infarto, derrame cerebral, insuficiencia renal y otros problemas graves.",
      "Afecta aproximadamente a 1 de cada 3 adultos en el mundo, según la Organización Mundial de la Salud. En México y América Latina, cerca del 30-40% de los adultos tiene hipertensión, y una proporción significativa no lo sabe. Por eso medir tu presión arterial regularmente es tan importante.",
      "La buena noticia es que la hipertensión es manejable. Con cambios en el estilo de vida, medicamentos cuando son necesarios, y seguimiento médico regular, la mayoría de las personas con hipertensión llevan una vida completamente normal y reducen significativamente su riesgo de complicaciones."
    ],
    "callout": {
      "label": "Dato clave",
      "body": "Una presión arterial menor a 120/80 mmHg se considera normal. Entre 120-129/menos de 80 es presión elevada (prehipertensión). Igual o mayor a 130/80 mmHg en dos o más mediciones es hipertensión. Estos rangos son según las guías ACC/AHA 2017."
    }
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "En más del 90% de los casos, la hipertensión es 'esencial' o 'primaria', lo que significa que no tiene una causa única identificable, sino que resulta de la combinación de factores genéticos y del estilo de vida. El restante 10% es hipertensión 'secundaria', causada por otra condición como enfermedad renal, problemas de la glándula tiroides o apnea del sueño.",
      "Los factores de riesgo que no puedes cambiar incluyen la edad (la presión arterial tiende a aumentar con los años), la genética (si tus padres o hermanos tienen hipertensión, tu riesgo es mayor), y el origen étnico (las personas de ascendencia africana tienen mayor riesgo y suelen desarrollarla a edades más jóvenes).",
      "Los factores que sí puedes modificar son igual o más importantes: el exceso de peso aumenta la carga sobre el corazón; el consumo elevado de sal (sodio) hace que el cuerpo retenga más agua, aumentando la presión; el sedentarismo debilita el corazón; el tabaco daña las arterias directamente; el consumo excesivo de alcohol; y el estrés crónico activa el sistema nervioso de forma que eleva la presión. La diabetes y el colesterol alto también se asocian frecuentemente con hipertensión.",
      "El consumo de sodio es especialmente relevante: la mayoría de las personas consumen el doble de la cantidad recomendada (menos de 2,300 mg al día, según las guías dietéticas de EE.UU.). Gran parte del sodio no viene del salero, sino de alimentos procesados, embutidos, comida rápida y pan comercial.",
      "Ciertos medicamentos también pueden elevar la presión arterial, incluyendo anticonceptivos orales, antiinflamatorios como el ibuprofeno, descongestionantes nasales y algunos antidepresivos. Si tomas alguno de estos y tienes hipertensión, coméntalo con tu médico."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La hipertensión es llamada el 'asesino silencioso' precisamente porque la mayoría de las personas no sienten nada durante años. No esperes tener síntomas para revisar tu presión: la única forma de saber si la tienes es medirla.",
      "Algunos síntomas inespecíficos que a veces se atribuyen a la presión alta incluyen dolores de cabeza (especialmente en la nuca por las mañanas), mareos, zumbido en los oídos, visión borrosa o manchas, y sensación de pulsaciones en la cabeza. Sin embargo, estos síntomas son muy variables y no son confiables para diagnosticar hipertensión.",
      "Cuando la presión arterial sube de forma repentina y muy intensa (crisis hipertensiva, generalmente por encima de 180/120 mmHg), sí pueden aparecer síntomas más claros y esto constituye una emergencia médica que requiere atención inmediata."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Crisis hipertensiva — ve a urgencias ahora",
        "d": "Presión arterial mayor a 180/120 mmHg, especialmente si se acompaña de dolor de cabeza muy intenso, confusión, visión doble, dificultad para hablar o debilidad en un lado del cuerpo. Llama al servicio de emergencias."
      },
      {
        "tone": "red",
        "t": "Síntomas de derrame cerebral",
        "d": "Debilidad o entumecimiento repentino en cara, brazo o pierna (especialmente en un solo lado), dificultad para hablar o entender, pérdida súbita de visión, dolor de cabeza muy intenso sin causa aparente. Llama al 911 de inmediato."
      },
      {
        "tone": "red",
        "t": "Dolor en el pecho con presión muy alta",
        "d": "Si tienes presión muy alta y simultáneamente dolor, presión u opresión en el pecho, ve a urgencias. Puede indicar daño al corazón o aorta."
      },
      {
        "tone": "amber",
        "t": "Dolores de cabeza frecuentes o inusuales",
        "d": "Si tienes dolores de cabeza recurrentes, especialmente en la nuca al despertar, consulta a tu médico y mide tu presión arterial. No es urgente pero merece evaluación."
      },
      {
        "tone": "amber",
        "t": "Mareos o visión borrosa recurrentes",
        "d": "Si experimentas mareos frecuentes o episodios de visión borrosa sin explicación, agenda una cita médica para medir tu presión arterial y descartar hipertensión u otras causas."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico de hipertensión requiere mediciones elevadas en al menos dos ocasiones distintas, no solo una lectura alta. Esto es importante porque la presión arterial varía naturalmente a lo largo del día y puede elevarse temporalmente por el estrés, el café, el ejercicio reciente o incluso la ansiedad de estar en el consultorio (lo que se llama 'hipertensión de bata blanca').",
      "La medición correcta requiere estar sentado y en reposo durante al menos 5 minutos, sin haber fumado, tomado café ni hecho ejercicio en la última media hora. El brazalete debe ser del tamaño adecuado para tu brazo. Las lecturas en ambos brazos deben compararse, especialmente en la primera visita.",
      "Una vez confirmada la hipertensión, el médico pedirá algunos estudios para evaluar si ya hay daño en órganos y para descartar causas secundarias: análisis de sangre (glucosa, colesterol, función renal), análisis de orina, electrocardiograma y a veces un ecocardiograma. También puede solicitar un monitoreo ambulatorio de 24 horas (MAPA) para ver cómo varía tu presión durante el día y la noche.",
      "Las guías ACC/AHA 2017 clasifican la hipertensión en: Estadio 1 (130-139/80-89 mmHg) y Estadio 2 (140/90 mmHg o más). Esta clasificación ayuda al médico a decidir si se necesita solo cambios de estilo de vida o también medicamentos desde el inicio."
    ],
    "callout": {
      "label": "El monitoreo en casa es valioso",
      "body": "Medir tu presión en casa con un tensiómetro digital de brazo (no de muñeca) puede darte información más representativa de tu presión 'real'. Registra las lecturas en la mañana antes de levantarte y en la noche antes de dormir. Lleva ese registro a tu próxima cita médica."
    },
    "timeline": [
      {"w": "Primera visita", "t": "Dos mediciones separadas por 1-2 minutos en ambos brazos"},
      {"w": "Segunda visita", "t": "Confirmación de lecturas elevadas (1-4 semanas después)"},
      {"w": "Estudios iniciales", "t": "Análisis de sangre, orina, ECG para evaluar daño en órganos"},
      {"w": "MAPA (si aplica)", "t": "Monitoreo ambulatorio de 24 horas para casos dudosos"},
      {"w": "Seguimiento", "t": "Cita de seguimiento al mes de iniciado el tratamiento, luego cada 3-6 meses"}
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento de la hipertensión tiene dos pilares fundamentales que se usan solos o en combinación: cambios en el estilo de vida y medicamentos. La decisión de cuándo agregar medicamentos depende de tu nivel de presión arterial, tu riesgo cardiovascular global y otros factores de salud.",
      "Los cambios en el estilo de vida son el primer paso y, en muchos casos, suficientes para controlar la presión en etapas tempranas. Los más efectivos son: reducir el sodio en la dieta (menos de 2,300 mg/día), adoptar la dieta DASH (rica en frutas, vegetales, granos integrales y lácteos bajos en grasa), hacer ejercicio aeróbico moderado al menos 150 minutos por semana, mantener un peso saludable, limitar el alcohol y dejar de fumar. Cada uno de estos cambios puede reducir la presión de 4 a 11 mmHg.",
      "Cuando se necesitan medicamentos, existen varias familias principales. Los inhibidores de la ECA (como el enalapril) y los bloqueadores de receptores de angiotensina (como el losartán) protegen especialmente el corazón y los riñones. Los bloqueadores de canales de calcio (como la amlodipina) relajan las paredes de los vasos sanguíneos. Los diuréticos tiazídicos (como la clortalidona) ayudan a eliminar el exceso de sal y agua. Los betabloqueadores (como el metoprolol) reducen la frecuencia y fuerza de los latidos del corazón.",
      "Es muy común necesitar más de un medicamento para alcanzar la meta de presión. No es señal de que la enfermedad esté empeorando: diferentes medicamentos actúan por distintos mecanismos y se complementan. Las guías ACC/AHA recomiendan iniciar con dos medicamentos cuando la presión está 20/10 mmHg por encima de la meta.",
      "Un punto crucial: los medicamentos para la presión deben tomarse todos los días, aunque te sientas bien. Suspenderlos de golpe puede causar un rebote peligroso. Si tienes efectos secundarios, habla con tu médico para ajustar la dosis o cambiar a otro medicamento. Hay muchas opciones disponibles."
    ],
    "callout": {
      "label": "Meta de tratamiento",
      "body": "Para la mayoría de las personas con hipertensión, la meta es mantener la presión por debajo de 130/80 mmHg, según las guías ACC/AHA 2017. En adultos mayores frágiles o con ciertas condiciones, la meta puede ser menos estricta. Tu médico definirá la meta adecuada para ti."
    }
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con hipertensión no significa que tu vida deba cambiar radicalmente, pero sí que debes incorporar ciertos hábitos de forma consistente. La hipertensión bien controlada prácticamente no limita tus actividades diarias.",
      "Medir tu presión en casa regularmente te da información valiosa y te ayuda a tomar el control de tu salud. Usa un tensiómetro digital de brazo certificado (no de muñeca), mide a la misma hora cada día, registra los valores y llévalos a tus citas médicas. Aprenderás a reconocer tus patrones normales.",
      "En cuanto a la alimentación, el mayor impacto viene de reducir el sodio. Cocinar en casa te permite controlar lo que comes. Lee las etiquetas: busca que los productos tengan menos de 140 mg de sodio por porción. Las hierbas, especias, limón y ajo son excelentes alternativas a la sal para dar sabor. La dieta DASH ha demostrado reducir la presión arterial de forma significativa en estudios clínicos.",
      "El ejercicio aeróbico regular — caminar rápido, nadar, andar en bicicleta — es uno de los tratamientos más efectivos para la hipertensión. Apunta a 30 minutos la mayoría de los días de la semana. Si estás empezando, 10 minutos tres veces al día tiene el mismo beneficio que 30 minutos continuos.",
      "El estrés crónico eleva la presión arterial. Técnicas como la meditación, el yoga, la respiración profunda y el ejercicio físico ayudan a manejarlo. Priorizar el sueño también es importante: la apnea del sueño no tratada es una causa frecuente de hipertensión resistente al tratamiento."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Lleva estas preguntas a tu próxima cita. Entender tu condición es parte de tu tratamiento."
    ],
    "questions": [
      "¿Cuál es exactamente mi presión arterial hoy y cuál es mi meta de tratamiento?",
      "¿Mi hipertensión es primaria (esencial) o puede haber una causa secundaria que investigar?",
      "¿Qué cambios en mi estilo de vida tendrían mayor impacto en mi caso específico?",
      "¿Necesito medicamentos ahora o podemos intentar primero con cambios de hábitos?",
      "Si me receta medicamentos, ¿qué efectos secundarios debo esperar y cuándo debo preocuparme?",
      "¿Puedo hacer ejercicio intenso con seguridad? ¿Hay algún tipo de ejercicio que deba evitar?",
      "¿Qué tan seguido debo medir mi presión en casa y qué debo hacer si está muy alta?",
      "¿Qué nivel de presión debe llevarme a urgencias o a llamarle?",
      "¿Mi hipertensión ya causó algún daño en mis riñones, corazón u ojos?",
      "¿Mis otros medicamentos o suplementos pueden estar afectando mi presión arterial?",
      "¿Con cuánta frecuencia debo venir a revisión y qué estudios de seguimiento necesito?",
      "¿Debo restringir el consumo de sal completamente o hay una cantidad segura?"
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "Whelton, P. K., Carey, R. M., Aronow, W. S., et al. (2018). 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA guideline for the prevention, detection, evaluation, and management of high blood pressure in adults. Journal of the American College of Cardiology, 71(19), e127–e248. https://doi.org/10.1016/j.jacc.2017.11.006",
      "Williams, B., Mancia, G., Spiering, W., et al. (2018). 2018 ESC/ESH guidelines for the management of arterial hypertension. European Heart Journal, 39(33), 3021–3104. https://doi.org/10.1093/eurheartj/ehy339",
      "World Health Organization. (2021). Hypertension. WHO Fact Sheets. https://www.who.int/news-room/fact-sheets/detail/hypertension",
      "Sacks, F. M., Svetkey, L. P., Vollmer, W. M., et al. (2001). Effects on blood pressure of reduced dietary sodium and the Dietary Approaches to Stop Hypertension (DASH) diet. New England Journal of Medicine, 344(1), 3–10. https://doi.org/10.1056/NEJM200101043440101",
      "Chobanian, A. V., Bakris, G. L., Black, H. R., et al. (2003). The seventh report of the Joint National Committee on prevention, detection, evaluation, and treatment of high blood pressure (JNC 7). JAMA, 289(19), 2560–2572. https://doi.org/10.1001/jama.289.19.2560",
      "Forouzanfar, M. H., Liu, P., Roth, G. A., et al. (2017). Global burden of hypertension and systolic blood pressure of at least 110 to 115 mm Hg, 1990–2015. JAMA, 317(2), 165–182. https://doi.org/10.1001/jama.2016.19043"
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertension-arterial';


-- ============================================================
-- CONDICIÓN 39: Infarto de Miocardio
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'infarto-de-miocardio',
  'Infarto de Miocardio (Ataque al Corazón)',
  'Cuando una arteria se bloquea y el músculo del corazón deja de recibir sangre',
  'Un infarto ocurre cuando una arteria coronaria se obstruye completamente y parte del músculo cardíaco muere por falta de oxígeno. Es una emergencia médica donde cada minuto cuenta: actuar rápido puede salvar tu vida y minimizar el daño al corazón.',
  'cardiología',
  'I21',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "Tu corazón es un músculo que trabaja sin descanso las 24 horas del día, los 365 días del año. Como cualquier músculo, necesita oxígeno para funcionar. Ese oxígeno llega a través de las arterias coronarias, que rodean el corazón como una corona (de ahí su nombre). Un infarto de miocardio ocurre cuando una de estas arterias se bloquea completamente y el área del corazón que depende de ella empieza a morir.",
      "El proceso suele comenzar años antes del infarto: lentamente se forman depósitos de grasa, colesterol y otras sustancias en las paredes de las arterias coronarias. Estos depósitos se llaman placas de ateroma. Con el tiempo, una placa puede romperse, y cuando eso ocurre, el cuerpo forma un coágulo para 'reparar' la grieta. Ese coágulo puede obstruir completamente la arteria, cortando el flujo de sangre.",
      "El músculo cardíaco que no recibe sangre comienza a dañarse en minutos. Si la arteria se abre dentro de las primeras 1-2 horas, el daño puede ser mínimo. Si pasan más de 6-12 horas, el daño es irreversible y extenso. Por eso la frase en cardiología es 'tiempo es músculo': cada minuto de retraso en el tratamiento significa más células cardíacas muertas.",
      "Existen dos tipos principales según los cambios en el electrocardiograma: el IAMCEST (con elevación del segmento ST), que es la forma más grave y requiere abrir la arteria de forma urgente, y el IAMSEST (sin elevación del ST), que también es una emergencia pero con manejo ligeramente diferente. Esta distinción la hará el médico al ver tu electrocardiograma.",
      "Cada año ocurren aproximadamente 17.9 millones de muertes por enfermedades cardiovasculares en el mundo, siendo el infarto una de las principales causas. Sin embargo, con los tratamientos modernos, la mayoría de las personas que reciben atención rápida sobreviven y regresan a una vida activa."
    ],
    "callout": {
      "label": "Tiempo es músculo",
      "body": "Las guías ACC/AHA establecen que en un infarto con obstrucción total (IAMCEST), el objetivo es abrir la arteria bloqueada en menos de 90 minutos desde que el paciente llega al hospital (y menos de 120 minutos desde el primer contacto médico). Por eso llamar al 911 inmediatamente es crítico."
    }
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La causa más común del infarto es la aterosclerosis: la acumulación progresiva de placas de grasa y colesterol en las paredes de las arterias coronarias. Este proceso comienza desde la infancia en muchas personas y avanza lentamente durante décadas. La ruptura de una de estas placas y la formación de un coágulo es el desencadenante final del infarto.",
      "Los factores de riesgo que aumentan la probabilidad de desarrollar aterosclerosis incluyen algunos que no puedes cambiar: la edad (el riesgo aumenta en hombres mayores de 45 años y mujeres mayores de 55), el sexo (los hombres tienen mayor riesgo antes de la menopausia, pero después la brecha se reduce), la historia familiar (un infarto en padre o hermano antes de los 55 años, o en madre o hermana antes de los 65, eleva tu riesgo).",
      "Los factores modificables son igualmente importantes y sobre ellos puedes actuar: el tabaquismo daña directamente las paredes arteriales y es uno de los factores de riesgo más potentes (fumar duplica el riesgo de infarto); el colesterol LDL elevado contribuye directamente a la formación de placas; la hipertensión arterial daña las paredes de los vasos; la diabetes aumenta el riesgo de 2 a 4 veces; la obesidad abdominal y el sedentarismo también aumentan el riesgo.",
      "Algunos factores menos conocidos incluyen el estrés psicológico crónico, la depresión, la apnea del sueño no tratada, el consumo de cocaína o anfetaminas (que pueden causar espasmo coronario e infarto incluso en personas jóvenes sin aterosclerosis), y ciertos medicamentos antiinflamatorios.",
      "El riesgo cardiovascular se calcula de forma global, considerando todos estos factores juntos. Tu médico puede calcular tu riesgo a 10 años usando calculadoras validadas como el Pooled Cohort Equations (ACC/AHA) o el SCORE2 (ESC), lo que ayuda a decidir si necesitas medicamentos preventivos."
    ]
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Reconocer los síntomas de un infarto y actuar de inmediato puede salvarte la vida. El síntoma más conocido es el dolor en el pecho, pero el infarto puede presentarse de formas distintas. Aprenderlos puede hacer la diferencia.",
      "El dolor o molestia en el pecho durante un infarto suele describirse como una presión, opresión, peso o apretón en el centro del pecho, como si alguien pusiera un ladrillo sobre él. Puede irradiarse al brazo izquierdo, a ambos brazos, al cuello, a la mandíbula o a la espalda. A veces se acompaña de sudoración fría, náuseas, vómito, mareo o sensación de que 'algo muy malo está pasando'.",
      "Las mujeres, las personas con diabetes y los adultos mayores pueden presentar síntomas atípicos: fatiga extrema e inusual, dificultad para respirar sin dolor de pecho, molestia en la parte superior del abdomen (que puede confundirse con acidez), o simplemente una sensación vaga de malestar. Estos casos son especialmente importantes porque el retraso en buscar atención es mayor cuando los síntomas no son 'clásicos'.",
      "RECUERDA: Si sospechas que tú u otra persona está teniendo un infarto, llama al 911 (o tu número de emergencias local) de inmediato. No manejes al hospital por tu cuenta. La ambulancia puede iniciar el tratamiento en el camino y el hospital estará preparado para recibirte."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Dolor o presión en el pecho — llama al 911 ahora",
        "d": "Dolor, presión, opresión o peso en el centro del pecho que dura más de unos pocos minutos o que va y viene. No esperes a ver si mejora solo. Llama al servicio de emergencias inmediatamente."
      },
      {
        "tone": "red",
        "t": "Dolor que se extiende al brazo, mandíbula o espalda",
        "d": "Dolor o molestia que se irradia al brazo izquierdo (o ambos brazos), al cuello, a la mandíbula o a la espalda, especialmente si se acompaña de sudoración fría o náuseas. Emergencia inmediata."
      },
      {
        "tone": "red",
        "t": "Dificultad súbita para respirar",
        "d": "Dificultad repentina para respirar, con o sin dolor en el pecho. Puede ser la única manifestación de un infarto, especialmente en mujeres y personas con diabetes. Llama al 911."
      },
      {
        "tone": "red",
        "t": "Sudoración fría, náuseas y sensación de desmayo",
        "d": "Sudoración fría intensa, náuseas o vómito combinados con sensación de que algo muy grave está pasando. Junto con cualquier molestia en el pecho, son señales de alarma roja. Emergencia."
      },
      {
        "tone": "amber",
        "t": "Fatiga inusual e inexplicable (días antes)",
        "d": "Especialmente en mujeres, cansancio extremo e inusual en los días o semanas previas a un infarto puede ser una señal de advertencia. Si tienes factores de riesgo cardiovascular y experimentas fatiga inusual, consulta a tu médico."
      },
      {
        "tone": "amber",
        "t": "Dolor en el pecho con el ejercicio que mejora en reposo",
        "d": "Si tienes dolor o molestia en el pecho solo cuando te esfuerzas físicamente y desaparece con el descanso, puede ser angina (no un infarto, pero sí una señal de arterias estrechas). Consulta a tu médico pronto, no es urgencia inmediata pero sí requiere evaluación."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico de un infarto se realiza de forma rápida en urgencias, combinando tres elementos: tus síntomas, el electrocardiograma (ECG) y los análisis de sangre. Este proceso empieza en los primeros minutos de tu llegada al hospital.",
      "El electrocardiograma (ECG) es el estudio más rápido e importante. Se realizan en menos de 10 minutos desde que llegas. Registra la actividad eléctrica del corazón y puede mostrar patrones específicos que indican que una arteria está bloqueada (elevación del segmento ST) o que hay daño cardíaco en curso.",
      "Los análisis de sangre buscan marcadores de daño cardíaco, principalmente la troponina, una proteína que las células del corazón liberan cuando están lesionadas. La troponina comienza a elevarse 1-3 horas después del inicio del infarto y se mantiene elevada varios días. Los análisis se repiten cada pocas horas para ver si los niveles suben (lo que confirma el daño activo).",
      "Durante o después del tratamiento inicial, se realizan otros estudios: un ecocardiograma para ver qué tan bien está bombeando el corazón y qué áreas fueron afectadas, y una coronariografía (cateterismo), que es el estudio definitivo donde se introduce un catéter por la arteria de la muñeca o la ingle para ver directamente las arterias del corazón e identificar el bloqueo."
    ],
    "callout": {
      "label": "No esperes los estudios para actuar",
      "body": "En urgencias, si el ECG muestra un IAMCEST (infarto con obstrucción total), el equipo médico no esperará los análisis de sangre para llevar al paciente a la sala de cateterismo. La velocidad es lo más importante."
    },
    "timeline": [
      {"w": "0-10 min", "t": "ECG de 12 derivaciones — resultado en minutos"},
      {"w": "0-30 min", "t": "Sangre para troponinas, aspirina, acceso venoso, monitoreo"},
      {"w": "30-90 min", "t": "Cateterismo de urgencia para abrir la arteria (IAMCEST)"},
      {"w": "1-3 días", "t": "Hospitalización, monitoreo, ecocardiograma, ajuste de medicamentos"},
      {"w": "Semanas", "t": "Programa de rehabilitación cardíaca, ajuste de tratamiento a largo plazo"}
    ]
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento de un infarto agudo tiene como objetivo principal abrir la arteria bloqueada lo más rápido posible para salvar el mayor tejido cardíaco posible. Existen dos estrategias principales para esto.",
      "La angioplastia primaria con stent (también llamada ICP primaria o cateterismo de urgencia) es el tratamiento de elección cuando está disponible a tiempo. Se introduce un catéter delgado hasta la arteria bloqueada, se infla un pequeño globo para abrir el bloqueo, y generalmente se coloca un stent (una malla metálica pequeña) para mantener la arteria abierta. Es un procedimiento mínimamente invasivo que no requiere cirugía abierta.",
      "La trombolisis (medicamentos para disolver el coágulo) se usa cuando no hay posibilidad de llegar a un laboratorio de cateterismo a tiempo (más de 120 minutos desde el primer contacto médico). Se administran medicamentos como la estreptoquinasa o la alteplasa por vía intravenosa para disolver el coágulo. Es efectiva pero con mayor riesgo de sangrado.",
      "Además del procedimiento para abrir la arteria, se administran varios medicamentos de forma inmediata: aspirina (para prevenir que el coágulo crezca), un segundo antiagregante plaquetario como el clopidogrel o el ticagrelor (para los mismos fines), heparina (anticoagulante), betabloqueadores (para proteger el corazón) y estatinas en dosis altas (para estabilizar la placa y reducir el colesterol).",
      "Después del infarto, el tratamiento a largo plazo incluye aspirina de por vida, antiagregante plaquetario por al menos 12 meses, estatinas de alta intensidad, betabloqueadores, y un inhibidor de la ECA o ARA II para proteger el corazón. También se recomienda fuertemente un programa de rehabilitación cardíaca, que combina ejercicio supervisado, educación y apoyo psicológico y ha demostrado reducir el riesgo de un segundo infarto."
    ],
    "callout": {
      "label": "La rehabilitación cardíaca salva vidas",
      "body": "Los programas de rehabilitación cardíaca después de un infarto reducen el riesgo de morir por causas cardiovasculares en un 26% y el riesgo de un segundo infarto en un 18%, según metaanálisis publicados en el British Medical Journal. Pregunta a tu médico si eres candidato."
    }
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Sobrevivir a un infarto es el comienzo de una nueva etapa, no el final. La mayoría de las personas que reciben tratamiento oportuno regresan a una vida activa, incluyendo el trabajo, el deporte y la vida sexual. La clave es el cumplimiento del tratamiento y los cambios de estilo de vida.",
      "Los medicamentos después del infarto deben tomarse todos los días sin excepción. Dejar la aspirina o el antiagregante de forma prematura multiplica significativamente el riesgo de un segundo infarto. Si tienes dificultades para costear los medicamentos o experimentas efectos secundarios, habla con tu médico antes de suspenderlos.",
      "El ejercicio, lejos de estar prohibido, es parte fundamental de la recuperación. La rehabilitación cardíaca te enseñará a hacerlo de forma segura y progresiva. Comenzarás con caminatas cortas y aumentarás gradualmente. El ejercicio regular reduce el riesgo de un segundo evento cardiovascular.",
      "La salud emocional es igual de importante. La depresión es muy común después de un infarto (afecta a 1 de cada 4 sobrevivientes) y, si no se trata, aumenta el riesgo de nuevos eventos cardíacos. Habla con tu médico si te sientes persistentemente triste, ansioso o temeroso. El apoyo psicológico es parte del tratamiento.",
      "Dejar de fumar después del infarto es la intervención única más efectiva para reducir el riesgo de un segundo evento. A los 2 años de dejar de fumar, el riesgo de un segundo infarto se reduce a la mitad. Si necesitas apoyo para lograrlo, existen medicamentos y programas efectivos."
    ]
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Después de un infarto, es normal tener muchas preguntas. Estas son las más importantes que debes hacer."
    ],
    "questions": [
      "¿Qué arteria se bloqueó y qué porción del corazón fue afectada?",
      "¿Qué tan bien está bombeando mi corazón ahora? ¿Cuál es mi fracción de eyección?",
      "¿Cuándo puedo retomar mis actividades normales: trabajo, conducir, ejercicio, vida sexual?",
      "¿Cuáles medicamentos debo tomar y por cuánto tiempo? ¿Alguno es de por vida?",
      "¿Cuáles son las señales de que podría estar teniendo otro infarto y qué debo hacer?",
      "¿Soy candidato para un programa de rehabilitación cardíaca?",
      "¿Tengo otras arterias estrechadas que necesiten tratamiento?",
      "¿Mis familiares directos deben hacerse estudios del corazón?",
      "¿Qué cambios en mi alimentación son los más importantes para mi caso?",
      "¿Puedo tomar medicamentos antiinflamatorios (como ibuprofeno) si tengo dolor?",
      "¿Cuándo debo volver a urgencias y cuándo puedo esperar a una cita de seguimiento?",
      "¿Hay señales de que el stent o la arteria tratada puedan estar cerrándose de nuevo?"
    ]
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "Amsterdam, E. A., Wenger, N. K., Brindis, R. G., et al. (2014). 2014 AHA/ACC guideline for the management of patients with non–ST-elevation acute coronary syndromes. Journal of the American College of Cardiology, 64(24), e139–e228. https://doi.org/10.1016/j.jacc.2014.09.017",
      "O''Gara, P. T., Kushner, F. G., Ascheim, D. D., et al. (2013). 2013 ACCF/AHA guideline for the management of ST-elevation myocardial infarction. Journal of the American College of Cardiology, 61(4), e78–e140. https://doi.org/10.1016/j.jacc.2012.11.019",
      "Ibanez, B., James, S., Agewall, S., et al. (2018). 2017 ESC guidelines for the management of acute myocardial infarction in patients presenting with ST-segment elevation. European Heart Journal, 39(2), 119–177. https://doi.org/10.1093/eurheartj/ehx393",
      "Roth, G. A., Mensah, G. A., Johnson, C. O., et al. (2020). Global burden of cardiovascular diseases and risk factors, 1990–2019. Journal of the American College of Cardiology, 76(25), 2982–3021. https://doi.org/10.1016/j.jacc.2020.11.010",
      "Anderson, L., Oldridge, N., Thompson, D. R., et al. (2016). Exercise-based cardiac rehabilitation for coronary heart disease: Cochrane systematic review and meta-analysis. Journal of the American College of Cardiology, 67(1), 1–12. https://doi.org/10.1016/j.jacc.2015.10.044",
      "Bhatt, D. L., Stone, G. W., Mahaffey, K. W., et al. (2013). Effect of platelet inhibition with cangrelor during PCI on ischemic events. New England Journal of Medicine, 368(14), 1303–1313. https://doi.org/10.1056/NEJMoa1300815"
    ]
  }'::jsonb
from conditions c where c.slug = 'infarto-de-miocardio';


-- ============================================================
-- CONDICIÓN 40: Insuficiencia Cardíaca
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'insuficiencia-cardiaca',
  'Insuficiencia Cardíaca',
  'Cuando el corazón no bombea suficiente sangre para las necesidades del cuerpo',
  'La insuficiencia cardíaca ocurre cuando el corazón no puede bombear la sangre con suficiente eficiencia para satisfacer las necesidades del cuerpo. Es una condición crónica que se maneja, no se cura, pero con el tratamiento adecuado muchas personas viven bien durante años.',
  'cardiología',
  'I50',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "El nombre 'insuficiencia cardíaca' puede sonar como si el corazón hubiera dejado de funcionar, pero esto no es así. Lo que significa es que el corazón no está bombeando con la eficiencia suficiente para que todo el cuerpo reciba el oxígeno y los nutrientes que necesita. Es como si la bomba de agua de tu casa todavía funcionara, pero con menos presión de la necesaria para que el agua llegue a todos los pisos.",
      "El corazón puede fallar de dos formas distintas: con fracción de eyección reducida (antes llamada 'sistólica'), donde el corazón está debilitado y no puede contraerse con suficiente fuerza; o con fracción de eyección preservada (antes llamada 'diastólica'), donde el corazón es demasiado rígido y no puede llenarse bien de sangre entre latidos. La fracción de eyección es el porcentaje de sangre que el corazón expulsa en cada latido — lo normal es 55% o más.",
      "Cuando el corazón no bombea bien, el cuerpo activa mecanismos de compensación para intentar corregir el problema: el corazón late más rápido, los riñones retienen más agua y sal para aumentar el volumen de sangre, y las arterias se contraen para mantener la presión. A corto plazo, estas respuestas ayudan, pero a largo plazo sobrecargan aún más al corazón y contribuyen a la progresión de la enfermedad.",
      "La retención de líquidos que resulta de todo esto es responsable de los síntomas más característicos: el líquido se acumula en los pulmones (causando dificultad para respirar) y en las piernas y abdomen (causando hinchazón). La clasificación más usada es la de la New York Heart Association (NYHA), que divide la insuficiencia en 4 clases según cuánto limita las actividades físicas.",
      "Es una condición muy prevalente — afecta aproximadamente a 64 millones de personas en el mundo según la ESC. La buena noticia es que el tratamiento ha avanzado enormemente en las últimas décadas: los medicamentos modernos no solo mejoran los síntomas sino que también reducen las hospitalizaciones y prolongan la vida."
    ],
    "callout": {
      "label": "Fracción de eyección: tu número clave",
      "body": "La fracción de eyección (FE) se mide con un ecocardiograma y es el porcentaje de sangre que el corazón expulsa en cada latido. Normal: ≥55%. Ligeramente reducida: 41-54%. Reducida: ≤40%. Este número guía el tratamiento y cambia con el tiempo según la respuesta al mismo."
    }
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La insuficiencia cardíaca no es una enfermedad en sí misma, sino la consecuencia final de diferentes condiciones que dañan o sobrecargan el corazón. Identificar y tratar la causa subyacente es una parte crucial del tratamiento.",
      "La causa más común es la enfermedad coronaria, es decir, las arterias del corazón estrechadas o bloqueadas. Un infarto previo que dejó cicatriz en el músculo cardíaco es una causa muy frecuente. La hipertensión arterial no controlada también es una causa mayor: el corazón trabaja contra una resistencia alta durante años hasta que se agota.",
      "Otras causas incluyen: las valvulopatías (problemas en las válvulas del corazón que regulan el flujo de sangre), la miocardiopatía dilatada (debilitamiento del corazón sin causa obvia, a veces hereditaria), la miocardiopatía hipertrófica (engrosamiento del músculo cardíaco), las infecciones que afectan al corazón (miocarditis), y el alcohol en exceso consumido durante años que puede dañar directamente el músculo cardíaco.",
      "La diabetes no controlada, la obesidad severa, la apnea del sueño no tratada, y la quimioterapia con ciertos medicamentos (como las antraciclinas) también pueden causar insuficiencia cardíaca. Las arritmias como la fibrilación auricular, si no se controlan, también pueden debilitar el corazón con el tiempo.",
      "Los factores de riesgo para desarrollar insuficiencia cardíaca son en gran parte los mismos que para las enfermedades cardiovasculares en general: edad avanzada, hipertensión, diabetes, obesidad, tabaquismo, colesterol elevado y enfermedad coronaria preexistente."
    ]
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Los síntomas de la insuficiencia cardíaca son principalmente consecuencia de la acumulación de líquidos y de que el cuerpo no recibe suficiente sangre oxigenada. Pueden aparecer gradualmente o de forma más repentina durante una descompensación.",
      "La disnea (dificultad para respirar) es el síntoma más común. Al principio solo aparece con esfuerzo físico importante; luego con actividades menores como subir escaleras; en etapas avanzadas puede aparecer en reposo. La ortopnea — dificultad para respirar al acostarse que mejora al sentarse o poner varias almohadas — es muy característica. La disnea paroxística nocturna son episodios de ahogo que despiertan a la persona de madrugada.",
      "La retención de líquidos produce hinchazón en los tobillos y las piernas (edema), que empeora al final del día y mejora con el reposo. También puede acumularse en el abdomen (ascitis). Un aumento de peso de más de 1 kg en un día o 2 kg en una semana generalmente indica retención de líquidos y debe reportarse al médico."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Dificultad severa para respirar en reposo — urgencias ahora",
        "d": "Si tienes dificultad intensa para respirar incluso estando sentado quieto, o sientes que te ahogas, ve a urgencias de inmediato o llama al 911. Puede indicar edema pulmonar agudo (pulmones inundados de líquido), que es una emergencia."
      },
      {
        "tone": "red",
        "t": "Aumento rápido de peso (más de 2 kg en 2-3 días)",
        "d": "Un aumento de peso súbito indica retención severa de líquidos y descompensación inminente. Si esto ocurre, contacta a tu médico ese mismo día o ve a urgencias si también tienes dificultad para respirar."
      },
      {
        "tone": "red",
        "t": "Síncope (desmayo) o pérdida de conciencia",
        "d": "Perder la conciencia en el contexto de insuficiencia cardíaca puede indicar una arritmia peligrosa o caída crítica del gasto cardíaco. Llama al 911 de inmediato."
      },
      {
        "tone": "amber",
        "t": "Empeoramiento de la hinchazón en piernas",
        "d": "Si la hinchazón en tobillos o piernas empeora progresivamente, contacta a tu médico. Puede necesitar ajustar el diurético. No urgente inmediatamente, pero sí en las próximas 24-48 horas."
      },
      {
        "tone": "amber",
        "t": "Fatiga que empeora o menor tolerancia al ejercicio",
        "d": "Si puedes hacer menos actividad física que antes sin explicación, o si tu fatiga habitual se intensifica, es señal de que la enfermedad está progresando. Agenda una cita con tu cardiólogo."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico de insuficiencia cardíaca combina la historia clínica, la exploración física y una serie de estudios complementarios. El médico buscará signos clásicos como el aumento de la presión venosa en el cuello, crepitantes en los pulmones al escucharlos, y edema en las piernas.",
      "El ecocardiograma es el estudio más importante: usa ultrasonido para ver el corazón en tiempo real, medir la fracción de eyección, evaluar las válvulas y detectar problemas estructurales. Es indoloro, no usa radiación y da información muy valiosa sobre cómo está funcionando el corazón.",
      "Los péptidos natriuréticos (BNP y NT-proBNP) son marcadores en la sangre que el corazón libera cuando está bajo estrés. Niveles elevados confirman el diagnóstico y ayudan a evaluar la severidad. También se piden análisis para evaluar la función renal, tiroidea y los electrolitos, que afectan el manejo.",
      "Otros estudios incluyen una radiografía de tórax (para ver si hay líquido en los pulmones o si el corazón está agrandado), un electrocardiograma (para detectar arritmias o signos de infarto previo), y dependiendo de la causa sospechada, puede ser necesaria una coronariografía, una resonancia magnética cardíaca o una biopsia de miocardio."
    ],
    "callout": {
      "label": "El seguimiento es diagnóstico también",
      "body": "El ecocardiograma debe repetirse periódicamente (generalmente cada 3-6 meses al inicio del tratamiento y luego anualmente) para ver cómo responde el corazón. Con el tratamiento óptimo, la fracción de eyección puede mejorar significativamente, incluso normalizarse en algunos casos."
    }
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento de la insuficiencia cardíaca ha avanzado de forma extraordinaria. Hoy existen cuatro grupos de medicamentos que han demostrado no solo mejorar los síntomas, sino también reducir las hospitalizaciones y prolongar la vida en pacientes con fracción de eyección reducida. Las guías ESC 2021 los llaman los 'cuatro pilares' del tratamiento.",
      "Los inhibidores de la ECA o los bloqueadores del receptor de angiotensina-neprilisina (ARNI, como el sacubitrilo/valsartán) reducen la carga de trabajo del corazón y protegen los riñones. Los betabloqueadores (como el carvedilol o el bisoprolol) enlentecen el corazón y reducen el consumo de oxígeno. Los antagonistas de la aldosterona (como la espironolactona o la eplerenona) ayudan a eliminar líquidos sin perder potasio. Los inhibidores de SGLT2 (como la dapagliflozina o la empagliflozina), originalmente desarrollados para la diabetes, han demostrado un beneficio sorprendente en insuficiencia cardíaca, incluso en personas sin diabetes.",
      "Los diuréticos (como la furosemida) son esenciales para eliminar el exceso de líquidos y aliviar los síntomas, pero no modifican la evolución de la enfermedad como los cuatro pilares. La dosis se ajusta según el peso diario y los síntomas.",
      "Para casos avanzados o con ciertas arritmias, pueden recomendarse dispositivos: el desfibrilador automático implantable (DAI) previene muertes súbitas por arritmias peligrosas; la terapia de resincronización cardíaca (TRC) mejora la coordinación de los latidos del corazón en pacientes donde el lado derecho e izquierdo se descompensan. En la insuficiencia cardíaca más avanzada, se puede considerar un dispositivo de asistencia ventricular o el trasplante cardíaco.",
      "El tratamiento no farmacológico es igualmente importante: restricción de sal (menos de 2-3 g/día), control de líquidos en casos avanzados, pesarse todos los días a la misma hora, dejar de fumar, limitar o eliminar el alcohol, y participar en un programa de rehabilitación cardíaca."
    ],
    "callout": {
      "label": "Los cuatro pilares salvan vidas",
      "body": "Según las guías ESC 2021, un paciente con insuficiencia cardíaca con fracción de eyección reducida que recibe los cuatro grupos de medicamentos (IECA/ARNI + betabloqueador + ARM + iSGLT2) a dosis óptimas puede reducir su riesgo de muerte o hospitalización hasta en un 60% comparado con no recibir tratamiento."
    }
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con insuficiencia cardíaca requiere convertirte en un experto en tu propio cuerpo. El automanejo — pesarte a diario, ajustar los diuréticos según indicación médica, reconocer señales de alarma — es tan importante como los medicamentos.",
      "Pesarte cada mañana, después de orinar y antes de desayunar, con la misma ropa, es la herramienta más poderosa que tienes. Un aumento de 1 kg en un día o 2 kg en 3 días generalmente indica retención de líquidos y debes contactar a tu médico. Lleva un registro escrito o en una aplicación.",
      "La restricción de sodio (sal) es fundamental. No se trata de comer insípido: las hierbas, especias, ajo, limón y vinagre son tus aliados. Evita los alimentos procesados, embutidos, quesos curados y comida enlatada que no diga 'bajo en sodio'. El objetivo es menos de 2 g de sodio al día en la mayoría de los casos.",
      "El ejercicio, cuando está bien tolerado, mejora la capacidad funcional y la calidad de vida. No significa correr maratones: caminar 20-30 minutos al día o participar en un programa de rehabilitación cardíaca es suficiente. Consulta con tu médico antes de iniciar cualquier programa de ejercicio.",
      "La insuficiencia cardíaca tiene un impacto emocional significativo. La depresión y la ansiedad son muy frecuentes y, si no se tratan, empeoran los resultados. Habla con tu médico sobre cómo te sientes emocionalmente. El apoyo de grupos de pacientes también puede ser muy valioso."
    ]
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "La insuficiencia cardíaca requiere seguimiento cercano. Estas preguntas te ayudarán a aprovechar al máximo cada consulta."
    ],
    "questions": [
      "¿Cuál es mi fracción de eyección actual y cómo ha cambiado desde la última vez?",
      "¿Estoy recibiendo los cuatro grupos de medicamentos recomendados por las guías? Si no, ¿por qué?",
      "¿Cuál debe ser mi peso ideal y cuánto de aumento de peso debe llevarme a llamarle o ir a urgencias?",
      "¿Cuánto líquido puedo tomar al día y cuánta sal?",
      "¿Qué ejercicio puedo hacer y soy candidato para rehabilitación cardíaca?",
      "¿Necesito un desfibrilador implantable (DAI) o un marcapasos de resincronización?",
      "¿Cuál es la causa de mi insuficiencia cardíaca y se puede tratar esa causa?",
      "¿Cada cuánto debo hacerme un ecocardiograma de seguimiento?",
      "¿Qué señales de descompensación deben llevarme a urgencias versus a llamarle a usted?",
      "¿Puedo seguir trabajando y haciendo mis actividades normales?",
      "¿Hay medicamentos, suplementos o alimentos que deba evitar?",
      "¿Mis familiares directos deben hacerse estudios del corazón, especialmente si mi causa es genética?"
    ]
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "McDonagh, T. A., Metra, M., Adamo, M., et al. (2021). 2021 ESC guidelines for the diagnosis and treatment of acute and chronic heart failure. European Heart Journal, 42(36), 3599–3726. https://doi.org/10.1093/eurheartj/ehab368",
      "Heidenreich, P. A., Bozkurt, B., Aguilar, D., et al. (2022). 2022 AHA/ACC/HFSA guideline for the management of heart failure. Journal of the American College of Cardiology, 79(17), e263–e421. https://doi.org/10.1016/j.jacc.2021.12.012",
      "McMurray, J. J. V., Solomon, S. D., Inzucchi, S. E., et al. (2019). Dapagliflozin in patients with heart failure and reduced ejection fraction. New England Journal of Medicine, 381(21), 1995–2008. https://doi.org/10.1056/NEJMoa1911303",
      "Zannad, F., McMurray, J. J. V., Krum, H., et al. (2011). Eplerenone in patients with systolic heart failure and mild symptoms. New England Journal of Medicine, 364(1), 11–21. https://doi.org/10.1056/NEJMoa1009492",
      "Packer, M., Coats, A. J., Fowler, M. B., et al. (2001). Effect of carvedilol on survival in severe chronic heart failure. New England Journal of Medicine, 344(22), 1651–1658. https://doi.org/10.1056/NEJM200105313442201",
      "Savarese, G., & Lund, L. H. (2017). Global public health burden of heart failure. Cardiac Failure Review, 3(1), 7–11. https://doi.org/10.15420/cfr.2016:25:2"
    ]
  }'::jsonb
from conditions c where c.slug = 'insuficiencia-cardiaca';


-- ============================================================
-- CONDICIÓN 41: Fibrilación Auricular
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'fibrilacion-auricular',
  'Fibrilación Auricular',
  'Un ritmo cardíaco irregular que aumenta el riesgo de derrame cerebral',
  'La fibrilación auricular (FA) es la arritmia cardíaca sostenida más común. Las cámaras superiores del corazón laten de forma caótica e ineficiente, lo que puede causar síntomas como palpitaciones y fatiga, y aumenta significativamente el riesgo de derrame cerebral si no se trata.',
  'cardiología',
  'I48',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "Para entender la fibrilación auricular, imagina que el corazón tiene cuatro cámaras: dos superiores llamadas aurículas y dos inferiores llamadas ventrículos. En un corazón normal, un nodo eléctrico especial (el nodo sinusal) genera un impulso regular que hace que primero se contraigan las aurículas y luego los ventrículos, coordinadamente. En la fibrilación auricular, las aurículas reciben hasta 300-600 señales eléctricas por minuto de forma caótica, por lo que no se contraen de manera organizada, sino que simplemente 'tiemblan' o 'fibrilán'.",
      "El resultado es doble: primero, el corazón puede latir de forma muy irregular y en ocasiones muy rápido (aunque no siempre); segundo, la sangre no fluye bien dentro de las aurículas y puede estancarse, especialmente en una pequeña bolsa llamada orejuela izquierda. Esa sangre estancada puede coagularse, y si un coágulo sale al torrente sanguíneo y llega al cerebro, produce un derrame cerebral (ictus). Este es el riesgo más grave de la fibrilación auricular.",
      "La FA es la arritmia sostenida más común en el mundo, afectando a aproximadamente 37 millones de personas. Su prevalencia aumenta significativamente con la edad: es rara antes de los 50 años, pero afecta al 10-15% de las personas mayores de 80 años. Se estima que tiene mayor prevalencia en hombres, aunque las mujeres con FA tienen peores desenlaces.",
      "Existen diferentes formas de FA según su duración: la FA paroxística aparece y desaparece sola (en menos de 7 días), la FA persistente dura más de 7 días y necesita tratamiento para terminar, y la FA permanente es aquella en la que se decide no intentar restablecer el ritmo normal. Esta clasificación orienta las decisiones de tratamiento.",
      "La buena noticia es que con el tratamiento adecuado — principalmente anticoagulantes para prevenir el derrame y medicamentos para controlar la frecuencia cardíaca — la mayoría de las personas con FA llevan una vida normal y reducen significativamente su riesgo de complicaciones."
    ],
    "callout": {
      "label": "FA y derrame cerebral",
      "body": "La fibrilación auricular aumenta el riesgo de derrame cerebral de 5 a 7 veces comparado con personas sin FA. Sin embargo, con anticoagulantes bien tomados, ese riesgo se reduce en un 64-85%. Por eso tomar el anticoagulante es la intervención más importante si tu médico te lo receta."
    }
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La fibrilación auricular puede aparecer en personas sin ningún problema cardíaco conocido (FA 'solitaria' o 'lone AF'), pero la mayoría de los casos están asociados a otras condiciones que afectan al corazón o que crean un ambiente favorable para que el circuito eléctrico se vuelva caótico.",
      "Las enfermedades del corazón más frecuentemente asociadas incluyen la hipertensión arterial (el factor de riesgo más común, presente en 60-80% de los pacientes con FA), la insuficiencia cardíaca, las valvulopatías (especialmente la enfermedad de la válvula mitral), la enfermedad coronaria y el infarto previo, y la miocardiopatía hipertrófica.",
      "Fuera del corazón, la causa más importante es el hipertiroidismo (exceso de hormona tiroidea), que puede desencadenar FA incluso en personas jóvenes. La apnea del sueño severa también es un factor de riesgo importante y subestimado. La obesidad, la diabetes, la enfermedad renal crónica y el tabaquismo también contribuyen.",
      "El alcohol merece mención especial: el consumo intensivo, incluyendo los episodios de ingesta excesiva en corto tiempo ('binge drinking'), puede desencadenar episodios de FA incluso en personas con corazón sano — es el llamado 'síndrome del corazón de vacaciones' ('holiday heart syndrome'). Incluso el consumo moderado de alcohol puede aumentar el riesgo de FA a largo plazo.",
      "La FA también puede aparecer después de cirugías cardíacas o no cardíacas, durante infecciones graves, o en el contexto de enfermedades pulmonares como la enfermedad pulmonar obstructiva crónica (EPOC) o la embolia pulmonar. En estos casos, si se trata la causa subyacente, la FA puede resolverse."
    ]
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Los síntomas de la fibrilación auricular varían enormemente de una persona a otra. Algunas personas sienten la FA de forma muy intensa; otras la tienen completamente asintomática y se descubre por casualidad en un electrocardiograma. Incluso la misma persona puede tener episodios sintomáticos y otros en los que no siente nada.",
      "Los síntomas más comunes incluyen palpitaciones (sensación de que el corazón late de forma irregular, rápida o 'loca'), cansancio o fatiga inusual, dificultad para respirar con actividades que antes tolerabas bien, sensación de mareo o aturdimiento, y reducción de la capacidad para el ejercicio. Algunos sienten una molestia vaga en el pecho.",
      "Es importante recordar que la ausencia de síntomas NO significa que la FA no sea peligrosa. La FA asintomática sigue aumentando el riesgo de derrame cerebral, por lo que el tratamiento anticoagulante es igualmente necesario."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Síntomas de derrame cerebral — llama al 911",
        "d": "Debilidad o entumecimiento repentino en la cara, brazo o pierna (especialmente en un solo lado), dificultad para hablar o entender el lenguaje, pérdida súbita de visión en uno o ambos ojos, dolor de cabeza muy intenso e inusual. Si tienes FA, estos síntomas pueden indicar un derrame cerebral. Cada minuto importa."
      },
      {
        "tone": "red",
        "t": "Frecuencia cardíaca muy rápida con malestar intenso",
        "d": "Si sientes el corazón latir a más de 150 por minuto de forma sostenida, especialmente con dificultad para respirar, dolor en el pecho, mareo severo o sensación de desmayo inminente, ve a urgencias. Puede ser FA con respuesta ventricular muy rápida que necesita tratamiento inmediato."
      },
      {
        "tone": "red",
        "t": "Síncope (pérdida de conciencia) o presíncope severo",
        "d": "Desmayarse en el contexto de FA puede indicar una caída peligrosa del gasto cardíaco o una pausa en el ritmo. Llama al 911."
      },
      {
        "tone": "amber",
        "t": "Nuevos episodios de palpitaciones irregulares",
        "d": "Si tienes episodios de palpitaciones irregulares que duran más de unos minutos, especialmente si se acompañan de cansancio o dificultad para respirar, busca atención médica en las próximas 24-48 horas. Un Holter o un smartwatch con ECG puede detectar la FA."
      },
      {
        "tone": "amber",
        "t": "Empeoramiento de síntomas con tratamiento en curso",
        "d": "Si ya tienes FA diagnosticada y tratada, pero tus síntomas empeoran (más palpitaciones, más cansancio, más dificultad para respirar), contacta a tu cardiólogo. Puede necesitar ajuste de tratamiento."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico definitivo de la fibrilación auricular requiere un electrocardiograma (ECG) que capture el ritmo anormal. El ECG muestra la actividad eléctrica del corazón y en la FA hay dos cambios muy característicos: ausencia de ondas P organizadas (que representan la contracción normal de las aurículas) y un ritmo completamente irregular.",
      "El reto es que la FA paroxística puede aparecer y desaparecer, por lo que un ECG normal en el momento de la consulta no descarta la FA. En estos casos se usa un Holter de 24-48 horas (un monitor de ECG portátil que el paciente lleva puesto) o monitores de más larga duración (7 días, 30 días o incluso monitores implantables) para 'atrapar' los episodios.",
      "Hoy en día, algunos smartwatches y dispositivos portátiles pueden detectar patrones sugestivos de FA y son útiles para el cribado, aunque no reemplazan el ECG médico para el diagnóstico definitivo. Si tu dispositivo te avisa de un posible episodio de FA, es una señal para consultar al médico.",
      "Una vez confirmada la FA, se realizan estudios adicionales para buscar causas y evaluar el riesgo: ecocardiograma (para ver el corazón, especialmente las aurículas y las válvulas), análisis de sangre incluyendo función tiroidea, y el cálculo del riesgo de derrame cerebral usando la escala CHA₂DS₂-VASc."
    ],
    "callout": {
      "label": "La escala CHA₂DS₂-VASc",
      "body": "Esta escala suma puntos por factores de riesgo de derrame cerebral en FA: insuficiencia cardíaca (1), hipertensión (1), edad ≥75 años (2), diabetes (1), derrame cerebral previo (2), enfermedad vascular (1), edad 65-74 (1), sexo femenino (1). Una puntuación de 2 o más en hombres (3 o más en mujeres) indica que necesitas anticoagulante. Tu médico lo calculará."
    }
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento de la FA tiene tres objetivos principales: prevenir el derrame cerebral (anticoagulación), controlar la frecuencia o el ritmo cardíaco, y tratar las causas subyacentes.",
      "La anticoagulación es el pilar más importante del tratamiento y el que más salva vidas. Los anticoagulantes de acción directa (ACOD, también llamados nuevos anticoagulantes orales o NOAC) — como el apixabán, el rivaroxabán, el dabigatrán y el edoxabán — son los más usados hoy. Son más seguros y cómodos que la warfarina (el anticoagulante clásico), no requieren controles frecuentes de sangre, y tienen menos interacciones con alimentos. La warfarina sigue siendo una opción válida, especialmente en ciertas situaciones como válvulas cardíacas mecánicas.",
      "El control de la frecuencia cardíaca busca que el corazón no lata demasiado rápido durante la FA, aunque siga siendo irregular. Los medicamentos usados son los betabloqueadores (como el metoprolol o el bisoprolol) o los bloqueadores de los canales de calcio (como el diltiazem o el verapamilo). La meta es generalmente mantener la frecuencia en reposo por debajo de 110 latidos por minuto.",
      "El control del ritmo busca restablecer y mantener el ritmo normal (sinusal). Esto puede hacerse con medicamentos antiarrítmicos (como la flecainida, la propafenona o la amiodarona) o con la cardioversión eléctrica (una descarga eléctrica controlada bajo sedación que 'reinicia' el corazón). El procedimiento más efectivo para mantener el ritmo normal a largo plazo es la ablación por catéter, donde se destruyen pequeñas áreas del tejido cardíaco que generan las señales caóticas.",
      "Las guías ESC 2020 favorecen cada vez más el control del ritmo temprano, especialmente en pacientes jóvenes y aquellos con muchos síntomas, ya que puede mejorar la calidad de vida, reducir hospitalizaciones y posiblemente mejorar el pronóstico a largo plazo."
    ],
    "callout": {
      "label": "No suspendas el anticoagulante sin hablar con tu médico",
      "body": "Muchos pacientes suspenden el anticoagulante cuando 'no sienten' la FA o creen que ya se curó. Esto es peligroso: la FA puede estar presente sin síntomas, y el riesgo de derrame persiste. Nunca suspendas el anticoagulante sin indicación de tu médico, incluso si tienes que hacerte un procedimiento o cirugía menor."
    }
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con fibrilación auricular es completamente posible con el tratamiento adecuado. Muchas personas llevan una vida activa y plena. La clave está en tomar los medicamentos fielmente, especialmente el anticoagulante, y en conocer qué factores desencadenan tus episodios para evitarlos.",
      "El alcohol es uno de los desencadenantes más comunes de la FA. Incluso cantidades moderadas pueden provocar episodios en personas susceptibles. Reducir o eliminar el alcohol puede disminuir significativamente la frecuencia de los episodios y mejorar la respuesta al tratamiento.",
      "El estrés, la privación del sueño, el café en exceso y el ejercicio muy intenso también pueden desencadenar episodios en algunas personas. Lleva un diario de tus episodios y los posibles factores desencadenantes — esto es información valiosa para tu médico.",
      "El ejercicio moderado, lejos de estar contraindicado, mejora la función cardíaca, reduce el peso y mejora el control de la FA. La rehabilitación cardíaca ha mostrado beneficios específicos en pacientes con FA. El ejercicio extenuante o de alta intensidad puede ser un desencadenante en algunos pacientes, así que consulta con tu médico el nivel adecuado para ti.",
      "Si tomas anticoagulantes, habrá algunas consideraciones prácticas: infórmaselo a cualquier médico o dentista antes de un procedimiento, ya que puede ser necesario ajustar la dosis o suspenderlo temporalmente; con warfarina, mantén una dieta consistente en vitamina K (verduras verdes) sin necesidad de eliminarlas, solo evitar cambios bruscos; y ante cualquier sangrado inusual o prolongado, consulta a tu médico."
    ]
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Estas preguntas te ayudarán a entender tu diagnóstico y a participar activamente en tu tratamiento."
    ],
    "questions": [
      "¿Qué tipo de fibrilación auricular tengo (paroxística, persistente, permanente) y qué significa para mi tratamiento?",
      "¿Cuál es mi puntuación CHA₂DS₂-VASc y necesito tomar anticoagulante?",
      "¿Qué anticoagulante es mejor para mí y por qué? ¿Por cuánto tiempo debo tomarlo?",
      "¿Cuál es el objetivo: solo controlar la frecuencia o intentar restaurar el ritmo normal?",
      "¿Soy candidato para ablación por catéter?",
      "¿Qué debo hacer si tengo un episodio de palpitaciones muy intenso o prolongado?",
      "¿Qué señales deben llevarme inmediatamente a urgencias?",
      "¿Cuáles son los factores que probablemente desencadenan mis episodios y cómo los evito?",
      "¿Puedo hacer ejercicio? ¿Hay algún tipo de ejercicio que deba evitar?",
      "¿Si me hago una cirugía o procedimiento, tengo que suspender el anticoagulante? ¿Por cuánto tiempo?",
      "¿La FA puede haber causado ya daño en mi corazón? ¿Cómo se evalúa eso?",
      "¿Mis hijos u otros familiares tienen mayor riesgo de FA?"
    ]
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "Hindricks, G., Potpara, T., Dagres, N., et al. (2021). 2020 ESC guidelines for the diagnosis and management of atrial fibrillation. European Heart Journal, 42(5), 373–498. https://doi.org/10.1093/eurheartj/ehaa612",
      "January, C. T., Wann, L. S., Calkins, H., et al. (2019). 2019 AHA/ACC/HRS focused update of the 2014 AHA/ACC/HRS guideline for the management of patients with atrial fibrillation. Journal of the American College of Cardiology, 74(1), 104–132. https://doi.org/10.1016/j.jacc.2019.01.011",
      "Hart, R. G., Pearce, L. A., & Aguilar, M. I. (2007). Meta-analysis: Antithrombotic therapy to prevent stroke in patients who have nonvalvular atrial fibrillation. Annals of Internal Medicine, 146(12), 857–867. https://doi.org/10.7326/0003-4819-146-12-200706190-00007",
      "Granger, C. B., Alexander, J. H., McMurray, J. J. V., et al. (2011). Apixaban versus warfarin in patients with atrial fibrillation. New England Journal of Medicine, 365(11), 981–992. https://doi.org/10.1056/NEJMoa1107039",
      "Calkins, H., Hindricks, G., Cappato, R., et al. (2017). 2017 HRS/EHRA/ECAS/APHRS/SOLAECE expert consensus statement on catheter and surgical ablation of atrial fibrillation. Heart Rhythm, 14(10), e275–e444. https://doi.org/10.1016/j.hrthm.2017.05.012",
      "Ettinger, P. O., Wu, C. F., De La Cruz, C., Jr., et al. (1978). Arrhythmias and the 'Holiday Heart': Alcohol-associated cardiac rhythm disorders. American Heart Journal, 95(5), 555–562. https://doi.org/10.1016/0002-8703(78)90296-x"
    ]
  }'::jsonb
from conditions c where c.slug = 'fibrilacion-auricular';


-- ============================================================
-- CONDICIÓN 42: Dislipidemia
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'dislipidemia',
  'Dislipidemia (Colesterol y Triglicéridos Alterados)',
  'Niveles anormales de grasas en la sangre que aumentan el riesgo cardiovascular',
  'La dislipidemia es la alteración de los niveles de colesterol y/o triglicéridos en la sangre. En la mayoría de los casos no produce síntomas, pero aumenta el riesgo de infarto, derrame cerebral y otras enfermedades cardiovasculares. Con dieta, ejercicio y medicamentos cuando son necesarios, se puede controlar eficazmente.',
  'cardiología',
  'E78.5',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "Las grasas en la sangre no son solo colesterol: existen varios tipos de lípidos, y el equilibrio entre ellos determina tu riesgo cardiovascular. La dislipidemia es el término médico para referirse a cualquier alteración en estos niveles, ya sea que estén demasiado altos, demasiado bajos o en proporciones desfavorables.",
      "El colesterol es una sustancia grasa esencial para el cuerpo: forma las membranas de todas tus células, es necesario para producir hormonas y vitamina D, y ayuda a digerir los alimentos. El problema no es el colesterol en sí, sino cuando hay demasiado del tipo equivocado. El colesterol LDL (lipoproteína de baja densidad) es el 'colesterol malo': cuando hay mucho, se deposita en las paredes de las arterias formando placas que las estrechan y endurecen. El colesterol HDL (lipoproteína de alta densidad) es el 'colesterol bueno': transporta el colesterol de vuelta al hígado para que sea eliminado, protegiendo las arterias.",
      "Los triglicéridos son otro tipo de grasa en la sangre, que el cuerpo usa como fuente de energía. Niveles muy elevados (especialmente por encima de 500 mg/dL) pueden causar pancreatitis, y niveles moderadamente elevados se asocian con mayor riesgo cardiovascular, especialmente en combinación con HDL bajo y LDL alto (lo que se conoce como dislipidemia aterogénica).",
      "La dislipidemia es extremadamente común: afecta a más del 50% de los adultos en muchos países de América Latina. La mayoría no lo sabe porque no produce síntomas hasta que causa un evento cardiovascular como un infarto o un derrame cerebral. Por eso los análisis de sangre periódicos son fundamentales para detectarla a tiempo.",
      "El riesgo que representa una dislipidemia no puede entenderse de forma aislada: un mismo nivel de colesterol LDL es más o menos peligroso dependiendo de si también tienes hipertensión, diabetes, tabaquismo, historial familiar de enfermedad cardíaca temprana, u otros factores de riesgo. Tu médico evalúa tu riesgo cardiovascular global, no solo un número en el análisis."
    ],
    "callout": {
      "label": "Los números que debes conocer",
      "body": "En un análisis de sangre en ayunas: Colesterol total: idealmente < 200 mg/dL. LDL ('malo'): la meta varía según tu riesgo (< 70 mg/dL si tienes enfermedad cardiovascular, < 100 mg/dL si tienes riesgo alto, < 130 mg/dL si el riesgo es bajo). HDL ('bueno'): idealmente > 40 mg/dL en hombres y > 50 mg/dL en mujeres. Triglicéridos: < 150 mg/dL."
    }
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La dislipidemia puede ser primaria (hereditaria) o secundaria (causada por otra condición o por el estilo de vida). En la mayoría de las personas, ambos factores se combinan.",
      "Las causas hereditarias incluyen la hipercolesterolemia familiar, una condición genética relativamente común (1 de cada 250 personas) donde el hígado no elimina el LDL de forma eficiente, resultando en niveles muy altos de colesterol desde la infancia. Las personas con hipercolesterolemia familiar tienen un riesgo de infarto mucho mayor a edades tempranas y casi siempre necesitan medicamentos, independientemente del estilo de vida.",
      "Las causas secundarias incluyen: la alimentación rica en grasas saturadas (carnes rojas, mantequilla, quesos, aceite de palma, comida procesada) y grasas trans (margarina sólida, productos industriales), que elevan el LDL; el sedentarismo, que baja el HDL; la obesidad, que eleva los triglicéridos y baja el HDL; el consumo de alcohol, que puede elevar mucho los triglicéridos; el tabaquismo, que baja el HDL; y el azúcar y los carbohidratos refinados en exceso, que elevan los triglicéridos.",
      "Condiciones médicas que pueden causar o empeorar la dislipidemia incluyen el hipotiroidismo (tiroides poco activa), la diabetes tipo 2, la enfermedad renal crónica, el síndrome de ovario poliquístico, y algunas enfermedades hepáticas. Ciertos medicamentos también la pueden causar: corticosteroides, algunos betabloqueadores, retinoides y algunos fármacos para el VIH.",
      "La menopausia produce cambios desfavorables en el perfil lipídico de las mujeres: el estrógeno protege las arterias, y su caída hace que el LDL suba y el HDL baje, explicando en parte por qué el riesgo cardiovascular en mujeres aumenta después de la menopausia."
    ]
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La dislipidemia en sí misma generalmente no produce síntomas durante años o décadas. La mayoría de las personas se enteran de que tienen el colesterol alto solo cuando se hacen un análisis de sangre de rutina. Esperar a tener síntomas es esperar a que la dislipidemia ya haya causado daño.",
      "La única manifestación visible de la dislipidemia severa y prolongada son los xantomas (depósitos de colesterol bajo la piel, que aparecen como nódulos amarillentos en tendones, codos, rodillas o párpados) y el arco corneal (un anillo grisáceo alrededor del iris del ojo visible en personas jóvenes). Estos son signos de hipercolesterolemia familiar severa y significan que los niveles han sido muy altos durante mucho tiempo.",
      "Los triglicéridos muy elevados (por encima de 1,000 mg/dL) pueden causar pancreatitis aguda, que se presenta con dolor abdominal intenso, náuseas y vómito, y es una emergencia médica. Los síntomas a continuación reflejan situaciones donde debes buscar atención."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Dolor abdominal intenso y súbito con triglicéridos muy altos",
        "d": "Si tienes triglicéridos muy elevados (especialmente mayores de 1,000 mg/dL) y desarrollas dolor abdominal intenso y repentino, especialmente en la parte superior del abdomen irradiado a la espalda, con náuseas y vómito, puede ser una pancreatitis. Ve a urgencias de inmediato."
      },
      {
        "tone": "red",
        "t": "Síntomas de infarto o derrame cerebral",
        "d": "La dislipidemia no controlada aumenta el riesgo de infarto (dolor en el pecho, brazo izquierdo, mandíbula) y derrame cerebral (debilidad en un lado del cuerpo, dificultad para hablar, pérdida de visión). Ante cualquiera de estos síntomas, llama al 911 de inmediato."
      },
      {
        "tone": "amber",
        "t": "Nódulos amarillentos en piel o tendones",
        "d": "Si notas depósitos amarillentos bajo la piel, especialmente en los tendones de Aquiles, codos, rodillas o párpados, pueden ser xantomas indicativos de hipercolesterolemia familiar. No es urgente, pero agenda una cita médica pronto para evaluación y análisis de sangre."
      },
      {
        "tone": "amber",
        "t": "Dolor en las piernas al caminar que mejora al parar",
        "d": "El dolor muscular en las piernas que aparece al caminar y desaparece al descansar (claudicación intermitente) puede indicar arterias periféricas estrechadas por la aterosclerosis, posiblemente relacionada con una dislipidemia prolongada. Consulta a tu médico."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico de la dislipidemia se hace con un análisis de sangre simple llamado perfil lipídico o panel de lípidos. Este análisis mide el colesterol total, el colesterol LDL, el colesterol HDL y los triglicéridos. Idealmente se realiza en ayunas de 9-12 horas, aunque los análisis modernos pueden ser confiables sin ayuno para la mayoría de los parámetros.",
      "Las guías ACC/AHA recomiendan que todos los adultos de 20 años o más tengan un perfil lipídico al menos cada 4-6 años. Las personas con factores de riesgo cardiovascular o con historia familiar de enfermedad cardíaca temprana deben hacérselo con mayor frecuencia, comenzando desde la infancia o adolescencia si hay antecedentes de hipercolesterolemia familiar.",
      "El médico no toma decisiones basándose solo en los números del perfil lipídico: utiliza calculadoras de riesgo cardiovascular a 10 años (como el Pooled Cohort Equations de ACC/AHA o el SCORE2 de ESC) que combinan el colesterol con la edad, el sexo, la presión arterial, si fumas y si tienes diabetes. Esta puntuación de riesgo es lo que determina cuándo y con qué intensidad tratar.",
      "En personas jóvenes con LDL muy alto (mayor de 190 mg/dL) o con historia familiar de infarto prematuro, el médico puede sospechar hipercolesterolemia familiar y puede solicitar pruebas genéticas o pedir un estudio de familiares directos. También puede pedir una ecografía de carótidas para ver si ya hay placas en esas arterias."
    ],
    "callout": {
      "label": "El colesterol no LDL también importa",
      "body": "El colesterol no HDL (colesterol total menos HDL) y la lipoproteína(a) son marcadores adicionales de riesgo que el médico puede incluir en tu evaluación, especialmente si tu riesgo no queda bien explicado por los valores estándar. Pregunta si tu evaluación los incluye."
    }
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento de la dislipidemia tiene como objetivo reducir el riesgo cardiovascular global, no solo llevar el colesterol a un número determinado. La meta de LDL que tu médico establezca para ti depende de tu nivel de riesgo: mientras mayor sea tu riesgo (por ejemplo, si ya tuviste un infarto), más bajo debe estar tu LDL.",
      "Los cambios en el estilo de vida son siempre el primer paso y, solos, pueden reducir el LDL entre un 10-30%. Los más efectivos son: reducir las grasas saturadas (carnes grasas, mantequilla, queso, aceite de coco y palma) y las grasas trans (productos procesados con 'aceite vegetal parcialmente hidrogenado'); aumentar el consumo de fibra soluble (avena, legumbres, frutas); añadir esteroles vegetales (presentes en ciertos alimentos enriquecidos); hacer ejercicio aeróbico regular (eleva el HDL y baja los triglicéridos); y perder peso si hay sobrepeso.",
      "Las estatinas son los medicamentos de primera línea para reducir el colesterol LDL. Actúan bloqueando una enzima clave en la producción de colesterol en el hígado, lo que también hace que el hígado absorba más LDL de la sangre. Son los medicamentos con mayor evidencia para reducir infartos y muertes cardiovasculares. Existen varias estatinas con diferentes potencias: la rosuvastatina y la atorvastatina son las más potentes. Los efectos secundarios más frecuentes son los dolores musculares, que generalmente se resuelven ajustando la dosis o cambiando a otra estatina.",
      "Cuando las estatinas no son suficientes o no se toleran, existen otras opciones: la ezetimiba reduce la absorción de colesterol en el intestino y puede combinarse con estatinas; los inhibidores de PCSK9 (evolocumab, alirocumab) son medicamentos inyectables muy potentes que reducen el LDL hasta un 60% adicional sobre las estatinas, indicados para personas de muy alto riesgo o con hipercolesterolemia familiar; los fibratos y el ácido nicotínico son más útiles para reducir los triglicéridos y elevar el HDL.",
      "Para los triglicéridos muy elevados (por encima de 500 mg/dL con riesgo de pancreatitis), el tratamiento prioritario son los fibratos, la restricción de alcohol y carbohidratos refinados, y el tratamiento de causas secundarias como la diabetes o el hipotiroidismo. Los ácidos grasos omega-3 en dosis farmacológicas (icosapent etil) han demostrado reducir el riesgo cardiovascular en personas con triglicéridos elevados que ya toman estatinas."
    ],
    "callout": {
      "label": "Las estatinas son seguras para la mayoría",
      "body": "La preocupación más común sobre las estatinas es el daño hepático o muscular grave. En realidad, el daño hepático grave es extremadamente raro (1 en 100,000 pacientes). Los dolores musculares son más frecuentes pero casi siempre reversibles al ajustar el tratamiento. Los beneficios de las estatinas en personas con riesgo cardiovascular elevado superan ampliamente sus riesgos, según meta-análisis del Cochrane Collaboration."
    }
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Manejar la dislipidemia es un compromiso a largo plazo, no un tratamiento temporal. El colesterol elevado daña las arterias durante décadas, y el tratamiento efectivo requiere consistencia durante años. La buena noticia es que los cambios en el estilo de vida se vuelven hábitos y los medicamentos generalmente se toleran bien.",
      "En la alimentación, los cambios más impactantes son reducir las grasas saturadas y trans, y aumentar la fibra soluble. Esto no significa una dieta restrictiva o sin placer: significa preferir aceite de oliva sobre mantequilla, elegir carnes magras y pescado sobre carnes procesadas, aumentar el consumo de legumbres, frutas, verduras y granos integrales, y leer etiquetas para evitar los productos con grasas trans o altos en grasas saturadas.",
      "El ejercicio aeróbico regular es especialmente efectivo para elevar el HDL y reducir los triglicéridos. Apunta a 150 minutos por semana de actividad moderada — caminar, nadar, andar en bicicleta, bailar. El entrenamiento de fuerza también contribuye al control de los lípidos y al metabolismo general.",
      "Si tomas estatinas, es importante saber que el jugo de toronja (pomelo) puede interferir con el metabolismo de algunas estatinas y elevar sus niveles en sangre. Consulta con tu médico si debes evitarlo. La coenzima Q10 (CoQ10) a veces se recomienda para los dolores musculares asociados a estatinas, aunque la evidencia es mixta — pregunta a tu médico.",
      "El seguimiento periódico con análisis de sangre es fundamental. Generalmente se hace un perfil lipídico 6-8 semanas después de iniciar o ajustar el tratamiento para ver la respuesta, y luego cada 6-12 meses una vez que se alcanza la meta. También se monitorea la función hepática al inicio del tratamiento con estatinas."
    ]
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Entender tus números y tu riesgo te ayuda a tomar decisiones informadas. Lleva estas preguntas a tu próxima consulta."
    ],
    "questions": [
      "¿Cuál es mi riesgo cardiovascular a 10 años y cómo lo calculó?",
      "¿Cuál debe ser mi meta de colesterol LDL según mi nivel de riesgo?",
      "¿Cuánto puede mejorar mi perfil lipídico solo con cambios en el estilo de vida, antes de necesitar medicamentos?",
      "Si necesito estatina, ¿cuál es la dosis y el tipo adecuados para mí?",
      "¿Qué efectos secundarios debo esperar y cuáles son señal de que debo llamarle?",
      "¿Tengo hipercolesterolemia familiar? ¿Debo hacer tamizar a mis hijos o hermanos?",
      "¿Mi colesterol alto puede ser consecuencia de otra condición (tiroides, diabetes) que deba tratar primero?",
      "¿Debo evitar el jugo de toronja u otros alimentos con mis medicamentos?",
      "¿Puedo tomar suplementos de omega-3 o fibra? ¿Cuáles me recomienda?",
      "¿Con qué frecuencia debo hacerme el perfil lipídico y otros análisis de seguimiento?",
      "¿Debo hacerme algún estudio de imagen para ver si ya hay placas en mis arterias?",
      "¿Mis triglicéridos elevados requieren tratamiento adicional más allá del colesterol?"
    ]
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "Grundy, S. M., Stone, N. J., Bailey, A. L., et al. (2019). 2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA guideline on the management of blood cholesterol. Journal of the American College of Cardiology, 73(24), e285–e350. https://doi.org/10.1016/j.jacc.2018.11.003",
      "Mach, F., Baigent, C., Catapano, A. L., et al. (2020). 2019 ESC/EAS guidelines for the management of dyslipidaemias. European Heart Journal, 41(1), 111–188. https://doi.org/10.1093/eurheartj/ehz455",
      "Baigent, C., Blackwell, L., Emberson, J., et al. (2010). Efficacy and safety of more intensive lowering of LDL cholesterol: A meta-analysis of data from 170,000 participants in 26 randomised trials. The Lancet, 376(9753), 1670–1681. https://doi.org/10.1016/S0140-6736(10)61350-5",
      "Sabatine, M. S., Giugliano, R. P., Keech, A. C., et al. (2017). Evolocumab and clinical outcomes in patients with cardiovascular disease. New England Journal of Medicine, 376(18), 1713–1722. https://doi.org/10.1056/NEJMoa1615664",
      "Bhatt, D. L., Steg, P. G., Miller, M., et al. (2019). Cardiovascular risk reduction with icosapent ethyl for hypertriglyceridemia. New England Journal of Medicine, 380(1), 11–22. https://doi.org/10.1056/NEJMoa1812792",
      "Taylor, F., Huffman, M. D., Macedo, A. F., et al. (2013). Statins for the primary prevention of cardiovascular disease. Cochrane Database of Systematic Reviews, 1, CD004816. https://doi.org/10.1002/14651858.CD004816.pub5",
      "Nordestgaard, B. G., Chapman, M. J., Humphries, S. E., et al. (2013). Familial hypercholesterolaemia is underdiagnosed and undertreated in the general population: Guidance for clinicians to prevent coronary heart disease. European Heart Journal, 34(45), 3478–3490. https://doi.org/10.1093/eurheartj/eht273"
    ]
  }'::jsonb
from conditions c where c.slug = 'dislipidemia';


-- Condiciones 43-47: Metabólico-Endocrino
-- Generado para Aliis — plataforma educativa para pacientes

-- ============================================================
-- 43. DIABETES TIPO 2
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'diabetes-tipo-2',
  'Diabetes Tipo 2',
  'Cuando el cuerpo deja de usar bien el azúcar',
  'La diabetes tipo 2 es una condición en la que el cuerpo no puede usar la insulina de manera eficiente, lo que provoca que el azúcar se acumule en la sangre. Con el tratamiento adecuado —que incluye cambios en el estilo de vida y, cuando es necesario, medicamentos— la mayoría de las personas lleva una vida plena y activa.',
  'endocrinología',
  'E11',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "La diabetes tipo 2 es una enfermedad crónica en la que el cuerpo tiene dificultades para regular el azúcar (glucosa) en la sangre. Para entenderlo, imagina que la glucosa es como un pasajero que necesita entrar a las células de tu cuerpo para darles energía. La insulina —una hormona producida por el páncreas— es la llave que abre esa puerta. En la diabetes tipo 2, la llave no funciona bien (resistencia a la insulina) y, con el tiempo, el páncreas tampoco produce suficiente llave. Resultado: el azúcar se queda circulando en la sangre en lugar de entrar a las células.",
      "Es la forma más común de diabetes: representa entre el 90 y el 95% de todos los casos. A diferencia de la diabetes tipo 1, en la tipo 2 el páncreas sigue produciendo insulina, solo que en cantidades insuficientes o con una respuesta celular deficiente. La enfermedad generalmente se desarrolla de forma gradual, durante años, antes de que aparezcan síntomas claros.",
      "La buena noticia es que la diabetes tipo 2 es en gran medida manejable y, en etapas tempranas, a veces incluso reversible con cambios significativos en el estilo de vida. Las guías de la Asociación Americana de Diabetes (ADA, 2024) destacan que el manejo integral —nutrición, actividad física, medicación y apoyo psicológico— permite que la mayoría de las personas con esta condición vivan de manera saludable.",
      "No tener diabetes tipo 2 controlada, en cambio, puede afectar con el tiempo órganos como los riñones, los ojos, el corazón y los nervios. Por eso el diagnóstico y el seguimiento oportuno son tan importantes: cuanto antes se actúa, mejor se protege el cuerpo a largo plazo."
    ],
    "callout": {
      "label": "Dato clave",
      "body": "Más de 537 millones de adultos viven con diabetes en el mundo (IDF, 2021). En México y América Latina, la diabetes tipo 2 es una de las principales causas de consulta médica y hospitalización."
    }
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La diabetes tipo 2 no tiene una sola causa: es el resultado de una combinación de factores genéticos y del estilo de vida. Dicho de otro modo, algunas personas nacen con mayor predisposición, pero son los hábitos cotidianos los que a menudo terminan de desencadenar la enfermedad.",
      "Los factores de riesgo más importantes son: tener sobrepeso u obesidad (especialmente con grasa acumulada en el abdomen), llevar una vida sedentaria, tener antecedentes familiares de diabetes tipo 2, haber tenido diabetes gestacional durante un embarazo, pertenecer a ciertos grupos étnicos (latinoamericanos, afroamericanos, nativos americanos tienen mayor riesgo), tener más de 45 años, y presentar prediabetes —niveles de azúcar en sangre más altos de lo normal, pero aún sin llegar al rango de diabetes.",
      "La resistencia a la insulina —el mecanismo central de la diabetes tipo 2— se desarrolla cuando las células del músculo, del hígado y de la grasa dejan de responder correctamente a la insulina. El páncreas intenta compensarlo produciendo más insulina, pero con el tiempo se agota y ya no puede mantener el nivel de glucosa estable.",
      "Otros factores que aumentan el riesgo incluyen dormir poco (la privación del sueño altera las hormonas que regulan el apetito y la glucosa), el estrés crónico, y el consumo regular de bebidas azucaradas y alimentos ultraprocesados."
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La diabetes tipo 2 es conocida como la enfermedad silenciosa porque durante años puede no dar síntomas claros. Muchas personas se enteran del diagnóstico en un análisis de rutina, sin haber sentido nada fuera de lo común. Por eso los chequeos regulares son tan importantes, especialmente si tienes factores de riesgo.",
      "Cuando los síntomas sí aparecen, los más frecuentes son: sed intensa y frecuente, orinar muchas veces (incluso de noche), cansancio sin razón aparente, visión borrosa, heridas que tardan en sanar, infecciones frecuentes (especialmente de encías o piel), y sensación de hormigueo o entumecimiento en manos o pies.",
      "Estos síntomas ocurren porque el exceso de glucosa en sangre daña gradualmente los vasos sanguíneos y los nervios, y porque el cuerpo intenta eliminar el azúcar extra a través de la orina, arrastrando agua y causando deshidratación."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Hipoglucemia severa",
        "d": "Si estás en tratamiento con insulina o ciertos medicamentos y presentas confusión, temblores intensos, pérdida del conocimiento o convulsiones, busca atención de emergencia de inmediato. Puede ser una bajada peligrosa de azúcar."
      },
      {
        "tone": "red",
        "t": "Crisis hiperglucémica (HHNK)",
        "d": "Niveles de glucosa extremadamente altos, confusión mental, deshidratación severa y somnolencia extrema pueden indicar un estado hiperosmolar hiperglucémico, una emergencia médica que requiere hospitalización urgente."
      },
      {
        "tone": "amber",
        "t": "Heridas que no cicatrizan",
        "d": "Una herida, úlcera o infección en los pies que no mejora en pocos días debe evaluarse pronto. El pie diabético puede progresar rápidamente si no se trata."
      },
      {
        "tone": "amber",
        "t": "Visión borrosa súbita",
        "d": "Los cambios repentinos en la visión pueden indicar daño en los vasos de la retina. Consulta con tu médico o un oftalmólogo sin demora."
      },
      {
        "tone": "amber",
        "t": "Glucosa muy alta en casa",
        "d": "Si tu glucómetro marca valores sostenidos por encima de 300 mg/dL y te sientes mal, contacta a tu equipo de salud el mismo día."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico de diabetes tipo 2 se hace con análisis de sangre simples. No es necesario pasar por procedimientos complicados. Los criterios diagnósticos actuales, establecidos por la ADA (2024), se basan en cuatro posibles pruebas: glucosa en ayuno, hemoglobina glucosilada (HbA1c), prueba de tolerancia a la glucosa oral, o glucosa aleatoria con síntomas.",
      "La hemoglobina glucosilada (HbA1c) es una de las más útiles porque no requiere ayuno y refleja el promedio de azúcar en sangre de los últimos 2-3 meses. Un resultado de 6.5% o más en dos ocasiones confirma diabetes. Entre 5.7% y 6.4% indica prediabetes.",
      "Para confirmar el diagnóstico, generalmente se repite la misma prueba o se usa una segunda prueba diferente, salvo que los síntomas sean muy claros. Tu médico también evaluará el resto de tu perfil metabólico: colesterol, función renal, presión arterial y peso."
    ],
    "callout": {
      "label": "¿Qué es la HbA1c?",
      "body": "La hemoglobina glucosilada (HbA1c) mide cuánto azúcar se ha pegado a los glóbulos rojos en los últimos 2-3 meses. Es como el 'promedio del trimestre' de tu glucosa. El objetivo en la mayoría de los adultos con diabetes tipo 2 es mantenerla por debajo del 7%."
    },
    "timeline": [
      {"w": "Glucosa en ayuno", "t": "Normal: menos de 100 mg/dL · Prediabetes: 100–125 mg/dL · Diabetes: 126 mg/dL o más (en dos ocasiones)"},
      {"w": "HbA1c", "t": "Normal: menos de 5.7% · Prediabetes: 5.7–6.4% · Diabetes: 6.5% o más"},
      {"w": "Glucosa 2h poscarga", "t": "Normal: menos de 140 mg/dL · Prediabetes: 140–199 mg/dL · Diabetes: 200 mg/dL o más"},
      {"w": "Glucosa aleatoria", "t": "200 mg/dL o más con síntomas confirma diabetes"}
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento de la diabetes tipo 2 es personalizado: no existe una fórmula única para todos. Las guías de la ADA (2024) recomiendan un enfoque centrado en la persona, que considera tu peso, tus otras condiciones de salud, tus preferencias y tu acceso a medicamentos. El objetivo principal es mantener la glucosa dentro de rangos seguros para proteger tus órganos a largo plazo.",
      "Los cambios en el estilo de vida son siempre el primer pilar: una alimentación equilibrada (no significa comer sin sabor), actividad física regular (150 minutos a la semana de movimiento moderado es el objetivo mínimo), dormir bien y manejar el estrés. En personas con diagnóstico reciente y prediabetes avanzada, estos cambios por sí solos pueden normalizar la glucosa.",
      "Cuando se necesita medicación, la metformina sigue siendo el fármaco de primera línea más usado por su seguridad, bajo costo y efectividad. Actúa principalmente reduciendo la producción de glucosa en el hígado. Se toma en pastillas y es bien tolerada por la mayoría.",
      "En los últimos años han aparecido dos grupos de medicamentos que cambiaron el panorama: los iSGLT2 (como empagliflozina o dapagliflozina) y los arGLP-1 (como semaglutida o liraglutida). Además de controlar la glucosa, estos medicamentos protegen el corazón y los riñones, y ayudan a perder peso. La ADA los recomienda especialmente en personas con enfermedad cardiovascular o riesgo renal elevado.",
      "En etapas más avanzadas, cuando el páncreas ya no produce suficiente insulina, puede ser necesario agregar insulina al tratamiento. Esto no es un fracaso: es una herramienta más del manejo. Tu médico te enseñará cómo usarla de manera segura."
    ],
    "callout": {
      "label": "Objetivo glucémico general",
      "body": "Para la mayoría de los adultos con diabetes tipo 2: HbA1c menor al 7%, glucosa en ayuno entre 80–130 mg/dL, y glucosa 2 horas después de comer menor a 180 mg/dL (ADA, 2024). Tu médico puede ajustar estos objetivos según tu situación."
    }
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con diabetes tipo 2 implica incorporar nuevos hábitos, pero no significa renunciar a disfrutar la vida. Millones de personas manejan esta condición y llevan una vida activa, con trabajo, familia, viajes y placeres cotidianos. La clave está en la constancia, no en la perfección.",
      "El monitoreo de glucosa en casa —con un glucómetro o, cada vez más, con sensores continuos de glucosa (CGM)— te da información en tiempo real sobre cómo responde tu cuerpo a los alimentos, el ejercicio y el estrés. Conocer tus patrones te da poder para tomar mejores decisiones.",
      "En cuanto a la alimentación, no existe una 'dieta para diabéticos' universal. Lo que sí funciona: reducir azúcares simples y harinas refinadas, aumentar fibra (verduras, legumbres, granos enteros), controlar el tamaño de las porciones, y no saltarte comidas. El apoyo de un nutricionista especializado en diabetes puede marcar una gran diferencia.",
      "El ejercicio es uno de los mejores medicamentos disponibles: mejora la sensibilidad a la insulina, ayuda a controlar el peso y reduce el estrés. No tienes que correr maratones: caminar 30 minutos al día, cinco días a la semana, ya tiene efectos medibles. Añadir ejercicio de fuerza (pesas o resistencia) potencia aún más los beneficios.",
      "No olvides los chequeos preventivos: visita al oftalmólogo al menos una vez al año (para revisar la retina), examen del pie en cada consulta, análisis de función renal y orina periódicamente, y control de presión arterial y colesterol. Detectar complicaciones a tiempo hace toda la diferencia."
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Llevar estas preguntas a tu próxima consulta puede ayudarte a entender mejor tu situación y a tomar decisiones informadas junto con tu equipo de salud."
    ],
    "questions": [
      "¿Cuál es mi HbA1c actual y cuál debería ser mi meta?",
      "¿Qué rango de glucosa debo esperar en ayuno y después de comer?",
      "¿Mi medicamento actual es el más adecuado para mi situación, considerando mi peso y mi salud cardiovascular?",
      "¿Debería considerar un iSGLT2 o un arGLP-1 dado mi perfil de riesgo?",
      "¿Con qué frecuencia debo medirme la glucosa en casa y cuándo debo preocuparme?",
      "¿Qué alimentos debo priorizar o limitar según mis resultados actuales?",
      "¿Tengo señales de daño en riñones, ojos o nervios que deba vigilar?",
      "¿Cuándo fue mi última revisión de los pies y de la retina?",
      "¿Hay algún programa de educación en diabetes o grupo de apoyo al que pueda unirme?",
      "¿Qué síntomas deben llevarme a urgencias o a llamarte directamente?",
      "Si pierdo peso, ¿podría reducir o suspender algún medicamento?",
      "¿Qué vacunas necesito tener al día siendo una persona con diabetes?"
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Diabetes Association. (2024). Standards of Care in Diabetes—2024. Diabetes Care, 47(Supplement 1), S1–S321. https://doi.org/10.2337/dc24-SINT",
      "International Diabetes Federation. (2021). IDF Diabetes Atlas (10th ed.). International Diabetes Federation. https://diabetesatlas.org",
      "Davies, M. J., Aroda, V. R., Collins, B. S., Gabbay, R. A., Green, J., Maruthur, N. M., … Buse, J. B. (2022). Management of hyperglycemia in type 2 diabetes, 2022. A consensus report by the American Diabetes Association (ADA) and the European Association for the Study of Diabetes (EASD). Diabetes Care, 45(11), 2753–2786. https://doi.org/10.2337/dci22-0034",
      "Buse, J. B., Wexler, D. J., Tsapas, A., Rossing, P., Mingrone, G., Mathieu, C., … Davies, M. J. (2020). 2019 update to: Management of hyperglycemia in type 2 diabetes. Diabetes Care, 43(3), 487–493.",
      "Lean, M. E. J., Leslie, W. S., Barnes, A. C., Brosnahan, N., Thom, G., McCombie, L., … Taylor, R. (2018). Primary care-led weight management for remission of type 2 diabetes (DiRECT): An open-label, cluster-randomised trial. The Lancet, 391(10120), 541–551.",
      "Zinman, B., Wanner, C., Lachin, J. M., Fitchett, D., Bluhmki, E., Hantel, S., … Inzucchi, S. E. (2015). Empagliflozin, cardiovascular outcomes, and mortality in type 2 diabetes. New England Journal of Medicine, 373(22), 2117–2128.",
      "Marso, S. P., Daniels, G. H., Brown-Frandsen, K., Kristensen, P., Mann, J. F. E., Nauck, M. A., … Buse, J. B. (2016). Liraglutide and cardiovascular outcomes in type 2 diabetes. New England Journal of Medicine, 375(4), 311–322."
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-2';


-- ============================================================
-- 44. DIABETES TIPO 1
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'diabetes-tipo-1',
  'Diabetes Tipo 1',
  'Cuando el sistema inmune ataca al páncreas',
  'La diabetes tipo 1 es una enfermedad autoinmune en la que el sistema inmunitario destruye las células del páncreas que producen insulina. Quien la tiene necesita insulina de por vida, pero con las herramientas modernas —bombas, sensores continuos y educación— puede llevar una vida completamente activa.',
  'endocrinología',
  'E10',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "La diabetes tipo 1 es una enfermedad autoinmune crónica en la que el propio sistema inmunitario ataca y destruye las células beta del páncreas —las únicas que producen insulina. Sin insulina, el cuerpo no puede convertir el azúcar (glucosa) en energía, y los niveles de glucosa en sangre suben de manera peligrosa. No es una enfermedad causada por la alimentación ni por el estilo de vida: ocurre porque el sistema inmune comete un error.",
      "Imagina que el páncreas es una fábrica de llaves (insulina). En la diabetes tipo 1, esa fábrica queda destruida casi por completo. A diferencia de la tipo 2, donde la fábrica todavía funciona aunque mal, en la tipo 1 prácticamente no hay producción propia. Por eso la insulina externa no es una opción: es una necesidad vital, todos los días, de por vida.",
      "Aunque puede aparecer a cualquier edad, la diabetes tipo 1 se diagnostica con mayor frecuencia en niños, adolescentes y adultos jóvenes. Representa entre el 5 y el 10% de todos los casos de diabetes. No tiene cura conocida hoy en día, pero los avances tecnológicos de la última década —sensores continuos de glucosa, bombas de insulina y sistemas de asa cerrada— han transformado radicalmente la calidad de vida de quienes la viven.",
      "Las guías de la Asociación Americana de Diabetes (ADA, 2024) y la International Society for Pediatric and Adolescent Diabetes (ISPAD) coinciden: la educación diabetológica estructurada y el acceso a tecnología son pilares fundamentales del manejo, tan importantes como la insulina misma."
    ],
    "callout": {
      "label": "Diferencia clave con la tipo 2",
      "body": "En la diabetes tipo 1, el páncreas ya no produce insulina (causa autoinmune). En la tipo 2, el páncreas produce insulina pero el cuerpo no la usa bien (resistencia). Son enfermedades distintas con manejos distintos, aunque comparten el nombre 'diabetes'."
    }
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La causa exacta de la diabetes tipo 1 todavía no se comprende por completo, pero se sabe que involucra una combinación de predisposición genética y un desencadenante ambiental. En pocas palabras: algunas personas nacen con ciertos genes que las hacen más vulnerables, y algo en el entorno —posiblemente una infección viral, cambios en la microbiota intestinal u otros factores— activa una respuesta inmune equivocada que destruye las células del páncreas.",
      "Tener un familiar de primer grado (padre, madre, hermano) con diabetes tipo 1 aumenta el riesgo. Sin embargo, la mayoría de los casos (cerca del 85%) ocurren en personas sin antecedentes familiares conocidos. Ciertos marcadores genéticos —como los genes HLA-DR y HLA-DQ— están asociados con mayor susceptibilidad.",
      "No existe forma probada de prevenir la diabetes tipo 1. No es consecuencia de comer mucho azúcar, de no hacer ejercicio ni de ninguna decisión personal. Esto es importante de entender, tanto para quien la tiene como para sus familias: no hay culpa ni responsabilidad individual en su origen.",
      "La investigación actual explora varios desencadenantes potenciales: infecciones por enterovirus, deficiencia de vitamina D, parto por cesárea y cambios en la flora intestinal en la infancia. Pero ninguno está confirmado como causa directa."
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "A diferencia de la diabetes tipo 2, que puede ser silenciosa durante años, la diabetes tipo 1 suele aparecer de forma más rápida y con síntomas más marcados. La presentación clásica en niños y adultos jóvenes incluye: sed intensa (polidipsia), orinar con mucha frecuencia (poliuria), pérdida de peso sin explicación, hambre excesiva incluso después de comer, cansancio extremo, visión borrosa e irritabilidad.",
      "Estos síntomas ocurren en cuestión de semanas o pocos meses. Muchos casos se diagnostican cuando la persona llega a urgencias con cetoacidosis diabética (CAD), una complicación grave que ocurre cuando el cuerpo, sin insulina, empieza a quemar grasa de manera descontrolada y produce cuerpos cetónicos que acidifican la sangre.",
      "Una vez que la persona está en tratamiento con insulina, los síntomas más frecuentes del día a día son las variaciones de glucosa: hipoglucemias (glucosa demasiado baja) e hiperglucemias (glucosa demasiado alta). Reconocerlos y saber cómo actuar es parte esencial de vivir bien con diabetes tipo 1."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Cetoacidosis diabética (CAD)",
        "d": "Náuseas o vómitos, dolor abdominal, respiración acelerada y profunda (respiración de Kussmaul), aliento con olor a fruta o acetona, confusión o somnolencia extrema. Es una emergencia. Llama al 911 o ve a urgencias de inmediato."
      },
      {
        "tone": "red",
        "t": "Hipoglucemia severa",
        "d": "Pérdida del conocimiento, convulsiones o incapacidad de tragar. Administra glucagón de emergencia si está disponible y llama al 911. No intentes darle de comer a una persona inconsciente."
      },
      {
        "tone": "amber",
        "t": "Hipoglucemia moderada",
        "d": "Temblores, sudoración fría, palpitaciones, confusión leve, hambre súbita. Toma 15 g de glucosa de acción rápida (3-4 tabletas de glucosa, 150 ml de jugo) y vuelve a medir en 15 minutos."
      },
      {
        "tone": "amber",
        "t": "Hiperglucemia persistente",
        "d": "Glucosa por encima de 250 mg/dL en dos mediciones seguidas, especialmente si hay cetonas en orina o sangre elevadas. Contacta a tu equipo de salud."
      },
      {
        "tone": "amber",
        "t": "Síntomas nuevos en niños",
        "d": "Sed y orina excesiva, pérdida de peso, fatiga inexplicable en un niño sin diagnóstico previo: consulta al médico ese mismo día. El diagnóstico temprano previene la CAD."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico de diabetes tipo 1 se confirma con los mismos criterios de glucosa que la tipo 2: glucosa en ayuno ≥ 126 mg/dL, HbA1c ≥ 6.5%, glucosa aleatoria ≥ 200 mg/dL con síntomas, o prueba de tolerancia oral a la glucosa ≥ 200 mg/dL. Sin embargo, distinguirla de la tipo 2 requiere pruebas adicionales.",
      "Para confirmar el origen autoinmune, el médico puede solicitar anticuerpos específicos: anti-GAD65, anti-insulina (IAA), anti-IA2 y anti-ZnT8. La presencia de uno o más de estos anticuerpos confirma la causa autoinmune. También se puede medir el péptido C, que refleja la producción propia de insulina: niveles muy bajos o indetectables indican que el páncreas ya no está produciendo insulina.",
      "En casos de presentación en urgencias (especialmente con cetoacidosis), el diagnóstico suele ser rápido. En presentaciones más lentas o atípicas —especialmente en adultos— puede ser más difícil distinguirla de la diabetes tipo 2 o de la LADA (diabetes autoinmune latente del adulto, una forma de tipo 1 de inicio más lento)."
    ],
    "callout": {
      "label": "¿Qué es la LADA?",
      "body": "La LADA (Latent Autoimmune Diabetes in Adults) es una forma de diabetes tipo 1 que aparece en adultos mayores de 30 años y progresa más lentamente. Inicialmente puede confundirse con tipo 2 porque responde a medicamentos orales, pero los anticuerpos anti-GAD la distinguen. Requiere insulina con el tiempo."
    }
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "La insulina es el tratamiento esencial e irremplazable de la diabetes tipo 1. Sin ella, el cuerpo no puede sobrevivir. La clave del manejo moderno está en imitar lo que haría un páncreas sano: proveer una cantidad base constante de insulina (basal) y dosis adicionales al comer (bolos). Esto se puede lograr con inyecciones múltiples al día o con una bomba de insulina.",
      "Las inyecciones múltiples diarias (MDI) son el estándar más accesible: una insulina de acción lenta (basal) una o dos veces al día, más insulina de acción rápida antes de cada comida. Las insulinas modernas —como la insulina glargina, detemir o degludec para basal; y lispro, aspart o glulisina para bolos— son mucho más predecibles que las insulinas antiguas.",
      "Las bombas de insulina (CSII) son dispositivos pequeños que se llevan en el cuerpo y suministran insulina de forma continua a través de un catéter fino. Permiten ajustes más precisos y son especialmente útiles para personas con variaciones frecuentes de glucosa, niños y mujeres embarazadas. Los sistemas de asa cerrada (o 'páncreas artificial') combinan una bomba con un sensor continuo de glucosa y un algoritmo que ajusta la insulina automáticamente — representan el avance más significativo en el manejo de la tipo 1 de los últimos años.",
      "El monitoreo continuo de glucosa (CGM) —con sensores como Dexcom, FreeStyle Libre o Medtronic Guardian— ha transformado el día a día de las personas con diabetes tipo 1. En lugar de pincharse el dedo varias veces al día, el sensor mide la glucosa cada pocos minutos y envía los datos al teléfono o al receptor. Las alarmas avisan de hipoglucemias antes de que sean peligrosas.",
      "La educación diabetológica estructurada —aprender a contar carbohidratos, calcular dosis, manejar situaciones especiales como el ejercicio o la enfermedad— es tan importante como cualquier medicamento. La ADA recomienda acceso a un educador certificado en diabetes (CDCES) para todas las personas con diabetes tipo 1."
    ],
    "callout": {
      "label": "Sistemas de asa cerrada",
      "body": "Los sistemas de páncreas artificial (como Omnipod 5, Medtronic 780G o Tandem Control-IQ) combinan bomba de insulina + CGM + algoritmo inteligente. El sistema mide la glucosa cada 5 minutos y ajusta la insulina solo. Estudios muestran que aumentan el tiempo en rango y reducen las hipoglucemias nocturnas de forma significativa."
    }
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con diabetes tipo 1 requiere tomar decisiones relacionadas con la glucosa prácticamente todo el día: antes de comer, antes de hacer ejercicio, cuando hay estrés, cuando se está enfermo. Con el tiempo, esas decisiones se vuelven parte de la rutina —como abrocharse el cinturón de seguridad— sin ocupar toda la mente.",
      "El ejercicio es especialmente importante pero también puede ser desafiante, porque el movimiento altera la glucosa de maneras distintas según el tipo e intensidad. El ejercicio aeróbico tiende a bajar la glucosa; el anaeróbico (pesas, sprints) puede subirla temporalmente. Aprender cómo responde tu cuerpo —con la ayuda del CGM— permite ajustar dosis e ingesta de carbohidratos para ejercitar de forma segura.",
      "La alimentación no necesita ser restrictiva, pero sí consciente. Contar o estimar carbohidratos es una habilidad que permite calcular la dosis de insulina de bolo con mayor precisión. No hay alimentos prohibidos en la diabetes tipo 1, pero sí cantidades que importan y momentos del día que afectan la respuesta glucémica de manera diferente.",
      "El aspecto emocional es central y a menudo subestimado. La carga de gestionar la glucosa todos los días —lo que se llama 'burnout del diabetes'— es real y documentada. La ansiedad por las hipoglucemias nocturnas, la fatiga de decisiones constantes y el impacto en la vida social son experiencias comunes. Buscar apoyo psicológico especializado en diabetes es completamente válido y recomendado por las guías internacionales.",
      "Las personas con diabetes tipo 1 pueden estudiar, trabajar, tener hijos, viajar y hacer deportes de alto rendimiento. Miles de atletas de élite, artistas y profesionales en todo el mundo viven con esta condición. La tecnología actual hace posible un nivel de control y libertad que era impensable hace apenas 20 años."
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Estas preguntas pueden ayudarte a sacar el máximo provecho de tu próxima consulta con tu endocrinólogo o educador en diabetes."
    ],
    "questions": [
      "¿Mi HbA1c actual y mi tiempo en rango (TIR) están donde deberían estar?",
      "¿Tengo acceso a un sensor continuo de glucosa (CGM) y cuál me recomiendas según mi estilo de vida?",
      "¿Soy candidato o candidata para una bomba de insulina o un sistema de asa cerrada?",
      "¿Cómo debo ajustar mis dosis de insulina los días que hago ejercicio?",
      "¿Cuál es mi protocolo para cuando tengo cetonas elevadas en casa?",
      "¿Cómo manejo la diabetes cuando estoy enfermo y no puedo comer?",
      "¿Tengo anticuerpos anti-GAD u otros marcadores autoinmunes documentados?",
      "¿Debo hacerme pruebas para detectar otras enfermedades autoinmunes asociadas (tiroides, celiaquía)?",
      "¿Cómo gestiono la diabetes si quiero embarazarme o si ya estoy embarazada?",
      "¿Hay apoyo psicológico especializado en diabetes disponible para mí?",
      "¿Con qué frecuencia debo revisar mis ojos, riñones y pies?",
      "¿Qué hago si tengo una hipoglucemia severa y estoy sola o solo?"
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "American Diabetes Association. (2024). Standards of Care in Diabetes—2024. Diabetes Care, 47(Supplement 1), S1–S321. https://doi.org/10.2337/dc24-SINT",
      "International Society for Pediatric and Adolescent Diabetes. (2022). ISPAD Clinical Practice Consensus Guidelines 2022. Pediatric Diabetes, 23(7). https://doi.org/10.1111/pedi.13408",
      "Atkinson, M. A., Eisenbarth, G. S., & Michels, A. W. (2014). Type 1 diabetes. The Lancet, 383(9911), 69–82. https://doi.org/10.1016/S0140-6736(13)60591-7",
      "Brown, S. A., Kovatchev, B. P., Raghinaru, D., Lum, J. W., Buckingham, B. A., Kudva, Y. C., … Anderson, S. M. (2019). Six-month randomized, multicenter trial of closed-loop control in type 1 diabetes. New England Journal of Medicine, 381(18), 1707–1717.",
      "Sherr, J. L., Schoelwer, M., Dos Santos, T. J., Redondo, M. J., Biester, T., Galderisi, A., … Maahs, D. M. (2022). ISPAD Clinical Practice Consensus Guidelines 2022: Diabetes technologies. Pediatric Diabetes, 23(8), 1races–1202.",
      "Weng, J., Zhou, Z., Guo, L., Zhu, D., Ji, L., Luo, X., … Bian, R. (2018). Incidence of type 1 diabetes in China, 2010–13: population based study. BMJ, 360, j5295.",
      "Barnard, K. D., Skinner, T. C., & Peveler, R. (2006). The prevalence of co-morbid depression in adults with type 1 diabetes: Systematic literature review. Diabetic Medicine, 23(4), 445–448."
    ]
  }'::jsonb
from conditions c where c.slug = 'diabetes-tipo-1';


-- ============================================================
-- 45. HIPOTIROIDISMO
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'hipotiroidismo',
  'Hipotiroidismo',
  'Cuando la tiroides produce poca hormona',
  'El hipotiroidismo ocurre cuando la glándula tiroides no produce suficiente hormona tiroidea, lo que ralentiza el metabolismo y provoca síntomas como cansancio, frío constante y aumento de peso. Es muy tratable con una pastilla diaria que reemplaza la hormona que falta.',
  'endocrinología',
  'E03.9',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "La tiroides es una glándula pequeña con forma de mariposa ubicada en la parte delantera del cuello. Su función es producir dos hormonas —T3 (triyodotironina) y T4 (tiroxina)— que actúan como el acelerador del metabolismo de cada célula del cuerpo. Regulan la temperatura corporal, el ritmo cardíaco, la energía, el estado de ánimo, el peso y decenas de funciones más.",
      "El hipotiroidismo ocurre cuando la tiroides produce menos hormona de la que el cuerpo necesita. Imagina que el motor de tu cuerpo funciona en ralentí: todo va más lento de lo normal. Eso explica los síntomas más característicos: cansancio persistente, sensación de frío, lentitud mental, estreñimiento, aumento de peso y piel seca.",
      "Es una de las enfermedades endocrinas más comunes en el mundo. Afecta aproximadamente al 5% de la población general, con mayor prevalencia en mujeres y en personas mayores de 60 años. En muchos casos, el hipotiroidismo subclínico —donde los niveles hormonales son ligeramente anormales pero no hay síntomas claros— es incluso más frecuente.",
      "La buena noticia es que el hipotiroidismo tiene uno de los tratamientos más simples de la medicina: una pastilla al día de levotiroxina (T4 sintética) que reemplaza exactamente lo que la tiroides no puede producir. Con la dosis adecuada y seguimiento regular, la mayoría de las personas vuelve a sentirse completamente bien."
    ],
    "callout": {
      "label": "Dato clave",
      "body": "La causa más común de hipotiroidismo en países con suficiente yodo en la dieta es la tiroiditis de Hashimoto, una enfermedad autoinmune en la que el sistema inmune ataca la tiroides. Es más frecuente en mujeres (relación 7:1 respecto a hombres) y tiene componente genético."
    }
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La causa más frecuente en países desarrollados es la tiroiditis de Hashimoto (o tiroiditis autoinmune crónica): el sistema inmune produce anticuerpos que atacan la tiroides y la dañan progresivamente hasta que ya no puede producir suficiente hormona. Es la misma lógica que la diabetes tipo 1 o la artritis reumatoide: una enfermedad en que el cuerpo se ataca a sí mismo por error.",
      "En países en vías de desarrollo, la deficiencia de yodo sigue siendo la principal causa de hipotiroidismo a nivel mundial. El yodo es el ingrediente esencial para fabricar la hormona tiroidea; sin él, la tiroides no puede funcionar. La sal yodada fue una de las intervenciones de salud pública más efectivas del siglo XX para prevenir esta deficiencia.",
      "Otras causas incluyen: tratamientos previos con yodo radiactivo o cirugía de tiroides (por hipertiroidismo o cáncer), radioterapia en el cuello, ciertos medicamentos (litio, amiodarona, interferón), hipotiroidismo congénito (presente desde el nacimiento) e hipotiroidismo central —raro— donde el problema no está en la tiroides sino en la glándula pituitaria que la controla.",
      "Los factores que aumentan el riesgo de hipotiroidismo son: ser mujer, tener más de 60 años, antecedentes familiares de enfermedad tiroidea, historial personal de otras enfermedades autoinmunes (como diabetes tipo 1, lupus, artritis reumatoide), haber tenido embarazo reciente (tiroiditis posparto) o vivir en zonas con baja ingesta de yodo."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Los síntomas del hipotiroidismo aparecen de forma gradual y pueden ser tan sutiles que se atribuyen al estrés o al envejecimiento normal. Los más frecuentes son: cansancio y fatiga desproporcionada, sensación constante de frío (incluso cuando los demás tienen calor), aumento de peso sin cambios en la dieta, estreñimiento persistente, piel seca y áspera, cabello y uñas frágiles, voz ronca, memoria más lenta o dificultad para concentrarse, estado de ánimo bajo o depresión, y menstruaciones irregulares o más abundantes.",
      "La intensidad de los síntomas depende del grado de deficiencia hormonal y de qué tan rápido se desarrolló. En hipotiroidismo subclínico (TSH levemente elevada, T4 normal), muchas personas no sienten nada. En hipotiroidismo manifiesto, los síntomas pueden ser incapacitantes."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Coma mixedematoso",
        "d": "Es la complicación más grave del hipotiroidismo severo no tratado: hipotermia extrema, alteración del estado de conciencia, bradicardia severa, insuficiencia respiratoria. Es una emergencia que pone en riesgo la vida. Llama al 911."
      },
      {
        "tone": "amber",
        "t": "Síntomas cardíacos",
        "d": "Frecuencia cardíaca muy lenta (bradicardia), sensación de que el corazón late despacio o con irregularidad. El hipotiroidismo puede afectar el ritmo cardíaco. Consulta pronto."
      },
      {
        "tone": "amber",
        "t": "Depresión severa o confusión mental",
        "d": "El hipotiroidismo no tratado puede causar síntomas psiquiátricos importantes. Si experimentas confusión, desorientación o depresión profunda con otros síntomas de tiroides, solicita análisis de sangre urgente."
      },
      {
        "tone": "amber",
        "t": "Bocio o cambio en el cuello",
        "d": "Si notas una protuberancia en el cuello, sensación de presión al tragar o cambio en la voz, consulta a tu médico. Puede indicar crecimiento de la tiroides que requiere evaluación."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico de hipotiroidismo se hace con un análisis de sangre sencillo. La prueba más importante es la TSH (hormona estimulante de la tiroides), que produce la glándula pituitaria para ordenarle a la tiroides que trabaje. Cuando la tiroides produce poca hormona, la pituitaria eleva la TSH para compensar —como si gritara más fuerte para que la tiroides reaccione. Un valor de TSH elevado indica hipotiroidismo.",
      "Si la TSH está alta, el médico suele pedir también T4 libre (T4L) para confirmar el diagnóstico y determinar su gravedad. Si la TSH está alta pero la T4 libre es normal, se habla de hipotiroidismo subclínico. Si ambas están alteradas, es hipotiroidismo manifiesto. En casos con sospecha de Hashimoto, se miden los anticuerpos anti-TPO (antiperoxidasa tiroidea) y anti-tiroglobulina.",
      "Las guías de la American Thyroid Association (ATA, 2014) recomiendan el cribado con TSH en mujeres mayores de 35 años cada 5 años, y en cualquier persona con síntomas sugestivos o factores de riesgo. Durante el embarazo, la vigilancia de la función tiroidea es especialmente importante: el hipotiroidismo no tratado puede afectar el desarrollo neurológico del bebé."
    ],
    "callout": {
      "label": "¿Qué significa una TSH alta?",
      "body": "La TSH normal está entre 0.4 y 4.0 mUI/L en la mayoría de los laboratorios. Una TSH por encima de 4.0–4.5 mUI/L, confirmada en dos ocasiones, generalmente indica que la tiroides no está produciendo suficiente hormona. Tu médico interpretará el resultado en el contexto de tus síntomas y otros análisis."
    }
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento estándar del hipotiroidismo es la levotiroxina sódica: una pastilla que contiene T4 sintética, idéntica a la que produce la tiroides. Es uno de los medicamentos más prescritos del mundo, con décadas de seguridad documentada. Se toma una vez al día, en ayuno, al menos 30–60 minutos antes del desayuno.",
      "La dosis se ajusta según la TSH: el objetivo es llevarla al rango normal (generalmente 0.5–2.5 mUI/L, aunque el objetivo exacto varía según la edad y la condición del paciente). La dosis inicial suele ser conservadora —especialmente en personas mayores o con enfermedad cardíaca— y se va subiendo gradualmente cada 6–8 semanas según los análisis.",
      "Una vez estabilizado el tratamiento, los controles de TSH se hacen cada 6–12 meses. Si la dosis es la correcta, la mayoría de las personas vuelve a sentirse completamente normal. No hay motivo para esperar sentirse 'bien para lo que tengo': el objetivo es la remisión completa de síntomas.",
      "Algunos puntos prácticos importantes: ciertos alimentos y medicamentos interfieren con la absorción de la levotiroxina (calcio, hierro, antiácidos con aluminio, soya). Siempre debes tomarla separada de estos. Durante el embarazo, generalmente se requiere aumentar la dosis. No interrumpas el tratamiento sin hablar con tu médico, aunque te sientas bien.",
      "En casos de hipotiroidismo subclínico leve (TSH entre 4.5 y 10 mUI/L sin síntomas), las guías actuales de la ATA recomiendan individualizar la decisión de tratar, especialmente en personas mayores. No siempre se requiere medicación de inmediato."
    ],
    "callout": {
      "label": "¿La levotiroxina se toma de por vida?",
      "body": "En la mayoría de los casos —especialmente cuando la causa es Hashimoto o cirugía de tiroides— sí es un tratamiento de por vida. Sin embargo, en algunos casos (como el hipotiroidismo posparto o por medicamentos) puede ser temporal. Tu médico evaluará si en algún momento se puede intentar reducir o suspender."
    }
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Con el tratamiento adecuado, vivir con hipotiroidismo es completamente compatible con una vida normal y activa. La pastilla diaria se vuelve tan rutinaria como lavarse los dientes. La mayoría de las personas dice que, una vez con la dosis correcta, se olvidan de que tienen hipotiroidismo.",
      "El hábito más importante es tomar la levotiroxina de manera constante: siempre a la misma hora, siempre en ayuno. Si un día se te olvida, tómala tan pronto lo recuerdes (a menos que ya sea casi hora de la siguiente dosis). No dobles la dosis.",
      "La alimentación no requiere restricciones especiales. Sin embargo, si consumes soya, nueces o alimentos muy ricos en fibra en grandes cantidades, ten en cuenta que pueden reducir la absorción de la levotiroxina. El yodo en cantidades normales (sal yodada, mariscos) es seguro; los suplementos con yodo en dosis altas, en cambio, pueden interferir con la tiroides y deben consultarse con el médico.",
      "El ejercicio regular ayuda a manejar el peso, la fatiga y el estado de ánimo —síntomas frecuentes del hipotiroidismo. A medida que la hormona se estabiliza, la energía mejora progresivamente. Si después de varios meses con la TSH en rango todavía te sientes cansada o cansado, comunícalo a tu médico: puede haber otros factores (anemia, vitamina D baja, apnea del sueño) que contribuyan.",
      "Si planeas embarazarte, avísale a tu médico con antelación. El hipotiroidismo en el embarazo requiere un seguimiento más estrecho y generalmente un aumento de dosis desde las primeras semanas. Una tiroides bien controlada es clave para el desarrollo sano del bebé."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Lleva estas preguntas a tu próxima consulta con tu endocrinólogo o médico de cabecera."
    ],
    "questions": [
      "¿Cuál es mi TSH actual y cuál es el rango que debería tener dado mi perfil (edad, embarazo, etc.)?",
      "¿Tengo anticuerpos anti-TPO positivos? ¿Eso cambia algo en mi seguimiento?",
      "¿Mi dosis de levotiroxina es la correcta o necesita ajuste?",
      "¿A qué hora exactamente debo tomar la pastilla y qué debo evitar comer cerca de ese momento?",
      "¿Con qué frecuencia debo repetir los análisis de sangre?",
      "¿Necesito tomar algún suplemento adicional, como vitamina D, selenio o hierro?",
      "¿El hipotiroidismo puede estar afectando mi estado de ánimo o mi memoria?",
      "Si quiero quedar embarazada, ¿qué debo hacer antes de intentarlo?",
      "¿Debo hacerme una ecografía de tiroides? ¿Con qué frecuencia?",
      "¿Hay algún alimento o medicamento que interfiera con mi tratamiento que deba conocer?",
      "¿Cuándo debería esperar sentirme mejor con el tratamiento?",
      "¿Es posible que en algún momento no necesite más medicamento?"
    ]
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "Jonklaas, J., Bianco, A. C., Bauer, A. J., Burman, K. D., Cappola, A. R., Celi, F. S., … Sawka, A. M. (2014). Guidelines for the treatment of hypothyroidism: Prepared by the American Thyroid Association Task Force on Thyroid Hormone Replacement. Thyroid, 24(12), 1670–1751. https://doi.org/10.1089/thy.2014.0028",
      "Garber, J. R., Cobin, R. H., Gharib, H., Hennessey, J. V., Klein, I., Mechanick, J. I., … Woeber, K. A. (2012). Clinical practice guidelines for hypothyroidism in adults. Thyroid, 22(12), 1200–1235. https://doi.org/10.1089/thy.2012.0205",
      "Alexander, E. K., Pearce, E. N., Brent, G. A., Brown, R. S., Chen, H., Dosiou, C., … Sullivan, S. (2017). 2017 Guidelines of the American Thyroid Association for the diagnosis and management of thyroid disease during pregnancy and the postpartum. Thyroid, 27(3), 315–389.",
      "Pearce, E. N., Andersson, M., & Zimmermann, M. B. (2013). Global iodine nutrition: Where do we stand in 2013? Thyroid, 23(5), 523–528.",
      "Chaker, L., Bianco, A. C., Jonklaas, J., & Peeters, R. P. (2017). Hypothyroidism. The Lancet, 390(10101), 1550–1562. https://doi.org/10.1016/S0140-6736(17)30703-1",
      "Canaris, G. J., Manowitz, N. R., Mayor, G., & Ridgway, E. C. (2000). The Colorado thyroid disease prevalence study. Archives of Internal Medicine, 160(4), 526–534.",
      "Razvi, S., Bhana, S., & Mrabeti, S. (2019). Challenges in interpreting thyroid stimulating hormone results in the diagnosis of thyroid dysfunction. Journal of Thyroid Research, 2019, 4106816."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipotiroidismo';


-- ============================================================
-- 46. HIPERTIROIDISMO
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'hipertiroidismo',
  'Hipertiroidismo',
  'Cuando la tiroides trabaja demasiado',
  'El hipertiroidismo ocurre cuando la glándula tiroides produce más hormona de la necesaria, acelerando el metabolismo y causando síntomas como palpitaciones, nerviosismo, pérdida de peso y temblores. Tiene varios tratamientos efectivos y la mayoría de las personas logra una remisión completa.',
  'endocrinología',
  'E05',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "Si en el hipotiroidismo la tiroides trabaja en ralentí, en el hipertiroidismo ocurre lo contrario: la tiroides produce demasiada hormona y el cuerpo funciona en modo turbo. El corazón late más rápido, el metabolismo se acelera, los nervios están en alerta constante y el cuerpo quema más calorías de lo normal. Todo esto puede sentirse como vivir con el motor al máximo todo el tiempo, sin poder apagarlo.",
      "La causa más común de hipertiroidismo es la enfermedad de Graves, una condición autoinmune en la que el sistema inmune produce anticuerpos que estimulan la tiroides para que trabaje en exceso (en lugar de atacarla, como en Hashimoto). También puede ser causado por nódulos tiroideos que producen hormona de forma autónoma (bocio multinodular tóxico o adenoma tóxico) o por tiroiditis —inflamación temporal de la tiroides.",
      "Es más común en mujeres que en hombres (entre 5 y 10 veces más frecuente) y puede aparecer a cualquier edad, aunque es más frecuente entre los 20 y los 50 años. Con el tratamiento adecuado —que puede incluir medicamentos antitiroideos, yodo radiactivo o cirugía— la gran mayoría de las personas logra controlar la enfermedad.",
      "Las guías de la American Thyroid Association (ATA, 2016) detallan tres opciones terapéuticas principales, cada una con ventajas y limitaciones. La elección depende de la causa del hipertiroidismo, la edad, el deseo de embarazo, la presencia de oftalmopatía y las preferencias del paciente."
    ],
    "callout": {
      "label": "Enfermedad de Graves y los ojos",
      "body": "La enfermedad de Graves puede afectar los ojos (oftalmopatía de Graves): enrojecimiento, irritación, sensación de arena, visión doble y, en casos severos, protrusión de los globos oculares (exoftalmos). Este problema puede ocurrir incluso cuando la tiroides ya está controlada y requiere evaluación por oftalmología."
    }
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La enfermedad de Graves causa aproximadamente el 70-80% de los casos de hipertiroidismo. Es una enfermedad autoinmune: el sistema inmune produce anticuerpos llamados TRAb (anticuerpos contra el receptor de TSH) que actúan como un interruptor siempre encendido sobre la tiroides, estimulándola a producir hormona continuamente sin necesidad de señal de la pituitaria.",
      "El bocio multinodular tóxico y el adenoma tóxico solitario son la segunda causa más frecuente. En estos casos, uno o varios nódulos dentro de la tiroides comienzan a producir hormona de manera autónoma —sin esperar instrucciones del sistema regulador normal. Son más frecuentes en personas mayores y en zonas con baja ingesta de yodo.",
      "La tiroiditis (inflamación de la tiroides) puede causar hipertiroidismo transitorio: cuando la glándula se inflama, libera en sangre la hormona que tenía almacenada. Este tipo de hipertiroidismo dura semanas o pocos meses y se resuelve solo, a menudo seguido de un período de hipotiroidismo temporal.",
      "Los factores de riesgo incluyen: ser mujer, antecedentes familiares de enfermedad tiroidea autoinmune, otras enfermedades autoinmunes personales, tabaquismo (que además empeora la oftalmopatía de Graves), estrés severo, embarazo o puerperio, y consumo excesivo de yodo (por medicamentos como la amiodarona o suplementos con yodo en dosis altas)."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Los síntomas del hipertiroidismo reflejan el estado de sobreaceleración de todo el organismo. Los más frecuentes son: palpitaciones o latido cardíaco rápido (taquicardia), nerviosismo, ansiedad o irritabilidad, temblor fino en las manos, intolerancia al calor y sudoración excesiva, pérdida de peso a pesar de comer normal o incluso más, diarrea o mayor frecuencia intestinal, debilidad muscular (especialmente en los muslos al subir escaleras), dificultad para dormir e irregularidades menstruales.",
      "En personas mayores, el hipertiroidismo puede presentarse de forma atípica —con menos síntomas clásicos y más con fatiga, pérdida de peso o fibrilación auricular— lo que retrasa el diagnóstico. A esto se le llama hipertiroidismo apático."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Tormenta tiroidea",
        "d": "Es la complicación más grave del hipertiroidismo: fiebre muy alta, taquicardia extrema (más de 140 latidos/min), agitación severa, confusión, vómitos y diarrea. Puede ser mortal. Es una emergencia médica. Llama al 911 de inmediato."
      },
      {
        "tone": "red",
        "t": "Fibrilación auricular",
        "d": "Latido cardíaco muy irregular, sensación de que el corazón 'patalea', mareo o dificultad para respirar. El hipertiroidismo puede desencadenar arritmias cardíacas graves. Busca atención de urgencia."
      },
      {
        "tone": "amber",
        "t": "Cambios visuales con ojos rojos o prominentes",
        "d": "En la enfermedad de Graves, la afectación ocular puede progresar. Visión doble, dolor en los ojos, visión borrosa o sensación de que los ojos se están saliendo requieren evaluación oftalmológica urgente."
      },
      {
        "tone": "amber",
        "t": "Debilidad muscular severa",
        "d": "Dificultad para levantarse de una silla, subir escaleras o levantar los brazos. El hipertiroidismo puede causar miopatía tiroidea. Consulta pronto."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico comienza con un análisis de sangre. La TSH es la primera prueba: en el hipertiroidismo, la pituitaria detecta el exceso de hormona tiroidea y baja o suprime completamente la TSH (como si apagara el pedal del acelerador porque la tiroides ya va muy rápido). Una TSH suprimida (menos de 0.1 mUI/L) con T4 libre y/o T3 libre elevadas confirma el hipertiroidismo.",
      "Para determinar la causa, el médico puede pedir: anticuerpos TRAb (positivos en enfermedad de Graves), una gammagrafía tiroidea con yodo radiactivo (muestra si toda la glándula está hiperactiva o solo ciertos nódulos) y una ecografía tiroidea (para evaluar el tamaño, la vascularización y la presencia de nódulos).",
      "El diagnóstico diferencial es importante porque el tratamiento cambia según la causa: la enfermedad de Graves, el bocio multinodular y la tiroiditis se manejan de forma diferente. Tu médico integrará los síntomas, el examen físico y los estudios para definir el tratamiento más adecuado."
    ],
    "callout": {
      "label": "TSH suprimida vs. TSH baja",
      "body": "Una TSH suprimida (menor de 0.01 mUI/L) con hormonas elevadas confirma hipertiroidismo manifiesto. Una TSH apenas baja (0.1–0.4 mUI/L) con hormonas normales indica hipertiroidismo subclínico, que puede no requerir tratamiento inmediato pero sí seguimiento."
    }
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "Existen tres opciones principales de tratamiento para el hipertiroidismo, y la elección depende de la causa, la severidad, la edad, la presencia de afectación ocular (en Graves) y el deseo de embarazo. Las guías de la ATA (2016) recomiendan discutir las opciones con el paciente y tomar una decisión compartida.",
      "Los medicamentos antitiroideos (metimazol o propiltiouracilo) bloquean la producción de hormona tiroidea. Son la primera línea en muchos casos, especialmente en personas jóvenes con enfermedad de Graves que podrían entrar en remisión. Se toman en pastillas durante 12–18 meses, con controles regulares de sangre. La tasa de remisión con medicamentos solos es de aproximadamente el 30–50% en la enfermedad de Graves.",
      "El yodo radiactivo (I-131) es el tratamiento más usado en Estados Unidos para adultos con enfermedad de Graves y bocio multinodular. Se toma en una sola cápsula; el yodo radiactivo se concentra en la tiroides y la destruye progresivamente. Es seguro, efectivo y definitivo. El resultado más frecuente a largo plazo es el hipotiroidismo (la tiroides queda sin función), que se trata con levotiroxina. No se recomienda en embarazadas ni en personas con oftalmopatía activa severa.",
      "La cirugía (tiroidectomía) es la opción más rápida: resuelve el hipertiroidismo en pocos días. Se recomienda cuando hay bocio muy grande con síntomas compresivos, nódulos con sospecha de malignidad, contraindicación para yodo radiactivo o preferencia del paciente. Como resultado, la persona queda hipotiroidea y necesita levotiroxina de por vida.",
      "Durante el tratamiento inicial, los betabloqueadores (como el propranolol o el atenolol) se usan para controlar los síntomas cardíacos y el temblor mientras la hormona tiroidea baja a niveles normales. No tratan la causa, pero mejoran mucho el bienestar."
    ],
    "callout": {
      "label": "¿Cuál opción es mejor para mí?",
      "body": "No hay una respuesta universal. Las personas jóvenes que quieren evitar la irradiación o la cirugía pueden preferir medicamentos. Quienes quieren una solución definitiva y no planean embarazo pronto pueden optar por yodo radiactivo. La cirugía es ideal si hay nódulos o bocio grande. Discútelo en detalle con tu endocrinólogo."
    }
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Durante el período de tratamiento activo, muchas personas notan una mejoría progresiva de los síntomas en las primeras semanas a medida que la hormona tiroidea baja. Las palpitaciones, el nerviosismo y el temblor suelen ser lo primero en mejorar, especialmente con los betabloqueadores.",
      "Si el tratamiento elegido fue yodo radiactivo o cirugía, es importante saber que el resultado esperado —y buscado— es el hipotiroidismo. Puede sonar paradójico, pero es así: mejor tener una tiroides inactiva que se puede controlar fácilmente con levotiroxina, que una tiroides hiperactiva difícil de manejar.",
      "El tabaquismo empeora significativamente la oftalmopatía de Graves. Si fumas y tienes Graves, dejar de fumar es una de las acciones más importantes que puedes tomar para proteger tus ojos. Las guías internacionales lo señalan como una prioridad.",
      "La alimentación no requiere restricciones especiales en la mayoría de los casos, aunque durante el período activo conviene evitar suplementos con yodo en dosis altas. En cuanto a la actividad física, el ejercicio intenso puede no ser recomendable mientras el corazón sigue con taquicardia; consulta a tu médico.",
      "Si tienes pensado quedar embarazada, es fundamental planificarlo con tu endocrinólogo: algunos tratamientos requieren esperar un período determinado, la medicación puede cambiar, y el hipertiroidismo activo aumenta el riesgo de complicaciones durante el embarazo."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Lleva estas preguntas para tomar una decisión informada sobre tu tratamiento con tu endocrinólogo."
    ],
    "questions": [
      "¿Cuál es la causa de mi hipertiroidismo: enfermedad de Graves, nódulo tóxico u otra?",
      "¿Tengo anticuerpos TRAb positivos y qué implica eso para mi pronóstico?",
      "¿Cuáles son las ventajas y desventajas de cada tratamiento en mi caso específico?",
      "Si elijo medicamentos antitiroideos, ¿cuál es la probabilidad de entrar en remisión?",
      "¿Tengo afectación ocular (oftalmopatía de Graves) que deba evaluarse por oftalmología?",
      "¿El tabaquismo está empeorando mis ojos y qué puedo hacer al respecto?",
      "¿Puedo hacer ejercicio o hay restricciones mientras mi frecuencia cardíaca sigue elevada?",
      "¿Qué síntomas deben llevarme a urgencias?",
      "Si elijo yodo radiactivo, ¿cuándo podré quedar embarazada después?",
      "¿Con qué frecuencia debo hacerme análisis de sangre durante el tratamiento?",
      "¿Qué pasa si no me trato? ¿Cuáles son los riesgos a largo plazo?",
      "¿Necesito usar betabloqueadores ahora y por cuánto tiempo?"
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "Ross, D. S., Burch, H. B., Cooper, D. S., Greenlee, M. C., Laurberg, P., Maia, A. L., … Walter, M. A. (2016). 2016 American Thyroid Association Guidelines for diagnosis and management of hyperthyroidism and other causes of thyrotoxicosis. Thyroid, 26(10), 1343–1421. https://doi.org/10.1089/thy.2016.0229",
      "Burch, H. B., & Cooper, D. S. (2015). Management of Graves disease: A review. JAMA, 314(23), 2544–2554. https://doi.org/10.1001/jama.2015.16535",
      "Smith, T. J., & Hegedüs, L. (2016). Graves' disease. New England Journal of Medicine, 375(16), 1552–1565. https://doi.org/10.1056/NEJMra1510030",
      "Kahaly, G. J., Bartalena, L., Hegedüs, L., Leenhardt, L., Poppe, K., & Pearce, S. H. (2018). 2018 European Thyroid Association Guideline for the management of Graves' hyperthyroidism. European Thyroid Journal, 7(4), 167–186.",
      "De Leo, S., Lee, S. Y., & Braverman, L. E. (2016). Hyperthyroidism. The Lancet, 388(10047), 906–918. https://doi.org/10.1016/S0140-6736(16)00278-6",
      "Alexander, E. K., Pearce, E. N., Brent, G. A., Brown, R. S., Chen, H., Dosiou, C., … Sullivan, S. (2017). 2017 Guidelines of the American Thyroid Association for thyroid disease during pregnancy. Thyroid, 27(3), 315–389.",
      "Bartalena, L., Baldeschi, L., Boboridis, K., Eckstein, A., Kahaly, G. J., Marcocci, C., … Wiersinga, W. M. (2016). The 2016 European Thyroid Association/European Group on Graves' Orbitopathy guidelines for the management of Graves' orbitopathy. European Thyroid Journal, 5(1), 1–20."
    ]
  }'::jsonb
from conditions c where c.slug = 'hipertiroidismo';


-- ============================================================
-- 47. SÍNDROME DE OVARIO POLIQUÍSTICO (SOP)
-- ============================================================

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published)
values (
  'sindrome-ovario-poliquistico',
  'Síndrome de Ovario Poliquístico (SOP)',
  'Un desequilibrio hormonal que afecta ciclos, piel y fertilidad',
  'El síndrome de ovario poliquístico (SOP) es el trastorno hormonal más común en mujeres en edad reproductiva. Se caracteriza por niveles elevados de andrógenos, ciclos menstruales irregulares y ovarios con múltiples folículos pequeños. Afecta la fertilidad pero tiene tratamiento efectivo, y entender el SOP es el primer paso para manejarlo.',
  'ginecología-endocrinología',
  'E28.2',
  true
);

-- Sección 1: ¿Qué es?
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
  '{
    "paragraphs": [
      "El síndrome de ovario poliquístico (SOP) es la alteración hormonal más frecuente en mujeres en edad fértil: afecta entre el 8 y el 13% de las mujeres a nivel mundial, aunque muchas no lo saben. A pesar del nombre, no siempre hay quistes en los ovarios propiamente dichos —lo que se ven en la ecografía son folículos pequeños que no llegaron a ovular, no quistes verdaderos.",
      "El corazón del SOP es un desequilibrio hormonal: los niveles de andrógenos (hormonas 'masculinas' que también están presentes en la mujer en cantidades normales, como la testosterona) están elevados. Esto interfiere con el proceso normal de ovulación, lo que a su vez causa ciclos menstruales irregulares o ausentes. Al mismo tiempo, muchas —no todas— las mujeres con SOP tienen resistencia a la insulina, lo que conecta este síndrome con el metabolismo.",
      "El SOP es un síndrome, no una enfermedad única: eso significa que es un conjunto de síntomas que pueden presentarse en distintas combinaciones y con distinta intensidad en cada persona. No hay dos mujeres con SOP exactamente iguales. Para el diagnóstico se usan los criterios de Rotterdam (2003), que requieren al menos dos de tres características: ciclos irregulares u ovulación ausente, hiperandrogenismo (elevación de andrógenos en sangre o síntomas clínicos como acné e hirsutismo) y ovarios poliquísticos en ecografía.",
      "Las guías del Internacional PCOS Network (2018) y la Endocrine Society (2023) ofrecen recomendaciones actualizadas para el diagnóstico y tratamiento. Un punto clave: el SOP es manejable. Con las intervenciones correctas —estilo de vida, medicamentos cuando se necesitan, apoyo psicológico— la mayoría de las mujeres logra controlar sus síntomas y alcanzar sus objetivos reproductivos si así lo desean."
    ],
    "callout": {
      "label": "¿El SOP es hereditario?",
      "body": "Sí, el SOP tiene un componente genético importante. Si tu madre, hermana o tía materna tiene SOP o diabetes tipo 2, tu riesgo de tener SOP es mayor. Sin embargo, el estilo de vida —especialmente el peso corporal y la actividad física— influye significativamente en cómo se manifiestan los síntomas."
    }
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';

-- Sección 2: Causas y factores de riesgo
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
  '{
    "paragraphs": [
      "La causa exacta del SOP no se conoce por completo, pero se sabe que involucra una combinación de factores genéticos y ambientales que alteran el eje hipotálamo-hipófisis-ovario: el sistema que regula el ciclo menstrual. En el SOP, la glándula pituitaria produce pulsos anormalmente frecuentes de LH (hormona luteinizante), lo que estimula los ovarios a producir más andrógenos y altera la ovulación.",
      "La resistencia a la insulina es un elemento central en la mayoría de los casos. Cuando las células no responden bien a la insulina, el páncreas produce más para compensar. Esos niveles altos de insulina estimulan los ovarios a producir aún más andrógenos, creando un círculo vicioso. Por eso el SOP está estrechamente relacionado con el riesgo de prediabetes y diabetes tipo 2: las mujeres con SOP tienen hasta 4 veces más riesgo de desarrollar diabetes.",
      "Los factores de riesgo incluyen: antecedentes familiares de SOP o diabetes tipo 2, sobrepeso u obesidad (aunque el SOP también afecta a mujeres con peso normal — se estima que entre el 20 y el 30% de las mujeres con SOP son delgadas), y posiblemente la exposición intrauterina a andrógenos elevados. El SOP no es causado por la alimentación, el estrés ni ninguna elección personal —es una condición biológica con base genética.",
      "El SOP no es solo un problema reproductivo: a largo plazo, las mujeres con SOP tienen mayor riesgo de síndrome metabólico, diabetes tipo 2, enfermedad cardiovascular, apnea del sueño y, posiblemente, mayor riesgo de cáncer de endometrio si los ciclos son muy irregulares durante años (por falta de ovulación y ausencia de progesterona cíclica)."
    ]
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';

-- Sección 3: Síntomas y señales de alerta
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
  '{
    "paragraphs": [
      "Los síntomas del SOP son muy variados y no todas las mujeres los tienen todos. Los más frecuentes son: ciclos menstruales irregulares (menos de 8 ciclos al año, o ciclos de más de 35 días), ausencia de menstruación (amenorrea), acné persistente especialmente en la mandíbula y el cuello, hirsutismo (vello de patrón masculino en la cara, pecho, abdomen o muslos), caída del cabello con patrón androgénico (alopecia), dificultad para perder peso o aumento de peso sin cambios claros en la dieta, manchas oscuras en los pliegues del cuello o axilas (acantosis nigricans, señal de resistencia a la insulina) y dificultad para quedar embarazada.",
      "El impacto emocional y psicológico del SOP es significativo y frecuentemente subestimado. Las mujeres con SOP tienen mayor prevalencia de ansiedad, depresión e imagen corporal negativa. Las guías internacionales recomiendan explícitamente evaluar la salud mental como parte del manejo del SOP."
    ],
    "alarms": [
      {
        "tone": "red",
        "t": "Sangrado muy abundante o prolongado",
        "d": "Sangrado que dura más de 7 días, que empapa una toalla o tampón cada hora durante varias horas, o sangrado después de meses sin menstruación. Puede indicar engrosamiento del endometrio. Busca atención médica ese día."
      },
      {
        "tone": "red",
        "t": "Dolor pélvico agudo",
        "d": "Dolor intenso y repentino en la pelvis puede indicar torsión ovárica (una emergencia) u otra complicación. Ve a urgencias."
      },
      {
        "tone": "amber",
        "t": "Acantosis nigricans marcada",
        "d": "Manchas oscuras y aterciopeladas en cuello, axilas o ingles son señal de resistencia a la insulina importante. Solicita análisis de glucosa y perfil metabólico si no los tienes recientes."
      },
      {
        "tone": "amber",
        "t": "Ausencia de menstruación por más de 3 meses",
        "d": "La falta de ovulación crónica sin tratamiento puede provocar acumulación del endometrio. Consulta para evaluar si necesitas inducir un sangrado o ajustar el tratamiento."
      },
      {
        "tone": "amber",
        "t": "Síntomas de diabetes",
        "d": "Sed excesiva, orinar frecuentemente, fatiga o visión borrosa en una mujer con SOP requieren análisis de glucosa. El riesgo de diabetes tipo 2 es elevado."
      }
    ]
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';

-- Sección 4: Cómo se diagnostica
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
  '{
    "paragraphs": [
      "El diagnóstico del SOP se basa en los criterios de Rotterdam (2003): se necesitan al menos 2 de los siguientes 3 criterios, después de excluir otras causas de los mismos síntomas. Primero, ciclos irregulares u ovulación ausente. Segundo, hiperandrogenismo clínico (acné, hirsutismo, alopecia) o bioquímico (testosterona libre elevada en sangre). Tercero, ovarios poliquísticos en ecografía (12 o más folículos de 2–9 mm en al menos un ovario, o volumen ovárico mayor de 10 mL).",
      "Los análisis de sangre que suele pedir tu médico incluyen: andrógenos (testosterona total y libre, DHEA-S), LH y FSH (para evaluar la relación LH/FSH, que frecuentemente está elevada en SOP), prolactina (para descartar otras causas), TSH (para descartar problemas de tiroides), glucosa en ayuno, insulina, HbA1c y perfil lipídico. A veces se mide la 17-OH-progesterona para descartar hiperplasia suprarrenal congénita.",
      "Es importante saber que el diagnóstico de SOP en adolescentes requiere más cautela: la irregularidad menstrual es normal en los primeros años tras la menarquia, y la ecografía puede mostrar ovarios multifoliculares en adolescentes sin SOP. Las guías recomiendan esperar al menos 2 años desde la primera menstruación antes de diagnosticar SOP en adolescentes."
    ],
    "callout": {
      "label": "¿Necesito una ecografía para diagnosticar SOP?",
      "body": "No siempre. Si tienes ciclos irregulares y hiperandrogenismo confirmado, el diagnóstico de SOP ya se cumple sin ecografía (según criterios de Rotterdam). La ecografía añade información pero no es obligatoria si los otros dos criterios están presentes. Sin embargo, muchos médicos la solicitan de todos modos para tener una imagen completa de los ovarios."
    }
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';

-- Sección 5: Tratamientos disponibles
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
  '{
    "paragraphs": [
      "El tratamiento del SOP es individualizado y depende de los objetivos de cada mujer: regularizar los ciclos, reducir el acné o el hirsutismo, mejorar la fertilidad, controlar el peso o prevenir complicaciones metabólicas a largo plazo. No existe un único tratamiento que lo resuelva todo.",
      "El cambio de estilo de vida es la intervención de primera línea en todas las mujeres con SOP, independientemente del peso. Incluso una pérdida de peso del 5–10% en mujeres con sobrepeso puede restaurar la ovulación, mejorar los ciclos menstruales, reducir el acné y mejorar la resistencia a la insulina. La actividad física regular tiene beneficios independientes del peso.",
      "Los anticonceptivos orales combinados (AOC) son el tratamiento farmacológico más usado cuando no se busca embarazo. Regulan el ciclo menstrual, reducen los andrógenos y mejoran el acné y el hirsutismo. No tratan la causa del SOP, pero controlan sus efectos y protegen el endometrio. No toda mujer con SOP necesita anticonceptivos; la decisión es personal y debe discutirse con el médico.",
      "La metformina —el mismo medicamento usado en diabetes tipo 2— mejora la sensibilidad a la insulina y puede regularizar los ciclos en algunas mujeres con SOP, especialmente aquellas con resistencia a la insulina documentada. Las guías de la Endocrine Society (2023) la recomiendan como complemento al estilo de vida en mujeres con alteraciones metabólicas.",
      "Para mujeres que desean quedar embarazadas y no ovulan, existen opciones para inducir la ovulación: el letrozol (inhibidor de aromatasa) es actualmente el medicamento de primera línea recomendado por las guías internacionales. El citrato de clomifeno fue el estándar durante décadas y sigue usándose. Si estos no funcionan, se puede avanzar a gonadotropinas (inyecciones hormonales) o técnicas de reproducción asistida como la fecundación in vitro (FIV). El SOP es la causa más frecuente de infertilidad por anovulación y también una de las más tratables.",
      "Para el hirsutismo y el acné, además de los AOC, existen medicamentos antiandrógenos como la espironolactona. Los resultados en el vello son lentos (meses), ya que el ciclo de crecimiento del vello es largo. Tratamientos cosméticos como la depilación láser son complementarios y efectivos."
    ],
    "callout": {
      "label": "SOP y fertilidad",
      "body": "El SOP es la causa más común de infertilidad por falta de ovulación, pero también una de las más tratables. La mayoría de las mujeres con SOP que desean embarazarse logran concebir —con o sin tratamiento médico. Habla con tu ginecólogo o especialista en reproducción sobre el mejor momento y las opciones disponibles para ti."
    }
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';

-- Sección 6: Vivir con la condición
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
  '{
    "paragraphs": [
      "Vivir con SOP puede ser frustrante, especialmente al principio, porque es una condición crónica sin cura definitiva. Pero también es manejable: muchas mujeres con SOP llevan vidas completamente normales, con embarazos exitosos, piel clara, ciclos regulados y buena salud metabólica, gracias a los tratamientos disponibles y a los cambios en el estilo de vida.",
      "La alimentación no tiene un formato único para el SOP, pero algunas estrategias consistentemente ayudan: priorizar alimentos de bajo índice glucémico (que no disparan la insulina bruscamente), aumentar la ingesta de fibra y proteínas, y reducir azúcares simples y harinas refinadas. No existe la 'dieta del SOP', pero una nutricionista con experiencia en resistencia a la insulina puede ayudarte a diseñar un plan personalizado.",
      "El ejercicio es uno de los mejores aliados en el SOP: mejora la sensibilidad a la insulina, ayuda a regularizar los ciclos, reduce el estrés y mejora el estado de ánimo. La combinación de ejercicio aeróbico y de fuerza parece tener los mejores resultados. No necesitas hacer nada extremo: 150 minutos semanales de actividad moderada ya marcan diferencia.",
      "El impacto psicológico del SOP es real: la imagen corporal, el acné, el vello, las dificultades para quedar embarazada y la incertidumbre sobre el cuerpo propio generan ansiedad y afectan la autoestima. Buscar apoyo psicológico —ya sea individual, en grupos de apoyo con otras mujeres con SOP o en comunidades online— es completamente válido y recomendado.",
      "A largo plazo, el seguimiento médico regular es importante para monitorear el riesgo metabólico: glucosa, colesterol, presión arterial y función hepática. El SOP es una condición de por vida, pero su impacto en la salud futura depende en gran medida de cómo se maneja hoy."
    ]
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';

-- Sección 7: Preguntas para tu médico
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
  '{
    "paragraphs": [
      "Lleva estas preguntas a tu próxima consulta con tu ginecólogo, endocrinólogo o médico de cabecera."
    ],
    "questions": [
      "¿Cuál de los criterios de Rotterdam tengo y qué tipo de SOP es el mío?",
      "¿Tengo resistencia a la insulina? ¿Debo tomar metformina?",
      "¿Mis niveles de andrógenos están elevados en sangre y cómo afecta eso a mis síntomas?",
      "¿Necesito anticonceptivos orales para regular mis ciclos o hay otras opciones?",
      "Si quiero quedar embarazada en el próximo año, ¿qué debo hacer ahora para prepararme?",
      "¿Tengo riesgo de diabetes tipo 2 y con qué frecuencia debo revisar mi glucosa?",
      "¿Qué puedo hacer para el hirsutismo y el acné además de los anticonceptivos?",
      "¿Hay cambios de alimentación específicos que recomienden para mi tipo de SOP?",
      "¿Necesito una ecografía de seguimiento y con qué frecuencia?",
      "¿El SOP puede afectar mi corazón o mi salud metabólica a largo plazo y qué hago para prevenirlo?",
      "¿Existe riesgo de cáncer de endometrio con mis ciclos irregulares? ¿Qué debo monitorear?",
      "¿Hay recursos, grupos de apoyo o aplicaciones que recomienden para mujeres con SOP?"
    ]
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';

-- Sección 8: Referencias y fuentes
insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select
  c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
  '{
    "paragraphs": [
      "Teede, H. J., Tay, C. T., Laven, J. J. E., Dokras, A., Moran, L. J., Piltonen, T. T., … Boivin, J. (2023). Recommendations from the 2023 international evidence-based guideline for the assessment and management of polycystic ovary syndrome. Journal of Clinical Endocrinology & Metabolism, 108(10), 2447–2469. https://doi.org/10.1210/clinem/dgad463",
      "Legro, R. S., Arslanian, S. A., Ehrmann, D. A., Hoeger, K. M., Murad, M. H., Pasquali, R., & Welt, C. K. (2013). Diagnosis and treatment of polycystic ovary syndrome: An Endocrine Society clinical practice guideline. Journal of Clinical Endocrinology & Metabolism, 98(12), 4565–4592. https://doi.org/10.1210/jc.2013-2350",
      "Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group. (2004). Revised 2003 consensus on diagnostic criteria and long-term health risks related to polycystic ovary syndrome. Fertility and Sterility, 81(1), 19–25.",
      "Azziz, R., Carmina, E., Chen, Z., Dunaif, A., Laven, J. S. E., Legro, R. S., … Yildiz, B. O. (2016). Polycystic ovary syndrome. Nature Reviews Disease Primers, 2, 16057. https://doi.org/10.1038/nrdp.2016.57",
      "Morin-Papunen, L., Rantala, A. S., Unkila-Kallio, L., Tiitinen, A., Hippeläinen, M., Perheentupa, A., … Tapanainen, J. S. (2012). Metformin improves pregnancy and live-birth rates in women with polycystic ovary syndrome (PCOS): A multicenter, double-blind, placebo-controlled randomized trial. Journal of Clinical Endocrinology & Metabolism, 97(5), 1492–1500.",
      "Thessaloniki ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group. (2008). Consensus on infertility treatment related to polycystic ovary syndrome. Fertility and Sterility, 89(3), 505–522.",
      "Denny, E., & Thornton, J. (2016). Polycystic ovary syndrome and mental health: A qualitative study. Journal of Health Psychology, 21(7), 1539–1549."
    ]
  }'::jsonb
from conditions c where c.slug = 'sindrome-ovario-poliquistico';


-- Condiciones 48-60: Digestivo, Respiratorio, Autoinmune, Oncología
-- Generado para Aliis — plataforma educativa para pacientes

-- ============================================================
-- CONDITIONS
-- ============================================================
-- (sections follow after all condition inserts)

insert into conditions (slug, name, subtitle, summary, specialty, icd10, published) values
('sindrome-intestino-irritable', 'Síndrome de Intestino Irritable', 'Cuando tu intestino reacciona de más al estrés y la comida', 'El SII es un trastorno funcional del intestino que causa dolor abdominal, hinchazón y cambios en el ritmo intestinal sin daño visible en los tejidos. Afecta a 1 de cada 10 personas y tiene tratamiento efectivo.', 'gastroenterología', 'K58', true),
('enfermedad-crohn', 'Enfermedad de Crohn', 'Una inflamación crónica del intestino que se puede controlar', 'La enfermedad de Crohn es una inflamación crónica que puede afectar cualquier parte del tubo digestivo, desde la boca hasta el ano, aunque es más común en el intestino delgado. Con el tratamiento adecuado, la mayoría de las personas logran vivir con buena calidad de vida.', 'gastroenterología', 'K50', true),
('colitis-ulcerosa', 'Colitis Ulcerosa', 'Inflamación del colon que se puede controlar con tratamiento', 'La colitis ulcerosa es una enfermedad inflamatoria crónica que afecta el colon (intestino grueso) y el recto, causando úlceras en su revestimiento. Produce diarrea con sangre, dolor abdominal y urgencia para ir al baño, pero tiene muchas opciones de tratamiento.', 'gastroenterología', 'K51', true),
('erge', 'Enfermedad por Reflujo Gastroesofágico (ERGE)', 'Cuando el ácido del estómago sube y quema el esófago', 'El ERGE ocurre cuando el ácido del estómago sube repetidamente hacia el esófago, causando ardor, regurgitación y malestar. Es muy común y responde bien a cambios en el estilo de vida y medicamentos.', 'gastroenterología', 'K21', true),
('helicobacter-pylori', 'Infección por Helicobacter pylori', 'Una bacteria en el estómago que se elimina con antibióticos', 'El Helicobacter pylori es una bacteria que infecta el revestimiento del estómago y puede causar gastritis, úlceras y, en casos raros, cáncer gástrico. Se diagnostica fácilmente y se erradica con un tratamiento corto de antibióticos.', 'gastroenterología', 'B96.81', true),
('asma', 'Asma', 'Cuando las vías respiratorias se estrechan y dificultan respirar', 'El asma es una enfermedad crónica en la que las vías respiratorias se inflaman y se estrechan, causando episodios de sibilancias, falta de aire, opresión en el pecho y tos. Con el manejo correcto, la mayoría de las personas con asma llevan una vida completamente normal.', 'neumología', 'J45', true),
('epoc', 'EPOC — Enfermedad Pulmonar Obstructiva Crónica', 'Una enfermedad pulmonar progresiva que se puede frenar', 'La EPOC es una enfermedad pulmonar crónica que obstruye el flujo de aire y hace difícil respirar, causada principalmente por el tabaquismo. Aunque el daño pulmonar no se revierte, dejar de fumar y el tratamiento adecuado pueden frenar su avance y mejorar significativamente la calidad de vida.', 'neumología', 'J44', true),
('apnea-del-sueno', 'Apnea del Sueño', 'Cuando la respiración se interrumpe mientras duermes', 'La apnea del sueño es un trastorno en el que la respiración se detiene y reinicia repetidamente durante el sueño, impidiendo el descanso profundo. Causa somnolencia diurna, ronquidos fuertes y puede afectar el corazón si no se trata, pero tiene tratamientos muy eficaces.', 'neumología', 'G47.3', true),
('fibromialgia', 'Fibromialgia', 'Dolor crónico generalizado que sí tiene nombre y tratamiento', 'La fibromialgia es un síndrome de dolor crónico y generalizado acompañado de fatiga, sueño no reparador y sensibilidad aumentada en todo el cuerpo. No es una enfermedad imaginaria: tiene bases neurológicas reales y responde a un enfoque de tratamiento multidisciplinario.', 'reumatología', 'M79.7', true),
('artritis-reumatoide', 'Artritis Reumatoide', 'Cuando el sistema inmune ataca tus articulaciones', 'La artritis reumatoide es una enfermedad autoinmune en la que el sistema inmune ataca el revestimiento de las articulaciones, causando inflamación, dolor y, si no se trata, daño permanente. Los tratamientos modernos permiten controlar la enfermedad y prevenir el daño articular.', 'reumatología', 'M05', true),
('lupus', 'Lupus Eritematoso Sistémico', 'Una enfermedad autoinmune que afecta muchos órganos a la vez', 'El lupus es una enfermedad autoinmune crónica en la que el sistema inmune ataca tejidos propios del cuerpo, pudiendo afectar la piel, las articulaciones, los riñones, el corazón y otros órganos. Con seguimiento médico adecuado, la mayoría de las personas con lupus tienen una vida larga y activa.', 'reumatología', 'M32', true),
('cancer-de-mama', 'Cáncer de Mama', 'Un diagnóstico que hoy tiene más opciones de tratamiento que nunca', 'El cáncer de mama es el tumor maligno más frecuente en mujeres a nivel mundial, pero también uno de los que más ha avanzado en opciones de tratamiento. Detectado a tiempo, la mayoría de los casos tienen muy buen pronóstico y posibilidad de curación.', 'oncología', 'C50', true),
('cancer-de-prostata', 'Cáncer de Próstata', 'El cáncer más común en hombres, con muchas opciones de manejo', 'El cáncer de próstata es el tumor maligno más frecuente en hombres. Muchos casos crecen lentamente y pueden vigilarse sin tratamiento inmediato, mientras que otros requieren intervención. Entender tu diagnóstico es el primer paso para tomar decisiones informadas.', 'oncología', 'C61', true);

-- ============================================================
-- SECTIONS: sindrome-intestino-irritable (48)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "El Síndrome de Intestino Irritable (SII) es uno de los trastornos digestivos más comunes del mundo: afecta aproximadamente al 10-15% de la población. Imagina que tu intestino tiene un sistema nervioso propio muy sensible que, en el SII, reacciona de forma exagerada a estímulos normales como el estrés, ciertos alimentos o incluso el propio movimiento intestinal.",
    "A diferencia de otras enfermedades digestivas, el SII no causa daño visible en el intestino. Si te hicieran una colonoscopía, el tejido se vería completamente normal. Por eso se llama trastorno funcional: el problema no está en la estructura, sino en cómo funciona la comunicación entre el cerebro y el intestino (lo que los médicos llaman el eje intestino-cerebro).",
    "El SII se clasifica en tres tipos según el patrón de tránsito intestinal predominante: SII con estreñimiento (SII-E), SII con diarrea (SII-D) y SII mixto (SII-M), donde alternan los dos. Esta clasificación ayuda al médico a elegir el mejor tratamiento para ti.",
    "No existe una causa única para el SII. Los investigadores han identificado varios factores que contribuyen: hipersensibilidad visceral (el intestino percibe como dolor sensaciones que normalmente no duelen), alteraciones en la motilidad intestinal, cambios en la microbiota intestinal y una fuerte influencia del estado emocional.",
    "El SII no es una enfermedad peligrosa ni aumenta el riesgo de cáncer de colon. Sin embargo, puede afectar significativamente la calidad de vida. La buena noticia es que con el enfoque correcto, la gran mayoría de las personas logran controlar sus síntomas y vivir con plena normalidad."
  ],
  "callout": {"label": "Dato clave", "body": "El SII no daña el intestino ni aumenta el riesgo de cáncer. Es un trastorno funcional: el problema está en cómo el intestino y el cerebro se comunican, no en el tejido en sí."}
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "El SII no tiene una causa única. Es el resultado de varios factores que se combinan de manera diferente en cada persona. Los investigadores han identificado que hay una comunicación alterada entre el cerebro y el intestino, razón por la cual el SII se considera un trastorno del eje intestino-cerebro.",
    "La hipersensibilidad visceral es uno de los mecanismos principales: las terminaciones nerviosas del intestino en el SII están \"afinadas de más\" y perciben como dolorosas sensaciones que en otras personas pasarían desapercibidas. Esto explica por qué el estrés emocional, que activa el sistema nervioso, puede desencadenar síntomas digestivos intensos.",
    "Algunos factores de riesgo conocidos incluyen: antecedentes de infección gastrointestinal grave (el llamado SII post-infeccioso aparece en hasta el 10% de personas tras una gastroenteritis), uso frecuente de antibióticos que alteran la microbiota, dieta alta en alimentos ultraprocesados, ansiedad o depresión crónica, y antecedentes familiares de SII.",
    "Los alimentos no causan el SII, pero sí pueden desencadenar síntomas en personas que ya lo tienen. Los más frecuentemente reportados son los FODMAPs (carbohidratos fermentables presentes en trigo, lácteos, legumbres, ciertos vegetales y frutas), el café, el alcohol y las comidas grasas.",
    "Ser mujer duplica aproximadamente el riesgo de desarrollar SII. Esto se relaciona con diferencias hormonales: muchas mujeres notan que sus síntomas empeoran durante la menstruación. El SII puede aparecer a cualquier edad, pero es más frecuente antes de los 50 años."
  ]
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El síntoma central del SII es el dolor abdominal que mejora al defecar y viene acompañado de cambios en la frecuencia o consistencia de las heces. Este dolor suele aparecer en la parte baja del abdomen, como retortijones o calambres.",
    "Otros síntomas muy frecuentes son: distensión abdominal (sentir el vientre inflado o hinchado, especialmente en las tardes), gases excesivos, sensación de evacuación incompleta, urgencia para ir al baño y alternancia entre diarrea y estreñimiento.",
    "Los síntomas del SII tienen un patrón típico: empeoran con el estrés, mejoran temporalmente tras defecar, suelen ser más intensos después de comer y raramente despiertan al paciente de noche (lo cual ayuda al médico a diferenciarlo de otras enfermedades)."
  ],
  "alarms": [
    {"tone": "red", "t": "Sangre en las heces", "d": "Si ves sangre roja o heces de color negro alquitrán, acude a urgencias. El SII NO produce sangrado."},
    {"tone": "red", "t": "Pérdida de peso sin explicación", "d": "Perder más de 4-5 kg sin haber cambiado tu dieta o actividad física requiere evaluación urgente."},
    {"tone": "red", "t": "Fiebre junto con dolor abdominal intenso", "d": "La combinación de fiebre y dolor agudo puede indicar una infección o inflamación que necesita atención inmediata."},
    {"tone": "amber", "t": "Síntomas que te despiertan por la noche", "d": "El SII típicamente no interrumpe el sueño. Si el dolor o la diarrea te despiertan, consulta a tu médico."},
    {"tone": "amber", "t": "Cambio repentino del patrón intestinal en mayores de 50 años", "d": "Un cambio brusco en tus hábitos intestinales a partir de los 50 años debe evaluarse para descartar otras causas."},
    {"tone": "amber", "t": "Anemia o cansancio extremo", "d": "Si te sientes muy fatigado o te dicen que tienes la sangre baja, coméntaselo a tu médico en la próxima visita."}
  ]
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "No existe un análisis de sangre ni una prueba única que diagnostique el SII. El diagnóstico es clínico, es decir, tu médico lo establece basándose en tus síntomas, su duración y su patrón. Actualmente se utilizan los Criterios de Roma IV (2016), que son los estándares internacionales para diagnosticar trastornos funcionales digestivos.",
    "Los Criterios de Roma IV para el SII requieren que hayas tenido dolor abdominal al menos 1 día por semana durante los últimos 3 meses, asociado a dos o más de los siguientes: mejoría con la defecación, cambio en la frecuencia de las heces o cambio en la consistencia de las heces.",
    "Tu médico probablemente pedirá algunos estudios para descartar otras enfermedades con síntomas similares: análisis de sangre (hemograma, marcadores de inflamación, función tiroidea), análisis de heces para descartar infecciones o parásitos, y serología para celiaquía. En personas mayores de 50 años o con señales de alerta, se puede indicar una colonoscopía.",
    "El diagnóstico de SII generalmente no requiere colonoscopía en personas jóvenes sin señales de alarma. Si tu médico considera que los síntomas son claros y no hay banderas rojas, puede establecer el diagnóstico sin necesidad de procedimientos invasivos."
  ],
  "callout": {"label": "Los Criterios de Roma IV", "body": "El estándar internacional actual para diagnosticar el SII: dolor abdominal recurrente al menos 1 día por semana en los últimos 3 meses, asociado a cambios en la defecación. No se necesita colonoscopía en la mayoría de los casos."},
  "timeline": [
    {"w": "Consulta inicial", "t": "El médico escucha tu historia, hace examen físico y clasifica el tipo de SII (con diarrea, con estreñimiento o mixto)."},
    {"w": "Estudios básicos", "t": "Análisis de sangre, heces y serología para celiaquía para descartar otras causas (1-2 semanas)."},
    {"w": "Diagnóstico y plan", "t": "Si no hay banderas rojas, el médico confirma el SII y propone un plan de manejo personalizado."},
    {"w": "Seguimiento", "t": "Revisión a las 4-8 semanas para ajustar el tratamiento según la respuesta."}
  ]
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento del SII es personalizado: no existe una pastilla única que funcione para todos. El enfoque más efectivo combina cambios en la alimentación, manejo del estrés y, cuando es necesario, medicamentos específicos para el tipo de SII que tengas.",
    "La dieta baja en FODMAPs es actualmente la estrategia dietética con mayor evidencia científica para el SII. Los FODMAPs son carbohidratos fermentables (presentes en trigo, lácteos, legumbres, manzana, cebolla, ajo, entre otros) que el intestino sensible fermenta produciendo gas y síntomas. Esta dieta no es para siempre: se hace en fases bajo supervisión de un nutricionista para identificar cuáles FODMAPs te afectan específicamente.",
    "Para el SII con diarrea, los médicos pueden recomendar antidiarreicos (como loperamida), espasmolíticos (que reducen los calambres), o en casos seleccionados, antibióticos no absorbibles como rifaximina, que mejoran la microbiota intestinal. Para el SII con estreñimiento, los laxantes osmóticos y los secretagogos (como linaclotida) son opciones efectivas.",
    "Los antidepresivos en dosis bajas, especialmente los tricíclicos y los inhibidores de recaptación de serotonina, se usan en el SII no por depresión sino porque modulan la comunicación entre el cerebro y el intestino. Son particularmente útiles cuando el dolor abdominal es el síntoma predominante.",
    "La psicoterapia, especialmente la terapia cognitivo-conductual (TCC) y la hipnoterapia dirigida al intestino, tiene evidencia científica sólida en el SII. Esto no significa que los síntomas sean inventados, sino que el cerebro y el intestino están tan conectados que trabajar en uno mejora el otro.",
    "Los probióticos pueden ser útiles para algunos pacientes, aunque la evidencia varía según la cepa. Las cepas con más evidencia en SII son Bifidobacterium infantis y Lactobacillus rhamnosus GG. Consulta a tu médico antes de iniciar cualquier probiótico."
  ],
  "callout": {"label": "La dieta baja en FODMAPs", "body": "Es la estrategia dietética con mayor evidencia en el SII. El 70% de los pacientes reporta mejoría significativa. Debe hacerse en fases y con guía de un nutricionista para identificar tus desencadenantes específicos."}
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Vivir con SII significa aprender a conocer tu propio intestino. Con el tiempo, la mayoría de las personas identifican sus desencadenantes personales: qué alimentos, situaciones de estrés o cambios de rutina provocan sus síntomas. Un diario de síntomas y alimentación durante 2-4 semanas puede ser una herramienta muy valiosa.",
    "El ejercicio regular es uno de los hábitos con mejor evidencia para mejorar el SII: mejora la motilidad intestinal, reduce el estrés y tiene efecto antiinflamatorio. No hace falta ser deportista; 30 minutos de caminata la mayoría de los días ya marca una diferencia.",
    "El manejo del estrés no es opcional en el SII, es parte central del tratamiento. Técnicas como la respiración diafragmática, la meditación mindfulness o el yoga han demostrado reducir la frecuencia e intensidad de los síntomas. Aplicaciones como Headspace o Calm pueden ser un buen punto de partida.",
    "En el trabajo y la vida social, puede ser útil identificar dónde están los baños en lugares nuevos (algo que muchas personas con SII hacen instintivamente) y, si los síntomas son intensos, hablar con tu médico sobre estrategias para manejar situaciones sociales específicas.",
    "Recuerda que el SII puede tener períodos de mejoría y recaídas. Esto es normal y no significa que el tratamiento falló. Los cambios de temporada, el estrés laboral o viajes pueden provocar brotes. Tener un plan acordado con tu médico para esos momentos reduce la ansiedad y acelera la recuperación."
  ]
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta para aprovechar mejor el tiempo con tu médico."],
  "questions": [
    "¿Qué tipo de SII tengo: con diarrea, con estreñimiento o mixto? ¿Eso cambia el tratamiento?",
    "¿Debo hacer algún estudio adicional para descartar otras enfermedades, como celiaquía o enfermedad inflamatoria intestinal?",
    "¿Me recomiendas probar la dieta baja en FODMAPs? ¿Debo hacerlo con un nutricionista?",
    "¿Qué medicamento me recomiendas primero y qué resultados debo esperar en cuánto tiempo?",
    "¿Los síntomas que tengo son típicos del SII o hay algo que te preocupe?",
    "¿Cuándo debo volver si el tratamiento no funciona o si los síntomas empeoran?",
    "¿El estrés que tengo en el trabajo puede estar causando o empeorando mis síntomas?",
    "¿Me recomendarías ver a un psicólogo o hacer terapia cognitivo-conductual?",
    "¿Qué probióticos, si alguno, crees que me podrían ayudar?",
    "¿El SII puede convertirse en una enfermedad más grave con el tiempo, como colitis o cáncer?",
    "¿Hay grupos de apoyo o recursos que me recomiendas para aprender más sobre el SII?",
    "¿Qué señales deben hacer que venga a urgencias en lugar de esperar a mi cita?"
  ]
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Lacy, B. E., Mearin, F., Chang, L., Chey, W. D., Lembo, A. J., Simren, M., & Spiller, R. (2016). Bowel disorders. Gastroenterology, 150(6), 1393-1407. https://doi.org/10.1053/j.gastro.2016.02.031",
    "Ford, A. C., Sperber, A. D., Corsetti, M., & Camilleri, M. (2020). Irritable bowel syndrome. The Lancet, 396(10263), 1675-1688. https://doi.org/10.1016/S0140-6736(20)31548-8",
    "Moayyedi, P., Mearin, F., Azpiroz, F., Andresen, V., Barbara, G., Corsetti, M., ... & Spiller, R. (2017). Irritable bowel syndrome diagnosis and management: A simplified algorithm for clinical practice. United European Gastroenterology Journal, 5(6), 773-788.",
    "Gibson, P. R., & Shepherd, S. J. (2010). Evidence-based dietary management of functional gastrointestinal symptoms: The FODMAP approach. Journal of Gastroenterology and Hepatology, 25(2), 252-258.",
    "Patel, N., & Shackelford, K. (2023). Irritable Bowel Syndrome. StatPearls Publishing. https://www.ncbi.nlm.nih.gov/books/NBK534810/",
    "Mearin, F., Lacy, B. E., Chang, L., Chey, W. D., Lembo, A. J., Simren, M., & Spiller, R. (2016). Bowel Disorders. Gastroenterology. Criterios de Roma IV — estándar diagnóstico internacional.",
    "Asociación Española de Gastroenterología (AEG). (2021). Guía de práctica clínica sobre el síndrome del intestino irritable. Gastroenterología y Hepatología, 44(9), 650-657."
  ]
}'::jsonb
from conditions c where c.slug = 'sindrome-intestino-irritable';

-- ============================================================
-- SECTIONS: enfermedad-crohn (49)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "La enfermedad de Crohn es una enfermedad inflamatoria intestinal (EII) crónica que puede afectar cualquier parte del tracto digestivo, desde la boca hasta el ano. A diferencia de la colitis ulcerosa, la inflamación en el Crohn puede ser parcheada (deja zonas sanas entre zonas afectadas) y afecta todas las capas de la pared intestinal, no solo el revestimiento interior.",
    "La zona más frecuentemente afectada es el íleon terminal (el último tramo del intestino delgado) y el inicio del intestino grueso (colon ascendente). Sin embargo, en algunos pacientes puede afectar el esófago, el estómago, el intestino delgado proximal o el ano.",
    "Se estima que afecta a entre 150 y 300 personas por cada 100.000 habitantes en países occidentales. Suele diagnosticarse entre los 15 y los 35 años, aunque puede aparecer a cualquier edad. Es igualmente frecuente en hombres y mujeres.",
    "La inflamación transmural (que atraviesa todas las capas del intestino) es característica del Crohn y explica sus complicaciones más serias: la formación de fístulas (canales anormales entre el intestino y otros órganos o la piel) y estenosis (estrechamiento del intestino que dificulta el paso del contenido).",
    "Con el tratamiento adecuado, la mayoría de las personas con enfermedad de Crohn logran alcanzar períodos prolongados de remisión (sin síntomas activos). El objetivo del tratamiento moderno no es solo controlar los síntomas, sino también prevenir el daño intestinal a largo plazo."
  ],
  "callout": {"label": "Crohn vs. Colitis Ulcerosa", "body": "Ambas son enfermedades inflamatorias intestinales, pero el Crohn puede afectar cualquier tramo del tubo digestivo y todas las capas de la pared, mientras que la colitis ulcerosa solo afecta el colon y su capa interna."}
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "La causa exacta del Crohn no se conoce completamente, pero la evidencia científica apunta a una combinación de factores: una respuesta inmune anormal, predisposición genética y factores ambientales, incluyendo cambios en la microbiota intestinal.",
    "En el Crohn, el sistema inmune responde de forma exagerada a bacterias normales del intestino, provocando una inflamación crónica. Se han identificado más de 200 variantes genéticas asociadas a mayor riesgo, siendo el gen NOD2/CARD15 uno de los más estudiados.",
    "Los factores de riesgo incluyen: antecedentes familiares de EII (tener un familiar de primer grado multiplica por 3-20 el riesgo), tabaquismo (duplica el riesgo de Crohn y empeora su curso, a diferencia de la colitis ulcerosa), vivir en países industrializados o en zonas urbanas, y el uso de antibióticos en la infancia.",
    "La dieta occidental (alta en grasas saturadas, azúcares y ultraprocesados, baja en fibra) se asocia con mayor incidencia de EII, probablemente por su efecto en la microbiota intestinal. Esto no significa que la dieta cause el Crohn, sino que puede influir en su desarrollo en personas con predisposición genética.",
    "El apendicectomía previa, contrariamente a la colitis ulcerosa, no parece proteger contra el Crohn. La edad de inicio más frecuente es entre los 15 y 35 años, aunque existe un segundo pico entre los 60 y 70 años."
  ]
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "Los síntomas del Crohn varían mucho según la localización y extensión de la inflamación. Los más frecuentes son dolor abdominal (especialmente en el cuadrante inferior derecho del abdomen, donde suele estar el íleon terminal), diarrea crónica (que puede contener sangre si hay afectación del colon), fatiga intensa y pérdida de peso.",
    "En los períodos de actividad (brotes), los síntomas se intensifican. En remisión, el paciente puede sentirse completamente bien. Esta alternancia entre brotes y remisiones es característica de la enfermedad de Crohn.",
    "El Crohn también puede causar manifestaciones fuera del intestino: dolor articular (artritis), lesiones en la piel (eritema nudoso, pioderma gangrenoso), inflamación ocular (uveítis) y enfermedad hepática (colangitis esclerosante primaria)."
  ],
  "alarms": [
    {"tone": "red", "t": "Dolor abdominal intenso y súbito", "d": "Puede indicar una obstrucción intestinal o una perforación. Acude a urgencias de inmediato."},
    {"tone": "red", "t": "Fiebre alta con dolor abdominal", "d": "Puede señalar un absceso intraabdominal o una complicación infecciosa grave que requiere evaluación urgente."},
    {"tone": "red", "t": "Hemorragia digestiva importante", "d": "Sangrado abundante por el recto o vómito con sangre requieren atención de urgencias."},
    {"tone": "amber", "t": "Pérdida de peso no intencionada", "d": "Perder más de 5 kg sin cambiar la dieta puede indicar malabsorción o actividad de la enfermedad. Consulta pronto."},
    {"tone": "amber", "t": "Fístula o supuración perianal", "d": "Secreción o dolor persistente alrededor del ano puede ser una fístula. Requiere evaluación especializada aunque no sea urgente."},
    {"tone": "amber", "t": "Síntomas oculares o articulares nuevos", "d": "Ojo rojo, visión borrosa o articulaciones inflamadas en un paciente con Crohn conocido deben evaluarse en consulta."}
  ]
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de la enfermedad de Crohn requiere combinar clínica, laboratorio, imágenes y endoscopía. No existe una sola prueba diagnóstica. El proceso puede llevar semanas o meses, y es normal que el médico solicite varias pruebas.",
    "La colonoscopía con biopsia es el procedimiento más importante para confirmar el diagnóstico. Permite ver directamente la mucosa intestinal, tomar biopsias y valorar la extensión de la enfermedad. En el Crohn se observa un patrón parcheado con úlceras profundas y empedrado mucoso.",
    "Las pruebas de imagen como la enteroresonancia magnética (entero-RM) o la tomografía computarizada son esenciales para evaluar el intestino delgado, que no es visible completamente con la colonoscopía, y para detectar complicaciones como fístulas o abscesos.",
    "En sangre, el médico busca marcadores de inflamación elevados (PCR, VSG, calprotectina fecal). La calprotectina fecal es especialmente útil para distinguir el Crohn del SII y para monitorizar la actividad inflamatoria sin necesidad de repetir la colonoscopía."
  ],
  "callout": {"label": "Calprotectina fecal", "body": "Es una proteína que se mide en las heces y refleja la inflamación intestinal. Si está elevada en alguien con síntomas, sugiere inflamación real (como Crohn) y no un trastorno funcional como el SII. Es útil también para monitorizar la respuesta al tratamiento."},
  "timeline": [
    {"w": "Consulta y laboratorio", "t": "Análisis de sangre, calprotectina fecal y coprocultivo para descartar infección."},
    {"w": "Endoscopía + biopsia", "t": "Colonoscopía (y posiblemente gastroscopía) con biopsias para confirmación histológica."},
    {"w": "Imagen", "t": "Entero-RM para evaluar intestino delgado y detectar complicaciones."},
    {"w": "Clasificación", "t": "Se determina la localización, extensión y patrón (inflamatorio, estenosante o fistulizante) para elegir el tratamiento."}
  ]
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento del Crohn ha evolucionado enormemente en los últimos 20 años. El objetivo actual no es solo controlar los síntomas sino lograr la curación de la mucosa intestinal, es decir, que la inflamación desaparezca también en el tejido, no solo a nivel de cómo te sientes.",
    "Los corticoides (como prednisona o budesonida) se usan para controlar los brotes de forma rápida, pero no se recomiendan como tratamiento de mantenimiento porque tienen muchos efectos secundarios a largo plazo. Son un rescate, no una solución permanente.",
    "Los inmunomoduladores como azatioprina y mercaptopurina reducen la respuesta inmune exagerada y ayudan a mantener la remisión. Tardan varios meses en hacer efecto y requieren controles de laboratorio periódicos.",
    "Los biológicos son el avance más importante de los últimos años. Los anti-TNF (infliximab, adalimumab, certolizumab) bloquean una proteína clave de la inflamación y son muy efectivos tanto en brotes como en mantenimiento. Medicamentos más nuevos como vedolizumab (anti-integrina) y ustekinumab (anti-IL12/23) ofrecen opciones adicionales con diferentes perfiles de seguridad.",
    "La cirugía puede ser necesaria en el Crohn para tratar complicaciones (obstrucción, absceso, fístula) o cuando el tratamiento médico no controla la enfermedad. A diferencia de la colitis ulcerosa, la cirugía en el Crohn no es curativa, pero puede mejorar significativamente la calidad de vida.",
    "Dejar de fumar es la medida más importante que puede tomar un paciente con Crohn que fuma: el tabaquismo activo duplica el riesgo de brotes, aumenta la necesidad de cirugía y reduce la respuesta a los biológicos."
  ],
  "callout": {"label": "Biológicos en Crohn", "body": "Los medicamentos biológicos (como infliximab o adalimumab) han transformado el pronóstico del Crohn moderado-grave. Se administran por infusión o inyección y permiten mantener la remisión a largo plazo en muchos pacientes."}
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Vivir con enfermedad de Crohn es perfectamente posible con una buena calidad de vida. La clave está en el seguimiento médico regular, conocer tu enfermedad y actuar pronto ante señales de brote.",
    "La dieta en el Crohn no sigue un patrón único para todos. En los brotes, las dietas bajas en fibra (residuo) pueden aliviar síntomas. En remisión, una dieta variada y equilibrada es la mejor opción. La dieta mediterránea tiene evidencia creciente de beneficio en EII. Algunos pacientes se benefician de identificar sus desencadenantes alimentarios individuales.",
    "La deficiencia de vitamina B12 (por afectación del íleon terminal), hierro, vitamina D y ácido fólico son frecuentes en el Crohn. Tu médico probablemente monitorizará estos valores y puede recomendar suplementación.",
    "Las vacunas son especialmente importantes en pacientes con Crohn que reciben tratamiento inmunosupresor o biológico. Consulta con tu médico qué vacunas necesitas y cuáles debes evitar (las vacunas de virus vivos están contraindicadas bajo ciertos tratamientos).",
    "El impacto emocional del Crohn es real y relevante. La ansiedad y la depresión son más frecuentes en personas con EII que en la población general. Buscar apoyo psicológico y conectar con grupos de pacientes (como la ACCU en España o la CCFA en Estados Unidos) puede marcar una gran diferencia."
  ]
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu gastroenterólogo."],
  "questions": [
    "¿Qué parte de mi intestino está afectada y cuál es el patrón de mi Crohn (inflamatorio, estenosante o fistulizante)?",
    "¿Cuál es el objetivo del tratamiento que me propones: controlar síntomas o también curar la mucosa intestinal?",
    "¿Qué estudios necesito para monitorizar mi enfermedad y con qué frecuencia?",
    "¿Cuándo debo considerar que estoy teniendo un brote y qué debo hacer?",
    "¿Qué medicamentos puedo tomar si tengo dolor durante un brote sin que interfieran con el Crohn?",
    "¿Debería considerar un biológico? ¿Cuáles son las ventajas y los riesgos?",
    "¿Qué vacunas necesito recibir o actualizar con el tratamiento que tomaré?",
    "¿Hay alguna restricción alimentaria que deba seguir en remisión?",
    "¿Debo preocuparme por el riesgo de cáncer colorrectal y con qué frecuencia necesito colonoscopía de vigilancia?",
    "Si fumo, ¿dejar el tabaco mejoraría significativamente mi Crohn?",
    "¿Existen ensayos clínicos o tratamientos nuevos para los que podría ser candidato?",
    "¿Qué señales me deben llevar a urgencias directamente?"
  ]
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Torres, J., Mehandru, S., Colombel, J. F., & Peyrin-Biroulet, L. (2017). Crohn''s disease. The Lancet, 389(10080), 1741-1755. https://doi.org/10.1016/S0140-6736(16)31711-1",
    "Gomollón, F., Dignass, A., Annese, V., Tilg, H., Van Assche, G., Lindsay, J. O., ... & ECCO. (2017). 3rd European evidence-based consensus on the diagnosis and management of Crohn''s disease 2016. Journal of Crohn''s and Colitis, 11(1), 3-25.",
    "Feuerstein, J. D., Ho, E. Y., Shmidt, E., Singh, H., Falck-Ytter, Y., & Sultan, S. (2021). AGA Clinical Practice Guidelines on the medical management of moderate to severely active luminal and fistulizing Crohn''s disease. Gastroenterology, 160(7), 2496-2508.",
    "Neurath, M. F. (2017). Current and emerging therapeutic targets for IBD. Nature Reviews Gastroenterology & Hepatology, 14(5), 269-278.",
    "Kaplan, G. G. (2015). The global burden of IBD: from 2015 to 2025. Nature Reviews Gastroenterology & Hepatology, 12(12), 720-727.",
    "Rubin, D. T., Ananthakrishnan, A. N., Siegel, C. A., Sauer, B. G., & Long, M. D. (2019). ACG Clinical Guideline: Ulcerative Colitis in Adults. American Journal of Gastroenterology, 114(3), 384-413."
  ]
}'::jsonb
from conditions c where c.slug = 'enfermedad-crohn';

-- ============================================================
-- SECTIONS: colitis-ulcerosa (50)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "La colitis ulcerosa (CU) es una enfermedad inflamatoria intestinal (EII) crónica que afecta exclusivamente el colon (intestino grueso) y el recto. A diferencia de la enfermedad de Crohn, la inflamación en la CU es continua (sin zonas sanas intercaladas), afecta solo la capa más interna del colon (mucosa) y siempre incluye el recto.",
    "La inflamación provoca úlceras en el revestimiento del colon que sangran y producen moco. Por eso el síntoma más característico de la CU es la diarrea con sangre: el cuerpo intenta expulsar un revestimiento que está inflamado y ulcerado.",
    "La CU se clasifica según su extensión: proctitis (solo el recto), colitis izquierda (hasta el ángulo esplénico) o pancolitis (todo el colon). Esta clasificación es importante porque determina el tratamiento.",
    "Afecta a entre 100 y 200 personas por cada 100.000 habitantes en países occidentales, con una incidencia similar en hombres y mujeres. El diagnóstico suele hacerse entre los 15 y 30 años, aunque puede aparecer a cualquier edad.",
    "La CU tiene un curso crónico con alternancia de brotes y remisiones. El objetivo del tratamiento es mantener la remisión el mayor tiempo posible y prevenir complicaciones. En casos seleccionados de enfermedad grave o refractaria, la cirugía (colectomía) puede ser curativa."
  ],
  "callout": {"label": "¿La cirugía cura la colitis ulcerosa?", "body": "Sí. A diferencia del Crohn, extirpar el colon (colectomía) cura la colitis ulcerosa porque la enfermedad está limitada a ese órgano. Esta cirugía solo se considera cuando los medicamentos no controlan la enfermedad o ante complicaciones graves."}
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "Como en el Crohn, la causa de la colitis ulcerosa involucra una respuesta inmune anormal contra las bacterias del colon en personas con predisposición genética, desencadenada por factores ambientales.",
    "Los antecedentes familiares son el factor de riesgo más importante: tener un familiar de primer grado con CU aumenta el riesgo entre 4 y 10 veces. Se han identificado más de 160 regiones genéticas asociadas a la EII.",
    "Curiosamente, el tabaquismo tiene un efecto opuesto en la CU que en el Crohn: fumar parece ser protector contra la CU, mientras que dejar de fumar puede desencadenar el primer brote. Esto no significa que se deba fumar, ya que los riesgos del tabaco superan con creces cualquier beneficio potencial.",
    "La apendicectomía antes de los 20 años parece proteger contra la colitis ulcerosa. Los mecanismos no están completamente claros, pero se relacionan con el papel del apéndice en la regulación inmune intestinal.",
    "El uso de antiinflamatorios no esteroideos (ibuprofeno, naproxeno) puede desencadenar brotes en pacientes con CU ya diagnosticada. Si necesitas analgésicos, el paracetamol es una alternativa más segura para estos pacientes."
  ]
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El síntoma más característico de la colitis ulcerosa es la diarrea con sangre y moco, acompañada de urgencia para ir al baño y, en ocasiones, sensación de que no se termina de evacuar. La frecuencia puede variar de 2-3 veces al día en brotes leves hasta más de 10 veces en brotes graves.",
    "El dolor abdominal, cuando está presente, suele ser en forma de cólico en el lado izquierdo del abdomen (donde se ubica el colon descendente y el sigmoides), y típicamente mejora después de defecar.",
    "Como en el Crohn, la CU puede causar manifestaciones extraintestinales: artritis, lesiones en la piel, inflamación ocular y, menos frecuentemente, afectación hepática (colangitis esclerosante primaria)."
  ],
  "alarms": [
    {"tone": "red", "t": "Más de 6 deposiciones con sangre al día con fiebre", "d": "Criterio de brote grave (Criterios de Truelove-Witts). Requiere hospitalización urgente."},
    {"tone": "red", "t": "Dolor abdominal intenso y vientre muy distendido", "d": "Puede indicar megacolon tóxico, una complicación grave y potencialmente mortal. Llama a urgencias."},
    {"tone": "red", "t": "Pulso rápido y sensación de desmayo", "d": "Puede indicar sangrado significativo o sepsis. Acude a urgencias de inmediato."},
    {"tone": "amber", "t": "Aumento de la frecuencia de deposiciones respecto a tu basal", "d": "Si tu número de deposiciones diarias aumenta de forma mantenida, es señal de brote. Contacta con tu médico."},
    {"tone": "amber", "t": "Fiebre baja persistente", "d": "Fiebre leve mantenida durante un brote puede indicar sobreinfección o actividad severa. Consulta."},
    {"tone": "amber", "t": "Ojo rojo o visión borrosa", "d": "La epiescleritis y uveítis son manifestaciones extraintestinales que deben tratarse pronto para evitar daño ocular."}
  ]
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de colitis ulcerosa se confirma con colonoscopía y biopsia. La endoscopía permite ver el patrón continuo de inflamación que comienza en el recto y se extiende de forma proximal, y las biopsias confirman el diagnóstico histológico.",
    "Los análisis de sangre muestran marcadores de inflamación elevados (PCR, VSG, plaquetas) y, en brotes graves, anemia por el sangrado. La calprotectina fecal es una herramienta útil para monitorizar la actividad inflamatoria entre colonoscopías.",
    "En brotes graves que requieren hospitalización, el médico puede realizar una sigmoidoscopía flexible (en lugar de una colonoscopía completa) para evitar el riesgo de perforación con el intestino muy inflamado.",
    "El diagnóstico diferencial más importante es con la colitis infecciosa (causada por bacterias como Clostridioides difficile, Campylobacter o Salmonella), que puede tener un aspecto endoscópico similar. Por eso siempre se piden cultivos de heces antes de iniciar el tratamiento."
  ],
  "callout": {"label": "Colonoscopía de vigilancia", "body": "Los pacientes con colitis ulcerosa de larga evolución (especialmente pancolitis de más de 8 años) tienen mayor riesgo de cáncer colorrectal. Por eso se recomienda colonoscopía de vigilancia cada 1-3 años según la extensión y duración de la enfermedad."}
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento de la colitis ulcerosa depende de la extensión de la enfermedad y la gravedad del brote. El esquema general incluye: inducir la remisión durante el brote y luego mantenerla para prevenir recaídas.",
    "Los aminosalicilatos (mesalazina o 5-ASA) son la primera línea de tratamiento para la CU leve-moderada. Se pueden administrar por vía oral o rectal (supositorios o enemas), y esta segunda vía es especialmente eficaz cuando la afectación es distal (recto y colon izquierdo). Muchos pacientes mantienen la remisión solo con este medicamento.",
    "Los corticoides (prednisona, budesonida) se usan para inducir la remisión en brotes moderados-graves, pero no se usan para mantenerla a largo plazo por sus efectos secundarios. Son muy efectivos a corto plazo.",
    "Los inmunomoduladores (azatioprina, 6-mercaptopurina) son útiles para mantener la remisión en pacientes que no responden bien a la mesalazina. Tardan 3-6 meses en hacer efecto completo.",
    "Los biológicos anti-TNF (infliximab, adalimumab, golimumab) y los anti-integrinas (vedolizumab) están indicados en la CU moderada-grave que no responde a otros tratamientos. Los inhibidores de JAK (tofacitinib, upadacitinib) son una opción oral más reciente con buena eficacia.",
    "La cirugía (colectomía con reservorio ileoanal, conocido como pouch) está indicada en CU grave refractaria, displasia de alto grado o cáncer colorrectal. Aunque es una cirugía mayor, permite prescindir del estoma permanente en la mayoría de los casos y tiene un buen resultado funcional."
  ],
  "callout": {"label": "Mesalazina: el pilar del tratamiento", "body": "La mesalazina (5-ASA) es el tratamiento de base para la mayoría de pacientes con CU leve-moderada. Es segura a largo plazo y también tiene un efecto protector contra el cáncer colorrectal en la CU. No la dejes de tomar en remisión sin consultar a tu médico."}
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "La colitis ulcerosa es una enfermedad crónica, pero vivir bien con ella es completamente posible. La clave es el cumplimiento del tratamiento de mantenimiento incluso cuando estás en remisión (sin síntomas), porque dejar la medicación es la principal causa de recaída.",
    "No existe una dieta específica para la CU en remisión. Una dieta variada y equilibrada es la recomendación general. Durante los brotes, los alimentos bajos en fibra pueden ser más tolerados. Evita los AINEs (ibuprofeno, naproxeno) para el dolor, ya que pueden desencadenar brotes; el paracetamol es una alternativa más segura.",
    "El ejercicio regular mejora la calidad de vida y puede ayudar a mantener la remisión. No hay restricciones para hacer deporte en remisión. Durante los brotes, escucha a tu cuerpo y no te fuerces.",
    "La colonoscopía de vigilancia es una parte importante del seguimiento a largo plazo. La CU de larga evolución (especialmente la pancolitis) aumenta el riesgo de cáncer colorrectal, y la vigilancia endoscópica regular permite detectar cambios precozmente.",
    "El impacto psicológico de la CU es importante. La incertidumbre sobre cuándo llegará el próximo brote, la necesidad de saber siempre dónde hay un baño, y los períodos de enfermedad activa pueden generar ansiedad. Los grupos de pacientes (como la ACCU en España o la CCFA en EE.UU.) ofrecen apoyo valioso."
  ]
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu gastroenterólogo."],
  "questions": [
    "¿Qué extensión tiene mi colitis: proctitis, colitis izquierda o pancolitis? ¿Cambia eso mi tratamiento?",
    "¿Debo tomar la mesalazina también por vía rectal además de por boca?",
    "¿Puedo dejar la medicación cuando estoy bien (en remisión)?",
    "¿Qué hago si noto que empieza un brote? ¿Llamo a la consulta o voy a urgencias?",
    "¿Qué analgésicos puedo tomar sin riesgo de empeorar la colitis?",
    "¿Con qué frecuencia necesito hacerme una colonoscopía de vigilancia?",
    "¿Cuándo estaría indicado un biológico en mi caso?",
    "¿Qué vacunas debo ponerme antes de iniciar un inmunosupresor o biológico?",
    "¿Cuándo se considera la cirugía y en qué consiste el reservorio ileoanal (pouch)?",
    "¿Mis hijos tienen mayor riesgo de desarrollar colitis ulcerosa?",
    "¿Puedo hacer vida normal, deporte y viajes con la colitis?",
    "¿Existe algún ensayo clínico para el que podría ser candidato?"
  ]
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Ungaro, R., Mehandru, S., Allen, P. B., Peyrin-Biroulet, L., & Colombel, J. F. (2017). Ulcerative colitis. The Lancet, 389(10080), 1756-1770. https://doi.org/10.1016/S0140-6736(16)32126-2",
    "Harbord, M., Eliakim, R., Bettenworth, D., Karmiris, K., Katsanos, K., Kopylov, U., ... & European Crohn''s and Colitis Organisation [ECCO]. (2017). Third European evidence-based consensus on diagnosis and management of ulcerative colitis. Journal of Crohn''s and Colitis, 11(6), 649-670.",
    "Rubin, D. T., Ananthakrishnan, A. N., Siegel, C. A., Sauer, B. G., & Long, M. D. (2019). ACG Clinical Guideline: Ulcerative Colitis in Adults. American Journal of Gastroenterology, 114(3), 384-413.",
    "Ko, C. W., Singh, S., Feuerstein, J. D., Falck-Ytter, C., Falck-Ytter, Y., & Cross, R. K. (2019). AGA Clinical Practice Guidelines on the management of mild-to-moderate ulcerative colitis. Gastroenterology, 156(3), 748-764.",
    "Fumery, M., Singh, S., Dulai, P. S., Garg, R., Prokop, L. J., & Sandborn, W. J. (2018). Natural history of adult ulcerative colitis in population-based cohorts. Clinical Gastroenterology and Hepatology, 16(3), 343-356.",
    "Truelove, S. C., & Witts, L. J. (1955). Cortisone in ulcerative colitis. British Medical Journal, 2(4947), 1041-1048. (Criterios de Truelove-Witts para clasificar gravedad del brote.)"
  ]
}'::jsonb
from conditions c where c.slug = 'colitis-ulcerosa';

-- ============================================================
-- SECTIONS: erge (51)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "El Reflujo Gastroesofágico ocurre cuando el ácido del estómago sube hacia el esófago. Todos tenemos episodios de reflujo ocasionales, especialmente después de una comida copiosa. Hablamos de Enfermedad por Reflujo Gastroesofágico (ERGE) cuando estos episodios son frecuentes, duran mucho o causan daño en el esófago.",
    "El esófago y el estómago están separados por un músculo llamado esfínter esofágico inferior (EEI). Imagínalo como una válvula que debería mantenerse cerrada excepto cuando tragas. En la ERGE, esta válvula se relaja en momentos inapropiados o está debilitada, permitiendo que el contenido ácido del estómago suba.",
    "La ERGE es una de las enfermedades digestivas más frecuentes del mundo: afecta al 10-20% de la población occidental. En muchos casos es leve y se controla bien con cambios en el estilo de vida y medicamentos. En otros, puede causar inflamación del esófago (esofagitis) o, en casos de larga evolución sin tratamiento, cambios en las células del esófago (esófago de Barrett).",
    "La hernia de hiato, que ocurre cuando una parte del estómago sube a través del diafragma hacia el pecho, facilita el reflujo pero no es la única causa. Muchas personas con hernia de hiato no tienen ERGE, y hay ERGE sin hernia de hiato.",
    "La Sociedad Americana de Gastroenterología (ACG) y la Sociedad Europea (ESGE) establecen que el diagnóstico es principalmente clínico: si tienes ardor (pirosis) o regurgitación más de 2 veces por semana, es probable que tengas ERGE."
  ],
  "callout": {"label": "¿Qué es el esófago de Barrett?", "body": "Es un cambio en las células del esófago inferior causado por la exposición crónica al ácido. Aunque es una lesión precancerosa, solo una pequeña minoría progresa a cáncer de esófago. Si te diagnostican Barrett, tu médico te hará seguimiento endoscópico periódico."}
}'::jsonb
from conditions c where c.slug = 'erge';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "La causa principal del ERGE es la disfunción del esfínter esofágico inferior: se relaja en momentos inadecuados, permitiendo que el ácido suba. Varios factores favorecen esto.",
    "Los factores de riesgo más importantes son: obesidad (especialmente la grasa abdominal presiona el estómago hacia arriba), embarazo (el crecimiento del útero comprime el estómago), hernia de hiato, tabaquismo (el tabaco relaja el esfínter y reduce la producción de saliva, que ayuda a neutralizar el ácido) y consumo de alcohol.",
    "Ciertos alimentos y bebidas relajan el esfínter esofágico inferior y empeoran el reflujo: café, chocolate, menta, alimentos grasos, cítricos, tomate, alcohol y bebidas carbonatadas. No todos los pacientes reaccionan igual a todos estos alimentos, y no hay que eliminarlos todos de entrada: identifica cuáles te afectan a ti.",
    "Algunos medicamentos pueden empeorar el ERGE: antiinflamatorios no esteroideos (ibuprofeno), aspirina, algunos antihipertensivos (bloqueantes del calcio), benzodiacepinas y algunos antibióticos. Si tomas alguno de estos medicamentos, coméntalo con tu médico.",
    "Comer justo antes de acostarse, las porciones grandes y la ropa apretada en el abdomen también favorecen el reflujo. Estos son factores modificables sobre los que tienes control directo."
  ]
}'::jsonb
from conditions c where c.slug = 'erge';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El síntoma clásico del ERGE es la pirosis: esa sensación de ardor o quemazón que sube desde el pecho hacia la garganta, generalmente después de comer o al acostarse. La regurgitación (sentir que el contenido del estómago sube a la boca o garganta) es el segundo síntoma más frecuente.",
    "El ERGE puede tener síntomas atípicos que no parecen digestivos: tos crónica seca (especialmente por la noche), ronquera matutina, sensación de globo en la garganta, dolor de garganta recurrente o empeoramiento del asma. Estos síntomas ocurren porque el ácido irrita las vías respiratorias superiores.",
    "La mayoría de los casos de ERGE no son peligrosos, pero existen señales que requieren evaluación urgente o pronta para descartar complicaciones."
  ],
  "alarms": [
    {"tone": "red", "t": "Dificultad para tragar sólidos (disfagia)", "d": "Sensación de que la comida se queda atascada puede indicar estenosis esofágica o, en casos raros, cáncer. Requiere endoscopía urgente."},
    {"tone": "red", "t": "Vómito con sangre o heces negras", "d": "Indica sangrado del tracto digestivo alto. Acude a urgencias de inmediato."},
    {"tone": "red", "t": "Pérdida de peso inexplicada", "d": "En un paciente con síntomas de reflujo, perder peso sin causa aparente requiere descartar cáncer de esófago o gástrico."},
    {"tone": "amber", "t": "Dolor en el pecho al tragar", "d": "Puede indicar esofagitis grave o esofagospasmo. Consulta pronto, y si el dolor es intenso, descarta primero causa cardíaca."},
    {"tone": "amber", "t": "Síntomas nocturnos que te despiertan", "d": "El reflujo nocturno es más dañino porque no hay saliva que neutralice el ácido. Si te despierta regularmente, el tratamiento debe optimizarse."},
    {"tone": "amber", "t": "Síntomas que no mejoran con inhibidores de bomba de protones", "d": "Si llevas más de 4-8 semanas con tratamiento sin mejoría, comunícalo a tu médico para reevaluar el diagnóstico."}
  ]
}'::jsonb
from conditions c where c.slug = 'erge';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "En la mayoría de los casos, el ERGE se diagnostica clínicamente: si tienes pirosis y regurgitación típicas más de 2 veces por semana, el médico puede iniciar tratamiento de prueba con inhibidores de la bomba de protones (IBP) sin necesidad de pruebas adicionales.",
    "La endoscopía digestiva alta (gastroscopía) está indicada cuando hay señales de alarma, cuando los síntomas no responden al tratamiento, o cuando el médico quiere valorar si existe esofagitis, esófago de Barrett u otras complicaciones. No es necesaria de entrada en todos los pacientes.",
    "La pHmetría esofágica ambulatoria de 24 horas es la prueba de referencia (gold standard) para cuantificar el reflujo ácido real. Consiste en una sonda fina que mide el pH en el esófago durante 24 horas mientras haces vida normal. Es especialmente útil en pacientes con síntomas atípicos o con mala respuesta al tratamiento.",
    "La manometría esofágica mide la presión del esfínter esofágico y la motilidad del esófago. Se solicita cuando hay disfagia o antes de considerar la cirugía antirreflujo."
  ],
  "callout": {"label": "Prueba terapéutica con IBP", "body": "En síntomas clásicos de ERGE (ardor y regurgitación) sin señales de alarma, el médico puede iniciar directamente un IBP (como omeprazol o pantoprazol) durante 4-8 semanas. Si los síntomas mejoran, el diagnóstico de ERGE queda prácticamente confirmado."}
}'::jsonb
from conditions c where c.slug = 'erge';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento del ERGE combina cambios en el estilo de vida y medicamentos. En muchos casos, los cambios de hábitos solos son suficientes para controlar el reflujo leve.",
    "Los inhibidores de la bomba de protones (IBP) — omeprazol, pantoprazol, lansoprazol, esomeprazol — son los medicamentos más efectivos para el ERGE. Reducen drásticamente la producción de ácido gástrico y permiten que el esófago se cure. Se toman 30-60 minutos antes del desayuno. Para el ERGE activo, se usan 4-8 semanas; para el mantenimiento, a la dosis mínima efectiva.",
    "Los antiácidos (bicarbonato, carbonato de calcio) alivian el ardor de forma rápida pero no curan: neutralizan el ácido ya presente pero no lo reducen de forma prolongada. Son útiles como rescate ocasional.",
    "Los antagonistas H2 (famotidina, ranitidina) son menos potentes que los IBP pero pueden usarse como alternativa en síntomas leves o como complemento nocturno en casos que requieren mayor control.",
    "Los cambios de estilo de vida con mayor evidencia son: elevar la cabecera de la cama 15-20 cm (no solo la almohada) para el reflujo nocturno, no comer en las 2-3 horas antes de acostarse, adelgazar si hay sobrepeso y dejar de fumar. Identificar y evitar los alimentos desencadenantes individuales también es útil.",
    "La cirugía antirreflujo (funduplicatura de Nissen, laparoscópica) está indicada en pacientes que no desean tomar medicación de por vida, aquellos con síntomas refractarios bien documentados o con hernia de hiato grande. Es altamente efectiva pero tiene riesgos quirúrgicos y puede producir dificultad para tragar en el postoperatorio."
  ],
  "callout": {"label": "¿Hay que tomar el omeprazol de por vida?", "body": "No necesariamente. Muchos pacientes con ERGE leve-moderado logran controlar la enfermedad con dosis a demanda o incluso solo con cambios de hábitos tras el tratamiento inicial. Habla con tu médico sobre la estrategia de reducción gradual una vez que estés asintomático."}
}'::jsonb
from conditions c where c.slug = 'erge';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Vivir con ERGE implica principalmente aprender qué hábitos y alimentos te desencadenan los síntomas y hacer ajustes razonables. No se trata de eliminar todo lo que te gusta, sino de identificar tus desencadenantes personales.",
    "Comer porciones más pequeñas y con más frecuencia en lugar de 2-3 comidas grandes reduce la presión sobre el esfínter esofágico. Masticar despacio también ayuda.",
    "Elevar la cabecera de la cama (no solo la almohada) es especialmente útil si tienes síntomas nocturnos. Puedes hacerlo con tacos bajo las patas de la cama o con una cuña especial bajo el colchón.",
    "El control del peso es una de las medidas más efectivas: incluso perder el 10% del peso corporal puede reducir significativamente los síntomas del ERGE en personas con sobrepeso.",
    "Si tomas IBP, no los abandones bruscamente porque puede producirse un efecto rebote (hiperacidez al retirarlos). La reducción debe ser gradual, idealmente con la guía de tu médico."
  ]
}'::jsonb
from conditions c where c.slug = 'erge';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
  "questions": [
    "¿Necesito hacerme una endoscopía o puedo tratar el reflujo directamente con medicación?",
    "¿Cuánto tiempo debo tomar el IBP y cómo lo retiro después?",
    "¿Tengo esofagitis o algún daño en el esófago?",
    "¿Qué alimentos debo evitar específicamente en mi caso?",
    "¿Mis síntomas pueden tener otra causa además del reflujo?",
    "¿Podría ser el reflujo la causa de mi tos crónica o mi ronquera?",
    "¿Qué riesgo tengo de desarrollar esófago de Barrett dado el tiempo que llevo con síntomas?",
    "¿Debo hacerme seguimiento con endoscopías periódicas?",
    "¿Alguno de los medicamentos que tomo actualmente empeora el reflujo?",
    "¿Cuánto peso debo perder para notar una diferencia en los síntomas?",
    "¿Cuándo se consideraría la cirugía antirreflujo en mi caso?",
    "¿Qué señales deben hacerme volver a consulta antes de mi próxima cita?"
  ]
}'::jsonb
from conditions c where c.slug = 'erge';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Katz, P. O., Dunbar, K. B., Schnoll-Sussman, F. H., Greer, K. B., Yadlapati, R., & Spechler, S. J. (2022). ACG Clinical Guideline for the Diagnosis and Management of Gastroesophageal Reflux Disease. American Journal of Gastroenterology, 117(1), 27-56. https://doi.org/10.14309/ajg.0000000000001538",
    "Gyawali, C. P., Kahrilas, P. J., Savarino, E., Zerbib, F., Mion, F., Smout, A. J., ... & Roman, S. (2018). Modern diagnosis of GERD: the Lyon Consensus. Gut, 67(7), 1351-1362.",
    "Clarrett, D. M., & Hachem, C. (2018). Gastroesophageal reflux disease (GERD). Missouri Medicine, 115(3), 214-218.",
    "Eusebi, L. H., Ratnakumaran, R., Yuan, Y., Solaymani-Dodaran, M., Bazzoli, F., & Ford, A. C. (2018). Global prevalence of, and risk factors for, gastro-oesophageal reflux symptoms: a meta-analysis. Gut, 67(3), 430-440.",
    "Richter, J. E., & Rubenstein, J. H. (2018). Presentation and epidemiology of gastroesophageal reflux disease. Gastroenterology, 154(2), 267-276.",
    "Spechler, S. J., & Souza, R. F. (2014). Barrett''s esophagus. New England Journal of Medicine, 371(9), 836-845."
  ]
}'::jsonb
from conditions c where c.slug = 'erge';

-- ============================================================
-- SECTIONS: helicobacter-pylori (52)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "El Helicobacter pylori (H. pylori) es una bacteria que vive en el revestimiento del estómago. Es una de las infecciones bacterianas crónicas más comunes del mundo: se calcula que infecta a aproximadamente el 44% de la población mundial, con tasas mucho más altas en países en desarrollo (hasta el 80%).",
    "La bacteria tiene una adaptación extraordinaria: produce una enzima llamada ureasa que neutraliza el ácido del estómago a su alrededor, creando un microambiente donde puede sobrevivir cómodamente. Sin esta enzima, el ácido gástrico mataría cualquier bacteria.",
    "La mayoría de las personas infectadas (hasta el 70-80%) nunca tienen síntomas. El sistema inmune convive con la bacteria sin eliminarla. Sin embargo, en algunos pacientes, la infección causa gastritis (inflamación del estómago) y úlceras pépticas (llagas en el revestimiento del estómago o duodeno).",
    "El H. pylori está clasificado por la Organización Mundial de la Salud (OMS) como carcinógeno tipo I, lo que significa que existe evidencia suficiente de que puede causar cáncer gástrico. Sin embargo, el riesgo es bajo en términos absolutos: solo una pequeña fracción de los infectados desarrolla cáncer, y este proceso toma décadas.",
    "La buena noticia es que el H. pylori se erradica eficazmente con un tratamiento corto de 10-14 días de antibióticos. Una vez eliminada la bacteria, las úlceras curan, la gastritis mejora y el riesgo de cáncer gástrico disminuye."
  ],
  "callout": {"label": "¿Cuándo tratar el H. pylori?", "body": "La Guía de Maastricht VI (2022) recomienda tratar el H. pylori siempre que se diagnostique, independientemente de que cause síntomas o no. La erradicación previene úlceras, reduce el riesgo de cáncer gástrico y, si ya existe una úlcera, acelera su curación y previene la recurrencia."}
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "El H. pylori se transmite principalmente por la ruta fecal-oral: de las heces de una persona infectada a la boca de otra, generalmente a través del agua o alimentos contaminados o por contacto cercano con una persona infectada (especialmente en la infancia en el seno familiar).",
    "La transmisión es más frecuente en condiciones de hacinamiento, acceso limitado a agua potable y saneamiento deficiente. Por eso la prevalencia es mucho más alta en países en desarrollo y en entornos socioeconómicos desfavorecidos.",
    "La infección suele adquirirse en la infancia. Una vez establecida, si no se trata, persiste de por vida. Los adultos raramente se reinfectan después de una erradicación exitosa en países desarrollados.",
    "Los factores de riesgo para desarrollar úlcera en un paciente con H. pylori incluyen: el uso de antiinflamatorios no esteroideos (AINEs), el tabaquismo, el estrés fisiológico intenso (como una enfermedad grave o cirugía), y probablemente ciertos factores genéticos del huésped.",
    "El H. pylori no se transmite por los besos ocasionales, aunque sí puede transmitirse entre parejas que conviven durante muchos años. Si un miembro de la familia tiene H. pylori, no es necesario que todos hagan pruebas a menos que tengan síntomas o indicación médica."
  ]
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "La mayoría de las personas con H. pylori no tienen síntomas. Cuando la infección causa gastritis o úlcera, los síntomas más frecuentes son: dolor o ardor en el abdomen superior (epigastrio), náuseas, pérdida del apetito, eructos frecuentes y sensación de plenitud rápida al comer.",
    "El dolor de la úlcera duodenal tiene un patrón clásico: aparece cuando el estómago está vacío (2-3 horas después de comer o de madrugada) y mejora al comer. El dolor de la úlcera gástrica, por el contrario, suele empeorar con la comida.",
    "Es importante distinguir entre síntomas leves de dispepsia (molestia gástrica habitual) y señales de alerta que requieren evaluación urgente."
  ],
  "alarms": [
    {"tone": "red", "t": "Vómito con sangre (hematemesis)", "d": "Indica sangrado de úlcera activa. Acude a urgencias de inmediato."},
    {"tone": "red", "t": "Heces negras como alquitrán (melenas)", "d": "Sangre digerida en las heces es signo de hemorragia digestiva alta. Urgencias de inmediato."},
    {"tone": "red", "t": "Dolor abdominal intenso y súbito", "d": "La perforación de una úlcera produce dolor agudo y repentino muy intenso. Es una emergencia quirúrgica."},
    {"tone": "amber", "t": "Pérdida de peso sin explicación", "d": "En un paciente con síntomas gástricos, perder peso puede indicar úlcera complicada o, raramente, cáncer gástrico. Consulta pronto."},
    {"tone": "amber", "t": "Dificultad para tragar", "d": "No es síntoma habitual del H. pylori y debe evaluarse para descartar otras causas esofágicas o gástricas."},
    {"tone": "amber", "t": "Anemia diagnosticada sin causa clara", "d": "El sangrado crónico de una úlcera puede causar anemia ferropénica. Si te dicen que tienes anemia sin explicación, menciona tus síntomas digestivos."}
  ]
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "Existen varias pruebas para detectar el H. pylori, y el médico elegirá la más adecuada según tu situación. Se dividen en métodos no invasivos (sin endoscopía) e invasivos (con endoscopía).",
    "La prueba de aliento con urea marcada (test del aliento) es la más usada en la práctica clínica: es sencilla, no invasiva, muy precisa y sirve tanto para diagnosticar como para confirmar la erradicación. Consiste en tomar una cápsula con urea marcada y soplar en una bolsa antes y después. Si hay H. pylori, la ureasa que produce descompone la urea y el CO2 marcado aparece en el aliento.",
    "El antígeno del H. pylori en heces es otra opción no invasiva, precisa y más económica en algunos países. Es especialmente útil para confirmar la erradicación 4 semanas después del tratamiento.",
    "La endoscopía con biopsia gástrica permite además ver directamente si hay gastritis, úlcera o lesiones de riesgo. Se recomienda en pacientes con señales de alarma, mayores de 45-50 años con síntomas nuevos, o cuando hay sospecha de cáncer gástrico.",
    "Importante: la serología (análisis de sangre para anticuerpos IgG anti-H. pylori) no sirve para confirmar erradicación porque los anticuerpos persisten durante años después de que la bacteria desaparece. El test del aliento o el antígeno fecal son las pruebas correctas para verificar la curación."
  ],
  "callout": {"label": "¿Cómo confirmar que el H. pylori se eliminó?", "body": "Siempre debes hacerte una prueba de confirmación 4-6 semanas después de terminar el tratamiento antibiótico (y 2 semanas después de dejar el IBP). La prueba del aliento o el antígeno fecal son las opciones correctas. No uses serología para esto."}
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento del H. pylori consiste en una combinación de antibióticos y un inhibidor de bomba de protones (IBP, como omeprazol) durante 10-14 días. Esta combinación se llama terapia de erradicación.",
    "El esquema de primera línea más usado actualmente en muchas regiones es la terapia cuádruple con bismuto: IBP + bismuto + metronidazol + tetraciclina durante 10-14 días. Esta combinación tiene altas tasas de erradicación (>90%) incluso en zonas con resistencia alta a la claritromicina.",
    "Otra opción es la terapia cuádruple sin bismuto (concomitante): IBP + amoxicilina + claritromicina + metronidazol durante 14 días. La elección del esquema depende de los patrones de resistencia antibiótica locales, que tu médico conoce.",
    "El cumplimiento estricto del tratamiento es fundamental. No dejes ninguna dosis aunque te sientas bien, y toma el IBP siempre 30-60 minutos antes de las comidas. Los antibióticos deben tomarse con las comidas para reducir efectos secundarios digestivos.",
    "Si el primer tratamiento falla (lo que ocurre en un 10-20% de los casos), existen esquemas de rescate de segunda y tercera línea con antibióticos diferentes, idealmente guiados por un cultivo con antibiograma de la bacteria.",
    "Después del tratamiento, la persona puede reinfectarse (aunque es poco frecuente en países desarrollados). Por eso es importante la prueba de confirmación de erradicación 4-6 semanas después de terminar los antibióticos."
  ],
  "callout": {"label": "¿Por qué el H. pylori falla en tratarse a veces?", "body": "La resistencia antibiótica a la claritromicina es la principal causa de fallo del tratamiento. En algunas regiones supera el 20%. Por eso los esquemas actuales han cambiado hacia combinaciones de cuatro fármacos que evitan la claritromicina como único antibiótico."}
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Si te acaban de diagnosticar H. pylori, lo más importante es completar el tratamiento antibiótico prescrito de principio a fin. Muchas personas se sienten mejor a los pocos días y sienten tentación de dejar la medicación, pero hacerlo aumenta el riesgo de resistencia antibiótica y de que el tratamiento falle.",
    "Durante el tratamiento, algunos antibióticos (especialmente el metronidazol) no son compatibles con el alcohol. Evita completamente el alcohol mientras dures en tratamiento.",
    "Una vez confirmada la erradicación, no necesitas ningún tratamiento adicional de mantenimiento. Las úlceras causadas por H. pylori raramente recidivan después de la erradicación exitosa.",
    "Para prevenir la reinfección, las medidas de higiene general son suficientes: lavado frecuente de manos (especialmente antes de comer y después de ir al baño), consumir agua potable segura y alimentos bien preparados.",
    "Si tenías una úlcera, tu médico puede repetir la endoscopía para confirmar su curación, especialmente si era una úlcera gástrica (en el estómago), ya que en casos excepcionales puede confundirse con cáncer gástrico."
  ]
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta."],
  "questions": [
    "¿El H. pylori que me diagnosticaron está causando mis síntomas, o podría haber otra causa?",
    "¿Tengo úlcera, o solo gastritis por la bacteria?",
    "¿Cuál es el esquema de tratamiento que me recomiendas y por cuántos días?",
    "¿Puedo tomar alcohol durante el tratamiento?",
    "¿Cómo debo tomar los medicamentos: con comida, antes de comer?",
    "¿Qué efectos secundarios son normales y cuáles me deben hacer llamar al médico?",
    "¿Cuándo y con qué prueba confirmamos que la bacteria se eliminó?",
    "¿Mis familiares que conviven conmigo deberían hacerse la prueba?",
    "¿Debo repetir la endoscopía después del tratamiento para ver si la úlcera curó?",
    "¿Qué ocurre si el primer tratamiento no funciona?",
    "¿Tengo mayor riesgo de cáncer gástrico? ¿Necesito algún tipo de seguimiento especial?",
    "¿Debo dejar el ibuprofeno u otros antiinflamatorios que tomo habitualmente?"
  ]
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Malfertheiner, P., Megraud, F., Rokkas, T., Gisbert, J. P., Liou, J. M., Schulz, C., ... & European Helicobacter and Microbiota Study Group. (2022). Management of Helicobacter pylori infection: the Maastricht VI/Florence consensus report. Gut, 71(9), 1724-1762. https://doi.org/10.1136/gutjnl-2022-327745",
    "Chey, W. D., Leontiadis, G. I., Howden, C. W., & Moss, S. F. (2017). ACG Clinical Guideline: Treatment of Helicobacter pylori Infection. American Journal of Gastroenterology, 112(2), 212-239.",
    "Sugano, K., Tack, J., Kuipers, E. J., Graham, D. Y., El-Omar, E. M., Miura, S., ... & Malfertheiner, P. (2015). Kyoto global consensus report on Helicobacter pylori gastritis. Gut, 64(9), 1353-1367.",
    "Hooi, J. K. Y., Lai, W. Y., Ng, W. K., Suen, M. M. Y., Underwood, F. E., Tanyingoh, D., ... & Ng, S. C. (2017). Global prevalence of Helicobacter pylori infection: systematic review and meta-analysis. Gastroenterology, 153(2), 420-429.",
    "International Agency for Research on Cancer (IARC). (1994). IARC Monographs on the evaluation of carcinogenic risks to humans. Volume 61: Schistosomes, liver flukes and Helicobacter pylori. Lyon: IARC.",
    "Fallone, C. A., Chiba, N., van Zanten, S. V., Fischbach, L., Garg, A. X., Graham, D. Y., ... & Marshall, J. K. (2016). The Toronto consensus for the treatment of Helicobacter pylori infection in adults. Gastroenterology, 151(1), 51-69."
  ]
}'::jsonb
from conditions c where c.slug = 'helicobacter-pylori';

-- ============================================================
-- SECTIONS: asma (53)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "El asma es una enfermedad crónica de las vías respiratorias en la que los bronquios (los tubos que llevan el aire a los pulmones) se inflaman y se vuelven hipersensibles. Cuando se encuentran con ciertos desencadenantes, se estrechan temporalmente, haciendo que respirar sea difícil.",
    "Imagina que tus bronquios son mangueras de jardín. En el asma, las paredes de esas mangueras se hinchan, el músculo que las rodea se contrae y producen más moco de lo normal. El resultado es un tubo más estrecho por el que el aire tiene que pasar con más esfuerzo, produciendo ese sonido de silbido (sibilancias) que es tan característico del asma.",
    "El asma afecta a más de 300 millones de personas en el mundo y es la enfermedad respiratoria crónica más común en niños. En la mayoría de los casos, el asma bien controlada no limita las actividades cotidianas, incluyendo el deporte de alto rendimiento.",
    "La iniciativa GINA (Global Initiative for Asthma), que es el estándar internacional de referencia para el manejo del asma, clasifica el asma según el nivel de control (bien controlada, parcialmente controlada, no controlada) y la gravedad. Esta clasificación guía el tratamiento.",
    "Aunque el asma es crónica (no tiene cura definitiva), el tratamiento actual permite que la gran mayoría de los pacientes vivan sin síntomas o con síntomas mínimos. Muchos niños con asma tienen una mejoría significativa o incluso la remisión clínica al llegar a la adultez."
  ],
  "callout": {"label": "El asma no te define", "body": "Más de 500 atletas olímpicos han competido con asma. Con el tratamiento correcto, el asma no tiene por qué limitar ninguna actividad física ni profesional."}
}'::jsonb
from conditions c where c.slug = 'asma';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "El asma es una enfermedad multifactorial: ningún factor único la causa, sino la interacción entre predisposición genética y exposición a factores ambientales, especialmente en los primeros años de vida.",
    "Los antecedentes familiares son el factor de riesgo genético más importante. Si uno de tus padres tiene asma, tu riesgo aproximadamente se duplica. Las alergias (rinitis alérgica, dermatitis atópica, alergia alimentaria) y el asma comparten mecanismos inmunológicos y con frecuencia aparecen juntas.",
    "Los desencadenantes más frecuentes de los síntomas de asma incluyen: ácaros del polvo doméstico, pólenes, caspa de animales, moho, humo de tabaco (activo y pasivo), contaminación del aire, infecciones respiratorias virales (especialmente el rinovirus), ejercicio físico, aire frío y seco, medicamentos como aspirina e ibuprofeno, y el estrés emocional.",
    "La exposición al humo de tabaco durante el embarazo y en la infancia temprana aumenta significativamente el riesgo de asma. La contaminación ambiental también juega un papel importante: vivir cerca de vías de tráfico intenso o en zonas con alta contaminación se asocia a mayor incidencia de asma.",
    "La hipótesis de la higiene sugiere que la exposición a menos microorganismos en la infancia (consecuencia de vivir en entornos muy limpios y urbanos) puede aumentar la predisposición a enfermedades alérgicas como el asma. Los niños criados en granjas o con mascotas tienen tasas más bajas de asma alérgica."
  ]
}'::jsonb
from conditions c where c.slug = 'asma';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "Los cuatro síntomas clásicos del asma son: sibilancias (silbido al respirar), disnea (sensación de falta de aire o de que el pecho está apretado), tos (frecuentemente seca, peor de noche o de madrugada) y opresión torácica (sensación de peso o presión en el pecho).",
    "Estos síntomas son variables: pueden estar presentes todo el tiempo o solo en ciertos momentos (como durante el ejercicio o al exponerse a alérgenos). Son más frecuentes por la noche y de madrugada. La variabilidad es una característica clave del asma que la distingue de otras enfermedades respiratorias.",
    "Cuando los síntomas del asma se intensifican de forma aguda hablamos de una crisis o exacerbación de asma. Las crisis pueden ir desde leves (ligero aumento de los síntomas) hasta severas o incluso potencialmente mortales."
  ],
  "alarms": [
    {"tone": "red", "t": "Dificultad grave para respirar en reposo", "d": "Si no puedes terminar una frase completa sin parar a respirar, es una crisis grave. Usa el broncodilatador de rescate y llama a emergencias."},
    {"tone": "red", "t": "Labios o uñas azulados (cianosis)", "d": "Indica falta grave de oxígeno. Es una emergencia médica: llama al número de emergencias de tu país de inmediato."},
    {"tone": "red", "t": "Sin mejoría tras 3-4 puff del inhalador de rescate", "d": "Si el salbutamol/albuterol no mejora los síntomas en 15-20 minutos, acude a urgencias."},
    {"tone": "amber", "t": "Necesidad de usar el inhalador de rescate más de 2 veces por semana", "d": "Indica que el asma no está bien controlada. El tratamiento de mantenimiento debe ajustarse. Consulta a tu médico."},
    {"tone": "amber", "t": "Despertar nocturno por síntomas de asma", "d": "El asma nocturna es señal de mal control. Habla con tu médico en la próxima consulta."},
    {"tone": "amber", "t": "Crisis que requirió urgencias en el último año", "d": "Una visita a urgencias por asma es factor de riesgo de crisis futuras más graves. Revisa el plan de acción con tu médico."}
  ]
}'::jsonb
from conditions c where c.slug = 'asma';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de asma se basa en la combinación de síntomas característicos y la demostración objetiva de obstrucción bronquial variable mediante pruebas de función pulmonar.",
    "La espirometría es la prueba clave: mide cuánto aire puedes exhalar y con qué velocidad. En el asma, el flujo espiratorio está reducido y mejora significativamente (más del 12% y 200 ml) tras inhalar un broncodilatador de acción corta (prueba broncodilatadora positiva). Esta respuesta al broncodilatador es diagnóstica de asma.",
    "El pico flujo (peak flow) es una prueba sencilla que puedes hacer en casa con un dispositivo pequeño y económico. Mide la velocidad máxima del aire al espirar. La variabilidad del pico flujo a lo largo del día (>10%) o entre días apoya el diagnóstico de asma.",
    "Las pruebas de alergia (prick test cutáneo o análisis de sangre IgE específicas) identifican los alérgenos desencadenantes. Esto es importante para implementar medidas de evitación y para valorar la inmunoterapia (vacunas para alergia)."
  ],
  "callout": {"label": "La espirometría: la prueba clave", "body": "La espirometría no duele y dura solo unos minutos. Soplas con fuerza en un tubo conectado a un aparato que mide tu capacidad pulmonar. Si el resultado mejora tras inhalar un broncodilatador, el diagnóstico de asma queda prácticamente confirmado."}
}'::jsonb
from conditions c where c.slug = 'asma';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento del asma se divide en dos grandes categorías: medicamentos de alivio (rescate) y medicamentos de control (mantenimiento). La guía GINA establece que todos los pacientes con asma deben tener acceso a ambos.",
    "Los broncodilatadores de acción corta (salbutamol, albuterol) son los inhaladores de rescate: actúan en minutos para abrir los bronquios durante una crisis. NO se deben usar como tratamiento de base, sino solo cuando hay síntomas agudos. Usar el inhalador de rescate más de 2 veces por semana indica que el asma no está controlada.",
    "Los corticoides inhalados (budesonida, fluticasona, beclometasona) son el pilar del tratamiento de mantenimiento. Reducen la inflamación de los bronquios y previenen las crisis. Tienen muy pocos efectos secundarios a las dosis habituales porque actúan localmente. Es fundamental enjuagarse la boca después de usarlos para prevenir la candidiasis oral.",
    "La combinación de corticoide inhalado + broncodilatador de larga duración (LABA) en un mismo inhalador (salmeterol/fluticasona, formoterol/budesonida) es el tratamiento estándar para el asma moderada-grave. Los nuevos inhaladores triple (corticoide + LABA + anticolinérgico) están disponibles para casos seleccionados.",
    "Los biológicos (como omalizumab, mepolizumab, dupilumab) son inyecciones que bloquean mecanismos inflamatorios específicos del asma grave. Están indicados solo cuando el asma no se controla con dosis altas de corticoides inhalados y son altamente efectivos en los pacientes correctos.",
    "La inmunoterapia (vacunas para alergia) puede modificar el curso de la enfermedad en pacientes con asma alérgica bien caracterizada, reduciendo la sensibilidad a los alérgenos desencadenantes a largo plazo."
  ],
  "callout": {"label": "Técnica inhalatoria correcta", "body": "Hasta el 80% de los pacientes no usan el inhalador correctamente, lo que reduce su efectividad. Pide a tu médico o farmacéutico que te muestre la técnica correcta para tu tipo de inhalador. Existen videos instructivos en YouTube para cada dispositivo."}
}'::jsonb
from conditions c where c.slug = 'asma';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Controlar el asma significa que puedes vivir sin síntomas, hacer ejercicio, dormir bien y no necesitar el inhalador de rescate casi nunca. Este es el objetivo real del tratamiento, y es alcanzable para la mayoría de los pacientes.",
    "El plan de acción escrito para el asma es una herramienta clave: tu médico te ayuda a crear un documento personalizado que indica qué hacer cuando los síntomas empeoran, cuándo usar el inhalador de rescate, cuándo aumentar el tratamiento y cuándo ir a urgencias. Tenerlo claro reduce la ansiedad y la mortalidad por asma.",
    "Identificar y evitar los desencadenantes personales es fundamental. Las medidas más eficaces para alérgicos a ácaros incluyen: fundas antiácaros en colchones y almohadas, lavar la ropa de cama semanalmente a 60°C, no tener alfombras en el dormitorio, y mantener la humedad ambiental por debajo del 50%.",
    "El ejercicio es beneficioso para el asma, no algo que debas evitar. El asma inducida por ejercicio se puede prevenir con el inhalador de rescate 15-20 minutos antes de la actividad. Habla con tu médico para que te ayude a crear un plan de ejercicio seguro.",
    "Revisa tu inhalador de mantenimiento regularmente con tu médico. Si llevas meses sin síntomas, quizás se puede reducir la dosis. Si usas el rescate con frecuencia, probablemente hay que subir el escalón terapéutico. El asma bien manejada se ajusta dinámicamente."
  ]
}'::jsonb
from conditions c where c.slug = 'asma';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu médico o neumólogo."],
  "questions": [
    "¿Mi asma está bien controlada según los criterios actuales de la guía GINA?",
    "¿Estoy usando bien mi inhalador? ¿Me puedes mostrar la técnica correcta?",
    "¿Cuál es el desencadenante principal de mis síntomas y cómo lo puedo evitar?",
    "¿Debo hacer pruebas de alergia para identificar si mi asma es alérgica?",
    "¿Cuándo puedo reducir el tratamiento de mantenimiento y cuándo debo aumentarlo?",
    "¿Puedo hacer ejercicio sin restricciones? ¿Debo tomar algo antes de ejercitarme?",
    "¿Tengo un plan de acción escrito para las crisis? Si no, ¿podemos crearlo hoy?",
    "¿Cuándo estaría indicada una espirometría de seguimiento?",
    "¿Podría ser candidato a biológicos o a inmunoterapia (vacunas de alergia)?",
    "¿El tabaquismo pasivo en mi entorno está afectando mi asma?",
    "¿Mi asma podría mejorar o incluso desaparecer con los años?",
    "¿Qué vacunas debo tener al día (gripe, COVID, neumococo) por tener asma?"
  ]
}'::jsonb
from conditions c where c.slug = 'asma';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Global Initiative for Asthma (GINA). (2023). Global Strategy for Asthma Management and Prevention. Disponible en: https://ginasthma.org",
    "Reddel, H. K., Bacharier, L. B., Bateman, E. D., Brightling, C. E., Brusselle, G. G., Buhl, R., ... & O''Byrne, P. M. (2022). Global Initiative for Asthma Strategy 2021. American Journal of Respiratory and Critical Care Medicine, 205(1), 17-35.",
    "Wenzel, S. E. (2012). Asthma phenotypes: the evolution from clinical to molecular approaches. Nature Medicine, 18(5), 716-725.",
    "Olin, J. T., & Wechsler, M. E. (2014). Asthma: pathogenesis and novel drugs for treatment. BMJ, 349, g5517.",
    "Lommatzsch, M., & Virchow, J. C. (2014). Severe asthma: definition, diagnosis and treatment. Deutsches Ärzteblatt International, 111(50), 847-855.",
    "Bousquet, J., Heinzerling, L., Bachert, C., Papadopoulos, N. G., Bousquet, P. J., Burney, P. G., ... & ARIA Workshop Group. (2012). Practical guide to skin prick tests in allergy to aeroallergens. Allergy, 67(1), 18-24.",
    "Sociedad Española de Neumología y Cirugía Torácica (SEPAR). (2022). Guía española para el manejo del asma (GEMA 5.3). Disponible en: https://www.gemasma.com"
  ]
}'::jsonb
from conditions c where c.slug = 'asma';

-- ============================================================
-- SECTIONS: epoc (54)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "La Enfermedad Pulmonar Obstructiva Crónica (EPOC) es una enfermedad pulmonar que hace progresivamente más difícil respirar porque los pulmones se dañan de forma permanente. El daño es causado principalmente por la inhalación prolongada de humo de tabaco u otras partículas dañinas (como humo de biomasa o polvo industrial).",
    "La EPOC incluye dos condiciones que suelen coexistir: el enfisema (destrucción de los alvéolos, los pequeños sacos de aire donde se intercambia el oxígeno) y la bronquitis crónica (inflamación y estrechamiento permanente de los bronquios con producción excesiva de moco). En el enfisema, imagina que las paredes entre los globos de aire del pulmón se rompen, creando globos más grandes pero menos eficientes.",
    "La EPOC afecta a más de 300 millones de personas en el mundo y es la tercera causa de muerte a nivel mundial (OMS). En muchos casos está subdiagnosticada: millones de personas tienen EPOC sin saberlo porque atribuyen su falta de aire al envejecimiento normal o al tabaquismo.",
    "La Iniciativa Global para la EPOC (GOLD) clasifica la enfermedad en estadios A, B y E según los síntomas y el riesgo de exacerbaciones, y en grados espirométricos (1 al 4) según el grado de obstrucción al flujo aéreo. Esta clasificación guía el tratamiento.",
    "El daño pulmonar en la EPOC no se revierte, pero la enfermedad se puede frenar significativamente. Dejar de fumar es, con mucho, la intervención más eficaz: enlentece la progresión de forma dramática independientemente del estadio en que se abandone el tabaco."
  ],
  "callout": {"label": "La EPOC se puede frenar", "body": "Aunque el daño ya hecho no se recupera, dejar de fumar es la medida más efectiva para ralentizar la progresión de la EPOC. Nunca es demasiado tarde: incluso dejar de fumar en estadios avanzados mejora los síntomas y la supervivencia."}
}'::jsonb
from conditions c where c.slug = 'epoc';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "El tabaquismo es la causa principal de la EPOC: el 80-90% de los casos están relacionados con fumar cigarrillos. El riesgo aumenta con el número de años fumando y la cantidad de cigarrillos por día (medido en paquetes-año: años fumando × paquetes/día).",
    "Sin embargo, no todos los fumadores desarrollan EPOC (solo el 20-25%), lo que indica que existe predisposición genética. El déficit de alfa-1 antitripsina es la causa genética más importante de EPOC en no fumadores: esta proteína normalmente protege los pulmones, y sin ella el tejido pulmonar se destruye.",
    "Otras causas significativas incluyen: exposición laboral prolongada a polvo de sílice, carbón, cereales o vapores químicos; exposición a humo de biomasa (leña, carbón vegetal) en espacios cerrados sin ventilación, que es la causa principal de EPOC en mujeres no fumadoras de países en desarrollo; y contaminación del aire exterior.",
    "Las infecciones respiratorias graves en la infancia pueden dañar el desarrollo pulmonar y predisponer a EPOC décadas más tarde. El tabaquismo pasivo en la infancia también aumenta el riesgo.",
    "La edad es un factor de riesgo por sí misma: la pérdida de función pulmonar se acelera con los años en los pulmones ya dañados. Los síntomas de la EPOC suelen aparecer después de los 40-50 años, pero el daño comienza mucho antes."
  ]
}'::jsonb
from conditions c where c.slug = 'epoc';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "Los tres síntomas cardinales de la EPOC son: disnea (falta de aire), tos crónica productiva (con expectoración de moco, especialmente por las mañanas) y sibilancias (silbido al respirar). La disnea en la EPOC es progresiva: empieza al hacer esfuerzos grandes y con el tiempo aparece con actividades cada vez menores.",
    "La disnea en la EPOC se gradúa con la escala mMRC (Modified Medical Research Council): desde grado 0 (solo al hacer ejercicio intenso) hasta grado 4 (demasiado cansado para salir de casa o incapaz de vestirse). Esta escala ayuda al médico a evaluar la gravedad e impacto de la enfermedad.",
    "Las exacerbaciones (agudizaciones) son episodios en los que los síntomas empeoran más allá de la variación habitual y requieren cambio de tratamiento. Las exacerbaciones frecuentes aceleran el deterioro de la función pulmonar y aumentan el riesgo de mortalidad."
  ],
  "alarms": [
    {"tone": "red", "t": "Disnea grave en reposo o que no mejora con el inhalador", "d": "Puede indicar una exacerbación grave o insuficiencia respiratoria. Acude a urgencias de inmediato."},
    {"tone": "red", "t": "Labios o uñas azulados (cianosis)", "d": "Señal de falta crítica de oxígeno en sangre. Emergencia médica: llama al número de emergencias."},
    {"tone": "red", "t": "Confusión mental o somnolencia excesiva durante una crisis", "d": "Puede indicar hipercapnia (acumulación de CO2). Requiere atención médica urgente."},
    {"tone": "amber", "t": "Aumento de la cantidad o color del esputo", "d": "Si el moco se vuelve más espeso, amarillo o verde, puede indicar infección respiratoria y posible exacerbación. Consulta a tu médico."},
    {"tone": "amber", "t": "Hinchazón en los pies o tobillos", "d": "Puede indicar cor pulmonale (afectación del corazón derecho por la EPOC). Requiere evaluación pronta."},
    {"tone": "amber", "t": "Pérdida de peso involuntaria", "d": "La malnutrición es frecuente en EPOC avanzada y empeora el pronóstico. Coméntalo a tu médico."}
  ]
}'::jsonb
from conditions c where c.slug = 'epoc';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de la EPOC se confirma con espirometría. A diferencia del asma, en la EPOC la obstrucción es fija (no mejora completamente con broncodilatadores). El criterio diagnóstico es un cociente FEV1/FVC menor de 0,70 después de administrar un broncodilatador.",
    "La radiografía de tórax puede mostrar hiperinsuflación pulmonar (pulmones demasiado grandes y planos de tanto aire atrapado) en estadios avanzados, pero una radiografía normal no descarta la EPOC. La TAC de tórax es más sensible para detectar enfisema y para descartar otras enfermedades.",
    "El análisis de sangre puede mostrar poliglobulia (exceso de glóbulos rojos) como respuesta compensadora a la falta de oxígeno crónica. La gasometría arterial (análisis de los gases en sangre) evalúa los niveles de oxígeno y CO2 y es importante en la EPOC moderada-grave.",
    "La determinación de alfa-1 antitripsina en sangre se recomienda al menos una vez en todo paciente diagnosticado de EPOC para descartar este déficit genético, que requiere un enfoque diferente y tiene implicaciones para los familiares."
  ],
  "callout": {"label": "La espirometría tras broncodilatador", "body": "En la EPOC, el diagnóstico requiere espirometría DESPUÉS de inhalar un broncodilatador. Si el cociente FEV1/FVC es menor de 0,70 con el broncodilatador, el diagnóstico queda confirmado. Este patrón obstructivo fijo la distingue del asma."}
}'::jsonb
from conditions c where c.slug = 'epoc';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "Dejar de fumar es el tratamiento más eficaz disponible para la EPOC. Reduce la velocidad de pérdida de función pulmonar, disminuye las exacerbaciones y mejora la supervivencia. Nunca es demasiado tarde para dejar de fumar.",
    "Los broncodilatadores de larga duración son el pilar farmacológico del tratamiento de la EPOC. Se dividen en dos tipos: los LABA (formoterol, salmeterol, indacaterol) y los anticolinérgicos LAMA (tiotropio, umeclidinio, glicopirronio). Ambos relajan los músculos de los bronquios y los mantienen abiertos durante 12-24 horas. La combinación LABA+LAMA es más eficaz que cualquiera de los dos solos.",
    "Los corticoides inhalados se añaden al LABA+LAMA en pacientes con EPOC con alto riesgo de exacerbaciones o con rasgos de solapamiento con asma (eosinófilos elevados). A diferencia del asma, no son el tratamiento de primera línea en la EPOC.",
    "La rehabilitación pulmonar es una de las intervenciones con mayor impacto en la calidad de vida de la EPOC: combina ejercicio supervisado, educación y apoyo nutricional y psicológico. Mejora la capacidad de ejercicio, la disnea y reduce las hospitalizaciones. Está infrautilizada a pesar de su eficacia demostrada.",
    "El oxígeno domiciliario está indicado en pacientes con EPOC grave que tienen niveles bajos de oxígeno en sangre de forma crónica. Debe administrarse al menos 15-16 horas al día para mejorar la supervivencia. No elimina la necesidad de dejar de fumar.",
    "En casos muy seleccionados de EPOC grave con enfisema predominante, existen procedimientos de reducción del volumen pulmonar (válvulas endobronquiales o cirugía de reducción) que pueden mejorar la función pulmonar. El trasplante pulmonar es la opción final en pacientes jóvenes con EPOC muy grave."
  ],
  "callout": {"label": "Rehabilitación pulmonar: el tratamiento olvidado", "body": "La rehabilitación pulmonar tiene tanta evidencia como los medicamentos en la EPOC moderada-grave, pero la reciben solo el 1-2% de los pacientes que la necesitan. Pregunta a tu médico si puedes acceder a un programa."}
}'::jsonb
from conditions c where c.slug = 'epoc';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Vivir con EPOC implica adaptarse progresivamente, pero con el tratamiento correcto la mayoría de las personas pueden mantener una buena calidad de vida durante muchos años. La actitud activa hacia la enfermedad marca la diferencia.",
    "Si fumas, el consejo más importante que puedes recibir es: deja de fumar hoy. Existen múltiples ayudas: terapia sustitutiva con nicotina, vareniclina, bupropión, y apoyo psicológico. Tu médico puede guiarte en la estrategia de deshabituación tabáquica más adecuada para ti.",
    "El ejercicio regular mejora la tolerancia al esfuerzo y la calidad de vida en la EPOC. Caminar 30 minutos al día la mayoría de los días ya tiene un efecto significativo. El truco es empezar despacio y progresar gradualmente. El miedo a la disnea lleva a muchos pacientes a evitar el esfuerzo, lo que agrava el desacondicionamiento y la sensación de falta de aire.",
    "Las vacunas son especialmente importantes en la EPOC: la vacuna antigripal anual y la antineumocócica están recomendadas para todos los pacientes con EPOC porque las infecciones respiratorias son la principal causa de exacerbaciones.",
    "Ten un plan escrito para las exacerbaciones: qué síntomas son señal de alarma, cuándo llamar a tu médico, cuándo ir a urgencias, si tienes antibióticos y corticoides orales de rescate en casa y cuándo usarlos. Tener este plan claro reduce la gravedad de las agudizaciones."
  ]
}'::jsonb
from conditions c where c.slug = 'epoc';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu médico o neumólogo."],
  "questions": [
    "¿En qué estadio GOLD está mi EPOC actualmente?",
    "¿Estoy usando bien mis inhaladores? ¿Me puedes mostrar la técnica correcta?",
    "¿Soy candidato a rehabilitación pulmonar? ¿Cómo accedo a ella?",
    "¿Cuáles son los síntomas de una exacerbación y cuándo debo llamarte o ir a urgencias?",
    "¿Tengo que hacerme la prueba de alfa-1 antitripsina?",
    "¿Necesito oxígeno domiciliario?",
    "¿Qué vacunas debo tener al día?",
    "¿Hay ayudas para dejar de fumar que me puedas prescribir?",
    "¿Con qué frecuencia debo hacerme una espirometría de seguimiento?",
    "¿El ejercicio que hago es seguro con mi nivel de EPOC?",
    "¿Debería llevar antibióticos o corticoides de rescate en casa para las crisis?",
    "¿Cuándo se consideraría un procedimiento de reducción de volumen pulmonar o trasplante en mi caso?"
  ]
}'::jsonb
from conditions c where c.slug = 'epoc';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Global Initiative for Chronic Obstructive Lung Disease (GOLD). (2024). Global Strategy for Prevention, Diagnosis and Management of COPD. Disponible en: https://goldcopd.org",
    "Vogelmeier, C. F., Criner, G. J., Martínez, F. J., Anzueto, A., Barnes, P. J., Bourbeau, J., ... & Agustí, A. G. (2017). Global Strategy for the Diagnosis, Management, and Prevention of Chronic Obstructive Lung Disease 2017 Report. GOLD Executive Summary. American Journal of Respiratory and Critical Care Medicine, 195(5), 557-582.",
    "Wedzicha, J. A., Calverley, P. M., Albert, R. K., Anzueto, A., Criner, G. J., Hurst, J. R., ... & GOLD Scientific Committee. (2017). Prevention of COPD exacerbations: a European Respiratory Society/American Thoracic Society guideline. European Respiratory Journal, 50(3), 1602265.",
    "McCarthy, B., Casey, D., Devane, D., Murphy, K., Murphy, E., & Lacasse, Y. (2015). Pulmonary rehabilitation for chronic obstructive pulmonary disease. Cochrane Database of Systematic Reviews, (2), CD003793.",
    "Divo, M., Cote, C., de Torres, J. P., Casanova, C., Marin, J. M., Pinto-Plata, V., ... & Celli, B. R. (2012). Comorbidities and risk of mortality in patients with chronic obstructive pulmonary disease. American Journal of Respiratory and Critical Care Medicine, 186(2), 155-161.",
    "Organización Mundial de la Salud (OMS). (2023). Enfermedad pulmonar obstructiva crónica (EPOC). Disponible en: https://www.who.int/es/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)"
  ]
}'::jsonb
from conditions c where c.slug = 'epoc';

-- ============================================================
-- SECTIONS: apnea-del-sueno (55)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "La apnea del sueño es un trastorno en el que la respiración se interrumpe repetidamente durante el sueño, con episodios que duran al menos 10 segundos. Cada vez que esto ocurre, el nivel de oxígeno en sangre baja, el cerebro detecta la emergencia y despierta brevemente al cuerpo para restaurar la respiración. Este proceso se puede repetir cientos de veces por noche sin que la persona lo recuerde.",
    "El tipo más frecuente es la apnea obstructiva del sueño (AOS), que ocurre cuando los músculos de la garganta se relajan demasiado durante el sueño y el tejido blando colapsa y bloquea la vía aérea. El ronquido fuerte es el sonido que produce el aire intentando pasar por una vía parcialmente obstruida.",
    "Se estima que entre el 9 y el 38% de la población adulta tiene algún grado de apnea del sueño, y la mayoría está sin diagnosticar. Es más frecuente en hombres, en personas con sobrepeso u obesidad, y aumenta su prevalencia con la edad.",
    "Las consecuencias de no tratar la apnea del sueño van más allá del cansancio diurno: aumenta el riesgo de hipertensión arterial, arritmias cardíacas, infarto de miocardio, ictus, diabetes tipo 2 y accidentes de tráfico. Estos riesgos se reducen significativamente con el tratamiento.",
    "La Academia Americana de Medicina del Sueño (AASM) y la Sociedad Española de Sueño (SES) son los organismos de referencia para el diagnóstico y tratamiento de los trastornos del sueño, incluyendo la apnea."
  ],
  "callout": {"label": "¿La apnea del sueño es peligrosa?", "body": "Sin tratamiento, la apnea moderada-grave duplica el riesgo de hipertensión y aumenta significativamente el riesgo de infarto y accidente cerebrovascular. El tratamiento con CPAP normaliza estos riesgos al mismo nivel que la población sin apnea."}
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "El principal factor de riesgo para la apnea obstructiva del sueño es la obesidad: el exceso de grasa en el cuello y alrededor de la faringe estrecha la vía aérea. Un cuello con circunferencia mayor de 43 cm en hombres o 40 cm en mujeres es un factor de riesgo importante.",
    "Los hombres tienen el doble o triple de riesgo que las mujeres antes de la menopausia. Después de la menopausia, el riesgo en mujeres se equipara al de los hombres, lo que sugiere un papel protector de los estrógenos.",
    "Las características anatómicas de la vía aérea también influyen: mandíbula pequeña o retrasada, amígdalas grandes, paladar blando largo o úvula grande pueden predisponer a la apnea independientemente del peso corporal.",
    "Otros factores de riesgo incluyen: consumo de alcohol (relaja los músculos de la garganta), tabaquismo (inflama y estrecha la vía aérea), uso de sedantes o somníferos, congestión nasal crónica (rinitis alérgica, tabique desviado) y antecedentes familiares de apnea.",
    "La posición al dormir también importa: la apnea es peor al dormir boca arriba (decúbito supino) porque la gravedad favorece el colapso de la vía aérea. Algunos pacientes tienen apnea posicional y se benefician de dormir de lado."
  ]
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El síntoma más llamativo de la apnea del sueño suele ser observado por la pareja: ronquidos fuertes e irregulares, pausas en la respiración durante el sueño y, al reiniciarse la respiración, jadeos o resoplidos. Sin embargo, hay personas con apnea significativa que no roncan.",
    "Los síntomas que la persona siente son: somnolencia diurna excesiva (quedarse dormido leyendo, viendo la televisión o conduciendo), sensación de no haber descansado al despertar, dolores de cabeza matutinos, dificultad para concentrarse, irritabilidad, depresión o ansiedad, y necesidad de levantarse al baño varias veces por la noche (nicturia).",
    "La somnolencia diurna extrema es un síntoma particularmente peligroso: las personas con apnea no tratada tienen 2-7 veces más riesgo de accidente de tráfico. Si tienes somnolencia al volante, es crucial que consultes a tu médico de forma urgente."
  ],
  "alarms": [
    {"tone": "red", "t": "Somnolencia al conducir o en situaciones de seguridad", "d": "Es un riesgo inmediato para ti y para otros. No conduzcas hasta que el problema esté evaluado y tratado. Consulta urgente."},
    {"tone": "red", "t": "Pausas respiratorias presenciadas por otra persona", "d": "Si tu pareja o familiar observa que dejas de respirar durante el sueño durante más de 10-15 segundos, consulta a tu médico pronto."},
    {"tone": "amber", "t": "Somnolencia diurna que interfiere con el trabajo o las relaciones", "d": "Si te quedas dormido en reuniones, comidas o conversaciones, la calidad del sueño está seriamente comprometida. Consulta en las próximas semanas."},
    {"tone": "amber", "t": "Hipertensión resistente al tratamiento", "d": "La apnea es una causa frecuente de hipertensión que no responde bien a los medicamentos. Si tomas varios antihipertensivos sin controlar la presión, pide a tu médico que descarte apnea."},
    {"tone": "amber", "t": "Sudoración nocturna excesiva", "d": "Puede estar relacionada con los esfuerzos respiratorios durante la apnea. Coméntalo a tu médico."},
    {"tone": "amber", "t": "Alteraciones del ritmo cardíaco (palpitaciones nocturnas)", "d": "La apnea se asocia a arritmias cardíacas, especialmente fibrilación auricular. Merece evaluación."}
  ]
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de la apnea del sueño requiere un estudio del sueño. Existen dos modalidades: la polisomnografía completa en laboratorio de sueño (el estándar de referencia) y la poligrafía respiratoria domiciliaria (un dispositivo simplificado que se coloca el paciente en casa).",
    "La poligrafía respiratoria domiciliaria es suficiente para diagnosticar la AOS en la mayoría de los pacientes con alta sospecha clínica. Es más cómoda y accesible. El dispositivo registra durante la noche el flujo de aire, los movimientos respiratorios, la saturación de oxígeno y la posición corporal.",
    "El resultado del estudio del sueño se expresa en el Índice de Apnea-Hipopnea (IAH): número de apneas e hipopneas por hora de sueño. Un IAH de 5-14 es leve, 15-29 es moderado y mayor de 30 es grave. El tratamiento se indica según el IAH y los síntomas asociados.",
    "En la consulta, el médico puede usar cuestionarios estandarizados para evaluar la probabilidad de apnea, como el cuestionario STOP-BANG o la Escala de Somnolencia de Epworth (ESE). Estos cuestionarios ayudan a seleccionar quién necesita el estudio de sueño."
  ],
  "callout": {"label": "El Índice de Apnea-Hipopnea (IAH)", "body": "El IAH mide cuántas veces por hora se interrumpe la respiración durante el sueño. IAH mayor de 30 (grave) significa que en un sueño de 8 horas se producen más de 240 interrupciones respiratorias. Con tratamiento eficaz, el IAH puede reducirse a menos de 5."}
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento de primera línea para la apnea del sueño moderada-grave es la CPAP (del inglés Continuous Positive Airway Pressure o presión positiva continua en la vía aérea). La CPAP es un dispositivo que genera una corriente de aire a presión que mantiene la vía aérea abierta durante el sueño, como un \"férula de aire\" para la garganta.",
    "La CPAP es muy eficaz cuando se usa correctamente: elimina las apneas, normaliza la saturación de oxígeno, mejora la somnolencia diurna, reduce la presión arterial y disminuye el riesgo cardiovascular. El mayor reto es la adherencia: muchos pacientes tienen dificultades para adaptarse al dispositivo en las primeras semanas.",
    "Los dispositivos de avance mandibular (DAM) son férulas dentales que adelantan la mandíbula y la lengua durante el sueño para mantener la vía aérea abierta. Son una alternativa eficaz para la apnea leve-moderada o en pacientes que no toleran la CPAP. Los fabrica un dentista especializado.",
    "La cirugía puede estar indicada en casos seleccionados: amigdalectomía (cuando hay amígdalas muy grandes), uvulopalatofaringoplastia (para corregir tejido blando excesivo) o procedimientos de avance mandibular. La cirugía en adultos tiene resultados más variables que la CPAP.",
    "La estimulación del nervio hipogloso (sistema de implante que activa los músculos de la lengua durante el sueño) es una opción para pacientes con AOS moderada-grave que no toleran la CPAP, con resultados prometedores en estudios recientes.",
    "Las medidas no farmacológicas son importantes como complemento: perder peso (puede reducir significativamente el IAH), evitar el alcohol y sedantes especialmente en las horas previas al sueño, y dormir de lado en los pacientes con apnea posicional."
  ],
  "callout": {"label": "Adaptarse a la CPAP", "body": "La mayoría de los pacientes necesitan 2-4 semanas para adaptarse a la CPAP. Los problemas más comunes son la sequedad de la boca, el ruido o las fugas de la mascarilla. Un buen técnico y la modalidad de auto-CPAP (que ajusta la presión automáticamente) mejoran mucho la tolerancia. No abandones antes de haberlo intentado con el apoyo adecuado."}
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Con el tratamiento correcto, la apnea del sueño puede controlarse completamente: la mayoría de los pacientes que usan la CPAP de forma regular refieren una transformación en su energía, concentración y calidad de vida en las primeras semanas.",
    "La adherencia a la CPAP es el mayor reto del tratamiento. Las guías recomiendan usarla al menos 4 horas por noche en más del 70% de las noches para obtener beneficio clínico. Muchas unidades de sueño ofrecen seguimiento telefónico y descargas de datos de la CPAP para ayudar a optimizar el uso.",
    "Perder peso es la intervención con mayor potencial curativo en la apnea del sueño relacionada con obesidad: en algunos pacientes, una pérdida de peso del 10% puede reducir el IAH a la mitad. Sin embargo, la CPAP debe mantenerse hasta confirmar con un nuevo estudio que la apnea ha remitido.",
    "Si tienes apnea del sueño no tratada, debes evitar conducir hasta que el médico lo autorice. En muchos países existe obligación legal de comunicar ciertos trastornos del sueño a las autoridades de tráfico. Consulta la normativa de tu país.",
    "El alcohol empeora la apnea del sueño de forma aguda al relajar aún más los músculos de la garganta. Evita el alcohol en las 4-6 horas previas a dormir, especialmente si todavía no tienes bien controlada la apnea."
  ]
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu médico o especialista en sueño."],
  "questions": [
    "¿Qué grado de apnea tengo (leve, moderada o grave) según mi IAH?",
    "¿Necesito CPAP o soy candidato a otro tratamiento como el dispositivo de avance mandibular?",
    "¿Cómo me adapto a la CPAP? ¿Hay apoyo técnico disponible?",
    "¿Cuántas horas debo usarla cada noche para que tenga beneficio?",
    "¿Cómo sé si la CPAP está funcionando bien? ¿Se pueden revisar los datos?",
    "¿Perder peso mejoraría significativamente mi apnea?",
    "¿Puedo conducir mientras mi apnea no está tratada?",
    "¿El alcohol o los somníferos que tomo empeoran mi apnea?",
    "¿Mi apnea está relacionada con mi hipertensión o mis problemas cardíacos?",
    "¿Debo hacer seguimiento con nuevos estudios de sueño? ¿Con qué frecuencia?",
    "¿Hay alternativas a la CPAP si no puedo tolerarla?",
    "¿Mi ronquido y mi apnea podrían tratarse con cirugía en mi caso?"
  ]
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "American Academy of Sleep Medicine (AASM). (2014). International Classification of Sleep Disorders (ICSD-3). Darien, IL: American Academy of Sleep Medicine.",
    "Kapur, V. K., Auckley, D. H., Chowdhuri, S., Kuhlmann, D. C., Mehra, R., Ramar, K., & Harrod, C. G. (2017). Clinical Practice Guideline for Diagnostic Testing for Adult Obstructive Sleep Apnea. Journal of Clinical Sleep Medicine, 13(3), 479-504.",
    "Patil, S. P., Ayappa, I. A., Caples, S. M., Kimoff, R. J., Patel, S. R., & Harrod, C. G. (2019). Treatment of Adult Obstructive Sleep Apnea with Positive Airway Pressure. Journal of Clinical Sleep Medicine, 15(2), 335-343.",
    "Peppard, P. E., Young, T., Barnet, J. H., Palta, M., Hagen, E. W., & Hla, K. M. (2013). Increased prevalence of sleep-disordered breathing in adults. American Journal of Epidemiology, 177(9), 1006-1014.",
    "Marin, J. M., Carrizo, S. J., Vicente, E., & Agusti, A. G. (2005). Long-term cardiovascular outcomes in men with obstructive sleep apnoea-hypopnoea with or without treatment with continuous positive airway pressure. The Lancet, 365(9464), 1046-1053.",
    "Sociedad Española de Neumología y Cirugía Torácica (SEPAR) y Sociedad Española del Sueño (SES). (2022). Normativa sobre diagnóstico y tratamiento del síndrome de apneas-hipopneas del sueño."
  ]
}'::jsonb
from conditions c where c.slug = 'apnea-del-sueno';

-- ============================================================
-- SECTIONS: fibromialgia (56)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "La fibromialgia es un síndrome de dolor crónico y generalizado que afecta a los músculos, las articulaciones y los tejidos blandos de todo el cuerpo. Se acompaña invariablemente de fatiga intensa, sueño no reparador y, con frecuencia, problemas de concentración y memoria (lo que los pacientes llaman \"niebla mental\" o fibro-fog).",
    "La fibromialgia no es una enfermedad imaginaria ni una exageración. Tiene bases neurológicas reales: los estudios de neuroimagen muestran que el cerebro de las personas con fibromialgia procesa el dolor de forma diferente, con una sensibilización central del sistema nervioso. Esto significa que el umbral del dolor está bajado: estímulos que no deberían doler, duelen.",
    "Afecta principalmente a mujeres (80-90% de los casos), aunque también se da en hombres y niños. Se estima que afecta al 2-5% de la población general. El diagnóstico suele establecerse entre los 30 y 60 años, tras un promedio de 5 años de consultas médicas.",
    "El Colegio Americano de Reumatología (ACR) publicó criterios diagnósticos en 2010 y los revisó en 2016. A diferencia de los criterios de 1990, los nuevos criterios no requieren la exploración de puntos gatillo dolorosos, sino que se basan en la distribución del dolor y en síntomas acompañantes.",
    "La fibromialgia no causa daño en articulaciones ni en órganos, ni progresa a otra enfermedad. No es degenerativa. Con el tratamiento multidisciplinario correcto, la mayoría de los pacientes logran mejorar significativamente su calidad de vida."
  ],
  "callout": {"label": "Sensibilización central", "body": "En la fibromialgia, el sistema nervioso central amplifica las señales de dolor, como si el \"volumen del dolor\" estuviera subido de más. Por eso el tratamiento no se enfoca solo en el músculo que duele, sino en modular cómo el sistema nervioso procesa el dolor."}
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "La fibromialgia no tiene una causa única identificada. Se considera una enfermedad del procesamiento del dolor por el sistema nervioso central, probablemente causada por la combinación de predisposición genética y factores desencadenantes como el estrés físico o emocional intenso.",
    "Los factores de riesgo conocidos incluyen: ser mujer, antecedentes familiares de fibromialgia o de otras enfermedades de dolor crónico, trauma físico (como un accidente de tráfico), trauma emocional o estrés psicológico intenso, infecciones (como la enfermedad de Lyme o la COVID persistente), y la presencia de otras enfermedades de dolor crónico como artritis reumatoide o lupus.",
    "Los trastornos del sueño juegan un papel muy importante. El sueño de mala calidad (particularmente la falta de sueño profundo o fase N3) aumenta la sensibilidad al dolor. Es un círculo vicioso: el dolor perturba el sueño, y el sueño de mala calidad amplifica el dolor.",
    "Los factores psicológicos como la ansiedad, la depresión y el catastrofismo del dolor no causan la fibromialgia, pero sí pueden amplificar los síntomas y deben abordarse como parte del tratamiento integral.",
    "Existe una fuerte asociación entre la fibromialgia y el síndrome de intestino irritable, la cefalea crónica, el síndrome de vejiga hiperactiva y la disfunción temporomandibular. Todas estas condiciones comparten mecanismos de sensibilización central, por lo que no es raro que una persona las tenga simultáneamente."
  ]
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El síntoma central de la fibromialgia es el dolor musculoesquelético generalizado (que afecta a ambos lados del cuerpo, por encima y por debajo de la cintura) que persiste más de 3 meses. El dolor puede ser descrito como quemante, punzante, profundo o como si los músculos estuvieran constantemente contraídos.",
    "La fatiga es el segundo síntoma más incapacitante: no es el cansancio normal de un día largo, sino una fatiga que no mejora con el descanso y que puede aparecer desde el momento en que la persona se levanta de la cama.",
    "Otros síntomas frecuentes: sueño no reparador, rigidez matutina (similar a la artritis pero sin inflamación), dolores de cabeza, sensibilidad a la luz, al ruido y al tacto, hormigueos en manos y pies, problemas digestivos y urinarios, y alteraciones del estado de ánimo."
  ],
  "alarms": [
    {"tone": "red", "t": "Inflamación articular visible (articulaciones calientes o hinchadas)", "d": "La fibromialgia no inflama las articulaciones. Si hay inflamación visible, puede indicar artritis u otra enfermedad que requiere evaluación urgente."},
    {"tone": "red", "t": "Fiebre persistente o pérdida de peso", "d": "No son síntomas de fibromialgia. Sugieren otra enfermedad subyacente que debe descartarse."},
    {"tone": "amber", "t": "Dolor nuevo o diferente al habitual", "d": "La fibromialgia tiene un patrón relativamente constante. Un dolor nuevo, localizado o con características distintas debe evaluarse para no atribuirlo automáticamente a la fibromialgia."},
    {"tone": "amber", "t": "Empeoramiento progresivo sin causa clara", "d": "Si los síntomas empeoran mucho sin una causa identificable (estrés, mala noche), coméntalo a tu médico para descartar otra condición solapada."},
    {"tone": "amber", "t": "Entumecimiento unilateral o debilidad muscular", "d": "Si un lado del cuerpo se entumece o debilita más que el otro, no es típico de fibromialgia y requiere evaluación neurológica."}
  ]
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de la fibromialgia es clínico: se basa en los síntomas, su distribución y su duración. No existe ninguna prueba de sangre, imagen o biopsia que sea específica de la fibromialgia. Las pruebas complementarias se solicitan para descartar otras enfermedades que pueden simular o coexistir con la fibromialgia.",
    "Los criterios diagnósticos del ACR 2016 requieren: puntuación elevada en el Índice de Dolor Generalizado (IDG) y en la Escala de Severidad de Síntomas (SS), con síntomas presentes durante al menos 3 meses y que no sean mejor explicados por otra enfermedad.",
    "Los análisis de sangre típicamente pedidos para descartar otras causas incluyen: hemograma, PCR, velocidad de sedimentación, función tiroidea, vitamina D, factor reumatoide y anticuerpos ANA. En la fibromialgia pura, todos estos valores son normales.",
    "El diagnóstico de fibromialgia no excluye la posibilidad de tener otras enfermedades simultáneamente. Muchos pacientes tienen fibromialgia más artritis reumatoide, lupus u otras condiciones. En esos casos, ambas condiciones requieren tratamiento."
  ],
  "callout": {"label": "¿Por qué tarda tanto el diagnóstico?", "body": "El promedio mundial desde los primeros síntomas hasta el diagnóstico de fibromialgia es de 5 años. Esto se debe a que los análisis son normales, los síntomas son variados, y durante mucho tiempo la fibromialgia fue mal comprendida. Hoy sabemos que es real y tiene tratamiento."}
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento de la fibromialgia es multidisciplinario: ningún medicamento ni intervención por sí solos controlan la enfermedad. La combinación de ejercicio, terapia cognitivo-conductual y medicamentos tiene la mayor evidencia.",
    "El ejercicio aeróbico regular es la intervención con mejor evidencia en fibromialgia: reduce el dolor, la fatiga y mejora la calidad de vida. La clave es empezar muy despacio y progresar gradualmente, porque el inicio del ejercicio puede empeorar transitoriamente los síntomas. Actividades como caminar, natación, yoga o bicicleta son especialmente bien toleradas.",
    "La terapia cognitivo-conductual (TCC) tiene evidencia sólida para la fibromialgia: ayuda a cambiar los patrones de pensamiento relacionados con el dolor (catastrofismo) y a desarrollar estrategias de afrontamiento. No significa que el dolor sea psicológico, sino que el cerebro aprende a modular el dolor de forma diferente.",
    "Los medicamentos aprobados específicamente para la fibromialgia (en EE.UU. por la FDA) son: pregabalina (Lyrica), duloxetina (Cymbalta) y milnacipran (Savella). En muchos países también se usa el tramadol (opioide débil) o la amitriptilina en dosis bajas para mejorar el sueño y el dolor.",
    "Los antiinflamatorios (ibuprofeno, naproxeno) y los opioides potentes NO son útiles en la fibromialgia porque el dolor no tiene base inflamatoria ni responde bien a este tipo de analgésicos. Su uso crónico puede incluso agravar la sensibilización central.",
    "Otras terapias complementarias con evidencia moderada: acupuntura, balneoterapia, meditación mindfulness, tai chi y biofeedback. Pueden complementar el tratamiento principal pero no sustituirlo."
  ],
  "callout": {"label": "Ejercicio: el tratamiento más efectivo y más difícil", "body": "El ejercicio aeróbico tiene la mejor evidencia en fibromialgia, pero empezar cuando duele todo parece imposible. La clave es empezar con solo 5-10 minutos al día y aumentar muy gradualmente durante semanas. El cuerpo se adapta y el dolor mejora con la actividad, no empeora."}
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Vivir con fibromialgia requiere encontrar el equilibrio entre actividad y descanso. Tanto el exceso de actividad (que agrava el dolor) como la inactividad total (que descondiciona y amplifica la sensibilización) son perjudiciales. Este equilibrio se llama \"pacing\" o regulación de la actividad.",
    "La higiene del sueño es fundamental: acostarse y levantarse a la misma hora todos los días, evitar el café y las pantallas en las horas previas al sueño, mantener el cuarto oscuro y fresco. El sueño reparador mejora el umbral del dolor.",
    "Llevar un diario de síntomas puede ayudarte a identificar qué actividades, alimentos o situaciones empeoran tus síntomas. Muchos pacientes identifican desencadenantes específicos (cambios de temperatura, estrés, ciertos alimentos) que pueden evitarse o manejarse mejor.",
    "El apoyo emocional es importante. La fibromialgia puede ser difícil de explicar a familiares y amigos porque no tiene marcadores visibles. Los grupos de apoyo presenciales o en línea ayudan a sentirse comprendido y a compartir estrategias de manejo.",
    "Trabajar con fibromialgia es posible para muchos pacientes, aunque puede requerir adaptaciones (horarios flexibles, tareas menos físicas en los días malos, ergonomía adecuada). En España existe el reconocimiento de incapacidad laboral para los casos más graves."
  ]
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu médico o reumatólogo."],
  "questions": [
    "¿El diagnóstico de fibromialgia es definitivo o hay otras enfermedades que debemos seguir descartando?",
    "¿Qué medicamento me recomiendas como primera opción y qué esperar de él?",
    "¿Me puedes derivar a fisioterapia o a un programa de ejercicio supervisado?",
    "¿Tendría acceso a terapia cognitivo-conductual específica para el dolor crónico?",
    "¿Cuánto ejercicio debo hacer y cómo empiezo sin agravar los síntomas?",
    "¿El ibuprofeno o los antiinflamatorios que tomo a veces me sirven de algo?",
    "¿Cómo mejoro mi sueño? ¿Hay medicamentos que ayuden con el sueño en la fibromialgia?",
    "¿La fibromialgia puede empeorar con el tiempo o tener una evolución estable?",
    "¿Hay grupos de apoyo o recursos específicos para pacientes con fibromialgia?",
    "¿Mis síntomas podrían indicar otra enfermedad además de la fibromialgia?",
    "¿Puedo seguir trabajando con fibromialgia? ¿Hay opciones de adaptación laboral?",
    "¿Cuáles son los síntomas que me deben llevar a urgencias o a llamarte antes de la próxima cita?"
  ]
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Wolfe, F., Clauw, D. J., Fitzcharles, M. A., Goldenberg, D. L., Häuser, W., Katz, R. L., ... & Walitt, B. (2016). 2016 Revisions to the 2010/2011 fibromyalgia diagnostic criteria. Seminars in Arthritis and Rheumatism, 46(3), 319-329.",
    "Häuser, W., Ablin, J., Fitzcharles, M. A., Littlejohn, G., Luciano, J. V., Usui, C., & Macfarlane, G. J. (2015). Fibromyalgia. Nature Reviews Disease Primers, 1, 15022.",
    "Clauw, D. J. (2014). Fibromyalgia: a clinical review. JAMA, 311(15), 1547-1555. https://doi.org/10.1001/jama.2014.3266",
    "Macfarlane, G. J., Kronisch, C., Dean, L. E., Atzeni, F., Häuser, W., Fluß, E., ... & Jones, G. T. (2017). EULAR revised recommendations for the management of fibromyalgia. Annals of the Rheumatic Diseases, 76(2), 318-328.",
    "Busch, A. J., Webber, S. C., Richards, R. S., Bidonde, J., Schachter, C. L., Schafer, L. A., ... & Overend, T. J. (2013). Resistance exercise training for fibromyalgia. Cochrane Database of Systematic Reviews, (12), CD010884.",
    "Häuser, W., Bernardy, K., Arnold, B., Offenbächer, M., & Schiltenwolf, M. (2009). Efficacy of multicomponent treatment in fibromyalgia syndrome. Arthritis Care & Research, 61(2), 216-224."
  ]
}'::jsonb
from conditions c where c.slug = 'fibromialgia';

-- ============================================================
-- SECTIONS: artritis-reumatoide (57)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "La artritis reumatoide (AR) es una enfermedad autoinmune crónica en la que el sistema inmune, por error, ataca el revestimiento de las articulaciones (la membrana sinovial). Esta inflamación crónica no solo causa dolor y rigidez, sino que, si no se trata adecuadamente, puede destruir el cartílago y el hueso articular, causando deformidades permanentes.",
    "A diferencia de la artrosis (que es desgaste por uso), la AR es inflamación activa causada por el sistema inmune. Se puede distinguir porque en la AR las articulaciones están calientes, rojas e hinchadas (signos de inflamación), y la rigidez es peor por las mañanas (más de 30-60 minutos), mientras que en la artrosis el dolor empeora con el uso.",
    "La AR afecta a aproximadamente el 1% de la población mundial, y es 2-3 veces más frecuente en mujeres. El diagnóstico suele hacerse entre los 40 y 60 años, aunque puede aparecer a cualquier edad. Existe una forma juvenil que afecta a niños.",
    "El Colegio Americano de Reumatología (ACR) y la Liga Europea contra el Reumatismo (EULAR) publicaron criterios diagnósticos conjuntos en 2010 que guían el diagnóstico y establecen la importancia del tratamiento precoz para prevenir el daño articular.",
    "Los tratamientos disponibles hoy son significativamente mejores que hace 20 años. Con el tratamiento actual, la mayoría de los pacientes pueden alcanzar la remisión (sin actividad inflamatoria detectable) o una baja actividad de la enfermedad, preservando la función articular."
  ],
  "callout": {"label": "El objetivo es la remisión", "body": "El estándar de tratamiento actual en la AR se llama \"tratar al objetivo\" (treat-to-target): el médico y el paciente definen juntos el objetivo de remisión o baja actividad, y el tratamiento se ajusta hasta alcanzarlo. Esto ha transformado el pronóstico de la enfermedad."}
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "La AR es una enfermedad multifactorial: se produce por la combinación de predisposición genética y exposición a factores ambientales que desencadenan la respuesta autoinmune. Los genes del sistema HLA (especialmente HLA-DRB1) son los más importantes y están presentes en el 70% de los pacientes con AR seropositiva.",
    "El tabaquismo es el factor de riesgo ambiental más importante y modificable: multiplica por 2-3 el riesgo de desarrollar AR en personas con predisposición genética (especialmente la forma seropositiva con factor reumatoide y anticuerpos anti-CCP). Además, empeora la respuesta al tratamiento.",
    "Ser mujer y estar en edad fértil es un factor de riesgo significativo, probablemente relacionado con el papel de las hormonas femeninas en la regulación inmune. El embarazo frecuentemente mejora la AR, y el posparto puede desencadenar un primer brote o una recaída.",
    "Otros factores de riesgo incluyen: antecedentes familiares de AR, infecciones previas (ciertos virus y bacterias pueden desencadenar la enfermedad en personas predispuestas), y exposición a polvo de sílice o minerales en el trabajo.",
    "La microbiota oral y periodontal también parece jugar un papel: la enfermedad periodontal (piorrea) se asocia fuertemente con la AR, especialmente con la forma seropositiva, y comparten mecanismos patogénicos relacionados con la citrulinación de proteínas."
  ]
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "Los síntomas más característicos de la AR son: dolor, rigidez e inflamación de las articulaciones, especialmente las pequeñas articulaciones de las manos (nudillos y dedos, en patrón simétrico), muñecas, pies y rodillas. La rigidez matutina que dura más de 30-60 minutos después de levantarse es muy característica.",
    "La AR puede causar síntomas generales (constitucionales) además del dolor articular: fatiga intensa, fiebre baja, pérdida de peso y sensación de malestar general. Estos síntomas reflejan el estado inflamatorio sistémico.",
    "La AR también puede afectar órganos fuera de las articulaciones: los pulmones (nódulos reumatoides, fibrosis), el corazón (pericarditis, mayor riesgo cardiovascular), los ojos (epiescleritis, síndrome de Sjögren asociado) y la piel (nódulos reumatoides subcutáneos, vasculitis)."
  ],
  "alarms": [
    {"tone": "red", "t": "Articulaciones muy hinchadas y calientes con fiebre", "d": "Una articulación muy inflamada con fiebre alta puede indicar artritis séptica (infección) además de la AR. Requiere evaluación urgente para descartar infección."},
    {"tone": "red", "t": "Dolor de cuello con hormigueos en brazos o debilidad", "d": "La AR puede afectar la columna cervical (articulación atlantoaxoidea). La compresión medular es una emergencia. Acude a urgencias."},
    {"tone": "amber", "t": "Empeoramiento rápido de la función articular", "d": "Si notas que en semanas o meses tienes menos capacidad de movimiento de lo habitual, el tratamiento puede necesitar ajustarse. Consulta pronto."},
    {"tone": "amber", "t": "Ojo rojo o visión borrosa", "d": "Puede indicar epiescleritis o uveítis, manifestaciones extraarticulares de la AR. Consulta a tu médico o al oftalmólogo."},
    {"tone": "amber", "t": "Dificultad respiratoria progresiva", "d": "La AR puede causar enfermedad pulmonar intersticial. Si notas falta de aire progresiva, consulta a tu médico."},
    {"tone": "amber", "t": "Infección mientras estás en tratamiento inmunosupresor", "d": "Con tratamientos como metotrexato o biológicos, las infecciones pueden ser más graves. Fiebre alta o signos de infección deben evaluarse pronto."}
  ]
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de AR se basa en los criterios ACR/EULAR 2010, que puntúan: número y tipo de articulaciones afectadas, presencia de anticuerpos específicos (factor reumatoide y anti-CCP), marcadores de inflamación elevados (PCR, VSG) y duración de los síntomas (más o menos de 6 semanas). Una puntuación total de 6 o más establece el diagnóstico.",
    "Los anticuerpos anti-CCP (anticuerpos antipéptidos citrulinados) son los más específicos de la AR: su presencia confirma prácticamente el diagnóstico en el contexto clínico adecuado. El factor reumatoide (FR) es menos específico pero también se solicita. Cerca del 20-30% de los pacientes son seronegativos (sin estos anticuerpos) pero igualmente tienen AR.",
    "Las radiografías de manos y pies son importantes al inicio para ver si ya hay erosiones óseas (daño articular) y para comparar la evolución en el tiempo. La ecografía articular y la resonancia magnética son más sensibles para detectar sinovitis e inflamación precoces.",
    "La actividad de la enfermedad se mide con escalas estandarizadas como el DAS28 (Disease Activity Score en 28 articulaciones) que combina el número de articulaciones dolorosas e inflamadas con los marcadores de laboratorio. Esta puntuación guía los ajustes del tratamiento."
  ],
  "callout": {"label": "Anti-CCP: el anticuerpo más específico", "body": "Los anticuerpos anti-CCP tienen una especificidad del 95% para la AR: si son positivos, la probabilidad de que tengas AR es muy alta. Además, su presencia se asocia a una forma más agresiva de la enfermedad, lo que justifica un tratamiento más intensivo desde el inicio."}
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento de la AR ha cambiado radicalmente en los últimos 20 años. El principio fundamental es iniciar el tratamiento modificador de la enfermedad lo antes posible: cada semana de inflamación activa puede causar daño articular irreversible.",
    "El metotrexato es el FAME (Fármaco Antirreumático Modificador de la Enfermedad) convencional de primera elección. Se toma una vez por semana (oral o subcutánea) y requiere suplementación con ácido fólico para reducir efectos secundarios. Controles de sangre regulares son necesarios. Tarda 2-4 meses en hacer efecto completo.",
    "Si el metotrexato solo no es suficiente, se puede combinar con otros FAMEs convencionales (leflunomida, sulfasalazina, hidroxicloroquina) o escalar a FAMEs biológicos.",
    "Los biológicos anti-TNF (etanercept, adalimumab, infliximab, certolizumab, golimumab) fueron el primer gran avance. Hoy también existen biológicos con otros mecanismos: abatacept (bloqueador de la coestimulación de células T), rituximab (anti-CD20, depleción de células B) y tocilizumab (anti-IL-6).",
    "Los inhibidores de JAK (baricitinib, tofacitinib, upadacitinib, filgotinib) son medicamentos orales con eficacia similar a los biológicos, que representan la opción más reciente para la AR moderada-grave. Se toman en pastilla diaria.",
    "Los corticoides (prednisona) se usan para controlar los brotes de forma rápida o como \"puente\" mientras los FAMEs hacen efecto, pero no se recomiendan para uso crónico por sus efectos secundarios. El objetivo es reducirlos y eliminarlos en cuanto sea posible."
  ],
  "callout": {"label": "Ventana de oportunidad", "body": "Tratar la AR en los primeros 3-6 meses desde el inicio de los síntomas (la llamada \"ventana de oportunidad\") produce mejores resultados a largo plazo: más probabilidad de remisión sostenida y menos daño articular. Por eso es crucial consultar pronto ante síntomas articulares inflamatorios."}
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Con el tratamiento moderno, la mayoría de las personas con AR pueden llevar una vida activa, trabajar y mantener sus relaciones sociales. La clave es el seguimiento médico regular y ajustar el tratamiento hasta alcanzar la remisión.",
    "El ejercicio regular es beneficioso y seguro en la AR, incluyendo el ejercicio aeróbico y el de resistencia muscular. No empeora las articulaciones; al contrario, mantiene la musculatura que rodea y protege las articulaciones inflamadas. La fisioterapia puede ayudar a diseñar un programa adaptado.",
    "Dejar de fumar es especialmente importante en la AR: el tabaquismo empeora la actividad de la enfermedad, reduce la respuesta a los tratamientos (especialmente a los biológicos) y aumenta el riesgo cardiovascular ya elevado que tiene la AR.",
    "El riesgo cardiovascular en la AR es significativamente mayor que en la población general (equivalente al de la diabetes tipo 2). Controlar la tensión arterial, el colesterol, el peso y no fumar son medidas de prevención cardiovascular especialmente importantes.",
    "Si recibes tratamiento con metotrexato o biológicos, debes informar a cualquier médico que te trate (incluyendo dentistas) porque estas medicaciones pueden afectar la respuesta inmune. Ciertas vacunas vivas están contraindicadas y algunas cirugías requieren suspender temporalmente el tratamiento."
  ]
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu reumatólogo."],
  "questions": [
    "¿Cuál es el nivel de actividad de mi enfermedad según el DAS28 u otra escala?",
    "¿Tengo anti-CCP positivos? ¿Qué implica eso para mi pronóstico y tratamiento?",
    "¿Ya hay erosiones articulares en mis radiografías?",
    "¿El metotrexato es suficiente solo o necesito combinarlo con otro tratamiento?",
    "¿Cuándo estaría indicado un biológico o un inhibidor de JAK en mi caso?",
    "¿Qué análisis de sangre necesito hacer y con qué frecuencia?",
    "¿Qué vacunas debo recibir antes de iniciar el tratamiento inmunosupresor?",
    "¿Qué hago si tengo fiebre o signos de infección mientras tomo metotrexato o biológicos?",
    "¿Puedo quedarme embarazada con el tratamiento que tomo actualmente?",
    "¿Tengo mayor riesgo cardiovascular por la AR? ¿Debo hacer algo específico?",
    "¿Qué ejercicio me recomiendas? ¿Debo ver a un fisioterapeuta?",
    "¿Cuándo podría reducir el tratamiento si alcanzo la remisión?"
  ]
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Smolen, J. S., Landewé, R. B. M., Bijlsma, J. W. J., Burmester, G. R., Dougados, M., Kerschbaumer, A., ... & van der Heijde, D. (2020). EULAR recommendations for the management of rheumatoid arthritis with synthetic and biological disease-modifying antirheumatic drugs: 2019 update. Annals of the Rheumatic Diseases, 79(6), 685-699.",
    "Aletaha, D., Neogi, T., Silman, A. J., Funovits, J., Felson, D. T., Bingham III, C. O., ... & Hawker, G. (2010). 2010 Rheumatoid Arthritis Classification Criteria. Arthritis & Rheumatism, 62(9), 2569-2581.",
    "Firestein, G. S., & McInnes, I. B. (2017). Immunopathogenesis of rheumatoid arthritis. Immunity, 46(2), 183-196.",
    "Singh, J. A., Saag, K. G., Bridges Jr, S. L., Akl, E. A., Bannuru, R. R., Sullivan, M. C., ... & McAlindon, T. (2016). 2015 American College of Rheumatology Guideline for the Treatment of Rheumatoid Arthritis. Arthritis Care & Research, 68(1), 1-25.",
    "Symmons, D. P., & Gabriel, S. E. (2011). Epidemiology of CVD in rheumatic disease, with a focus on RA and SLE. Nature Reviews Rheumatology, 7(7), 399-408.",
    "Combe, B., Landewe, R., Daien, C. I., Hua, C., Aletaha, D., Álvaro-Gracia, J. M., ... & Winthrop, K. (2017). 2016 update of the EULAR recommendations for the management of early arthritis. Annals of the Rheumatic Diseases, 76(6), 948-959."
  ]
}'::jsonb
from conditions c where c.slug = 'artritis-reumatoide';

-- ============================================================
-- SECTIONS: lupus (58)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "El Lupus Eritematoso Sistémico (LES) es una enfermedad autoinmune crónica en la que el sistema inmune produce anticuerpos que atacan los propios tejidos del cuerpo. A diferencia de enfermedades autoinmunes más localizadas (como la artritis reumatoide), el lupus puede afectar prácticamente cualquier órgano: piel, articulaciones, riñones, corazón, pulmones, cerebro y células sanguíneas.",
    "Se llama \"sistémico\" precisamente porque es una enfermedad que puede afectar múltiples sistemas del cuerpo al mismo tiempo o en distintos momentos. Esta variabilidad es lo que hace que el lupus sea tan complejo y que el diagnóstico tarde una media de 5-7 años.",
    "El lupus afecta principalmente a mujeres en edad fértil (ratio mujer:hombre de 9:1), con mayor prevalencia en mujeres de origen africano, asiático e hispano. Se estima que afecta a 20-150 personas por cada 100.000 habitantes.",
    "El lupus sigue un curso crónico con períodos de actividad (brotes) y períodos de calma relativa (remisión). El objetivo del tratamiento moderno es reducir al máximo la frecuencia e intensidad de los brotes y prevenir el daño orgánico acumulado.",
    "Las guías EULAR (Liga Europea contra el Reumatismo) de 2019 han transformado el manejo del lupus, estableciendo que la hidroxicloroquina debe usarse en todos los pacientes con LES y que el objetivo es alcanzar la remisión completa o la baja actividad de la enfermedad."
  ],
  "callout": {"label": "La erupción en mariposa", "body": "Una de las manifestaciones más características del lupus es el eritema malar o \"erupción en mariposa\": una rojez simétrica que cubre las mejillas y el puente de la nariz, con forma que recuerda a las alas de una mariposa. Aparece aproximadamente en el 30-50% de los pacientes con lupus, especialmente tras la exposición al sol."}
}'::jsonb
from conditions c where c.slug = 'lupus';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "El lupus es multifactorial: resulta de la interacción entre predisposición genética, factores hormonales y desencadenantes ambientales. Ningún factor único causa el lupus.",
    "La predisposición genética es importante: el riesgo de lupus es 8-10 veces mayor si un familiar de primer grado lo tiene. Se han identificado más de 100 variantes genéticas asociadas. El porcentaje de concordancia en gemelos idénticos es de aproximadamente el 25-50%, lo que indica que los factores ambientales también son cruciales.",
    "Las hormonas femeninas (especialmente los estrógenos) tienen un papel modulador del sistema inmune que explica la predominancia femenina del lupus. Los anticonceptivos orales y el embarazo pueden influir en la actividad de la enfermedad.",
    "Los desencadenantes ambientales más conocidos incluyen: la exposición a la luz ultravioleta del sol (uno de los desencadenantes más frecuentes de brotes), ciertas infecciones virales (como el virus de Epstein-Barr), el tabaquismo, y algunos medicamentos que pueden inducir un síndrome lupus-like (procainamida, hidralazina, algunos anticonvulsivos).",
    "El estrés emocional intenso también se asocia con brotes de lupus, aunque la relación exacta es difícil de establecer. El sistema nervioso y el sistema inmune están muy interconectados."
  ]
}'::jsonb
from conditions c where c.slug = 'lupus';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El lupus es una enfermedad de «mil caras» porque puede presentarse de formas muy diferentes. Los síntomas más frecuentes son: fatiga (en el 90% de los pacientes, frecuentemente el síntoma más incapacitante), dolor articular (artritis no erosiva), erupciones cutáneas (especialmente el eritema malar que empeora con el sol), fiebre y caída del cabello.",
    "La afectación renal (nefritis lúpica) ocurre en el 40-60% de los pacientes y es una de las complicaciones más serias. Puede manifestarse como orina espumosa (proteinuria), hematuria o, en estadios avanzados, hinchazón de piernas y aumento de la presión arterial.",
    "Otras manifestaciones incluyen: serositis (inflamación de las membranas que rodean el corazón o los pulmones, que produce dolor torácico), afectación del sistema nervioso (cefaleas, convulsiones, psicosis lúpica), anemia, trombocitopenia (plaquetas bajas) y el síndrome antifosfolípido (riesgo de trombosis)."
  ],
  "alarms": [
    {"tone": "red", "t": "Orina espumosa o con sangre", "d": "Puede indicar nefritis lúpica activa. Es una urgencia reumatolólogica que requiere evaluación pronta para prevenir daño renal irreversible."},
    {"tone": "red", "t": "Dolor torácico intenso o dificultad para respirar", "d": "Puede indicar pericarditis, pleuritis o tromboembolismo pulmonar. Requiere evaluación urgente."},
    {"tone": "red", "t": "Convulsiones o confusión mental en un paciente con lupus", "d": "Puede indicar afectación neuropsiquiátrica del lupus. Es una emergencia médica."},
    {"tone": "amber", "t": "Brote cutáneo o articular tras exposición solar", "d": "El sol es el desencadenante de brotes más frecuente. Usa protección solar diaria y consulta si los síntomas empeoran significativamente."},
    {"tone": "amber", "t": "Fiebre sin foco infeccioso claro", "d": "Puede indicar brote de lupus o, si tomas inmunosupresores, una infección. Requiere evaluación médica pronta."},
    {"tone": "amber", "t": "Trombosis (coágulo) en piernas o pulmones", "d": "El lupus, especialmente cuando se asocia al síndrome antifosfolípido, aumenta el riesgo de trombosis. Un dolor o hinchazón en la pierna o dificultad respiratoria súbita requieren evaluación urgente."}
  ]
}'::jsonb
from conditions c where c.slug = 'lupus';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico de lupus se basa en los criterios de clasificación del ACR/EULAR 2019, que incluyen criterios clínicos (síntomas en distintos órganos) e inmunológicos (anticuerpos específicos). Una puntuación total de 10 o más establece el diagnóstico.",
    "Los anticuerpos ANA (anticuerpos antinucleares) son la prueba serológica de cribado más sensible del lupus: están presentes en más del 95% de los pacientes. Sin embargo, son poco específicos (también aparecen en otras enfermedades e incluso en personas sanas). Si los ANA son positivos, el médico pedirá anticuerpos más específicos.",
    "Los anticuerpos anti-ADN nativo (anti-dsDNA) y anti-Sm son los más específicos del lupus. Los anti-dsDNA además se correlacionan con la actividad de la enfermedad y con la nefritis lúpica: cuando suben, puede indicar brote; cuando bajan, indica respuesta al tratamiento.",
    "El complemento sérico (C3 y C4) son proteínas del sistema inmune que disminuyen durante los brotes de lupus porque se consumen en la reacción inmune. La combinación de anti-dsDNA alto + complemento bajo es muy sugestiva de actividad lúpica."
  ],
  "callout": {"label": "ANA positivos no es lo mismo que lupus", "body": "Los ANA están presentes en el 5-15% de la población sana en título bajo. Tener ANA positivos no significa que tengas lupus. El diagnóstico requiere además síntomas clínicos compatibles y otros anticuerpos más específicos. No te alarmes si en un análisis aparecen ANA positivos sin síntomas."}
}'::jsonb
from conditions c where c.slug = 'lupus';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "La hidroxicloroquina (Dolquine, Plaquenil) es el medicamento base de todos los pacientes con LES. Reduce los brotes, protege los riñones, mejora los lípidos y tiene un efecto antitrombótico. Es un antipalúdico con un excelente perfil de seguridad a largo plazo. Su única precaución es la toxicidad retiniana a dosis altas o uso prolongado, que se controla con revisiones oftalmológicas periódicas.",
    "Los corticoides (prednisona) son el tratamiento de rescate para controlar los brotes activos, especialmente cuando hay afectación de órganos importantes. Como en otras enfermedades autoinmunes, el objetivo es usar la dosis mínima necesaria el menor tiempo posible por sus efectos secundarios.",
    "Los inmunosupresores se usan para mantener el control de la enfermedad y reducir la dependencia de corticoides: azatioprina y mofetil micofenolato son los más usados en el lupus de moderado a grave. La ciclofosfamida se reserva para la nefritis lúpica grave y la afectación neurológica.",
    "Los biológicos han llegado al lupus más recientemente. Belimumab (Benlysta) es el primer biológico aprobado específicamente para el LES; bloquea el factor de supervivencia de las células B (BAFF/BLyS). Anifrolumab (Saphnelo), bloqueador del receptor de interferón tipo I, es una opción más reciente aprobada para lupus moderado-grave.",
    "La fotoprotección solar (protector solar SPF 50+ a diario, ropa de protección, evitar el sol en horas centrales) es una medida de prevención de brotes fundamental que todos los pacientes con lupus deben adoptar, independientemente de si tienen afectación cutánea o no.",
    "El síndrome antifosfolípido asociado al lupus requiere tratamiento anticoagulante (warfarina, heparina) si el paciente ha tenido trombosis o pérdidas fetales."
  ],
  "callout": {"label": "Hidroxicloroquina: el pilar del tratamiento", "body": "La guía EULAR 2019 recomienda que todos los pacientes con lupus tomen hidroxicloroquina de forma indefinida, salvo contraindicación. Reduce los brotes en un 50%, protege los riñones y mejora la supervivencia a largo plazo. Es uno de los medicamentos más seguros disponibles para una enfermedad autoinmune."}
}'::jsonb
from conditions c where c.slug = 'lupus';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Vivir con lupus implica aprender a reconocer las señales de brote temprano, protegerse del sol, mantener el tratamiento y hacer seguimiento médico regular. Con estas medidas, la mayoría de las personas con lupus pueden llevar una vida plena.",
    "La fotoprotección es una de las medidas más importantes en el lupus: el sol ultravioleta puede desencadenar brotes tanto cutáneos como sistémicos. Usa protector solar de amplio espectro SPF 50+ todos los días del año (también en días nublados y dentro del coche). Prefiere la ropa de protección UV a la crema en exposiciones prolongadas.",
    "El embarazo en el lupus requiere planificación y seguimiento especializado. El lupus bien controlado durante al menos 6 meses antes de concebir tiene buenas probabilidades de embarazo exitoso. Sin embargo, el embarazo puede activar la enfermedad y algunos medicamentos para el lupus están contraindicados en el embarazo. Consulta a tu reumatólogo antes de buscar embarazo.",
    "El manejo del estrés es especialmente importante en el lupus. Técnicas de reducción del estrés, ejercicio regular (adecuado a la actividad de la enfermedad) y el apoyo social son pilares del manejo integral.",
    "El seguimiento regular con tu reumatólogo (cada 3-6 meses si estás estable, más frecuentemente en brotes) es fundamental. En cada visita se revisan analíticas completas, función renal, complemento y anticuerpos para detectar actividad subclínica antes de que se manifieste como brote."
  ]
}'::jsonb
from conditions c where c.slug = 'lupus';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu próxima consulta con tu reumatólogo."],
  "questions": [
    "¿Qué órganos están afectados en mi lupus y cuál es la actividad actual de mi enfermedad?",
    "¿Tengo nefritis lúpica? ¿Necesito una biopsia renal?",
    "¿Tengo síndrome antifosfolípido? ¿Necesito anticoagulación?",
    "¿Debo tomar hidroxicloroquina de forma indefinida? ¿Cuándo tengo que hacerme el control del ojo?",
    "¿Qué tipo de protección solar me recomiendas específicamente?",
    "¿Puedo quedarme embarazada? ¿Qué medicamentos son seguros durante el embarazo?",
    "¿Cuáles son las señales de que estoy teniendo un brote y qué debo hacer?",
    "¿Con qué frecuencia debo hacerme análisis de orina para vigilar los riñones?",
    "¿El belimumab u otro biológico sería una opción para mi caso?",
    "¿Qué vacunas debo recibir? ¿Hay alguna que esté contraindicada con mi tratamiento?",
    "¿Qué ejercicio puedo hacer con el nivel de actividad que tengo ahora?",
    "¿Hay grupos de pacientes con lupus a los que me recomiendes?"
  ]
}'::jsonb
from conditions c where c.slug = 'lupus';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Fanouriakis, A., Kostopoulou, M., Alunno, A., Aringer, M., Bajema, I., Boletis, J. N., ... & Boumpas, D. T. (2019). 2019 update of the EULAR recommendations for the management of systemic lupus erythematosus. Annals of the Rheumatic Diseases, 78(6), 736-745.",
    "Aringer, M., Costenbader, K., Daikh, D., Brinks, R., Mosca, M., Ramsey-Goldman, R., ... & Johnson, S. R. (2019). 2019 European League Against Rheumatism/American College of Rheumatology Classification Criteria for Systemic Lupus Erythematosus. Arthritis & Rheumatology, 71(9), 1400-1412.",
    "Tsokos, G. C. (2011). Systemic lupus erythematosus. New England Journal of Medicine, 365(22), 2110-2121.",
    "Ugarte-Gil, M. F., Alarcon, G. S., Sánchez-Ostiz, R., & Pons-Estel, G. J. (2021). Epidemiology of systemic lupus erythematosus: impact of ancestry on disease outcomes. Nature Reviews Rheumatology, 17(5), 256-268.",
    "Morand, E. F., Furie, R., Tanaka, Y., Bruce, I. N., Askanase, A. D., Richez, C., ... & Tummala, R. (2020). Trial of anifrolumab in active systemic lupus erythematosus. New England Journal of Medicine, 382(3), 211-221.",
    "Petri, M., Orbai, A. M., Alarcón, G. S., Gordon, C., Merrill, J. T., Fortin, P. R., ... & Magder, L. S. (2012). Derivation and validation of the Systemic Lupus International Collaborating Clinics classification criteria for systemic lupus erythematosus. Arthritis & Rheumatism, 64(8), 2677-2686."
  ]
}'::jsonb
from conditions c where c.slug = 'lupus';

-- ============================================================
-- SECTIONS: cancer-de-mama (59)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "El cáncer de mama es un tumor maligno que se origina en las células de la mama, generalmente en los conductos que llevan la leche al pezón (carcinoma ductal) o en los lóbulos que producen la leche (carcinoma lobulillar). Es el cáncer más frecuente en mujeres a nivel mundial, aunque también puede afectar a hombres en menos del 1% de los casos.",
    "Aunque un diagnóstico de cáncer de mama es impactante, es importante saber que hoy es también uno de los cánceres con mejores tasas de curación. Detectado en estadios tempranos (I y II), la supervivencia a 5 años supera el 90%. Los avances en cirugía, radioterapia, quimioterapia, hormonoterapia y terapias dirigidas han transformado el pronóstico en las últimas décadas.",
    "El cáncer de mama no es una sola enfermedad: existen varios subtipos moleculares con diferentes características y tratamientos. Los más importantes son: luminal A (positivo para receptores hormonales, bajo grado), luminal B, HER2-positivo y triple negativo. El subtipo determina en gran medida el tratamiento.",
    "La American Cancer Society (ACS), la National Comprehensive Cancer Network (NCCN) y las guías del Consenso de St. Gallen son las referencias internacionales para el manejo del cáncer de mama. En España, la Sociedad Española de Oncología Médica (SEOM) publica guías adaptadas a la práctica local.",
    "El screening (detección precoz) mediante mamografía ha reducido significativamente la mortalidad por cáncer de mama. La mayoría de las guías recomiendan mamografía anual o bienal a partir de los 40-50 años, según el riesgo individual."
  ],
  "callout": {"label": "Diagnóstico temprano salva vidas", "body": "El cáncer de mama detectado en estadio I tiene una supervivencia a 5 años superior al 99%. Por eso la mamografía regular y la autoexploración son tan importantes. No esperes a tener síntomas para hacerte una revisión."}
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "El cáncer de mama es causado por mutaciones en el ADN de las células mamarias que hacen que crezcan de forma descontrolada. La mayoría de estas mutaciones son esporádicas (ocurren al azar durante la vida), pero aproximadamente el 5-10% son hereditarias.",
    "Los factores de riesgo conocidos incluyen: ser mujer, aumentar la edad (el riesgo aumenta progresivamente con la edad), antecedentes familiares de cáncer de mama u ovario (especialmente en familiares de primer grado), mutaciones en los genes BRCA1 o BRCA2, antecedentes personales de cáncer de mama o lesiones premalignas.",
    "Los factores hormonales también influyen: menarquia temprana (primera menstruación antes de los 12 años), menopausia tardía (después de los 55), no haber tenido hijos o primer embarazo después de los 30, no haber dado el pecho, y el uso prolongado de terapia hormonal sustitutiva postmenopáusica (especialmente la combinada de estrógenos + progesterona).",
    "El estilo de vida también importa: obesidad después de la menopausia, consumo de alcohol (incluso moderado: aumenta el riesgo en un 7-10% por cada copa al día), sedentarismo, y posiblemente la exposición a ciertos disruptores endocrinos ambientales.",
    "Los genes BRCA1 y BRCA2 son los más importantes en el cáncer de mama hereditario. Una mujer con mutación BRCA1 tiene un riesgo acumulado de cáncer de mama de hasta el 70% a lo largo de su vida. Si tienes varios familiares con cáncer de mama u ovario (especialmente a edades jóvenes), pregunta a tu médico sobre el estudio genético."
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El cáncer de mama en estadios tempranos frecuentemente no produce ningún síntoma, lo que refuerza la importancia de la mamografía periódica. Cuando aparecen síntomas, los más frecuentes son: nódulo o bulto en la mama o en la axila (generalmente duro, indoloro e irregular), cambios en la piel de la mama (enrojecimiento, retracción, aspecto de piel de naranja) y cambios en el pezón.",
    "El dolor de mama (mastalgia) por sí solo raramente es señal de cáncer: el cáncer de mama es usualmente indoloro en estadios precoces. Sin embargo, un bulto aunque no duela debe siempre ser evaluado.",
    "Es importante distinguir los síntomas que requieren evaluación urgente de los que pueden esperar a una cita programada. Cualquier cambio nuevo en la mama que persista más de 1-2 semanas debe ser consultado."
  ],
  "alarms": [
    {"tone": "red", "t": "Nódulo o bulto nuevo en la mama o axila", "d": "Cualquier bulto nuevo, duro o de bordes irregulares debe evaluarse. Pide cita con tu médico en los próximos días, no esperes."},
    {"tone": "red", "t": "Secreción por el pezón (especialmente si es sanguinolenta y unilateral)", "d": "La secreción espontánea sanguinolenta por un solo pezón requiere evaluación médica pronta."},
    {"tone": "red", "t": "Piel de naranja o retracción del pezón de aparición nueva", "d": "Estos cambios cutáneos en la mama requieren evaluación urgente para descartar cáncer inflamatorio de mama u otras formas localmente avanzadas."},
    {"tone": "amber", "t": "Cambio de forma o tamaño de la mama sin causa aparente", "d": "Si notas que una mama cambia de aspecto sin relación con el ciclo menstrual u otras causas claras, consulta a tu médico."},
    {"tone": "amber", "t": "Dolor localizado persistente en la mama", "d": "Aunque el dolor raramente es señal de cáncer, si es persistente (más de 3-4 semanas) y localizado en un punto fijo, merece evaluación."},
    {"tone": "amber", "t": "Ganglios en la axila palpables", "d": "Ganglios axilares que persisten más de 2-3 semanas sin infección aparente deben evaluarse."}
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El diagnóstico del cáncer de mama se basa en tres pilares: la imagen (mamografía y/o ecografía), la exploración clínica y la biopsia. Solo la biopsia puede confirmar definitivamente el diagnóstico.",
    "La mamografía digital o la tomosíntesis (mamografía 3D) son el estándar de imagen para el cribado. La ecografía mamaria es complementaria, especialmente en mujeres jóvenes con mamas densas. La resonancia magnética mamaria (RM) se usa en situaciones específicas: mamas muy densas, portadoras de BRCA, ganglios positivos con tumor no visible, etc.",
    "La biopsia con aguja gruesa (BAG) o biopsia asistida por vacío (BAV) permite obtener tejido para análisis histológico sin necesidad de cirugía. Este análisis confirma si el tumor es maligno y determina el subtipo molecular (receptores de estrógeno, progesterona, HER2, Ki67), que es fundamental para decidir el tratamiento.",
    "La estadificación (determinar el estadio del tumor) se realiza con técnicas de imagen: TAC de tórax y abdomen, gammagrafía ósea o PET-TC, para ver si el cáncer se ha extendido más allá de la mama. El estadio (I al IV) es el determinante más importante del pronóstico."
  ],
  "callout": {"label": "El informe de anatomía patológica", "body": "El informe de la biopsia incluye información clave: tipo histológico (ductal, lobulillar), grado (1, 2 o 3), receptores hormonales (RE+/RP+), HER2 (positivo/negativo) y Ki67 (índice de proliferación). Estos datos determinan qué tratamiento es más adecuado para tu tumor específico."}
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento del cáncer de mama es personalizado según el estadio, el subtipo molecular, la edad y las preferencias de la paciente. El comité multidisciplinario (cirugía, oncología, radioterapia, radiología y anatomía patológica) decide el plan de tratamiento más adecuado.",
    "La cirugía es el pilar del tratamiento en estadios localizados. Puede ser conservadora (tumorectomía o cuadrantectomía, que conserva la mama) o mastectomía (extirpación completa de la mama). La cirugía conservadora seguida de radioterapia tiene los mismos resultados que la mastectomía en la mayoría de los casos y es la opción preferida cuando es posible.",
    "La radioterapia se usa después de la cirugía conservadora para reducir el riesgo de recaída local. También puede indicarse después de la mastectomía en casos de mayor riesgo.",
    "La quimioterapia puede administrarse antes de la cirugía (neoadyuvante) para reducir el tumor y aumentar las posibilidades de cirugía conservadora, o después de la cirugía (adyuvante) para eliminar posibles células tumorales circulantes. No todos los cánceres de mama necesitan quimioterapia: el oncólogo lo decide según el subtipo y el estadio.",
    "La hormonoterapia (tamoxifeno en premenopáusicas, inhibidores de aromatasa en postmenopáusicas) se administra durante 5-10 años en los cánceres con receptores hormonales positivos. Reduce el riesgo de recaída en más del 40%.",
    "Las terapias dirigidas son el mayor avance de los últimos años. En HER2 positivo: trastuzumab (Herceptin), pertuzumab, T-DM1 y trastuzumab-deruxtecan. Para triple negativo: inmunoterapia (pembrolizumab) y conjugados anticuerpo-fármaco. Para BRCA mutado: inhibidores de PARP (olaparib, talazoparib). Cada subtipo tiene ahora tratamientos específicos muy eficaces."
  ],
  "callout": {"label": "Cirugía conservadora vs. mastectomía", "body": "En la mayoría de los casos de cáncer de mama localizado, la cirugía conservadora (tumorectomía) seguida de radioterapia tiene los mismos resultados en supervivencia que la mastectomía. Conservar la mama no implica un mayor riesgo. Habla con tu equipo médico sobre cuál es la mejor opción para tu caso."}
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Un diagnóstico de cáncer de mama es una noticia impactante, pero no tiene que paralizar tu vida. Muchas personas que han pasado por esto describen la experiencia como un antes y un después que les ayudó a priorizar lo que realmente importa. Tienes derecho a tomarte el tiempo que necesites para procesar la información.",
    "El ejercicio durante y después del tratamiento tiene beneficios demostrados: reduce la fatiga relacionada con la quimioterapia, mejora el estado de ánimo, ayuda a controlar el peso (que influye en el pronóstico) y puede reducir el riesgo de recaída. El ejercicio aeróbico moderado (30 minutos 5 días a la semana) es el objetivo, pero cualquier cantidad es mejor que nada.",
    "La fertilidad puede verse afectada por la quimioterapia en mujeres premenopáusicas. Si tienes deseos de maternidad futura, pregunta antes de iniciar el tratamiento sobre la posibilidad de preservación de fertilidad (criopreservación de óvulos o embriones).",
    "El apoyo psicológico es parte integral del tratamiento del cáncer de mama. El miedo, la ansiedad y la depresión son reacciones normales. Muchos hospitales tienen psicólogos especializados en oncología, y existen grupos de apoyo presenciales y en línea (como GEPAC, Yo también puedo u otras asociaciones en tu país) que pueden ser de gran ayuda.",
    "El seguimiento después del tratamiento incluye visitas periódicas con el oncólogo, mamografías anuales y los estudios que considere necesarios. No es necesario hacerse muchos estudios de imagen de todo el cuerpo de forma rutinaria si no hay síntomas: los estudios se piden cuando hay sospecha clínica."
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu consulta con el oncólogo o cirujano."],
  "questions": [
    "¿En qué estadio está mi cáncer y qué significa para mi pronóstico?",
    "¿Cuál es el subtipo de mi tumor (RE, RP, HER2, Ki67)? ¿Cómo influye eso en el tratamiento?",
    "¿Cuál es el plan de tratamiento propuesto y en qué orden se aplican las distintas partes?",
    "¿Podría hacerme cirugía conservadora o necesito mastectomía? ¿Puedo optar por reconstrucción?",
    "¿Necesito quimioterapia? ¿Existe alguna prueba genómica (como Oncotype DX) para ayudar a decidir?",
    "¿Cuánto tiempo durará el tratamiento en total?",
    "¿Qué efectos secundarios debo esperar y cómo se manejan?",
    "¿Puedo continuar trabajando durante el tratamiento?",
    "¿Debo hacer el estudio genético para BRCA1/BRCA2?",
    "¿El tratamiento puede afectar mi fertilidad? ¿Puedo preservar óvulos antes de empezar?",
    "¿Con qué frecuencia seré seguida después del tratamiento y qué pruebas necesitaré?",
    "¿Hay ensayos clínicos disponibles para mi tipo de tumor?"
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Harbeck, N., Penault-Llorca, F., Cortes, J., Gnant, M., Houssami, N., Poortmans, P., ... & Cardoso, F. (2019). Breast cancer. Nature Reviews Disease Primers, 5(1), 66. https://doi.org/10.1038/s41572-019-0111-2",
    "Cardoso, F., Kyriakides, S., Ohno, S., Penault-Llorca, F., Poortmans, P., Rubio, I. T., ... & ESMO Guidelines Committee. (2019). Early breast cancer: ESMO Clinical Practice Guidelines for diagnosis, treatment and follow-up. Annals of Oncology, 30(8), 1194-1220.",
    "Gradishar, W. J., Moran, M. S., Abraham, J., Aft, R., Agnese, D., Allison, K. H., ... & Kumar, R. (2022). Breast Cancer, Version 3.2022. NCCN Clinical Practice Guidelines in Oncology. Journal of the National Comprehensive Cancer Network, 20(6), 691-722.",
    "Sung, H., Ferlay, J., Siegel, R. L., Laversanne, M., Soerjomataram, I., Jemal, A., & Bray, F. (2021). Global Cancer Statistics 2020: GLOBOCAN estimates of incidence and mortality worldwide for 36 cancers in 185 countries. CA: A Cancer Journal for Clinicians, 71(3), 209-249.",
    "Burstein, H. J., Curigliano, G., Thürlimann, B., Weber, W. P., Poortmans, P., Regan, M. M., ... & Winer, E. P. (2021). Customizing local and systemic therapies for women with early breast cancer: the St. Gallen International Consensus Guidelines for treatment of early breast cancer 2021. Annals of Oncology, 32(10), 1216-1235.",
    "American Cancer Society. (2023). Breast Cancer Facts & Figures 2023-2024. Atlanta: American Cancer Society."
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-mama';

-- ============================================================
-- SECTIONS: cancer-de-prostata (60)
-- ============================================================

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 1, 'que-es', '¿Qué es?', 'BookOpen', '6 min',
'{
  "paragraphs": [
    "El cáncer de próstata es el tumor maligno más frecuente en hombres (excluyendo el cáncer de piel no melanoma). La próstata es una glándula del tamaño de una nuez ubicada debajo de la vejiga y delante del recto, que produce parte del líquido seminal. El cáncer de próstata se origina cuando las células de esta glándula comienzan a crecer de forma descontrolada.",
    "El cáncer de próstata tiene una característica que lo distingue de muchos otros cánceres: la mayoría de los casos crecen muy lentamente, durante años o décadas, sin causar síntomas ni amenazar la vida. Muchos hombres fallecen por otras causas sin saber que tenían cáncer de próstata. Por eso, una vez diagnosticado, el médico y el paciente deben evaluar juntos si el tumor necesita tratamiento inmediato o puede vigilarse.",
    "Sin embargo, existe una minoría de cánceres de próstata agresivos que crecen rápidamente y pueden diseminarse a otros órganos. La clave es distinguir cuál tipo tiene cada paciente mediante la puntuación de Gleason y el grupo de grado (Grade Group), que mide la agresividad del tumor bajo el microscopio.",
    "La National Comprehensive Cancer Network (NCCN), la European Association of Urology (EAU) y la American Urological Association (AUA) son los organismos de referencia para las guías de diagnóstico y tratamiento del cáncer de próstata.",
    "La tasa de supervivencia a 5 años para el cáncer de próstata localizado es prácticamente del 100%. Incluso en estadios avanzados, los tratamientos han mejorado enormemente: la supervivencia media en cáncer de próstata metastásico sensible a hormonas se ha duplicado en la última década."
  ],
  "callout": {"label": "No todos los cánceres de próstata son iguales", "body": "Un cáncer de próstata de bajo grado (Gleason 6, Grupo de Grado 1) crece tan lentamente que en muchos hombres mayores puede vigilarse sin tratamiento. Un cáncer de alto grado (Gleason 8-10) necesita tratamiento activo. El grupo de grado lo determina el patólogo tras la biopsia."}
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 2, 'causas', 'Causas y factores de riesgo', 'Activity', '5 min',
'{
  "paragraphs": [
    "La causa exacta del cáncer de próstata no se conoce completamente. El cáncer de próstata depende de los andrógenos (testosterona y dihidrotestosterona) para crecer: sin estas hormonas, la mayoría de los tumores de próstata no pueden desarrollarse o crecen mucho más lentamente.",
    "Los factores de riesgo más importantes son: la edad (es muy raro antes de los 40 años; el riesgo aumenta progresivamente a partir de los 50), los antecedentes familiares (tener un padre o hermano con cáncer de próstata duplica el riesgo; si son dos familiares, el riesgo se multiplica por 5-11) y el origen étnico (los hombres de origen africano tienen mayor incidencia y peor pronóstico).",
    "Las mutaciones en los genes BRCA2 (y en menor medida BRCA1) también aumentan el riesgo de cáncer de próstata agresivo. Si en tu familia hay mujeres con cáncer de mama u ovario y hombres con cáncer de próstata, puede estar indicado el estudio genético.",
    "Los factores de estilo de vida con evidencia más sólida son: la obesidad (especialmente la abdominal, que se asocia a cánceres más agresivos) y posiblemente una dieta alta en grasas animales. El sedentarismo también se asocia con mayor riesgo.",
    "Algunos estudios sugieren que una dieta rica en tomates (licopeno), soja y vegetales crucíferos puede tener un efecto protector, pero la evidencia aún no es suficiente para recomendaciones dietéticas específicas."
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 3, 'sintomas', 'Síntomas y señales de alerta', 'Activity', '5 min',
'{
  "paragraphs": [
    "El cáncer de próstata localizado (el que está confinado a la glándula) generalmente no produce síntomas. La mayoría de los casos se detectan por la elevación del PSA en análisis de sangre rutinarios, antes de que aparezca cualquier molestia.",
    "Cuando el cáncer de próstata crece y presiona la uretra (el conducto por el que sale la orina), puede producir síntomas similares a los del agrandamiento benigno de próstata (hiperplasia benigna de próstata, HBP): dificultad para iniciar la orina, flujo urinario débil o intermitente, necesidad de orinar frecuentemente (especialmente de noche) y sensación de no vaciar completamente la vejiga. Sin embargo, estos síntomas son mucho más frecuentes en la HBP benigna que en el cáncer.",
    "El cáncer de próstata avanzado o metastásico puede producir dolor óseo (especialmente en la espalda, caderas y pelvis), pérdida de peso y fatiga intensa."
  ],
  "alarms": [
    {"tone": "red", "t": "Dolor óseo persistente en espalda, caderas o pelvis", "d": "En un hombre con cáncer de próstata conocido, el dolor óseo persistente puede indicar metástasis óseas. Requiere evaluación urgente."},
    {"tone": "red", "t": "Debilidad en las piernas o pérdida de control de esfínteres", "d": "Puede indicar compresión medular por metástasis vertebrales. Es una emergencia neurológica."},
    {"tone": "amber", "t": "Sangre en la orina o en el semen", "d": "No es síntoma exclusivo del cáncer de próstata, pero requiere evaluación urológica pronta."},
    {"tone": "amber", "t": "Dolor al orinar o eyacular", "d": "Requiere evaluación urológica para determinar la causa."},
    {"tone": "amber", "t": "Elevación del PSA en seguimiento", "d": "Si estás en vigilancia activa o en seguimiento post-tratamiento y el PSA sube de forma sostenida, consulta a tu urólogo antes de la próxima cita programada."},
    {"tone": "amber", "t": "Síntomas urinarios nuevos en hombre mayor de 50 años", "d": "Aunque probablemente sean por hiperplasia benigna, siempre deben evaluarse para descartar cáncer."}
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 4, 'diagnostico', 'Cómo se diagnostica', 'ClipboardList', '4 min',
'{
  "paragraphs": [
    "El PSA (Antígeno Prostático Específico) es una proteína producida por la próstata que se mide en una prueba de sangre. Un PSA elevado puede indicar cáncer de próstata, pero también puede estar elevado por otras causas como la inflamación (prostatitis), la hiperplasia benigna de próstata o tras una biopsia o tacto rectal. El PSA solo no diagnostica el cáncer; es una señal que indica que se necesitan más estudios.",
    "La biopsia de próstata guiada por resonancia magnética (RM-biopsia) es actualmente el estándar diagnóstico. Primero se hace una RM multiparamétrica de próstata para identificar áreas sospechosas (lesiones PI-RADS 3-5), y luego se biopsian esas zonas específicas. Esto ha mejorado mucho la detección de cánceres clínicamente significativos y reducido el sobrediagnóstico.",
    "La biopsia proporciona el diagnóstico definitivo y la puntuación de Gleason (que se expresa ahora como Grupo de Grado del 1 al 5). Esta puntuación es el indicador más importante de la agresividad del tumor y guía la decisión de tratamiento.",
    "La estadificación incluye: RM pélvica para evaluar extensión local, TAC de abdomen y pelvis, y gammagrafía ósea o PET con PSMA (más moderno y preciso) para detectar metástasis. No todos los pacientes necesitan todos estos estudios: depende del PSA, el Gleason y los hallazgos clínicos."
  ],
  "callout": {"label": "RM multiparamétrica antes de la biopsia", "body": "La resonancia magnética de próstata antes de biopsiar ha cambiado el diagnóstico del cáncer de próstata. Permite identificar las áreas sospechosas y biopsiar solo esas zonas, en lugar de dar punciones al azar por toda la glándula. Las guías EAU 2023 recomiendan RM en todos los hombres con sospecha de cáncer de próstata antes de la primera biopsia."}
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 5, 'tratamientos', 'Tratamientos disponibles', 'Pill', '7 min',
'{
  "paragraphs": [
    "El tratamiento del cáncer de próstata depende fundamentalmente del estadio (localizado, localmente avanzado o metastásico), el grupo de grado (Gleason/Grade Group), el PSA y las preferencias y expectativa de vida del paciente.",
    "La vigilancia activa es el estándar para el cáncer de próstata de bajo riesgo (Grupo de Grado 1): consiste en monitorizar el tumor con PSA periódico, biopsias de seguimiento y RM sin tratamiento activo. El objetivo es evitar los efectos secundarios del tratamiento en tumores que nunca amenazarán la vida. Aproximadamente el 50% de los hombres en vigilancia activa acaban necesitando tratamiento en los 10-15 años siguientes, pero la mayoría lleva muchos años sin necesitarlo.",
    "La prostatectomía radical (extirpación quirúrgica de la próstata) es la opción de tratamiento con intención curativa más consolidada. Actualmente se realiza mayoritariamente por vía laparoscópica asistida por robot (cirugía Da Vinci). Los efectos secundarios más frecuentes son la incontinencia urinaria (la mayoría recupera el control en semanas o meses) y la disfunción eréctil (muy variable según la técnica y la edad).",
    "La radioterapia externa (IMRT, VMAT) o la braquiterapia (implante de semillas radiactivas) son alternativas a la cirugía con tasas de curación equivalentes en el cáncer localizado. La elección entre cirugía y radioterapia depende de factores clínicos y de las preferencias del paciente.",
    "El tratamiento hormonal (deprivación androgénica, ADT) mediante análogos de LHRH o antiandrógenos de nueva generación (enzalutamida, apalutamida, darolutamida) es el pilar del tratamiento del cáncer avanzado o metastásico. Aunque no es curativo en la mayoría de los casos metastásicos, puede controlar la enfermedad durante años.",
    "La quimioterapia (docetaxel, cabazitaxel) y los fármacos dirigidos (inhibidores de PARP como olaparib para mutaciones BRCA, Lutetium-177-PSMA para cáncer resistente a castración) son opciones para el cáncer resistente a la castración o metastásico de alto riesgo."
  ],
  "callout": {"label": "Vigilancia activa: una opción real", "body": "Para un cáncer de bajo riesgo (Gleason 6), la vigilancia activa tiene los mismos resultados a largo plazo que el tratamiento inmediato, con la ventaja de evitar efectos secundarios innecesarios. No significa \"no hacer nada\": hay visitas, análisis y biopsias de seguimiento planificadas. Habla con tu urólogo si eres candidato."}
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 6, 'vida-diaria', 'Vivir con la condición', 'Heart', '6 min',
'{
  "paragraphs": [
    "Un diagnóstico de cáncer de próstata, especialmente si es de bajo grado, no tiene por qué cambiar tu vida de forma drástica. Muchos hombres con cáncer de próstata de bajo riesgo en vigilancia activa llevan una vida completamente normal durante muchos años.",
    "La disfunción eréctil y la incontinencia urinaria son los efectos secundarios más frecuentes del tratamiento activo (cirugía o radioterapia). Habla con tu equipo médico sobre cómo minimizarlos y cuáles son las opciones de rehabilitación sexual y urinaria disponibles (fisioterapia de suelo pélvico, inhibidores de fosfodiesterasa-5 como el sildenafilo, etc.).",
    "El tratamiento hormonal (ADT) causa efectos secundarios como sofocos, disminución de la libido, fatiga, aumento de peso, pérdida de masa muscular y ósea, y cambios de ánimo. El ejercicio regular (especialmente el de resistencia muscular) y la toma de calcio y vitamina D son fundamentales para mitigar estos efectos.",
    "El ejercicio tiene un papel especialmente relevante en el cáncer de próstata: múltiples estudios sugieren que el ejercicio aeróbico y de resistencia regular reduce el riesgo de progresión y mejora significativamente la calidad de vida durante el tratamiento hormonal.",
    "El seguimiento post-tratamiento incluye mediciones regulares del PSA. Un PSA indetectable o en niveles muy bajos es señal de buen control. Una elevación sostenida del PSA (recidiva bioquímica) puede indicar recaída y requiere evaluación para decidir los siguientes pasos."
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 7, 'preguntas', 'Preguntas para tu médico', 'MessageCircle', '3 min',
'{
  "paragraphs": ["Lleva estas preguntas a tu consulta con el urólogo u oncólogo."],
  "questions": [
    "¿Cuál es el Grupo de Grado (Gleason) de mi tumor y qué significa para mi pronóstico?",
    "¿Soy candidato a vigilancia activa o necesito tratamiento inmediato?",
    "¿Cuáles son las opciones de tratamiento con intención curativa para mi caso: cirugía, radioterapia o braquiterapia?",
    "¿Qué efectos secundarios son más probables con cada opción de tratamiento?",
    "¿Cuáles son los efectos del tratamiento sobre la función sexual y urinaria y cómo se pueden manejar?",
    "¿El tratamiento hormonal va a ser temporal o de larga duración?",
    "¿Debo estudiarme genéticamente para BRCA u otras mutaciones?",
    "¿Con qué frecuencia debo controlar el PSA y qué valores debo vigilar?",
    "¿Qué señales me indican que el cáncer puede estar progresando?",
    "¿El ejercicio puede ayudar durante el tratamiento hormonal?",
    "¿Hay ensayos clínicos disponibles para mi tipo de cáncer de próstata?",
    "¿Cómo se decide si el cáncer ha recaído después del tratamiento y qué opciones habría?"
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';

insert into condition_sections (condition_id, "order", slug, title, icon, read_time, content)
select c.id, 8, 'fuentes', 'Referencias y fuentes', 'BookMarked', '2 min',
'{
  "paragraphs": [
    "Mottet, N., van den Bergh, R. C. N., Briers, E., Van den Broeck, T., Cumberbatch, M. G., De Santis, M., ... & Cornford, P. (2021). EAU-EANM-ESTRO-ESUR-SIOG Guidelines on Prostate Cancer — 2020 Update. Part 1: Screening, Diagnosis, and Local Treatment with Curative Intent. European Urology, 79(2), 243-262.",
    "Cornford, P., van den Bergh, R. C. N., Briers, E., Van den Broeck, T., Cumberbatch, M. G., De Santis, M., ... & Mottet, N. (2021). EAU-EANM-ESTRO-ESUR-SIOG Guidelines on Prostate Cancer. Part II—2020 Update: Treatment of Relapsing, Metastatic, and Castration-Resistant Prostate Cancer. European Urology, 79(2), 263-282.",
    "Chen, R. C., Rumble, R. B., Loblaw, D. A., Finelli, A., Ehdaie, B., Cooperberg, M. R., ... & Alibhai, S. (2016). Active Surveillance for the Management of Localized Prostate Cancer (Cancer Care Ontario Guideline): American Society of Clinical Oncology Clinical Practice Guideline Endorsement. Journal of Clinical Oncology, 34(18), 2182-2190.",
    "Siegel, R. L., Miller, K. D., Wagle, N. S., & Jemal, A. (2023). Cancer statistics, 2023. CA: A Cancer Journal for Clinicians, 73(1), 17-48.",
    "Sartor, O., de Bono, J., Chi, K. N., Fizazi, K., Herrmann, K., Rahbar, K., ... & Hofman, M. S. (2021). Lutetium-177—PSMA-617 for metastatic castration-resistant prostate cancer. New England Journal of Medicine, 385(12), 1091-1103.",
    "American Cancer Society. (2023). Prostate Cancer Facts & Figures 2023. Atlanta: American Cancer Society."
  ]
}'::jsonb
from conditions c where c.slug = 'cancer-de-prostata';