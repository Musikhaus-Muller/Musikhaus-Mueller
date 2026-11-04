import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Musikhaus Müller 40/40 audit reconciles all reference rows', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  assert.equal(seed.length,40);
  const offers=seed.filter(r=>r.offers?.mueller);
  assert.equal(offers.length,36);

  const expected=new Map([
    ['r10',3052],['r11',4379],['r12',7199],['r29',7619]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.mueller;
    assert(offer,`missing Müller offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.priceDate,'2026-11-04');
    assert.equal(offer.verifiedToday,true);
  }
  assert.equal(seed.find(r=>r.id==='r10').offers.mueller.match,'exact');
  assert.equal(seed.find(r=>r.id==='r11').offers.mueller.match,'exact');
  assert.equal(seed.find(r=>r.id==='r12').offers.mueller.match,'exact');
  assert.equal(seed.find(r=>r.id==='r29').offers.mueller.match,'similar');

  for(const id of ['r13','r14','r18','r22']){
    assert.equal(seed.find(r=>r.id===id).offers?.mueller,undefined);
  }

  for(const row of offers){
    assert.equal(row.offers.mueller.verifiedToday,true);
    assert.equal(row.offers.mueller.priceDate,'2026-11-04');
  }
});
