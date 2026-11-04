-- HotSound 40/40 reconciliation on 2026-11-04.
begin;

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4169,'EUR','success','catalog',true,o.shop_product_name,
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r20' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,6599,'EUR','success','catalog',true,o.shop_product_name,
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r28' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r1'),
 (select id from public.shops where slug='hotsound'),
 '2 × LD Systems MAUI 11 G3','https://www.hotsound-store.com/ld-systems-maui-11-g3-11673','2 × MAUI 11 G3 schwarz.','exact',
 '2 × 929 € = 1.858 €','Berechneter Warenkorb aus zwei identischen Einzelangeboten.','https://www.hotsound-store.com/ld-systems-maui-11-g3-11673','2 × LD Systems MAUI 11 G3',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-unit cart","components":[{"url":"https://www.hotsound-store.com/ld-systems-maui-11-g3-11673","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1858,'EUR','success','catalog',true,'2 × LD Systems MAUI 11 G3',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r1' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r2'),
 (select id from public.shops where slug='hotsound'),
 'LD Systems Maui 11 G3 SET 2 schwarz','https://www.hotsound-store.com/ld-systems-maui-11-g3-set-2-schwarz-11714','2 × MAUI 11 G3 schwarz; 2 × SUB PC; 2 × SAT Bag.','exact',
 null,'Direktes HotSound-Set mit gleicher Referenzkonfiguration.','https://www.hotsound-store.com/ld-systems-maui-11-g3-set-2-schwarz-11714','LD Systems Maui 11 G3 SET 2 schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"direct_bundle":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2047,'EUR','success','catalog',true,'LD Systems Maui 11 G3 SET 2 schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":false}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r2' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r4'),
 (select id from public.shops where slug='hotsound'),
 'LD Systems Maui 28 G3 SET 2 schwarz','https://www.hotsound-store.com/ld-systems-maui-28-g3-set-2-schwarz-11711','2 × MAUI 28 G3 schwarz; 2 × SUB PC; 2 × SAT Bag.','exact',
 null,'Direktes HotSound-Set; aktueller Katalogpreis 04.11.2026.','https://www.hotsound-store.com/ld-systems-maui-28-g3-set-2-schwarz-11711','LD Systems Maui 28 G3 SET 2 schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"direct_bundle":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2839,'EUR','success','catalog',true,'LD Systems Maui 28 G3 SET 2 schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":false}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r4' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r6'),
 (select id from public.shops where slug='hotsound'),
 '2 × LD Systems MAUI 28 G3 W weiß','https://www.hotsound-store.com/ld-systems-maui-28-g3-w-weiss-11672','2 × MAUI 28 G3 weiß.','exact',
 '2 × 1.439 € = 2.878 €','Berechneter Warenkorb aus zwei identischen Einzelangeboten.','https://www.hotsound-store.com/ld-systems-maui-28-g3-w-weiss-11672','2 × LD Systems MAUI 28 G3 W weiß',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-unit cart","components":[{"url":"https://www.hotsound-store.com/ld-systems-maui-28-g3-w-weiss-11672","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2878,'EUR','success','catalog',true,'2 × LD Systems MAUI 28 G3 W weiß',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r6' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r7'),
 (select id from public.shops where slug='hotsound'),
 '2 × LD Systems MAUI 28 G3 MIX schwarz','https://www.hotsound-store.com/ld-systems-maui-28-g3-mix-schwarz-13382','2 × MAUI 28 G3 MIX schwarz.','exact',
 '2 × 1.549 € = 3.098 €','Berechneter Warenkorb aus zwei identischen Einzelangeboten.','https://www.hotsound-store.com/ld-systems-maui-28-g3-mix-schwarz-13382','2 × LD Systems MAUI 28 G3 MIX schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-unit cart","components":[{"url":"https://www.hotsound-store.com/ld-systems-maui-28-g3-mix-schwarz-13382","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3098,'EUR','success','catalog',true,'2 × LD Systems MAUI 28 G3 MIX schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r7' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r19'),
 (select id from public.shops where slug='hotsound'),
 'LD Systems STINGER G3 EVENT SET A Aktivsystem','https://www.hotsound-store.com/ld-systems-stinger-g3-event-set-a-aktivsystem-9635','2 × STINGER 10 A G3; 2 × SUB 15 A G3; 4 × Cover; 2 × Rollbrett.','similar',
 null,'Gleiche Kernlautsprecher; Zubehörumfang weicht von der Referenz ab.','https://www.hotsound-store.com/ld-systems-stinger-g3-event-set-a-aktivsystem-9635','LD Systems STINGER G3 EVENT SET A Aktivsystem',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"direct_bundle":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3219,'EUR','success','catalog',true,'LD Systems STINGER G3 EVENT SET A Aktivsystem',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":false}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r19' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r21'),
 (select id from public.shops where slug='hotsound'),
 'LD Systems STINGER G3 IMPACT SET A Aktivsystem','https://www.hotsound-store.com/ld-systems-stinger-g3-impact-set-a-aktivsystem-9637','2 × STINGER 15 A G3; 4 × SUB 18 A G3; 6 × Cover; 4 × Rollbrett.','similar',
 null,'Gleiche Kernlautsprecher; Zubehörumfang weicht von der Referenz ab.','https://www.hotsound-store.com/ld-systems-stinger-g3-impact-set-a-aktivsystem-9637','LD Systems STINGER G3 IMPACT SET A Aktivsystem',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"direct_bundle":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,6899,'EUR','success','catalog',true,'LD Systems STINGER G3 IMPACT SET A Aktivsystem',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":false}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r21' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r31'),
 (select id from public.shops where slug='hotsound'),
 '2 × DAP Frigga weiß','https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258','2 × DAP Frigga weiß.','exact',
 '2 × 1.349 € = 2.698 €','Berechneter Warenkorb aus zwei identischen Einzelangeboten.','https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258','2 × DAP Frigga weiß',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-unit cart","components":[{"url":"https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2698,'EUR','success','catalog',true,'2 × DAP Frigga weiß',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r31' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r32'),
 (select id from public.shops where slug='hotsound'),
 'DAP Frigga Stereo Premium Set schwarz','https://www.hotsound-store.com/dap-frigga-stereo-premium-set-aktives-stereo-saeulen-pa-system-schwarz-14923','2 × DAP Frigga schwarz; 2 × Top Tragetasche; 2 × Sub Transporthülle.','exact',
 null,'Direktes HotSound-Premium-Set mit gleicher Referenzkonfiguration.','https://www.hotsound-store.com/dap-frigga-stereo-premium-set-aktives-stereo-saeulen-pa-system-schwarz-14923','DAP Frigga Stereo Premium Set schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"direct_bundle":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2848,'EUR','success','catalog',true,'DAP Frigga Stereo Premium Set schwarz',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":false}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r32' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r36'),
 (select id from public.shops where slug='hotsound'),
 '2 × Wharfedale Pro Delta X218B','https://www.hotsound-store.com/wharfedale-pro-delta-x218b-tough-tone-passiv-pa-subwoofer-4873','2 × DELTA-X218B Dual-18-Zoll Passiv-Subwoofer.','exact',
 '2 × 849 € = 1.698 €','Berechneter Warenkorb aus zwei identischen Einzelangeboten.','https://www.hotsound-store.com/wharfedale-pro-delta-x218b-tough-tone-passiv-pa-subwoofer-4873','2 × Wharfedale Pro Delta X218B',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-unit cart","components":[{"url":"https://www.hotsound-store.com/wharfedale-pro-delta-x218b-tough-tone-passiv-pa-subwoofer-4873","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1698,'EUR','success','catalog',true,'2 × Wharfedale Pro Delta X218B',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r36' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r37'),
 (select id from public.shops where slug='hotsound'),
 '2 × Wharfedale Pro Delta F18B','https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063','2 × DELTA-F18B 18-Zoll horngeladener Passiv-Subwoofer.','exact',
 '2 × 898 € = 1.796 €','Berechneter Warenkorb aus zwei identischen Einzelangeboten.','https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063','2 × Wharfedale Pro Delta F18B',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-unit cart","components":[{"url":"https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063","quantity":2}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1796,'EUR','success','catalog',true,'2 × Wharfedale Pro Delta F18B',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r37' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r38'),
 (select id from public.shops where slug='hotsound'),
 '4 × Wharfedale Pro Delta F18B','https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063','4 × DELTA-F18B 18-Zoll horngeladener Passiv-Subwoofer.','exact',
 '4 × 898 € = 3.592 €','Berechneter Warenkorb aus vier identischen Einzelangeboten.','https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063','4 × Wharfedale Pro Delta F18B',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-unit cart","components":[{"url":"https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063","quantity":4}]}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3592,'EUR','success','catalog',true,'4 × Wharfedale Pro Delta F18B',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r38' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers
 (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values (
 (select id from public.configurations where legacy_id='r39'),
 (select id from public.shops where slug='hotsound'),
 'Wharfedale Pro WLA-210XP Line Array Set 1','https://www.hotsound-store.com/wharfedale-pro-wla-210xp-line-array-set-set-1-19041','8 × WLA-210XP; 2 × WLA-210X Flug-/Stackingrahmen. Keine Endstufen.','exact',
 null,'Direktes HotSound-Set entspricht der Base-Referenz.','https://www.hotsound-store.com/wharfedale-pro-wla-210xp-line-array-set-set-1-19041','Wharfedale Pro WLA-210XP Line Array Set 1',
 'HotSound öffentlich verifiziert · 04.11.2026',true,'{"direct_bundle":true}'::jsonb
)
on conflict (configuration_id,shop_id) do update set
 shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,
 match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,
 source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,
 active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations
 (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,11690,'EUR','success','catalog',true,'Wharfedale Pro WLA-210XP Line Array Set 1',
 'HotSound öffentlich verifiziert · 04.11.2026','2026-11-04T20:50:00Z'::timestamptz,
 '{"audit_40of40":true,"multi_component":false}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r39' and s.slug='hotsound'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

commit;
