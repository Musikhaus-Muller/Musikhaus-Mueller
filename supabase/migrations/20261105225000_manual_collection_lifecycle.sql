-- Track manual reservation, dispatch, claim, and orphan reconciliation states.
create or replace function public.reconcile_manual_collection_runs(p_active_run_ids uuid[] default '{}'::uuid[])
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  reconciled integer;
begin
  update public.collection_runs
  set status = 'failed',
      finished_at = now(),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'lifecycle', 'failed',
        'error', 'GitHub Actions did not start the collector within 10 minutes'
      )
  where status = 'running'
    and metadata->>'source' = 'web'
    and not (id = any(coalesce(p_active_run_ids, '{}'::uuid[])))
    and (
      (metadata->>'lifecycle' = 'reserved'
        and coalesce((metadata->>'reserved_at')::timestamptz, started_at) < now() - interval '10 minutes')
      or
      (metadata->>'lifecycle' = 'queued'
        and coalesce((metadata->>'dispatch_accepted_at')::timestamptz, started_at) < now() - interval '10 minutes')
    );

  get diagnostics reconciled = row_count;
  return reconciled;
end;
$$;

create or replace function public.acquire_manual_collection_run()
returns table (run_id uuid, started_at timestamptz, busy boolean, trigger_type text)
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  active_run public.collection_runs%rowtype;
  reserved_run public.collection_runs%rowtype;
begin
  perform pg_advisory_xact_lock(20261105, 1);

  -- Orphan cleanup runs only from the scheduled GitHub-aware reconciler.
  -- Calling it here without active GitHub run IDs could falsely expire
  -- a legitimate workflow that is still queued by Actions.
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
  values ('manual', 'running', 0, jsonb_build_object(
    'source', 'web',
    'lifecycle', 'reserved',
    'reserved_at', now()
  ))
  returning * into reserved_run;

  return query select reserved_run.id, reserved_run.started_at, false, reserved_run.trigger_type;
end;
$$;

create or replace function public.mark_manual_collection_dispatched(p_run_id uuid)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  current_run public.collection_runs%rowtype;
begin
  select * into current_run
  from public.collection_runs
  where id = p_run_id
  for update;

  if not found then
    raise exception 'Manual collection run not found';
  end if;

  if current_run.status = 'running' and current_run.metadata->>'lifecycle' = 'reserved' then
    update public.collection_runs
    set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'lifecycle', 'queued',
      'dispatch_accepted_at', now()
    )
    where id = p_run_id;
    return 'queued';
  end if;

  return coalesce(current_run.metadata->>'lifecycle', current_run.status);
end;
$$;

create or replace function public.claim_manual_collection_run(p_run_id uuid)
returns table (claimed boolean, reason text)
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  current_run public.collection_runs%rowtype;
  lifecycle text;
  reservation_time timestamptz;
begin
  perform pg_advisory_xact_lock(20261105, 1);
  select * into current_run
  from public.collection_runs
  where id = p_run_id
  for update;

  if not found or current_run.status <> 'running' then
    return query select false, 'run_not_active';
    return;
  end if;

  lifecycle := current_run.metadata->>'lifecycle';
  if current_run.metadata->>'source' is distinct from 'web'
    or lifecycle is null
    or lifecycle not in ('reserved', 'queued') then
    return query select false, 'run_not_claimable';
    return;
  end if;

  reservation_time := case lifecycle
    when 'queued' then coalesce((current_run.metadata->>'dispatch_accepted_at')::timestamptz, current_run.started_at)
    else coalesce((current_run.metadata->>'reserved_at')::timestamptz, current_run.started_at)
  end;
  if reservation_time < now() - interval '10 minutes' then
    update public.collection_runs
    set status = 'failed',
        finished_at = now(),
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'lifecycle', 'failed',
          'error', 'GitHub Actions did not start the collector within 10 minutes'
        )
    where id = p_run_id;
    return query select false, 'reservation_expired';
    return;
  end if;

  update public.collection_runs
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'lifecycle', 'running',
    'collector_started_at', now()
  )
  where id = p_run_id;
  return query select true, null::text;
end;
$$;

create or replace function public.fail_manual_collection_run(p_run_id uuid, p_error text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  update public.collection_runs
  set status = 'failed',
      finished_at = now(),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'lifecycle', 'failed',
        'error', left(coalesce(p_error, 'GitHub Actions dispatch rejected'), 500)
      )
  where id = p_run_id
    and status = 'running'
    and metadata->>'source' = 'web'
    and metadata->>'lifecycle' = 'reserved';
  return found;
end;
$$;

revoke all on function public.acquire_manual_collection_run() from public, anon, authenticated;
grant execute on function public.acquire_manual_collection_run() to service_role;
revoke all on function public.reconcile_manual_collection_runs(uuid[]) from public, anon, authenticated;
grant execute on function public.reconcile_manual_collection_runs(uuid[]) to service_role;
revoke all on function public.mark_manual_collection_dispatched(uuid) from public, anon, authenticated;
grant execute on function public.mark_manual_collection_dispatched(uuid) to service_role;
revoke all on function public.claim_manual_collection_run(uuid) from public, anon, authenticated;
grant execute on function public.claim_manual_collection_run(uuid) to service_role;
revoke all on function public.fail_manual_collection_run(uuid, text) from public, anon, authenticated;
grant execute on function public.fail_manual_collection_run(uuid, text) to service_role;
