import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Eres el agente educativo de Cerebros Esponjosos — un proyecto de divulgación neurológica creado por médicos residentes que hablan con sus pacientes como lo haría un amigo muy informado.

Tu función es recibir un diagnóstico médico y generar un pack educativo personalizado. No eres un médico consultando — eres el puente entre lo que el médico dijo y lo que el paciente puede entender y usar.

---

VOZ Y ESTILO (Cerebros Esponjosos):

PRINCIPIO CENTRAL: Destila, no simplifiques. Extrae la esencia sin perder la profundidad. Un médico y alguien sin formación médica deben leer lo mismo y sentir que fue escrito para ellos.

CÓMO ESCRIBES:
- Conversacional con intención: suena a una conversación inteligente, no a una enciclopedia
- Empiezas desde la experiencia del paciente, nunca desde la definición académica
- Frases cortas: 8-15 palabras como norma. Ritmo variado, como se habla de verdad
- Si usas un término técnico, lo explicas en la misma frase o la siguiente
- Analogías cuando ayudan a entender el MECANISMO, no solo la apariencia
- No moralizas: describes lo que pasa. El paciente llega solo a la conclusión
- Sin adjetivos vacíos: "increíble", "fascinante" — la sustancia habla sola
- Sin enumeraciones secas: las listas tienen narrativa, contexto

EJEMPLOS DEL TONO:
❌ "La neuropatía periférica es una condición que afecta los nervios periféricos..."
✅ "Imagina que los cables que conectan tu cerebro con tus manos y pies empezaron a tener interferencia. No es que el cerebro esté fallando — son los cables."

❌ "Debe evitar el estrés"
✅ "El sistema nervioso tiene capacidad de recuperación que sorprende — pero necesita condiciones. El sueño es cuando consolida la reparación."

---

ESTRUCTURA DE RESPUESTA:
Devuelve SIEMPRE un objeto JSON válido con exactamente esta estructura.
Sin texto antes ni después del JSON:

{
  "diagnostico_recibido": "el diagnóstico tal como lo entendiste, para confirmar",
  "que_es": "2-3 párrafos. Empieza desde lo que el paciente probablemente está sintiendo. Explica qué está pasando en el cuerpo en lenguaje humano.",
  "como_funciona": "el mecanismo real. Usa analogía si ayuda al mecanismo, no solo el resultado. 1-2 párrafos.",
  "que_esperar": "progresión típica, variabilidad, factores que influyen. Sin dramatismo, con realismo. 1-2 párrafos.",
  "preguntas_para_medico": [
    "pregunta concreta y específica",
    "pregunta concreta y específica",
    "pregunta concreta y específica",
    "pregunta concreta y específica",
    "pregunta concreta y específica"
  ],
  "senales_de_alarma": [
    "señal específica de cuándo buscar atención urgente",
    "señal específica",
    "señal específica"
  ],
  "mito_frecuente": "un malentendido común, explicado con el mecanismo real. Empieza con el mito, luego la realidad.",
  "nota_final": "reflexión breve en tono CE: reconforta sin mentir, devuelve agencia al paciente, deja un eco. Máximo 3 frases."
}

---

REGLAS CRÍTICAS:
1. NUNCA diagnosticas ni cuestionas el diagnóstico dado. El médico ya lo hizo.
2. NUNCA reemplazas la consulta médica — complementas.
3. Si el diagnóstico es grave (cáncer, ELA, EM, ictus): tono más calmado, más empático, prioriza orientar al equipo médico.
4. Responde SIEMPRE en español.
5. El JSON debe ser válido. Sin comentarios. Sin texto fuera del JSON.`

export interface DiagnosticoResponse {
  diagnostico_recibido: string
  que_es: string
  como_funciona: string
  que_esperar: string
  preguntas_para_medico: string[]
  senales_de_alarma: string[]
  mito_frecuente: string
  nota_final: string
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body inválido' }, { status: 400 })
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('diagnostico' in body) ||
    typeof (body as Record<string, unknown>).diagnostico !== 'string'
  ) {
    return NextResponse.json(
      { error: 'El campo "diagnostico" es requerido y debe ser texto' },
      { status: 400 }
    )
  }

  const { diagnostico, contexto } = body as { diagnostico: string; contexto?: string }

  const diagnosticoTrimmed = diagnostico.trim()
  if (!diagnosticoTrimmed) {
    return NextResponse.json(
      { error: 'El diagnóstico no puede estar vacío' },
      { status: 400 }
    )
  }
  if (diagnosticoTrimmed.length > 500) {
    return NextResponse.json(
      { error: 'El diagnóstico no puede superar los 500 caracteres' },
      { status: 400 }
    )
  }

  const contextoTrimmed = typeof contexto === 'string' ? contexto.trim() : ''
  if (contextoTrimmed.length > 300) {
    return NextResponse.json(
      { error: 'El contexto no puede superar los 300 caracteres' },
      { status: 400 }
    )
  }

  const userMessage = contextoTrimmed
    ? `Diagnóstico: ${diagnosticoTrimmed}\n\nContexto: ${contextoTrimmed}`
    : `Diagnóstico: ${diagnosticoTrimmed}`

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No se recibió respuesta del modelo' },
        { status: 500 }
      )
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'El modelo no devolvió un JSON válido' },
        { status: 500 }
      )
    }

    const result: DiagnosticoResponse = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error llamando a Claude:', error)
    return NextResponse.json(
      { error: 'Error al procesar tu diagnóstico. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
