import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KIRSTEIN_EXACT_SKU_BINDINGS, bindingForKirsteinReference } from '../collector/kirstein-exact-sku-bindings.mjs';
import { parseKirsteinJsonLd } from '../collector/kirstein-jsonld-catalog.mjs';

const product = (sku, name, price = 929) => `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product', sku, name, offers: { '@type': 'Offer', priceCurrency: 'EUR', price } })}</script>`;

test('Kirstein bindings are explicit, unique, and keep the 404 reference unbound', () => {
  const bound = KIRSTEIN_EXACT_SKU_BINDINGS.filter(item => item.status === 'bound');
  assert.equal(new Set(bound.map(item => item.reference)).size, bound.length);
  assert.equal(new Set(bound.map(item => item.sku)).size, bound.length);
  assert.equal(bindingForKirsteinReference('r4'), null, 'duplicate r3 SKU remains unbound');
  assert.deepEqual(bindingForKirsteinReference('r6')?.status, 'not_found');
  assert.equal(bindingForKirsteinReference('r6')?.sku, null);
});

test('a binding invokes the JSON-LD parser with its exact SKU and variant identity', () => {
  const binding = bindingForKirsteinReference('r7');
  assert.equal(parseKirsteinJsonLd(product(binding.sku, binding.expectedName, 1549), { sku: binding.sku, expectedName: binding.expectedName }).price, 1549);
  assert.throws(() => parseKirsteinJsonLd(product(binding.sku, 'LD Systems Maui 28 G3 Schwarz', 1549), { sku: binding.sku, expectedName: binding.expectedName }), /identity mismatch/);
  assert.throws(() => parseKirsteinJsonLd(product(binding.sku, 'LD Systems MAUI 28 G2 Mix Schwarz', 1549), { sku: binding.sku, expectedName: binding.expectedName }), /identity mismatch/);
  assert.throws(() => parseKirsteinJsonLd(product(binding.sku, 'LD Systems MAUI 28 G3 Pro Schwarz', 1549), { sku: binding.sku, expectedName: binding.expectedName }), /identity mismatch/);
  assert.throws(() => parseKirsteinJsonLd(product(binding.sku, 'LD Systems MAUI 28 G3 Mix BT Schwarz', 1549), { sku: binding.sku, expectedName: binding.expectedName }), /identity mismatch/);
  assert.throws(() => parseKirsteinJsonLd(product(binding.sku, 'LD Systems MAUI 28 G3 Mix Weiss', 1549), { sku: binding.sku, expectedName: binding.expectedName }), /identity mismatch/);
});
