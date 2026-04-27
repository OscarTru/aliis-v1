create table if not exists tracked_symptoms (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles(id) on delete cascade,
  name                   text not null,
  first_seen_at          timestamptz not null,
  last_seen_at           timestamptz not null,
  occurrences            int not null default 1,
  resolved               boolean not null default false,
  resolved_at            timestamptz,
  needs_medical_attention boolean not null default false,
  attention_reason       text,
  created_at             timestamptz not null default now()
);

create unique index if not exists tracked_symptoms_user_active_name
  on tracked_symptoms (user_id, lower(name)) where (not resolved);

alter table tracked_symptoms enable row level security;

create policy "Users manage own tracked symptoms" on tracked_symptoms
  for all using (auth.uid() = user_id);

create policy "Service role full access tracked symptoms" on tracked_symptoms
  for all using (true);
