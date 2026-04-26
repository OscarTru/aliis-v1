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