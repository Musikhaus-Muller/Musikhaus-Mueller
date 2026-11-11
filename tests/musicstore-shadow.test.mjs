import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { buildMusicStoreShadowReport, evaluateMusicStoreOffer } from '../collector/musicstore-shadow.mjs';

const response=(html,status=200,url='https://www.musicstore.de/de_DE/EUR/Test/art-PAH0024126-000')=>({
  ok:status>=200&&status<300,
  status,
  url,
  async text(){return html;}
});

const catalog=(article,name,price='1.089,00 €')=>`
<article>
  <h2>${name}</h2>
  <p>Art.-Nr.: ${article}</p>
  <span>${price}</span>
  <p>Lieferbar</p>
</article>`;

const row=(overrides={})=>({
  id:'rX',
  offers:{musicstore:{
    name:'LD Systems ICOA Pro 12 A',
    url:'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-12-A/art-PAH0024126-000',
    price:1089,
    priceDate:'2026-11-04',
    contents:'1 × ICOA Pro 12 A',
    collectionDisabled:false,
    ...overrides
  }}
});

test('exact Art.-Nr., identity and unique EUR price are accepted',async()=>{
  const out=await evaluateMusicStoreOffer(row(),{
    fetchImpl:async url=>response(catalog('PAH0024126-000','LD Systems ICOA Pro 12 A'),200,url)
  });
  assert.equal(out.decision,'refreshable_shadow');
  assert.equal(out.article_number,'PAH0024126-000');
  assert.equal(out.article_number_valid,true);
  assert.equal(out.identity_valid,true);
  assert.equal(out.unit_price,1089);
  assert.equal(out.total_price,1089);
});

test('neighbouring Art.-Nr. and price are rejected',async()=>{
  const html=catalog('PAH0024127-000','LD Systems ICOA Pro 15 A','1.299,00 €');
  const out=await evaluateMusicStoreOffer(row(),{fetchImpl:async url=>response(html,200,url)});
  assert.equal(out.decision,'article_number_mismatch');
  assert.equal(out.total_price,null);
});

test('PRO and non-PRO variants never cross-match',async()=>{
  const out=await evaluateMusicStoreOffer(row(),{
    fetchImpl:async url=>response(catalog('PAH0024126-000','LD Systems ICOA 12 A'),200,url)
  });
  assert.equal(out.decision,'identity_mismatch');
});

test('BT and non-BT variants never cross-match',async()=>{
  const out=await evaluateMusicStoreOffer(row({
    name:'LD Systems ICOA 12 A BT',
    url:'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-12-A-BT/art-PAH0021617-000'
  }),{
    fetchImpl:async url=>response(catalog('PAH0021617-000','LD Systems ICOA 12 A','429,00 €'),200,url)
  });
  assert.equal(out.decision,'identity_mismatch');
});

test('generation mismatch is rejected',async()=>{
  const out=await evaluateMusicStoreOffer(row({
    name:'LD Systems MAUI 11 G3',
    url:'https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-11-G3/art-PAH0023383-000'
  }),{
    fetchImpl:async url=>response(catalog('PAH0023383-000','LD Systems MAUI 11 G2','929,00 €'),200,url)
  });
  assert.equal(out.decision,'identity_mismatch');
});

for(const [status,decision] of [[403,'blocked'],[429,'blocked'],[404,'not_found'],[410,'not_found']]){
  test(`HTTP ${status} maps to ${decision}`,async()=>{
    const out=await evaluateMusicStoreOffer(row(),{fetchImpl:async url=>response('',status,url)});
    assert.equal(out.decision,decision);
    assert.equal(out.total_price,null);
  });
}

test('ambiguous price is rejected',async()=>{
  const html=catalog('PAH0024126-000','LD Systems ICOA Pro 12 A','1.089,00 € <span>999,00 €</span>');
  const out=await evaluateMusicStoreOffer(row(),{fetchImpl:async url=>response(html,200,url)});
  assert.equal(out.decision,'parse_error');
});

test('zero or invalid price is rejected',async()=>{
  const out=await evaluateMusicStoreOffer(row(),{
    fetchImpl:async url=>response(catalog('PAH0024126-000','LD Systems ICOA Pro 12 A'),200,url),
    parseImpl:()=>({articleNumber:'PAH0024126-000',price:0,sourceMethod:'fixture'})
  });
  assert.equal(out.decision,'invalid_price');
  assert.equal(out.total_price,null);
});

