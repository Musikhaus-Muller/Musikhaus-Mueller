import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Music Store 40/40 audit contains 19 verified offers with safe multi-component handling', async () => {
  const seed = JSON.parse(await fs.readFile('web/seed.json', 'utf8'));
  const expected = new Map([
    ['r1', 1858], ['r2', 2096], ['r3', 1433], ['r4', 2866],
    ['r5', 2578], ['r6', 2698], ['r7', 3098], ['r8', 4358], ['r10', 3363.8], ['r13', 839], ['r14', 1069], ['r23', 1687.8], ['r24', 2601.8], ['r25', 2681.8], ['r26', 4337.6], ['r28', 6627.8],
    ['r15', 1123], ['r16', 1324], ['r17', 1664]
  ]);

  const actual = seed.filter(r => r.offers?.musicstore);
  assert.equal(seed.length, 40);
  assert.equal(actual.length, 19);
  for (const row of actual) {
    assert.equal(row.offers.musicstore.verifiedToday, true);
    assert.equal(row.offers.musicstore.priceDate, '2026-11-04');
  }

  for (const [id, price] of expected) {
    const row = seed.find(r => r.id === id);
    assert(row, `missing ${id}`);
    const offer = row.offers?.musicstore;
    assert(offer, `missing Music Store offer for ${id}`);
    assert.equal(offer.price, price);
    assert.match(offer.url, /^https:\/\/www\.musicstore\.de\//);
  }

  for (const id of ['r2','r3','r4','r15','r16','r17','r23','r24','r25','r26']) {
    const offer = seed.find(r => r.id === id).offers.musicstore;
    assert.equal(offer.collectionDisabled, true, `${id} must be excluded from single-URL collection`);
    assert(Array.isArray(offer.components) && offer.components.length >= 2);
  }

  for (const id of ['r15','r16','r17','r23','r24','r25','r26','r10','r28']) {
    assert.equal(seed.find(r => r.id === id).offers.musicstore.match, 'similar');
  }
});

test('collector v2 collects component-backed offers instead of skipping them', async () => {
  const src = await fs.readFile('collector/run.mjs','utf8');
  assert.match(src, /offer_components\?select=/);
  assert.match(src, /componentsByOffer/);
  assert.match(src, /collection_disabled !== true \|\| o\.components\.length > 0/);
  assert.match(src, /aggregateComponentResults/);
});
