-- Expand Music Store coverage with verified multi-component carts.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r2'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · MAUI 11 G3 Stereo + Taschen',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000',
  '2 × MAUI 11 G3 schwarz; 2 × MAUI 11 G3 SAT BAG; 2 × MAUI 11 G3 SUB PC.',
  'exact',
  '2 × 929 € + 2 × 67 € + 2 × 52 € = 2.096 €',
  'Berechneter Warenkorb aus sechs Einzelartikeln; automatische Einzel-URL-Preisprüfung deaktiviert.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000',
  'Music Store Warenkorb · MAUI 11 G3 Stereo + Taschen',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-SAT-BAG/art-PAH0023393-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-SUB-PC/art-PAH0023394-000","quantity":2}]}'::jsonb
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
   where c.legacy_id='r2' and s.slug='musicstore'),
  2096,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · MAUI 11 G3 Stereo + Taschen',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T14:45:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r3'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · MAUI 28 G3 + Taschen',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000',
  '1 × MAUI 28 G3 schwarz; 1 × MAUI 28 G3 SAT BAG; 1 × MAUI 28 G3 SUB PC.',
  'exact',
  '1.289 € + 89 € + 55 € = 1.433 €',
  'Berechneter Warenkorb aus drei Einzelartikeln; automatische Einzel-URL-Preisprüfung deaktiviert.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000',
  'Music Store Warenkorb · MAUI 28 G3 + Taschen',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-SAT-BAG/art-PAH0023423-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-SUB-PC/art-PAH0023395-000","quantity":1}]}'::jsonb
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
   where c.legacy_id='r3' and s.slug='musicstore'),
  1433,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · MAUI 28 G3 + Taschen',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T14:45:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r4'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · MAUI 28 G3 Stereo + Taschen',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000',
  '2 × MAUI 28 G3 schwarz; 2 × MAUI 28 G3 SAT BAG; 2 × MAUI 28 G3 SUB PC.',
  'exact',
  '2 × 1.289 € + 2 × 89 € + 2 × 55 € = 2.866 €',
  'Berechneter Warenkorb aus sechs Einzelartikeln; automatische Einzel-URL-Preisprüfung deaktiviert.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000',
  'Music Store Warenkorb · MAUI 28 G3 Stereo + Taschen',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-SAT-BAG/art-PAH0023423-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-SUB-PC/art-PAH0023395-000","quantity":2}]}'::jsonb
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
   where c.legacy_id='r4' and s.slug='musicstore'),
  2866,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · MAUI 28 G3 Stereo + Taschen',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T14:45:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r15'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · DAVE 12 G4X + Stative + 2×10m Kabel',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-12-G4X/art-PAH0023214-000',
  '1 × DAVE 12 G4X; MUSIC STORE Box 3 Set: 2 × Stativ inkl. Tasche + 2 × Lautsprecherkabel 10 m.',
  'similar',
  '998 € + 125 € = 1.123 €',
  'Gleiche PA-Anlage und Zubehörfunktion; Zubehörmarke/-modell weicht von anderen Händlern ab. Automatische Einzel-URL-Preisprüfung deaktiviert.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-12-G4X/art-PAH0023214-000',
  'Music Store Warenkorb · DAVE 12 G4X + Stative + 2×10m Kabel',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-12-G4X/art-PAH0023214-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Box-3-Set-Kabel-10m-PASSIV/art-PAH343","quantity":1}]}'::jsonb
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
   where c.legacy_id='r15' and s.slug='musicstore'),
  1123,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · DAVE 12 G4X + Stative + 2×10m Kabel',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T14:45:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r16'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · DAVE 15 G4X + Stative + 2×10m Kabel',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-15-G4X/art-PAH0023215-000',
  '1 × DAVE 15 G4X; MUSIC STORE Box 3 Set: 2 × Stativ inkl. Tasche + 2 × Lautsprecherkabel 10 m.',
  'similar',
  '1.199 € + 125 € = 1.324 €',
  'Gleiche PA-Anlage und Zubehörfunktion; Zubehörmarke/-modell weicht von anderen Händlern ab. Automatische Einzel-URL-Preisprüfung deaktiviert.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-15-G4X/art-PAH0023215-000',
  'Music Store Warenkorb · DAVE 15 G4X + Stative + 2×10m Kabel',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-15-G4X/art-PAH0023215-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Box-3-Set-Kabel-10m-PASSIV/art-PAH343","quantity":1}]}'::jsonb
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
   where c.legacy_id='r16' and s.slug='musicstore'),
  1324,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · DAVE 15 G4X + Stative + 2×10m Kabel',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T14:45:00Z'::timestamptz,
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
  (select id from public.configurations where legacy_id='r17'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · DAVE 18 G4X + Stative + 2×10m Kabel',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-18-G4X/art-PAH0023216-000',
  '1 × DAVE 18 G4X; MUSIC STORE Box 3 Set: 2 × Stativ inkl. Tasche + 2 × Lautsprecherkabel 10 m.',
  'similar',
  '1.539 € + 125 € = 1.664 €',
  'Gleiche PA-Anlage und Zubehörfunktion; Zubehörmarke/-modell weicht von anderen Händlern ab. Automatische Einzel-URL-Preisprüfung deaktiviert.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-18-G4X/art-PAH0023216-000',
  'Music Store Warenkorb · DAVE 18 G4X + Stative + 2×10m Kabel',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-18-G4X/art-PAH0023216-000","quantity":1},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Box-3-Set-Kabel-10m-PASSIV/art-PAH343","quantity":1}]}'::jsonb
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
   where c.legacy_id='r17' and s.slug='musicstore'),
  1664,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · DAVE 18 G4X + Stative + 2×10m Kabel',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T14:45:00Z'::timestamptz,
  '{"multi_component":true}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
