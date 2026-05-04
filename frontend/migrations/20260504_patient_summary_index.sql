-- frontend/migrations/20260504_patient_summary_index.sql
-- Índice para leer patient_summary rápidamente por user_id + type
create index if not exists aliis_insights_user_type
  on aliis_insights (user_id, type, generated_at desc);
