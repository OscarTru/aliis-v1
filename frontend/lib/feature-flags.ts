import { createClient } from '@/lib/supabase'

interface FeatureFlagRow {
  enabled: boolean
  rollout_pct: number
  user_ids: string[]
  plan_restriction: string | null
}

export async function isFeatureEnabled(
  flagName: string,
  userId: string,
  userPlan: string
): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('feature_flags')
    .select('enabled, rollout_pct, user_ids, plan_restriction')
    .eq('flag_name', flagName)
    .single<FeatureFlagRow>()

  if (!data || !data.enabled) return false
  if (data.plan_restriction && userPlan !== data.plan_restriction) return false
  if (data.user_ids?.includes(userId)) return true
  if (data.rollout_pct >= 100) return true

  // Deterministic bucket: last 4 hex chars of UUID → 0-99
  const hash = parseInt(userId.replace(/-/g, '').slice(-4), 16) % 100
  return hash < data.rollout_pct
}
