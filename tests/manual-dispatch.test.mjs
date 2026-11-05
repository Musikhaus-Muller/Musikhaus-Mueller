import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {claimManualRun} from '../collector/claim-manual-run.mjs';
import {reconcileManualRuns} from '../collector/reconcile-manual-runs.mjs';

const source=await fs.readFile('dist/server/index.js','utf8');
const {dispatchManualPriceUpdate}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const runId='45c73d6b-c293-48fa-bde7-3310c7736e9a';
const accessDomain='example.cloudflareaccess.com';
const accessAudience='pa-manual-update-audience';
const keyPair=await webcrypto.subtle.generateKey(
 {name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},
 true,
 ['sign','verify']
);
const accessJwk={...(await webcrypto.subtle.exportKey('jwk',keyPair.publicKey)),kid:'test-key',use:'sig'};
const base64url=value=>btoa(String.fromCharCode(...(value instanceof Uint8Array?value:new TextEncoder().encode(value))))
 .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function accessToken(claims={exp:Math.floor(Date.now()/1000)+600,iss:`https://${accessDomain}`,aud:accessAudience}){
 const header=base64url(JSON.stringify({alg:'RS256',kid:'test-key'}));
 const payload=base64url(JSON.stringify(claims));
 const bytes=new TextEncoder().encode(`${header}.${payload}`);
 const signature=new Uint8Array(await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',keyPair.privateKey,bytes));
 return `${header}.${payload}.${base64url(signature)}`;
}
const env={
 SUPABASE_URL:'https://database.example',
 SUPABASE_SECRET_KEY:'service-key',
 GITHUB_ACTIONS_TOKEN:'server-only-token',
 CF_ACCESS_TEAM_DOMAIN:accessDomain,
 CF_ACCESS_AUD:accessAudience
};
const request=async(options={})=>{
 const token=options.token===null?null:options.token||await accessToken();
 return new Request('https://pa.example/api/updates/manual',{
  method:'POST',
  headers:{
   ...(token?{'Cf-Access-Jwt-Assertion':token}:{}),
   Origin:options.origin||'https://pa.example',
   'X-PA-Action':'refresh',
   'X-PA-Trigger':'manual'
  }
 });
};
const accessKeyResponse=url=>String(url).endsWith('/cdn-cgi/access/certs')
 ?new Response(JSON.stringify({keys:[accessJwk]}))
 :null;

test('unauthenticated direct API calls cannot reserve or dispatch',async()=>{
 let called=false;
 const response=await dispatchManualPriceUpdate(await request({token:null}),env,async url=>{
  if(accessKeyResponse(url))return accessKeyResponse(url);
  called=true;
 });
 assert.equal(response.status,401);
 assert.equal(called,false);
 assert.doesNotMatch(JSON.stringify(await response.json()),/server-only-token|service-key/);
});

test('forged Cloudflare Access headers are rejected before reserving a run',async()=>{
 const valid=await accessToken();
 const forged=valid.slice(0,-2)+'xx';
 let reserved=false;
 const response=await dispatchManualPriceUpdate(await request({token:forged}),env,async url=>{
  if(accessKeyResponse(url))return accessKeyResponse(url);
  reserved=true;
 });
 assert.equal(response.status,401);
 assert.equal(reserved,false);
});

test('authorized manual dispatch reserves once and sends its run id to GitHub',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{
  const keys=accessKeyResponse(url);
  if(keys)return keys;
  calls.push({url:String(url),options});
  if(String(url).includes('/rpc/acquire_manual_collection_run'))return new Response(JSON.stringify([{run_id:runId,started_at:'2026-11-05T22:00:00Z',busy:false,trigger_type:'manual'}]));
  if(String(url).includes('/actions/workflows/collect-prices.yml/dispatches'))return new Response(null,{status:204});
  if(String(url).includes('/rpc/mark_manual_collection_dispatched'))return new Response(JSON.stringify('queued'));
  throw Error(`Unexpected request: ${url}`);
 };
 const response=await dispatchManualPriceUpdate(await request(),env,fetcher);
 const body=await response.json();
 const dispatch=calls.find(x=>x.url.includes('/actions/workflows/'));
 assert.equal(response.status,202);
 assert.equal(body.accepted,true);
 assert.equal(body.run.id,runId);
 assert.equal(body.run.phase,'queued');
 assert.equal(dispatch.options.headers.Authorization.startsWith('Bearer '),true);
 assert.deepEqual(JSON.parse(dispatch.options.body),{ref:'main',inputs:{shop:'all',collection_run_id:runId}});
 assert.doesNotMatch(JSON.stringify(body),/server-only-token|service-key/);
});

