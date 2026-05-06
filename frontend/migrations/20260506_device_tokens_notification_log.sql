-- frontend/migrations/20260506_device_tokens_notification_log.sql

-- device_tokens: almacena el FCM token de cada dispositivo
create table if not exists device_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  token       text not null,
  platform    text not null check (platform in ('ios', 'android')),
  updated_at  timestamptz default now()
);

create unique index if not exists device_tokens_token_idx on device_tokens(token);
create index if not exists device_tokens_user_idx on device_tokens(user_id);

alter table device_tokens enable row level security;

drop policy if exists "users manage own tokens" on device_tokens;
create policy "users manage own tokens"
  on device_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- notification_log: registro de pushes enviados (para el límite diario)
create table if not exists notification_log (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users not null,
  type     text not null check (type in ('medication', 'insight', 'red_flag')),
  message  text,
  sent_at  timestamptz default now()
);

create index if not exists notification_log_user_type_sent_idx
  on notification_log(user_id, type, sent_at);

alter table notification_log enable row level security;

drop policy if exists "users read own log" on notification_log;
create policy "users read own log"
  on notification_log for select
  using (auth.uid() = user_id);
-- El Edge Function escribe via service_role (bypassa RLS automáticamente)
