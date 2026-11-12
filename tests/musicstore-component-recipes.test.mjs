import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { articleNumberFromMusicStoreUrl } from '../collector/musicstore-article-catalog.mjs';

const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
const musicstoreRows=seed.filter(row=>row.offers?.musicstore);
const carts=musicstoreRows.filter(row=>row.offers.musicstore.collectionDisabled===true);
const normalized=carts.filter(row=>Array.isArray(row.offers.musicstore.componentDetails) && row.offers.musicstore.componentDetails.length>0);
const byRef=Object.fromEntries(carts.map(row=>[row.id,row.offers.musicstore]));

const baseline={
r2:[2096,'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000','2 × 929 € + 2 × 67 € + 2 × 52 € = 2.096 €'],
r3:[1433,'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000','1.289 € + 89 € + 55 € = 1.433 €'],
r4:[2866,'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000','2 × 1.289 € + 2 × 89 € + 2 × 55 € = 2.866 €'],
r10:[3363.8,'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3-Schwarz/art-PAH0023383-000','2 × 929 € + 2 × 749 € + 2 × 3,90 € = 3.363,80 €'],
r13:[839,'https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-11-G2/art-PAH0018045-000','729 € + 65 € + 45 € = 839 €'],
r14:[1069,'https://www.musicstore.de/de_DE/EUR/LD-Systems-Maui-28-G2/art-PAH0018043-000','939 € + 85 € + 45 € = 1.069 €'],
r15:[1123,'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-12-G4X/art-PAH0023214-000','998 € + 125 € = 1.123 €'],
r16:[1324,'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-15-G4X/art-PAH0023215-000','1.199 € + 125 € = 1.324 €'],
r17:[1664,'https://www.musicstore.de/de_DE/EUR/LD-Systems-DAVE-18-G4X/art-PAH0023216-000','1.539 € + 125 € = 1.664 €'],
r23:[1687.8,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000','2 × 429 € + 729 € + 89 € + 2 × 5,90 € = 1.687,80 €'],
r24:[2601.8,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000','2 × 429 € + 2 × 845 € + 2 × 22 € + 2 × 4,90 € = 2.601,80 €'],
r25:[2681.8,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000','2 × 469 € + 2 × 845 € + 2 × 22 € + 2 × 4,90 € = 2.681,80 €'],
r26:[4337.6,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-15-A-BT/art-PAH0021619-000','2 × 469 € + 4 × 845 € + 4 × 4,90 € = 4.337,60 €'],
r28:[6627.8,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-12-A/art-PAH0024126-000','2 × 1.089 € + 2 × 2.198 € + 2 × 22 € + 2 × 4,90 € = 6.627,80 €']
};

function expectRecipe(ref,quantities,articles){
  const details=byRef[ref].componentDetails;
  assert.deepEqual(details.map(x=>x.quantity),quantities);
  assert.deepEqual(details.map(x=>articleNumberFromMusicStoreUrl(x.url)),articles);
}

test('Music Store keeps 19 offers, 14 carts, 13 normalized recipes and one unresolved recipe',()=>{
  assert.equal(musicstoreRows.length,19);
  assert.equal(carts.length,14);
  assert.equal(normalized.length,13);
});

test('normalized componentDetails use positive quantities, official URLs, Art.-Nr. and no unitPrice',()=>{
  for(const row of normalized){
    const seen=new Set();
    for(const component of row.offers.musicstore.componentDetails){
      assert.equal(Object.hasOwn(component,'unitPrice'),false);
      assert.ok(component.name && component.name.trim());
      assert.ok(Number.isSafeInteger(component.quantity) && component.quantity>0);
      const url=new URL(component.url);
      assert.ok(url.hostname==='www.musicstore.de' || url.hostname==='musicstore.de');
      const article=articleNumberFromMusicStoreUrl(component.url);
      assert.ok(article);
      assert.equal(seen.has(article),false);
      seen.add(article);
    }
    assert.equal(row.offers.musicstore.collectionDisabled,true);
  }
});

test('historical aggregate price, main URL and calculation stay unchanged',()=>{
  for(const [ref,expected] of Object.entries(baseline)){
    assert.equal(byRef[ref].price,expected[0]);
    assert.equal(byRef[ref].url,expected[1]);
    assert.equal(byRef[ref].calculation,expected[2]);
  }
});

test('MAUI G3 bag recipes preserve structural quantities',()=>{
  expectRecipe('r2',[2,2,2],['PAH0023383-000','PAH0023393-000','PAH0023394-000']);
  expectRecipe('r3',[1,1,1],['PAH0023384-000','PAH0023423-000','PAH0023395-000']);
  expectRecipe('r4',[2,2,2],['PAH0023384-000','PAH0023423-000','PAH0023395-000']);
});

test('MAUI G2 recipes preserve system, Sat Bag and Sub PC',()=>{
  expectRecipe('r13',[1,1,1],['PAH0018045-000','PAH0018753-000','PAH0018754-000']);
  expectRecipe('r14',[1,1,1],['PAH0018043-000','PAH0018692-000','PAH0018755-000']);
});

test('DAVE G4X recipes preserve one system plus the versioned Box 3 Set',()=>{
  expectRecipe('r15',[1,1],['PAH0023214-000','PAH343']);
  expectRecipe('r16',[1,1],['PAH0023215-000','PAH343']);
  expectRecipe('r17',[1,1],['PAH0023216-000','PAH343']);
});

test('ICOA recipes preserve structural quantities and exact versioned Art.-Nr.',()=>{
  expectRecipe('r23',[2,1,1,2],['PAH0021617-000','PAH0022032-000','PAH431','ACC0001265-000']);
  expectRecipe('r24',[2,2,2,2],['PAH0021617-000','PAH0022033-000','PAH0018485-000','ACC0001159-002']);
  expectRecipe('r25',[2,2,2,2],['PAH0021619-000','PAH0022033-000','PAH0018485-000','ACC0001159-002']);
  expectRecipe('r26',[2,4,4],['PAH0021619-000','PAH0022033-000','ACC0001159-002']);
  expectRecipe('r28',[2,2,2,2],['PAH0024126-000','PAH0024128-000','PAH0018485-000','ACC0001159-002']);
});

test('r10 remains unresolved because ACC0001159-001 has no versioned official URL',()=>{
  const offer=byRef.r10;
  assert.equal(Array.isArray(offer.componentDetails),false);
  assert.equal(offer.componentDetailsStatus,'incomplete_versioned_evidence');
  assert.match(offer.componentDetailsIssue,/ACC0001159-001/);
  assert.match(offer.componentDetailsIssue,/no exact official Music Store URL/i);
});
