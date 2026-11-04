import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const src=await fs.readFile('dist/server/index.js','utf8');
const mod=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));

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
 assert.match(rows[0].offers.musicstore.fetchStatus,/blocked/);
});

test('frontend lists Music Store as sixth shop',async()=>{
 const app=await fs.readFile('web/app.js','utf8');
 const html=await fs.readFile('web/index.html','utf8');
 assert.match(app,/musicstore:'Music Store'/);
 assert.match(html,/Alle 6 Händler/);
 assert.match(html,/Müller \+ Music Store/);
});
