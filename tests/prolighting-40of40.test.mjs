import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('PRO LIGHTING 40/40 audit reconciles all published offers', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  assert.equal(seed.length,40);
  const offers=seed.filter(r=>r.offers?.prolighting);
  assert.equal(offers.length,15);

  const expected=new Map([
    ['r1',1858],['r3',1289],['r4',2841.5],['r5',2578],['r6',2658],['r7',3098],
    ['r19',3369],['r20',4479],['r21',7349],
    ['r30',2098],['r31',2178],['r32',2529.6],['r33',2609.6],['r34',1264.8],['r35',1304.8]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.prolighting;
    assert(offer,`missing PRO LIGHTING offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.priceDate,'2026-11-04');
    assert.equal(offer.verifiedToday,true);
  }
  for(const id of ['r19','r20','r21']) assert.equal(seed.find(r=>r.id===id).offers.prolighting.available,false);
  for(const id of ['r32','r33','r34','r35']) assert.equal(seed.find(r=>r.id===id).offers.prolighting.collectionDisabled,true);
});
