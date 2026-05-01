-- Fix: "Public read by token" was USING (true) — exposed ALL consult_summaries
-- to any unauthenticated caller with the anon key. The /c/[token] page now uses
-- the service-role client which bypasses RLS, so this anon policy is not needed.
DROP POLICY IF EXISTS "Public read by token" ON consult_summaries;
