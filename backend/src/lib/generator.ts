import Anthropic from '@anthropic-ai/sdk'
import type { GeneratedPack } from '../types'
import type { EnrichedContext } from './enricher'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GENERATOR_SYSTEM = `Eres el agente educativo de Aliis — plataforma creada por médicos residentes de neurología (Cerebros Esponjosos).

Tu función: recibir un diagnóstico médico y generar un pack educativo con 5 capítulos + referencias científicas.

VOZ Y ESTILO:
- Destila, no simplifiques. La esencia sin perder profundidad.
- Conversacional con intención: como un amigo médico muy informado.
- Empiezas desde la experiencia del paciente, nunca desde la definición académica.
- Frases cortas (8-15 palabras como norma). Ritmo variado.
- Si usas término técnico, lo explicas en la misma frase o la siguiente.
- Sin adjetivos vacíos. Sin enumeraciones secas.
- Responde siempre en español.

ESTRUCTURA DE RESPUESTA — JSON estricto, sin texto antes ni después:

{
  "summary": "1-2 frases que capturan la esencia del diagnóstico para el paciente",
  "chapters": [
    {
      "id": "que-es",
      "n": "01",
      "kicker": "Qué es",
      "kickerItalic": "exactamente",
      "readTime": "3 min",
      "tldr": "Una frase que resume este capítulo",
      "paragraphs": ["párrafo 1", "párrafo 2", "párrafo 3"]
    },
    {
      "id": "como-funciona",
      "n": "02",
      "kicker": "Cómo",
      "kickerItalic": "funciona",
      "readTime": "4 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "callout": { "label": "Para entenderlo así", "body": "analogía clara del mecanismo" }
    },
    {
      "id": "que-esperar",
      "n": "03",
      "kicker": "Qué",
      "kickerItalic": "esperar",
      "readTime": "3 min",
      "tldr": "Una frase resumen",
      "paragraphs": ["..."],
      "timeline": [
        { "w": "Primeras semanas", "t": "descripción breve" },
        { "w": "1-3 meses", "t": "descripción breve" }
      ]
    },
    {
      "id": "preguntas",
      "n": "04",
      "kicker": "Preguntas para",
      "kickerItalic": "tu médico",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "questions": ["¿...?", "¿...?", "¿...?", "¿...?", "¿...?"]
    },
    {
      "id": "senales",
      "n": "05",
      "kicker": "Señales de",
      "kickerItalic": "alarma",
      "readTime": "2 min",
      "tldr": "Una frase resumen",
      "alarms": [
        { "tone": "red", "t": "título señal urgente", "d": "descripción" },
        { "tone": "amber", "t": "título señal moderada", "d": "descripción" }
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
  ]
}

REGLAS:
1. Exactamente 5 capítulos con los ids: que-es, como-funciona, que-esperar, preguntas, senales
2. Entre 3 y 5 referencias reales con DOIs válidos (formato 10.xxxx/xxxxxx)
3. Nunca diagnosticas ni cuestionas el diagnóstico dado
4. JSON válido, sin comentarios, sin texto fuera del JSON`

function isValidGeneratedPack(v: unknown): v is GeneratedPack {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.summary === 'string' &&
    Array.isArray(p.chapters) &&
    p.chapters.length === 5 &&
    Array.isArray(p.references)
  )
}

export async function generatePack(
  diagnostico: string,
  context: EnrichedContext
): Promise<GeneratedPack> {
  const userPrompt = [
    `Diagnóstico: ${diagnostico}`,
    context.nombre ? `Paciente: ${context.nombre}` : null,
    context.para === 'familiar' ? 'Este pack es para un familiar del paciente.' : null,
    context.frecuencia ? `Frecuencia: ${context.frecuencia}` : null,
    context.dudas ? `Dudas principales: ${context.dudas}` : null,
    context.previousDx.length > 0
      ? `Diagnósticos previos del paciente: ${context.previousDx.join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  async function attempt(): Promise<GeneratedPack> {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      temperature: 0 as number,
      system: [{ type: 'text', text: GENERATOR_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    const parsed: unknown = JSON.parse(match[0])
    if (!isValidGeneratedPack(parsed)) throw new Error('Invalid pack structure')

    return parsed
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
