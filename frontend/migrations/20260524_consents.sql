-- Records of explicit consent given by users for special-category data processing.
-- GDPR Art. 7(1) requires the controller to demonstrate consent was given.
-- LFPDPPP Art. 9 requires explicit consent for sensitive personal data.
-- Ley 1581 Art. 9 requires prior, express, and informed consent.

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                    -- e.g. 'medical_data_processing', 'marketing'
  granted BOOLEAN NOT NULL,              -- true = consent given, false = revoked
  policy_version TEXT,                   -- e.g. '1.0' from privacy policy footer
  user_agent TEXT,                       -- browser UA at the time of recording
  ip_hash TEXT,                          -- sha256 of IP for audit (not raw IP)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS consents_user_kind_created_idx
  ON consents (user_id, kind, created_at DESC);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Users can read their own consent history (transparency)
CREATE POLICY "Users see own consents"
  ON consents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consent records (when they tick a checkbox)
CREATE POLICY "Users record own consents"
  ON consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);
