import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const mod=await import('../dist/server/index.js');
const result=(status,shop,letter)=>({
 status,message:status==='success'?'ok':status,created_at:'2026-11-04T07:15:10Z',
 offer:{shop_product_name:letter,product_url:`https://${letter}.example`,shop:{slug:shop}}
});

test('Supabase run mapper distinguishes confirmed, preserved, and hard failures',()=>{
 const mapped=mod.mapSupabaseRun({
  id:'run-1',trigger_type:'schedule',status:'failed',
  started_at:'2026-11-04T07:15:00Z',finished_at:'2026-11-04T07:16:00Z',
  offers_total:8,offers_checked:8,offers_updated:1,offers_failed:99
 },[
  result('success','mueller','A'),result('success','mueller','B'),
  result('blocked','mueller','C'),result('captcha','musicstore','D'),
  result('not_found','hotsound','E'),result('parse_error','hotsound','F'),
  result('network_error','kirstein','G'),result('future_status','prolighting','H')
 ]);

 assert.equal(mapped.trigger,'scheduled');
 assert.equal(mapped.status,'partial');
 assert.equal(mapped.processed,8);
 assert.equal(mapped.confirmed,2);
 assert.equal(mapped.preserved,4);
 assert.equal(mapped.failed,2);
 assert.equal(mapped.results[2].status,'preserved');
 assert.equal(mapped.results[2].sourceStatus,'blocked');
 assert.equal(mapped.results[7].status,'error');
 assert.equal(mapped.results[7].sourceStatus,'future_status');
 assert.equal(mapped.issues.length,2);
 assert.deepEqual(mapped.issues.map(x=>x.sourceStatus),['network_error','future_status']);
 assert.equal(mapped.warnings.length,4);
 assert.deepEqual(mapped.warnings[0],{
  shop:'mueller',url:'https://C.example',sourceStatus:'blocked',message:'blocked'
 });
 assert.equal(mapped.shops[0].status,'success_with_preserved');
 assert.deepEqual(mapped.shops[0],{
  shop:'mueller',total:3,confirmed:2,preserved:1,failed:0,
  preservedBlocked:1,preservedCaptcha:0,preservedNotFound:0,preservedParseError:0,
  status:'success_with_preserved'
 });
 assert.equal(mapped.shops.find(x=>x.shop==='kirstein').status,'failed');
});

test('historical results override inflated offers_failed without rewriting the run',()=>{
 const mapped=mod.mapSupabaseRun({
  id:'legacy-run',trigger_type:'manual',status:'failed',
  offers_total:3,offers_checked:3,offers_updated:1,offers_failed:2
 },[result('success','mueller','A'),result('blocked','musicstore','B'),result('not_found','hotsound','C')]);
 assert.equal(mapped.confirmed,1);
 assert.equal(mapped.preserved,2);
 assert.equal(mapped.failed,0);
 assert.equal(mapped.status,'success');
});

test('runs without result rows retain their stored status and counters',()=>{
 const mapped=mod.mapSupabaseRun({
  id:'run-failed',trigger_type:'manual',status:'failed',
  started_at:'2026-11-04T07:15:00Z',finished_at:'2026-11-04T07:16:00Z',
  offers_checked:2,offers_updated:0,offers_failed:2
 });
 assert.equal(mapped.trigger,'manual');
 assert.equal(mapped.status,'failed');
 assert.equal(mapped.failed,2);
});

test('history and status endpoints use Supabase, not R2',async()=>{
 const source=await fs.readFile('worker/handler.mjs','utf8');
 assert.match(source,/if\(path==='\/api\/runs'\).*loadSupabaseRuns/);
 assert.match(source,/if\(path==='\/api\/status'\).*loadSupabaseStatus/);
});
