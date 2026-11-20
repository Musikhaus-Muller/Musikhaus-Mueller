import { prepareBrowserProductionApply, sha256 } from './browser-production-writer.mjs';

const PRESERVE_ONLY_THOMANN = Object.freeze(['r2', 'r3', 'r4', 'r12']);

export function appliedObservationIds(applyResult) {
  return [...new Set((applyResult?.rows || [])
    .filter(row => ['inserted', 'already_applied'].includes(row.result) && row.observation_id)
    .map(row => row.observation_id))];
}

function indexBy(values, key) {
  const index = new Map();
  for (const value of values) {
    const bucket = index.get(key(value)) || [];
    bucket.push(value);
    index.set(key(value), bucket);
  }
  return index;
}

function observationKey(observation) {
  const timestamp = new Date(observation.observed_at);
  return `${observation.offer_id}|${observation.source_method}|${Number.isNaN(timestamp.getTime()) ? String(observation.observed_at) : timestamp.toISOString()}`;
}

function sameTimestamp(left, right) {
  return Boolean(left && right && new Date(left).getTime() === new Date(right).getTime());
}

function appliedRow(applyResult, row) {
  return (applyResult.rows || []).find(candidate => candidate.reference === row.reference && candidate.shop === row.shop && candidate.offer_id === row.offer_id && ['inserted', 'already_applied'].includes(candidate.result)) || null;
}

function validObservation(observation, expected) {
  const failures = [];
  if (!observation) return { valid: false, failures: ['observation_missing'] };
  if (observation.offer_id !== expected.offer_id) failures.push('offer_id_mismatch');
  if (observation.status !== 'success') failures.push('status_invalid');
  if (observation.verified !== true) failures.push('verified_invalid');
  if (!(Number(observation.price) > 0)) failures.push('price_invalid');
  if (observation.currency !== 'EUR') failures.push('currency_invalid');
  if (observation.source_method !== expected.source_method) failures.push('source_method_mismatch');
  if (!sameTimestamp(observation.observed_at, expected.observed_at)) failures.push('observed_at_mismatch');
  if (observation.metadata?.idempotency_key !== expected.metadata.idempotency_key) failures.push('evidence_sha256_mismatch');
  if (observation.metadata?.source_url !== expected.metadata.source_url) failures.push('source_url_mismatch');
  if (observation.metadata?.collector_method !== 'browser_shadow_self_hosted') failures.push('provenance_missing');
  return { valid: failures.length === 0, failures };
}

function currentMatches(current, expected) {
  return Boolean(current && Number(current.price) === Number(expected.price) && current.currency === 'EUR' &&
    current.price_source_method === expected.source_method && sameTimestamp(current.price_observed_at, expected.observed_at));
}

function preserveOnlyAudit({ preserveOffers, observations, currentOfferStatus, applyStartedAt }) {
  const observationByOffer = indexBy(observations, observation => observation.offer_id);
  const currentByOffer = new Map(currentOfferStatus.map(row => [row.offer_id, row]));
  return preserveOffers.map(offer => {
    const records = observationByOffer.get(offer.offer_id) || [];
    const writeWindowRecords = records.filter(record => new Date(record.created_at).getTime() >= new Date(applyStartedAt).getTime() &&
      ['browser', 'component_calc'].includes(record.source_method) && record.metadata?.collector_method === 'browser_shadow_self_hosted');
    const current = currentByOffer.get(offer.offer_id);
    const untouched = writeWindowRecords.length === 0 && Number(current?.price) > 0;
    return {
      reference: offer.reference,
      shop: 'Thomann',
      offer_id: offer.offer_id || null,
      result: untouched ? 'untouched' : 'failed',
      new_apply_browser_observations: writeWindowRecords.length,
      preserved_price: current?.price ?? null,
      last_verified_at: current?.last_verified_at ?? null,
      reason: untouched ? null : (offer.offer_id ? 'unexpected_apply_observation_or_missing_previous_price' : 'preserve_offer_missing')
    };
  });
}

export function buildBrowserProductionPostwriteAudit({ writePlan, preflight, applyResult, observations = [], currentOfferStatus = [], preserveOffers = [], planBytes, preflightBytes, generatedAt = new Date().toISOString() }) {
  const prepared = prepareBrowserProductionApply(writePlan, preflight);
  const expectedRows = prepared.rows.filter(row => row.result === 'ready');
  const observationByKey = indexBy(observations, observationKey);
  const currentByOffer = new Map(currentOfferStatus.map(row => [row.offer_id, row]));
  const rows = expectedRows.map(expected => {
    const applied = appliedRow(applyResult, expected);
    const matches = observationByKey.get(observationKey(expected.observation)) || [];
    const observation = applied?.observation_id ? matches.find(candidate => candidate.id === applied.observation_id) || null : matches[0] || null;
    const validation = validObservation(observation, expected.observation);
    const currentMatch = currentMatches(currentByOffer.get(expected.offer_id), expected.observation);
    const failures = [...validation.failures];
    if (!applied) failures.push('apply_result_missing');
    if (matches.length !== 1) failures.push(matches.length ? 'unexpected_duplicate' : 'observation_missing');
    if (!currentMatch) failures.push('current_price_mismatch');
    return {
      reference: expected.reference,
      shop: expected.shop,
      offer_id: expected.offer_id,
      observation_id: observation?.id || null,
      result: failures.length ? 'failed' : 'valid',
      validation: { valid: failures.length === 0, failures },
      current_price_match: currentMatch,
      source_method: expected.observation.source_method,
      observed_at: expected.observation.observed_at,
      source_url: expected.observation.metadata.source_url,
      evidence_sha256: expected.observation.metadata.idempotency_key
    };
  });
  const preserveRows = preserveOnlyAudit({ preserveOffers, observations, currentOfferStatus, applyStartedAt: applyResult.started_at });
  const count = predicate => rows.filter(predicate).length;
  const failures = [
    ...rows.filter(row => row.result === 'failed').map(row => ({ reference: row.reference, shop: row.shop, reason: row.validation.failures.join(',') })),
    ...preserveRows.filter(row => row.result !== 'untouched').map(row => ({ reference: row.reference, shop: row.shop, reason: row.reason }))
  ];
  return {
    writes: false,
    generated_at: generatedAt,
    source_write_plan: 'reports/browser-production-write-plan.json',
    source_preflight: 'reports/browser-production-preflight.json',
    source_apply_result: 'reports/browser-production-apply-result.json',
    plan_sha256: planBytes ? sha256(planBytes) : null,
    preflight_sha256: preflightBytes ? sha256(preflightBytes) : null,
    expected_applied: expectedRows.length,
    observations_found: count(row => row.observation_id),
    observations_valid: count(row => row.result === 'valid'),
    current_price_matches: count(row => row.current_price_match),
    duplicates: count(row => row.validation.failures.includes('unexpected_duplicate')),
    missing: count(row => row.validation.failures.includes('observation_missing')),
    invalid: count(row => row.result === 'failed'),
    preserve_only_untouched: preserveRows.filter(row => row.result === 'untouched').length,
    failures,
    rows,
    preserve_only_rows: preserveRows,
    expected_preserve_only: PRESERVE_ONLY_THOMANN
  };
}

export { PRESERVE_ONLY_THOMANN };
