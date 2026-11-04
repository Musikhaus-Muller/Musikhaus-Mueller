-- Add verified Music Store ICOA PRO 12A / 21A cart.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r28'),
  (select id from public.shops where slug='musicstore'),
  'Music Store Warenkorb · ICOA PRO 12A / 21A',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-12-A/art-PAH0024126-000',
  '2 × ICOA Pro 12 A; 2 × ICOA Pro Sub 21 A; 2 × Gravity SP 2332 B; 2 × XLR 3 m.',
  'similar',
  '2 × 1.089 € + 2 × 2.198 € + 2 × 22 € + 2 × 4,90 € = 6.627,80 €',
  'Gleiche Lautsprecher und Distanzstangenmodell wie das Müller-Bundle; Kabelmarke/-modell weicht ab. Mehrkomponenten-Warenkorb.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-12-A/art-PAH0024126-000',
  'LD-Systems ICOA Pro 12 A + ICOA Pro Sub 21 A + Gravity SP 2332 B + XLR 3 m',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"multi-component cart","components":[{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-12-A/art-PAH0024126-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-Sub-21-A/art-PAH0024128-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/Gravity-SP-2332-B/art-PAH0018485-000","quantity":2},{"url":"https://www.musicstore.de/de_DE/EUR/MUSIC-STORE-Mikrokabel-Standard-3-m/art-ACC0001159-002","quantity":2}]}'::jsonb
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
   where c.legacy_id='r28' and s.slug='musicstore'),
  6627.8,
  'EUR',
  'success',
  'catalog',
  true,
  'Music Store Warenkorb · ICOA PRO 12A / 21A',
  'Music Store Produktseiten/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:35:00Z'::timestamptz,
  '{"multi_component":true}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
