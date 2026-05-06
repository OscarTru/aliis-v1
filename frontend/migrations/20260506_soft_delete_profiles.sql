-- Soft delete con grace period de 30 días.
-- En vez de borrar inmediatamente, marca deleted_at y purga después de 30 días.
-- Permite recuperación ante eliminaciones accidentales o por session hijack.
--
-- ROLLBACK:
--   alter table profiles drop column if exists deleted_at;
--   drop function if exists purge_deleted_profiles();

alter table profiles
  add column if not exists deleted_at timestamptz default null;

create index if not exists profiles_deleted_at_idx
  on profiles (deleted_at)
  where deleted_at is not null;

-- RPC que elimina definitivamente perfiles con >30 días de gracia.
-- Se llama desde un cron (pg_cron) o desde el backend worker.
create or replace function purge_deleted_profiles()
returns int
language plpgsql
security definer
as $$
declare
  purged int;
begin
  -- Solo service role puede invocar esta función (security definer + sin grant a anon/authenticated)
  delete from profiles
  where deleted_at is not null
    and deleted_at < now() - interval '30 days';
  get diagnostics purged = row_count;
  return purged;
end;
$$;

-- Revocar acceso a roles no admin (solo service role puede purgar)
revoke execute on function purge_deleted_profiles() from anon, authenticated;