test('Origin remains a CSRF check but cannot substitute for Access authentication',async()=>{
 let reserved=false;
 const response=await dispatchManualPriceUpdate(await request({origin:'https://attacker.example'}),env,async url=>{
  const keys=accessKeyResponse(url);
  if(keys)return keys;
  reserved=true;
 });
 assert.equal(response.status,403);
 assert.equal(reserved,false);
});

test('concurrent button clicks reuse the active reservation and never dispatch a second workflow',async()=>{
 let acquisitions=0,dispatches=0;
 const fetcher=async(url)=>{
  const keys=accessKeyResponse(url);
  if(keys)return keys;
  if(String(url).includes('/rpc/acquire_manual_collection_run')){
   acquisitions++;
   return new Response(JSON.stringify([{
    run_id:runId,started_at:'2026-11-05T22:00:00Z',busy:acquisitions>1,trigger_type:acquisitions>1?'manual':'schedule'
   }]));
  }
  if(String(url).includes('/actions/workflows/')){dispatches++;return new Response(null,{status:204});}
  if(String(url).includes('/rpc/mark_manual_collection_dispatched'))return new Response(JSON.stringify('queued'));
  throw Error(`Unexpected request: ${url}`);
 };
 const [first,second]=await Promise.all([
  dispatchManualPriceUpdate(await request(),env,fetcher),
  dispatchManualPriceUpdate(await request(),env,fetcher)
 ]);
 assert.deepEqual([first.status,second.status].sort(),[202,409]);
 assert.equal(acquisitions,2);
 assert.equal(dispatches,1);
});

test('a rejected dispatch is failed instead of leaving a blocking reservation',async()=>{
 let failed=false;
 const fetcher=async(url)=>{
  const keys=accessKeyResponse(url);
  if(keys)return keys;
  if(String(url).includes('/rpc/acquire_manual_collection_run'))return new Response(JSON.stringify([{run_id:runId,started_at:'2026-11-05T22:00:00Z',busy:false,trigger_type:'manual'}]));
  if(String(url).includes('/actions/workflows/'))return new Response('',{status:503});
  if(String(url).includes('/rpc/fail_manual_collection_run')){failed=true;return new Response('true');}
  throw Error(`Unexpected request: ${url}`);
 };
 const response=await dispatchManualPriceUpdate(await request(),env,fetcher);
 assert.equal(response.status,502);
 assert.equal(failed,true);
});

test('workflow claim updates the same reserved run and rejects expired or already-finalized runs',async()=>{
 const calls=[];
 const claimed=await claimManualRun({
  env:{SUPABASE_URL:env.SUPABASE_URL,SUPABASE_SECRET_KEY:env.SUPABASE_SECRET_KEY,COLLECT_RUN_ID:runId},
  fetcher:async(url,options)=>{
   calls.push({url:String(url),options});
   return new Response(JSON.stringify([{claimed:true,reason:null}]));
  }
 });
 assert.deepEqual(claimed,{claimed:true,runId});
 assert.match(calls[0].url,/rpc\/claim_manual_collection_run$/);
 assert.deepEqual(JSON.parse(calls[0].options.body),{p_run_id:runId});
 await assert.rejects(claimManualRun({
  env:{SUPABASE_URL:env.SUPABASE_URL,SUPABASE_SECRET_KEY:env.SUPABASE_SECRET_KEY,COLLECT_RUN_ID:runId},
  fetcher:async()=>new Response(JSON.stringify([{claimed:false,reason:'reservation_expired'}]))
 }),/reservation_expired/);
});

