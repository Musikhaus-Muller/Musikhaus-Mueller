begin;

with proposed(
  legacy_id, product_name, product_url, contents, price, calculation, components
) as (
  values
    (
      'r2',
      '2 × LD Systems MAUI 11 G3 + Taschenset',
      'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-g3/ld-systems-maui-11-g3-taschenset.html',
      '2 × MAUI 11 G3; 2 × MAUI 11 G3 SAT BAG; 2 × MAUI 11 G3 SUB PC.',
      2096,
      '2 × 1.048 € = 2.096 €',
      jsonb_build_array(jsonb_build_object(
        'name','LD Systems MAUI 11 G3 + Taschenset',
        'url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serien/ld-systems-maui-g3/ld-systems-maui-11-g3-taschenset.html',
        'quantity',2,'unit_price',1048
      ))
    ),
    (
      'r11',
      'PRO LIGHTING Warenkorb · MAUI 28 G3 Power Bundle',
      'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-kompaktes-cardioid-saeulen-pa-system.html',
      '2 × MAUI 28 G3 schwarz; 2 × MAUI 28 G3 SUB schwarz; 2 × ah Cables 3 STAR MMF 0300 XLR, 3 m.',
      4469.44,
      '2 × 1.289 € + 2 × 939 € + 2 × 6,72 € = 4.469,44 €',
      jsonb_build_array(
        jsonb_build_object('name','LD Systems MAUI 28 G3 schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-kompaktes-cardioid-saeulen-pa-system.html','quantity',2,'unit_price',1289),
        jsonb_build_object('name','LD Systems MAUI 28 G3 SUB schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-sub-aktiver-12-subwoofer-fuer-maui-28-g3.html','quantity',2,'unit_price',939),
        jsonb_build_object('name','ah Cables 3 STAR MMF 0300 XLR 3 m','url','https://www.prolighting.de/en/accessories/cable-connectors/audio-cable/xlr-xlr/ah-cables-3-star-mmf-0300-mikrofonkabel-adam-hall-r-xlr-female-x-xlr-male-3-m.html','quantity',2,'unit_price',6.72)
      )
    ),
    (
      'r14',
      'PRO LIGHTING Warenkorb · MAUI 28 G2 Bundle',
      'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g2.html',
      '1 × MAUI 28 G2 schwarz; 1 × MAUI 28 G2 SAT BAG; 1 × MAUI 28 G2 SUB PC.',
      1049,
      '919 € + 85 € + 45 € = 1.049 €',
      jsonb_build_array(
        jsonb_build_object('name','LD Systems MAUI 28 G2 schwarz','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g2.html','quantity',1,'unit_price',919),
        jsonb_build_object('name','LD Systems MAUI 28 G2 SAT BAG','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/ld-systems-maui-28-g2-sat-bag-gepolsterte-tragetasche-fuer-maui-28-g2-saeule.html','quantity',1,'unit_price',85),
        jsonb_build_object('name','LD Systems MAUI 28 G2 SUB PC','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/ld-systems-maui-28-g2-sub-pc-gepolsterte-schutzhuelle-fuer-maui-28-g2-subwoofer.html','quantity',1,'unit_price',45)
      )
    ),
    (
      'r24',
      'PRO LIGHTING Warenkorb · ICOA Club Bluetooth',
      'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-12-a-bt-12-aktiver-koaxialer-pa-lautsprecher-mit-bluetooth.html',
      '2 × ICOA 12 A BT; 2 × ICOA SUB 18 A; 2 × Gravity SP 2332 B; 2 × ah Cables 3 STAR MMF 0300 XLR, 3 m.',
      2537.24,
      '2 × 399 € + 2 × 839 € + 2 × 23,90 € + 2 × 6,72 € = 2.537,24 €',
      jsonb_build_array(
        jsonb_build_object('name','LD Systems ICOA 12 A BT','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-12-a-bt-12-aktiver-koaxialer-pa-lautsprecher-mit-bluetooth.html','quantity',2,'unit_price',399),
        jsonb_build_object('name','LD Systems ICOA SUB 18 A','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-sub-18-a-aktiver-18-bassreflex-pa-subwoofer.html','quantity',2,'unit_price',839),
        jsonb_build_object('name','Gravity SP 2332 B','url','https://www.prolighting.de/en/stands/distance-rod/distance-rod-35mm/gravity-sp-2332-b-verstellbares-distanzrohr-35-mm-auf-m20-1400-mmgravity-sp-2332-b-verstellbares-distanzrohr-35.html','quantity',2,'unit_price',23.90),
        jsonb_build_object('name','ah Cables 3 STAR MMF 0300 XLR 3 m','url','https://www.prolighting.de/en/accessories/cable-connectors/audio-cable/xlr-xlr/ah-cables-3-star-mmf-0300-mikrofonkabel-adam-hall-r-xlr-female-x-xlr-male-3-m.html','quantity',2,'unit_price',6.72)
      )
    ),
    (
      'r25',
      'PRO LIGHTING Warenkorb · ICOA Club XL Bluetooth',
      'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-15-a-bt-15-aktiver-koaxialer-pa-lautsprecher-mit-bluetooth.html',
      '2 × ICOA 15 A BT; 2 × ICOA SUB 18 A; 2 × Gravity SP 2332 B; 2 × ah Cables 3 STAR MMF 0300 XLR, 3 m.',
      2675.04,
      '2 × 467,90 € + 2 × 839 € + 2 × 23,90 € + 2 × 6,72 € = 2.675,04 €',
      jsonb_build_array(
        jsonb_build_object('name','LD Systems ICOA 15 A BT','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-15-a-bt-15-aktiver-koaxialer-pa-lautsprecher-mit-bluetooth.html','quantity',2,'unit_price',467.90),
        jsonb_build_object('name','LD Systems ICOA SUB 18 A','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-sub-18-a-aktiver-18-bassreflex-pa-subwoofer.html','quantity',2,'unit_price',839),
        jsonb_build_object('name','Gravity SP 2332 B','url','https://www.prolighting.de/en/stands/distance-rod/distance-rod-35mm/gravity-sp-2332-b-verstellbares-distanzrohr-35-mm-auf-m20-1400-mmgravity-sp-2332-b-verstellbares-distanzrohr-35.html','quantity',2,'unit_price',23.90),
        jsonb_build_object('name','ah Cables 3 STAR MMF 0300 XLR 3 m','url','https://www.prolighting.de/en/accessories/cable-connectors/audio-cable/xlr-xlr/ah-cables-3-star-mmf-0300-mikrofonkabel-adam-hall-r-xlr-female-x-xlr-male-3-m.html','quantity',2,'unit_price',6.72)
      )
    ),
    (
      'r26',
      'PRO LIGHTING Warenkorb · ICOA Power Bluetooth',
      'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-15-a-bt-15-aktiver-koaxialer-pa-lautsprecher-mit-bluetooth.html',
      '2 × ICOA 15 A BT; 4 × ICOA SUB 18 A; 4 × ah Cables 3 STAR MMF 0300 XLR, 3 m.',
      4318.68,
      '2 × 467,90 € + 4 × 839 € + 4 × 6,72 € = 4.318,68 €',
      jsonb_build_array(
        jsonb_build_object('name','LD Systems ICOA 15 A BT','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-15-a-bt-15-aktiver-koaxialer-pa-lautsprecher-mit-bluetooth.html','quantity',2,'unit_price',467.90),
        jsonb_build_object('name','LD Systems ICOA SUB 18 A','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-sub-18-a-aktiver-18-bassreflex-pa-subwoofer.html','quantity',4,'unit_price',839),
        jsonb_build_object('name','ah Cables 3 STAR MMF 0300 XLR 3 m','url','https://www.prolighting.de/en/accessories/cable-connectors/audio-cable/xlr-xlr/ah-cables-3-star-mmf-0300-mikrofonkabel-adam-hall-r-xlr-female-x-xlr-male-3-m.html','quantity',4,'unit_price',6.72)
      )
    ),
    (
      'r28',
      'PRO LIGHTING Warenkorb · ICOA PRO Club',
      'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-r-pro-12-a-12-aktiver-koaxialer-hochleistungs-pa-lautsprecher-mit-bluetooth-und-app.html',
      '2 × ICOA PRO 12 A; 2 × ICOA PRO SUB 21 A; 2 × Gravity SP 2332 B; 2 × Cordial PEAK CPM 3 FM-FLEX Neutrik XLR, 3 m.',
      6647.60,
      '2 × 1.089 € + 2 × 2.190 € + 2 × 23,90 € + 2 × 20,90 € = 6.647,60 €',
      jsonb_build_array(
        jsonb_build_object('name','LD Systems ICOA PRO 12 A','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-r-pro-12-a-12-aktiver-koaxialer-hochleistungs-pa-lautsprecher-mit-bluetooth-und-app.html','quantity',2,'unit_price',1089),
        jsonb_build_object('name','LD Systems ICOA PRO SUB 21 A','url','https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie/ld-systems-icoa-r-sub-21-a-pro-aktiver-21-hochleistungs-subwoofer.html','quantity',2,'unit_price',2190),
        jsonb_build_object('name','Gravity SP 2332 B','url','https://www.prolighting.de/en/stands/distance-rod/distance-rod-35mm/gravity-sp-2332-b-verstellbares-distanzrohr-35-mm-auf-m20-1400-mmgravity-sp-2332-b-verstellbares-distanzrohr-35.html','quantity',2,'unit_price',23.90),
        jsonb_build_object('name','Cordial PEAK CPM 3 FM-FLEX Neutrik XLR 3 m','url','https://www.prolighting.de/de/zubehoer/kabel-stecker/audiokabel/xlr-xlr/cordial-peak-cpm-3-fm-flex-3-0-m-neutrik-xlr-female-schwarz-xlr-male-schwarz.html','quantity',2,'unit_price',20.90)
      )
    )
),
upserted_offers as (
  insert into public.offers as existing_offer
    (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,
     calculation,note,source_url,source_name,evidence,active,metadata)
  select
    c.id,s.id,p.product_name,p.product_url,p.contents,'exact',p.calculation,
    'Complete component cart; every required component and public unit price was verified.',
    p.product_url,p.product_name,
    case when p.legacy_id='r11'
      then 'PRO LIGHTING official pages verified · 2026-11-06; black MAUI 28 G3 SUB page exposes itemprop price EUR 939.00.'
      else 'PRO LIGHTING official public product pages verified · 2026-11-06'
    end,
    true,
    jsonb_build_object(
      'collection_disabled',true,
      'collection_disabled_reason','multi-component cart',
      'components',p.components
    )
  from proposed p
  join public.configurations c on c.legacy_id=p.legacy_id
  join public.shops s on s.slug='prolighting'
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
    metadata=coalesce(existing_offer.metadata,'{}'::jsonb) || excluded.metadata,
    updated_at=now()
  returning id,configuration_id
),
component_rows as (
  insert into public.offer_components as existing_component
    (offer_id,position,label,quantity,product_url,expected_product_name,metadata)
  select
    o.id,x.ordinality::integer,x.value->>'name',(x.value->>'quantity')::numeric,
    x.value->>'url',x.value->>'name',
    jsonb_build_object('unit_price',(x.value->>'unit_price')::numeric,'price_currency','EUR')
  from upserted_offers o
  join public.configurations c on c.id=o.configuration_id
  join proposed p on p.legacy_id=c.legacy_id
  cross join lateral jsonb_array_elements(p.components) with ordinality as x(value,ordinality)
  on conflict (offer_id,position) do update set
    label=excluded.label,
    quantity=excluded.quantity,
    product_url=excluded.product_url,
    expected_product_name=excluded.expected_product_name,
    metadata=coalesce(existing_component.metadata,'{}'::jsonb) || excluded.metadata,
    active=true,
    updated_at=now()
  returning id,offer_id,position
),
component_observations as (
  insert into public.component_price_observations
    (offer_component_id,price,currency,status,source_method,verified,evidence,observed_at,metadata)
  select
    cr.id,(x.value->>'unit_price')::numeric,'EUR','success','catalog',true,
    'PRO LIGHTING official public product price verified · 2026-11-06',
    '2026-11-06T09:00:00Z'::timestamptz,
    jsonb_build_object('audit_40of40',true,'quantity',(x.value->>'quantity')::numeric)
  from component_rows cr
  join public.offer_components oc on oc.id=cr.id
  join public.offers o on o.id=cr.offer_id
  join public.configurations c on c.id=o.configuration_id
  join proposed p on p.legacy_id=c.legacy_id
  cross join lateral jsonb_array_elements(p.components) with ordinality as x(value,ordinality)
  where cr.position=x.ordinality::integer
    and not exists (
      select 1 from public.component_price_observations old
      where old.offer_component_id=cr.id
        and old.observed_at='2026-11-06T09:00:00Z'::timestamptz
    )
  returning id
)
insert into public.price_observations as existing_observation
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select
  o.id,p.price,'EUR','success','component_calc',true,p.product_name,
  'PRO LIGHTING complete component cart verified · 2026-11-06',
  '2026-11-06T09:00:00Z'::timestamptz,
  jsonb_build_object('audit_40of40',true,'multi_component',true)
from upserted_offers o
join public.configurations c on c.id=o.configuration_id
join proposed p on p.legacy_id=c.legacy_id
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,
  verified=true,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=coalesce(existing_observation.metadata,'{}'::jsonb) || excluded.metadata;

commit;
