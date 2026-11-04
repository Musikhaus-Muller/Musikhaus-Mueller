-- Import current web/seed.json into Supabase.
-- Idempotent: safe to re-run.

begin;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r1', 'LD Systems', 'MAUI', 'MAUI 11 G3 Stereo', 'Schwarz · 2 Säulensysteme', 'exact', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r1'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 11 G3 Stereo Bundle Set schwarz', 'https://www.musikhaus-mueller.de/ld-systems-maui-11-g3-stereo-bundle-set-schwarz/', '2 × MAUI 11 G3, schwarz.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld-systems-maui-11-g3-stereo-bundle-set-schwarz/',
      'LD Systems MAUI 11 G3 Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","previousPrice":1849,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r1' and s.slug='mueller'),
        1849, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 11 G3 Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r1'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 11 G3 Stereo Bundle', 'https://www.thomann.de/de/ld_systems_maui_11_g3_stereo_bundle.htm', '2 × MAUI 11 G3, schwarz.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_11_g3_stereo_bundle.htm',
      'LD Systems Maui 11 G3 Stereo Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","previousPrice":1839,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r1' and s.slug='thomann'),
        1839, 'EUR', 'success', 'seed_import', true,
        'LD Systems Maui 11 G3 Stereo Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r1'),
      (select id from public.shops where slug='kirstein'),
      '2 × LD Systems MAUI 11 G3 Schwarz', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-11-G3-Schwarz.html', '2 × MAUI 11 G3, schwarz.', 'exact',
      '2 × 929 € = 1858 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-11-G3-Schwarz.html',
      '2 × LD Systems MAUI 11 G3 Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r1' and s.slug='kirstein'),
        1858, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 11 G3 Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 929 € = 1858 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r1'),
      (select id from public.shops where slug='prolighting'),
      '2 × LD Systems MAUI 11 G3, Portables Cardioid Säulen PA System', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-11-g3-portables-cardioid-saeulen-pa-system.html', '2 × MAUI 11 G3 schwarz.', 'exact',
      '2 × 929 € = 1858 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-11-g3-portables-cardioid-saeulen-pa-system.html',
      '2 × LD Systems MAUI 11 G3, Portables Cardioid Säulen PA System', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r1' and s.slug='prolighting'),
        1858, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 11 G3, Portables Cardioid Säulen PA System', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 929 € = 1858 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r2', 'LD Systems', 'MAUI', 'MAUI 11 G3 Stereo + Taschen', 'Schwarz · 2 Systeme + 4 Taschen/Hüllen', 'exact', 'Thomann: berechneter Warenkorb aus zwei identischen Einzelbundles, kein separat angebotenes Stereo-Bundle.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r2'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 11 G3 Stereo Bundle Set schwarz mit Taschen', 'https://www.musikhaus-mueller.de/ld-systems-maui-11-g3-stereo-bundle-set-schwarz-mit-taschen/', '2 × MAUI 11 G3; 2 × Säulentasche; 2 × Subwooferhülle.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld-systems-maui-11-g3-stereo-bundle-set-schwarz-mit-taschen/',
      'LD Systems MAUI 11 G3 Stereo Bundle Set schwarz mit Tan', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","previousPrice":1970,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r2' and s.slug='mueller'),
        1970, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 11 G3 Stereo Bundle Set schwarz mit Tan', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r2'),
      (select id from public.shops where slug='thomann'),
      '2 × LD Systems Maui 11 G3 Bundle', 'https://www.thomann.de/de/ld_systems_maui_11_g3_bundle.htm', '2 × Einzelbundle: je 1 × MAUI 11 G3, Sat Bag und Sub Bag.', 'exact',
      '2 × 1.029 € = 2.058 €', null, 'https://www.thomann.de/de/ld_systems_maui_11_g3_bundle.htm',
      'LD Systems Maui 11 G3 Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","previousPrice":2058,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r2' and s.slug='thomann'),
        2058, 'EUR', 'success', 'seed_import', true,
        'LD Systems Maui 11 G3 Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","calculation":"2 × 1.029 € = 2.058 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r2'),
      (select id from public.shops where slug='kirstein'),
      '2 × LD Systems MAUI 11 G3 Schwarz Set', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-11-G3-Schwarz-Set.html', '2 × MAUI 11 G3 schwarz; 2 × Säulentasche; 2 × Subwooferhülle.', 'exact',
      '2 × 1027 € = 2054 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-11-G3-Schwarz-Set.html',
      '2 × LD Systems MAUI 11 G3 Schwarz Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r2' and s.slug='kirstein'),
        2054, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 11 G3 Schwarz Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1027 € = 2054 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r3', 'LD Systems', 'MAUI', 'MAUI 28 G3 + Taschen', 'Schwarz · 1 System + Säulentasche + Subhülle', 'exact', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r3'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 28 G3 Bundle Set schwarz mit Taschen', 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_bundle_set_schwarz_mit_taschen/', '1 × MAUI 28 G3; 1 × SUB PC; 1 × SAT BAG.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_bundle_set_schwarz_mit_taschen/',
      'LD Systems MAUI 28 G3 Bundle Set schwarz mit Taschen', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1398,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r3' and s.slug='mueller'),
        1398, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 28 G3 Bundle Set schwarz mit Taschen', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r3'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 28 G3 Bundle', 'https://www.thomann.de/de/ld_systems_maui_28_g3_bundle.htm', '1 × MAUI 28 G3; 1 × Sat Bag; 1 × Sub Bag.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_28_g3_bundle.htm',
      'LD Systems Maui 28 G3 Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":1415,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r3' and s.slug='thomann'),
        1415, 'EUR', 'success', 'seed_import', false,
        'LD Systems Maui 28 G3 Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r3'),
      (select id from public.shops where slug='kirstein'),
      'LD Systems MAUI 28 G3 Schwarz Set', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz-Set.html', '1 × MAUI 28 G3 schwarz; 1 × Säulentasche; 1 × Subwooferhülle.', 'exact',
      null, null, 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz-Set.html',
      'LD Systems MAUI 28 G3 Schwarz Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r3' and s.slug='kirstein'),
        1404, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 28 G3 Schwarz Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r4', 'LD Systems', 'MAUI', 'MAUI 28 G3 Stereo + Taschen', 'Schwarz · 2 Systeme + 4 Taschen/Hüllen', 'exact', 'Thomann: berechneter Warenkorb aus zwei Einzelbundles.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r4'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 28 G3 Stereo Bundle Set schwarz mit Taschen', 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_stereo_bundle_set_schwarz_mit_tas/', '2 × MAUI 28 G3; 2 × SUB PC; 2 × SAT BAG.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_stereo_bundle_set_schwarz_mit_tas/',
      'LD Systems MAUI 28 G3 Stereo Bundle Set schwarz mit Tas', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2850,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r4' and s.slug='mueller'),
        2839, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 28 G3 Stereo Bundle Set schwarz mit Tas', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r4'),
      (select id from public.shops where slug='thomann'),
      '2 × LD Systems Maui 28 G3 Bundle', 'https://www.thomann.de/de/ld_systems_maui_28_g3_bundle.htm', '2 × Einzelbundle: je 1 × MAUI 28 G3, Sat Bag und Sub Bag.', 'exact',
      '2 × 1.415 € = 2.830 €', null, 'https://www.thomann.de/de/ld_systems_maui_28_g3_bundle.htm',
      '2 × LD Systems Maui 28 G3 Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":2830,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r4' and s.slug='thomann'),
        2830, 'EUR', 'success', 'seed_import', false,
        '2 × LD Systems Maui 28 G3 Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":"2 × 1.415 € = 2.830 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r4'),
      (select id from public.shops where slug='kirstein'),
      '2 × LD Systems MAUI 28 G3 Schwarz Set', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz-Set.html', '2 × MAUI 28 G3 schwarz; 2 × Säulentasche; 2 × Subwooferhülle.', 'exact',
      '2 × 1404 € = 2808 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz-Set.html',
      '2 × LD Systems MAUI 28 G3 Schwarz Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r4' and s.slug='kirstein'),
        2808, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 28 G3 Schwarz Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1404 € = 2808 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r4'),
      (select id from public.shops where slug='prolighting'),
      'LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-stereo-bundle-2x-maui-28-g3-taschen.html', '2 × MAUI 28 G3 schwarz; 2 × Säulentasche; 2 × Subwooferhülle.', 'exact',
      null, null, 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-stereo-bundle-2x-maui-28-g3-taschen.html',
      'LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r4' and s.slug='prolighting'),
        2841.5, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r5', 'LD Systems', 'MAUI', 'MAUI 28 G3 Stereo', 'Schwarz · 2 Säulensysteme', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r5'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 28 G3 Stereo Bundle Set schwarz', 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_stereo_bundle_set_schwarz/', '2 × MAUI 28 G3, schwarz.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_stereo_bundle_set_schwarz/',
      'LD Systems MAUI 28 G3 Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2609,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r5' and s.slug='mueller'),
        2549, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 28 G3 Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r5'),
      (select id from public.shops where slug='kirstein'),
      '2 × LD Systems MAUI 28 G3 Schwarz', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz.html', '2 × MAUI 28 G3, schwarz.', 'exact',
      '2 × 1289 € = 2578 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz.html',
      '2 × LD Systems MAUI 28 G3 Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r5' and s.slug='kirstein'),
        2578, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 28 G3 Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1289 € = 2578 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r5'),
      (select id from public.shops where slug='prolighting'),
      '2 × LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-kompaktes-cardioid-saeulen-pa-system.html', '2 × MAUI 28 G3 schwarz.', 'exact',
      '2 × 1289 € = 2578 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-kompaktes-cardioid-saeulen-pa-system.html',
      '2 × LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r5' and s.slug='prolighting'),
        2578, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1289 € = 2578 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r6', 'LD Systems', 'MAUI', 'MAUI 28 G3 Stereo', 'Weiß · 2 Säulensysteme', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r6'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 28 G3 Stereo Bundle Set weiß', 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_stereo_bundle_set_weiss/', '2 × MAUI 28 G3, weiß.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_maui_28_g3_stereo_bundle_set_weiss/',
      'LD Systems MAUI 28 G3 Stereo Bundle Set weiß', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2815,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r6' and s.slug='mueller'),
        2815, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 28 G3 Stereo Bundle Set weiß', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r6'),
      (select id from public.shops where slug='prolighting'),
      '2 × LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-w-kompaktes-cardioid-saeulen-pa-system-weiss.html', '2 × MAUI 28 G3 weiß.', 'exact',
      '2 × 1329 € = 2658 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-w-kompaktes-cardioid-saeulen-pa-system-weiss.html',
      '2 × LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r6' and s.slug='prolighting'),
        2658, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1329 € = 2658 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r7', 'LD Systems', 'MAUI', 'MAUI 28 G3 DOUBLE-MIX Stereo', 'Schwarz · 2 MIX-Systeme', 'similar', 'Gleiche Lautsprecher; Zubehör abweichend.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r7'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 28 G3 DOUBLE-MIX Stereo Bundle schwarz', 'https://www.musikhaus-mueller.de/ld-systems-maui-28-g3-double-mix-stereo-bundle-schwarz-/', '2 × MAUI 28 G3 MIX, schwarz.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld-systems-maui-28-g3-double-mix-stereo-bundle-schwarz-/',
      'LD Systems MAUI 28 G3 DOUBLE-MIX schwarz Stereo Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":3069,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r7' and s.slug='mueller'),
        3069, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 28 G3 DOUBLE-MIX schwarz Stereo Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r7'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 28 G3 MIX SysLink Bundle', 'https://www.thomann.de/de/ld_systems_maui_28_g3_mix_syslink_bundle.htm', '2 × MAUI 28 G3 MIX, schwarz; 1 × pro snake CAT6E 5 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_28_g3_mix_syslink_bundle.htm',
      'LD Systems Maui 28 G3 MIX SysLink Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":3079,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r7' and s.slug='thomann'),
        3079, 'EUR', 'success', 'seed_import', false,
        'LD Systems Maui 28 G3 MIX SysLink Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r7'),
      (select id from public.shops where slug='kirstein'),
      '2 × LD Systems Maui 28 G3 Mix Schwarz', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-Maui-28-G3-Mix-Schwarz.html', '2 × MAUI 28 G3 MIX, schwarz.', 'exact',
      '2 × 1549 € = 3098 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-Maui-28-G3-Mix-Schwarz.html',
      '2 × LD Systems Maui 28 G3 Mix Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r7' and s.slug='kirstein'),
        3098, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems Maui 28 G3 Mix Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1549 € = 3098 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r7'),
      (select id from public.shops where slug='prolighting'),
      '2 × LD Systems MAUI 28 G3 MIX - Kompaktes Cardioid Säulen PA System mit Digital-Mixer, Schwarz', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-mix-kompaktes-cardioid-saeulen-pa-system-mit-digital-mixer-schwarz.html', '2 × MAUI 28 G3 MIX schwarz.', 'exact',
      '2 × 1549 € = 3098 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie/ld-systems-maui-28-g3-mix-kompaktes-cardioid-saeulen-pa-system-mit-digital-mixer-schwarz.html',
      '2 × LD Systems MAUI 28 G3 MIX - Kompaktes Cardioid Säulen PA System mit Digital-Mixer, Schwarz', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r7' and s.slug='prolighting'),
        3098, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 28 G3 MIX - Kompaktes Cardioid Säulen PA System mit Digital-Mixer, Schwarz', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1549 € = 3098 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r8', 'LD Systems', 'MAUI', 'MAUI 44 G2 Stereo', 'Schwarz · 2 Säulensysteme', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r8'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 44 G2 Stereo Bundle Set schwarz', 'https://www.musikhaus-mueller.de/ld-systems-maui-44-g2-stereo-bundle-set-schwarz/', '2 × MAUI 44 G2, schwarz.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld-systems-maui-44-g2-stereo-bundle-set-schwarz/',
      'LD Systems MAUI 44 G2 Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":4329,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r8' and s.slug='mueller'),
        4329, 'EUR', 'success', 'seed_import', true,
        'LD Systems MAUI 44 G2 Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r9', 'LD Systems', 'MAUI', 'MAUI 44 G2 Stereo Touring', 'Schwarz · 2 Systeme + Hüllen + Rollbretter', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r9'),
      (select id from public.shops where slug='mueller'),
      'LD Systems MAUI 44 G2 Stereo Bundle Set schwarz mit Taschen und Rollbrettern', 'https://www.musikhaus-mueller.de/ld-systems-maui-44-g2-stereo-bundle-set-schwarz-mit-taschen-und-rollbrettern/', '2 × MAUI 44 G2; 2 × Subhülle; 2 × Säulentasche; 2 × Rollbrett.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld-systems-maui-44-g2-stereo-bundle-set-schwarz-mit-taschen-und-rollbrettern/',
      'LD Systems Maui 44 G2 Stereo Bundle Set schwarz mit T&R', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":4839,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r9' and s.slug='mueller'),
        4839, 'EUR', 'success', 'seed_import', true,
        'LD Systems Maui 44 G2 Stereo Bundle Set schwarz mit T&R', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r10', 'LD Systems', 'MAUI', 'MAUI 11 G3 Power Bundle', '2 Systeme + 2 zusätzliche Subwoofer', 'unmatched', 'Nicht mit einem Stereo-Bundle aus nur zwei Komplettsystemen gleichzusetzen.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r10'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 11 G3 Power Bundle', 'https://www.thomann.de/de/ld_systems_maui_11_g3_power_bundle.htm', '2 × MAUI 11 G3 Komplettsystem; 2 × zusätzliche Subwoofer (4 Sub-Gehäuse insgesamt); 2 × pro snake TPM 1,5 m.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_11_g3_power_bundle.htm',
      'LD Systems Maui 11 G3 Power Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","previousPrice":3309,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r10' and s.slug='thomann'),
        3309, 'EUR', 'success', 'seed_import', true,
        'LD Systems Maui 11 G3 Power Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r11', 'LD Systems', 'MAUI', 'MAUI 28 G3 Power Bundle', '2 Systeme + 2 zusätzliche Subwoofer', 'unmatched', 'Nicht mit einem Stereo-Bundle aus nur zwei Komplettsystemen gleichzusetzen.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r11'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 28 G3 Power Bundle', 'https://www.thomann.de/de/ld_systems_maui_28_g3_power_bundle.htm', '2 × MAUI 28 G3 Komplettsystem; 2 × zusätzliche Subwoofer (4 Sub-Gehäuse insgesamt); 2 × pro snake TPM 1,5 m.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_28_g3_power_bundle.htm',
      'LD Systems Maui 28 G3 Power Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":4419,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r11' and s.slug='thomann'),
        4419, 'EUR', 'success', 'seed_import', false,
        'LD Systems Maui 28 G3 Power Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r11'),
      (select id from public.shops where slug='kirstein'),
      '2 × LD Systems MAUI 28 G3 Subwoofer Cardioid Set Schwarz', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Subwoofer-Cardioid-Set-Schwarz.html', '2 × MAUI 28 G3 Komplettsystem schwarz; 2 × zusätzlicher MAUI 28 G3 SUB; 2 × Säulentasche; 4 × Subwooferhülle; 2 × Pronomic XLR 2,5 m.', 'similar',
      '2 × 2384 € = 4768 €', 'Berechneter Warenkorb aus zwei Cardioid-Sets. Gleiche Lautsprecheranzahl wie Power-Bundle; zusätzlich Taschen/Hüllen und abweichende Kabel.', 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Subwoofer-Cardioid-Set-Schwarz.html',
      '2 × LD Systems MAUI 28 G3 Subwoofer Cardioid Set Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r11' and s.slug='kirstein'),
        4768, 'EUR', 'success', 'seed_import', true,
        '2 × LD Systems MAUI 28 G3 Subwoofer Cardioid Set Schwarz', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 2384 € = 4768 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r12', 'LD Systems', 'MAUI', 'MAUI 44 G2 Power Bundle', '2 Systeme + 2 zusätzliche Subwoofer', 'unmatched', 'Nicht mit einem Stereo-Bundle aus nur zwei Komplettsystemen gleichzusetzen.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r12'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 44 G2 Power Bundle', 'https://www.thomann.de/de/ld_systems_maui_44_g2_power_bundle.htm', '2 × MAUI 44 G2 Komplettsystem; 2 × zusätzliche Subwoofer (4 Sub-Gehäuse insgesamt); 2 × pro snake TPM 1,5 m.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_44_g2_power_bundle.htm',
      'LD Systems Maui 44 G2 Power Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":7269,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r12' and s.slug='thomann'),
        7269, 'EUR', 'success', 'seed_import', false,
        'LD Systems Maui 44 G2 Power Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r13', 'LD Systems', 'MAUI', 'MAUI 11 G2 Bundle', '1 System + Taschen', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r13'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 11 G2 Bundle', 'https://www.thomann.de/de/ld_systems_maui_11_g2_bundle.htm', '1 × MAUI 11 G2; 1 × Säulentasche; 1 × Subwooferhülle.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_11_g2_bundle.htm',
      'LD Systems Maui 11 G2 Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","previousPrice":749,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r13' and s.slug='thomann'),
        749, 'EUR', 'success', 'seed_import', true,
        'LD Systems Maui 11 G2 Bundle', 'Produktseite direkt · 03.11.2026 · MAUI-11-Nachprüfung', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Erneute MAUI-11-Prüfung erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r14', 'LD Systems', 'MAUI', 'MAUI 28 G2 Bundle', '1 System + Taschen', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r14'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Maui 28 G2 Bundle', 'https://www.thomann.de/de/ld_systems_maui_28_g2_bundle.htm', '1 × MAUI 28 G2; 1 × Säulentasche; 1 × Subwooferhülle.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_maui_28_g2_bundle.htm',
      'LD Systems Maui 28 G2 Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":999,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r14' and s.slug='thomann'),
        999, 'EUR', 'success', 'seed_import', false,
        'LD Systems Maui 28 G2 Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r15', 'LD Systems', 'DAVE', 'DAVE 12 G4X mit Stativen', '1 PA-System · Stativpaar · 2 × 10 m Kabel', 'similar', 'Gleiche PA-Anlage und Zubehörfunktion, aber Stativ-/Kabelmodelle und Tasche nicht identisch belegt.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r15'),
      (select id from public.shops where slug='mueller'),
      'LD Systems DAVE 12 G4X Bundle', 'https://www.musikhaus-mueller.de/ld_systems_dave_12_g4x_bundle/', '1 × DAVE 12 G4X; 2 × Boxenhochständer; 2 × Lautsprecherkabel 10 m. Stativmodell und Stativtasche nicht eindeutig ausgewiesen.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_dave_12_g4x_bundle/',
      'LD Systems DAVE 12 G4X Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1069,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r15' and s.slug='mueller'),
        1069, 'EUR', 'success', 'seed_import', true,
        'LD Systems DAVE 12 G4X Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r15'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Dave 12 G4X Stand Bundle', 'https://www.thomann.de/de/ld_systems_dave_12_g4x_stand_bundle.htm', '1 × DAVE 12 G4X; 2 × Millenium BS-2211B MKII inkl. Tasche; 2 × the sssnake SLL21510, 10 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_dave_12_g4x_stand_bundle.htm',
      'LD Systems Dave 12 G4X Stand Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1069,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r15' and s.slug='thomann'),
        1069, 'EUR', 'success', 'seed_import', true,
        'LD Systems Dave 12 G4X Stand Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r15'),
      (select id from public.shops where slug='kirstein'),
      'LD Systems Dave 12 G4X Set', 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-12-G4X-Set.html', '1 × DAVE 12 G4X; 2 × Lautsprecherstativ Pronomic SPS-1S BK; 2 × Pronomic BOXSP1-10 10 m.', 'similar',
      null, 'Gleiches PA-System, Anzahl Stative und Kabellänge; Zubehörmarke/-modell weicht ab bzw. bei Müller nicht eindeutig angegeben. Kein identischer Warenkorb.', 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-12-G4X-Set.html',
      'LD Systems Dave 12 G4X Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r15' and s.slug='kirstein'),
        1071, 'EUR', 'success', 'seed_import', true,
        'LD Systems Dave 12 G4X Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r16', 'LD Systems', 'DAVE', 'DAVE 15 G4X mit Stativen', '1 PA-System · Stativpaar · 2 × 10 m Kabel', 'similar', 'Gleiche PA-Anlage und Zubehörfunktion, aber Stativ-/Kabelmodelle und Tasche nicht identisch belegt.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r16'),
      (select id from public.shops where slug='mueller'),
      'LD Systems DAVE 15 G4X Bundle', 'https://www.musikhaus-mueller.de/ld_systems_dave_15_g4x_bundle/', '1 × DAVE 15 G4X; 2 × Boxenhochständer; 2 × Lautsprecherkabel 10 m. Stativmodell und Stativtasche nicht eindeutig ausgewiesen.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_dave_15_g4x_bundle/',
      'LD Systems DAVE 15 G4X Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1329,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r16' and s.slug='mueller'),
        1275, 'EUR', 'success', 'seed_import', true,
        'LD Systems DAVE 15 G4X Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r16'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Dave 15 G4X Stand Bundle', 'https://www.thomann.de/de/ld_systems_dave_15_g4x_stand_bundle.htm', '1 × DAVE 15 G4X; 2 × Millenium BS-2211B MKII inkl. Tasche; 2 × the sssnake SLL21510, 10 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_dave_15_g4x_stand_bundle.htm',
      'LD Systems Dave 15 G4X Stand Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1275,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r16' and s.slug='thomann'),
        1275, 'EUR', 'success', 'seed_import', true,
        'LD Systems Dave 15 G4X Stand Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r16'),
      (select id from public.shops where slug='kirstein'),
      'LD Systems Dave 15 G4X Set', 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-15-G4X-Set.html', '1 × DAVE 15 G4X; 2 × Lautsprecherstativ Pronomic SPS-1S BK; 2 × Pronomic BOXSP1-10 10 m.', 'similar',
      null, 'Gleiches PA-System, Anzahl Stative und Kabellänge; Zubehörmarke/-modell weicht ab bzw. bei Müller nicht eindeutig angegeben. Kein identischer Warenkorb.', 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-15-G4X-Set.html',
      'LD Systems Dave 15 G4X Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r16' and s.slug='kirstein'),
        1272, 'EUR', 'success', 'seed_import', true,
        'LD Systems Dave 15 G4X Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r17', 'LD Systems', 'DAVE', 'DAVE 18 G4X mit Stativen', '1 PA-System · Stativpaar · 2 × 10 m Kabel', 'similar', 'Gleiche Lautsprecher; Zubehör abweichend.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r17'),
      (select id from public.shops where slug='mueller'),
      'LD Systems DAVE 18 G4X Bundle', 'https://www.musikhaus-mueller.de/ld_systems_dave_18_g4x_1/', '1 × DAVE 18 G4X; 2 × Boxenhochständer; 2 × Lautsprecherkabel 10 m. Stativmodell und Stativtasche nicht eindeutig ausgewiesen.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_dave_18_g4x_1/',
      'LD Systems DAVE 18 G4X Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1722,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r17' and s.slug='mueller'),
        1599, 'EUR', 'success', 'seed_import', true,
        'LD Systems DAVE 18 G4X Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r17'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Dave 18 G4X Stand Bundle', 'https://www.thomann.de/de/ld_systems_dave_18_g4x_stand_bundle.htm', '1 × DAVE 18 G4X; 2 × Millenium BS-2211B MKII inkl. Tasche; 2 × the sssnake SLL21510, 10 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_dave_18_g4x_stand_bundle.htm',
      'LD Systems Dave 18 G4X Stand Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1609,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r17' and s.slug='thomann'),
        1609, 'EUR', 'success', 'seed_import', true,
        'LD Systems Dave 18 G4X Stand Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r17'),
      (select id from public.shops where slug='kirstein'),
      'LD Systems Dave 18 G4X Set', 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-18-G4X-Set.html', '1 × DAVE 18 G4X; 2 × Lautsprecherstativ Pronomic SPS-1S BK; 2 × Pronomic BOXSP1-10 10 m.', 'similar',
      null, 'Gleiches PA-System, Anzahl Stative und Kabellänge; Zubehörmarke/-modell weicht ab bzw. bei Müller nicht eindeutig angegeben. Kein identischer Warenkorb.', 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-18-G4X-Set.html',
      'LD Systems Dave 18 G4X Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r17' and s.slug='kirstein'),
        1612, 'EUR', 'success', 'seed_import', true,
        'LD Systems Dave 18 G4X Set', 'Produktseite direkt (HTTP 200), JSON-LD Offer und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r18', 'LD Systems', 'DAVE', 'DAVE 10 G4X Install Bundle', '1 System · Wand-/Deckenhalter', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r18'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Dave 10 G4X Install Bundle', 'https://www.thomann.de/de/ld_systems_dave_10_g4x_install_bundle.htm', '1 × DAVE 10 G4X; 2 × SAT WMB 10 B Wand-/Deckenhalter.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_dave_10_g4x_install_bundle.htm',
      'LD Systems Dave 10 G4X Install Bundle', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":748,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r18' and s.slug='thomann'),
        748, 'EUR', 'success', 'seed_import', true,
        'LD Systems Dave 10 G4X Install Bundle', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r19', 'LD Systems', 'STINGER', 'STINGER 10 / SUB 15 G3', '2 Tops · 2 Subs · Zubehör abweichend', 'similar', 'Gleiche Lautsprecher, anderes Transport- und Anschlusszubehör. Der Preisunterschied ist keine Ersparnis für identischen Lieferumfang.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r19'),
      (select id from public.shops where slug='mueller'),
      'LD Systems Stinger G3 Event Bundle Set Aktiv', 'https://www.musikhaus-mueller.de/ld_systems_stinger_g3_event_set_a/', '2 × Stinger 10A G3; 2 × SUB 15A G3; Top-Hüllen und Rollbretter. Keine Stangen/Kabel genannt.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_stinger_g3_event_set_a/',
      'LD Systems Stinger G3 Event Set A', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":3219,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r19' and s.slug='mueller'),
        3219, 'EUR', 'success', 'seed_import', true,
        'LD Systems Stinger G3 Event Set A', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r19'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Stinger 10/Sub15 Power Bundle', 'https://www.thomann.de/de/ld_systems_stinger_10_sub15_power_bundle.htm', '2 × Stinger 10A G3; 2 × SUB 15A G3; 4 Hüllen; 2 × Roadworx Multi Pole + Tasche; 2 × Sommer Monolith1 Power Twist/XLR 2,5 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_stinger_10_sub15_power_bundle.htm',
      'LD Systems Stinger 10/Sub15 Power Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":3305,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r19' and s.slug='thomann'),
        3305, 'EUR', 'success', 'seed_import', false,
        'LD Systems Stinger 10/Sub15 Power Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r19'),
      (select id from public.shops where slug='prolighting'),
      'LD Systems STINGER G3 EVENT SET A - 2 x 10" Aktiv-PA-Lautsprecher + 2 x 15" Aktiv-Subwoofer', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie/ld-systems-stinger-g3-event-set-a-2-x-10-aktiv-pa-lautsprecher-2-x-15-aktiv-subwoofer.html', '2 × STINGER 10 A G3; 2 × SUB 15 A G3; 2 × Top-Cover; 2 × Sub-Cover; 2 × Rollbrett.', 'similar',
      null, 'Shop meldet aktuell nicht verfügbar; nicht in der Preisrangfolge berücksichtigt. Zusätzliche Subwooferhüllen gegenüber der erfassten Referenzkonfiguration.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie/ld-systems-stinger-g3-event-set-a-2-x-10-aktiv-pa-lautsprecher-2-x-15-aktiv-subwoofer.html',
      'LD Systems STINGER G3 EVENT SET A - 2 x 10" Aktiv-PA-Lautsprecher + 2 x 15" Aktiv-Subwoofer', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r19' and s.slug='prolighting'),
        3369, 'EUR', 'success', 'seed_import', true,
        'LD Systems STINGER G3 EVENT SET A - 2 x 10" Aktiv-PA-Lautsprecher + 2 x 15" Aktiv-Subwoofer', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r20', 'LD Systems', 'STINGER', 'STINGER 12 / SUB 18 G3', '2 Tops · 2 Subs · Zubehör abweichend', 'similar', 'Gleiche Lautsprecher; Zubehör abweichend.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r20'),
      (select id from public.shops where slug='mueller'),
      'LD Systems Stinger G3 Power Bundle Set Aktiv', 'https://www.musikhaus-mueller.de/ld_systems_stinger_g3_power_set_a/', '2 × Stinger 12A G3; 2 × SUB 18A G3; Hüllensatz; 2 Rollbretter. Keine Stangen/Kabel genannt.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_stinger_g3_power_set_a/',
      'LD Systems Stinger G3 Power Set A', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":4169,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r20' and s.slug='mueller'),
        4169, 'EUR', 'success', 'seed_import', true,
        'LD Systems Stinger G3 Power Set A', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r20'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Stinger 12/Sub18 Power Bundle', 'https://www.thomann.de/de/ld_systems_stinger_12_sub18_power_bundle.htm', '2 × Stinger 12A G3; 2 × SUB 18A G3; 4 Hüllen; 2 × Roadworx Multi Pole + Tasche; 2 × Sommer Monolith1 2,5 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_stinger_12_sub18_power_bundle.htm',
      'LD Systems Stinger 12/Sub18 Power Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":3979,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r20' and s.slug='thomann'),
        3979, 'EUR', 'success', 'seed_import', false,
        'LD Systems Stinger 12/Sub18 Power Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r20'),
      (select id from public.shops where slug='hotsound'),
      'LD Systems STINGER G3 POWER SET A Aktivsystem', 'https://www.hotsound-store.com/tontechnik/komplettsysteme/2.2-club-pa-sets/', '2 × STINGER 12 Aktivlautsprecher; 2 × STINGER SUB 18 Aktivsubwoofer; Zubehör auf Kategorieansicht nicht vollständig bestätigt.', 'similar',
      null, 'Nur Kernkonfiguration bestätigt; Hüllen und Rollbretter nicht vollständig geprüft. Preis unbestätigt, Recherche 03.11.2026.', 'https://www.hotsound-store.com/tontechnik/komplettsysteme/2.2-club-pa-sets/',
      'LD Systems STINGER G3 POWER SET A Aktivsystem', 'Suchindex Händlerkategorie (Cache letzte Woche); kein bestätigter Direktabruf.', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r20' and s.slug='hotsound'),
        4169, 'EUR', 'success', 'seed_import', false,
        'LD Systems STINGER G3 POWER SET A Aktivsystem', 'Suchindex Händlerkategorie (Cache letzte Woche); kein bestätigter Direktabruf.', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r20'),
      (select id from public.shops where slug='prolighting'),
      'LD Systems STINGER G3 POWER SET A - 2 x 12" Aktiv-PA-Lautsprecher + 2 x 18" Aktiv-Subwoofer', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie/ld-systems-stinger-g3-power-set-a-2-x-12-aktiv-pa-lautsprecher-2-x-18-aktiv-subwoofer.html', '2 × STINGER 12 A G3; 2 × SUB 18 A G3; 4 × Cover; 2 × Rollbrett.', 'exact',
      null, 'Shop meldet aktuell nicht verfügbar; nicht in der Preisrangfolge berücksichtigt.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie/ld-systems-stinger-g3-power-set-a-2-x-12-aktiv-pa-lautsprecher-2-x-18-aktiv-subwoofer.html',
      'LD Systems STINGER G3 POWER SET A - 2 x 12" Aktiv-PA-Lautsprecher + 2 x 18" Aktiv-Subwoofer', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r20' and s.slug='prolighting'),
        4479, 'EUR', 'success', 'seed_import', true,
        'LD Systems STINGER G3 POWER SET A - 2 x 12" Aktiv-PA-Lautsprecher + 2 x 18" Aktiv-Subwoofer', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r21', 'LD Systems', 'STINGER', 'STINGER 15 / 4 × SUB 18 G3', '2 Tops · 4 Subs · Zubehör abweichend', 'similar', 'Gleiche Lautsprecher; Zubehör abweichend.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r21'),
      (select id from public.shops where slug='mueller'),
      'LD Systems Stinger G3 Impact Bundle Set Aktiv', 'https://www.musikhaus-mueller.de/ld_systems_stinger_g3_impact_set_a/', '2 × Stinger 15A G3; 4 × SUB 18A G3; 6 Hüllen; 4 Rollbretter.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_stinger_g3_impact_set_a/',
      'LD Systems Stinger G3 Impact Set A', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":6899,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r21' and s.slug='mueller'),
        6899, 'EUR', 'success', 'seed_import', true,
        'LD Systems Stinger G3 Impact Set A', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r21'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Stinger High Power Bundle', 'https://www.thomann.de/de/ld_systems_stinger_high_power_bundle.htm', '2 × Stinger 15A G3; 4 × SUB 18A G3; 6 Hüllen; 2 × Roadworx Multi Pole + Tasche; 4 × Sommer Monolith1 2,5 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_stinger_high_power_bundle.htm',
      'LD Systems Stinger High Power Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":6999,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r21' and s.slug='thomann'),
        6999, 'EUR', 'success', 'seed_import', false,
        'LD Systems Stinger High Power Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r21'),
      (select id from public.shops where slug='prolighting'),
      'LD Systems STINGER G3 IMPACT SET A - 2 x 15" Aktiv-PA-Lautsprecher + 4 x 18" Aktiv-Subwoofer', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie/ld-systems-stinger-g3-impact-set-a-2-x-15-aktiv-pa-lautsprecher-4-x-18-aktiv-subwoofer.html', '2 × STINGER 15 A G3; 4 × SUB 18 A G3; 6 × Cover; 4 × Rollbrett.', 'exact',
      null, 'Shop meldet aktuell nicht verfügbar; nicht in der Preisrangfolge berücksichtigt.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie/ld-systems-stinger-g3-impact-set-a-2-x-15-aktiv-pa-lautsprecher-4-x-18-aktiv-subwoofer.html',
      'LD Systems STINGER G3 IMPACT SET A - 2 x 15" Aktiv-PA-Lautsprecher + 4 x 18" Aktiv-Subwoofer', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r21' and s.slug='prolighting'),
        7349, 'EUR', 'success', 'seed_import', true,
        'LD Systems STINGER G3 IMPACT SET A - 2 x 15" Aktiv-PA-Lautsprecher + 4 x 18" Aktiv-Subwoofer', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r22', 'LD Systems', 'STINGER', 'STINGER 8 / SUB 15 Basic', '2 Tops · 1 Sub · Stative + Hüllen', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r22'),
      (select id from public.shops where slug='thomann'),
      'LD Systems Stinger 8/Sub15 Basic Bundle', 'https://www.thomann.de/de/ld_systems_stinger_8_sub15_basic_bundle.htm', '2 × Stinger 8A G3; 1 × SUB 15A G3; 3 Hüllen; 2 × Roadworx Slim Line Stative + Tasche; 2 × pro snake TPM 10 m.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_stinger_8_sub15_basic_bundle.htm',
      'LD Systems Stinger 8/Sub15 Basic Bundle', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":2109,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r22' and s.slug='thomann'),
        2109, 'EUR', 'success', 'seed_import', false,
        'LD Systems Stinger 8/Sub15 Basic Bundle', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r23', 'LD Systems', 'ICOA', 'ICOA 1215 Bluetooth', 'PA-Bundle · Details zum Lieferumfang', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r23'),
      (select id from public.shops where slug='mueller'),
      'LD Systems ICOA 1215 Bluetooth Bundle Set', 'https://www.musikhaus-mueller.de/ld_systems_icoa_party_bundle/', '2 × ICOA 12A BT; 1 × SUB 15A; Adam Hall Stativpaar mit Tasche; 2 × XLR 6 m.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_icoa_party_bundle/',
      'LD Systems ICOA 1215 Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1539,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r23' and s.slug='mueller'),
        1539, 'EUR', 'success', 'seed_import', true,
        'LD Systems ICOA 1215 Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r24', 'LD Systems', 'ICOA', 'ICOA Club Bluetooth', 'PA-Bundle · Details zum Lieferumfang', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r24'),
      (select id from public.shops where slug='mueller'),
      'LD Systems ICOA Club Bluetooth Bundle Set', 'https://www.musikhaus-mueller.de/ld_systems_icoa_club_bundle/', '2 × ICOA 12A BT; 2 × SUB 18A; 2 × Gravity SP 2332 B; 2 × XLR 3 m.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_icoa_club_bundle/',
      'LD Systems ICOA Club Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2430,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r24' and s.slug='mueller'),
        2430, 'EUR', 'success', 'seed_import', true,
        'LD Systems ICOA Club Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r25', 'LD Systems', 'ICOA', 'ICOA Club XL Bluetooth', 'PA-Bundle · Details zum Lieferumfang', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r25'),
      (select id from public.shops where slug='mueller'),
      'LD Systems ICOA Club XL Bluetooth Bundle Set', 'https://www.musikhaus-mueller.de/ld_systems_icoa_club_xl_bundle/', '2 × ICOA 15A BT; 2 × SUB 18A; 2 × Gravity SP 2332 B; 2 × XLR 3 m.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_icoa_club_xl_bundle/',
      'LD Systems ICOA Club XL Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2549,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r25' and s.slug='mueller'),
        2549, 'EUR', 'success', 'seed_import', true,
        'LD Systems ICOA Club XL Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r26', 'LD Systems', 'ICOA', 'ICOA Power Bluetooth', 'PA-Bundle · Details zum Lieferumfang', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r26'),
      (select id from public.shops where slug='mueller'),
      'LD Systems ICOA Power Bluetooth Bundle Set', 'https://www.musikhaus-mueller.de/ld_systems_icoa_power_bundle/', '2 × ICOA 15A BT; 4 × SUB 18A; 4 × XLR 3 m. Keine Distanzstangen genannt.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld_systems_icoa_power_bundle/',
      'LD Systems ICOA Power Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":4129,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r26' and s.slug='mueller'),
        4129, 'EUR', 'success', 'seed_import', true,
        'LD Systems ICOA Power Bluetooth Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r27', 'LD Systems', 'ICOA', 'ICOA PRO Entertain Touring', 'PA-Bundle · Details zum Lieferumfang', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r27'),
      (select id from public.shops where slug='mueller'),
      'LD Systems ICOA PRO Entertain Touring Bundle Set', 'https://www.musikhaus-mueller.de/ld-systems-icoa-pro-entertain-touring-bundle-set/', '2 × ICOA PRO 12A; 1 × PRO SUB 21A; 3 Hüllen; 1 Rollbrett; Gravity Stativpaar mit Tasche; 2 × Neutrik XLR 5 m.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld-systems-icoa-pro-entertain-touring-bundle-set/',
      'LD Systems ICOA PRO Entertain Touring Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":4979,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r27' and s.slug='mueller'),
        4979, 'EUR', 'success', 'seed_import', true,
        'LD Systems ICOA PRO Entertain Touring Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r28', 'LD Systems', 'ICOA', 'ICOA PRO 12A / 21A', '2 Tops · 2 Subs · Zubehör abweichend', 'similar', 'Thomann enthält zusätzlich Rollbretter, Hüllen und Netzkabel sowie andere Distanzstangen. Keine Ersparnis für identisches Bundle.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r28'),
      (select id from public.shops where slug='mueller'),
      'LD Systems ICOA PRO Club Bundle Set', 'https://www.musikhaus-mueller.de/ld-systems-icoa-pro-club-bundle-set/', '2 × ICOA PRO 12A; 2 × PRO SUB 21A; 2 × Gravity SP 2332 B; 2 × Neutrik XLR 3 m.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/ld-systems-icoa-pro-club-bundle-set/',
      'LD Systems ICOA PRO Club Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":6599,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r28' and s.slug='mueller'),
        6599, 'EUR', 'success', 'seed_import', true,
        'LD Systems ICOA PRO Club Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r28'),
      (select id from public.shops where slug='thomann'),
      'LD Systems ICOA Pro 12A/21A Power Set', 'https://www.thomann.de/de/ld_systems_icoa_pro_12a_21a_power_set.htm', '2 × ICOA Pro 12A; 2 × SUB Pro 21A; 2 Rollbretter; 4 Hüllen; 2 × Gravity TSP 2332 B; 2 × Stairville Power Twist 3 m; 2 × Sommer Stage 22 SG0Q 3 m.', 'similar',
      null, null, 'https://www.thomann.de/de/ld_systems_icoa_pro_12a_21a_power_set.htm',
      'LD Systems ICOA Pro 12A/21A Power Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":7345,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r28' and s.slug='thomann'),
        7345, 'EUR', 'success', 'seed_import', true,
        'LD Systems ICOA Pro 12A/21A Power Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r28'),
      (select id from public.shops where slug='hotsound'),
      'LD Systems ICOA PRO 12A Club PA Set', 'https://www.hotsound-store.com/ld-systems-icoa-pro-12a-club-pa-set-16057', '2 × ICOA PRO 12 A; 2 × ICOA PRO SUB 21 A; 2 × Gravity SP 2332 TPB; 2 × Vonyx XLR 3 m.', 'similar',
      null, 'Gleiche Lautsprecher wie Müller, aber andere Distanzstangen und Kabel. Preis unbestätigt; Recherche 03.11.2026. Direkter Netzabruf scheiterte im Sandbox-DNS; Freigabe abgebrochen.', 'https://www.hotsound-store.com/ld-systems-icoa-pro-12a-club-pa-set-16057',
      'LD Systems ICOA PRO 12A Club PA Set', 'Suchindex der Produktseite (Cache 4 Wochen); Direktabruf nicht bestätigt.', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r28' and s.slug='hotsound'),
        6599, 'EUR', 'success', 'seed_import', false,
        'LD Systems ICOA PRO 12A Club PA Set', 'Suchindex der Produktseite (Cache 4 Wochen); Direktabruf nicht bestätigt.', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r29', 'LD Systems', 'ICOA', 'ICOA PRO 15A / 21A Power', '2 Tops · 2 Subs · Hüllen + Rollbretter', 'unmatched', null, '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r29'),
      (select id from public.shops where slug='thomann'),
      'LD Systems ICOA Pro 15A/21A Power Set', 'https://www.thomann.de/de/ld_systems_icoa_pro_15a_21a_power_set.htm', '2 × ICOA Pro 15A; 2 × SUB Pro 21A; 2 Rollbretter; 4 Hüllen; 2 × Gravity TSP 2332 B; 2 × Stairville Power Twist 3 m; 2 × Sommer Stage 22 SG0Q 3 m.', 'exact',
      null, null, 'https://www.thomann.de/de/ld_systems_icoa_pro_15a_21a_power_set.htm',
      'LD Systems ICOA Pro 15A/21A Power Set', 'Produktseite · Webcache', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","previousPrice":7759,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r29' and s.slug='thomann'),
        7759, 'EUR', 'success', 'seed_import', false,
        'LD Systems ICOA Pro 15A/21A Power Set', 'Produktseite · Webcache', '2026-10-17T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Heute nicht bestätigt (Abrufbegrenzung HTTP 429)","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r30', 'DAP', 'Frigga', 'FRIGGA Stereo schwarz', '2 Säulensysteme', 'unmatched', 'Kein Gegenangebot hinterlegt. Die heutige Aktualisierung prüft bestehende Produktlinks, nicht das gesamte Sortiment.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r30'),
      (select id from public.shops where slug='mueller'),
      'DAP Frigga Stereo Bundle Set schwarz', 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-schwarz/', '2 × DAP Frigga schwarz.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-schwarz/',
      'DAP Frigga Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2279,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r30' and s.slug='mueller'),
        2279, 'EUR', 'success', 'seed_import', true,
        'DAP Frigga Stereo Bundle Set schwarz', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r30'),
      (select id from public.shops where slug='prolighting'),
      '2 × DAP Frigga - Aktive Einzelsäule PA-System - Schwarz', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html', '2 × DAP Frigga schwarz.', 'exact',
      '2 × 1049 € = 2098 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-schwarz.html',
      '2 × DAP Frigga - Aktive Einzelsäule PA-System - Schwarz', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r30' and s.slug='prolighting'),
        2098, 'EUR', 'success', 'seed_import', true,
        '2 × DAP Frigga - Aktive Einzelsäule PA-System - Schwarz', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1049 € = 2098 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r31', 'DAP', 'Frigga', 'FRIGGA Stereo weiß', '2 Säulensysteme', 'unmatched', 'Kein Gegenangebot hinterlegt. Die heutige Aktualisierung prüft bestehende Produktlinks, nicht das gesamte Sortiment.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r31'),
      (select id from public.shops where slug='mueller'),
      'DAP Frigga Stereo Bundle Set weiß', 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-weiss/', '2 × DAP Frigga weiß.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-weiss/',
      'DAP Frigga Stereo Bundle Set weiß', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2499,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r31' and s.slug='mueller'),
        2499, 'EUR', 'success', 'seed_import', true,
        'DAP Frigga Stereo Bundle Set weiß', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r31'),
      (select id from public.shops where slug='prolighting'),
      '2 × DAP Frigga - Aktive Einzelsäule PA-System - Weiß', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html', '2 × DAP Frigga weiß.', 'exact',
      '2 × 1080 € = 2160 €', 'Berechneter Warenkorb aus zwei identischen Einzelangeboten.', 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html',
      '2 × DAP Frigga - Aktive Einzelsäule PA-System - Weiß', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":null,"previousPrice":null,"previousDate":null}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r31' and s.slug='prolighting'),
        2160, 'EUR', 'success', 'seed_import', true,
        '2 × DAP Frigga - Aktive Einzelsäule PA-System - Weiß', 'Produktseite direkt (HTTP 200), sichtbarer Artikelpreis und Lieferumfang geprüft · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":null,"calculation":"2 × 1080 € = 2160 €"}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r32', 'DAP', 'Frigga', 'FRIGGA Stereo schwarz + Taschen', '2 Säulensysteme · Taschen und Hüllen', 'unmatched', 'Kein Gegenangebot hinterlegt. Die heutige Aktualisierung prüft bestehende Produktlinks, nicht das gesamte Sortiment.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r32'),
      (select id from public.shops where slug='mueller'),
      'DAP Frigga Stereo Bundle Set schwarz mit Taschen', 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-schwarz-mit-taschen/', '2 × DAP Frigga schwarz. 2 × Top Tragetasche; 2 × Sub Cover.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-schwarz-mit-taschen/',
      'DAP Frigga Stereo Bundle Set schwarz mit Taschen', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2450,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r32' and s.slug='mueller'),
        2450, 'EUR', 'success', 'seed_import', true,
        'DAP Frigga Stereo Bundle Set schwarz mit Taschen', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r33', 'DAP', 'Frigga', 'FRIGGA Stereo weiß + Taschen', '2 Säulensysteme · Taschen und Hüllen', 'unmatched', 'Kein Gegenangebot hinterlegt. Die heutige Aktualisierung prüft bestehende Produktlinks, nicht das gesamte Sortiment.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r33'),
      (select id from public.shops where slug='mueller'),
      'DAP Frigga Stereo Bundle Set weiß mit Taschen', 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-weiss-mit-taschen/', '2 × DAP Frigga weiß. 2 × Top Tragetasche; 2 × Sub Cover.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/dap-frigga-stereo-bundle-set-weiss-mit-taschen/',
      'DAP Frigga Stereo Bundle Set weiß mit Taschen', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":2510,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r33' and s.slug='mueller'),
        2510, 'EUR', 'success', 'seed_import', true,
        'DAP Frigga Stereo Bundle Set weiß mit Taschen', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r34', 'DAP', 'Frigga', 'FRIGGA Schwarz + Taschen', '1 Säulensystem · Taschen und Hüllen', 'unmatched', 'Kein Gegenangebot hinterlegt. Die heutige Aktualisierung prüft bestehende Produktlinks, nicht das gesamte Sortiment.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r34'),
      (select id from public.shops where slug='mueller'),
      'DAP Frigga Bundle Set schwarz mit Taschen', 'https://www.musikhaus-mueller.de/dap-frigga-bundle-set-schwarz-mit-taschen/', '1 × DAP Frigga schwarz. 1 × Top Tragetasche; 1 × Sub Cover.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/dap-frigga-bundle-set-schwarz-mit-taschen/',
      'DAP Frigga Bundle Set schwarz mit Taschen', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1225,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r34' and s.slug='mueller'),
        1225, 'EUR', 'success', 'seed_import', true,
        'DAP Frigga Bundle Set schwarz mit Taschen', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r35', 'DAP', 'Frigga', 'FRIGGA Weiß + Taschen', '1 Säulensystem · Taschen und Hüllen', 'unmatched', 'Kein Gegenangebot hinterlegt. Die heutige Aktualisierung prüft bestehende Produktlinks, nicht das gesamte Sortiment.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r35'),
      (select id from public.shops where slug='mueller'),
      'DAP Frigga Bundle Set weiß mit Taschen', 'https://www.musikhaus-mueller.de/dap-frigga-bundle-set-weiss-mit-taschen/', '1 × DAP Frigga weiß. 1 × Top Tragetasche; 1 × Sub Cover.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/dap-frigga-bundle-set-weiss-mit-taschen/',
      'DAP Frigga Bundle Set weiß mit Taschen', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1255,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r35' and s.slug='mueller'),
        1255, 'EUR', 'success', 'seed_import', true,
        'DAP Frigga Bundle Set weiß mit Taschen', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r36', 'Wharfedale Pro', 'Wharfedale', 'DELTA-X218B 2× Bundle', 'Wharfedale Pro · passives System', 'unmatched', 'Kein passendes Thomann-Gegenangebot in der Recherche gefunden.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r36'),
      (select id from public.shops where slug='mueller'),
      'Wharfedale Pro DELTA-X218B 2× Bundle', 'https://www.musikhaus-mueller.de/wharfedale-pro-delta-x218b-dual-18-subwoofer-2x-bundle-set/', '2 × DELTA-X218B Dual-18-Zoll Passiv-Subwoofer. Keine Endstufe.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/wharfedale-pro-delta-x218b-dual-18-subwoofer-2x-bundle-set/',
      'Wharfedale Pro DELTA-X218B Dual-18" Subwoofer 2x Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1719,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r36' and s.slug='mueller'),
        1699, 'EUR', 'success', 'seed_import', true,
        'Wharfedale Pro DELTA-X218B Dual-18" Subwoofer 2x Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r37', 'Wharfedale Pro', 'Wharfedale', 'DELTA-F18B Twin Bundle', 'Wharfedale Pro · passives System', 'unmatched', 'Kein passendes Thomann-Gegenangebot in der Recherche gefunden.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r37'),
      (select id from public.shops where slug='mueller'),
      'Wharfedale Pro DELTA-F18B Twin Bundle', 'https://www.musikhaus-mueller.de/wharfedale-pro-delta-f18b-subwoofer-twin-bundle-set/', '2 × DELTA-F18B 18-Zoll horngeladener Passiv-Subwoofer. Keine Endstufe.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/wharfedale-pro-delta-f18b-subwoofer-twin-bundle-set/',
      'Wharfedale Pro DELTA-F18B Subwoofer Twin Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":1880,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r37' and s.slug='mueller'),
        1880, 'EUR', 'success', 'seed_import', true,
        'Wharfedale Pro DELTA-F18B Subwoofer Twin Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r38', 'Wharfedale Pro', 'Wharfedale', 'DELTA-F18B Quad Bundle', 'Wharfedale Pro · passives System', 'unmatched', 'Kein passendes Thomann-Gegenangebot in der Recherche gefunden.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r38'),
      (select id from public.shops where slug='mueller'),
      'Wharfedale Pro DELTA-F18B Quad Bundle', 'https://www.musikhaus-mueller.de/wharfedale-pro-delta-f18b-subwoofer-quad-bundle-set/', '4 × DELTA-F18B 18-Zoll horngeladener Passiv-Subwoofer. Keine Endstufe.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/wharfedale-pro-delta-f18b-subwoofer-quad-bundle-set/',
      'Wharfedale Pro DELTA-F18B Subwoofer Quad Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":3749,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r38' and s.slug='mueller'),
        3749, 'EUR', 'success', 'seed_import', true,
        'Wharfedale Pro DELTA-F18B Subwoofer Quad Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r39', 'Wharfedale Pro', 'Wharfedale', 'WLA-210XP Line Array Base', 'Wharfedale Pro · passives System', 'unmatched', 'Kein passendes Thomann-Gegenangebot in der Recherche gefunden.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r39'),
      (select id from public.shops where slug='mueller'),
      'Wharfedale Pro WLA-210XP Line Array Base', 'https://www.musikhaus-mueller.de/wharfedale-pro-wla-210xp-line-array-base-bundle-set/', '8 × WLA-210XP; 2 × WLA-210X Common Fly Frame. Keine Endstufen.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/wharfedale-pro-wla-210xp-line-array-base-bundle-set/',
      'Wharfedale Pro WLA-210XP Line Array Base Bundle Set', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":11690,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r39' and s.slug='mueller'),
        11690, 'EUR', 'success', 'seed_import', true,
        'Wharfedale Pro WLA-210XP Line Array Base Bundle Set', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

