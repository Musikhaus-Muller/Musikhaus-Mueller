import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseKirsteinJsonLd } from '../collector/kirstein-jsonld-catalog.mjs';

const product = (sku, name, price) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', sku, name, offers: { '@type': 'Offer', priceCurrency: 'EUR', price } })}</script>`;

test('Kirstein JSON-LD proposal requires exact SKU, identity, and one price', () => {
  const html = product('00095963', 'LD Systems MAUI 11 G3 Schwarz', 929) + product('00095964', 'LD Systems MAUI 11 G3 Weiss', 939);
  assert.deepEqual(parseKirsteinJsonLd(html, { sku: '00095963', expectedName: 'LD Systems MAUI 11 G3 Schwarz' }), { sku: '00095963', name: 'LD Systems MAUI 11 G3 Schwarz', price: 929, sourceMethod: 'kirstein_jsonld_exact_sku' });
  assert.throws(() => parseKirsteinJsonLd(html, { sku: '00095964', expectedName: 'LD Systems MAUI 11 G3 Schwarz' }), /identity mismatch/);
  assert.throws(() => parseKirsteinJsonLd(html, { sku: '00099999', expectedName: 'LD Systems MAUI 11 G3 Schwarz' }), /not found/);
});

test('Kirstein JSON-LD rejects a neighbour price and PRO/BT cross-match', () => {
  const html = product('00095963', 'LD Systems ICOA Pro 12 A', 1089) + product('00095964', 'LD Systems ICOA 12 A BT', 429);
  assert.throws(() => parseKirsteinJsonLd(html, { sku: '00095963', expectedName: 'LD Systems ICOA 12 A' }), /identity mismatch/);
  assert.throws(() => parseKirsteinJsonLd(html + product('00095963', 'LD Systems ICOA Pro 12 A', 999), { sku: '00095963', expectedName: 'LD Systems ICOA Pro 12 A' }), /Ambiguous Kirstein SKU/);
});
