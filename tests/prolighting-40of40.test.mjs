import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('PRO LIGHTING 40/40 audit reconciles all published offers', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  assert.equal(seed.length,40);
  const offers=seed.filter(r=>r.offers?.prolighting);
  assert.equal(offers.length,22);

  const expected=new Map([
    ['r1',1858],['r3',1289],['r4',2841.5],['r5',2578],['r6',2658],['r7',3098],
    ['r19',3369],['r20',4479],['r21',7349],
    ['r2',2096],['r11',4469.44],['r14',1049],['r24',2537.24],['r25',2675.04],
    ['r26',4318.68],['r28',6647.6],
    ['r30',2098],['r31',2178],['r32',2529.6],['r33',2609.6],['r34',1264.8],['r35',1304.8]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.prolighting;
    assert(offer,`missing PRO LIGHTING offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.priceDate,['r2','r11','r14','r24','r25','r26','r28'].includes(id)?'2026-11-06':'2026-11-04');
    assert.equal(offer.verifiedToday,true);
  }
  for(const id of ['r19','r20','r21']) assert.equal(seed.find(r=>r.id===id).offers.prolighting.available,false);
  for(const id of ['r32','r33','r34','r35']) assert.equal(seed.find(r=>r.id===id).offers.prolighting.collectionDisabled,true);
});

test('new PRO LIGHTING bundle offers preserve exact complete recipes and calculated totals', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const expected=new Map([
    ['r2',{components:1,units:[[2,104800]],calculation:'2 × 1.048 € = 2.096 €',items:['MAUI 11 G3','SAT BAG','SUB PC']}],
    ['r11',{components:3,units:[[2,128900],[2,93900],[2,672]],calculation:'2 × 1.289 € + 2 × 939 € + 2 × 6,72 € = 4.469,44 €',items:['MAUI 28 G3','MAUI 28 G3 SUB','MMF 0300']}],
    ['r14',{components:3,units:[[1,91900],[1,8500],[1,4500]],calculation:'919 € + 85 € + 45 € = 1.049 €',items:['MAUI 28 G2','SAT BAG','SUB PC']}],
    ['r24',{components:4,units:[[2,39900],[2,83900],[2,2390],[2,672]],calculation:'2 × 399 € + 2 × 839 € + 2 × 23,90 € + 2 × 6,72 € = 2.537,24 €',items:['ICOA 12 A BT','ICOA SUB 18 A','SP 2332 B','MMF 0300']}],
    ['r25',{components:4,units:[[2,46790],[2,83900],[2,2390],[2,672]],calculation:'2 × 467,90 € + 2 × 839 € + 2 × 23,90 € + 2 × 6,72 € = 2.675,04 €',items:['ICOA 15 A BT','ICOA SUB 18 A','SP 2332 B','MMF 0300']}],
    ['r26',{components:3,units:[[2,46790],[4,83900],[4,672]],calculation:'2 × 467,90 € + 4 × 839 € + 4 × 6,72 € = 4.318,68 €',items:['ICOA 15 A BT','ICOA SUB 18 A','MMF 0300']}],
    ['r28',{components:4,units:[[2,108900],[2,219000],[2,2390],[2,2090]],calculation:'2 × 1.089 € + 2 × 2.190 € + 2 × 23,90 € + 2 × 20,90 € = 6.647,60 €',items:['ICOA PRO 12 A','ICOA PRO SUB 21 A','SP 2332 B','CPM 3 FM-FLEX']}]
  ]);
  for(const [id,recipe] of expected){
    const offer=seed.find(row=>row.id===id)?.offers?.prolighting;
    assert.ok(offer,`missing PRO LIGHTING offer for ${id}`);
    assert.equal(offer.match,'exact');
    assert.equal(offer.priceDate,'2026-11-06');
    assert.equal(offer.verifiedToday,true);
    assert.equal(offer.collectionDisabled,true);
    assert.equal(offer.components.length,recipe.components);
    assert.equal(offer.calculation,recipe.calculation);
    assert.equal(recipe.units.reduce((total,[quantity,unitPrice])=>total+quantity*unitPrice,0),Math.round(offer.price*100));
    for(const item of recipe.items) assert.ok(offer.contents.includes(item),`${id} missing ${item}`);
  }
});

test('new PRO LIGHTING component calculations are persisted with component evidence', async () => {
  const migration=await fs.readFile('supabase/migrations/20261106100000_prolighting_verified_component_carts.sql','utf8');
  for(const id of ['r2','r11','r14','r24','r25','r26','r28']) assert.ok(migration.includes(`'${id}'`));
  assert.match(migration,/insert into public\.offer_components/);
  assert.match(migration,/insert into public\.component_price_observations/);
  assert.match(migration,/insert into public\.price_observations/);
  assert.match(migration,/'component_calc'/);
});
