import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { buildThomannShadowReport, evaluateThomannOffer, evaluateThomannTarget } from '../collector/thomann-shadow.mjs';

const okResponse=(html,status=200,url='https://www.thomann.de/de/test.htm')=>({
  ok:status>=200&&status<300,
  status,
  url,
  async text(){return html;}
});
const row=(overrides={})=>({
  id:'rX',
  offers:{thomann:{
    name:'LD Systems Maui 11 G3',
    url:'https://www.thomann.de/de/ld_systems_maui_11_g3.htm',
    price:929,
    priceDate:'2026-11-03',
    contents:'1 × MAUI 11 G3 schwarz.',
    collectionDisabled:false,
    ...overrides
  }}
});

test('Thomann shadow maps 429 to blocked and never invents a price',async()=>{
  const out=await evaluateThomannOffer(row(),{fetchImpl:async()=>okResponse('',429)});
  assert.equal(out.decision,'blocked');
  assert.equal(out.total_price,null);
  assert.equal(out.price_valid,false);
});

test('Thomann shadow maps 404 to not_found and preserves prior value externally',async()=>{
  const out=await evaluateThomannOffer(row(),{fetchImpl:async()=>okResponse('',404)});
  assert.equal(out.decision,'not_found');
  assert.equal(out.previous_price,929);
  assert.equal(out.total_price,null);
});

test('identity mismatch is rejected even on HTTP 200',async()=>{
  const out=await evaluateThomannOffer(row(),{
    fetchImpl:async()=>okResponse('<h1>LD Systems Maui 28 G3 White</h1>'),
    parsePriceImpl:()=>{throw new Error('Kein eindeutiger EUR-Produktpreis');}
  });
  assert.equal(out.decision,'identity_mismatch');
  assert.equal(out.identity_valid,false);
});

test('ambiguous price parser failure is never refreshable',async()=>{
  const out=await evaluateThomannOffer(row(),{
    fetchImpl:async()=>okResponse('<h1>LD Systems Maui 11 G3</h1>'),
    parsePriceImpl:()=>{throw new Error('Kein eindeutiger EUR-Produktpreis');}
  });
  assert.equal(out.decision,'parse_error');
});

test('non-positive parsed price is rejected',async()=>{
  const out=await evaluateThomannOffer(row(),{
    fetchImpl:async()=>okResponse('<h1>LD Systems Maui 11 G3</h1>'),
    parsePriceImpl:()=>({price:0})
  });
  assert.equal(out.decision,'invalid_price');
  assert.equal(out.price_valid,false);
});

test('explicit offer multiplier is applied in cents',async()=>{
  const out=await evaluateThomannOffer(row({
    name:'2 × LD Systems Maui 11 G3 Bundle',
    calculation:'2 × 1.029 € = 2.058 €',
    price:2058
  }),{
    fetchImpl:async()=>okResponse('<h1>LD Systems Maui 11 G3 Bundle</h1>'),
    parsePriceImpl:()=>({price:1029})
  });
  assert.equal(out.decision,'refreshable_shadow');
  assert.equal(out.multiplier,2);
  assert.equal(out.unit_price,1029);
  assert.equal(out.total_price,2058);
});

test('collection_disabled without explicit component recipe is not refreshable and performs no fetch',async()=>{
  let calls=0;
  const out=await evaluateThomannOffer(row({
    collectionDisabled:true,
    calculation:'2 × 929 € = 1.858 €'
  }),{fetchImpl:async()=>{calls++;return okResponse('');}});
  assert.equal(calls,0);
  assert.equal(out.decision,'parse_error');
  assert.match(out.error,/no explicit versioned component recipe/);
});

test('complete explicit component cart requires every component and sums integer cents',async()=>{
  const offer=row({
    name:'Thomann Warenkorb',
    collectionDisabled:true,
    componentDetails:[
      {name:'Component A',url:'https://www.thomann.de/de/a.htm',quantity:2},
      {name:'Component B',url:'https://www.thomann.de/de/b.htm',quantity:1}
    ]
  });
  const prices=new Map([['a.htm',100.10],['b.htm',50.05]]);
  const out=await evaluateThomannOffer(offer,{
    fetchImpl:async url=>okResponse('<h1>Component</h1>',200,url),
    parsePriceImpl:(html,expected,host)=>({price:[...prices].find(([suffix])=>host==='www.thomann.de' && expected.endsWith(suffix==='a.htm'?'A':'B'))?.[1] ?? (expected==='Component A'?100.10:50.05)})
  });
  assert.equal(out.decision,'refreshable_shadow');
  assert.equal(out.total_price,250.25);
});

