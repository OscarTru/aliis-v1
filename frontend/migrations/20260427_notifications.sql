create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  title        text not null,
  body         text not null,
  type         text not null default 'reminder',
  read         boolean not null default false,
  read_at      timestamptz,
  url          text,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_user_created
  on notifications (user_id, created_at desc);

alter table notifications enable row level security;

create policy "Users read own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users update own notifications" on notifications
  for update using (auth.uid() = user_id);

create policy "Service role insert notifications" on notifications
  for insert with check (true);
