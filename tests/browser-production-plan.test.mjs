import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { buildBrowserObservationPayload, buildBrowserProductionWritePlan, validateBrowserPreWriterRow } from '../collector/browser/browser-production-plan.mjs';

const direct = (overrides = {}) => ({
  reference: 'r1', shop: 'Thomann', url: 'https://shop.example/item', final_url: 'https://shop.example/item',
  identity: { name: 'Exact Product' }, sku: 'SKU-1', observed_price: 100, previous_price: 90, delta: 10, delta_pct: 11.11,
  currency: 'EUR', price_source: 'thomann_product_root', price_candidates: [{ cents: 10000 }], pricing_kind: 'direct_price', components: [],
  shadow_decision: 'refreshable', identity_valid: true, verified: true, challenge_detected: false, ambiguity_detected: false,
  proposed_decision: 'eligible', reasons: [], ...overrides
});

function sourcePlan(rows) {
  return { writes: false, purpose: 'pre_writer_browser_shadow_plan', shops: [{ shop: 'Thomann', artifact_observed_at: '2026-11-18T09:00:00Z', rows }] };
}

test('browser production plan builds schema-compatible verified direct observation payloads without offer ids', () => {
  const { validation, payload } = buildBrowserObservationPayload(direct(), { observedAt: '2026-11-18T09:00:00Z' });
  assert.deepEqual(validation, { valid: true, errors: [] });
  assert.deepEqual(payload.offer_match, { shop_slug: 'thomann', configuration_legacy_id: 'r1' });
  assert.equal(payload.price_observation.price, 100);
  assert.equal(payload.price_observation.currency, 'EUR');
  assert.equal(payload.price_observation.status, 'success');
  assert.equal(payload.price_observation.verified, true);
  assert.equal(payload.price_observation.source_method, 'browser');
  assert.equal(payload.price_observation.offer_id, undefined);
  assert.equal(payload.component_price_observations.length, 0);
});

test('browser production plan preserves complete component evidence with browser component observations', () => {
  const component = { name: 'Exact Component', quantity: 2, url: 'https://shop.example/component', final_url: 'https://shop.example/component', identity: { name: 'Exact Component' }, sku: 'COMP-1', observed_price: 50, currency: 'EUR', price_source: 'json_ld', price_candidates: [{ cents: 5000 }], identity_valid: true, verified: true, challenge_detected: false, http_status: 200, evidence_valid: true };
  const { payload } = buildBrowserObservationPayload(direct({ reference: 'r5', pricing_kind: 'component_cart', price_source: 'component_calc', price_candidates: [], observed_price: 100, components: [component] }), { observedAt: '2026-11-18T09:00:00Z' });
  assert.equal(payload.price_observation.source_method, 'component_calc');
  assert.equal(payload.component_price_observations.length, 1);
  assert.equal(payload.component_price_observations[0].price_observation.source_method, 'browser');
  assert.equal(payload.component_price_observations[0].price_observation.metadata.quantity, 2);
});

test('browser production validation rejects unsafe rows before planning', () => {
  for (const invalidRow of [
    direct({ observed_price: 0 }), direct({ currency: 'USD' }), direct({ verified: false }), direct({ identity_valid: false }), direct({ proposed_decision: 'preserve_only' }),
    direct({ shop: 'Music Store' }), direct({ final_url: null }), direct({ ambiguity_detected: true }),
    direct({ pricing_kind: 'component_cart', components: [] })
  ]) assert.equal(validateBrowserPreWriterRow(invalidRow).valid, false);
});

test('browser production plan never produces proposed writes for Thomann preserve-only references', () => {
  const rows = ['r2', 'r3', 'r4', 'r12'].map(reference => direct({ reference, proposed_decision: 'preserve_only', shadow_decision: 'not_found', identity_valid: false, observed_price: null, price_source: null, price_candidates: [], reasons: ['shadow_not_found'] }));
  const plan = buildBrowserProductionWritePlan(sourcePlan([direct(), ...rows]), { generatedAt: '2026-11-18T10:00:00Z' });
  assert.deepEqual(plan.totals, { planned: 1, inserted: 0, skipped: 4, failed: 0 });
  for (const reference of ['r2', 'r3', 'r4', 'r12']) {
    const row = plan.shops[0].rows.find(row => row.reference === reference);
    assert.equal(row.decision, 'skipped');
    assert.equal(row.proposed_observation, null);
  }
});

test('browser production CLI is plan-only, local-artifact-only, and blocks apply', async () => {
  const source = await fs.readFile('scripts/plan-browser-production-writes.mjs', 'utf8');
  assert.match(source, /--plan is required/);
  assert.match(source, /--apply is disabled/);
  assert.match(source, /browser-production-write-plan\.json/);
  assert.doesNotMatch(source, /SUPABASE|fetch\(|\/rest\/v1|INSERT|UPDATE|DELETE|POST|PATCH/i);
});
