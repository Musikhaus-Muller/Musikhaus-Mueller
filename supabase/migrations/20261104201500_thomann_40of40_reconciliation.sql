-- Thomann 40/40 reconciliation on 2026-11-04.
begin;

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1409,'EUR','success','catalog',true,o.shop_product_name,'Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r3' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2818,'EUR','success','catalog',true,o.shop_product_name,'Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r4' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2669,'EUR','success','catalog',true,o.shop_product_name,'Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r6' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3159,'EUR','success','catalog',true,o.shop_product_name,'Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r7' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,3959,'EUR','success','catalog',true,o.shop_product_name,'Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r20' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,6669,'EUR','success','catalog',true,o.shop_product_name,'Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r21' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2099,'EUR','success','catalog',true,o.shop_product_name,'Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"price_reconciled":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r22' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values ((select id from public.configurations where legacy_id='r23'),(select id from public.shops where slug='thomann'),'Thomann Warenkorb · ICOA 1215 Bluetooth','https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm','2 × ICOA 12 A BT; 1 × ICOA SUB 15 A; 1 × Gravity SS 5211 B Set 1 (2 Stative + Tasche); 2 × Sommer Stage 22 SGHN 6,0 m.','similar','2 × 429 € + 729 € + 129 € + 2 × 18,90 € = 1.753,80 €','Gleiche Lautsprecherkonfiguration und Zubehörfunktion; Stativ-/Kabelmodell weicht vom Referenzbundle ab.','https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm','Thomann Warenkorb · ICOA 1215 Bluetooth','Thomann aktuell verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_icoa_sub_15_a.htm","quantity":1},{"url":"https://www.thomann.de/de/gravity_ss_5211_b_set_1.htm","quantity":1},{"url":"https://www.thomann.de/de/sommer_cable_stage_22_sghn_bk_60m.htm","quantity":2}]}'::jsonb)
on conflict (configuration_id,shop_id) do update set shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,1753.8,'EUR','success','catalog',true,'Thomann Warenkorb · ICOA 1215 Bluetooth','Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r23' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values ((select id from public.configurations where legacy_id='r24'),(select id from public.shops where slug='thomann'),'Thomann Warenkorb · ICOA Club Bluetooth','https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm','2 × ICOA 12 A BT; 2 × ICOA SUB 18 A; 2 × Gravity SP 2332 B; 2 × Sommer Stage 22 SG0Q 3 m.','similar','2 × 429 € + 2 × 845 € + 2 × 22 € + 2 × 22,50 € = 2.637 €','Gleiche Lautsprecher und Distanzstangenmodell; Kabelmodell weicht vom Referenzbundle ab.','https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm','Thomann Warenkorb · ICOA Club Bluetooth','Thomann aktuell verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_icoa_sub_18_a.htm","quantity":2},{"url":"https://www.thomann.de/de/gravity_sp_2332_b_speaker_stand.htm","quantity":2},{"url":"https://www.thomann.de/de/sommer_cable_stage_22_sg0q_3m.htm","quantity":2}]}'::jsonb)
on conflict (configuration_id,shop_id) do update set shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2637,'EUR','success','catalog',true,'Thomann Warenkorb · ICOA Club Bluetooth','Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r24' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values ((select id from public.configurations where legacy_id='r25'),(select id from public.shops where slug='thomann'),'Thomann Warenkorb · ICOA Club XL Bluetooth','https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm','2 × ICOA 15 A BT; 2 × ICOA SUB 18 A; 2 × Gravity SP 2332 B; 2 × Sommer Stage 22 SG0Q 3 m.','similar','2 × 469 € + 2 × 845 € + 2 × 22 € + 2 × 22,50 € = 2.717 €','Gleiche Lautsprecher und Distanzstangenmodell; Kabelmodell weicht vom Referenzbundle ab.','https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm','Thomann Warenkorb · ICOA Club XL Bluetooth','Thomann aktuell verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_icoa_sub_18_a.htm","quantity":2},{"url":"https://www.thomann.de/de/gravity_sp_2332_b_speaker_stand.htm","quantity":2},{"url":"https://www.thomann.de/de/sommer_cable_stage_22_sg0q_3m.htm","quantity":2}]}'::jsonb)
on conflict (configuration_id,shop_id) do update set shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,2717,'EUR','success','catalog',true,'Thomann Warenkorb · ICOA Club XL Bluetooth','Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r25' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values ((select id from public.configurations where legacy_id='r26'),(select id from public.shops where slug='thomann'),'Thomann Warenkorb · ICOA Power Bluetooth','https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm','2 × ICOA 15 A BT; 4 × ICOA SUB 18 A; 4 × Sommer Stage 22 SG0Q 3 m.','similar','2 × 469 € + 4 × 845 € + 4 × 22,50 € = 4.408 €','Gleiche Lautsprecheranzahl und Kabellänge; Kabelmodell weicht vom Referenzbundle ab.','https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm','Thomann Warenkorb · ICOA Power Bluetooth','Thomann aktuell verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_icoa_sub_18_a.htm","quantity":4},{"url":"https://www.thomann.de/de/sommer_cable_stage_22_sg0q_3m.htm","quantity":4}]}'::jsonb)
on conflict (configuration_id,shop_id) do update set shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4408,'EUR','success','catalog',true,'Thomann Warenkorb · ICOA Power Bluetooth','Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r26' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

