import { createHash } from 'node:crypto';

const ALLOWED_SHOPS = new Set(['hotsound', 'thomann']);

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function idempotencyKey({ offerId, observation }) {
  return sha256(JSON.stringify({
    offer_id: offerId,
    observed_at: observation.observed_at,
    source_url: observation.metadata?.source_url,
    price: observation.price,
    source_method: observation.source_method,
    collector_method: observation.metadata?.collector_method
  }));
}

function invalid(errors) {
  return { valid: false, errors };
}

function componentEvidenceIsComplete(components) {
  return Array.isArray(components) && components.length > 0 && components.every(component => (
    component?.name && Number.isFinite(component.quantity) && component.quantity > 0 &&
    component.source_url && component.final_url && component.currency === 'EUR' &&
    component.identity_valid === true && component.verified === true &&
    component.challenge_detected !== true && component.evidence_valid === true &&
    Number.isFinite(component.observed_price) && component.observed_price > 0
  ));
}

function singlePreflight(rows, planRow) {
  const match = planRow.proposed_observation?.offer_match || {};
  const found = rows.filter(row => row.reference === planRow.reference && row.shop === planRow.shop &&
    row.configuration_legacy_id === match.configuration_legacy_id && row.shop_slug === match.shop_slug);
  return found.length === 1 ? found[0] : null;
}

export function validatePlannedWrite(planRow, preflightRow) {
  const errors = [];
  const observation = planRow?.proposed_observation?.price_observation;
  const match = planRow?.proposed_observation?.offer_match;
  const metadata = observation?.metadata || {};
  if (planRow?.decision !== 'planned') errors.push('plan_not_planned');
  if (!planRow?.reference) errors.push('reference_missing');
  if (!planRow?.shop) errors.push('shop_missing');
  if (!match?.shop_slug || !ALLOWED_SHOPS.has(match.shop_slug)) errors.push('shop_not_allowed');
  if (!match?.configuration_legacy_id) errors.push('configuration_legacy_id_missing');
  if (preflightRow?.status !== 'resolved') errors.push('preflight_not_resolved');
  if (!preflightRow?.offer_id) errors.push('offer_id_missing');
  if (preflightRow?.reference !== planRow?.reference) errors.push('reference_mismatch');
  if (preflightRow?.shop !== planRow?.shop) errors.push('shop_mismatch');
  if (preflightRow?.shop_slug !== match?.shop_slug) errors.push('shop_slug_mismatch');
  if (preflightRow?.configuration_legacy_id !== match?.configuration_legacy_id) errors.push('configuration_mismatch');
  if (!(Number.isFinite(observation?.price) && observation.price > 0)) errors.push('price_invalid');
  if (observation?.currency !== 'EUR') errors.push('currency_invalid');
  if (observation?.status !== 'success') errors.push('status_invalid');
  if (observation?.verified !== true) errors.push('not_verified');
  if (metadata.identity_valid !== true) errors.push('identity_invalid');
  if (!metadata.source_url || !observation?.observed_at) errors.push('source_or_observed_at_missing');
  if (metadata.manual_review_required === true) errors.push('manual_review_required');
  if (metadata.challenge_detected === true) errors.push('challenge_detected');
  if (metadata.ambiguity_detected === true) errors.push('evidence_ambiguous');
  if (!['browser', 'component_calc'].includes(observation?.source_method)) errors.push('source_method_invalid');
  if (metadata.pricing_kind === 'component_cart' && !componentEvidenceIsComplete(metadata.component_evidence)) errors.push('component_cart_incomplete');
  if (metadata.pricing_kind !== 'direct_price' && metadata.pricing_kind !== 'component_cart') errors.push('pricing_kind_invalid');
  return errors.length ? invalid(errors) : { valid: true, errors: [] };
}

