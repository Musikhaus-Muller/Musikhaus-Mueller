import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Thomann audit contains 29 verified offers after 40/40 reconciliation', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const actual=seed.filter(r=>r.offers?.thomann);
  assert.equal(actual.length,29);

  const expected=new Map([
    ['r5',2578],['r6',2669],['r8',4358],['r9',4936]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.thomann;
    assert(offer,`missing Thomann offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.match,'exact');
    assert.match(offer.url,/^https:\/\/www\.thomann\.de\//);
  }

  for(const id of ['r5','r8','r9']){
    assert.equal(seed.find(r=>r.id===id).offers.thomann.collectionDisabled,true);
  }
  assert.equal(seed.find(r=>r.id==='r6').offers.thomann.collectionDisabled,undefined);
});
