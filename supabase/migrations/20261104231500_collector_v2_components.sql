-- Collector 2.0: component-level bundle pricing.
create table if not exists public.offer_components (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  position integer not null,
  label text,
  quantity numeric(10,3) not null default 1 check (quantity > 0),
  product_url text not null,
  expected_product_name text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id, position)
);

create index if not exists offer_components_offer_idx on public.offer_components(offer_id);

drop trigger if exists offer_components_set_updated_at on public.offer_components;
create trigger offer_components_set_updated_at
before update on public.offer_components
for each row execute function public.set_updated_at();

create table if not exists public.component_price_observations (
  id uuid primary key default gen_random_uuid(),
  offer_component_id uuid not null references public.offer_components(id) on delete cascade,
  run_id uuid references public.collection_runs(id) on delete set null,
  price numeric(12,2),
  currency text not null default 'EUR',
  availability text,
  status text not null default 'success'
    check (status in ('success','blocked','captcha','not_found','parse_error','network_error','skipped')),
  source_method text not null default 'http'
    check (source_method in ('http','browser','catalog','manual')),
  http_status integer,
  verified boolean not null default false,
  evidence text,
  error_message text,
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists component_price_observations_component_time_idx
  on public.component_price_observations(offer_component_id, observed_at desc);

alter table public.offer_components enable row level security;
alter table public.component_price_observations enable row level security;

alter table public.price_observations
  drop constraint if exists price_observations_source_method_check;
alter table public.price_observations
  add constraint price_observations_source_method_check
  check (source_method in ('http','browser','catalog','manual','seed_import','component_calc'));

insert into public.offer_components
  (offer_id, position, label, quantity, product_url, expected_product_name, metadata)
select
  o.id,
  x.ordinality::integer,
  case when jsonb_typeof(x.value)='object' then nullif(x.value->>'name','') else null end,
  case
    when jsonb_typeof(x.value)='object'
      and coalesce(x.value->>'quantity','') ~ '^[0-9]+([.][0-9]+)?$'
      then (x.value->>'quantity')::numeric
    else 1
  end,
  case
    when jsonb_typeof(x.value)='string' then x.value #>> '{}'
    when jsonb_typeof(x.value)='object' then x.value->>'url'
    else null
  end,
  case when jsonb_typeof(x.value)='object' then nullif(x.value->>'name','') else null end,
  jsonb_build_object('migrated_from_offer_metadata', true)
from public.offers o
cross join lateral jsonb_array_elements(o.metadata->'components') with ordinality as x(value, ordinality)
where o.metadata->>'collection_disabled'='true'
  and jsonb_typeof(o.metadata->'components')='array'
  and case
    when jsonb_typeof(x.value)='string' then x.value #>> '{}'
    when jsonb_typeof(x.value)='object' then x.value->>'url'
    else null
  end is not null
on conflict (offer_id, position) do update set
  label=excluded.label,
  quantity=excluded.quantity,
  product_url=excluded.product_url,
  expected_product_name=excluded.expected_product_name,
  metadata=public.offer_components.metadata || excluded.metadata,
  active=true,
  updated_at=now();

comment on table public.offer_components is
  'Collector 2.0 component URLs and quantities used to calculate multi-product bundle offers.';
comment on table public.component_price_observations is
  'Per-component observations. Successful component sets are aggregated into price_observations with source_method=component_calc.';
