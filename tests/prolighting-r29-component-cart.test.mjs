import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const components=[
  ['AHLDICOA15APRO',2,1289],['AHLDICOASUB21APRO',2,2289],['AHLDICOA15PC',2,52.90],['AHLDICOASUB21PROPC',2,104.95],
  ['AHLDICOASUB21PROCB',2,194.90],['AHGSP2332B',2,23.90],['CPM03FMFX',2,20.90],['3023503R',2,40.90]
];

test('r29 PRO LIGHTING cart is complete, exact, and sums verified component prices', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const offer=seed.find(row=>row.id==='r29')?.offers?.prolighting;
  assert.ok(offer);
  assert.equal(offer.price,8032.90);
  assert.equal(offer.match,'exact');
  assert.equal(offer.classification,'complete_component_calc');
  assert.equal(offer.collectionDisabled,true);
  assert.equal(offer.availability,false);
  assert.equal(offer.availableFrom,'2026-12-01');
  assert.equal(Math.round(offer.componentDetails.reduce((sum,x)=>sum+x.quantity*x.unitPrice,0)*100),Math.round(offer.price*100));
  assert.deepEqual(offer.componentDetails.map(x=>[x.sku,x.quantity,x.unitPrice]),components);
  const topCover=offer.componentDetails.find(x=>x.sku==='AHLDICOA15PC');
  assert.match(topCover.name,/ICOA 15 PC/);
  assert.doesNotMatch(topCover.name,/WPC/);
  const xlr=offer.componentDetails.find(x=>x.sku==='CPM03FMFX');
  assert.match(xlr.name,/audio XLR 3 m/);
  assert.doesNotMatch(xlr.name,/DMX/);
  const power=offer.componentDetails.find(x=>x.sku==='3023503R');
  assert.match(power.name,/PowerCon/);
  assert.match(power.name,/3 m/);
  const familyPage=offer.componentDetails.find(x=>x.sku==='AHLDICOASUB21PROCB');
  assert.equal(familyPage.sourceIdentity,'family_page_sku_price');
});

test('r29 migration persists verified component evidence and merges existing metadata', async () => {
  const sql=await fs.readFile('supabase/migrations/20261108113000_prolighting_r29_verified_component_cart.sql','utf8');
  assert.match(sql,/'r29'/);
  assert.match(sql,/8032\.90/);
  for(const [sku,quantity,unitPrice] of components){
    assert.match(sql,new RegExp(`'sku','${sku}'`));
    assert.match(sql,new RegExp(`'quantity',${quantity},'unit_price',${String(unitPrice).replace('.', '\\.')}`));
  }
  assert.match(sql,/AHLDICOA15PC/);
  assert.doesNotMatch(sql,/AHLDICOA15WPC/);
  assert.match(sql,/'component_calc'/);
  assert.match(sql,/'catalog',true/);
  assert.match(sql,/'component_calc',true/);
  assert.match(sql,/insert into public\.offer_components/);
  assert.match(sql,/insert into public\.component_price_observations/);
  assert.match(sql,/coalesce\(current_offer\.metadata,'\{\}'::jsonb\) \|\| excluded\.metadata/);
});
