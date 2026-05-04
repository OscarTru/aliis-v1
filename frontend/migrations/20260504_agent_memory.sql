-- frontend/migrations/20260504_agent_memory.sql
create table if not exists agent_memory (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  agent_name   text not null,
  memory_type  text not null check (memory_type in ('observation', 'pattern', 'alert', 'recommendation')),
  content      jsonb not null,
  relevance    float not null default 1.0,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz
);

create index if not exists agent_memory_user_agent
  on agent_memory (user_id, agent_name, created_at desc);

create index if not exists agent_memory_type
  on agent_memory (user_id, memory_type, created_at desc);

alter table agent_memory enable row level security;

create policy "Users see own memory" on agent_memory
  for select using (auth.uid() = user_id);

create policy "Service role full access" on agent_memory
  for all using (true);
