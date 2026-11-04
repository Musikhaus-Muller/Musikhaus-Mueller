-- Add verified Music Store MAUI 11 G3 Power cart.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r10'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · MAUI 11 G3 Power Bundle',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000',
  '2 × MAUI 11 G3 schwarz; 2 × MAUI 11 G3 SUB schwarz; 2 × XLR 1,5 m.',
  'similar',
  '2 × 929 € + 2 × 749 € + 2 × 3,90 € = 3.363,80 €',
  'Gleiche Lautsprecheranzahl und Kabellänge wie das Referenzbundle; Kabelmarke/-modell weicht ab. Mehrkomponenten-Warenkorb.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000',
  'LD-Systems MAUI 11 G3 Schwarz + MAUI 11 G3 SUB + XLR 1,5 m',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3/art-PAH0023387-000","quantity":2},{"article":"ACC0001159-001","name":"MUSIC STORE Mikrokabel Standard 1,5 m","quantity":2}]}'::jsonb
)
on conflict (configuration_id, shop_id) do update set
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
  metadata=excluded.metadata,
  updated_at=now();

insert into public.price_observations
  (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
values (
  (select o2.id from public.offers o2
   join public.configurations c on c.id=o2.configuration_id
   join public.shops s on s.id=o2.shop_id
   where c.legacy_id='r10' and s.slug='musicstore'),
  3363.8,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · MAUI 11 G3 Power Bundle',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:20:00Z'::timestamptz,
  '{"multi_component":true}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
