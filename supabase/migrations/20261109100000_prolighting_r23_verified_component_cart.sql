begin;

with proposed as (
  select 'r23'::text legacy_id,
    'PRO LIGHTING Warenkorb · ICOA 1215 Bluetooth'::text product_name,
    'https://www.prolighting.de/de/stative/boxenstaender/set-2x-boxenstaender-mit-tasche.html'::text product_url,
    '2 × ICOA 12 A BT; 1 × ICOA SUB 15 A; 1 × Adam Hall SPS 023 SET (2 trípodes + bolsa); 2 × Cordial PEAK CPM 6 FM audio XLR, 6 m.'::text contents,
    1536.55::numeric price,
    '2 × 399 € + 620,85 € + 63,90 € + 2 × 26,90 € = 1.536,55 €'::text calculation,
    jsonb_build_array(
      jsonb_build_object('name','LD Systems ICOA 12 A BT','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie.html','sku','AHLDICOA12ABT','quantity',2,'unit_price',399,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA SUB 15 A','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-sub-15-a-aktiver-15-bassreflex-pa-subwoofer.html','sku','AHLDICOASUB15A','quantity',1,'unit_price',620.85,'availability','in_stock'),
      jsonb_build_object('name','Adam Hall SPS 023 SET — 2 × SPS 023 + bolsa','url','https://www.prolighting.de/de/stative/boxenstaender/set-2x-boxenstaender-mit-tasche.html','sku','AHSPS023SET','source_identity','set_contains_2x_sps023_plus_bag','quantity',1,'unit_price',63.90,'availability','in_stock'),
      jsonb_build_object('name','Cordial PEAK CPM 6 FM audio XLR 6 m','url','https://www.prolighting.de/de/zubehoer/kabel-stecker/audiokabel/xlr-xlr/cordial-peak-cpm-6-fm-6-0-m-neutrik-xlr-female-schwarz-xlr-male-schwarz.html','sku','CPM6FM','quantity',2,'unit_price',26.90,'availability','in_stock')
    ) components
), offer_row as (
  insert into public.offers as current_offer (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
  select c.id,s.id,p.product_name,p.product_url,p.contents,'exact',p.calculation,'Complete verified component cart; no substitutions.',p.product_url,p.product_name,'PRO LIGHTING official public component pages verified · 2026-11-09',true,
    jsonb_build_object('collection_disabled',true,'collection_disabled_reason','multi-component cart','classification','complete_component_cart','components',p.components)
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
  select cr.id,(x.value->>'unit_price')::numeric,'EUR',x.value->>'availability','success','catalog',true,'PRO LIGHTING official public component price verified · 2026-11-09','2026-11-09T10:00:00Z'::timestamptz,jsonb_build_object('quantity',(x.value->>'quantity')::numeric,'sku',x.value->>'sku','source_identity',x.value->>'source_identity')
  from component_row cr join public.offers o on o.id=cr.offer_id join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id cross join lateral jsonb_array_elements(p.components) with ordinality x(value,ordinality)
  where cr.position=x.ordinality::integer and not exists (select 1 from public.component_price_observations old where old.offer_component_id=cr.id and old.observed_at='2026-11-09T10:00:00Z'::timestamptz)
  returning id
)
insert into public.price_observations as current_observation (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,p.price,'EUR','success','component_calc',true,p.product_name,'PRO LIGHTING complete component cart verified · 2026-11-09','2026-11-09T10:00:00Z'::timestamptz,jsonb_build_object('classification','complete_component_calc')
from offer_row o join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,raw_product_name=excluded.raw_product_name,evidence=excluded.evidence,metadata=coalesce(current_observation.metadata,'{}'::jsonb) || excluded.metadata;

commit;
