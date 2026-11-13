import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrice, validateSourceIdentity } from '../collector/source-resolution.mjs';
import { probeMusicStoreSources } from '../collector/musicstore-source-probe.mjs';

const expected = { shop: 'Music Store', sku: 'PAH1', name: 'LD Systems ICOA Pro 12 A Schwarz' };
const candidate = (type, extra = {}) => ({ status: 'success', shop: 'Music Store', sku: 'PAH1', name: 'LD Systems ICOA Pro 12 A Schwarz', price: 1089, currency: 'EUR', source: { type, method: type, url: 'https://shop.example/product' }, ...extra });

test('source resolver prefers the strongest valid official source', () => {
  const result = resolvePrice({ expectedIdentity: expected, candidates: [candidate('official_catalog'), candidate('official_structured_product_data')] });
  assert.equal(result.source.type, 'official_structured_product_data');
  assert.equal(result.verified, true);
});

test('source resolver rejects retailer, SKU, and strict variant mismatches', () => {
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), shop: 'Other' }).reason, 'retailer_mismatch');
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), sku: 'PAH2' }).reason, 'sku_mismatch');
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), name: 'LD Systems ICOA 12 A Schwarz' }).reason, 'variant_mismatch');
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), name: 'LD Systems ICOA Pro 12 A Weiss' }).reason, 'variant_mismatch');
});

test('blocked primary may use valid secondary, but invalid secondary preserves previous', () => {
  const secondary = candidate('official_catalog');
  assert.equal(resolvePrice({ expectedIdentity: expected, candidates: [{ status: 'blocked', source: { type: 'official_product_api' } }, secondary] }).price, 1089);
  const result = resolvePrice({ expectedIdentity: expected, candidates: [{ status: 'blocked', source: { type: 'official_product_api' } }, { ...secondary, sku: 'wrong' }] });
  assert.equal(result.preservePrevious, true);
});

test('read-only probe records provenance without a write path', async () => {
  const output = await probeMusicStoreSources({ reference: 'r28', expectedIdentity: expected, sources: [{ type: 'official_catalog', method: 'catalog', url: 'https://shop.example/catalog', parse: () => ({ shop: 'Music Store', sku: 'PAH1', name: expected.name, price: 1089, currency: 'EUR' }) }], fetcher: async () => new Response('catalog', { status: 200 }) });
  assert.equal(output.selected_source, 'catalog');
  assert.equal(output.result.price, 1089);
});
