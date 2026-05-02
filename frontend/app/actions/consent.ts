'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const POLICY_VERSION = '1.0' // bump when privacy policy changes materially

/**
 * Record a consent event. Used at signup, before pack generation, and any time
 * the user toggles a consent setting.
 *
 * `kind` examples:
 *   - 'medical_data_processing' (Art. 9 GDPR)
 *   - 'marketing_emails'
 *   - 'analytics' (already handled via cookie banner)
 *
 * Stores hashed IP + UA for audit trail without retaining raw PII.
 */
export async function recordConsent(args: {
  kind: string
  granted: boolean
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  const h = await headers()
  const ipRaw =
    h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? null
  const userAgent = h.get('user-agent')?.slice(0, 200) ?? null
  const ipHash = ipRaw ? createHash('sha256').update(ipRaw).digest('hex') : null

  const { error } = await supabase.from('consents').insert({
    user_id: user.id,
    kind: args.kind,
    granted: args.granted,
    policy_version: POLICY_VERSION,
    user_agent: userAgent,
    ip_hash: ipHash,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
