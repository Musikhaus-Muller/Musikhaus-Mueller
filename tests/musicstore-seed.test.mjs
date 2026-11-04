import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('initial Music Store offers are exact and calculated from one product x2', async () => {
  const seed = JSON.parse(await fs.readFile('web/seed.json', 'utf8'));
  const expected = new Map([
    ['r1', 1858],
    ['r5', 2578],
    ['r6', 2698],
    ['r7', 3098]
  ]);

  for (const [id, price] of expected) {
    const row = seed.find(r => r.id === id);
    assert(row, `missing ${id}`);
    const offer = row.offers?.musicstore;
    assert(offer, `missing Music Store offer for ${id}`);
    assert.equal(offer.match, 'exact');
    assert.equal(offer.price, price);
    assert.match(offer.url, /^https:\/\/www\.musicstore\.de\//);
    assert.match(offer.calculation, /^2 × /);
  }
});