test('duplicate URL is fetched once through report cache',async()=>{
  let calls=0;
  const seed=[
    row({name:'LD Systems ICOA Pro 12 A'}),
    {...row({name:'LD Systems ICOA Pro 12 A'}),id:'rY'}
  ];
  const report=await buildMusicStoreShadowReport({
    seed,
    fetchImpl:async url=>{calls++;return response(catalog('PAH0024126-000','LD Systems ICOA Pro 12 A'),200,url);}
  });
  assert.equal(calls,1);
  assert.equal(report.summary.refreshable,2);
});

test('explicit offer multiplier is applied in integer cents',async()=>{
  const out=await evaluateMusicStoreOffer(row({
    name:'2 × LD Systems ICOA Pro 12 A',
    price:2178,
    calculation:'2 × 1.089 € = 2.178 €'
  }),{
    fetchImpl:async url=>response(catalog('PAH0024126-000','LD Systems ICOA Pro 12 A'),200,url)
  });
  assert.equal(out.multiplier,2);
  assert.equal(out.unit_price,1089);
  assert.equal(out.total_price,2178);
});

test('collection_disabled without explicit componentDetails is incomplete_recipe and performs no fetch',async()=>{
  let calls=0;
  const out=await evaluateMusicStoreOffer(row({
    collectionDisabled:true,
    components:['https://www.musicstore.de/de_DE/EUR/A/art-PAH0024126-000'],
    calculation:'2 × 1089 €'
  }),{fetchImpl:async()=>{calls++;return response('');}});
  assert.equal(calls,0);
  assert.equal(out.decision,'incomplete_recipe');
});

test('component quantities are respected and complete carts sum in cents',async()=>{
  const cart=row({
    name:'Music Store cart',
    collectionDisabled:true,
    componentDetails:[
      {name:'LD Systems ICOA Pro 12 A',url:'https://www.musicstore.de/de_DE/EUR/A/art-PAH0024126-000',quantity:2},
      {name:'LD Systems ICOA 12 PC',url:'https://www.musicstore.de/de_DE/EUR/B/art-PAH0021620-000',quantity:1}
    ]
  });
  const out=await evaluateMusicStoreOffer(cart,{
    fetchImpl:async url=>{
      if(url.includes('PAH0024126-000')) return response(catalog('PAH0024126-000','LD Systems ICOA Pro 12 A','1.089,00 €'),200,url);
      return response(catalog('PAH0021620-000','LD Systems ICOA 12 PC','42,00 €'),200,url);
    }
  });
  assert.equal(out.decision,'refreshable_shadow');
  assert.equal(out.total_price,2220);
});

test('partial or invalid explicit component recipe is rejected',async()=>{
  const out=await evaluateMusicStoreOffer(row({
    collectionDisabled:true,
    componentDetails:[{name:'LD Systems ICOA Pro 12 A',url:'https://www.musicstore.de/de_DE/EUR/A/art-PAH0024126-000',quantity:0}]
  }),{fetchImpl:async()=>response('')});
  assert.equal(out.decision,'incomplete_recipe');
});

test('a blocked structural component rejects the entire cart',async()=>{
  const cart=row({
    collectionDisabled:true,
    componentDetails:[
      {name:'LD Systems ICOA Pro 12 A',url:'https://www.musicstore.de/de_DE/EUR/A/art-PAH0024126-000',quantity:1},
      {name:'LD Systems ICOA 12 PC',url:'https://www.musicstore.de/de_DE/EUR/B/art-PAH0021620-000',quantity:1}
    ]
  });
  const out=await evaluateMusicStoreOffer(cart,{
    fetchImpl:async url=>url.includes('PAH0021620-000')
      ? response('',403,url)
      : response(catalog('PAH0024126-000','LD Systems ICOA Pro 12 A'),200,url)
  });
  assert.equal(out.decision,'blocked');
  assert.equal(out.total_price,null);
});

test('report evaluates exactly the versioned Music Store offer set',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const refs=seed.filter(x=>x.offers?.musicstore).map(x=>x.id);
  assert.equal(refs.length,19);
  const report=await buildMusicStoreShadowReport({
    seed,
    executionEnvironment:'local',
    fetchImpl:async url=>response('',403,url)
  });
  assert.equal(report.summary.total,19);
  assert.equal(report.writes,false);
  assert.deepEqual(report.rows.map(x=>x.reference),refs);
});

test('Music Store shadow source is strictly read-only and contains no bypass or privileged integration',async()=>{
  const source=await fs.readFile('collector/musicstore-shadow.mjs','utf8');
  assert.doesNotMatch(source,/SUPABASE_SECRET|SERVICE_ROLE|rest\/v1|method\s*:\s*['"](?:POST|PATCH|PUT|DELETE)/i);
  assert.doesNotMatch(source,/playwright|chromium|proxy|captcha bypass|retry/i);
  assert.match(source,/writes:false/);
});
