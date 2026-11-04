-- Music Store 40/40 reconciliation on 2026-11-04.
begin;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1858,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r1' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2096,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r2' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1433,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r3' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2866,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r4' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2578,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r5' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2698,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r6' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3098,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r7' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4358,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r8' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3363.8,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r10' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,839,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r13' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1069,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r14' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1123,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r15' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1324,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r16' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1664,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r17' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1687.8,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r23' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2601.8,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r24' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2681.8,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r25' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4337.6,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r26' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,6627.8,'EUR','success','catalog',true,o.shop_product_name,
  'Music Store aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:45:00Z'::timestamptz,
  '{"audit_40of40":true,"price_reconciled":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r28' and s.slug='musicstore'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

commit;
