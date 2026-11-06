import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const mod=await import('../dist/server/index.js');

test('Supabase frontend projection maps to the existing bundle shape',()=>{
 const rows=mod.toFrontendRows([{
  legacy_id:'r1',brand:'LD Systems',family:'MAUI',configuration_name:'MAUI 11 G3 Stereo',subtitle:'Schwarz',configuration_note:null,
  shop_slug:'musicstore',shop_product_name:'2 × LD-Systems MAUI 11 G3 Schwarz',product_url:'https://www.musicstore.de/example',
  contents:'2 × MAUI 11 G3 schwarz.',match_type:'exact',calculation:'2 × 929 € = 1858 €',offer_note:null,source_url:'https://www.musicstore.de/example',
  source_name:'LD-Systems MAUI 11 G3 Schwarz',evidence:'verified',price:'1858.00',availability:'available',
  price_source_method:'catalog',price_observed_at:'2026-11-04T12:00:00Z',last_attempt_status:'blocked',last_attempt_error:'HTTP 403',last_attempt_at:'2026-11-04T13:00:00Z'
 }]);
 assert.equal(rows.length,1);
 assert.equal(rows[0].offers.musicstore.price,1858);
 assert.equal(rows[0].offers.musicstore.available,true);
 assert.equal(rows[0].offers.musicstore.verifiedToday,false);
 assert.equal(rows[0].offers.musicstore.priceObservedAt,'2026-11-04T12:00:00Z');
 assert.equal(rows[0].offers.musicstore.lastAttemptAt,'2026-11-04T13:00:00Z');
 assert.equal(rows[0].offers.musicstore.priceAgeDays,Math.max(0,Math.floor((Date.now()-Date.parse('2026-11-04T12:00:00Z'))/86400000)));
 assert.match(rows[0].offers.musicstore.fetchStatus,/blocked/);
});

test('frontend lists Music Store as sixth shop',async()=>{
 const app=await fs.readFile('web/app.js','utf8');
 const html=await fs.readFile('web/index.html','utf8');
 assert.match(app,/musicstore:'Music Store'/);
 assert.match(html,/Alle 6 Händler/);
 assert.match(html,/Müller \+ Music Store/);
});

test('a not_found attempt keeps the last successful Thomann price visible',()=>{
 const [row]=mod.toFrontendRows([{
  legacy_id:'r12',brand:'LD Systems',family:'MAUI',configuration_name:'MAUI 44 G2 Power Bundle',subtitle:'',
  shop_slug:'thomann',shop_product_name:'LD Systems Maui 44 G2 Power Bundle',product_url:'https://www.thomann.de/de/ld_systems_maui_44_g2_power_bundle.htm',
  contents:'2 × MAUI 44 G2 Komplettsystem; 2 × zusätzliche Subwoofer.',match_type:'exact',source_url:'https://www.thomann.de/de/ld_systems_maui_44_g2_power_bundle.htm',
  price:'7269.00',availability:'available',price_source_method:'http',price_observed_at:'2026-10-17T00:00:00Z',
  last_attempt_status:'not_found',last_attempt_method:'http',last_attempt_http_status:404,last_attempt_error:'HTTP 404',last_attempt_at:'2026-11-06T11:00:00Z'
 }]);
 assert.equal(row.offers.thomann.price,7269);
 assert.equal(row.offers.thomann.verifiedToday,false);
 assert.equal(row.offers.thomann.priceObservedAt,'2026-10-17T00:00:00Z');
 assert.equal(row.offers.thomann.lastAttemptAt,'2026-11-06T11:00:00Z');
 assert.match(row.offers.thomann.fetchStatus,/not_found.*HTTP 404/);
});

test('a CAPTCHA attempt preserves the last successful price and reports it as unverified',()=>{
 const [row]=mod.toFrontendRows([{
  legacy_id:'r13',brand:'LD Systems',family:'MAUI',configuration_name:'MAUI 11 G3',subtitle:'',
  shop_slug:'thomann',shop_product_name:'LD Systems Maui 11 G3',product_url:'https://www.thomann.de/example',
  price:'999.00',availability:'available',price_source_method:'http',price_observed_at:'2026-10-20T00:00:00Z',
  last_attempt_status:'captcha',last_attempt_error:'CAPTCHA / access challenge detected',last_attempt_at:'2026-11-06T12:00:00Z'
 }]);
 assert.equal(row.offers.thomann.price,999);
 assert.equal(row.offers.thomann.verifiedToday,false);
 assert.match(row.offers.thomann.fetchStatus,/captcha/);
});
