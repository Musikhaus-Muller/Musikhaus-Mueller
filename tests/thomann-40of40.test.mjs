import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Thomann 40/40 audit reconciles every reference row', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  assert.equal(seed.length,40);
  assert.equal(seed.filter(r=>r.offers?.thomann).length,29);

  const expected=new Map([
    ['r3',1409],['r4',2818],['r6',2669],['r7',3159],
    ['r20',3959],['r21',6669],['r22',2099],
    ['r23',1753.8],['r24',2637],['r25',2717],['r26',4408],['r27',4949]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.thomann;
    assert(offer,`missing Thomann offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.priceDate,'2026-11-04');
    assert.equal(offer.verifiedToday,true);
  }

  for(const id of ['r23','r24','r25','r26','r27']){
    const offer=seed.find(r=>r.id===id).offers.thomann;
    assert.equal(offer.collectionDisabled,true);
    assert.equal(offer.match,'similar');
  }

  for(const id of ['r30','r31','r32','r33','r34','r35','r36','r37','r38','r39','r40']){
    assert.equal(seed.find(r=>r.id===id).offers?.thomann,undefined);
  }
});
