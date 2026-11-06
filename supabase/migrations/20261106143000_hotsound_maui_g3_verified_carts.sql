begin;

with proposed(
  legacy_id, product_name, product_url, contents, price, calculation,
  classification, source_method, components
) as (
  values
    (
      'r5',
      'HotSound Warenkorb · MAUI 28 G3 Stereo',
      'https://www.hotsound-store.com/ld-systems-maui-28-g3-11671',
      '2 × MAUI 28 G3 schwarz.',
      2590,
      '2 × 1.295 € = 2.590 €',
      'complete_component_calc',
      'component_calc',
      jsonb_build_array(
        jsonb_build_object(
          'name','LD Systems MAUI 28 G3',
          'url','https://www.hotsound-store.com/ld-systems-maui-28-g3-11671',
          'quantity',2,'unit_price',1295
        )
      )
    ),
    (
      'r10',
      'HotSound Warenkorb · MAUI 11 G3 Power Bundle',
      'https://www.hotsound-store.com/ld-systems-maui-11-g3-11673',
      '2 × MAUI 11 G3 schwarz; 2 × MAUI 11 G3 SUB.',
      3328,
      '2 × 919 € + 2 × 745 € = 3.328 €',
      'complete_component_calc',
      'component_calc',
      jsonb_build_array(
        jsonb_build_object(
          'name','LD Systems MAUI 11 G3',
          'url','https://www.hotsound-store.com/ld-systems-maui-11-g3-11673',
          'quantity',2,'unit_price',919
        ),
        jsonb_build_object(
          'name','LD Systems MAUI 11 G3 SUB',
          'url','https://www.hotsound-store.com/ld-systems-maui-11-g3-sub-11682',
          'quantity',2,'unit_price',745
        )
      )
    ),
    (
      'r11',
      'HotSound Warenkorb · MAUI 28 G3 Power Bundle',
      'https://www.hotsound-store.com/ld-systems-maui-28-g3-11671',
      '2 × MAUI 28 G3 schwarz; 2 × MAUI 28 G3 SUB.',
      4468,
      '2 × 1.295 € + 2 × 939 € = 4.468 €',
      'complete_component_calc',
      'component_calc',
      jsonb_build_array(
        jsonb_build_object(
          'name','LD Systems MAUI 28 G3',
          'url','https://www.hotsound-store.com/ld-systems-maui-28-g3-11671',
          'quantity',2,'unit_price',1295
        ),
        jsonb_build_object(
          'name','LD Systems MAUI 28 G3 SUB',
          'url','https://www.hotsound-store.com/ld-systems-maui-28-g3-sub-11684',
          'quantity',2,'unit_price',939
        )
      )
    )
),
upserted_offers as (
  insert into public.offers as existing_offer
    (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,
     calculation,note,source_url,source_name,evidence,active,metadata)
  select
    c.id,s.id,p.product_name,p.product_url,p.contents,'exact',
    p.calculation,
    'Complete verified HotSound component cart; all required structural products and quantities are included.',
    p.product_url,p.product_name,
    'HotSound official public product pages verified · 2026-11-06',
    true,
    jsonb_build_object(
      'collection_disabled',true,
      'collection_disabled_reason','multi-component cart',
      'classification',p.classification,
      'components',p.components
    )
  from proposed p
  join public.configurations c on c.legacy_id=p.legacy_id
  join public.shops s on s.slug='hotsound'
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
    'HotSound official public component price verified · 2026-11-06',
    '2026-11-06T13:30:00Z'::timestamptz,
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
        and old.observed_at='2026-11-06T13:30:00Z'::timestamptz
    )
  returning id
)
insert into public.price_observations as existing_observation
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select
  o.id,p.price,'EUR','success',p.source_method,true,p.product_name,
  'HotSound verified offer pricing · 2026-11-06',
  '2026-11-06T13:30:00Z'::timestamptz,
  jsonb_build_object('audit_40of40',true,'classification',p.classification)
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
