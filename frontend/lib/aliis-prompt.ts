import type { SymptomLog } from './types'
import { evaluateThresholds, formatAlertsForPrompt } from './clinical-thresholds'

interface AliisPromptInput {
  userName: string
  recentDiagnosis: string | null
  logs: SymptomLog[]
}

interface AliisPromptOutput {
  system: string
  userMessage: string
}

export function buildAliisPrompt({ userName, recentDiagnosis, logs }: AliisPromptInput): AliisPromptOutput {
  const system = `Eres Aliis, el agente de salud personal de esta plataforma. Tu trabajo es acompañar al usuario revisando sus registros de síntomas y signos vitales.

Reglas estrictas:
- Habla siempre de tú — conjugación en segunda persona del singular (tienes, has, te has, puedes)
- Habla en primera persona: "he notado", "esta semana vi", "me llama la atención"
- Máximo 3 oraciones. Nunca más.
- Termina siempre con una pregunta suave o recomendación leve
- Nunca diagnostiques. Si algo es preocupante: "podría valer la pena mencionárselo a tu médico en tu próxima cita"
- Usa el nombre del usuario cuando lo conoces
- Si no hay datos o patrones claros, manda un check-in cálido y simple
- Tono: como un amigo que sabe de salud — cercano, no clínico`

  const hasLogs = logs.length > 0
  const last7 = logs.filter(l => {
    const d = new Date(l.logged_at)
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  })
  const last30 = logs

  const avg = (vals: (number | null)[]): number | null => {
    const nums = vals.filter((v): v is number => v !== null)
    return nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null
  }

  const avg30 = {
    glucose: avg(last30.map(l => l.glucose)),
    bp_systolic: avg(last30.map(l => l.bp_systolic)),
    bp_diastolic: avg(last30.map(l => l.bp_diastolic)),
    heart_rate: avg(last30.map(l => l.heart_rate)),
  }

  const avg7 = {
    glucose: avg(last7.map(l => l.glucose)),
    bp_systolic: avg(last7.map(l => l.bp_systolic)),
    bp_diastolic: avg(last7.map(l => l.bp_diastolic)),
    heart_rate: avg(last7.map(l => l.heart_rate)),
  }

  const notes7 = last7.map(l => l.note).filter(Boolean) as string[]
  const notes30 = last30.map(l => l.note).filter(Boolean) as string[]

  const alerts = evaluateThresholds(logs)
  const alertsSection = formatAlertsForPrompt(alerts)

  const userMessage = `Usuario: ${userName}
Diagnóstico principal: ${recentDiagnosis ?? 'no registrado'}
Tiene registros: ${hasLogs ? 'sí' : 'no'}
Registros últimos 7 días: ${last7.length}
Registros últimos 30 días: ${last30.length}

Promedios últimos 7 días:
- Glucosa: ${avg7.glucose ?? 'sin datos'} mg/dL
- Presión: ${avg7.bp_systolic ?? 'sin datos'}/${avg7.bp_diastolic ?? 'sin datos'} mmHg
- Frecuencia cardíaca: ${avg7.heart_rate ?? 'sin datos'} bpm

Promedios últimos 30 días (referencia):
- Glucosa: ${avg30.glucose ?? 'sin datos'} mg/dL
- Presión: ${avg30.bp_systolic ?? 'sin datos'}/${avg30.bp_diastolic ?? 'sin datos'} mmHg
- Frecuencia cardíaca: ${avg30.heart_rate ?? 'sin datos'} bpm

Notas de síntomas (últimos 7 días): ${notes7.length > 0 ? notes7.join(' | ') : 'ninguna'}
Notas de síntomas (últimos 30 días): ${notes30.length > 0 ? notes30.slice(0, 10).join(' | ') : 'ninguna'}${alertsSection}

Genera un mensaje de Aliis para este usuario. Máximo 3 oraciones.`

  return { system, userMessage }
}
