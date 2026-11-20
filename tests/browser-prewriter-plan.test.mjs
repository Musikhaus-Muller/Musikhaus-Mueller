import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { buildBrowserPreWriterPlan } from '../collector/browser/pre-writer-plan.mjs';

const direct = (overrides = {}) => ({
  reference: 'r1', shop: 'Thomann', url: 'https://shop.example/item', final_url: 'https://shop.example/item',
  product_identity: { name: 'Exact Product' }, observed_price: 100, previous_price: 100, delta: 0, delta_pct: 0,
  price_source: 'product_root', price_candidates: [{ cents: 10000, source: 'product_root' }],
  identity_valid: true, challenge_detected: false, decision: 'refreshable', manual_review_required: false,
  ...overrides
});

test('pre-writer plan makes only fully verified direct and component shadow results eligible', () => {
  const cart = direct({
    reference: 'r5', price_source: 'component_calc', price_candidates: [], observed_price: 250,
    components: [
      { name: 'Component A', quantity: 2, url: 'https://shop.example/a', final_url: 'https://shop.example/a', product_identity: { name: 'Component A' }, observed_price: 100, price_source: 'json_ld', price_candidates: [{ cents: 10000 }], identity_valid: true, challenge_detected: false, decision: 'refreshable' },
      { name: 'Component B', quantity: 1, url: 'https://shop.example/b', final_url: 'https://shop.example/b', product_identity: { name: 'Component B' }, observed_price: 50, price_source: 'json_ld', price_candidates: [{ cents: 5000 }], identity_valid: true, challenge_detected: false, decision: 'refreshable' }
    ]
  });
  const plan = buildBrowserPreWriterPlan([{ shop: 'Thomann', observed_at: '2026-11-17T00:00:00Z', scope: 'browser_full_shadow', writes: false, rows: [direct(), cart] }]);
  assert.equal(plan.writes, false);
  assert.deepEqual(plan.shops[0].summary, { total: 2, eligible: 2, manual_review: 0, preserve_only: 0 });
  assert.deepEqual(plan.shops[0].decision_lists, { eligible: ['r1', 'r5'], manual_review: [], preserve_only: [] });
  assert.equal(plan.shops[0].rows[1].pricing_kind, 'component_cart');
  assert.equal(plan.shops[0].rows[1].components.every(component => component.evidence_valid), true);
});

test('pre-writer plan preserves all invalid shadow outcomes and sends anomalous changes to review', () => {
  const report = { shop: 'Thomann', observed_at: '2026-11-17T00:00:00Z', scope: 'browser_full_shadow', writes: false, rows: [
    direct({ reference: 'r2', decision: 'not_found', identity_valid: false, observed_price: null, price_candidates: [], price_source: null }),
    direct({ reference: 'r3', challenge_detected: true }),
    direct({ reference: 'r4', components: [{ name: 'Missing', quantity: 1, url: 'https://shop.example/missing', observed_price: null, identity_valid: false, challenge_detected: false, decision: 'not_found', price_candidates: [] }], price_source: 'component_calc' }),
    direct({ reference: 'r5', delta_pct: 20.01, delta: 20.01 })
  ] };
  const rows = buildBrowserPreWriterPlan([report]).shops[0].rows;
  assert.deepEqual(rows.map(row => row.proposed_decision), ['preserve_only', 'preserve_only', 'preserve_only', 'manual_review']);
  assert.match(rows[0].reasons.join(' '), /shadow_not_found/);
  assert.match(rows[2].reasons.join(' '), /component_evidence_incomplete_or_ambiguous/);
  assert.match(rows[3].reasons.join(' '), /delta_exceeds_anomaly_threshold/);
});

test('pre-writer plan command is local-report-only and pins Thomann 404s to preserve_only', async () => {
  const source = await fs.readFile('scripts/build-browser-prewriter-plan.mjs', 'utf8');
  assert.match(source, /browser-prewriter-plan\.json/);
  assert.doesNotMatch(source, /SUPABASE|\b(?:INSERT|UPDATE|POST|PATCH|PUT|DELETE)\b|fetch\(/i);
  const reports = await Promise.all(['hotsound', 'thomann'].map(async shop => JSON.parse(await fs.readFile(`reports/${shop}-browser-shadow-full.json`, 'utf8'))));
  const plan = buildBrowserPreWriterPlan(reports);
  const thomann = plan.shops.find(shop => shop.shop === 'Thomann');
  for (const reference of ['r2', 'r3', 'r4', 'r12']) {
    assert.equal(thomann.rows.find(row => row.reference === reference).proposed_decision, 'preserve_only');
  }
});
