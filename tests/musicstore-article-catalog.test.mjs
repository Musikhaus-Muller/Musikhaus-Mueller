import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleNumberFromMusicStoreUrl, parseMusicStoreArticleCatalog } from '../collector/musicstore-article-catalog.mjs';

const catalog = `
  <article><p>Art.-Nr.: PAH0024126-000 LD Systems ICOA Pro 12 A</p><span>1.089,00 €</span><p>Lieferbar</p></article>
  <article><h2>LD Systems ICOA Pro 15 A</h2><p>Art.-Nr.: PAH0024127-000</p><span>1.299,00 €</span><p>Lieferbar</p></article>
  <article><h2>LD Systems ICOA 12 A BT</h2><p>Art.-Nr.: PAH0021617-000</p><span>429,00 €</span><p>Lieferbar</p></article>
  <article><h2>LD Systems ICOA 15 A BT</h2><p>Art.-Nr.: PAH0021619-000</p><span>469,00 €</span><p>Nicht lieferbar</p></article>
  <article><h2>LD Systems ICOA 12 PC</h2><p>Art.-Nr.: PAH0021620-000</p><span>42,00 €</span><p>Lieferbar</p></article>
  <article><h2>LD Systems STINGER 8 A G3</h2><p>Art.-Nr.: PAH0023678-000</p><span>499,00 €</span><p>Lieferbar</p></article>`;

test('Music Store catalog resolves only the requested Art.-Nr. block', () => {
  const out = parseMusicStoreArticleCatalog(catalog, { articleNumber: 'PAH0024126-000', expectedName: 'LD Systems ICOA Pro 12 A' });
  assert.deepEqual(out, { articleNumber: 'PAH0024126-000', name: 'LD Systems ICOA Pro 12 A', price: 1089, available: true, sourceMethod: 'musicstore_public_catalog_article_number' });
  assert.equal(articleNumberFromMusicStoreUrl('https://www.musicstore.de/x/art-PAH0024126-000'), 'PAH0024126-000');
});

test('Music Store catalog retains distinct PRO and BT variants', () => {
  assert.equal(parseMusicStoreArticleCatalog(catalog, { articleNumber: 'PAH0021617-000', expectedName: 'LD Systems ICOA 12 A BT' }).price, 429);
  assert.throws(() => parseMusicStoreArticleCatalog(catalog, { articleNumber: 'PAH0024126-000', expectedName: 'LD Systems ICOA 12 A' }), /identity mismatch/);
  assert.throws(() => parseMusicStoreArticleCatalog(catalog, { articleNumber: 'PAH0021617-000', expectedName: 'LD Systems ICOA 12 A' }), /identity mismatch/);
});

test('Music Store catalog rejects neighbour SKUs, neighbour prices, and missing prices', () => {
  assert.throws(() => parseMusicStoreArticleCatalog(catalog, { articleNumber: 'PAH0024128-000', expectedName: 'LD Systems ICOA Pro Sub 21 A' }), /not found/);
  assert.throws(() => parseMusicStoreArticleCatalog(catalog.replace('1.089,00 €', ''), { articleNumber: 'PAH0024126-000', expectedName: 'LD Systems ICOA Pro 12 A' }), /price not found/);
  assert.throws(() => parseMusicStoreArticleCatalog(catalog.replace('1.089,00 €', '1.089,00 € <span>999,00 €</span>'), { articleNumber: 'PAH0024126-000', expectedName: 'LD Systems ICOA Pro 12 A' }), /Ambiguous/);
});
