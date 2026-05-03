-- Add explicit status column to adherence_logs so the daily-close cron can
-- mark missed doses as such (instead of relying on row absence). Enables
-- longitudinal analytics: an agent can compute streaks, missed-day patterns,
-- weekday-specific drop-offs, etc. by querying both 'taken' and 'missed' rows.

ALTER TABLE adherence_logs
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'taken'
  CHECK (status IN ('taken', 'missed'));

CREATE INDEX IF NOT EXISTS adherence_logs_user_status_date_idx
  ON adherence_logs(user_id, status, taken_date DESC);
