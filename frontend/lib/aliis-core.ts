import { createClient } from '@supabase/supabase-js'
import { anthropic, cachedSystem } from './anthropic'
import { readMemory, writeMemory } from './agent-memory'
import { evaluateThresholds } from './clinical-thresholds'
import { HAIKU_4_5 } from './ai-models'
import { readPrompt } from './prompts'
import type { AliisSignal, NotificationPriority, SignalType, SymptomLog } from './types'

const SIGNAL_TITLES: Record<SignalType, string> = {
  pattern_alert:   'Patrón que vale la pena revisar',
  red_flag:        'Aliis detectó algo',
  adherence_miss:  '¿Tomaste tus medicamentos?',
  routine_insight: 'Aliis',
  no_data:         '¿Cómo te sientes hoy?',
}

export async function runAliisCore(userId: string): Promise<AliisSignal> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)

  const [profileRes, logsRes, treatRes, prevMemory] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', userId).single(),
    supabase.from('symptom_logs').select('*').eq('user_id', userId).gte('logged_at', since30).order('logged_at', { ascending: false }).limit(500),
    supabase.from('treatments').select('name').eq('user_id', userId).eq('active', true),
    readMemory(userId, 'InsightAgent', 'observation', 7),
  ])

  const logs = (logsRes.data ?? []) as SymptomLog[]
  const treatments = treatRes.data ?? []

  // Evaluate vital sign thresholds
  const thresholdAlerts = evaluateThresholds(logs)
  const hasAlerts = thresholdAlerts.length > 0

  // Detect adherence gap (last 24h)
  let adherenceGap = false
  if (treatments.length > 0) {
    const { data: takenToday } = await supabase
      .from('adherence_logs')
      .select('medication')
      .eq('user_id', userId)
      .gte('taken_date', yesterday)
    const takenSet = new Set((takenToday ?? []).map(a => a.medication as string))
    adherenceGap = treatments.some(t => !takenSet.has(t.name))
  }

  // Detect longitudinal patterns from agent_memory
  const consecutiveAlertDays = prevMemory.filter(
    m => (m.content as { signal?: string }).signal === 'alert'
  ).length

  // Deterministic priority (no AI)
  let priority: NotificationPriority
  let type: SignalType

  if (hasAlerts && consecutiveAlertDays >= 3) {
    priority = 'critical'; type = 'pattern_alert'
  } else if (hasAlerts) {
    priority = 'high'; type = 'red_flag'
  } else if (adherenceGap) {
    priority = 'medium'; type = 'adherence_miss'
  } else if (logs.some(l => l.logged_at.slice(0, 10) === today)) {
    priority = 'low'; type = 'routine_insight'
  } else {
    priority = 'low'; type = 'no_data'
  }

  // Generate personalized body with a single Haiku call
  const userName = profileRes.data?.name ?? 'usuario'
  const systemPrompt = readPrompt('aliis-core', 'v1')
    .replace('{{USER_NAME}}', userName)
  const contextMsg = [
    hasAlerts ? `Alertas vitales: ${thresholdAlerts.map(a => `${a.vital} ${a.value} ${a.unit}`).join(', ')}` : '',
    adherenceGap ? 'Medicación sin registrar hoy' : '',
    consecutiveAlertDays > 0 ? `Días consecutivos con alertas: ${consecutiveAlertDays}` : '',
    `Tipo de señal: ${type}`,
  ].filter(Boolean).join('\n')

  const message = await anthropic.messages.create({
    model: HAIKU_4_5,
    max_tokens: 100,
    system: cachedSystem(systemPrompt),
    messages: [{ role: 'user', content: contextMsg || 'Genera un insight rutinario de salud.' }],
  })

  const insight = (message.content[0] as { type: string; text: string }).text.trim()

  // Write to agent_memory so tomorrow's AliisCore can detect patterns
  await writeMemory(userId, 'InsightAgent', 'observation', {
    date: today,
    signal: hasAlerts ? 'alert' : logs.length === 0 ? 'no_data' : 'normal',
    alertCount: thresholdAlerts.length,
  }, 90)

  return {
    priority,
    type,
    title: SIGNAL_TITLES[type],
    body: insight.slice(0, 120),
    url: type === 'adherence_miss' ? '/tratamientos' : '/diario',
    insight,
  }
}
