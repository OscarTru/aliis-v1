-- Fix: "Service role full access tracked symptoms" was USING (true) which allowed
-- any role (anon, authenticated) to read/write/delete every patient's symptoms.
-- Service role bypasses RLS without needing this policy.
ALTER TABLE tracked_symptoms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access tracked symptoms" ON tracked_symptoms;
