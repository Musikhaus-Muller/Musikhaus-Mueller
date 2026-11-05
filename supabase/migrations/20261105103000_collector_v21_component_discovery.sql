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
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 11 G3","quantity":2,"expected":"LD Systems MAUI 11 G3","kind":"main"},{"key":"sat_bag","label":"MAUI 11 G3 SAT BAG","quantity":2,"expected":"LD Systems MAUI 11 G3 SAT BAG","kind":"accessory"},{"key":"sub_cover","label":"MAUI 11 G3 SUB PC","quantity":2,"expected":"LD Systems MAUI 11 G3 SUB PC","kind":"accessory"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r2';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 44 G2","quantity":2,"expected":"LD Systems MAUI 44 G2","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r8';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 44 G2","quantity":2,"expected":"LD Systems MAUI 44 G2","kind":"main"},{"key":"sat_bag","label":"MAUI 44 G2 SAT BAG","quantity":2,"expected":"LD Systems MAUI 44 G2 SAT BAG","kind":"accessory"},{"key":"sub_cover","label":"MAUI 44 G2 SUB PC","quantity":2,"expected":"LD Systems MAUI 44 G2 SUB PC","kind":"accessory"},{"key":"rollboard","label":"MAUI 44 G2 CB","quantity":2,"expected":"LD Systems MAUI 44 G2 CB","kind":"accessory"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r9';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 11 G3","quantity":2,"expected":"LD Systems MAUI 11 G3","kind":"main"},{"key":"extra_sub","label":"MAUI 11 G3 SUB","quantity":2,"expected":"LD Systems MAUI 11 G3 SUB","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r10';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 28 G3","quantity":2,"expected":"LD Systems MAUI 28 G3","kind":"main"},{"key":"extra_sub","label":"MAUI 28 G3 SUB","quantity":2,"expected":"LD Systems MAUI 28 G3 SUB","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r11';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 44 G2","quantity":2,"expected":"LD Systems MAUI 44 G2","kind":"main"},{"key":"extra_sub","label":"MAUI 44 G2 SUB","quantity":2,"expected":"LD Systems MAUI 44 G2 SUB","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r12';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 11 G2","quantity":1,"expected":"LD Systems MAUI 11 G2","kind":"main"},{"key":"sat_bag","label":"MAUI 11 G2 SAT BAG","quantity":1,"expected":"LD Systems MAUI 11 G2 SAT BAG","kind":"accessory"},{"key":"sub_cover","label":"MAUI 11 G2 SUB PC","quantity":1,"expected":"LD Systems MAUI 11 G2 SUB PC","kind":"accessory"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r13';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"main","label":"MAUI 28 G2","quantity":1,"expected":"LD Systems MAUI 28 G2","kind":"main"},{"key":"sat_bag","label":"MAUI 28 G2 SAT BAG","quantity":1,"expected":"LD Systems MAUI 28 G2 SAT BAG","kind":"accessory"},{"key":"sub_cover","label":"MAUI 28 G2 SUB PC","quantity":1,"expected":"LD Systems MAUI 28 G2 SUB PC","kind":"accessory"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r14';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"STINGER 8 A G3","quantity":2,"expected":"LD Systems STINGER 8 A G3","kind":"main"},{"key":"sub","label":"STINGER SUB 15 A G3","quantity":1,"expected":"LD Systems STINGER SUB 15 A G3","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r22';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"ICOA 12 A BT","quantity":2,"expected":"LD Systems ICOA 12 A BT","kind":"main"},{"key":"sub","label":"ICOA SUB 15 A","quantity":1,"expected":"LD Systems ICOA SUB 15 A","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r23';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"ICOA 12 A BT","quantity":2,"expected":"LD Systems ICOA 12 A BT","kind":"main"},{"key":"sub","label":"ICOA SUB 18 A","quantity":2,"expected":"LD Systems ICOA SUB 18 A","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r24';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"ICOA 15 A BT","quantity":2,"expected":"LD Systems ICOA 15 A BT","kind":"main"},{"key":"sub","label":"ICOA SUB 18 A","quantity":2,"expected":"LD Systems ICOA SUB 18 A","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r25';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"ICOA 15 A BT","quantity":2,"expected":"LD Systems ICOA 15 A BT","kind":"main"},{"key":"sub","label":"ICOA SUB 18 A","quantity":4,"expected":"LD Systems ICOA SUB 18 A","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r26';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"ICOA PRO 12 A","quantity":2,"expected":"LD Systems ICOA PRO 12 A","kind":"main"},{"key":"sub","label":"ICOA PRO SUB 21 A","quantity":1,"expected":"LD Systems ICOA PRO SUB 21 A","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r27';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"ICOA PRO 12 A","quantity":2,"expected":"LD Systems ICOA PRO 12 A","kind":"main"},{"key":"sub","label":"ICOA PRO SUB 21 A","quantity":2,"expected":"LD Systems ICOA PRO SUB 21 A","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r28';

update public.configurations
set metadata = jsonb_set(coalesce(metadata,'{}'::jsonb), '{discovery_recipe}', '{"mode":"components","recipe_version":1,"components":[{"key":"top","label":"ICOA PRO 15 A","quantity":2,"expected":"LD Systems ICOA PRO 15 A","kind":"main"},{"key":"sub","label":"ICOA PRO SUB 21 A","quantity":2,"expected":"LD Systems ICOA PRO SUB 21 A","kind":"main"}]}'::jsonb, true),
    updated_at = now()
where legacy_id = 'r29';

