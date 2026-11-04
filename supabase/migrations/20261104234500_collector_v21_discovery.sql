-- Collector 2.1: discovery candidates are proposals only.
-- Nothing in this migration publishes or activates offers.

create table if not exists public.discovery_runs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete set null,
  trigger_type text not null default 'manual'
    check (trigger_type in ('manual','schedule')),
  status text not null default 'running'
    check (status in ('running','success','partial','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  configurations_missing integer not null default 0,
  sources_scanned integer not null default 0,
  candidates_found integer not null default 0,
  errors_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.discovery_candidates (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.discovery_runs(id) on delete set null,
  configuration_id uuid not null references public.configurations(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  status text not null default 'proposed'
    check (status in ('proposed','approved','rejected','ignored')),
  candidate_name text not null,
  candidate_url text not null,
  candidate_price numeric(12,2),
  currency text not null default 'EUR',
  match_score numeric(5,4) not null check (match_score >= 0 and match_score <= 1),
  source_url text not null,
  evidence text,
  metadata jsonb not null default '{}'::jsonb,
  discovered_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists discovery_candidates_config_shop_url_uidx
  on public.discovery_candidates(configuration_id, shop_id, candidate_url);

create index if not exists discovery_candidates_status_score_idx
  on public.discovery_candidates(status, match_score desc);

create index if not exists discovery_candidates_config_idx
  on public.discovery_candidates(configuration_id);

drop trigger if exists discovery_candidates_set_updated_at on public.discovery_candidates;
create trigger discovery_candidates_set_updated_at
before update on public.discovery_candidates
for each row execute function public.set_updated_at();

alter table public.discovery_runs enable row level security;
alter table public.discovery_candidates enable row level security;

-- No anon/authenticated policies on purpose. Discovery is server-side only.
revoke all on public.discovery_runs from anon, authenticated;
revoke all on public.discovery_candidates from anon, authenticated;
grant all on public.discovery_runs to service_role;
grant all on public.discovery_candidates to service_role;

comment on table public.discovery_runs is
  'Collector 2.1 discovery executions. Discovery never publishes offers directly.';
comment on table public.discovery_candidates is
  'Unpublished candidate matches discovered from official shop sources. Approval is a separate step.';
