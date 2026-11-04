-- Kirstein 40/40 reconciliation on 2026-11-04.
begin;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1858,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r1' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2068,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r2' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1427,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r3' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2854,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r4' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2618,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r5' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3298,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r7' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4814,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r11' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1071,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r15' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1371,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r16' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1722,'EUR','success','catalog',true,o.shop_product_name,
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r17' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
  (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
  (select id from public.configurations where legacy_id='r6'),
  (select id from public.shops where slug='kirstein'),
  '2 × LD Systems MAUI 28 G3 Weiß',
  'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Weiss.html',
  '2 × MAUI 28 G3 weiß.',
  'exact',
  '2 × 1.399 € = 2.798 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Weiss.html',
  '2 × LD Systems MAUI 28 G3 Weiß',
  'Kirstein aktuell verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"calculated cart","components":[{"url":"https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Weiss.html","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
  shop_product_name=excluded.shop_product_name,
  product_url=excluded.product_url,
  contents=excluded.contents,
  match_type=excluded.match_type,
  calculation=excluded.calculation,
  note=excluded.note,
  source_url=excluded.source_url,
  source_name=excluded.source_name,
  evidence=excluded.evidence,
  active=true,
  metadata=excluded.metadata,
  updated_at=now();

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2798,'EUR','success','catalog',true,'2 × LD Systems MAUI 28 G3 Weiß',
  'Kirstein aktuell verifiziert · 04.11.2026',
  '2026-11-04T20:00:00Z'::timestamptz,
  '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r6' and s.slug='kirstein'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

commit;
