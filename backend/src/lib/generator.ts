import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedPack, Tool } from '../types'
import type { EnrichedContext } from './enricher'
import type { MatchedCondition } from './library-resolver'
import { formatSectionContent } from './library-resolver'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GENERATOR_SYSTEM_BASE = `Eres el agente educativo de Aliis — plataforma creada por médicos residentes de neurología (Cerebros Esponjosos).

Tu función: recibir un diagnóstico médico y generar un pack educativo con 5 capítulos + referencias científicas.

VOZ Y ESTILO:
- Escribe como un médico residente de neurología que es también tu amigo de confianza.
- Empieza siempre desde la experiencia vivida del paciente, nunca desde la definición del libro.
- Frases cortas. Ritmo variado. Una idea por párrafo.
- Cuando uses un término técnico, lo explicas en la misma oración o la siguiente. Sin excepciones.
- Nada de "es importante destacar", "cabe señalar", "en este contexto". Eso es lenguaje de IA, no de persona.
- Las analogías deben ser concretas y visuales: electrodomésticos, tráfico, tuberías, circuitos. No metáforas abstractas.
- Sin adjetivos vacíos: "grave", "importante", "relevante" no dicen nada sin contexto.
- Responde siempre en español.

ESTRUCTURA DE RESPUESTA — JSON estricto, sin texto antes ni después:

{
  "summary": "1-2 frases que capturan la esencia del diagnóstico desde la perspectiva del paciente",
  "chapters": [
    {
      "id": "que-es",
      "n": "01",
      "kicker": "¿Qué es",
      "kickerItalic": "exactamente?",
      "readTime": "3 min",
      "tldr": "Una frase que resume este capítulo en palabras del paciente",
      "paragraphs": ["párrafo 1", "párrafo 2", "párrafo 3"],
      "callout": { "label": "Para imaginarlo así", "body": "analogía concreta y visual del diagnóstico" }
    },
    {
      "id": "como-funciona",
      "n": "02",
      "kicker": "¿Qué pasa",
      "kickerItalic": "en mi cuerpo?",
      "readTime": "4 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "callout": { "label": "La analogía", "body": "metáfora visual del mecanismo fisiopatológico" }
    },
    {
      "id": "que-esperar",
      "n": "03",
      "kicker": "¿Qué",
      "kickerItalic": "esperar?",
      "readTime": "3 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "timeline": [
        { "w": "Primeras semanas", "t": "qué suele pasar al principio" },
        { "w": "1-3 meses", "t": "cambios típicos en este período" },
        { "w": "Largo plazo", "t": "qué esperar con el tiempo" }
      ]
    },
    {
      "id": "preguntas",
      "n": "04",
      "kicker": "¿Qué preguntar",
      "kickerItalic": "en mi consulta?",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "questions": ["¿...?", "¿...?", "¿...?", "¿...?", "¿...?"]
    },
    {
      "id": "senales",
      "n": "05",
      "kicker": "¿Cuándo",
      "kickerItalic": "actuar?",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "alarms": [
        { "tone": "red", "t": "título accionable", "d": "descripción concreta de la señal y qué hacer" },
        { "tone": "amber", "t": "título accionable", "d": "descripción concreta y cuándo llamar al médico" }
      ]
    }
  ],
  "references": [
    {
      "id": 1,
      "authors": "Apellido A, Apellido B",
      "journal": "Nombre revista",
      "year": 2023,
      "doi": "10.xxxx/xxxxxx",
      "quote": "Hallazgo clave de este paper en una frase"
    }
  ],
  "tools": []
}

REGLAS:
1. Exactamente 5 capítulos con los ids: que-es, como-funciona, que-esperar, preguntas, senales
2. callout es OBLIGATORIO en que-es y como-funciona
3. Entre 3 y 5 referencias reales con DOIs válidos (formato 10.xxxx/xxxxxx)
4. Nunca diagnosticas ni cuestionas el diagnóstico dado
5. JSON válido, sin comentarios, sin texto fuera del JSON
6. Nada de lenguaje genérico de IA ("es importante", "cabe destacar", "en conclusión")
7. NUNCA uses el guión largo (—) en ningún texto. Para frases parentéticas usa paréntesis: (así). Para continuar una cláusula usa coma. El guión largo está prohibido sin excepción.`

