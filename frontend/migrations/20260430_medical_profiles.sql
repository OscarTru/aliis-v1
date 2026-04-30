-- Medical profiles table (Pro only)
-- Fecha: 2026-04-30

CREATE TABLE IF NOT EXISTS medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicamentos TEXT[] DEFAULT '{}',
  alergias TEXT[] DEFAULT '{}',
  condiciones_previas TEXT[] DEFAULT '{}',
  edad INTEGER CHECK (edad > 0 AND edad < 150),
  sexo TEXT CHECK (sexo IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own medical profile"
  ON medical_profiles FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_medical_profiles_user ON medical_profiles(user_id);
