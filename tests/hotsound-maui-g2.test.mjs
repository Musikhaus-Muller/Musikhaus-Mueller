import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const migrationPath='supabase/migrations/20261106130000_hotsound_maui_g2_verified_carts.sql';

function parseProposedRows(migration){
  const proposed=migration.match(/with proposed\([\s\S]*?\) as \(\s*values([\s\S]*?)\n\),\nupserted_offers/);
  assert.ok(proposed,'migration must expose its proposed Hot Sound offers');
  const matches=[...proposed[1].matchAll(/\(\s*'(?<id>r\d+)',\s*'(?<name>[^']*)',\s*'(?<url>[^']*)',\s*'(?<contents>[^']*)',\s*(?<price>[\d.]+),\s*(?<calculation>null|'[^']*'),\s*'(?<classification>[^']*)',\s*'(?<sourceMethod>[^']*)',/g)];
  return matches.map((match,index)=>{
    const end=matches[index+1]?.index??proposed[1].length;
    const rowSql=proposed[1].slice(match.index,end);
    const components=[...rowSql.matchAll(/jsonb_build_object\s*\(\s*'name'\s*,\s*'([^']*)'\s*,\s*'url'\s*,\s*'([^']*)'\s*,\s*'quantity'\s*,\s*([\d.]+)\s*,\s*'unit_price'\s*,\s*([\d.]+)\s*\)/g)]
      .map(([,name,url,quantity,unitPrice])=>({name,url,quantity:Number(quantity),unitPrice:Number(unitPrice)}));
    return {
      id:match.groups.id,
      name:match.groups.name,
      url:match.groups.url,
      contents:match.groups.contents,
      price:Number(match.groups.price),
      calculation:match.groups.calculation==='null'?null:match.groups.calculation.slice(1,-1),
      classification:match.groups.classification,
      sourceMethod:match.groups.sourceMethod,
      components
    };
  });
}

test('Hot Sound MAUI G2 offers have strict recipes and exact totals', async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const expected=new Map([['r8',3998],['r9',4544],['r13',839],['r14',928]]);
  for(const [id,total] of expected){
    const offer=seed.find(row=>row.id===id)?.offers?.hotsound;
    assert.ok(offer,`missing Hot Sound offer ${id}`);
    assert.equal(offer.price,total);
    assert.equal(offer.match,'exact');
    assert.equal(offer.priceDate,'2026-11-06');
    assert.equal(offer.verifiedToday,true);
    assert.ok(offer.url.startsWith('https://www.hotsound-store.com/'));
  }

  const r9=seed.find(row=>row.id==='r9').offers.hotsound;
  assert.equal(r9.collectionDisabled,true);
  assert.equal(r9.classification,'complete_component_calc');
  assert.equal(r9.contents,'2 × MAUI 44 G2 SET2-Systeme; 2 × MAUI 44 G2 SUB PC; 2 × MAUI 44 G2 SAT BAG; 2 × MAUI 44 G2 CB Rollbrett.');
  assert.deepEqual(r9.componentDetails.map(({name,quantity,unitPrice})=>({name,quantity,unitPrice})),[
    {name:'LD Systems MAUI 44 G2 SET2 (2 Systeme)',quantity:1,unitPrice:3998},
    {name:'LD Systems MAUI 44 G2 SUB PC',quantity:2,unitPrice:59},
    {name:'LD Systems MAUI 44 G2 SAT BAG',quantity:2,unitPrice:95},
    {name:'LD Systems MAUI 44 G2 CB Rollbrett',quantity:2,unitPrice:119}
  ]);
  assert.equal(r9.price,3998+2*59+2*95+2*119);

  for(const [id,model,systemPrice,bagPrice,coverPrice] of [
    ['r13','MAUI 11 G2',729,65,45],
    ['r14','MAUI 28 G2',798,85,45]
  ]){
    const offer=seed.find(row=>row.id===id).offers.hotsound;
    assert.equal(offer.classification,'complete_component_calc');
    assert.equal(offer.collectionDisabled,true);
    assert.match(offer.componentDetails[0].name,new RegExp(model));
    assert.match(offer.componentDetails[1].name,new RegExp(`${model} SAT BAG`));
    assert.match(offer.componentDetails[2].name,new RegExp(`${model} SUB PC`));
    assert.deepEqual(offer.componentDetails.map(component=>component.quantity),[1,1,1]);
    assert.deepEqual(offer.componentDetails.map(component=>component.unitPrice),[systemPrice,bagPrice,coverPrice]);
    assert.equal(offer.price,systemPrice+bagPrice+coverPrice);
  }
});

test('Hot Sound MAUI G2 seed recipes match the migration structurally',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const migration=await fs.readFile(migrationPath,'utf8');
  const rows=parseProposedRows(migration);
  assert.deepEqual(rows.map(row=>row.id),['r8','r9','r13','r14']);

  for(const row of rows){
    const offer=seed.find(item=>item.id===row.id)?.offers?.hotsound;
    assert.ok(offer,`seed is missing ${row.id}`);
    assert.equal(row.name,offer.name,`${row.id} product name`);
    assert.equal(row.url,offer.url,`${row.id} product URL`);
    assert.equal(row.contents,offer.contents,`${row.id} recipe`);
    assert.equal(row.price,offer.price,`${row.id} total`);
    assert.equal(row.calculation,offer.calculation??null,`${row.id} calculation`);
    assert.equal(row.classification,offer.classification,`${row.id} classification`);
    assert.equal(row.sourceMethod,row.classification==='exact_price'?'catalog':'component_calc');
    assert.deepEqual(row.components,offer.componentDetails??[],`${row.id} component names, URLs, quantities, and unit prices`);
    if(row.sourceMethod==='component_calc'){
      assert.ok(row.components.length,`${row.id} component calculation must include evidence`);
      assert.equal(
        row.components.reduce((sum,component)=>sum+Math.round(component.quantity*component.unitPrice*100),0),
        Math.round(row.price*100),
        `${row.id} component total`
      );
    }else{
      assert.equal(row.classification,'exact_price',`${row.id} direct set price classification`);
    }
  }
});

test('Hot Sound offers preserve unrelated metadata on upsert',async()=>{
  const migration=await fs.readFile(migrationPath,'utf8');
  assert.match(migration,/metadata\s*=\s*coalesce\(existing_offer\.metadata,'\{\}'::jsonb\)\s*\|\|\s*excluded\.metadata/);
  const existing={preserved_field:'keep',components:['old']};
  const incoming={classification:'complete_component_calc',components:['new']};
  const merged={...existing,...incoming};
  assert.equal(merged.preserved_field,'keep');
  assert.deepEqual(merged.components,['new']);
  assert.equal(merged.classification,'complete_component_calc');
});
