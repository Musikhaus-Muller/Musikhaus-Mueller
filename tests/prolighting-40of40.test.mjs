import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('PRO LIGHTING 40/40 audit reconciles all published offers', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  assert.equal(seed.length,40);
  const offers=seed.filter(r=>r.offers?.prolighting);
  assert.equal(offers.length,29);

  const expected=new Map([
    ['r1',1858],['r3',1289],['r4',2841.5],['r5',2578],['r6',2658],['r7',3098],
    ['r19',3369],['r20',4479],['r21',7349],
    ['r2',2096],['r11',4469.44],['r14',1049],['r24',2537.24],['r25',2675.04],
    ['r26',4318.68],['r28',6647.6],['r23',1536.55],['r27',5003.13],['r9',4935.80],['r10',3389.80],['r12',7377.80],['r13',839],['r29',8032.9],
    ['r30',2098],['r31',2178],['r32',2529.6],['r33',2609.6],['r34',1264.8],['r35',1304.8]
  ]);
  for(const [id,price] of expected){
    const offer=seed.find(r=>r.id===id)?.offers?.prolighting;
    assert(offer,`missing PRO LIGHTING offer for ${id}`);
    assert.equal(offer.price,price);
    assert.equal(offer.priceDate,['r2','r11','r14','r24','r25','r26','r28'].includes(id)?'2026-11-06':['r23','r27'].includes(id)?'2026-11-09':['r9','r10','r12','r13','r29'].includes(id)?'2026-11-08':'2026-11-04');
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
  assert.ok(/jsonb_build_object\('unit_price',\(x\.value->>'unit_price'\)::numeric,'price_currency','EUR'\)/.test(migration));
  assert.ok(/cr\.id,\(x\.value->>'unit_price'\)::numeric,'EUR','success','catalog'/.test(migration));
});

test('new PRO LIGHTING seed offers match the migration recipes and complete component calculations', async () => {
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const migration=await fs.readFile('supabase/migrations/20261106100000_prolighting_verified_component_carts.sql','utf8');
  const proposed= migration.match(/with proposed\([\s\S]*?\) as \(\s*values([\s\S]*?)\n\),\nupserted_offers/);
  assert.ok(proposed,'migration must expose its proposed offer rows');

  const rowMatches=[...proposed[1].matchAll(/\(\s*'(?<id>r\d+)',\s*'(?<name>[^']*)',\s*'(?<url>[^']*)',\s*'(?<contents>[^']*)',\s*(?<price>[\d.]+),\s*'(?<calculation>[^']*)',/g)];
  const rows=rowMatches.map((match,index)=>{
    const end=rowMatches[index+1]?.index ?? proposed[1].length;
    const rowSql=proposed[1].slice(match.index,end);
    const components=[...rowSql.matchAll(/jsonb_build_object\s*\(\s*'name'\s*,\s*'([^']*)'\s*,\s*'url'\s*,\s*'([^']*)'\s*,\s*'quantity'\s*,\s*([\d.]+)\s*,\s*'unit_price'\s*,\s*([\d.]+)\s*\)/g)]
      .map(([,name,url,quantity,unitPrice])=>({name,url,quantity:Number(quantity),unitPrice:Number(unitPrice)}));
    return {
      id:match.groups.id,
      name:match.groups.name,
      url:match.groups.url,
      contents:match.groups.contents,
      price:Number(match.groups.price),
      calculation:match.groups.calculation,
      components
    };
  });
  const newOffers=seed
    .filter(row=>row.offers?.prolighting?.priceDate==='2026-11-06'&&row.offers.prolighting.collectionDisabled)
    .map(row=>({id:row.id,offer:row.offers.prolighting}));

  assert.equal(rows.length,newOffers.length);
  assert.equal(rows.length,7);
  assert.match(migration,/select\s+c\.id,s\.id,p\.product_name,p\.product_url,p\.contents,'exact',p\.calculation/);
  assert.match(migration,/'collection_disabled',true/);
  assert.match(migration,/'components',p\.components/);
  assert.match(migration,/'component_calc'/);

  for(const {id,offer} of newOffers){
    const sqlRow=rows.find(row=>row.id===id);
    assert.ok(sqlRow,`migration is missing configuration ${id}`);
    assert.equal(sqlRow.name,offer.name,`${id} product name`);
    assert.equal(sqlRow.url,offer.url,`${id} product URL`);
    assert.equal(sqlRow.contents,offer.contents,`${id} recipe`);
    assert.equal(sqlRow.price,offer.price,`${id} total`);
    assert.equal(sqlRow.calculation,offer.calculation,`${id} calculation`);
    assert.ok(Array.isArray(offer.componentDetails),`${id} seed component details`);
    assert.deepEqual(offer.components,offer.componentDetails.map(component=>component.url),`${id} component URLs`);
    assert.deepEqual(sqlRow.components,offer.componentDetails,`${id} component quantities and unit prices`);

    const componentTotalCents=offer.componentDetails.reduce(
      (total,component)=>total+Math.round(component.quantity*component.unitPrice*100),0
    );
    assert.equal(componentTotalCents,Math.round(offer.price*100),`${id} seed component total`);
    assert.equal(
      sqlRow.components.reduce((total,component)=>total+Math.round(component.quantity*component.unitPrice*100),0),
      Math.round(sqlRow.price*100),
      `${id} migration component total`
    );
    const seedClassification=offer.match==='exact'&&offer.collectionDisabled&&componentTotalCents===Math.round(offer.price*100)
      ? 'complete_component_calc'
      : 'incomplete_recipe';
    const migrationClassification=/source_method,verified,raw_product_name,evidence,observed_at,metadata\)[\s\S]*?'component_calc'/.test(migration)&&
      /select\s+c\.id,s\.id,p\.product_name,p\.product_url,p\.contents,'exact',p\.calculation/.test(migration)
      ? 'complete_component_calc'
      : 'incomplete_recipe';
    assert.equal(seedClassification,'complete_component_calc',`${id} seed classification`);
    assert.equal(migrationClassification,seedClassification,`${id} migration classification`);
  }
});

test('offer metadata upsert merges incoming fields without dropping unrelated metadata', async () => {
  const migration=await fs.readFile('supabase/migrations/20261106100000_prolighting_verified_component_carts.sql','utf8');
  assert.match(migration,/metadata\s*=\s*coalesce\(existing_offer\.metadata,'\{\}'::jsonb\)\s*\|\|\s*excluded\.metadata/);
  const existing={preserved_field:'keep',components:['old']};
  const incoming={collection_disabled:true,components:['new']};
  const merged={...existing,...incoming};
  assert.equal(merged.preserved_field,'keep');
  assert.deepEqual(merged.components,['new']);
  assert.equal(merged.collection_disabled,true);
});
