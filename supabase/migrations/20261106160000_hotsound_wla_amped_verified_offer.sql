begin;

with proposed as (
  select
    'r40'::text as legacy_id,
    'Wharfedale Pro WLA-210XP Line Array Set Amped Set 1'::text as product_name,
    'https://www.hotsound-store.com/wharfedale-pro-wla-210xp-line-array-set-amped-set-1-19042'::text as product_url,
    '8 × WLA-210XP; 2 × WLA-210X Flug-/Stackingrahmen; 2 × DP-4100F MK2 Endstufe.'::text as contents,
    15290::numeric as price,
    'exact_price'::text as classification,
    'catalog'::text as source_method
),
upserted_offer as (
  insert into public.offers as existing_offer
    (configuration_id,shop_id,shop_product_name,product_url,contents,match_type,
     calculation,note,source_url,source_name,evidence,active,metadata)
  select
    c.id,s.id,p.product_name,p.product_url,p.contents,'exact',
    null,
    'Direct verified HotSound Amped set matching the WLA-210XP reference including two DP-4100F MK2 amplifiers.',
    p.product_url,p.product_name,
    'HotSound official public Amped Set product page verified · 2026-11-06',
    true,
    jsonb_build_object(
      'direct_bundle',true,
      'classification',p.classification
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
  returning id
)
insert into public.price_observations as existing_observation
  (offer_id,price,currency,status,source_method,verified,raw_product_name,evidence,observed_at,metadata)
select
  o.id,p.price,'EUR','success',p.source_method,true,p.product_name,
  'HotSound verified WLA Amped offer pricing · 2026-11-06',
  '2026-11-06T15:00:00Z'::timestamptz,
  jsonb_build_object('audit_40of40',true,'classification',p.classification)
from upserted_offer o
cross join proposed p
on conflict (offer_id,source_method,observed_at) do update set
  price=excluded.price,
  verified=true,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=coalesce(existing_observation.metadata,'{}'::jsonb) || excluded.metadata;

commit;
