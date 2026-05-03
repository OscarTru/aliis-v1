import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { models } from '@/lib/ai-providers'
import { verifyCronAuth } from '@/lib/cron-auth'

// Called by Vercel Cron on the 1st of each month at 9am
export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all pro users
  const { data: proUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('plan', 'pro')

  if (!proUsers?.length) return Response.json({ processed: 0 })

  let processed = 0

  for (const { id: userId } of proUsers) {
    try {
      const [medRes, treatRes, packsRes] = await Promise.all([
        supabase.from('medical_profiles').select('condiciones_previas').eq('user_id', userId).maybeSingle(),
        supabase.from('treatments').select('name, dose, frequency').eq('user_id', userId).eq('active', true),
        supabase.from('packs').select('dx').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      ])

      const condiciones: string[] = medRes.data?.condiciones_previas ?? []
      const tratamientos = treatRes.data ?? []
      const diagnosticos: string[] = packsRes.data?.map((p: { dx: string }) => p.dx) ?? []

      if (!condiciones.length && !diagnosticos.length && !tratamientos.length) continue

      const { text } = await generateText({
        model: models.insight,
        maxOutputTokens: 600,
        system: `Eres Aliis, compañero de salud. Hablas de tú, con calidez. NUNCA diagnostiques ni recomiendes medicamentos.
Responde SOLO con JSON válido: { "items": [{ "mensaje": "...", "tipo": "dx_sin_tto|tto_sin_dx", "dx": "...", "tratamiento": "..." }] }
Máximo 3 items. Si no hay discordancias, items:[].`,
        prompt: `Diagnósticos: ${diagnosticos.join(' | ') || 'ninguno'}
Condiciones previas: ${condiciones.join(' | ') || 'ninguna'}
Tratamientos activos: ${tratamientos.map((t: { name: string; dose?: string; frequency?: string }) => `${t.name}${t.dose ? ' ' + t.dose : ''}${t.frequency === 'prn' ? ' (prn)' : ''}`).join(' | ') || 'ninguno'}`,
      })

      const cleaned = text.trim().replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      const items = Array.isArray(parsed.items) ? parsed.items : []

      await supabase.from('aliis_insights').insert({
        user_id: userId,
        content: JSON.stringify({ items }),
        data_window: { type: 'treatment_check' },
      })

      processed++
    } catch {
      // Skip failed users, continue with others
    }
  }

  return Response.json({ processed })
}
