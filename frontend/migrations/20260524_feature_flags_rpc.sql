-- Fix: "Public read feature flags" exposed user_ids[] (UUIDs of beta users).
-- 1) Restrict raw SELECT to authenticated role only (anon can't enumerate beta list).
-- 2) Provide SECURITY DEFINER RPC for safe boolean checks without leaking user_ids.

DROP POLICY IF EXISTS "Public read feature flags" ON feature_flags;

CREATE POLICY "Authenticated read feature flags"
  ON feature_flags FOR SELECT
  USING (auth.role() = 'authenticated');

-- Boolean check that does NOT leak user_ids[]. Returns true iff the flag is
-- enabled AND (user is in allowlist OR rollout_pct hit) AND plan_restriction matches.
CREATE OR REPLACE FUNCTION is_feature_enabled_for(p_flag_name TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flag feature_flags%ROWTYPE;
  v_user_plan TEXT;
  v_rollout_hit BOOLEAN;
BEGIN
  SELECT * INTO v_flag FROM feature_flags WHERE flag_name = p_flag_name;
  IF NOT FOUND OR NOT v_flag.enabled THEN
    RETURN FALSE;
  END IF;

  -- Explicit allowlist (still respects plan_restriction)
  IF p_user_id = ANY(v_flag.user_ids) THEN
    IF v_flag.plan_restriction IS NULL THEN
      RETURN TRUE;
    END IF;
    SELECT plan INTO v_user_plan FROM profiles WHERE id = p_user_id;
    RETURN v_user_plan = v_flag.plan_restriction;
  END IF;

  -- Rollout percentage by deterministic hash
  v_rollout_hit := (abs(hashtext(p_flag_name || p_user_id::text)) % 100) < v_flag.rollout_pct;
  IF NOT v_rollout_hit THEN
    RETURN FALSE;
  END IF;

  IF v_flag.plan_restriction IS NULL THEN
    RETURN TRUE;
  END IF;
  SELECT plan INTO v_user_plan FROM profiles WHERE id = p_user_id;
  RETURN v_user_plan = v_flag.plan_restriction;
END;
$$;

GRANT EXECUTE ON FUNCTION is_feature_enabled_for(TEXT, UUID) TO anon, authenticated;
