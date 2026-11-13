import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cents, challengeDetected, evaluateBrowserOffer, evaluateBrowserTarget, extractStructuredProduct, selectCommercialPrice } from '../collector/browser/browser-price-collector.mjs';

const product = ({ name = 'LD Systems ICOA Pro 12 A Black', sku = 'PAH0024126-000', price = '799.00' } = {}) => JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Product', name, sku, brand: { name: 'LD Systems' }, offers: { '@type': 'Offer', priceCurrency: 'EUR', price }
});

function fakePage({ status = 200, url = 'https://shop.example/product', title = 'Product', jsonLd = [product()], h1 = 'LD Systems ICOA Pro 12 A Black', text = '', rawPrices = [] } = {}) {
  let navigations = 0;
  return {
    get navigations() { return navigations; },
    async goto() { navigations += 1; return { status: () => status, ok: () => status >= 200 && status < 300 }; },
    async waitForTimeout() {},
    url: () => url,
    async evaluate() { return { title, text, h1, jsonLd, skuText: '', rawPrices, iframeCount: 0 }; }
  };
}

const target = { reference: 'r1', url: 'https://shop.example/product', expectedName: 'LD Systems ICOA Pro 12 A Black', expectedSku: 'PAH0024126-000' };

test('detects a rendered challenge even with HTTP 200', () => {
  assert.equal(challengeDetected({ title: 'Just a moment', html: '<main>Checking your browser</main>' }), true);
});

test('extracts a unique JSON-LD EUR Product price', () => {
  const products = extractStructuredProduct([product()]);
  assert.equal(products[0].sku, 'PAH0024126-000');
  assert.equal(selectCommercialPrice({ products }).cents, 79900);
  assert.equal(cents('3.098'), 309800);
});

test('uses a unique visible commercial price but rejects UVP and ambiguous price candidates', () => {
  assert.equal(selectCommercialPrice({ visiblePrices: [{ cents: 79900, source: 'visible_price' }] }).cents, 79900);
  assert.equal(selectCommercialPrice({ visiblePrices: [{ cents: 79900 }, { cents: 89900 }] }).cents, null);
  const page = fakePage({ jsonLd: [], rawPrices: [{ text: 'UVP 999,00 €', html: 'UVP' }, { text: '799,00 €', html: 'sale price' }] });
  return evaluateBrowserTarget(target, { page, cache: new Map(), shop: 'Music Store', waitMs: 0 }).then(result => assert.equal(result.decision, 'refreshable'));
});

test('rejects SKU and strict colour/PRO/BT/MIX identity mismatches', async () => {
  const skuMismatch = await evaluateBrowserTarget(target, { page: fakePage({ jsonLd: [product({ sku: 'PAH0024127-000' })] }), cache: new Map(), shop: 'Music Store', waitMs: 0 });
  assert.equal(skuMismatch.decision, 'identity_mismatch');
  const colourMismatch = await evaluateBrowserTarget(target, { page: fakePage({ jsonLd: [product({ name: 'LD Systems ICOA 12 A White', sku: 'PAH0024126-000' })] }), cache: new Map(), shop: 'Music Store', waitMs: 0 });
  assert.equal(colourMismatch.decision, 'identity_mismatch');
});

test('maps 404 to not_found and caches a duplicate URL once', async () => {
  const missing = await evaluateBrowserTarget(target, { page: fakePage({ status: 404 }), cache: new Map(), shop: 'Thomann', waitMs: 0 });
  assert.equal(missing.decision, 'not_found');
  const page = fakePage(); const cache = new Map();
  await evaluateBrowserTarget(target, { page, cache, shop: 'Music Store', waitMs: 0 });
  await evaluateBrowserTarget({ ...target, reference: 'r2' }, { page, cache, shop: 'Music Store', waitMs: 0 });
  assert.equal(page.navigations, 1);
});

test('component carts require every component and calculate in cents', async () => {
  const page = fakePage();
  const complete = await evaluateBrowserOffer({ ...target, collectionDisabled: true, componentDetails: [{ name: target.expectedName, url: target.url, articleNumber: target.expectedSku, quantity: 2 }], previousPrice: 0 }, { page, cache: new Map(), shop: 'Music Store', waitMs: 0 });
  assert.equal(complete.decision, 'refreshable');
  assert.equal(complete.observed_price, 1598);
  const incomplete = await evaluateBrowserOffer({ ...target, collectionDisabled: true, componentDetails: [{ name: target.expectedName, url: target.url, articleNumber: target.expectedSku, quantity: 1 }, { name: 'Missing component', url: 'https://shop.example/missing', quantity: 1 }], previousPrice: 0 }, { page: fakePage({ status: 404 }), cache: new Map(), shop: 'Music Store', waitMs: 0 });
  assert.equal(incomplete.decision, 'incomplete_recipe');
});

test('browser shadow remains separate from production writers and accepts only explicit modes', async () => {
  const source = await (await import('node:fs/promises')).readFile('scripts/run-browser-shadow.mjs', 'utf8');
  assert.match(source, /--canary/);
  assert.match(source, /--headed/);
  assert.match(source, /--headless/);
  assert.doesNotMatch(source, /SUPABASE|\/rest\/v1|INSERT|UPDATE|POST.*supabase|proxy|stealth|fingerprint|captcha solving/i);
});
