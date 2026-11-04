import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Music Store seed contains 10 verified offers with safe multi-component handling', async () => {
  const seed = JSON.parse(await fs.readFile('web/seed.json', 'utf8'));
  const expected = new Map([
    ['r1', 1858], ['r2', 2096], ['r3', 1433], ['r4', 2866],
    ['r5', 2578], ['r6', 2698], ['r7', 3098], ['r8', 4358],
    ['r15', 1123], ['r16', 1324], ['r17', 1664]
  ]);

  const actual = seed.filter(r => r.offers?.musicstore);
  assert.equal(actual.length, 11);

  for (const [id, price] of expected) {
    const row = seed.find(r => r.id === id);
    assert(row, `missing ${id}`);
    const offer = row.offers?.musicstore;
    assert(offer, `missing Music Store offer for ${id}`);
    assert.equal(offer.price, price);
    assert.match(offer.url, /^https:\/\/www\.musicstore\.de\//);
  }

  for (const id of ['r2','r3','r4','r15','r16','r17']) {
    const offer = seed.find(r => r.id === id).offers.musicstore;
    assert.equal(offer.collectionDisabled, true, `${id} must be excluded from single-URL collection`);
    assert(Array.isArray(offer.components) && offer.components.length >= 2);
  }

  for (const id of ['r15','r16','r17']) {
    assert.equal(seed.find(r => r.id === id).offers.musicstore.match, 'similar');
  }
});

test('collector skips offers explicitly disabled for single-URL collection', async () => {
  const src = await fs.readFile('collector/run.mjs','utf8');
  assert.match(src, /calculation,metadata/);
  assert.match(src, /o\.metadata\?\.collection_disabled !== true/);
});
