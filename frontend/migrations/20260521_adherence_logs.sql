-- Adherence logs: one row per medication per day per user
CREATE TABLE IF NOT EXISTS adherence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication TEXT NOT NULL,
  taken_date DATE NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, medication, taken_date)
);

ALTER TABLE adherence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own adherence logs"
  ON adherence_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS adherence_logs_user_date_idx
  ON adherence_logs(user_id, taken_date DESC);
