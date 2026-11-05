-- Atomically reserve a single manual collection run before dispatching GitHub Actions.
create or replace function public.acquire_manual_collection_run()
returns table (run_id uuid, started_at timestamptz, busy boolean, trigger_type text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  active_run public.collection_runs%rowtype;
  reserved_run public.collection_runs%rowtype;
begin
  perform pg_advisory_xact_lock(20261105, 1);

  update public.collection_runs
  set status = 'failed',
      finished_at = now(),
      metadata = coalesce(metadata, '{}'::jsonb) || '{"finalized_reason":"expired_run"}'::jsonb
  where status = 'running'
    and started_at < now() - interval '60 minutes';

  select cr.*
  into active_run
  from public.collection_runs cr
  where cr.status = 'running'
  order by cr.started_at desc
  limit 1
  for update;

  if found then
    return query select active_run.id, active_run.started_at, true, active_run.trigger_type;
    return;
  end if;

  insert into public.collection_runs (trigger_type, status, offers_total, metadata)
  values ('manual', 'running', 0, '{"source":"web"}'::jsonb)
  returning * into reserved_run;

  return query select reserved_run.id, reserved_run.started_at, false, reserved_run.trigger_type;
end;
$$;

revoke all on function public.acquire_manual_collection_run() from public, anon, authenticated;
grant execute on function public.acquire_manual_collection_run() to service_role;
