begin;

with proposed as (
  select 'r27'::text legacy_id,'PRO LIGHTING Warenkorb · ICOA PRO Entertain Touring'::text product_name,'https://www.ld-systems.com/en/icoa-12-pc-ldicoa12pc'::text product_url,
    '2 × ICOA PRO 12 A; 1 × ICOA PRO SUB 21 A; 2 × ICOA 12 PC; 1 × ICOA PRO SUB 21 PC; 1 × ICOA PRO SUB 21 CB; 1 × Gravity SS 5212 B SET 1; 2 × Cordial FAIR LINE audio XLR, 5 m.'::text contents,
    5003.13::numeric price,'2 × 1.089 € + 2.289 € + 2 × 40,90 € + 104,95 € + 194,90 € + 129,90 € + 2 × 12,29 € = 5.003,13 €'::text calculation,
    jsonb_build_array(
      jsonb_build_object('name','LD Systems ICOA PRO 12 A','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie.html?sort=1&view=list','sku','AHLDICOA12APRO','source_identity','family_page_sku_price','quantity',2,'unit_price',1089,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA SUB 21 A PRO','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie.html?sort=1&view=list','sku','AHLDICOASUB21APRO','source_identity','family_page_sku_price','quantity',1,'unit_price',2289,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA 12 PC — funda acolchada para ICOA PRO 12','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/ld-systems-icoa-12-pc-gepolsterte-schutzhuelle-fuer-icoa-12.html','sku','AHLDICOA12PC','source_identity','manufacturer_compatible_with_icoa_pro_12','quantity',2,'unit_price',40.90,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA PRO SUB 21 PC','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie/ld-systems-icoa-r-pro-sub-21-pc-gepolsterte-schutzhuelle-fuer-icoa-r-pro-sub-21-a.html','sku','AHLDICOASUB21PROPC','quantity',1,'unit_price',104.95,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA PRO SUB 21 CB','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie.html?sort=1&view=list','sku','AHLDICOASUB21PROCB','source_identity','family_page_sku_price','quantity',1,'unit_price',194.90,'availability','in_stock'),
      jsonb_build_object('name','Gravity SS 5212 B SET 1 — 2 × SP 5212 B + BG SS 2 B','url','https://www.prolighting.de/de/stative/boxenstaender/gravity-ss-5212-b-set-1-boxenstaender-set-2-boxenstaender-stahl-mit-tasche.html','sku','AHGSS5212BSET1','source_identity','set_contains_2x_sp5212b_plus_bgss2b','quantity',1,'unit_price',129.90,'availability','in_stock'),
      jsonb_build_object('name','Cordial FAIR LINE audio XLR 5 m','url','https://www.prolighting.de/de/zubehoer/kabel-stecker/audiokabel/xlr-xlr/cordial-mikrofonkabel-fair-line-5m-xlr-xlr-mit-neutrik-rean-stecker.html','sku','CCM5FM','quantity',2,'unit_price',12.29,'availability','in_stock')
    ) components
), offer_row as (
  insert into public.offers as current_offer (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
  select c.id,s.id,p.product_name,p.product_url,p.contents,'exact',p.calculation,'Complete verified component cart; no substitutions.',p.product_url,p.product_name,'PRO LIGHTING and LD Systems official public component pages verified · 2026-11-09',true,jsonb_build_object('collection_disabled',true,'collection_disabled_reason','multi-component cart','classification','complete_component_calc','components',p.components)
  from proposed p join public.configurations c on c.legacy_id=p.legacy_id join public.shops s on s.slug='prolighting'
  on conflict (configuration_id,shop_id) do update set shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,match_type=excluded.match_type,calculation=excluded.calculation,note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,active=true,metadata=coalesce(current_offer.metadata,'{}'::jsonb) || excluded.metadata,updated_at=now()
  returning id,configuration_id
), component_row as (
  insert into public.offer_components as current_component (offer_id,position,label,quantity,product_url,expected_product_name,metadata)
  select o.id,x.ordinality::integer,x.value->>'name',(x.value->>'quantity')::numeric,x.value->>'url',x.value->>'name',jsonb_build_object('unit_price',(x.value->>'unit_price')::numeric,'price_currency','EUR','availability',x.value->>'availability','sku',x.value->>'sku','source_identity',x.value->>'source_identity')
  from offer_row o join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id cross join lateral jsonb_array_elements(p.components) with ordinality x(value,ordinality)
  on conflict (offer_id,position) do update set label=excluded.label,quantity=excluded.quantity,product_url=excluded.product_url,expected_product_name=excluded.expected_product_name,metadata=coalesce(current_component.metadata,'{}'::jsonb) || excluded.metadata,active=true,updated_at=now()
  returning id,offer_id,position
), component_observation as (
  insert into public.component_price_observations (offer_component_id,price,currency,availability,status,source_method,verified,evidence,observed_at,metadata)
  select cr.id,(x.value->>'unit_price')::numeric,'EUR',x.value->>'availability','success','catalog',true,'PRO LIGHTING official public component price verified · 2026-11-09','2026-11-09T11:00:00Z'::timestamptz,jsonb_build_object('quantity',(x.value->>'quantity')::numeric,'sku',x.value->>'sku','source_identity',x.value->>'source_identity')
  from component_row cr join public.offers o on o.id=cr.offer_id join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id cross join lateral jsonb_array_elements(p.components) with ordinality x(value,ordinality)
  where cr.position=x.ordinality::integer and not exists (select 1 from public.component_price_observations old where old.offer_component_id=cr.id and old.observed_at='2026-11-09T11:00:00Z'::timestamptz)
  returning id
)
insert into public.price_observations as current_observation (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,p.price,'EUR','success','component_calc',true,p.product_name,'PRO LIGHTING complete component cart verified · 2026-11-09','2026-11-09T11:00:00Z'::timestamptz,jsonb_build_object('classification','complete_component_calc','accessory_compatibility','LDICOA12PC manufacturer-confirmed for ICOA PRO 12')
from offer_row o join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,raw_product_name=excluded.raw_product_name,evidence=excluded.evidence,metadata=coalesce(current_observation.metadata,'{}'::jsonb) || excluded.metadata;

commit;
