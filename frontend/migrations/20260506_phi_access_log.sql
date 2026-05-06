-- Audit log de accesos a PHI (Protected Health Information).
-- Registra qué endpoint accedió a datos médicos de qué usuario y cuándo.
-- Solo service role puede insertar; nadie puede actualizar ni borrar (append-only).
--
-- ROLLBACK:
--   drop table if exists phi_access_log;

create table if not exists phi_access_log (
  id          bigint generated always as identity primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  endpoint    text        not null,
  action      text        not null,  -- 'read' | 'write' | 'delete'
  ip          text,
  created_at  timestamptz not null default now()
);

-- Índice para consultas por usuario y por rango de tiempo
create index if not exists phi_access_log_user_created_idx
  on phi_access_log (user_id, created_at desc);

-- Auto-purge: registros >90 días no tienen valor operativo
create index if not exists phi_access_log_created_idx
  on phi_access_log (created_at)
  where created_at < now() - interval '90 days';

alter table phi_access_log enable row level security;

-- Solo service role puede insertar (la app loguea vía admin client)
create policy "service role insert" on phi_access_log
  for insert to service_role with check (true);

-- El usuario puede ver sus propios accesos (transparencia GDPR)
create policy "user read own" on phi_access_log
  for select using (auth.uid() = user_id);

-- Nadie puede modificar ni borrar registros de audit (append-only)
-- No se crean políticas UPDATE/DELETE → operación bloqueada por defecto con RLS.
