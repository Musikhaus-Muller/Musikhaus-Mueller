import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { appliedObservationIds, buildBrowserProductionPostwriteAudit } from '../collector/browser/browser-production-postwrite-audit.mjs';
import { prepareBrowserProductionApply } from '../collector/browser/browser-production-writer.mjs';

function planned(reference = 'r1') {
  return { reference, shop: 'Thomann', decision: 'planned', proposed_observation: { offer_match: { configuration_legacy_id: reference, shop_slug: 'thomann' }, price_observation: { price: 100, currency: 'EUR', status: 'success', source_method: 'browser', verified: true, observed_at: '2026-11-18T09:00:00Z', metadata: { reference, shop: 'thomann', collector_method: 'browser_shadow_self_hosted', pricing_kind: 'direct_price', source_url: 'https://shop.example/item', final_url: 'https://shop.example/item', identity_valid: true, manual_review_required: false, challenge_detected: false, ambiguity_detected: false, component_evidence: [] } } } };
}
function artifacts() {
  return {
    writePlan: { writes: false, mode: 'plan', shops: [{ rows: [planned()] }] },
    preflight: { writes: false, rows: [{ reference: 'r1', shop: 'Thomann', configuration_legacy_id: 'r1', shop_slug: 'thomann', offer_id: 'offer-r1', status: 'resolved' }] }
  };
}
function validInputs() {
  const { writePlan, preflight } = artifacts();
  const expected = prepareBrowserProductionApply(writePlan, preflight).rows[0];
  const observation = { id: 'obs-r1', ...expected.observation, created_at: '2026-11-18T10:00:00Z' };
  return {
    writePlan, preflight,
    applyResult: { writes: true, started_at: '2026-11-18T09:30:00Z', rows: [{ reference: 'r1', shop: 'Thomann', offer_id: 'offer-r1', result: 'inserted', observation_id: 'obs-r1' }] },
    observations: [observation],
    currentOfferStatus: [{ offer_id: 'offer-r1', price: 100, currency: 'EUR', price_source_method: 'browser', price_observed_at: '2026-11-18T09:00:00.000+00:00', last_verified_at: '2026-11-18T09:00:00Z' }]
  };
}

test('post-write audit validates a matching observation, provenance hash, and current-price projection', () => {
  const input = validInputs();
  const audit = buildBrowserProductionPostwriteAudit({ ...input, planBytes: Buffer.from('plan'), preflightBytes: Buffer.from('preflight') });
  assert.equal(audit.expected_applied, 1);
  assert.equal(audit.observations_found, 1);
  assert.equal(audit.observations_valid, 1);
  assert.equal(audit.current_price_matches, 1);
  assert.equal(audit.failures.length, 0);
});

test('post-write audit reports missing, invalid, duplicate, and projection mismatch rows distinctly', () => {
  const input = validInputs();
  const missing = buildBrowserProductionPostwriteAudit({ ...input, observations: [], currentOfferStatus: [] });
  assert.equal(missing.missing, 1);
  assert.equal(missing.invalid, 1);

  const duplicate = buildBrowserProductionPostwriteAudit({ ...input, observations: [...input.observations, { ...input.observations[0], id: 'obs-r1b' }] });
  assert.equal(duplicate.duplicates, 1);

  const invalid = buildBrowserProductionPostwriteAudit({ ...input, observations: [{ ...input.observations[0], verified: false, metadata: { ...input.observations[0].metadata, source_url: 'https://wrong.example' } }], currentOfferStatus: [] });
  assert.match(invalid.rows[0].validation.failures.join(','), /verified_invalid/);
  assert.match(invalid.rows[0].validation.failures.join(','), /source_url_mismatch/);
  assert.match(invalid.rows[0].validation.failures.join(','), /current_price_mismatch/);
});

test('post-write audit selects only apply-result observation IDs despite a large historical offer history', () => {
  const input = validInputs();
  const historical = Array.from({ length: 250 }, (_, index) => ({
    id: `historic-${index}`,
    offer_id: 'offer-r1',
    source_method: 'browser',
    observed_at: `2026-10-${String((index % 28) + 1).padStart(2, '0')}T09:00:00Z`,
    created_at: '2026-10-01T09:00:00Z',
    metadata: { collector_method: 'old_collector' }
  }));
  assert.deepEqual(appliedObservationIds(input.applyResult), ['obs-r1']);
  const audit = buildBrowserProductionPostwriteAudit({ ...input, observations: [input.observations[0]] });
  assert.equal(audit.observations_found, 1);
  assert.equal(audit.observations_valid, 1);
  assert.equal(historical.length, 250);
});

test('preserve-only Thomann rows remain untouched only with no new browser observation and a prior valid price', () => {
  const input = validInputs();
  const preserveOffers = [{ reference: 'r2', offer_id: 'offer-r2' }];
  const observations = [...input.observations, { id: 'old-r2', offer_id: 'offer-r2', source_method: 'browser', created_at: '2026-11-18T09:00:00Z', metadata: { collector_method: 'browser_shadow_self_hosted' } }];
  const currentOfferStatus = [...input.currentOfferStatus, { offer_id: 'offer-r2', price: 500, last_verified_at: '2026-11-01T09:00:00Z' }];
  const untouched = buildBrowserProductionPostwriteAudit({ ...input, observations, currentOfferStatus, preserveOffers });
  assert.equal(untouched.preserve_only_untouched, 1);

  const touched = buildBrowserProductionPostwriteAudit({ ...input, observations: [...observations, { ...observations[1], id: 'new-r2', created_at: '2026-11-18T10:00:00Z' }], currentOfferStatus, preserveOffers });
  assert.equal(touched.preserve_only_untouched, 0);
  assert.match(touched.failures[0].reason, /unexpected_apply_observation/);
});

test('post-write audit CLI uses GET-only Supabase access and no write or RPC path', async () => {
  const source = await fs.readFile('scripts/audit-browser-production-postwrite.mjs', 'utf8');
  assert.match(source, /method: 'GET'/);
  assert.match(source, /browser-production-write-plan\.json/);
  assert.match(source, /browser-production-preflight\.json/);
  assert.match(source, /browser-production-apply-result\.json/);
  assert.match(source, /id=\$\{inFilter\(insertedObservationIds\)\}/);
  assert.match(source, /created_at=gte\./);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]|\/rpc\//i);
});
