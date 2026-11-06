import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('HotSound 40/40 audit reconciles all published offers', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  assert.equal(seed.length,40);
  const offers=seed.filter(r=>r.offers?.hotsound);
  assert.equal(offers.length,26);

  const expected=new Map([
    ['r1',1858],['r2',2047],['r4',2839],['r6',2878],['r7',3098],
    ['r19',3219],['r20',4169],['r21',6899],['r28',6599],
    ['r31',2698],['r32',2848],
    ['r36',1698],['r37',1796],['r38',3592],['r39',11690],
    ['r8',3998],['r9',4544],['r13',839],['r14',928],
    ['r5',2590],['r10',3328],['r11',4468],
    ['r30',2290],['r33',3166],['r34',1379],['r35',1583]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.hotsound;
    assert(offer,`missing HotSound offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.priceDate,['r5','r8','r9','r10','r11','r13','r14','r30','r33','r34','r35'].includes(id)?'2026-11-06':'2026-11-04');
    assert.equal(offer.verifiedToday,true);
  }
  for(const id of ['r1','r5','r6','r7','r10','r11','r31','r33','r34','r35','r36','r37','r38','r9','r13','r14']){
    assert.equal(seed.find(r=>r.id===id).offers.hotsound.collectionDisabled,true);
  }
});
