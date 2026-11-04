import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
const source=await fs.readFile('web/app.js','utf8');
const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
const run={status:'partial',startedAt:new Date().toISOString(),processed:70,total:70,confirmed:41,failed:29,changed:0,issues:[{shop:'thomann',message:'Shop-Zugriff blockiert (HTTP 403)'}]};
function setup(responder){
 const nodes=new Map(),data=structuredClone(seed),calls=[];
 const get=id=>{if(!nodes.has(id))nodes.set(id,{value:['shop','status'].includes(id)?'all':id==='sort'?'default':'',textContent:'',innerHTML:'',handlers:{},addEventListener(k,f){this.handlers[k]=f},closest(){return {classList:{toggle(){}}}}});return nodes.get(id)};
 const context={window:{BUNDLES:data},document:{getElementById:get},Intl,Date,Map,Set,Number,String,Boolean,Math,Infinity,AbortSignal,setTimeout,fetch:async(url,opts)=>{calls.push(url);return {ok:true,json:async()=>url==='/api/status'?{run:null}:responder(url,opts)}}};
 vm.runInNewContext(source,context);return {get,data,calls};
}
test('actualización manual recalcula cobertura y conserva precios bloqueados',async()=>{
 const after=structuredClone(seed);for(const r of after)for(const o of Object.values(r.offers)){o.verifiedToday=false;}
 const ui=setup(url=>url==='/data.json'?after:{run});await new Promise(setImmediate);
 await ui.get('refresh').handlers.click();
 const finalOffers=ui.data.flatMap(r=>Object.values(r.offers).filter(o=>Number.isFinite(o?.price)));
 const now=Date.now();
 const expectedStale=finalOffers.filter(o=>!(Boolean(o?.verifiedToday)&&now-Date.parse(o.checkedAt||o.priceDate+'T00:00:00Z')<36*3600000)).length;
 assert.match(ui.get('coverage').innerHTML,new RegExp(`<strong>${finalOffers.length} zugeordnete Händlerangebote</strong>`));
 assert.match(ui.get('coverage').innerHTML,new RegExp(`${expectedStale} Preisangaben sind nicht aktuell bestätigt`));
 assert.equal(ui.data[0].offers.thomann.price,seed[0].offers.thomann.price);
 assert.match(ui.get('update-status').textContent,/Thomann: Shop-Zugriff blockiert \(HTTP 403\)/);
 assert.equal(ui.get('refresh').disabled,false);
});
test('espera de una hora informa que no inició una consulta nueva',async()=>{
 const ui=setup(url=>url==='/data.json'?seed:{cooldown:true,run});await new Promise(setImmediate);await ui.get('refresh').handlers.click();
 assert.match(ui.get('update-status').textContent,/Keine neue Abfrage gestartet/);
 assert.equal(ui.calls.filter(x=>x==='/api/refresh').length,1);
 assert.equal(ui.get('refresh').disabled,false);
});
test('error de red mantiene datos y libera el botón',async()=>{
 const ui=setup(()=>{throw Error('Network unavailable')});await new Promise(setImmediate);await ui.get('refresh').handlers.click();
 assert.deepEqual(ui.data,seed);assert.equal(ui.get('refresh').disabled,false);assert.match(ui.get('update-status').textContent,/Aktualisierung nicht abgeschlossen/);
});
