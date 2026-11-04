-- Musikhaus Müller 40/40 reconciliation on 2026-11-04.
begin;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1849,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r1' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1970,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r2' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1398,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r3' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2839,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r4' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2549,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r5' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2815,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r6' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3069,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r7' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4329,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r8' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4839,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r9' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1069,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r15' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1275,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r16' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1599,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r17' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3219,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r19' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4169,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r20' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,6899,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r21' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1539,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r23' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2430,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r24' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2549,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r25' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4129,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r26' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4979,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r27' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,6599,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r28' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2279,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r30' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2499,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r31' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2450,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r32' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2510,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r33' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1225,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r34' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1255,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r35' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1699,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r36' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1880,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r37' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3749,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r38' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,11690,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r39' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,15290,'EUR','success','catalog',true,o.shop_product_name,
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r40' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
  (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
  (select id from public.configurations where legacy_id='r10'),
  (select id from public.shops where slug='mueller'),
  'LD Systems MAUI 11 G3 Power Bundle Set schwarz','https://www.musikhaus-mueller.de/ld-systems-maui-11-g3-power-bundle-set-schwarz/','2 × MAUI 11 G3 Säulensystem schwarz; 2 × zusätzliche MAUI 11 G3 Subwoofer schwarz; 2 × XLR-Kabel 3 m.','exact',null,
  'Direktes Müller Power Bundle in schwarzer Referenzkonfiguration.','https://www.musikhaus-mueller.de/ld-systems-maui-11-g3-power-bundle-set-schwarz/','LD Systems MAUI 11 G3 Power Bundle Set schwarz',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',true,
  '{"audit_40of40":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
  shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
  contents=excluded.contents,match_type=excluded.match_type,note=excluded.note,
  source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
  active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3052,'EUR','success','catalog',true,'LD Systems MAUI 11 G3 Power Bundle Set schwarz',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true,"new_offer":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r10' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
  (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
  (select id from public.configurations where legacy_id='r11'),
  (select id from public.shops where slug='mueller'),
  'LD Systems MAUI 28 G3 Power Bundle Set schwarz','https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_power_bundle_set_schwarz/','2 × MAUI 28 G3 Säulensystem schwarz; 2 × zusätzliche MAUI 28 G3 Subwoofer schwarz; 2 × XLR-Kabel 3 m.','exact',null,
  'Direktes Müller Power Bundle; aktueller Katalogpreis.','https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_power_bundle_set_schwarz/','LD Systems MAUI 28 G3 Power Bundle Set schwarz',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',true,
  '{"audit_40of40":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
  shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
  contents=excluded.contents,match_type=excluded.match_type,note=excluded.note,
  source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
  active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4379,'EUR','success','catalog',true,'LD Systems MAUI 28 G3 Power Bundle Set schwarz',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true,"new_offer":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r11' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
  (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
  (select id from public.configurations where legacy_id='r12'),
  (select id from public.shops where slug='mueller'),
  'LD Systems MAUI 44 G2 Power Bundle Set schwarz','https://www.musikhaus-mueller.de/ld-systems-maui-44-g2-power-bundle-set-schwarz/','2 × MAUI 44 G2 Säulensystem schwarz; 2 × zusätzliche MAUI 44 G2 Subwoofer schwarz; 2 × XLR-Kabel 3 m.','exact',null,
  'Direktes Müller Power Bundle in schwarzer Referenzkonfiguration.','https://www.musikhaus-mueller.de/ld-systems-maui-44-g2-power-bundle-set-schwarz/','LD Systems MAUI 44 G2 Power Bundle Set schwarz',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',true,
  '{"audit_40of40":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
  shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
  contents=excluded.contents,match_type=excluded.match_type,note=excluded.note,
  source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
  active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,7199,'EUR','success','catalog',true,'LD Systems MAUI 44 G2 Power Bundle Set schwarz',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true,"new_offer":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r12' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
  (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
  (select id from public.configurations where legacy_id='r29'),
  (select id from public.shops where slug='mueller'),
  'LD Systems ICOA PRO Club XL Touring Bundle Set','https://www.musikhaus-mueller.de/ld-systems-icoa-pro-club-xl-touring-bundle-set/','2 × ICOA PRO 15 A; 2 × ICOA PRO SUB 21 A; 2 × ICOA 15 PC; 2 × SUB 21 PC; 2 × SUB 21 CB; 2 × Gravity SP 2332 B; 2 × XLR 3 m; 2 × PowerCon 3 m.','similar',null,
  'Kernsystem, Hüllen und Rollbretter entsprechen der Referenz; zusätzlich Distanzrohre sowie XLR-/PowerCon-Kabel.','https://www.musikhaus-mueller.de/ld-systems-icoa-pro-club-xl-touring-bundle-set/','LD Systems ICOA PRO Club XL Touring Bundle Set',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',true,
  '{"audit_40of40":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
  shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
  contents=excluded.contents,match_type=excluded.match_type,note=excluded.note,
  source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
  active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,7619,'EUR','success','catalog',true,'LD Systems ICOA PRO Club XL Touring Bundle Set',
  'Musikhaus Müller aktuell verifiziert · 04.11.2026',
  '2026-11-04T21:20:00Z'::timestamptz,
  '{"audit_40of40":true,"new_offer":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r29' and s.slug='mueller'
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

commit;