insert into public.offers (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
values ((select id from public.configurations where legacy_id='r27'),(select id from public.shops where slug='thomann'),'Thomann Warenkorb · ICOA PRO Entertain Touring','https://www.thomann.de/de/ld_systems_icoa_pro_12_a.htm','2 × ICOA Pro 12 A; 1 × ICOA SUB Pro 21 A; 2 × ICOA 12 Cover; 1 × ICOA PRO SUB 21 Cover; 1 × ICOA PRO SUB 21 Casterboard; 1 × Gravity SS 5211 B Set 1; 2 × Sommer Stage 22 SGHN 5 m.','similar','2 × 1.089 € + 2.190 € + 2 × 66 € + 89 € + 196 € + 129 € + 2 × 17,50 € = 4.949 €','Gleiche Kernlautsprecher- und Touringfunktion; Stativ-/Kabelmodell weicht vom Müller-Referenzbundle ab.','https://www.thomann.de/de/ld_systems_icoa_pro_12_a.htm','Thomann Warenkorb · ICOA PRO Entertain Touring','Thomann aktuell verifiziert · 04.11.2026',true,'{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_icoa_pro_12_a.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_icoa_sub_pro_21_a.htm","quantity":1},{"url":"https://www.thomann.de/de/ld_systems_icoa_12_cover.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_icoa_pro_sub_21_cover.htm","quantity":1},{"url":"https://www.thomann.de/de/ld_systems_icoa_pro_sub_21_casterboard.htm","quantity":1},{"url":"https://www.thomann.de/de/gravity_ss_5211_b_set_1.htm","quantity":1},{"url":"https://www.thomann.de/de/sommer_cable_stage_22_sghn_bk_50m.htm","quantity":2}]}'::jsonb)
on conflict (configuration_id,shop_id) do update set shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,active=true,metadata=excluded.metadata,updated_at=now();

insert into public.price_observations (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,4949,'EUR','success','catalog',true,'Thomann Warenkorb · ICOA PRO Entertain Touring','Thomann aktuell verifiziert · 04.11.2026','2026-11-04T19:30:00Z'::timestamptz,'{"audit_40of40":true,"multi_component":true}'::jsonb
from public.offers o join public.configurations c on c.id=o.configuration_id join public.shops s on s.id=o.shop_id
where c.legacy_id='r27' and s.slug='thomann'
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,evidence=excluded.evidence,metadata=excluded.metadata;

commit;
