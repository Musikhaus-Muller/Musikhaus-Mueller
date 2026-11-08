begin;

-- r29 is a complete component cart only after every exact component was
-- individually verified on PRO LIGHTING. This migration is not applied here.
with proposed(legacy_id,product_name,product_url,contents,price,calculation,availability,components) as (
  values (
    'r29',
    'PRO LIGHTING Warenkorb · ICOA PRO 15A / 21A Power',
    'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-r-pro-15-a-15-aktiver-koaxialer-hochleistungs-pa-lautsprecher-mit-bluetooth-und-app.html',
    '2 × ICOA PRO 15 A; 2 × ICOA SUB 21 A PRO; 2 × ICOA 15 PC; 2 × ICOA PRO SUB 21 PC; 2 × ICOA PRO SUB 21 CB; 2 × Gravity SP 2332 B; 2 × Cordial PEAK CPM 3 FM-FLEX audio XLR, 3 m; 2 × PSSO PowerCon Verbindungskabel 3 m.',
    8032.90,
    '2 × 1.289 € + 2 × 2.289 € + 2 × 52,90 € + 2 × 104,95 € + 2 × 194,90 € + 2 × 23,90 € + 2 × 20,90 € + 2 × 40,90 € = 8.032,90 €',
    'future_stock',
    jsonb_build_array(
      jsonb_build_object('name','LD Systems ICOA PRO 15 A schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-r-pro-15-a-15-aktiver-koaxialer-hochleistungs-pa-lautsprecher-mit-bluetooth-und-app.html','sku','AHLDICOA15APRO','quantity',2,'unit_price',1289,'availability','future_stock','available_from','2026-12-01'),
      jsonb_build_object('name','LD Systems ICOA SUB 21 A PRO schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-r-sub-21-a-pro-aktiver-21-hochleistungs-subwoofer.html','sku','AHLDICOASUB21APRO','quantity',2,'unit_price',2289,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA 15 PC','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/ld-systems-icoa-15-pc-gepolsterte-schutzhuelle-fuer-icoa-15.html','sku','AHLDICOA15PC','quantity',2,'unit_price',52.90,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA PRO SUB 21 PC','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie/ld-systems-icoa-r-pro-sub-21-pc-gepolsterte-schutzhuelle-fuer-icoa-r-pro-sub-21-a.html','sku','AHLDICOASUB21PROPC','quantity',2,'unit_price',104.95,'availability','in_stock'),
      jsonb_build_object('name','LD Systems ICOA PRO SUB 21 CB','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie.html','sku','AHLDICOASUB21PROCB','source_identity','family_page_sku_price','quantity',2,'unit_price',194.90,'availability','in_stock'),
      jsonb_build_object('name','Gravity SP 2332 B','url','https://www.prolighting.de/de/stative/distanzstange/distanzstange-35mm/gravity-sp-2332-b-verstellbares-distanzrohr-35-mm-auf-m20-1400-mmgravity-sp-2332-b-verstellbares-distanzrohr-35.html','sku','AHGSP2332B','quantity',2,'unit_price',23.90,'availability','in_stock'),
      jsonb_build_object('name','Cordial PEAK CPM 3 FM-FLEX audio XLR 3 m','url','https://www.prolighting.de/de/zubehoer/kabel-stecker/audiokabel/xlr-xlr/cordial-peak-cpm-3-fm-flex-3-0-m-neutrik-xlr-female-schwarz-xlr-male-schwarz.html','sku','CPM03FMFX','quantity',2,'unit_price',20.90,'availability','in_stock'),
      jsonb_build_object('name','PSSO PowerCon Verbindungskabel 3x1,5 3 m','url','https://www.prolighting.de/de/zubehoer/kabel-stecker/stromkabel/powerconkabel/psso-powercon-verbindungskabel-3x1-5-3m.html','sku','3023503R','quantity',2,'unit_price',40.90,'availability','in_stock')
    )
  )
), upserted_offers as (
  insert into public.offers as current_offer
    (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,calculation,note,source_url,source_name,evidence,active,metadata)
  select c.id,s.id,p.product_name,p.product_url,p.contents,'exact',p.calculation,
    'Complete verified component cart; no WPC, DMX, or accessory substitution.',p.product_url,p.product_name,
    'PRO LIGHTING official public component pages verified · 2026-11-08',true,
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
    jsonb_build_object('unit_price',(x.value->>'unit_price')::numeric,'price_currency','EUR','availability',x.value->>'availability','available_from',x.value->>'available_from','sku',x.value->>'sku','source_identity',x.value->>'source_identity')
  from upserted_offers o join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
  cross join lateral jsonb_array_elements(p.components) with ordinality x(value,ordinality)
  on conflict (offer_id,position) do update set label=excluded.label,quantity=excluded.quantity,product_url=excluded.product_url,expected_product_name=excluded.expected_product_name,
    metadata=coalesce(current_component.metadata,'{}'::jsonb) || excluded.metadata,active=true,updated_at=now()
  returning id,offer_id,position
), component_observations as (
  insert into public.component_price_observations (offer_component_id,price,currency,availability,status,source_method,verified,evidence,observed_at,metadata)
  select cr.id,(x.value->>'unit_price')::numeric,'EUR',x.value->>'availability','success','catalog',true,
    'PRO LIGHTING official public component price verified · 2026-11-08','2026-11-08T12:30:00Z'::timestamptz,
    jsonb_build_object('quantity',(x.value->>'quantity')::numeric,'sku',x.value->>'sku','source_identity',x.value->>'source_identity')
  from component_rows cr join public.offers o on o.id=cr.offer_id join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
  cross join lateral jsonb_array_elements(p.components) with ordinality x(value,ordinality)
  where cr.position=x.ordinality::integer and not exists (select 1 from public.component_price_observations old where old.offer_component_id=cr.id and old.observed_at='2026-11-08T12:30:00Z'::timestamptz)
  returning id
)
insert into public.price_observations as current_observation (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select o.id,p.price,'EUR','success','component_calc',true,p.product_name,'PRO LIGHTING complete component cart verified · 2026-11-08','2026-11-08T12:30:00Z'::timestamptz,
  jsonb_build_object('classification','complete_component_calc','availability',p.availability)
from upserted_offers o join public.configurations c on c.id=o.configuration_id join proposed p on p.legacy_id=c.legacy_id
on conflict (offer_id,source_method,observed_at) do update set price=excluded.price,verified=true,raw_product_name=excluded.raw_product_name,evidence=excluded.evidence,
  metadata=coalesce(current_observation.metadata,'{}'::jsonb) || excluded.metadata;

commit;
