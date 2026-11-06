-- Quarantine invalid Hot Sound observations from experimental brand-catalog fallback.
-- Run 26b5de17-c258-4503-997f-a51831f37a44 produced implausible cross-matched prices.
begin;

update public.price_observations
set
  status = 'parse_error',
  price = null,
  verified = false,
  error_message = 'Quarantined: invalid Hot Sound brand-catalog fallback cross-match',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'quarantined', true,
    'quarantine_reason', 'invalid_brand_catalog_cross_match',
    'quarantine_run_id', '26b5de17-c258-4503-997f-a51831f37a44'
  )
where run_id = '26b5de17-c258-4503-997f-a51831f37a44'::uuid
  and status = 'success';

update public.component_price_observations
set
  status = 'parse_error',
  price = null,
  verified = false,
  error_message = 'Quarantined: invalid Hot Sound brand-catalog fallback cross-match',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'quarantined', true,
    'quarantine_reason', 'invalid_brand_catalog_cross_match',
    'quarantine_run_id', '26b5de17-c258-4503-997f-a51831f37a44'
  )
where run_id = '26b5de17-c258-4503-997f-a51831f37a44'::uuid
  and status = 'success';

update public.collection_results
set
  status = 'parse_error',
  price = null,
  message = 'Quarantined: invalid Hot Sound brand-catalog fallback cross-match'
where run_id = '26b5de17-c258-4503-997f-a51831f37a44'::uuid
  and status = 'success';

update public.collection_runs
set
  status = 'success',
  offers_checked = 27,
  offers_updated = 0,
  offers_failed = 0,
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'health_status', 'success_with_preserved',
    'corrected_reason', 'invalid_hotsound_brand_catalog_cross_match',
    'result_counts', jsonb_build_object(
      'checked', 27,
      'updated', 0,
      'preserved', 27,
      'hard_failed', 0,
      'preserved_blocked', 0,
      'preserved_captcha', 20,
      'preserved_not_found', 0,
      'preserved_parse_error', 7,
      'network_error', 0,
      'unknown_failure', 0
    )
  )
where id = '26b5de17-c258-4503-997f-a51831f37a44'::uuid;

commit;
