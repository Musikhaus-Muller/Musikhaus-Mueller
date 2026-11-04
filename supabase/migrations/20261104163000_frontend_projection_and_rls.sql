-- Frontend-safe Supabase projection and tighter read access.
-- The browser does not query Supabase directly; the backend uses this view.

drop policy if exists "public read price observations" on public.price_observations;
drop policy if exists "public read collection runs" on public.collection_runs;
drop policy if exists "public read collection results" on public.collection_results;

create or replace view public.frontend_offer_rows
with (security_invoker = true)
as
select
  c.legacy_id,
  c.brand,
  c.family,
  c.name as configuration_name,
  c.subtitle,
  c.note as configuration_note,
  s.slug as shop_slug,
  s.name as shop_name,
  o.shop_product_name,
  o.product_url,
  o.contents,
  o.match_type,
  o.calculation,
  o.note as offer_note,
  o.source_url,
  o.source_name,
  o.evidence,
  cs.price,
  cs.currency,
  cs.availability,
  cs.price_source_method,
  cs.price_observed_at,
  cs.last_attempt_status,
  cs.last_attempt_method,
  cs.last_attempt_http_status,
  cs.last_attempt_error,
  cs.last_attempt_at
from public.offers o
join public.configurations c on c.id = o.configuration_id
join public.shops s on s.id = o.shop_id
left join public.current_offer_status cs on cs.offer_id = o.id
where o.active = true
  and c.active = true
  and s.enabled = true;

revoke all on public.frontend_offer_rows from anon, authenticated;
grant select on public.frontend_offer_rows to service_role;
