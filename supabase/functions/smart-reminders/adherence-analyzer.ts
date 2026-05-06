// supabase/functions/smart-reminders/adherence-analyzer.ts

export interface AnalysisResult {
  send: boolean;
  message: string;
  type: 'medication' | 'insight' | 'red_flag';
  deep_link: string;
}

export interface Treatment {
  id: string;
  name: string;
  frequency: string;
}

export interface AdherenceLog {
  date: string;
  medications_taken: string[];
}

export async function analyzeAdherence(
  treatments: Treatment[],
  adherenceLogs: AdherenceLog[],
  sentToday: string[],
  anthropicApiKey: string,
): Promise<AnalysisResult> {
  const prompt = `Eres el sistema de recordatorios inteligentes de Aliis, un acompañante de salud para pacientes crónicos.

Analiza el patrón de adherencia de los últimos 14 días y decide si enviar una notificación hoy.

Tratamientos activos: ${JSON.stringify(treatments)}
Registros de adherencia (fecha → medicamentos marcados): ${JSON.stringify(adherenceLogs)}
Notificaciones ya enviadas hoy: ${JSON.stringify(sentToday)}

Reglas:
- Solo puedes enviar 1 notificación tipo 'medication' por día
- Solo puedes enviar 1 notificación tipo 'insight' por día
- Si el usuario ha sido consistente los últimos 7 días, NO envíes medication
- Si detectas una tendencia preocupante (ej. 3+ días olvidando el mismo medicamento), envía insight
- El mensaje debe ser empático, breve (máx 80 caracteres), en español
- deep_link debe ser uno de: '/inicio', '/alertas', '/diario/registro'

Responde ÚNICAMENTE con JSON válido:
{"send": bool, "message": string, "type": "medication"|"insight"|"red_flag", "deep_link": string}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data?.content?.[0]?.text) {
    return { send: false, message: '', type: 'medication', deep_link: '/inicio' };
  }
  const text = data.content[0].text.trim();

  // Parsear JSON — si falla, no enviar push
  try {
    const result = JSON.parse(text) as AnalysisResult;
    // Validar campos requeridos
    if (typeof result.send !== 'boolean' || !result.type || !result.message) {
      return { send: false, message: '', type: 'medication', deep_link: '/inicio' };
    }
    return result;
  } catch {
    return { send: false, message: '', type: 'medication', deep_link: '/inicio' };
  }
}
