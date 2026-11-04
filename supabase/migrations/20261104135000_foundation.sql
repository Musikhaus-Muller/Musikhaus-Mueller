-- PA Bundle Preisvergleich - Supabase foundation
-- Safe to run on a fresh Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  base_url text,
  enabled boolean not null default true,
  collector_type text not null default 'http'
    check (collector_type in ('http','browser','hybrid','manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.configurations (
  id uuid primary key default gen_random_uuid(),
  legacy_id text not null unique,
  brand text not null,
  family text not null,
  name text not null,
  subtitle text,
  comparison_status text,
  note text,
  source_date date,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references public.configurations(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  shop_product_name text,
  product_url text,
  contents text,
  match_type text,
  calculation text,
  note text,
  source_url text,
  source_name text,
  evidence text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(configuration_id, shop_id)
);

create table if not exists public.collection_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_type text not null default 'manual'
    check (trigger_type in ('manual','schedule','import','api')),
  status text not null default 'running'
    check (status in ('running','success','partial','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  offers_total integer not null default 0,
  offers_checked integer not null default 0,
  offers_updated integer not null default 0,
  offers_failed integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.price_observations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  run_id uuid references public.collection_runs(id) on delete set null,
  price numeric(12,2),
  currency text not null default 'EUR',
  availability text,
  status text not null default 'success'
    check (status in ('success','blocked','captcha','not_found','parse_error','network_error','skipped')),
  source_method text not null default 'http'
    check (source_method in ('http','browser','catalog','manual','seed_import')),
  http_status integer,
  verified boolean not null default false,
  raw_product_name text,
  evidence text,
  error_message text,
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists price_observations_seed_unique
  on public.price_observations(offer_id, source_method, observed_at);

create index if not exists price_observations_offer_time_idx
  on public.price_observations(offer_id, observed_at desc);

create index if not exists offers_shop_idx on public.offers(shop_id);
create index if not exists offers_configuration_idx on public.offers(configuration_id);

create table if not exists public.collection_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.collection_runs(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  status text not null,
  price numeric(12,2),
  source_method text,
  http_status integer,
  message text,
  created_at timestamptz not null default now(),
  unique(run_id, offer_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shops_set_updated_at on public.shops;
create trigger shops_set_updated_at
before update on public.shops
for each row execute function public.set_updated_at();

drop trigger if exists configurations_set_updated_at on public.configurations;
create trigger configurations_set_updated_at
before update on public.configurations
for each row execute function public.set_updated_at();

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

create or replace view public.latest_offer_prices as
select distinct on (o.id)
  o.id as offer_id,
  o.configuration_id,
  o.shop_id,
  o.shop_product_name,
  o.product_url,
  o.contents,
  o.match_type,
  po.price,
  po.currency,
  po.availability,
  po.status,
  po.source_method,
  po.verified,
  po.observed_at,
  po.http_status,
  po.error_message
from public.offers o
left join public.price_observations po on po.offer_id = o.id
where o.active = true
order by o.id, po.observed_at desc nulls last;

alter table public.shops enable row level security;
alter table public.configurations enable row level security;
alter table public.offers enable row level security;
alter table public.price_observations enable row level security;
alter table public.collection_runs enable row level security;
alter table public.collection_results enable row level security;

drop policy if exists "public read shops" on public.shops;
create policy "public read shops"
on public.shops for select
using (enabled = true);

drop policy if exists "public read configurations" on public.configurations;
create policy "public read configurations"
on public.configurations for select
using (active = true);

drop policy if exists "public read offers" on public.offers;
create policy "public read offers"
on public.offers for select
using (active = true);

drop policy if exists "public read price observations" on public.price_observations;
create policy "public read price observations"
on public.price_observations for select
using (true);

drop policy if exists "public read collection runs" on public.collection_runs;
create policy "public read collection runs"
on public.collection_runs for select
using (true);

drop policy if exists "public read collection results" on public.collection_results;
create policy "public read collection results"
on public.collection_results for select
using (true);

insert into public.shops (slug, name, base_url, collector_type)
values
  ('mueller', 'Musikhaus Müller', 'https://www.musikhaus-mueller.de', 'hybrid'),
  ('thomann', 'Thomann', 'https://www.thomann.de', 'hybrid'),
  ('kirstein', 'Kirstein', 'https://www.kirstein.de', 'hybrid'),
  ('prolighting', 'PRO LIGHTING', 'https://www.prolighting.de', 'hybrid'),
  ('hotsound', 'Hot Sound', 'https://www.hotsound-store.com', 'browser'),
  ('musicstore', 'Music Store', 'https://www.musicstore.de', 'hybrid')
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  collector_type = excluded.collector_type,
  enabled = true,
  updated_at = now();