function aggregateObservation(planRow, preflightRow) {
  const source = planRow.proposed_observation.price_observation;
  const observation = {
    offer_id: preflightRow.offer_id,
    price: source.price,
    currency: source.currency,
    availability: source.availability,
    status: source.status,
    source_method: source.source_method,
    http_status: source.http_status,
    verified: source.verified,
    raw_product_name: source.raw_product_name,
    evidence: source.evidence,
    observed_at: source.observed_at,
    metadata: { ...source.metadata }
  };
  observation.metadata.idempotency_key = idempotencyKey({ offerId: observation.offer_id, observation });
  return observation;
}

export function prepareBrowserProductionApply(writePlan, preflight) {
  if (writePlan?.writes !== false || writePlan?.mode !== 'plan') throw new Error('Expected an immutable browser production write plan');
  if (preflight?.writes !== false) throw new Error('Expected a read-only browser production preflight artifact');
  const rows = [];
  for (const planRow of writePlan.shops.flatMap(shop => shop.rows)) {
    if (planRow.decision !== 'planned') {
      rows.push({ reference: planRow.reference, shop: planRow.shop, offer_id: null, result: 'skipped', reason: 'plan_not_planned' });
      continue;
    }
    const preflightRow = singlePreflight(preflight.rows || [], planRow);
    const validation = validatePlannedWrite(planRow, preflightRow);
    if (!validation.valid) {
      rows.push({ reference: planRow.reference, shop: planRow.shop, offer_id: preflightRow?.offer_id || null, result: 'rejected', validation, reason: validation.errors.join(',') });
      continue;
    }
    rows.push({
      reference: planRow.reference,
      shop: planRow.shop,
      offer_id: preflightRow.offer_id,
      result: 'ready',
      validation,
      observation: aggregateObservation(planRow, preflightRow),
      reason: null
    });
  }
  const count = result => rows.filter(row => row.result === result).length;
  return { rows, totals: { ready: count('ready'), rejected: count('rejected'), skipped: count('skipped') } };
}

function matchingExisting(existing, observation) {
  return existing?.metadata?.idempotency_key === observation.metadata.idempotency_key;
}

export async function applyPreparedBrowserWrites(prepared, client) {
  const rows = [];
  for (const row of prepared.rows) {
    if (row.result !== 'ready') {
      rows.push({ ...row, observation: undefined });
      continue;
    }
    try {
      const existing = await client.findExisting(row.observation);
      if (existing.length > 0) {
        rows.push({ ...row, observation: undefined, result: matchingExisting(existing[0], row.observation) ? 'already_applied' : 'failed', reason: matchingExisting(existing[0], row.observation) ? null : 'idempotency_conflict' });
        continue;
      }
      try {
        const inserted = await client.insertObservation(row.observation);
        rows.push({ ...row, observation: undefined, result: 'inserted', observation_id: inserted?.id || null });
      } catch (error) {
        if (error?.status !== 409) throw error;
        const afterConflict = await client.findExisting(row.observation);
        rows.push({ ...row, observation: undefined, result: matchingExisting(afterConflict[0], row.observation) ? 'already_applied' : 'failed', reason: matchingExisting(afterConflict[0], row.observation) ? null : 'idempotency_conflict' });
      }
    } catch (error) {
      rows.push({ ...row, observation: undefined, result: 'failed', reason: `write_error_${error?.status || 'unknown'}` });
    }
  }
  const count = result => rows.filter(row => row.result === result).length;
  return { rows, totals: { inserted: count('inserted'), already_applied: count('already_applied'), skipped: count('skipped'), failed: count('failed'), rejected: count('rejected') } };
}

export function verifyApplyChecksums({ planBytes, preflightBytes, confirmPlanSha256, confirmPreflightSha256 }) {
  const planSha256 = sha256(planBytes);
  const preflightSha256 = sha256(preflightBytes);
  if (confirmPlanSha256 !== planSha256 || confirmPreflightSha256 !== preflightSha256) {
    throw new Error('Artifact checksum confirmation failed before any database connection');
  }
  return { planSha256, preflightSha256 };
}
