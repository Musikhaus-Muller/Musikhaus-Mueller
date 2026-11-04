-- Expand Music Store coverage with ICOA multi-component carts.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r23'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · ICOA 1215 Bluetooth',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000',
  '2 × ICOA 12 A BT; 1 × ICOA SUB 15 A; 1 × MUSIC STORE Lautsprecherstative Bundle (2 Stative + Tasche); 2 × XLR 6 m.',
  'similar',
  '2 × 429 € + 729 € + 89 € + 2 × 5,90 € = 1.687,80 €',
  'Gleiche Lautsprecherkonfiguration und Zubehörfunktion wie das Referenzbundle; Stativ-/Kabelmarke weicht ab.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000',
  'Music Store Warenkorb · ICOA 1215 Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-SUB-15-A/art-PAH0022032-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Lautsprecherstative-Bundle/art-PAH431","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Mikrokabel-Standard-6-m/art-ACC0001265-000","quantity":2}]}'::jsonb
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
   where c.legacy_id='r23' and s.slug='musicstore'),
  1687.8,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · ICOA 1215 Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:10:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r24'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · ICOA Club Bluetooth',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000',
  '2 × ICOA 12 A BT; 2 × ICOA SUB 18 A; 2 × Gravity SP 2332 B; 2 × XLR 3 m.',
  'similar',
  '2 × 429 € + 2 × 845 € + 2 × 22 € + 2 × 4,90 € = 2.601,80 €',
  'Gleiche Lautsprecher und Distanzstangenmodell; Kabelmarke/-modell weicht ab.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000',
  'Music Store Warenkorb · ICOA Club Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-SUB-18-A/art-PAH0022033-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/Gravity-SP-2332-B/art-PAH0018485-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Mikrokabel-Standard-3-m/art-ACC0001159-002","quantity":2}]}'::jsonb
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
   where c.legacy_id='r24' and s.slug='musicstore'),
  2601.8,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · ICOA Club Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:10:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r25'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · ICOA Club XL Bluetooth',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000',
  '2 × ICOA 15 A BT; 2 × ICOA SUB 18 A; 2 × Gravity SP 2332 B; 2 × XLR 3 m.',
  'similar',
  '2 × 469 € + 2 × 845 € + 2 × 22 € + 2 × 4,90 € = 2.681,80 €',
  'Gleiche Lautsprecher und Distanzstangenmodell; Kabelmarke/-modell weicht ab.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000',
  'Music Store Warenkorb · ICOA Club XL Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-SUB-18-A/art-PAH0022033-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/Gravity-SP-2332-B/art-PAH0018485-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Mikrokabel-Standard-3-m/art-ACC0001159-002","quantity":2}]}'::jsonb
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
   where c.legacy_id='r25' and s.slug='musicstore'),
  2681.8,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · ICOA Club XL Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:10:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r26'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · ICOA Power Bluetooth',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000',
  '2 × ICOA 15 A BT; 4 × ICOA SUB 18 A; 4 × XLR 3 m.',
  'similar',
  '2 × 469 € + 4 × 845 € + 4 × 4,90 € = 4.337,60 €',
  'Gleiche Lautsprecheranzahl und Kabellänge wie das Referenzbundle; Kabelmarke/-modell weicht ab.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000',
  'Music Store Warenkorb · ICOA Power Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-SUB-18-A/art-PAH0022033-000","quantity":4},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Mikrokabel-Standard-3-m/art-ACC0001159-002","quantity":4}]}'::jsonb
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
   where c.legacy_id='r26' and s.slug='musicstore'),
  4337.6,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · ICOA Power Bluetooth',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:10:00Z'::timestamptz,
  '{"multi_component":true}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
