import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrice, validateSourceIdentity } from '../collector/source-resolution.mjs';
import { probeMusicStoreSources } from '../collector/musicstore-source-probe.mjs';
import { probeSources } from '../collector/source-probe.mjs';

const expected = { shop: 'Music Store', sku: 'PAH1', name: 'LD Systems ICOA Pro 12 A Schwarz' };
const candidate = (type, extra = {}) => ({ status: 'success', shop: 'Music Store', sku: 'PAH1', name: 'LD Systems ICOA Pro 12 A Schwarz', price: 1089, currency: 'EUR', source: { type, method: type, url: 'https://shop.example/product' }, ...extra });

test('source resolver prefers the strongest valid official source', () => {
  const result = resolvePrice({ expectedIdentity: expected, candidates: [candidate('official_catalog'), candidate('official_structured_product_data')] });
  assert.equal(result.source.type, 'official_structured_product_data');
  assert.equal(result.verified, true);
});

test('source resolver rejects retailer, SKU, and strict variant mismatches', () => {
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), shop: null }).reason, 'retailer_missing');
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), shop: 'Other' }).reason, 'retailer_mismatch');
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), sku: 'PAH2' }).reason, 'sku_mismatch');
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), name: 'LD Systems ICOA 12 A Schwarz' }).reason, 'variant_mismatch');
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), name: 'LD Systems ICOA Pro 12 A Weiss' }).reason, 'variant_mismatch');
});

test('source type is an allowlist and source quality preserves proposal-only policy', () => {
  const unsupported = resolvePrice({ expectedIdentity: expected, candidates: [candidate('unknown_source')] });
  assert.equal(unsupported.preservePrevious, true);
  assert.equal(unsupported.reason, 'unsupported_source_type');
  for (const type of ['official_product_api', 'official_catalog']) {
    const result = resolvePrice({ expectedIdentity: expected, candidates: [candidate(type)] });
    assert.equal(result.autoRefreshEligible, true, type);
    assert.equal(result.proposalOnly, false, type);
  }
  for (const type of ['official_public_feed', 'external_verified_retailer_feed', 'external_price_aggregator']) {
    const result = resolvePrice({ expectedIdentity: expected, candidates: [candidate(type)] });
    assert.equal(result.autoRefreshEligible, false, type);
    assert.equal(result.proposalOnly, true, type);
  }
});

test('colour synonyms are strict equivalences but black and white do not cross-match', () => {
  for (const [wanted, found] of [['Schwarz', 'Black'], ['Black', 'Schwarz'], ['Weiß', 'White'], ['White', 'Weiss']]) {
    assert.equal(validateSourceIdentity({ ...expected, name: `LD Systems ICOA Pro 12 A ${wanted}` }, { ...candidate('official_catalog'), name: `LD Systems ICOA Pro 12 A ${found}` }).valid, true);
  }
  assert.equal(validateSourceIdentity(expected, { ...candidate('official_catalog'), name: 'LD Systems ICOA Pro 12 A White' }).reason, 'variant_mismatch');
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
  assert.equal(output.result.quality, 3);
  assert.equal(output.result.source.url, 'https://shop.example/catalog');
});

test('probe classifies 410 and records Retry-After on 429 without retrying', async () => {
  const source = { type: 'official_catalog', method: 'catalog', url: 'https://shop.example/catalog' };
  const notFound = await probeSources({ shop: 'x', reference: 'r', expectedIdentity: expected, sources: [source], fetcher: async () => new Response('', { status: 410 }) });
  assert.equal(notFound.sources[0].status, 'not_found');
  const limited = await probeSources({ shop: 'x', reference: 'r', expectedIdentity: expected, sources: [source], fetcher: async () => new Response('', { status: 429, headers: { 'Retry-After': '120' } }) });
  assert.equal(limited.sources[0].status, 'blocked');
  assert.equal(limited.sources[0].reason, 'rate_limited');
  assert.equal(limited.sources[0].retryAfter, '120');
});
