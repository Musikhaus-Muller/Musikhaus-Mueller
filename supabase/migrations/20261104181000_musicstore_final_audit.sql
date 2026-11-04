-- Final Music Store audit additions: MAUI 11/28 G2 bundles.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r13'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · MAUI 11 G2 Bundle',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-11-G2/art-PAH0018045-000',
  '1 × MAUI 11 G2 schwarz; 1 × MAUI 11 G2 Sat Bag; 1 × MAUI 11 G2 Sub PC.',
  'exact',
  '729 € + 65 € + 45 € = 839 €',
  'Gleiche System- und Taschenkonfiguration wie das Referenzbundle.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-11-G2/art-PAH0018045-000',
  'Music Store Warenkorb · MAUI 11 G2 Bundle',
  'Music Store Produktseiten öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-11-G2/art-PAH0018045-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-11-G2-Sat-Bag/art-PAH0018753-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-11-G2-Sub-PC/art-PAH0018754-000","quantity":1}]}'::jsonb
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
   where c.legacy_id='r13' and s.slug='musicstore'),
  839,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · MAUI 11 G2 Bundle',
  'Music Store Produktseiten öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:45:00Z'::timestamptz,
  '{"multi_component":true}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r14'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · MAUI 28 G2 Bundle',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-28-G2/art-PAH0018043-000',
  '1 × MAUI 28 G2 schwarz; 1 × MAUI 28 G2 Sat Bag; 1 × MAUI 28 G2 Sub PC.',
  'exact',
  '949 € + 85 € + 45 € = 1.079 €',
  'Gleiche System- und Taschenkonfiguration wie das Referenzbundle.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-28-G2/art-PAH0018043-000',
  'Music Store Warenkorb · MAUI 28 G2 Bundle',
  'Music Store Produktseiten öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-28-G2/art-PAH0018043-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-28-G2-Sat-Bag/art-PAH0018692-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-28-G2-Sub-PC/art-PAH0018755-000","quantity":1}]}'::jsonb
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
   where c.legacy_id='r14' and s.slug='musicstore'),
  1079,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · MAUI 28 G2 Bundle',
  'Music Store Produktseiten öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:45:00Z'::timestamptz,
  '{"multi_component":true}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
