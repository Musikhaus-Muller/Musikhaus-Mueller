-- PRO LIGHTING 40/40 reconciliation on 2026-11-04.
begin;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1858,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r1' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2841.5,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r4' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2578,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r5' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2658,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r6' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3098,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r7' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3369,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r19' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4479,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r20' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,7349,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r21' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2098,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r30' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2178,'EUR','success','catalog',true,o.shop_product_name,
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"available":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r31' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r3'),
 (select id from public.shops where slug='prolighting'),
 'LD Systems MAUI 28 G3 + Taschenset','https://www.prolighting.de/de/artikel/127076','1 × MAUI 28 G3 schwarz; 1 × Säulentasche; 1 × Subwooferhülle.','exact',
 null,
 'Direktes PRO LIGHTING Set mit gleicher Referenzkonfiguration.','https://www.prolighting.de/de/artikel/127076','LD Systems MAUI 28 G3 + Taschenset',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',true,
 '{"direct_bundle":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
 contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,
 note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,
 evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1289,'EUR','success','catalog',true,'LD Systems MAUI 28 G3 + Taschenset',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":false}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r3' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r32'),
 (select id from public.shops where slug='prolighting'),
 'PRO LIGHTING Warenkorb · FRIGGA Stereo schwarz + Taschen','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html','2 × DAP Frigga schwarz; 2 × Tragetasche für Frigga Top; 2 × Transporthülle für Frigga Sub.','exact',
 '2 × (1.049 € + 127,90 € + 87,90 €) = 2.529,60 €',
 'Gleiche System- und Taschen/Hüllen-Konfiguration wie die Referenz.','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html','PRO LIGHTING Warenkorb · FRIGGA Stereo schwarz + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',true,
 '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html","quantity":2},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-tragetasche-fuer-frigga-top-schwarz-codura.html","quantity":2},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-transporthuelle-fuer-frigga-sub-schwarz-codura.html","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
 contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,
 note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,
 evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2529.6,'EUR','success','catalog',true,'PRO LIGHTING Warenkorb · FRIGGA Stereo schwarz + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r32' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r33'),
 (select id from public.shops where slug='prolighting'),
 'PRO LIGHTING Warenkorb · FRIGGA Stereo weiß + Taschen','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html','2 × DAP Frigga weiß; 2 × Tragetasche für Frigga Top; 2 × Transporthülle für Frigga Sub.','exact',
 '2 × (1.089 € + 127,90 € + 87,90 €) = 2.609,60 €',
 'Gleiche System- und Taschen/Hüllen-Konfiguration wie die Referenz.','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html','PRO LIGHTING Warenkorb · FRIGGA Stereo weiß + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',true,
 '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html","quantity":2},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-tragetasche-fuer-frigga-top-schwarz-codura.html","quantity":2},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-transporthuelle-fuer-frigga-sub-schwarz-codura.html","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
 contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,
 note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,
 evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2609.6,'EUR','success','catalog',true,'PRO LIGHTING Warenkorb · FRIGGA Stereo weiß + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r33' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r34'),
 (select id from public.shops where slug='prolighting'),
 'PRO LIGHTING Warenkorb · FRIGGA Schwarz + Taschen','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html','1 × DAP Frigga schwarz; 1 × Tragetasche für Frigga Top; 1 × Transporthülle für Frigga Sub.','exact',
 '1.049 € + 127,90 € + 87,90 € = 1.264,80 €',
 'Gleiche System- und Taschen/Hüllen-Konfiguration wie die Referenz.','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html','PRO LIGHTING Warenkorb · FRIGGA Schwarz + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',true,
 '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html","quantity":1},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-tragetasche-fuer-frigga-top-schwarz-codura.html","quantity":1},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-transporthuelle-fuer-frigga-sub-schwarz-codura.html","quantity":1}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
 contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,
 note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,
 evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1264.8,'EUR','success','catalog',true,'PRO LIGHTING Warenkorb · FRIGGA Schwarz + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r34' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r35'),
 (select id from public.shops where slug='prolighting'),
 'PRO LIGHTING Warenkorb · FRIGGA Weiß + Taschen','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html','1 × DAP Frigga weiß; 1 × Tragetasche für Frigga Top; 1 × Transporthülle für Frigga Sub.','exact',
 '1.089 € + 127,90 € + 87,90 € = 1.304,80 €',
 'Gleiche System- und Taschen/Hüllen-Konfiguration wie die Referenz.','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html','PRO LIGHTING Warenkorb · FRIGGA Weiß + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',true,
 '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html","quantity":1},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-tragetasche-fuer-frigga-top-schwarz-codura.html","quantity":1},{"url":"https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-transporthuelle-fuer-frigga-sub-schwarz-codura.html","quantity":1}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,
 contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,
 note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,
 evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1304.8,'EUR','success','catalog',true,'PRO LIGHTING Warenkorb · FRIGGA Weiß + Taschen',
 'PRO LIGHTING aktuell verifiziert · 04.11.2026',
 '2026-11-04T20:30:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o
join public.configurations c on c.id=o.configuration_id
join public.shops s on s.id=o.shop_id
where c.legacy_id='r35' and s.slug='prolighting'
on conflict (offer_id,source_method,observed_at) do update set
 price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

commit;
