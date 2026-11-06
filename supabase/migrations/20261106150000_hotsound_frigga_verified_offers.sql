begin;

with proposed(
  legacy_id, product_name, product_url, contents, price, calculation,
  classification, source_method, components
) as (
  values
    (
      'r30',
      'DAP Frigga Stereo schwarz',
      'https://www.hotsound-store.com/dap-frigga-stereo-aktives-stereo-saeulen-pa-system-schwarz-14921',
      '2 × DAP Frigga schwarz.',
      2290,
      null,
      'exact_price',
      'catalog',
      '[]'::jsonb
    ),
    (
      'r33',
      'HotSound Warenkorb · FRIGGA Stereo weiß + Taschen',
      'https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258',
      '2 × DAP Frigga weiß; 2 × Tasche für Frigga Tops; 2 × Transport Cover für Frigga Sub.',
      3166,
      '2 × 1.349 € + 2 × 129 € + 2 × 105 € = 3.166 €',
      'complete_component_calc',
      'component_calc',
      jsonb_build_array(
        jsonb_build_object('name','DAP Frigga weiß','url','https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258','quantity',2,'unit_price',1349),
        jsonb_build_object('name','DAP Bag für Frigga Tops','url','https://www.hotsound-store.com/dap-bag-fuer-frigga-tops-13260','quantity',2,'unit_price',129),
        jsonb_build_object('name','DAP Transport Cover für Frigga Sub','url','https://www.hotsound-store.com/dap-transport-cover-fuer-frigga-sub-13259','quantity',2,'unit_price',105)
      )
    ),
    (
      'r34',
      'HotSound Warenkorb · FRIGGA Schwarz + Taschen',
      'https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-schwarz-13257',
      '1 × DAP Frigga schwarz; 1 × Tasche für Frigga Tops; 1 × Transport Cover für Frigga Sub.',
      1379,
      '1.145 € + 129 € + 105 € = 1.379 €',
      'complete_component_calc',
      'component_calc',
      jsonb_build_array(
        jsonb_build_object('name','DAP Frigga schwarz','url','https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-schwarz-13257','quantity',1,'unit_price',1145),
        jsonb_build_object('name','DAP Bag für Frigga Tops','url','https://www.hotsound-store.com/dap-bag-fuer-frigga-tops-13260','quantity',1,'unit_price',129),
        jsonb_build_object('name','DAP Transport Cover für Frigga Sub','url','https://www.hotsound-store.com/dap-transport-cover-fuer-frigga-sub-13259','quantity',1,'unit_price',105)
      )
    ),
    (
      'r35',
      'HotSound Warenkorb · FRIGGA Weiß + Taschen',
      'https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258',
      '1 × DAP Frigga weiß; 1 × Tasche für Frigga Tops; 1 × Transport Cover für Frigga Sub.',
      1583,
      '1.349 € + 129 € + 105 € = 1.583 €',
      'complete_component_calc',
      'component_calc',
      jsonb_build_array(
        jsonb_build_object('name','DAP Frigga weiß','url','https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258','quantity',1,'unit_price',1349),
        jsonb_build_object('name','DAP Bag für Frigga Tops','url','https://www.hotsound-store.com/dap-bag-fuer-frigga-tops-13260','quantity',1,'unit_price',129),
        jsonb_build_object('name','DAP Transport Cover für Frigga Sub','url','https://www.hotsound-store.com/dap-transport-cover-fuer-frigga-sub-13259','quantity',1,'unit_price',105)
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
    case when p.classification='exact_price'
      then 'Direct verified HotSound stereo set matching the reference configuration.'
      else 'Complete verified HotSound component cart; all required systems, bags and covers are included.'
    end,
    p.product_url,p.product_name,
    'HotSound official public product pages verified · 2026-11-06',
    true,
    case when p.classification='exact_price'
      then jsonb_build_object('direct_bundle',true,'classification',p.classification)
      else jsonb_build_object(
        'collection_disabled',true,
        'collection_disabled_reason','multi-component cart',
        'classification',p.classification,
        'components',p.components
      )
    end
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
    '2026-11-06T14:30:00Z'::timestamptz,
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
        and old.observed_at='2026-11-06T14:30:00Z'::timestamptz
    )
  returning id
)
insert into public.price_observations as existing_observation
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select
  o.id,p.price,'EUR','success',p.source_method,true,p.product_name,
  'HotSound verified FRIGGA offer pricing · 2026-11-06',
  '2026-11-06T14:30:00Z'::timestamptz,
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
