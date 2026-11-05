-- Collector 2.1 component discovery recipes and proposal storage.
-- Proposal-only: nothing here creates or activates offers.

create table if not exists public.discovery_component_candidates (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.discovery_runs(id) on delete set null,
  configuration_id uuid not null references public.configurations(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  component_key text not null,
  component_label text not null,
  component_kind text not null default 'main'
    check (component_kind in ('main','accessory')),
  quantity numeric(10,3) not null default 1 check (quantity > 0),
  status text not null default 'proposed'
    check (status in ('proposed','approved','rejected','ignored')),
  candidate_name text not null,
  candidate_url text not null,
  candidate_price numeric(12,2),
  currency text not null default 'EUR',
  match_score numeric(5,4) not null check (match_score >= 0 and match_score <= 1),
  source_url text not null,
  metadata jsonb not null default '{}'::jsonb,
  discovered_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists discovery_component_candidates_uidx
  on public.discovery_component_candidates(configuration_id, shop_id, component_key, candidate_url);

create index if not exists discovery_component_candidates_run_idx
  on public.discovery_component_candidates(run_id, configuration_id, component_key, match_score desc);

drop trigger if exists discovery_component_candidates_set_updated_at on public.discovery_component_candidates;
create trigger discovery_component_candidates_set_updated_at
before update on public.discovery_component_candidates
for each row execute function public.set_updated_at();

alter table public.discovery_component_candidates enable row level security;
revoke all on public.discovery_component_candidates from anon, authenticated;
grant all on public.discovery_component_candidates to service_role;

comment on table public.discovery_component_candidates is
  'Collector 2.1 proposal-only component matches for configurations described by a discovery_recipe.';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":2,"reference_shop":"mueller","components":[{"key":"top","label":"ICOA PRO 15 A","quantity":2,"expected":"LD Systems ICOA PRO 15 A","kind":"main","role":"structural"},{"key":"sub","label":"ICOA PRO SUB 21 A","quantity":2,"expected":"LD Systems ICOA PRO SUB 21 A","kind":"main","role":"structural"},{"key":"top_cover","label":"ICOA 15 PC","quantity":2,"expected":"ICOA 15 PC","kind":"accessory","role":"secondary"},{"key":"sub_cover","label":"SUB 21 PC","quantity":2,"expected":"SUB 21 PC","kind":"accessory","role":"secondary"},{"key":"rollboard","label":"SUB 21 CB","quantity":2,"expected":"SUB 21 CB","kind":"accessory","role":"secondary"},{"key":"stands","label":"Gravity SP 2332 B","quantity":2,"expected":"Gravity SP 2332 B","kind":"accessory","role":"secondary"},{"key":"xlr_3m","label":"XLR Kabel 3 m","quantity":2,"expected":"XLR Kabel 3 m","kind":"accessory","role":"secondary"},{"key":"power_3m","label":"PowerCon Kabel 3 m","quantity":2,"expected":"PowerCon Kabel 3 m","kind":"accessory","role":"secondary"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r29';

