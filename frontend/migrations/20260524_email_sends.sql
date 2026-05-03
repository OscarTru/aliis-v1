-- Idempotency log for transactional emails. One row per (event_source, event_id, kind).
-- Used to prevent duplicate emails when Stripe (or other webhooks) retry.
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_source TEXT NOT NULL,
  event_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_source, event_id, kind)
);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
-- No policies — service role only.