test('component cart with one blocked structural component is preserved',async()=>{
  const offer=row({
    collectionDisabled:true,
    componentDetails:[
      {name:'Component A',url:'https://www.thomann.de/de/a.htm',quantity:1},
      {name:'Component B',url:'https://www.thomann.de/de/b.htm',quantity:1}
    ]
  });
  const out=await evaluateThomannOffer(offer,{
    fetchImpl:async url=>url.endsWith('/b.htm')?okResponse('',429,url):okResponse('<h1>Component A</h1>',200,url),
    parsePriceImpl:()=>({price:100})
  });
  assert.equal(out.decision,'blocked');
  assert.equal(out.total_price,null);
});

test('report evaluates exactly the versioned Thomann offer set and is deterministic over fixture outcomes',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const refs=seed.filter(x=>x.offers?.thomann).map(x=>x.id);
  assert.equal(refs.length,29);
  const fixture=seed.filter(x=>x.offers?.thomann).slice(0,2);
  const report=await buildThomannShadowReport({
    seed:fixture,
    executionEnvironment:'local',
    fetchImpl:async url=>okResponse('<h1>fixture</h1>',429,url)
  });
  assert.equal(report.writes,false);
  assert.equal(report.summary.total,2);
  assert.equal(report.summary.refreshable,0);
  assert.equal(report.summary.preserved,2);
});

test('Thomann shadow source is read-only and contains no privileged or bypass integration',async()=>{
  const source=await fs.readFile('collector/thomann-shadow.mjs','utf8');
  assert.doesNotMatch(source,/SUPABASE_SECRET|SERVICE_ROLE|rest\/v1|method\s*:\s*['"](?:POST|PATCH|PUT|DELETE)/i);
  assert.doesNotMatch(source,/playwright|chromium|proxy|sitemap|captcha bypass|retry/i);
  assert.match(source,/writes:false/);
});


test('duplicate offer URLs are fetched once through the shared cache',async()=>{
  let calls=0;
  const shared='https://www.thomann.de/de/shared.htm';
  const seed=[
    row({url:shared,name:'LD Systems Maui 11 G3',collectionDisabled:false}),
    {...row({url:shared,name:'LD Systems Maui 11 G3',collectionDisabled:false}),id:'rY'}
  ];
  const report=await buildThomannShadowReport({
    seed,
    fetchImpl:async url=>{calls++;return okResponse('<h1>LD Systems Maui 11 G3</h1>',200,url);},
    parsePriceImpl:()=>({price:929})
  });
  assert.equal(calls,1);
  assert.equal(report.summary.refreshable,2);
  assert.deepEqual(report.rows.map(x=>x.reference),['rX','rY']);
});


test('leading cart multiplier is not treated as an identity token when classifying parser failure',async()=>{
  const out=await evaluateThomannOffer(row({
    name:'2 × LD Systems Maui 11 G3 Bundle',
    calculation:'2 × 1.029 € = 2.058 €'
  }),{
    fetchImpl:async()=>okResponse('<h1>LD Systems Maui 11 G3 Bundle</h1>'),
    parsePriceImpl:()=>{throw new Error('Kein eindeutiger EUR-Produktpreis');}
  });
  assert.equal(out.decision,'parse_error');
});

test('invalid explicit component quantity rejects only that cart instead of aborting the report',async()=>{
  const offer=row({
    collectionDisabled:true,
    componentDetails:[{name:'Component A',url:'https://www.thomann.de/de/a.htm',quantity:0}]
  });
  const out=await evaluateThomannOffer(offer,{
    fetchImpl:async url=>okResponse('<h1>Component A</h1>',200,url),
    parsePriceImpl:()=>({price:100})
  });
  assert.equal(out.decision,'parse_error');
  assert.match(out.error,/Invalid component quantity/);
});
