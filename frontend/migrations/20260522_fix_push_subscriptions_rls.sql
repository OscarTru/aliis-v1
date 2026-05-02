-- Fix: "Service role reads subscriptions" used USING (true) which allowed any role
-- (including anon) to read all push subscription endpoints and WebCrypto keys.
-- Service role bypasses RLS anyway, so this policy is redundant and unsafe.
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role reads subscriptions" ON push_subscriptions;
