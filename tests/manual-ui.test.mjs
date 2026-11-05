import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';

const source=await fs.readFile('web/app.js','utf8');
const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));

function setup(responder){
 const nodes=new Map(),data=structuredClone(seed),calls=[];
 const get=id=>{if(!nodes.has(id))nodes.set(id,{value:['shop','status'].includes(id)?'all':id==='sort'?'default':'',textContent:'',innerHTML:'',handlers:{},disabled:false,addEventListener(k,f){this.handlers[k]=f},closest(){return {classList:{toggle(){}}}}});return nodes.get(id)};
 const context={window:{BUNDLES:data},document:{getElementById:get},Intl,Date,Map,Set,Number,String,Boolean,Math,Infinity,AbortSignal,setTimeout,fetch:async(url,opts={})=>{calls.push({url,opts});const result=await responder(url,opts);return {ok:result.ok??true,status:result.status??200,json:async()=>result.body??result};}};
 vm.runInNewContext(source,context);return {get,data,calls};
}

test('public refresh button only reloads Supabase data and never dispatches GitHub Actions',async()=>{
 const after=structuredClone(seed);after[0].offers.thomann.price=1234;
 let catalogCalls=0;
 const ui=setup((url)=>{
  if(url==='/api/catalog')return {source:'supabase',rows:++catalogCalls===1?seed:after};
  if(url==='/api/status')return {updatedAt:null,run:null};
  if(url==='/api/runs')return {runs:[]};
  throw Error(`Unexpected request: ${url}`);
 });
 await new Promise(setImmediate);
 await ui.get('refresh').handlers.click();
 assert.equal(ui.calls.some(x=>x.url==='/api/updates/manual'),false);
 assert.equal(ui.data[0].offers.thomann.price,1234);
 assert.match(ui.get('update-status').textContent,/GitHub Actions/);
 assert.equal(ui.get('refresh').disabled,false);
});

test('refresh keeps the last visible data when Supabase reload is unavailable',async()=>{
 const ui=setup((url)=>{
  if(url==='/api/catalog')return {ok:false,status:503,body:{error:'unavailable'}};
  if(url==='/api/status')return {updatedAt:null,run:null};
  if(url==='/api/runs')return {runs:[]};
  throw Error(`Unexpected request: ${url}`);
 });
 await new Promise(setImmediate);
 await ui.get('refresh').handlers.click();
 assert.equal(ui.data[0].offers.mueller.price,seed[0].offers.mueller.price);
 assert.equal(ui.get('refresh').disabled,false);
 assert.match(ui.get('update-status').textContent,/Snapshot|Supabase/);
});
