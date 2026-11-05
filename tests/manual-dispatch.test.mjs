import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const source=await fs.readFile('dist/server/index.js','utf8');
const {dispatchManualPriceUpdate}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const runId='45c73d6b-c293-48fa-bde7-3310c7736e9a';
const env={SUPABASE_URL:'https://database.example',SUPABASE_SECRET_KEY:'service-key',GITHUB_ACTIONS_TOKEN:'server-only-token'};
const request=()=>new Request('https://pa.example/api/updates/manual',{
 method:'POST',
 headers:{Origin:'https://pa.example','X-PA-Action':'refresh','X-PA-Trigger':'manual'}
});

test('manual dispatch uses the server token and a Supabase-reserved run id',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{
  calls.push({url:String(url),options});
  if(String(url).includes('/rpc/acquire_manual_collection_run'))return new Response(JSON.stringify([{run_id:runId,started_at:'2026-11-05T22:00:00Z',busy:false,trigger_type:'manual'}]));
  if(String(url).includes('/actions/workflows/collect-prices.yml/dispatches'))return new Response(null,{status:204});
  throw Error(`Unexpected request: ${url}`);
 };
 const response=await dispatchManualPriceUpdate(request(),env,fetcher);
 const body=await response.json();
 const dispatch=calls.find(x=>x.url.includes('/actions/workflows/'));
 assert.equal(response.status,202);
 assert.equal(body.accepted,true);
 assert.equal(body.run.id,runId);
 assert.equal(dispatch.options.headers.Authorization,'Bearer server-only-token');
 assert.deepEqual(JSON.parse(dispatch.options.body),{ref:'main',inputs:{shop:'all',run_id:runId}});
});

test('manual dispatch rejects cross-origin requests before contacting services',async()=>{
 let called=false;
 const req=new Request('https://pa.example/api/refresh',{
  method:'POST',headers:{Origin:'https://attacker.example','X-PA-Action':'refresh','X-PA-Trigger':'manual'}
 });
 const response=await dispatchManualPriceUpdate(req,env,async()=>{called=true;});
 assert.equal(response.status,403);
 assert.equal(called,false);
});

test('manual dispatch does not enqueue a second run while another is active',async()=>{
 let dispatched=false;
 const fetcher=async(url)=>{
  if(String(url).includes('/rpc/acquire_manual_collection_run'))return new Response(JSON.stringify([{run_id:runId,started_at:'2026-11-05T22:00:00Z',busy:true,trigger_type:'schedule'}]));
  dispatched=true;
  throw Error(`Unexpected request: ${url}`);
 };
 const response=await dispatchManualPriceUpdate(request(),env,fetcher);
 const body=await response.json();
 assert.equal(response.status,409);
 assert.equal(body.busy,true);
 assert.equal(body.run.status,'running');
 assert.equal(body.run.trigger,'scheduled');
 assert.equal(dispatched,false);
});

test('failed GitHub dispatch finalizes the reserved Supabase run',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{
  calls.push({url:String(url),options});
  if(String(url).includes('/rpc/acquire_manual_collection_run'))return new Response(JSON.stringify([{run_id:runId,started_at:'2026-11-05T22:00:00Z',busy:false,trigger_type:'manual'}]));
  if(String(url).includes('/actions/workflows/'))return new Response('',{status:503});
  if(String(url).includes('/rest/v1/collection_runs?'))return new Response(null,{status:204});
  throw Error(`Unexpected request: ${url}`);
 };
 const response=await dispatchManualPriceUpdate(request(),env,fetcher);
 assert.equal(response.status,502);
 const finalized=JSON.parse(calls.at(-1).options.body);
 assert.equal(calls.some(x=>x.url.includes('/collection_runs?')),true);
 assert.equal(finalized.status,'failed');
 assert.ok(Number.isFinite(Date.parse(finalized.finished_at)));
});

test('frontend contains no backend credentials and workflow finalizes manual runs',async()=>{
 const app=await fs.readFile('web/app.js','utf8');
 const workflow=await fs.readFile('.github/workflows/collect-prices.yml','utf8');
 assert.doesNotMatch(app,/GITHUB_ACTIONS_TOKEN|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY/);
 assert.match(workflow,/COLLECT_RUN_ID: \$\{\{ inputs\.run_id \}\}/);
 assert.match(workflow,/Finalize failed manual run/);
});
