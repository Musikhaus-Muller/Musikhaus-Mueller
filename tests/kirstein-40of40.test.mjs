import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Kirstein 40/40 audit reconciles all current verified offers', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  assert.equal(seed.length,40);
  const offers=seed.filter(r=>r.offers?.kirstein);
  assert.equal(offers.length,11);

  const expected=new Map([
    ['r1',1858],['r2',2068],['r3',1427],['r4',2854],['r5',2618],
    ['r6',2798],['r7',3298],['r11',4814],['r15',1071],['r16',1371],['r17',1722]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.kirstein;
    assert(offer,`missing Kirstein offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.priceDate,'2026-11-04');
    assert.equal(offer.verifiedToday,true);
  }
  assert.equal(seed.find(r=>r.id==='r6').offers.kirstein.collectionDisabled,true);
  assert.equal(seed.find(r=>r.id==='r6').offers.kirstein.match,'exact');
});
