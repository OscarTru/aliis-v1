-- Migration: add condition_slug and tools to packs
alter table packs add column if not exists condition_slug text;
alter table packs add column if not exists tools jsonb default '[]'::jsonb;
create index if not exists packs_condition_slug_idx on packs(condition_slug) where condition_slug is not null;