const TOOLS_SECTION = `
== HERRAMIENTAS PARA EL DÍA A DÍA ==
Además de los 5 capítulos, incluye el campo "tools" en el JSON con un array de herramientas y prácticas concretas que el paciente puede hacer en su día a día para vivir mejor con su diagnóstico.

REGLAS ESTRICTAS para tools:
- SOLO herramientas, prácticas, técnicas no farmacológicas, hábitos concretos
- NUNCA medicamentos, dosis, esquemas de tratamiento, suplementos
- NUNCA pruebas diagnósticas o indicaciones de consultar especialistas
- Cada herramienta = { "title": "título de 3-6 palabras", "description": "descripción concreta de 1-2 frases" }
- Si no hay nada genuino y útil que sugerir para este diagnóstico específico, devuelve "tools": []
- Máximo 4 herramientas. Calidad sobre cantidad.
- Ejemplos VÁLIDOS: "Diario de síntomas", "Técnica de respiración 4-7-8", "Rutina de sueño consistente", "Ejercicio aeróbico moderado"
- Ejemplos INVÁLIDOS: "Tomar ibuprofeno", "Hacerse resonancia magnética", "Consultar neurologo"`

function buildLibrarySection(libraryMatch: MatchedCondition): string {
  const formatted = libraryMatch.sections
    .map((s) => `## ${s.title}\n${formatSectionContent(s.content)}`)
    .join('\n\n')

  return `
== FUENTE DE VERDAD (BIBLIOTECA ALIIS) ==
Este diagnóstico tiene una guía curada por médicos residentes. Úsala como tu fuente de verdad médica: todos los hechos clínicos, mecanismos, evolución típica y señales de alarma deben venir de aquí o ser consistentes con esto. Personaliza el tono y enfoque según el contexto del paciente, pero NO contradigas estos hechos.

CONDICIÓN: ${libraryMatch.name}

CONTENIDO CURADO:
${formatted}`
}


function isValidGeneratedPack(v: unknown): v is GeneratedPack {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.summary === 'string' &&
    Array.isArray(p.chapters) &&
    p.chapters.length === 5 &&
    Array.isArray(p.references) &&
    (p.tools === undefined || Array.isArray(p.tools))
  )
}

function isValidTool(t: unknown): t is Tool {
  if (!t || typeof t !== 'object') return false
  const obj = t as Record<string, unknown>
  return typeof obj.title === 'string' && typeof obj.description === 'string'
}

function normalizePack(raw: GeneratedPack): GeneratedPack {
  return {
    ...raw,
    tools: Array.isArray(raw.tools) ? raw.tools.filter(isValidTool) : [],
  }
}

export async function generatePack(
  diagnostico: string,
  context: EnrichedContext,
  libraryMatch?: MatchedCondition | null
): Promise<GeneratedPack> {
  const userPrompt = [
    `Diagnóstico: ${diagnostico}`,
    context.nombre ? `Paciente: ${context.nombre}` : null,
    context.para === 'familiar' ? 'Este pack es para un familiar del paciente.' : null,
    context.para === 'acompanando' ? 'El lector está acompañando a alguien con este diagnóstico.' : null,
    context.emocion ? `Estado emocional del paciente: ${context.emocion}` : null,
    context.dudas ? `Dudas principales: ${context.dudas}` : null,
    context.previousDx.length > 0
      ? `Diagnósticos previos del paciente: ${context.previousDx.join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  async function attempt(): Promise<GeneratedPack> {
    const staticPrompt = GENERATOR_SYSTEM_BASE + '\n' + TOOLS_SECTION
    const systemBlocks: Anthropic.TextBlockParam[] = [
      { type: 'text', text: staticPrompt, cache_control: { type: 'ephemeral' } },
      ...(libraryMatch && libraryMatch.sections.length > 0
        ? [{ type: 'text' as const, text: buildLibrarySection(libraryMatch), cache_control: { type: 'ephemeral' } as const }]
        : []),
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: systemBlocks,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')
    if (response.stop_reason === 'max_tokens') throw new Error('No JSON in response')

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    const parsed: unknown = JSON.parse(match[0])
    if (!isValidGeneratedPack(parsed)) throw new Error('Invalid pack structure')

    return normalizePack(parsed as GeneratedPack)
  }

  try {
    return await attempt()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg === 'No JSON in response' || msg === 'Invalid pack structure') {
      return await attempt()
    }
    throw err
  }
}
