import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const ids=['r9','r10','r12','r13'];
const prices=new Map([['r9',4935.80],['r10',3389.80],['r12',7377.80],['r13',839]]);

test('Gap Recovery PRO LIGHTING candidates are exact, complete, and priced from their components', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  for(const id of ids){
    const offer=seed.find(row=>row.id===id)?.offers?.prolighting;
    assert.ok(offer,`missing ${id}`);
    assert.equal(offer.price,prices.get(id));
    assert.equal(offer.match,'exact');
    assert.equal(offer.classification,'complete_component_calc');
    assert.equal(offer.collectionDisabled,true);
    assert.equal(offer.verifiedToday,true);
    assert.equal(offer.priceDate,'2026-11-08');
    assert.equal(offer.components.length,offer.componentDetails.length);
    assert.equal(offer.componentDetails.reduce((sum,x)=>sum+x.quantity*x.unitPrice,0),offer.price);
  }
  const r9=seed.find(row=>row.id==='r9').offers.prolighting;
  assert.deepEqual(r9.componentDetails.map(x=>x.name),[
    'LD Systems MAUI 44 G2 schwarz','LD Systems MAUI 44 G2 SUB PC','LD Systems MAUI 44 G2 SAT BAG','LD Systems MAUI 44 G2 CB'
  ]);
  const r10=seed.find(row=>row.id==='r10').offers.prolighting;
  assert.ok(r10.componentDetails.at(-1).name.includes('audio XLR 3 m'));
  assert.ok(!r10.componentDetails.at(-1).name.toLowerCase().includes('dmx'));
  const r12=seed.find(row=>row.id==='r12').offers.prolighting;
  assert.equal(r12.availability,false);
  assert.equal(r12.availableFrom,'2027-01-05');
});

test('Gap Recovery migration keeps component evidence and merges existing metadata idempotently', async () => {
  const sql=await fs.readFile('supabase/migrations/20261108100000_prolighting_gap_recovery_candidates.sql','utf8');
  for(const id of ids) assert.match(sql,new RegExp(`'${id}'`));
  assert.match(sql,/on conflict \(configuration_id,shop_id\) do update/);
  assert.match(sql,/coalesce\(current_offer\.metadata,'\{\}'::jsonb\) \|\| excluded\.metadata/);
  assert.match(sql,/insert into public\.offer_components/);
  assert.match(sql,/insert into public\.component_price_observations/);
  assert.match(sql,/'component_calc'/);
  assert.match(sql,/'future_stock'/);
  assert.match(sql,/MAUI 44 G2 SUB PC/);
  assert.doesNotMatch(sql,/WPC/);
  assert.doesNotMatch(sql,/DMX/);
});
