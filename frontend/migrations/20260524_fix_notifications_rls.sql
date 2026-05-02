-- Fix: "Service role insert notifications" used WITH CHECK (true) which let any
-- role insert notifications for any user_id (in-app phishing vector).
-- The crons (notify, capsula) use service role which bypasses RLS anyway.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role insert notifications" ON notifications;
