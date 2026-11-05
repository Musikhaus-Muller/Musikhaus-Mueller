import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';

const source=await fs.readFile('web/app.js','utf8');
const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));

function setup(responder){
 const nodes=new Map(),data=structuredClone(seed),calls=[];
 const get=id=>{if(!nodes.has(id))nodes.set(id,{value:['shop','status'].includes(id)?'all':id==='sort'?'default':'',textContent:'',innerHTML:'',handlers:{},addEventListener(k,f){this.handlers[k]=f},closest(){return {classList:{toggle(){}}}}});return nodes.get(id)};
 const context={window:{BUNDLES:data},document:{getElementById:get},Intl,Date,Map,Set,Number,String,Boolean,Math,Infinity,AbortSignal,setTimeout,fetch:async(url,opts={})=>{calls.push({url,opts});const result=await responder(url,opts);return {ok:result.ok??true,status:result.status??200,json:async()=>result.body??result};}};
 vm.runInNewContext(source,context);return {get,data,calls};
}

test('actualización manual dispara el backend y recarga el catálogo al terminar',async()=>{
 const after=structuredClone(seed);after[0].offers.thomann.price=1234;
 let catalogCalls=0;
 const ui=setup((url,opts)=>{
  if(url==='/api/catalog')return {source:'supabase',rows:++catalogCalls===1?seed:after};
  if(url==='/api/status')return {updatedAt:null,run:null};
  if(url==='/api/runs')return {runs:[]};
  if(url==='/api/updates/manual'&&opts.method==='POST')return {status:202,body:{accepted:true,run:{id:'run-1',status:'success',trigger:'manual',startedAt:new Date().toISOString(),processed:1,total:1,confirmed:1,failed:0,shops:[]}}};
  throw Error(`Unexpected request: ${url}`);
 });
 await new Promise(setImmediate);
 await ui.get('refresh').handlers.click();
 const dispatch=ui.calls.find(x=>x.url==='/api/updates/manual');
 assert.equal(dispatch.opts.method,'POST');
 assert.equal(dispatch.opts.headers['X-PA-Trigger'],'manual');
 assert.equal(ui.data[0].offers.thomann.price,1234);
 assert.match(ui.get('update-status').textContent,/Manuell/);
 assert.equal(ui.get('refresh').disabled,false);
});

test('error de red conserva los precios y libera el botón',async()=>{
 const ui=setup((url,opts)=>{
  if(url==='/api/catalog')return {source:'supabase',rows:seed};
  if(url==='/api/status')return {updatedAt:null,run:null};
  if(url==='/api/runs')return {runs:[]};
  if(url==='/api/updates/manual'&&opts.method==='POST')throw Error('Network unavailable');
  throw Error(`Unexpected request: ${url}`);
 });
 await new Promise(setImmediate);
 await ui.get('refresh').handlers.click();
 assert.equal(ui.data[0].offers.thomann.price,seed[0].offers.thomann.price);
 assert.equal(ui.get('refresh').disabled,false);
 assert.match(ui.get('update-status').textContent,/Network unavailable/);
});
