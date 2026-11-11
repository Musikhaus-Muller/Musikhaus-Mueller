import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {
  KIRSTEIN_OFFER_QUANTITIES,
  buildKirsteinProductionPlan,
  validateLiveOfferBindings,
  writeKirsteinProduction
} from '../collector/kirstein-production.mjs';
import { KIRSTEIN_EXACT_SKU_BINDINGS } from '../collector/kirstein-exact-sku-bindings.mjs';

const bound = KIRSTEIN_EXACT_SKU_BINDINGS.filter(binding => binding.status === 'bound');

function successfulShadow() {
  const prices = { r1: 929, r2: 1027, r3: 1400, r5: 1289, r7: 1549, r11: 2380, r15: 1071, r16: 1272, r17: 1612 };
  return {
    execution_environment: 'self_hosted',
    observed_at: '2026-11-11T16:27:53.775Z',
    writes: false,
    results: bound.map(binding => ({
      reference: binding.reference,
      url: binding.url,
      expected_sku: binding.sku,
      http_status: 200,
      parsed_sku: binding.sku,
      parsed_name: binding.expectedName,
      identity_valid: true,
      price: prices[binding.reference],
      price_valid: true,
      decision: 'refreshable_shadow'
    }))
  };
}

test('Kirstein production plan applies only explicit reviewed offer quantities', () => {
  assert.deepEqual(KIRSTEIN_OFFER_QUANTITIES, {
    r1: 2, r2: 2, r3: 1, r5: 2, r7: 2, r11: 2, r15: 1, r16: 1, r17: 1
  });
  const plan = buildKirsteinProductionPlan(successfulShadow());
  const totals = Object.fromEntries(plan.rows.map(row => [row.reference, row.total_price]));
  assert.deepEqual(totals, {
    r1: 1858,
    r2: 2054,
    r3: 1400,
    r5: 2578,
    r7: 3098,
    r11: 4760,
    r15: 1071,
    r16: 1272,
    r17: 1612
  });
  assert.deepEqual(plan.summary, { total_bound: 9, refreshable: 9, preserved: 0 });
  assert.equal(plan.writes, false);
});

test('live offer preflight requires exact URL and exact reviewed quantity for all nine bindings', () => {
  const live = bound.map(binding => ({
    id: `offer-${binding.reference}`,
    reference: binding.reference,
    product_url: binding.url,
    calculation: KIRSTEIN_OFFER_QUANTITIES[binding.reference] === 2 ? '2 × current unit price' : null
  }));
  assert.equal(validateLiveOfferBindings(live).size, 9);
  assert.throws(() => validateLiveOfferBindings(live.filter(row => row.reference !== 'r3')), /Missing live Kirstein offer for r3/);
  assert.throws(() => validateLiveOfferBindings(live.map(row => row.reference === 'r1' ? { ...row, product_url: row.product_url + '?wrong=1' } : row)), /Live URL mismatch for r1/);
  assert.throws(() => validateLiveOfferBindings(live.map(row => row.reference === 'r11' ? { ...row, calculation: null } : row)), /Live quantity mismatch for r11/);
});

test('write mode requires explicit confirmation and self-hosted evidence before Supabase access', async () => {
  await assert.rejects(
    writeKirsteinProduction({
      shadowReport: successfulShadow(),
      confirmation: 'NO',
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'secret',
      fetchImpl: async () => { throw new Error('must not fetch'); }
    }),
    /WRITE_KIRSTEIN_9/
  );

  const local = successfulShadow();
  local.execution_environment = 'local';
  await assert.rejects(
    writeKirsteinProduction({
      shadowReport: local,
      confirmation: 'WRITE_KIRSTEIN_9',
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'secret',
      fetchImpl: async () => { throw new Error('must not fetch'); }
    }),
    /self_hosted/
  );
});

test('Kirstein production source never updates offers and keeps plan as default mode', async () => {
  const source = await fs.readFile('collector/kirstein-production.mjs', 'utf8');
  assert.match(source, /argValue\('mode', 'plan'\)/);
  assert.match(source, /WRITE_KIRSTEIN_9/);
  assert.match(source, /kirstein_jsonld_exact_sku_self_hosted/);
  assert.doesNotMatch(source, /rest\(['"]offers['"],\s*\{\s*method:\s*['"](POST|PATCH|PUT|DELETE)/i);
  assert.doesNotMatch(source, /playwright|puppeteer|proxy|captcha|sitemap|search/i);
});
