CREATE TABLE IF NOT EXISTS llm_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  cache_creation_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS llm_usage_user_created_idx
  ON llm_usage (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS llm_usage_endpoint_created_idx
  ON llm_usage (endpoint, created_at DESC);

ALTER TABLE llm_usage ENABLE ROW LEVEL SECURITY;
-- No policies — service role only.
