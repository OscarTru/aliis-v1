import Anthropic from '@anthropic-ai/sdk'
import type { IntentClass } from '../types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CLASSIFIER_SYSTEM = `Eres un clasificador de intención para Aliis, un asistente que explica diagnósticos neurológicos.

Clasifica el input del usuario en UNA de estas categorías:

SAFE  → Es un diagnóstico médico válido que podemos explicar (ej: "epilepsia focal", "esclerosis múltiple", "migraña crónica")
DOSE  → Pregunta sobre dosis o administración de medicamentos (ej: "cuánto levetiracetam tomo")
DIAGN → Intenta obtener un diagnóstico (ej: "tengo estos síntomas, qué tengo")
EMERG → Situación de emergencia activa (ej: "estoy teniendo una convulsión", "no puedo moverme")
OOD   → Fuera del dominio médico-neurológico (ej: "explícame la fotosíntesis")

Responde ÚNICAMENTE con la palabra en mayúsculas: SAFE, DOSE, DIAGN, EMERG, o OOD.
Sin explicación. Sin puntuación. Solo la palabra.`

export async function classifyIntent(input: string): Promise<IntentClass> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    system: [{ type: 'text', text: CLASSIFIER_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: input }],
  })

  const text = response.content.find((b) => b.type === 'text')
  const raw = text?.type === 'text' ? text.text.trim().toUpperCase() : ''
  const valid: IntentClass[] = ['SAFE', 'DOSE', 'DIAGN', 'EMERG', 'OOD']
  return valid.includes(raw as IntentClass) ? (raw as IntentClass) : 'SAFE'
}
