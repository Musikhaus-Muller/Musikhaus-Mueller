import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const src=await fs.readFile('dist/server/index.js','utf8');
const mod=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));

test('Supabase run mapper preserves existing frontend history shape',()=>{
 const mapped=mod.mapSupabaseRun({
  id:'run-1',trigger_type:'schedule',status:'partial',
  started_at:'2026-11-04T07:15:00Z',finished_at:'2026-11-04T07:16:00Z',
  offers_total:4,offers_checked:4,offers_updated:2,offers_failed:2
 },[
  {status:'success',message:'ok',created_at:'2026-11-04T07:15:10Z',offer:{shop_product_name:'A',product_url:'https://a.example',shop:{slug:'mueller'}}},
  {status:'blocked',message:'HTTP 403',created_at:'2026-11-04T07:15:20Z',offer:{shop_product_name:'B',product_url:'https://b.example',shop:{slug:'musicstore'}}}
 ]);
 assert.equal(mapped.trigger,'scheduled');
 assert.equal(mapped.status,'partial');
 assert.equal(mapped.processed,4);
 assert.equal(mapped.confirmed,2);
 assert.equal(mapped.failed,2);
 assert.equal(mapped.results.length,2);
 assert.equal(mapped.issues[0].shop,'musicstore');
 assert.deepEqual(mapped.shops,[
  {shop:'mueller',total:1,confirmed:1,failed:0,status:'success'},
  {shop:'musicstore',total:1,confirmed:0,failed:1,status:'failed'}
 ]);
});

test('Supabase run mapper preserves failed state and identifies manual trigger',()=>{
 const mapped=mod.mapSupabaseRun({
  id:'run-failed',trigger_type:'manual',status:'failed',
  started_at:'2026-11-04T07:15:00Z',finished_at:'2026-11-04T07:16:00Z'
 });
 assert.equal(mapped.trigger,'manual');
 assert.equal(mapped.status,'failed');
});

test('history and status endpoints use Supabase, not R2',async()=>{
 const source=await fs.readFile('worker/handler.mjs','utf8');
 assert.match(source,/if\(path==='\/api\/runs'\).*loadSupabaseRuns/);
 assert.match(source,/if\(path==='\/api\/status'\).*loadSupabaseStatus/);
});