test('scheduled reconciler calls Supabase without depending on an open browser',async()=>{
 const calls=[];
 const count=await reconcileManualRuns({
  env:{SUPABASE_URL:env.SUPABASE_URL,SUPABASE_SECRET_KEY:env.SUPABASE_SECRET_KEY,GITHUB_TOKEN:'actions-read-token'},
  fetcher:async(url,options)=>{
   calls.push({url:String(url),options});
   if(String(url).includes('/actions/workflows/'))return new Response(JSON.stringify({workflow_runs:[
    {status:'queued',display_title:`Collect prices / ${runId}`},
    {status:'completed',display_title:'Collect prices / 11111111-1111-1111-1111-111111111111'}
   ]}));
   return new Response('2');
  }
 });
 assert.equal(count,2);
 assert.match(calls[1].url,/rpc\/reconcile_manual_collection_runs$/);
 assert.deepEqual(JSON.parse(calls[1].options.body),{p_active_run_ids:[runId]});
 assert.equal(calls[0].options.headers.Authorization.startsWith('Bearer '),true);
});

test('GitHub API failures prevent reconciliation from falsely expiring queued runs',async()=>{
 let calledSupabase=false;
 await assert.rejects(reconcileManualRuns({
  env:{SUPABASE_URL:env.SUPABASE_URL,SUPABASE_SECRET_KEY:env.SUPABASE_SECRET_KEY,GITHUB_TOKEN:'actions-read-token'},
  fetcher:async url=>{
   if(String(url).includes('/actions/workflows/'))return new Response('',{status:503});
   calledSupabase=true;
   return new Response('0');
  }
 }),/inspect GitHub Actions runs: HTTP 503/);
 assert.equal(calledSupabase,false);
});

test('reconciliation expires only reserved or queued web runs, never a claimed collector',async()=>{
 const sql=await fs.readFile('supabase/migrations/20261105225000_manual_collection_lifecycle.sql','utf8');
 const reconciliation=sql.match(/create or replace function public\.reconcile_manual_collection_runs\([\s\S]*?\)([\s\S]*?)\$\$;/)?.[1]||'';
 const claim=sql.match(/create or replace function public\.claim_manual_collection_run\([\s\S]*?\)([\s\S]*?)\$\$;/)?.[1]||'';
 assert.match(reconciliation,/metadata->>'source' = 'web'/);
 assert.match(reconciliation,/metadata->>'lifecycle' = 'reserved'/);
 assert.match(reconciliation,/metadata->>'lifecycle' = 'queued'/);
 assert.match(reconciliation,/not \(id = any\(coalesce\(p_active_run_ids/);
 assert.doesNotMatch(reconciliation,/metadata->>'lifecycle' = 'running'/);
 assert.match(claim,/'lifecycle',\s*'running'/);
 assert.match(sql,/'lifecycle',\s*'queued'[\s\S]*'dispatch_accepted_at',\s*now\(\)/);
 const acquire=sql.match(/create or replace function public\.acquire_manual_collection_run\(\)([\s\S]*?)\$\$;/)?.[1]||'';
 assert.doesNotMatch(acquire,/reconcile_manual_collection_runs/);
 assert.match(sql,/where id = p_run_id\s+and status = 'running'/);
});

test('a later reservation is allowed after the GitHub-aware reconciler marks a lost dispatch failed',async()=>{
 const sql=await fs.readFile('supabase/migrations/20261105225000_manual_collection_lifecycle.sql','utf8');
 const acquireRun=sql.match(/create or replace function public\.acquire_manual_collection_run\(\)([\s\S]*?)\$\$;/)?.[1]||'';
 assert.match(sql,/set status = 'failed'[\s\S]*'lifecycle', 'failed'[\s\S]*metadata->>'lifecycle' = 'queued'/);
 assert.doesNotMatch(acquireRun,/reconcile_manual_collection_runs/);
 assert.match(acquireRun,/where cr\.status = 'running'/);
 assert.match(acquireRun,/insert into public\.collection_runs \(trigger_type, status, offers_total, metadata\)/);
});

test('frontend contains no backend credentials and workflow responses contain no secrets',async()=>{
 const app=await fs.readFile('web/app.js','utf8');
 const workflow=await fs.readFile('.github/workflows/collect-prices.yml','utf8');
 assert.doesNotMatch(app,/GITHUB_ACTIONS_TOKEN|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|CF_ACCESS_AUD/);
 assert.match(workflow,/COLLECT_RUN_ID: \$\{\{ inputs\.collection_run_id \}\}/);
 assert.match(workflow,/Claim website-reserved run/);
 assert.match(workflow,/run-name: Collect prices \/ \$\{\{ github\.event\.inputs\.collection_run_id \|\| github\.run_id \}\}/);
 assert.match(workflow,/Finalize failed manual run/);
});
