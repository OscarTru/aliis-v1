import { createClient } from '@supabase/supabase-js'
import { verifyCronAuth } from '@/lib/cron-auth'
import { logger } from '@/lib/logger'

/**
 * Daily cleanup cron. Removes:
 *   - consult_summaries with expires_at < now
 *   - rate_limits older than 1 hour
 *   - email_sends older than 90 days
 *
 * Run from vercel.json on `0 3 * * *` (3 AM UTC daily). Privacy hygiene
 * for GDPR retention compliance.
 */
export async function GET(req: Request) {
  const authError = verifyCronAuth(req)
  if (authError) return authError

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date().toISOString()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [consultRes, rateRes, emailRes] = await Promise.all([
    supabase.from('consult_summaries').delete().lt('expires_at', now).select('id'),
    supabase.from('rate_limits').delete().lt('window_start', oneHourAgo).select('key'),
    supabase.from('email_sends').delete().lt('sent_at', ninetyDaysAgo).select('id'),
  ])

  const summary = {
    consult_summaries_deleted: consultRes.data?.length ?? 0,
    rate_limits_deleted: rateRes.data?.length ?? 0,
    email_sends_deleted: emailRes.data?.length ?? 0,
  }
  if (consultRes.error) logger.error({ err: consultRes.error }, 'cleanup consult_summaries failed')
  if (rateRes.error) logger.error({ err: rateRes.error }, 'cleanup rate_limits failed')
  if (emailRes.error) logger.error({ err: emailRes.error }, 'cleanup email_sends failed')

  logger.info(summary, 'cleanup cron complete')
  return Response.json(summary)
}
