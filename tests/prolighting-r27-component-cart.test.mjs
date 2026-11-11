import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('r27 PRO LIGHTING cart proves ICOA 12 PC compatibility with ICOA PRO 12 and exact set contents', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const offer=seed.find(row=>row.id==='r27').offers.prolighting;
  assert.equal(offer.price,5003.13);
  assert.equal(offer.match,'exact');
  assert.equal(offer.classification,'complete_component_cart');
  assert.equal(offer.collectionDisabled,true);
  assert.equal(Math.round(offer.componentDetails.reduce((sum,x)=>sum+x.quantity*x.unitPrice,0)*100),Math.round(offer.price*100));
  const cover=offer.componentDetails.find(x=>x.sku==='AHLDICOA12PC');
  assert.equal(cover.quantity,2);
  assert.equal(cover.sourceIdentity,'manufacturer_compatible_with_icoa_pro_12');
  assert.match(cover.name,/ICOA PRO 12/);
  assert.doesNotMatch(cover.name,/WPC/);
  const standSet=offer.componentDetails.find(x=>x.sku==='AHGSS5212BSET1');
  assert.equal(standSet.sourceIdentity,'set_contains_2x_sp5212b_plus_bgss2b');
  assert.match(standSet.name,/2 × SP 5212 B \+ BG SS 2 B/);
  const cable=offer.componentDetails.find(x=>x.sku==='CCM5FM');
  assert.match(cable.name,/audio XLR 5 m/);
  assert.doesNotMatch(cable.name,/DMX/i);
});

test('r27 migration is idempotent, preserves metadata, and records compatibility provenance', async () => {
  const sql=await fs.readFile('supabase/migrations/20261109110000_prolighting_r27_verified_component_cart.sql','utf8');
  assert.match(sql,/'r27'/);
  assert.match(sql,/AHLDICOA12PC/);
  assert.match(sql,/manufacturer_compatible_with_icoa_pro_12/);
  assert.match(sql,/AHGSS5212BSET1/);
  assert.match(sql,/set_contains_2x_sp5212b_plus_bgss2b/);
  assert.match(sql,/coalesce\(current_offer\.metadata,'\{\}'::jsonb\) \|\| excluded\.metadata/);
  assert.match(sql,/coalesce\(current_component\.metadata,'\{\}'::jsonb\) \|\| excluded\.metadata/);
  assert.match(sql,/'component_calc',true/);
  assert.match(sql,/collection_disabled',true/);
  assert.doesNotMatch(sql,/WPC/);
  assert.doesNotMatch(sql,/DMX/i);
});
