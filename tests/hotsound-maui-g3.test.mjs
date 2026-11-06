import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const migrationPath='supabase/migrations/20261106143000_hotsound_maui_g3_verified_carts.sql';

test('Hot Sound MAUI G3 expansion keeps exact verified component totals',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const expected={
    r5:{total:2590,components:[['LD Systems MAUI 28 G3',2,1295]]},
    r10:{total:3328,components:[['LD Systems MAUI 11 G3',2,919],['LD Systems MAUI 11 G3 SUB',2,745]]},
    r11:{total:4468,components:[['LD Systems MAUI 28 G3',2,1295],['LD Systems MAUI 28 G3 SUB',2,939]]}
  };
  for(const [id,spec] of Object.entries(expected)){
    const offer=seed.find(row=>row.id===id)?.offers?.hotsound;
    assert.ok(offer,'missing Hot Sound offer '+id);
    assert.equal(offer.price,spec.total);
    assert.equal(offer.match,'exact');
    assert.equal(offer.classification,'complete_component_calc');
    assert.equal(offer.collectionDisabled,true);
    assert.equal(offer.priceDate,'2026-11-06');
    assert.equal(offer.verifiedToday,true);
    assert.deepEqual(
      offer.componentDetails.map(c=>[c.name,c.quantity,c.unitPrice]),
      spec.components
    );
    assert.equal(
      offer.componentDetails.reduce((sum,c)=>sum+c.quantity*c.unitPrice,0),
      spec.total
    );
  }
});

test('Hot Sound MAUI G3 Power recipes distinguish active SUB from SUB PC',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  for(const id of ['r10','r11']){
    const offer=seed.find(row=>row.id===id).offers.hotsound;
    assert.ok(offer.componentDetails.some(c=>/ G3 SUB$/.test(c.name)));
    assert.equal(offer.componentDetails.some(c=>/SUB PC/.test(c.name)),false);
  }
});

test('Hot Sound MAUI G3 migration matches seed totals, URLs, quantities and metadata policy',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const sql=await fs.readFile(migrationPath,'utf8');
  for(const id of ['r5','r10','r11']){
    const offer=seed.find(row=>row.id===id).offers.hotsound;
    assert.ok(sql.includes("'"+id+"'"));
    assert.ok(sql.includes(offer.url));
    assert.ok(sql.includes(String(offer.price)));
    for(const component of offer.componentDetails){
      assert.ok(sql.includes("'name','"+component.name+"'"));
      assert.ok(sql.includes("'url','"+component.url+"'"));
      assert.ok(sql.includes("'quantity',"+component.quantity+",'unit_price',"+component.unitPrice));
    }
  }
  assert.match(sql,/metadata\s*=\s*coalesce\(existing_offer\.metadata,'\{\}'::jsonb\)\s*\|\|\s*excluded\.metadata/);
  assert.match(sql,/'collection_disabled',true/);
  assert.match(sql,/'classification',p\.classification/);
});
