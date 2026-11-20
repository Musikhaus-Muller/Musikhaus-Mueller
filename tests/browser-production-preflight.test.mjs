import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { resolveBrowserProductionWritePlan } from '../collector/browser/browser-production-preflight.mjs';

function planned(reference = 'r1', { shop = 'thomann', url = 'https://shop.example/item' } = {}) {
  return { reference, shop: 'Thomann', decision: 'planned', proposed_observation: { offer_match: { configuration_legacy_id: reference, shop_slug: shop }, price_observation: { metadata: { source_url: url } } } };
}
function writePlan(rows) {
  return { writes: false, mode: 'plan', shops: [{ rows }] };
}
const data = {
  configurations: [{ id: 'config-r1', legacy_id: 'r1', active: true }],
  shops: [{ id: 'shop-thomann', slug: 'thomann', enabled: true }],
  offers: [{ id: 'offer-r1', configuration_id: 'config-r1', shop_id: 'shop-thomann', active: true, product_url: 'https://shop.example/item', source_url: null }]
};

test('preflight resolves one active configuration, shop and offer with matching source URL', () => {
  const out = resolveBrowserProductionWritePlan(writePlan([planned()]), data);
  assert.deepEqual(out.totals, { planned: 1, resolved: 1, unresolved: 0, ambiguous: 0, mismatches: 0 });
  assert.deepEqual(out.rows[0], { reference: 'r1', shop: 'Thomann', configuration_legacy_id: 'r1', shop_slug: 'thomann', configuration_id: 'config-r1', shop_id: 'shop-thomann', offer_id: 'offer-r1', status: 'resolved', validation: { configuration: 'unique', shop: 'unique', offer: 'unique', active: 'active', url: 'matched' }, reason: null });
});

test('preflight reports missing configuration, shop, and offer independently', () => {
  assert.equal(resolveBrowserProductionWritePlan(writePlan([planned('r2')]), data).rows[0].status, 'missing_configuration');
  assert.equal(resolveBrowserProductionWritePlan(writePlan([planned('r1', { shop: 'hotsound' })]), data).rows[0].status, 'missing_shop');
  assert.equal(resolveBrowserProductionWritePlan(writePlan([planned()]), { ...data, offers: [] }).rows[0].status, 'missing_offer');
});

test('preflight rejects duplicate offers as ambiguous and URL or active state as mismatch', () => {
  assert.equal(resolveBrowserProductionWritePlan(writePlan([planned()]), { ...data, offers: [...data.offers, { ...data.offers[0], id: 'offer-r1b' }] }).rows[0].status, 'ambiguous_offer');
  assert.equal(resolveBrowserProductionWritePlan(writePlan([planned()]), { ...data, offers: [{ ...data.offers[0], product_url: 'https://shop.example/other' }] }).rows[0].reason, 'offer_url_mismatch');
  assert.equal(resolveBrowserProductionWritePlan(writePlan([planned()]), { ...data, offers: [{ ...data.offers[0], active: false }] }).rows[0].reason, 'offer_inactive');
});

test('preflight never receives or resolves skipped preserve-only rows', () => {
  const plan = writePlan([
    planned(),
    ...['r2', 'r3', 'r4', 'r12'].map(reference => ({ reference, decision: 'skipped', proposed_observation: null }))
  ]);
  const out = resolveBrowserProductionWritePlan(plan, data);
  assert.equal(out.totals.planned, 1);
  assert.deepEqual(out.rows.map(row => row.reference), ['r1']);
});

test('preflight CLI is GET-only and exposes no write route', async () => {
  const source = await fs.readFile('scripts/preflight-browser-production-writes.mjs', 'utf8');
  assert.match(source, /method: 'GET'/);
  assert.match(source, /SUPABASE_URL and SUPABASE_SECRET_KEY are required for read-only preflight/);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]|\/rpc\//i);
});
