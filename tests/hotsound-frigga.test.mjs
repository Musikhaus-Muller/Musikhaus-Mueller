import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const migrationPath='supabase/migrations/20261106150000_hotsound_frigga_verified_offers.sql';

test('Hot Sound FRIGGA expansion keeps exact verified totals and colors',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const expected={
    r30:{total:2290,color:'schwarz',classification:'exact_price'},
    r33:{total:3166,color:'weiß',classification:'complete_component_calc'},
    r34:{total:1379,color:'schwarz',classification:'complete_component_calc'},
    r35:{total:1583,color:'weiß',classification:'complete_component_calc'}
  };
  for(const [id,spec] of Object.entries(expected)){
    const offer=seed.find(row=>row.id===id)?.offers?.hotsound;
    assert.ok(offer,'missing Hot Sound FRIGGA offer '+id);
    assert.equal(offer.price,spec.total);
    assert.equal(offer.match,'exact');
    assert.equal(offer.classification,spec.classification);
    assert.match(offer.contents,new RegExp(spec.color,'i'));
    assert.equal(offer.priceDate,'2026-11-06');
    assert.equal(offer.verifiedToday,true);
  }
  assert.equal(seed.find(row=>row.id==='r30').offers.hotsound.collectionDisabled,undefined);
  for(const id of ['r33','r34','r35']) {
    assert.equal(seed.find(row=>row.id===id).offers.hotsound.collectionDisabled,true);
  }
});

test('Hot Sound FRIGGA component carts include the exact system, top bag and sub cover quantities',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const specs={r33:[2,2,2],r34:[1,1,1],r35:[1,1,1]};
  for(const [id,quantities] of Object.entries(specs)){
    const offer=seed.find(row=>row.id===id).offers.hotsound;
    assert.deepEqual(offer.componentDetails.map(c=>c.quantity),quantities);
    assert.ok(offer.componentDetails.some(c=>/Bag für Frigga Tops/.test(c.name)));
    assert.ok(offer.componentDetails.some(c=>/Transport Cover für Frigga Sub/.test(c.name)));
    assert.equal(
      offer.componentDetails.reduce((sum,c)=>sum+c.quantity*c.unitPrice,0),
      offer.price
    );
  }
});

test('Hot Sound FRIGGA migration mirrors seed offers and preserves metadata',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const sql=await fs.readFile(migrationPath,'utf8');
  for(const id of ['r30','r33','r34','r35']){
    const offer=seed.find(row=>row.id===id).offers.hotsound;
    assert.ok(sql.includes("'"+id+"'"));
    assert.ok(sql.includes(offer.url));
    assert.ok(sql.includes(String(offer.price)));
    for(const component of offer.componentDetails||[]){
      assert.ok(sql.includes("'name','"+component.name+"'"));
      assert.ok(sql.includes("'url','"+component.url+"'"));
      assert.ok(sql.includes("'quantity',"+component.quantity+",'unit_price',"+component.unitPrice));
    }
  }
  assert.match(sql,/metadata\s*=\s*coalesce\(existing_offer\.metadata,'\{\}'::jsonb\)\s*\|\|\s*excluded\.metadata/);
  assert.match(sql,/'direct_bundle',true/);
  assert.match(sql,/'collection_disabled',true/);
});
