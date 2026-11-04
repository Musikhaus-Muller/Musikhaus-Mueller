-- Keep the last successful price separate from the last collection attempt.
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
  attempt.observed_at as last_attempt_at
from public.offers o
left join lateral (
  select po.*
  from public.price_observations po
  where po.offer_id=o.id and po.status='success' and po.price is not null
  order by po.observed_at desc
  limit 1
) success on true
left join lateral (
  select po.*
  from public.price_observations po
  where po.offer_id=o.id
  order by po.observed_at desc
  limit 1
) attempt on true
where o.active=true;
