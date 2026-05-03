import { createClient } from '@/lib/supabase'

/**
 * Returns true iff the feature flag is enabled for this user.
 *
 * Calls the SECURITY DEFINER RPC `is_feature_enabled_for` which does the
 * allowlist + rollout + plan checks server-side. The RPC never returns the
 * raw `user_ids[]` array, so the beta user list is not leaked to the client.
 *
 * userPlan is no longer needed — the RPC reads `profiles.plan` itself.
 */
export async function isFeatureEnabled(
  flagName: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('is_feature_enabled_for', {
    p_flag_name: flagName,
    p_user_id: userId,
  })
  if (error) {
    console.error('[feature-flags] RPC error:', error.message)
    return false
  }
  return data === true
}
