begin;

-- Gap Recovery candidates: fully verified component carts only.  This migration
-- is intentionally not applied by this branch.
with proposed(legacy_id, product_name, product_url, contents, price, calculation, availability, components) as (
  values
    ('r9','PRO LIGHTING Warenkorb · MAUI 44 G2 Stereo Touring','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','2 × MAUI 44 G2 schwarz; 2 × MAUI 44 G2 SUB PC; 2 × MAUI 44 G2 SAT BAG; 2 × MAUI 44 G2 CB.',4935.80,'2 × 2.179 € + 2 × 64,90 € + 2 × 99 € + 2 × 125 € = 4.935,80 €','in_stock',jsonb_build_array(
      jsonb_build_object('name','LD Systems MAUI 44 G2 schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','quantity',2,'unit_price',2179),
      jsonb_build_object('name','LD Systems MAUI 44 G2 SUB PC','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','quantity',2,'unit_price',64.90),
      jsonb_build_object('name','LD Systems MAUI 44 G2 SAT BAG','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','quantity',2,'unit_price',99),
      jsonb_build_object('name','LD Systems MAUI 44 G2 CB','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','quantity',2,'unit_price',125))),
    ('r10','PRO LIGHTING Warenkorb · MAUI 11 G3 Power Bundle','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-g3.html?view=classic','2 × MAUI 11 G3 schwarz; 2 × MAUI 11 G3 SUB schwarz; 2 × Cordial PEAK CPM 3 FM-FLEX audio XLR, 3 m.',3389.80,'2 × 929 € + 2 × 745 € + 2 × 20,90 € = 3.389,80 €','in_stock',jsonb_build_array(
      jsonb_build_object('name','LD Systems MAUI 11 G3 schwarz','url','https://www.prolighting.de/de/kategorie/3529','quantity',2,'unit_price',929),
      jsonb_build_object('name','LD Systems MAUI 11 G3 SUB schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-g3.html?view=classic','quantity',2,'unit_price',745),
      jsonb_build_object('name','Cordial PEAK CPM 3 FM-FLEX audio XLR 3 m','url','https://www.prolighting.de/de/zubehoer/kabel-stecker/audiokabel/xlr-xlr/cordial-peak-cpm-3-fm-flex-3-0-m-neutrik-xlr-female-schwarz-xlr-male-schwarz.html','quantity',2,'unit_price',20.90))),
    ('r12','PRO LIGHTING Warenkorb · MAUI 44 G2 Power Bundle','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','2 × MAUI 44 G2 schwarz; 2 × MAUI 44 G2 SUB schwarz; 2 × Cordial PEAK CPM 3 FM-FLEX audio XLR, 3 m.',7377.80,'2 × 2.179 € + 2 × 1.489 € + 2 × 20,90 € = 7.377,80 €','future_stock',jsonb_build_array(
      jsonb_build_object('name','LD Systems MAUI 44 G2 schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','quantity',2,'unit_price',2179),
      jsonb_build_object('name','LD Systems MAUI 44 G2 SUB schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-44.html?sort=1','quantity',2,'unit_price',1489,'availability','future_stock','available_from','2027-01-05'),
      jsonb_build_object('name','Cordial PEAK CPM 3 FM-FLEX audio XLR 3 m','url','https://www.prolighting.de/de/zubehoer/kabel-stecker/audiokabel/xlr-xlr/cordial-peak-cpm-3-fm-flex-3-0-m-neutrik-xlr-female-schwarz-xlr-male-schwarz.html','quantity',2,'unit_price',20.90))),
    ('r13','PRO LIGHTING Warenkorb · MAUI 11 G2 Bundle','https://www.prolighting.de/de/kategorie/3529','1 × MAUI 11 G2 schwarz; 1 × MAUI 11 G2 SAT BAG; 1 × MAUI 11 G2 SUB PC.',839,'729 € + 65 € + 45 € = 839 €','in_stock',jsonb_build_array(
      jsonb_build_object('name','LD Systems MAUI 11 G2 schwarz','url','https://www.prolighting.de/de/kategorie/3529','quantity',1,'unit_price',729),
      jsonb_build_object('name','LD Systems MAUI 11 G2 SAT BAG','url','https://www.prolighting.de/de/kategorie/3529','quantity',1,'unit_price',65),
      jsonb_build_object('name','LD Systems MAUI 11 G2 SUB PC','url','https://www.prolighting.de/de/kategorie/3529','quantity',1,'unit_price',45)))
), offers_upsert as (
  insert into public.offers as current_offer
    (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
  select c.id,s.id,p.product_name,p.product_url,p.contents,'exact',p.calculation,
    'Complete verified component cart; no substitutions.',p.product_url,p.product_name,
    'PRO LIGHTING official public product pages verified · 2026-11-08',true,
    jsonb_build_object('collection_disabled',true,'collection_disabled_reason','multi-component cart','classification','complete_component_calc','availability',p.availability,'components',p.components)
  from proposed p join public.configurations c on c.legacy_id=p.legacy_id join public.shops s on s.slug='prolighting'
  on conflict (configuration_id,shop_id) do update set
    shop_product_name=excluded.shop_product_name,product_url=excluded.product_url,contents=excluded.contents,match_type=excluded.match_type,
    calculation=excluded.calculation,note=excluded.note,source_url=excluded.source_url,source_name=excluded.source_name,evidence=excluded.evidence,active=true,
    metadata=coalesce(current_offer.metadata,'{}'::jsonb) || excluded.metadata,updated_at=now()
  returning id,configuration_id
), component_rows as (
  insert into public.offer_components as current_component (offer_id,position,label,quantity,product_url,expected_product_name,metadata)
  select o.id,x.ordinality::integer,x.value->>'name',(x.value->>'quantity')::numeric,x.value->>'url',x.value->>'name',
    jsonb_build_object('unit_price',(x.value->>'unit_price')::numeric,'price_currency','EUR','availability',coalesce(x.value->>'availability',p.availability),'available_from',x.value->>'available_from')
  from offers_upsert o join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
  cross join lateral jsonb_array_elements(p.components) with ordinality x(value,ordinality)
  on conflict (offer_id,position) do update set label=excluded.label,quantity=excluded.quantity,product_url=excluded.product_url,expected_product_name=excluded.expected_product_name,
    metadata=coalesce(current_component.metadata,'{}'::jsonb) || excluded.metadata,active=true,updated_at=now()
  returning id,offer_id,position
), component_observations as (
  insert into public.component_price_observations (offer_component_id,price,currency,availability,status,source_method,verified,evidence,observed_at,metadata)
  select cr.id,(x.value->>'unit_price')::numeric,'EUR',coalesce(x.value->>'availability',p.availability),'success','catalog',true,
    'PRO LIGHTING official public component price verified · 2026-11-08','2026-11-08T12:00:00Z'::timestamptz,jsonb_build_object('quantity',(x.value->>'quantity')::numeric)
  from component_rows cr join public.offers o on o.id=cr.offer_id join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
  cross join lateral jsonb_array_elements(p.components) with ordinality x(value,ordinality)
  where cr.position=x.ordinality::integer and not exists (select 1 from public.component_price_observations old where old.offer_component_id=cr.id and old.observed_at='2026-11-08T12:00:00Z'::timestamptz)
  returning id
)
insert into public.price_observations as current_observation (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,p.price,'EUR','success','component_calc',true,p.product_name,'PRO LIGHTING complete component cart verified · 2026-11-08','2026-11-08T12:00:00Z'::timestamptz,
  jsonb_build_object('classification','complete_component_calc','availability',p.availability)
from offers_upsert o join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,raw_product_name=excluded.raw_product_name,evidence=excluded.evidence,
  metadata=coalesce(current_observation.metadata,'{}'::jsonb) || excluded.metadata;

commit;
