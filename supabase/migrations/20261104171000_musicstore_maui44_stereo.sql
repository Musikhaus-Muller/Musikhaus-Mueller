-- Add verified Music Store MAUI 44 G2 stereo offer.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r8'),
  (select id from public.shops where slug='musicstore'),
  '2 × LD-Systems MAUI 44 G2',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-44-G2/art-PAH0021585-000',
  '2 × MAUI 44 G2 schwarz.',
  'exact',
  '2 × 2.179 € = 4.358 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-44-G2/art-PAH0021585-000',
  'LD-Systems MAUI 44 G2',
  'Music Store Produktseite öffentlich verifiziert · 04.11.2026',
  true,
  '{"unit_price":2179,"quantity":2,"article_url":"https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-44-G2/art-PAH0021585-000"}'::jsonb
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
   where c.legacy_id='r8' and s.slug='musicstore'),
  4358,
  'EUR',
  'success',
  'catalog',
  true,
  '2 × LD-Systems MAUI 44 G2',
  'Music Store Produktseite öffentlich verifiziert · 04.11.2026',
  '2026-11-04T15:00:00Z'::timestamptz,
  '{"unit_price":2179,"quantity":2}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
