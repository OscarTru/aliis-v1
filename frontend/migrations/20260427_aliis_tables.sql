-- Tabla de insights de Aliis (1 por usuario por día, cacheado)
create table if not exists aliis_insights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  content      text not null,
  generated_at timestamptz not null default now(),
  data_window  jsonb
);

create unique index if not exists aliis_insights_user_day
  on aliis_insights (user_id, date(generated_at at time zone 'UTC'));

alter table aliis_insights enable row level security;

create policy "Users see own insights" on aliis_insights
  for select using (auth.uid() = user_id);

create policy "Service role inserts insights" on aliis_insights
  for insert with check (true);

-- Tabla de suscripciones Web Push
create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists push_subscriptions_user_endpoint
  on push_subscriptions (user_id, endpoint);

alter table push_subscriptions enable row level security;

create policy "Users manage own subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);

create policy "Service role reads subscriptions" on push_subscriptions
  for select using (true);
