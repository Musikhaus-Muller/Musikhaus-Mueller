-- Harden current price selection and promote five manually verified Thomann checks.
begin;

insert into public.price_observations
  (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
select
  o.id,
  x.price,
  'EUR',
  'success',
  'browser',
  true,
  o.shop_product_name,
  'Produktseite im Browser geprüft · 03.11.2026. Preis, Modellgeneration und Lieferumfang sichtbar.',
  '2026-11-03T21:47:19Z'::timestamptz,
  jsonb_build_object('browser_check', true, 'normalized_verified', true)
from (values
  ('r11'::text, 4419::numeric),
  ('r12'::text, 7269::numeric),
  ('r14'::text, 999::numeric),
  ('r19'::text, 3305::numeric),
  ('r29'::text, 7759::numeric)
) as x(legacy_id, price)
join public.configurations c on c.legacy_id=x.legacy_id
join public.shops s on s.slug='thomann'
join public.offers o on o.configuration_id=c.id and o.shop_id=s.id
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=true,
  evidence=excluded.evidence,
  metadata=coalesce(public.price_observations.metadata,'{}'::jsonb) || excluded.metadata;

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
  where po.offer_id=o.id
    and po.status='success'
    and po.verified=true
    and po.price is not null
    and po.price>0
  order by po.observed_at desc, po.created_at desc, po.id desc
  limit 1
) success on true
left join lateral (
  select po.*
  from public.price_observations po
  where po.offer_id=o.id
  order by po.observed_at desc, po.created_at desc, po.id desc
  limit 1
) attempt on true
where o.active=true;

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
join public.current_offer_status cs on cs.offer_id = o.id
where o.active = true
  and c.active = true
  and s.enabled = true
  and cs.price is not null
  and cs.price > 0;

revoke all on public.frontend_offer_rows from anon, authenticated;
grant select on public.frontend_offer_rows to service_role;

commit;
