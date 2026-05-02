import { generateText } from 'ai'
import { models } from './ai-providers'
import type { IntentClass } from '../types'

const CLASSIFIER_SYSTEM = `Eres un clasificador de intención para Aliis, un asistente que explica diagnósticos médicos al paciente en lenguaje accesible. Cubrimos múltiples especialidades: neurología, cardiología, endocrinología, digestivo, respiratorio, autoinmune, oncología, psiquiatría y más.

Clasifica el input del usuario en UNA de estas categorías:

SAFE  → Es un diagnóstico médico válido que podemos explicar. Ejemplos: "diabetes tipo 2", "epilepsia focal", "hipertensión", "asma", "migraña crónica", "lupus", "Crohn", "depresión mayor", "cáncer de mama", "esclerosis múltiple". Cualquier condición médica legítima entra aquí.
DOSE  → Pregunta sobre dosis o administración de medicamentos (ej: "cuánto ibuprofeno tomo", "puedo doblar la dosis de levetiracetam").
DIAGN → El usuario describe síntomas y pide un diagnóstico (ej: "me duele el pecho qué tengo", "tengo estos síntomas qué será"). NO es un diagnóstico ya hecho — pide uno nuevo.
EMERG → Emergencia médica activa en curso (ej: "estoy teniendo una convulsión", "no puedo respirar", "dolor en el pecho ahora").
OOD   → No tiene NADA que ver con salud (ej: "explícame la fotosíntesis", "cómo cocinar pasta", "qué hora es"). Si tiene cualquier relación con salud, NO es OOD.

Responde ÚNICAMENTE con la palabra en mayúsculas: SAFE, DOSE, DIAGN, EMERG, o OOD.
Sin explicación. Sin puntuación. Solo la palabra.`

export async function classifyIntent(input: string): Promise<IntentClass> {
  const { text } = await generateText({
    model: models.classifier,
    system: CLASSIFIER_SYSTEM,
    messages: [{ role: 'user', content: input }],
    maxOutputTokens: 10,
    temperature: 0,
  })

  const raw = text.trim().toUpperCase()
  const valid: IntentClass[] = ['SAFE', 'DOSE', 'DIAGN', 'EMERG', 'OOD']
  return valid.includes(raw as IntentClass) ? (raw as IntentClass) : 'SAFE'
}
