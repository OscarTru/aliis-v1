-- The original aliis_insights_user_day unique index allowed only ONE insight
-- per user per day across all types. This made the second insight insertion
-- of the day fail with 23505 — broke /api/aliis/hilo when the user already
-- had a 'daily' insight from /api/aliis/insight or the notify cron.
--
-- New constraint: one insight per (user, type) per day. So a user can have
-- one 'daily' + one 'hilo' + one 'capsula' on the same calendar day, but
-- not two of the same type.

DROP INDEX IF EXISTS aliis_insights_user_day;

CREATE UNIQUE INDEX IF NOT EXISTS aliis_insights_user_type_day
  ON aliis_insights (user_id, type, date(generated_at AT TIME ZONE 'UTC'::text));