insert into public.configurations
    (legacy_id, brand, family, name, subtitle, comparison_status, note, source_date, active, metadata)
  values ('r40', 'Wharfedale Pro', 'Wharfedale', 'WLA-210XP Line Array + Amps', 'Wharfedale Pro · passives System', 'unmatched', 'Kein passendes Thomann-Gegenangebot in der Recherche gefunden.', '2026-11-03'::date, true, '{}'::jsonb)
  on conflict (legacy_id) do update set
    brand=excluded.brand, family=excluded.family, name=excluded.name, subtitle=excluded.subtitle,
    comparison_status=excluded.comparison_status, note=excluded.note, source_date=excluded.source_date,
    active=true, updated_at=now();

insert into public.offers
      (configuration_id, shop_id, shop_product_name, product_url, contents, match_type, calculation, note, source_url, source_name, evidence, active, metadata)
    values (
      (select id from public.configurations where legacy_id='r40'),
      (select id from public.shops where slug='mueller'),
      'Wharfedale Pro WLA-210XP Line Array + Amps', 'https://www.musikhaus-mueller.de/wharfedale-pro-wla-210xp-line-array-base-bundle-set-mit-amps/', '8 × WLA-210XP; 2 × DP-4100F MK2 Endstufe; 2 × WLA-210X Common Fly Frame.', 'exact',
      null, null, 'https://www.musikhaus-mueller.de/wharfedale-pro-wla-210xp-line-array-base-bundle-set-mit-amps/',
      'Wharfedale Pro WLA-210XP Line Array Base Bundle Set AMP', 'Produktseite direkt · 03.11.2026', true, '{"lastAttempt":"2026-11-03","fetchStatus":"Direktabruf erfolgreich","previousPrice":15290,"previousDate":"2026-10-17"}'::jsonb
    )
    on conflict (configuration_id, shop_id) do update set
      shop_product_name=excluded.shop_product_name, product_url=excluded.product_url, contents=excluded.contents,
      match_type=excluded.match_type, calculation=excluded.calculation, note=excluded.note,
      source_url=excluded.source_url, source_name=excluded.source_name, evidence=excluded.evidence,
      active=true, metadata=excluded.metadata, updated_at=now();

insert into public.price_observations
        (offer_id, price, currency, status, source_method, verified, raw_product_name, evidence, observed_at, metadata)
      values (
        (select o.id from public.offers o
         join public.configurations c on c.id=o.configuration_id
         join public.shops s on s.id=o.shop_id
         where c.legacy_id='r40' and s.slug='mueller'),
        15290, 'EUR', 'success', 'seed_import', true,
        'Wharfedale Pro WLA-210XP Line Array Base Bundle Set AMP', 'Produktseite direkt · 03.11.2026', '2026-11-03T12:00:00Z'::timestamptz,
        '{"fetchStatus":"Direktabruf erfolgreich","calculation":null}'::jsonb
      )
      on conflict (offer_id, source_method, observed_at) do update set
        price=excluded.price, verified=excluded.verified, raw_product_name=excluded.raw_product_name,
        evidence=excluded.evidence, metadata=excluded.metadata;

commit;
