import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const src=await fs.readFile('dist/server/index.js','utf8');const {default:worker,parsePrice,refresh,applyBrowserChecks}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
class Bucket{constructor(){this.data=null;this.version=0}async get(){if(!this.data)return null;return {etag:String(this.version),json:async()=>JSON.parse(this.data)}}async put(k,v,o){if(o.onlyIf?.etagMatches&&o.onlyIf.etagMatches!==String(this.version))return null;if(o.onlyIf instanceof Headers&&this.data)return null;this.data=v;return {etag:String(++this.version)}}}
const html=(name,price=929,currency='EUR')=>`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name,offers:{price,priceCurrency:currency}})}</script>`;
test('precio EUR único y producto correcto',()=>{assert.equal(parsePrice(html('LD Systems MAUI 11 G3',929),'MAUI 11 G3','www.kirstein.de').price,929);assert.throws(()=>parsePrice(html('DAVE 18 G4X'),'MAUI 11 G3','www.kirstein.de'));assert.throws(()=>parsePrice(html('MAUI 11 G3',929,'USD'),'MAUI 11 G3','www.kirstein.de'));assert.throws(()=>parsePrice(html('MAUI 11 G3')+html('MAUI 11 G3',999),'MAUI 11 G3','www.kirstein.de'));assert.throws(()=>parsePrice('Just a moment','MAUI','www.kirstein.de'));});
test('bloqueo conserva precios y pausa dominio',async()=>{const env={BUCKET:new Bucket()};let calls=0;const before=applyBrowserChecks({rows:structuredClone(seed),run:null}).rows;await refresh(env,async()=>{calls++;return new Response('',{status:429})});const s=JSON.parse(env.BUCKET.data);assert.equal(s.run.cursor,3);assert(calls<=3);const after=s.rows;assert.equal(after[0].offers.mueller.price,before[0].offers.mueller.price);assert.equal(after[0].offers.mueller.verifiedToday,false);assert(s.run.failed>0);});
test('actualización, multiplicador y persistencia',async()=>{const env={BUCKET:new Bucket()};const data=applyBrowserChecks({rows:structuredClone(seed),run:null}).rows;const names=new Map();for(const r of data)for(const o of Object.values(r.offers))names.set(o.url,o.sourceName||o.name);const f=async u=>new Response(html(names.get(u),929));await refresh(env,f);const s=JSON.parse(env.BUCKET.data);assert.equal(s.rows[0].offers.mueller.price,929);assert.equal(s.rows[0].offers.kirstein.price,1858);assert.equal(s.rows[0].offers.kirstein.verifiedToday,true);assert(s.rows[0].offers.mueller.checkedAt);});
test('exclusión de ejecuciones simultáneas',async()=>{const env={BUCKET:new Bucket()};let release;const gate=new Promise(r=>release=r);const first=refresh(env,async()=>{await gate;return new Response('',{status:429})});await new Promise(r=>setTimeout(r,10));const second=await refresh(env);assert.equal(second.busy,true);release();await first;});
test('CSRF rechazado, servicio y MCP disponibles',async()=>{const env={BUCKET:new Bucket()};assert.equal((await worker.fetch(new Request('https://site/api/refresh',{method:'POST'}),env)).status,403);const r=await worker.fetch(new Request('https://site/mcp',{method:'POST',body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})}),env);assert.equal((await r.json()).result.tools.length,2);assert.equal((await worker.fetch(new Request('https://site/'),env)).status,200);});

