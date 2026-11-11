-- Read-only freshness metadata. The current price rule remains the strict
-- verified-success selector; freshness never promotes an attempted price.
begin;

create or replace view public.current_offer_status as
select
  o.id as offer_id,
  o.configuration_id,
  o.shop_id,
  o.shop_product_name,
  o.product_url,
  success.price,
  success.currency,
  success.availability,
  success.source_method as price_source_method,
  success.observed_at as price_observed_at,
  attempt.status as last_attempt_status,
  attempt.source_method as last_attempt_method,
  attempt.http_status as last_attempt_http_status,
  attempt.error_message as last_attempt_error,
  attempt.observed_at as last_attempt_at,
  success.observed_at as last_verified_at,
  case when success.observed_at is null then null else extract(epoch from (now() - success.observed_at)) / 86400.0 end as age_days,
  case
    when success.observed_at is null then null
    when success.observed_at >= now() - interval '1 day' then 'fresh'
    when success.observed_at >= now() - interval '3 days' then 'aging'
    when success.observed_at >= now() - interval '7 days' then 'stale'
    else 'very_stale'
  end as freshness_status,
  attempt.source_method as latest_attempt_source_method,
  attempt.http_status as latest_attempt_http_status,
  case when attempt.status in ('blocked','captcha','not_found','parse_error','http_error') then coalesce(attempt.error_message,attempt.status) end as preservation_reason
from public.offers o
left join lateral (
  select po.* from public.price_observations po
  where po.offer_id=o.id and po.status='success' and po.verified=true and po.price is not null and po.price>0
  order by po.observed_at desc, po.created_at desc, po.id desc limit 1
) success on true
left join lateral (
  select po.* from public.price_observations po
  where po.offer_id=o.id
  order by po.observed_at desc, po.created_at desc, po.id desc limit 1
) attempt on true
where o.active=true;

create or replace view public.frontend_offer_rows
with (security_invoker = true) as
select c.legacy_id,c.brand,c.family,c.name as configuration_name,c.subtitle,c.note as configuration_note,s.slug as shop_slug,s.name as shop_name,
  o.shop_product_name,o.product_url,o.contents,o.match_type,o.calculation,o.note as offer_note,o.source_url,o.source_name,o.evidence,
  cs.price,cs.currency,cs.availability,cs.price_source_method,cs.price_observed_at,
  cs.last_attempt_status,cs.last_attempt_method,cs.last_attempt_http_status,cs.last_attempt_error,cs.last_attempt_at,
  cs.last_verified_at,cs.age_days,cs.freshness_status,cs.latest_attempt_source_method,cs.latest_attempt_http_status,cs.preservation_reason
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id join public.current_offer_status cs on cs.offer_id=o.id
where o.active=true and c.active=true and s.enabled=true and cs.price is not null and cs.price>0;

revoke all on public.frontend_offer_rows from anon, authenticated;
grant select on public.frontend_offer_rows to service_role;
commit;
