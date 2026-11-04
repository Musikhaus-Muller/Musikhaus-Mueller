-- Initial verified Music Store offers for exact single-product x2 configurations.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r1'),
  (select id from public.shops where slug='musicstore'),
  '2 × LD-Systems MAUI 11 G3 Schwarz',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000',
  '2 × MAUI 11 G3 schwarz.',
  'exact',
  '2 × 929 € = 1858 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000',
  'LD-Systems MAUI 11 G3 Schwarz',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"unit_price":929,"quantity":2,"article_url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000"}'::jsonb
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
   where c.legacy_id='r1' and s.slug='musicstore'),
  1858,
  'EUR',
  'success',
  'catalog',
  true,
  '2 × LD-Systems MAUI 11 G3 Schwarz',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T12:00:00Z'::timestamptz,
  '{"unit_price":929,"quantity":2}'::jsonb
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
  (select id from public.configurations where legacy_id='r5'),
  (select id from public.shops where slug='musicstore'),
  '2 × LD-Systems MAUI 28 G3 Schwarz',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000',
  '2 × MAUI 28 G3 schwarz.',
  'exact',
  '2 × 1.289 € = 2.578 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000',
  'LD-Systems MAUI 28 G3 Schwarz',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"unit_price":1289,"quantity":2,"article_url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000"}'::jsonb
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
   where c.legacy_id='r5' and s.slug='musicstore'),
  2578,
  'EUR',
  'success',
  'catalog',
  true,
  '2 × LD-Systems MAUI 28 G3 Schwarz',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T12:00:00Z'::timestamptz,
  '{"unit_price":1289,"quantity":2}'::jsonb
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
  (select id from public.configurations where legacy_id='r6'),
  (select id from public.shops where slug='musicstore'),
  '2 × LD-Systems MAUI 28 G3 W',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-W/art-PAH0023386-000',
  '2 × MAUI 28 G3 weiß.',
  'exact',
  '2 × 1.349 € = 2.698 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-W/art-PAH0023386-000',
  'LD-Systems MAUI 28 G3 W',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"unit_price":1349,"quantity":2,"article_url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-W/art-PAH0023386-000"}'::jsonb
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
   where c.legacy_id='r6' and s.slug='musicstore'),
  2698,
  'EUR',
  'success',
  'catalog',
  true,
  '2 × LD-Systems MAUI 28 G3 W',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T12:00:00Z'::timestamptz,
  '{"unit_price":1349,"quantity":2}'::jsonb
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
  (select id from public.configurations where legacy_id='r7'),
  (select id from public.shops where slug='musicstore'),
  '2 × LD-Systems MAUI 28 G3 MIX Schwarz',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-MIX-Schwarz/art-PAH0023713-000',
  '2 × MAUI 28 G3 MIX schwarz.',
  'exact',
  '2 × 1.549 € = 3.098 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-MIX-Schwarz/art-PAH0023713-000',
  'LD-Systems MAUI 28 G3 MIX Schwarz',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"unit_price":1549,"quantity":2,"article_url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-MIX-Schwarz/art-PAH0023713-000"}'::jsonb
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
   where c.legacy_id='r7' and s.slug='musicstore'),
  3098,
  'EUR',
  'success',
  'catalog',
  true,
  '2 × LD-Systems MAUI 28 G3 MIX Schwarz',
  'Music Store Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T12:00:00Z'::timestamptz,
  '{"unit_price":1549,"quantity":2}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
