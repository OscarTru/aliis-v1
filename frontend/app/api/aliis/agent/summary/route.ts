import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateAndCachePatientSummary } from '@/lib/patient-context'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Active users: with packs in the last 30 days
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const { data: activeUsers } = await supabase
    .from('packs')
    .select('user_id')
    .gte('created_at', since30)

  const userIds = [...new Set((activeUsers ?? []).map(r => r.user_id))] as string[]

  let success = 0
  let errors = 0

  for (const userId of userIds) {
    try {
      await generateAndCachePatientSummary(userId)
      success++
    } catch (e) {
      console.error(`[summary-cron] failed for ${userId}`, e)
      errors++
    }
  }

  return NextResponse.json({ success, errors, total: userIds.length })
}