test('rechaza generación y color distintos',()=>{assert.throws(()=>parsePrice(html('MAUI 11 G2 schwarz'),'MAUI 11 G3 schwarz','www.kirstein.de'));assert.throws(()=>parsePrice(html('MAUI 11 G3 schwarz'),'MAUI 11 G3 weiss','www.kirstein.de'));});
test('comprobación manual restaura sólo datos más antiguos y conserva diferencias de accesorios',async()=>{const env={BUCKET:new Bucket()};const rows=applyBrowserChecks({rows:structuredClone(seed),run:null}).rows;assert.equal(rows[0].offers.thomann.verificationMethod,'browser');const stereo=rows.find(r=>r.id==='r4').offers.thomann;assert.equal(stereo.price,2818);assert.equal(stereo.calculation,'2 × 1409 € = 2818 €');assert.equal(stereo.previousPrice,2830);assert.equal(rows[1].offers.thomann.match,'similar');assert.equal(rows[1].offers.kirstein.match,'similar');rows[0].offers.thomann.price=1999;rows[0].offers.thomann.lastAttemptAt='2026-11-04T09:00:00Z';rows[0].offers.thomann.verifiedToday=false;env.BUCKET.data=JSON.stringify({rows,run:null});const later=applyBrowserChecks(JSON.parse(env.BUCKET.data)).rows;assert.equal(later[0].offers.thomann.price,1999);assert.equal(later[0].offers.thomann.verifiedToday,false);});

test('stock acepta el formato corto del comercio y no interpreta valores desconocidos como agotado',()=>{const fixture=availability=>JSON.stringify({'@type':'Product',name:'MAUI 11 G3',offers:{price:929,priceCurrency:'EUR',availability}});const parse=a=>parsePrice('<script type="application/ld+json">'+fixture(a)+'</script>','MAUI 11 G3','www.musikhaus-mueller.de');assert.equal(parse('InStock').available,true);assert.equal(parse('https://schema.org/OutOfStock').available,false);assert.equal(parse('Unknown').available,undefined);});

test('historial persistente distingue trigger, resultados, espera y retención',async()=>{
 const env={BUCKET:new Bucket()};let now=Date.now()+86400000;
 const clock=()=>now;
 const blocked=async()=>new Response('',{status:403});
 let result=await refresh(env,blocked,clock,'scheduled');
 const firstId=result.run.id;
 while(result.run.status==='running')result=await refresh(env,blocked,clock,'scheduled');
 const read=async()=>await (await worker.fetch(new Request('https://site/api/runs'),env)).json();
 let logs=await read();assert.equal(logs.runs[0].trigger,'scheduled');assert.equal(logs.runs[0].results.length,70);assert.equal(logs.runs[0].status,'partial');assert(logs.runs[0].finishedAt);assert.equal(logs.runs[0].failed,70);
 now+=1000;const skipped=await refresh(env,blocked,clock,'manual');assert(skipped.cooldown);logs=await read();assert.equal(logs.runs[0].status,'skipped');assert.equal(logs.runs[0].trigger,'manual');
 now+=3600000;await refresh(env,blocked,clock,'test');logs=await read();assert.equal(logs.runs[0].trigger,'test');assert(logs.runs.some(r=>r.id===firstId));assert(!('groups' in logs.runs[0]));
 let state=JSON.parse(env.BUCKET.data);state.run.status='complete';env.BUCKET.data=JSON.stringify(state);
 for(let i=0;i<35;i++){now++;await refresh(env,blocked,clock,'manual');}
 assert.equal((await read()).runs.length,30);
});


test('JSON-LD ItemList anidado permite extraer producto de una categoría',()=>{
 const nested={"@type":"ItemList",itemListElement:[{"@type":"ListItem",position:1,item:{"@type":"Product",name:"LD Systems STINGER G3 POWER SET A Aktivsystem",offers:{price:"4169.00",priceCurrency:"EUR",availability:"https://schema.org/InStock"}}},{"@type":"ListItem",position:2,item:{"@type":"Product",name:"Otro producto",offers:{price:"999.00",priceCurrency:"EUR"}}}]};
 const page='<script type="application/ld+json">'+JSON.stringify(nested)+'</script>';
 const parsed=parsePrice(page,'LD Systems STINGER G3 POWER SET A Aktivsystem','www.hotsound-store.com');
 assert.equal(parsed.price,4169);assert.equal(parsed.available,true);
});
