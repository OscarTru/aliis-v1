import type { SymptomLog } from './types'

export interface ThresholdAlert {
  vital: string
  value: number
  unit: string
  level: 'warning' | 'critical'
  message: string
}

// Reference ranges — pending Stephanie medical review before rollout_pct > 0
const THRESHOLDS = {
  glucose: {
    criticalLow: 70,
    criticalHigh: 200,
    warningHigh: 140,
    unit: 'mg/dL',
    name: 'Glucosa',
  },
  bp_systolic: {
    warningHigh: 130,
    criticalHigh: 180,
    unit: 'mmHg',
    name: 'Presión sistólica',
  },
  bp_diastolic: {
    warningHigh: 90,
    criticalHigh: 120,
    unit: 'mmHg',
    name: 'Presión diastólica',
  },
  heart_rate: {
    criticalLow: 35,
    criticalHigh: 180,
    unit: 'bpm',
    name: 'Frecuencia cardíaca',
  },
  temperature: {
    criticalLow: 35.5,
    criticalHigh: 38.0,
    unit: '°C',
    name: 'Temperatura',
  },
} as const

export function evaluateThresholds(logs: SymptomLog[]): ThresholdAlert[] {
  if (logs.length === 0) return []

  const alerts: ThresholdAlert[] = []
  const seen = new Set<string>()

  for (const log of logs) {
    const { glucose, bp_systolic, bp_diastolic, heart_rate, temperature } = log

    if (glucose !== null) {
      const t = THRESHOLDS.glucose
      if (glucose < t.criticalLow && !seen.has('glucose_low')) {
        alerts.push({ vital: t.name, value: glucose, unit: t.unit, level: 'critical', message: `Glucosa críticamente baja (${glucose} ${t.unit})` })
        seen.add('glucose_low')
      } else if (glucose > t.criticalHigh && !seen.has('glucose_high')) {
        alerts.push({ vital: t.name, value: glucose, unit: t.unit, level: 'critical', message: `Glucosa críticamente alta (${glucose} ${t.unit})` })
        seen.add('glucose_high')
      } else if (glucose > t.warningHigh && glucose <= t.criticalHigh && !seen.has('glucose_warn')) {
        alerts.push({ vital: t.name, value: glucose, unit: t.unit, level: 'warning', message: `Glucosa elevada (${glucose} ${t.unit})` })
        seen.add('glucose_warn')
      }
    }

    if (bp_systolic !== null) {
      const t = THRESHOLDS.bp_systolic
      if (bp_systolic >= t.criticalHigh && !seen.has('sbp_critical')) {
        alerts.push({ vital: t.name, value: bp_systolic, unit: t.unit, level: 'critical', message: `Presión sistólica en crisis hipertensiva (${bp_systolic} ${t.unit})` })
        seen.add('sbp_critical')
      } else if (bp_systolic >= t.warningHigh && bp_systolic < t.criticalHigh && !seen.has('sbp_warn')) {
        alerts.push({ vital: t.name, value: bp_systolic, unit: t.unit, level: 'warning', message: `Presión sistólica elevada (${bp_systolic} ${t.unit})` })
        seen.add('sbp_warn')
      }
    }

    if (bp_diastolic !== null) {
      const t = THRESHOLDS.bp_diastolic
      if (bp_diastolic >= t.criticalHigh && !seen.has('dbp_critical')) {
        alerts.push({ vital: t.name, value: bp_diastolic, unit: t.unit, level: 'critical', message: `Presión diastólica en crisis hipertensiva (${bp_diastolic} ${t.unit})` })
        seen.add('dbp_critical')
      } else if (bp_diastolic >= t.warningHigh && bp_diastolic < t.criticalHigh && !seen.has('dbp_warn')) {
        alerts.push({ vital: t.name, value: bp_diastolic, unit: t.unit, level: 'warning', message: `Presión diastólica elevada (${bp_diastolic} ${t.unit})` })
        seen.add('dbp_warn')
      }
    }

    if (heart_rate !== null) {
      const t = THRESHOLDS.heart_rate
      if (heart_rate < t.criticalLow && !seen.has('hr_low')) {
        alerts.push({ vital: t.name, value: heart_rate, unit: t.unit, level: 'critical', message: `Frecuencia cardíaca críticamente baja (${heart_rate} ${t.unit})` })
        seen.add('hr_low')
      } else if (heart_rate >= t.criticalHigh && !seen.has('hr_high')) {
        alerts.push({ vital: t.name, value: heart_rate, unit: t.unit, level: 'critical', message: `Frecuencia cardíaca críticamente alta (${heart_rate} ${t.unit})` })
        seen.add('hr_high')
      }
    }

    if (temperature !== null) {
      const t = THRESHOLDS.temperature
      if (temperature < t.criticalLow && !seen.has('temp_low')) {
        alerts.push({ vital: t.name, value: temperature, unit: t.unit, level: 'critical', message: `Temperatura críticamente baja (${temperature} ${t.unit})` })
        seen.add('temp_low')
      } else if (temperature >= t.criticalHigh && !seen.has('temp_high')) {
        alerts.push({ vital: t.name, value: temperature, unit: t.unit, level: 'critical', message: `Fiebre detectada (${temperature} ${t.unit})` })
        seen.add('temp_high')
      }
    }
  }

  return alerts
}

export function formatAlertsForPrompt(alerts: ThresholdAlert[]): string {
  if (alerts.length === 0) return ''
  const lines = alerts.map(a => `- [${a.level.toUpperCase()}] ${a.message}`)
  return `\nALERTAS CLÍNICAS DETECTADAS (mencionar explícitamente en el mensaje):\n${lines.join('\n')}`
}
