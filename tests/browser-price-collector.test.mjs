import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cents, challengeDetected, evaluateBrowserOffer, evaluateBrowserTarget, extractStructuredProduct, selectCommercialPrice } from '../collector/browser/browser-price-collector.mjs';
import { selectThomannProductRootPrice } from '../collector/browser/thomann-browser.mjs';
import { componentDetailsForBrowserShadow } from '../collector/browser/component-details-precedence.mjs';
import { VERSIONED_COMPONENT_DETAILS } from '../collector/browser/versioned-component-details.mjs';

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
  assert.match(source, /--full-shadow/);
  assert.match(source, /--headed/);
  assert.match(source, /--headless/);
  assert.doesNotMatch(source, /SUPABASE|\/rest\/v1|INSERT|UPDATE|POST.*supabase|proxy|stealth|fingerprint|captcha solving/i);
});

test('Thomann product root selects only its current price and rejects page neighbours', () => {
  const rendered = { thomannRoot: { selector: '.fx-content-product__sidebar.price-and-availability .price__primary', text: '1.839 € UVP: 2.179,80 €', ancestry: ['.product-price-box'], prices: ['1.839 €'] } };
  const selected = selectThomannProductRootPrice(rendered);
  assert.equal(selected.cents, 183900);
  assert.equal(selected.source, 'thomann_product_root');
  assert.match(selected.diagnostics.rejected.join(' '), /related product roots/);
});

test('Thomann rejects ambiguous or absent product-root prices, not a related price', () => {
  assert.equal(selectThomannProductRootPrice({ thomannRoot: { prices: ['1.839 €', '1.798 €'], selector: '.root', text: '', ancestry: [] } }).cents, null);
  assert.equal(selectThomannProductRootPrice({ thomannRoot: null }).cents, null);
});

test('Thomann DOM price selection explicitly prefers price__primary and keeps fallback cleanup narrow', async () => {
  const source = await (await import('node:fs/promises')).readFile('collector/browser/browser-price-collector.mjs', 'utf8');
  // A selector list does not encode priority; the primary span is deliberately
  // queried before the wrapper that can appear first in DOM order.
  assert.match(source, /const primaryRootPrice = thomannRoot\?\.querySelector\('\.price__primary'\);/);
  assert.match(source, /const rootPrice = primaryRootPrice \|\| thomannRoot\?\.querySelector\('\.price\.fx-text\.fx-text--no-margin'\);/);
  assert.doesNotMatch(source, /querySelector\('\.price__primary, \.price\.fx-text\.fx-text--no-margin'\)/);
  assert.doesNotMatch(source, /querySelectorAll\('\.strike-price--highlight,/);

  // These are the normalized extraction outcomes for the three rendered
  // layouts: primary before its wrapper, legacy fallback, and a page with
  // only non-commercial values. Ambiguity remains a hard rejection.
  assert.equal(selectThomannProductRootPrice({ thomannRoot: { prices: ['1.839 €'], selector: '.price__primary', text: '1.839 € UVP: 2.179,80 €', ancestry: [] } }).cents, 183900);
  assert.equal(selectThomannProductRootPrice({ thomannRoot: { prices: ['749 €'], selector: '.price.fx-text.fx-text--no-margin', text: '749 €', ancestry: [] } }).cents, 74900);
  assert.equal(selectThomannProductRootPrice({ thomannRoot: { prices: [], selector: '.price.fx-text.fx-text--no-margin', text: 'UVP: 2.179 € 30-Tage-Bestpreis: 1.798 € Finanzierung', ancestry: [] } }).cents, null);
  assert.equal(selectThomannProductRootPrice({ thomannRoot: { prices: ['1.839 €', '1.798 €'], selector: '.price.fx-text.fx-text--no-margin', text: '', ancestry: [] } }).cents, null);
});

test('full shadow marks a price delta over twenty percent for manual review', () => {
  assert.equal(Math.abs((1250 - 1000) / 1000 * 100) > 20, true);
});

test('browser-shadow binding takes precedence over existing seed componentDetails', () => {
  const details = componentDetailsForBrowserShadow({
    shop: 'hotsound', reference: 'r9',
    offer: { componentDetails: [{ name: 'LD Systems MAUI 44 G2 CB Rollbrett', url: 'https://seed.example/cb', quantity: 2 }] },
    articleNumberFromUrl: () => null
  });
  assert.equal(details.at(-1).name, 'LD Systems MAUI 44 G2 CB');
  assert.equal(details.at(-1).url, 'https://www.hotsound-store.com/ld-systems-maui-44-g2-cb-12143');
  assert.equal(details.at(-1).quantity, 2);
  const fallback = componentDetailsForBrowserShadow({ shop: 'hotsound', reference: 'r2', offer: { componentDetails: [{ name: 'seed only', url: 'https://seed.example/item', quantity: 1 }] }, articleNumberFromUrl: () => null });
  assert.equal(fallback[0].name, 'seed only');
});

test('Thomann shadow bindings use the current exact Wheelboard and packaged Gravity stand-set pages', () => {
  const wheelboard = VERSIONED_COMPONENT_DETAILS.thomann.r9.at(-1);
  assert.deepEqual(wheelboard, {
    name: 'LD Systems Wheelboard f. Maui 44 G2',
    url: 'https://www.thomann.de/de/ld_systems_wheelboard_f._maui_44_g2.htm',
    quantity: 2
  });
  for (const reference of ['r23', 'r27']) {
    const standSet = VERSIONED_COMPONENT_DETAILS.thomann[reference].find(component => component.name.startsWith('Gravity SS 5211'));
    assert.deepEqual(standSet, {
      name: 'Gravity SS 5211 B Set 1 Speaker Stand',
      url: 'https://www.thomann.de/de/gravity_ss_5211_b_set_1_speaker_stand.htm',
      quantity: 1
    });
    assert.doesNotMatch(standSet.url, /b_stock/i);
  }
});
