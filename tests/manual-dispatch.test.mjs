import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {claimManualRun} from '../collector/claim-manual-run.mjs';
import {reconcileManualRuns} from '../collector/reconcile-manual-runs.mjs';

const runId='45c73d6b-c293-48fa-bde7-3310c7736e9a';

test('worker and frontend contain no Cloudflare Access or GitHub dispatch secrets',async()=>{
 const worker=await fs.readFile('worker/handler.mjs','utf8');
 const app=await fs.readFile('web/app.js','utf8');
 assert.doesNotMatch(worker,/CF_ACCESS_|Cf-Access-Jwt-Assertion|GITHUB_ACTIONS_TOKEN|api\.github\.com\/repos\/Musikhaus-Muller/);
 assert.doesNotMatch(app,/\/api\/updates\/manual|CF_ACCESS_|GITHUB_ACTIONS_TOKEN/);
});

test('manual collection remains available administratively through GitHub Actions',async()=>{
 const workflow=await fs.readFile('.github/workflows/collect-prices.yml','utf8');
 assert.match(workflow,/workflow_dispatch:/);
 assert.match(workflow,/shop:/);
 assert.match(workflow,/default: all/);
 assert.match(workflow,/schedule:[\s\S]*cron: '15 7 \* \* \*'/);
 assert.match(workflow,/concurrency:[\s\S]*group: price-update-pipeline[\s\S]*cancel-in-progress: false/);
});

test('workflow claim still supports an explicitly correlated reserved run',async()=>{
 const calls=[];
 const claimed=await claimManualRun({
  env:{SUPABASE_URL:'https://database.example',SUPABASE_SECRET_KEY:'service-key',COLLECT_RUN_ID:runId},
  fetcher:async(url,options)=>{
   calls.push({url:String(url),options});
   return new Response(JSON.stringify([{claimed:true,reason:null}]));
  }
 });
 assert.deepEqual(claimed,{claimed:true,runId});
 assert.match(calls[0].url,/rpc\/claim_manual_collection_run$/);
});

test('scheduled reconciler preserves active GitHub runs and does not depend on the browser',async()=>{
 const calls=[];
 const count=await reconcileManualRuns({
  env:{SUPABASE_URL:'https://database.example',SUPABASE_SECRET_KEY:'service-key',GITHUB_TOKEN:'actions-read-token'},
  fetcher:async(url,options)=>{
   calls.push({url:String(url),options});
   if(String(url).includes('/actions/workflows/'))return new Response(JSON.stringify({workflow_runs:[
    {status:'queued',display_title:`Collect prices / ${runId}`}
   ]}));
   return new Response('0');
  }
 });
 assert.equal(count,0);
 assert.deepEqual(JSON.parse(calls[1].options.body),{p_active_run_ids:[runId]});
});

test('Supabase lifecycle migration never performs blind reconciliation inside acquire',async()=>{
 const sql=await fs.readFile('supabase/migrations/20261105225000_manual_collection_lifecycle.sql','utf8');
 const acquire=sql.match(/create or replace function public\.acquire_manual_collection_run\(\)([\s\S]*?)\$\$;/)?.[1]||'';
 assert.doesNotMatch(acquire,/reconcile_manual_collection_runs/);
});
