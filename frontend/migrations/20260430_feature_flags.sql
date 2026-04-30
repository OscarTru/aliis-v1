-- Feature flags table
-- Ejecutar en Supabase SQL Editor (producción)
-- Fecha: 2026-04-30

CREATE TABLE IF NOT EXISTS feature_flags (
  flag_name TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  rollout_pct INTEGER DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  user_ids UUID[] DEFAULT '{}',
  plan_restriction TEXT CHECK (plan_restriction IN ('pro', 'free') OR plan_restriction IS NULL),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Lectura pública con anon key; escritura solo con service role
CREATE POLICY "Public read feature flags"
  ON feature_flags FOR SELECT USING (true);

-- Flags iniciales (todos desactivados)
INSERT INTO feature_flags (flag_name, enabled, rollout_pct, description) VALUES
  ('medical_profiles',    false, 0, 'Perfiles médicos en onboarding y cuenta (Pro only)'),
  ('adherence_checklist', false, 0, 'Checklist de adherencia de medicamentos en diario (Pro only)'),
  ('correlation_analysis',false, 0, 'Análisis correlación síntomas/adherencia (Pro only)'),
  ('pre_consult_summary', false, 0, 'Resumen pre-consulta médica con enlace compartible (Pro only)'),
  ('capsula_tiempo',      false, 0, 'Cápsula del tiempo semanal — reflexión longitudinal'),
  ('appointment_motor',   false, 0, 'Recordatorio inteligente de citas médicas'),
  ('free_text_diary',     false, 0, 'Entrada libre en diario con extracción de síntomas por IA'),
  ('el_hilo',             false, 0, 'Narrativa longitudinal mensual generada por IA')
ON CONFLICT (flag_name) DO NOTHING;
