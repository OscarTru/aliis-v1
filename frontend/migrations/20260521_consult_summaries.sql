CREATE TABLE IF NOT EXISTS consult_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES packs(id) ON DELETE SET NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE consult_summaries ENABLE ROW LEVEL SECURITY;

-- Owner can read/delete their own summaries
CREATE POLICY "Users manage own consult summaries"
  ON consult_summaries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read by token (no auth required — for sharing with doctor)
CREATE POLICY "Public read by token"
  ON consult_summaries
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS consult_summaries_token_idx ON consult_summaries(token);
CREATE INDEX IF NOT EXISTS consult_summaries_user_idx ON consult_summaries(user_id, created_at DESC);
