-- Final Thomann audit additions.
begin;

insert into public.offers
  (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
values (
  (select id from public.configurations where legacy_id='r5'),
  (select id from public.shops where slug='thomann'),
  '2 × LD Systems Maui 28 G3',
  'https://www.thomann.de/de/ld_systems_maui_28_g3.htm',
  '2 × MAUI 28 G3 schwarz.',
  'exact',
  '2 × 1.289 € = 2.578 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.thomann.de/de/ld_systems_maui_28_g3.htm',
  '2 × LD Systems Maui 28 G3',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_maui_28_g3.htm","quantity":2}]}'::jsonb
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
   where c.legacy_id='r5' and s.slug='thomann'),
  2578,
  'EUR',
  'success',
  'catalog',
  true,
  '2 × LD Systems Maui 28 G3',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T16:05:00Z'::timestamptz,
  '{"audit":true,"calculated":true}'::jsonb
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
  (select id from public.shops where slug='thomann'),
  'LD Systems Maui 28 G3 White Stereo Bundle',
  'https://www.thomann.de/de/ld_systems_maui_28_g3_white_stereo_bundle.htm',
  '2 × MAUI 28 G3 weiß.',
  'exact',
  null,
  'Direktes Thomann-Bundle aus zwei weißen MAUI 28 G3.',
  'https://www.thomann.de/de/ld_systems_maui_28_g3_white_stereo_bundle.htm',
  'LD Systems Maui 28 G3 White Stereo Bundle',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"direct_bundle":true}'::jsonb
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
   where c.legacy_id='r6' and s.slug='thomann'),
  2839,
  'EUR',
  'success',
  'catalog',
  true,
  'LD Systems Maui 28 G3 White Stereo Bundle',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T16:05:00Z'::timestamptz,
  '{"audit":true,"calculated":false}'::jsonb
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
  (select id from public.configurations where legacy_id='r8'),
  (select id from public.shops where slug='thomann'),
  '2 × LD Systems Maui 44 G2',
  'https://www.thomann.de/de/ld_systems_maui_44_g2.htm',
  '2 × MAUI 44 G2 schwarz.',
  'exact',
  '2 × 2.179 € = 4.358 €',
  'Berechneter Warenkorb aus zwei identischen Einzelangeboten.',
  'https://www.thomann.de/de/ld_systems_maui_44_g2.htm',
  '2 × LD Systems Maui 44 G2',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_maui_44_g2.htm","quantity":2}]}'::jsonb
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
   where c.legacy_id='r8' and s.slug='thomann'),
  4358,
  'EUR',
  'success',
  'catalog',
  true,
  '2 × LD Systems Maui 44 G2',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T16:05:00Z'::timestamptz,
  '{"audit":true,"calculated":true}'::jsonb
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
  (select id from public.configurations where legacy_id='r9'),
  (select id from public.shops where slug='thomann'),
  'Thomann Warenkorb · MAUI 44 G2 Stereo Touring',
  'https://www.thomann.de/de/ld_systems_maui_44_g2.htm',
  '2 × MAUI 44 G2; 2 × Sub Bag; 2 × Sat Bag; 2 × Wheelboard.',
  'exact',
  '2 × 2.179 € + 2 × 65 € + 2 × 99 € + 2 × 125 € = 4.936 €',
  'Gleiche System-, Hüllen- und Rollbrett-Konfiguration wie das Referenzbundle.',
  'https://www.thomann.de/de/ld_systems_maui_44_g2.htm',
  'Thomann Warenkorb · MAUI 44 G2 Stereo Touring',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  true,
  '{"collection_disabled":true,"collection_disabled_reason":"calculated/multi-component cart","components":[{"url":"https://www.thomann.de/de/ld_systems_maui_44_g2.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_maui_44_g2_sub_bag.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_maui_44_g2_sat_bag.htm","quantity":2},{"url":"https://www.thomann.de/de/ld_systems_wheelboard_f._maui_44_g2.htm","quantity":2}]}'::jsonb
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
   where c.legacy_id='r9' and s.slug='thomann'),
  4936,
  'EUR',
  'success',
  'catalog',
  true,
  'Thomann Warenkorb · MAUI 44 G2 Stereo Touring',
  'Thomann Produktseite/Katalog öffentlich verifiziert · 04.11.2026',
  '2026-11-04T16:05:00Z'::timestamptz,
  '{"audit":true,"calculated":true}'::jsonb
)
on conflict (offer_id, source_method, observed_at) do update set
  price=excluded.price,
  verified=excluded.verified,
  raw_product_name=excluded.raw_product_name,
  evidence=excluded.evidence,
  metadata=excluded.metadata;

commit;
