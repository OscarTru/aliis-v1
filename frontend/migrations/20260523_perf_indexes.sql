-- Performance indexes for cron-route queries.
-- All indexes are concurrent-safe and idempotent (IF NOT EXISTS).

-- symptom_logs: notify and capsula crons filter by user_id + logged_at range.
CREATE INDEX IF NOT EXISTS symptom_logs_user_logged_idx
  ON symptom_logs (user_id, logged_at DESC);

-- aliis_insights: capsula checks "already generated this month" by (user_id, type, generated_at).
-- Existing index is on (user_id, date(generated_at)) and doesn't cover the type filter.
CREATE INDEX IF NOT EXISTS aliis_insights_user_type_generated_idx
  ON aliis_insights (user_id, type, generated_at DESC);

-- notifications: notify cron checks "already sent insight today" by (user_id, type, created_at).
-- Existing index is on (user_id, created_at desc); add type to the leading key.
CREATE INDEX IF NOT EXISTS notifications_user_type_created_idx
  ON notifications (user_id, type, created_at DESC);
