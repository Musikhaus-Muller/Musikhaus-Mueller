import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('r23 PRO LIGHTING cart preserves the exact SPS 023 packaged set and total', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const offer=seed.find(row=>row.id==='r23').offers.prolighting;
  assert.equal(offer.price,1536.55);
  assert.equal(offer.match,'exact');
  assert.equal(offer.classification,'complete_component_cart');
  assert.equal(offer.collectionDisabled,true);
  assert.equal(offer.componentDetails.reduce((sum,x)=>sum+x.quantity*x.unitPrice,0),offer.price);
  const standSet=offer.componentDetails.find(x=>x.sku==='AHSPS023SET');
  assert.deepEqual({quantity:standSet.quantity,unitPrice:standSet.unitPrice,sourceIdentity:standSet.sourceIdentity},{quantity:1,unitPrice:63.90,sourceIdentity:'set_contains_2x_sps023_plus_bag'});
  assert.match(standSet.name,/2 × SPS 023 \+ bolsa/);
  const cable=offer.componentDetails.find(x=>x.sku==='CPM6FM');
  assert.match(cable.name,/audio XLR 6 m/);
  assert.doesNotMatch(cable.name,/DMX/i);
});

test('r23 migration is idempotent, component-verified, and preserves metadata', async () => {
  const sql=await fs.readFile('supabase/migrations/20261109100000_prolighting_r23_verified_component_cart.sql','utf8');
  assert.match(sql,/'r23'/);
  assert.match(sql,/AHSPS023SET/);
  assert.match(sql,/set_contains_2x_sps023_plus_bag/);
  assert.match(sql,/coalesce\(current_offer\.metadata,'\{\}'::jsonb\) \|\| excluded\.metadata/);
  assert.match(sql,/coalesce\(current_component\.metadata,'\{\}'::jsonb\) \|\| excluded\.metadata/);
  assert.match(sql,/source_method,verified/);
  assert.match(sql,/'component_calc',true/);
  assert.match(sql,/collection_disabled',true/);
  assert.doesNotMatch(sql,/DMX/i);
});
