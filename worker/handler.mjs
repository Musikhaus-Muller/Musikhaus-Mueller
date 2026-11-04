const KEY='price-snapshot-v1.json';
const ALLOWED=new Set(['www.musikhaus-mueller.de','www.thomann.de','www.kirstein.de','www.prolighting.de','www.hotsound-store.com']);
const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const normalize=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&[^;]+;/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const priceNumber=x=>{if(typeof x==='number')return x;if(typeof x!=='string')return NaN;return Number(x.includes(',')?x.replace(/\./g,'').replace(',','.'):x)};
export function parsePrice(html,expected,host){
 if(/cf-mitigated|cf-chl-|just a moment|captcha/i.test(html))throw Error('Zugriffsschutz / CAPTCHA');
 const h1=plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
 const tokens=normalize(expected.replace(/^2\s*[×x]\s*/, '')).split(' ').filter(t=>!['ld','systems','set','bundle','2','x'].includes(t));
 const matches=name=>{const n=normalize(name);const words=n.split(' ');const required=tokens.filter(t=>/\d/.test(t)||['schwarz','black','weiss','white'].includes(t));return tokens.length>0&&required.every(t=>words.includes(t))&&tokens.filter(t=>words.includes(t)).length/tokens.length>=.65};
 let candidates=[];
 function walk(x){if(!x||typeof x!=='object')return;if(Array.isArray(x)){x.forEach(walk);return}if([].concat(x['@type']||[]).includes('Product')&&matches(x.name||''))candidates.push(x);for(const v of Object.values(x))if(v&&typeof v==='object')walk(v);}
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1]))}catch{}}
 let offers=[];
 for(const p of candidates)for(const o of [].concat(p.offers||[])){if(o.priceCurrency==='EUR'&&o.price!==undefined)offers.push({price:priceNumber(o.price),available:/^(?:https?:\/\/schema.org\/)?(?:InStock|PreOrder|BackOrder)\/?$/.test(o.availability)?true:/^(?:https?:\/\/schema.org\/)?(?:OutOfStock|SoldOut|Discontinued)\/?$/.test(o.availability)?false:undefined});}
 if(!offers.length&&host==='www.prolighting.de'&&matches(h1)){
  const after=html.slice(html.search(/<h1\b/i));const m=after.match(/<[^>]+content=["']([\d.]+)["'][^>]+itemprop=["']price["'][^>]*>/i);
  if(m)offers.push({price:Number(m[1]),available:/nicht verf[uü]gbar|nicht lieferbar/i.test(after.slice(0,18000))?false:undefined});
 }
 const unique=[...new Set(offers.map(o=>o.price))];if(unique.length!==1||!Number.isFinite(unique[0])||unique[0]<=0)throw Error('Kein eindeutiger EUR-Produktpreis');
 return offers[0];
}
function sourceGroups(rows){const m=new Map();for(const r of rows)for(const [shop,o]of Object.entries(r.offers)){if(shop==='hotsound')continue;const u=new URL(o.url);if(!ALLOWED.has(u.hostname)||u.protocol!=='https:')continue;if(!m.has(o.url))m.set(o.url,{url:o.url,expected:o.sourceName||o.name,shop,refs:[]});m.get(o.url).refs.push({id:r.id,shop,multiplier:o.calculation?2:1});}return [...m.values()];}
export function applyBrowserChecks(state){
 for(const row of state.rows){const o=row.offers.mueller;if(o?.available===false&&o.fetchStatus==='Preis automatisch bestätigt'&&Date.parse(o.checkedAt)<Date.parse('2026-11-03T21:36:00Z')){delete o.available;o.availabilityNote='Verfügbarkeit erneut im Shop prüfen';}}

 for(const check of MANUAL_CHECKS){const row=state.rows.find(r=>r.id===check.rowId),o=row?.offers[check.shop];if(!o||o.url!==check.url)continue;
  if(Date.parse(check.checkedAt)>Date.parse(o.lastAttemptAt||o.checkedAt||o.priceDate+'T00:00:00Z')){if(o.price!==check.price){o.previousPrice=o.price;o.previousDate=o.priceDate;}if(o.calculation)o.calculation=`2 × ${check.price/2} € = ${check.price} €`;Object.assign(o,{price:check.price,checkedAt:check.checkedAt,lastAttemptAt:check.checkedAt,lastAttempt:check.checkedAt.slice(0,10),priceDate:check.checkedAt.slice(0,10),verifiedToday:true,available:check.available,verificationMethod:'browser',fetchStatus:'Im Browser bestätigt',evidence:check.evidence});}
  if(row.id==='r2'){row.note='Müller nennt in der Detailbeschreibung MAUI 11 G2 SAT BAG, während Thomann und Kirstein G3-Taschen nennen. Taschenmodell bei Müller nicht abschließend geklärt.';if(check.shop!=='mueller'){o.match='similar';o.note=row.note;}else{o.contents='2 × MAUI 11 G3 schwarz; 2 × Säulentasche (Detailtext: MAUI 11 G2 SAT BAG); 2 × MAUI 11 G3 SUB PC.';}}
  if(row[check.shop])row[check.shop]={...o};
 }
 return state;
}
async function load(env){if(!env.BUCKET)throw Error('Preisspeicher nicht verfügbar');const obj=await env.BUCKET.get(KEY);const state=obj?await obj.json():{rows:structuredClone(SEED),run:null,updatedAt:null};return {etag:obj?.etag,state:applyBrowserChecks(state)};}
async function save(env,state,etag){return env.BUCKET.put(KEY,JSON.stringify(state),{onlyIf:etag?{etagMatches:etag}:new Headers({'If-None-Match':'*'}),httpMetadata:{contentType:'application/json'}});}
export function toFrontendRows(items){
 const rows=new Map();
 for(const x of items||[]){
  if(!rows.has(x.legacy_id))rows.set(x.legacy_id,{id:x.legacy_id,brand:x.brand,family:x.family,name:x.configuration_name,sub:x.subtitle||'',note:x.configuration_note||'',offers:{}});
  const row=rows.get(x.legacy_id);
  const observed=x.price_observed_at||null,lastAttempt=x.last_attempt_at||null;
  const offer={
   name:x.shop_product_name||x.source_name||'',
   price:x.price===null||x.price===undefined?null:Number(x.price),
   url:x.product_url,
   contents:x.contents||'',
   match:x.match_type||'exact',
   calculation:x.calculation||null,
   note:x.offer_note||'',
   source:x.source_url||x.product_url,
   sourceName:x.source_name||x.shop_product_name||'',
   evidence:x.evidence||'',
   priceDate:observed?observed.slice(0,10):null,
   checkedAt:observed,
   lastAttempt:lastAttempt?lastAttempt.slice(0,10):null,
   lastAttemptAt:lastAttempt,
   verifiedToday:x.last_attempt_status==='success'&&Boolean(observed),
   fetchStatus:x.last_attempt_status==='success'?'Preis automatisch bestätigt':x.last_attempt_status?('Letzter Abruf: '+x.last_attempt_status+(x.last_attempt_error?' · '+x.last_attempt_error:'')):'Kein automatischer Abruf',
   verificationMethod:x.price_source_method||null
  };
  if(x.availability==='available')offer.available=true;
  if(x.availability==='unavailable')offer.available=false;
  row.offers[x.shop_slug]=offer;
  row[x.shop_slug]=offer;
 }
 return [...rows.values()].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}));
}
async function loadSupabaseCatalog(env,fetcher=fetch){
 const base=env.SUPABASE_URL,key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)return null;
 const headers={apikey:key,'content-type':'application/json'};
 if(key.startsWith('eyJ'))headers.Authorization='Bearer '+key;
 const response=await fetcher(base.replace(/\/$/,'')+'/rest/v1/frontend_offer_rows?select=*&order=legacy_id.asc,shop_slug.asc',{headers,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Supabase-Katalog HTTP '+response.status);
 return toFrontendRows(await response.json());
}
async function requireSupabaseCatalog(env){
 const rows=await loadSupabaseCatalog(env);
 if(!rows)throw Error('Supabase-Katalog nicht konfiguriert');
 return rows;
}
function supabaseHeaders(env){
 const key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
 if(!env.SUPABASE_URL||!key)throw Error('Supabase nicht konfiguriert');
 return {
  base:env.SUPABASE_URL.replace(/\/$/,''),
  headers:{
   apikey:key,
   'content-type':'application/json',
   ...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})
  }
 };
}
function mapSupabaseRun(run,results=[]){
 const trigger={schedule:'scheduled',manual:'manual',api:'unknown',import:'unknown'}[run.trigger_type]||'unknown';
 const status={running:'running',success:'complete',partial:'partial',failed:'partial'}[run.status]||run.status;
 const mappedResults=results.map(x=>({
  shop:x.offer?.shop?.slug||'unknown',
  url:x.offer?.product_url||'',
  product:x.offer?.shop_product_name||'',
  checkedAt:x.created_at||run.finished_at||run.started_at,
  status:x.status==='success'?'confirmed':'error',
  message:x.message||x.status,
  changes:[]
 }));
 const issues=mappedResults.filter(x=>x.status==='error').map(x=>({shop:x.shop,url:x.url,message:x.message}));
 return {
  id:run.id,
  trigger,
  status,
  startedAt:run.started_at,
  finishedAt:run.finished_at,
  processed:run.offers_checked||0,
  total:run.offers_total||0,
  confirmed:run.offers_updated||0,
  failed:run.offers_failed||0,
  changed:0,
  issues,
  results:mappedResults
 };
}
async function loadSupabaseRuns(env,fetcher=fetch,limit=30){
 const {base,headers}=supabaseHeaders(env);
 const runsRes=await fetcher(base+`/rest/v1/collection_runs?select=id,trigger_type,status,started_at,finished_at,offers_total,offers_checked,offers_updated,offers_failed&order=started_at.desc&limit=${limit}`,{headers,signal:AbortSignal.timeout(15000)});
 if(!runsRes.ok)throw Error('Supabase-Runs HTTP '+runsRes.status);
 const runs=await runsRes.json();
 if(!runs.length)return [];
 const ids=runs.map(r=>r.id).join(',');
 const resultsRes=await fetcher(base+`/rest/v1/collection_results?select=run_id,status,price,source_method,http_status,message,created_at,offer:offers(shop_product_name,product_url,shop:shops(slug))&run_id=in.(${ids})&order=created_at.asc`,{headers,signal:AbortSignal.timeout(15000)});
 if(!resultsRes.ok)throw Error('Supabase-Results HTTP '+resultsRes.status);
 const results=await resultsRes.json();
 const byRun=new Map();
 for(const item of results){
  if(!byRun.has(item.run_id))byRun.set(item.run_id,[]);
  byRun.get(item.run_id).push(item);
 }
 return runs.map(run=>mapSupabaseRun(run,byRun.get(run.id)||[]));
}
async function loadSupabaseStatus(env,fetcher=fetch){
 const runs=await loadSupabaseRuns(env,fetcher,1);
 return {updatedAt:runs[0]?.finishedAt||null,run:runs[0]||null};
}
function summary(s){return {updatedAt:s.updatedAt,run:s.run?{id:s.run.id,status:s.run.status,startedAt:s.run.startedAt,finishedAt:s.run.finishedAt,processed:s.run.cursor,total:s.run.total,confirmed:s.run.confirmed,failed:s.run.failed,changed:s.run.changed,issues:s.run.issues}:null};}
function logRun(run){if(!run)return null;const {groups,blocked,...entry}=run;return {...entry,trigger:run.trigger||'unknown',processed:run.cursor??0};}
function history(state){return [logRun(state.run),...(state.history||[])].filter(Boolean).sort((a,b)=>Date.parse(b.startedAt)-Date.parse(a.startedAt)).slice(0,30);}
function archive(state,entry){state.history=[entry,...(state.history||[]).filter(x=>x.id!==entry.id)].slice(0,29);}
export async function refresh(env,fetcher=fetch,clock=()=>Date.now(),trigger='unknown'){
 let {state,etag}=await load(env);const now=clock();
 if(state.leaseUntil>now)return {busy:true,...summary(state)};
 if(!state.run||state.run.status!=='running'){
  if(state.run&&now-Date.parse(state.run.startedAt)<3600000){const entry={id:crypto.randomUUID(),trigger,status:'skipped',startedAt:new Date(now).toISOString(),finishedAt:new Date(now).toISOString(),processed:0,total:0,confirmed:0,failed:0,changed:0,reason:'Wartezeit von einer Stunde: keine neue Preisabfrage gestartet.',issues:[]};archive(state,entry);if(!await save(env,state,etag))return {busy:true,...summary(state)};return {cooldown:true,logId:entry.id,...summary(state)};}
  if(state.run)archive(state,logRun(state.run));
  const groups=sourceGroups(state.rows);state.run={id:crypto.randomUUID(),trigger,results:[],status:'running',startedAt:new Date(now).toISOString(),cursor:0,total:groups.length,confirmed:0,failed:0,changed:0,issues:[],blocked:[],groups};
 }
 state.leaseUntil=now+120000;const lock=await save(env,state,etag);if(!lock)return {busy:true};
 const run=state.run;
 try{
  for(let n=0;n<3&&run.cursor<run.total;n++,run.cursor++){
   const g=run.groups[run.cursor],host=new URL(g.url).hostname;let value,error;
   try{
    if(run.blocked.includes(host))throw Error('Shop nach Zugriffssperre pausiert');
    const res=await fetcher(g.url,{redirect:'manual',signal:AbortSignal.timeout(6500),headers:{'Accept':'text/html'}});
    if(res.status===403||res.status===429){run.blocked.push(host);throw Error('Shop-Zugriff blockiert (HTTP '+res.status+')');}
    if(!res.ok)throw Error('HTTP '+res.status);
    const html=await res.text();if(html.length>5000000)throw Error('Antwort zu groß');
    value=parsePrice(html,g.expected,host);
    for(const ref of g.refs){const o=state.rows.find(r=>r.id===ref.id).offers[ref.shop],next=value.price*ref.multiplier;if(next<o.price*.5||next>o.price*2)throw Error('Große Preisänderung: manuelle Prüfung nötig');}
   }catch(e){error=e.name==='TimeoutError'?'Zeitüberschreitung':e.message;if(/CAPTCHA/.test(error))run.blocked.push(host);}
   const checkedAt=new Date(clock()).toISOString();const changes=[];
   for(const ref of g.refs){const row=state.rows.find(r=>r.id===ref.id),o=row.offers[ref.shop];o.lastAttempt=checkedAt.slice(0,10);o.lastAttemptAt=checkedAt;
    if(error){o.verifiedToday=false;o.fetchStatus=error;}
    else{const next=Math.round(value.price*ref.multiplier*100)/100;if(o.price!==next){changes.push({rowId:row.id,product:o.name,previousPrice:o.price,price:next});run.changed++;o.previousPrice=o.price;o.previousDate=o.priceDate;}o.price=next;o.priceDate=checkedAt.slice(0,10);o.checkedAt=checkedAt;o.verifiedToday=true;o.fetchStatus='Preis automatisch bestätigt';o.evidence='Direktabruf: eindeutiger EUR-Produktpreis. Lieferumfang zuletzt manuell geprüft am 03.11.2026.';if(value.available!==undefined)o.available=value.available;if(ref.multiplier===2)o.calculation=`2 × ${value.price} € = ${next} €`;}
    if(row[ref.shop])row[ref.shop]={...o};
   }
   (run.results||=[]).push({shop:g.shop,url:g.url,product:g.expected,checkedAt,status:error?'error':'confirmed',message:error||'Preis bestätigt',changes});
   if(error){run.failed++;run.issues.push({shop:g.shop,url:g.url,message:error});}else run.confirmed++;
  }
  if(run.cursor>=run.total){run.status=run.failed?'partial':'complete';run.finishedAt=new Date(clock()).toISOString();state.updatedAt=run.finishedAt;}
  state.leaseUntil=0;if(!await save(env,state,lock.etag))throw Error('Konflikt beim Speichern; Ergebnis nicht übernommen');return summary(state);
 }catch(e){throw e;}
}
const toolList=[{name:'refresh_prices',description:'Actualiza el siguiente lote de hasta 3 fuentes de precios. Repetir mientras run.status sea running. Bloqueos de tiendas conservan el precio previo. No ejecutar de nuevo si cooldown es true.',inputSchema:{type:'object',properties:{},additionalProperties:false}},{name:'price_update_status',description:'Lee el estado persistido y las incidencias de la actualización.',inputSchema:{type:'object',properties:{},additionalProperties:false}}];
export default{async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;
 try{
  if(path==='/mcp'&&request.method==='POST'){
   const q=await request.json();let result;
   if(q.method==='server/discover')result={supportedVersions:['2026-07-28'],capabilities:{tools:{}}};
   else if(q.method==='initialize')result={protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'PA Radar Updates',version:'1.0.0'}};
   else if(q.method==='tools/list')result={tools:toolList};
   else if(q.method==='tools/call'){try{const v=q.params.name==='refresh_prices'?await refresh(env):q.params.name==='price_update_status'?summary((await load(env)).state):null;if(!v)throw Error('Unknown tool');result={content:[{type:'text',text:JSON.stringify(v)}]};}catch(e){result={isError:true,content:[{type:'text',text:e.message}]};}}
   else if(q.method?.startsWith('notifications/'))return new Response(null,{status:204});
   else return json({jsonrpc:'2.0',id:q.id,error:{code:-32601,message:'Method not found'}});
   return json({jsonrpc:'2.0',id:q.id,result});
  }
  if(path==='/api/refresh'&&request.method==='POST'){
   if(request.headers.get('origin')!==url.origin||request.headers.get('x-pa-action')!=='refresh')return json({error:'Origen no autorizado'},403);
   const requested=request.headers.get('x-pa-trigger');const trigger=['scheduled','manual','test'].includes(requested)?requested:'unknown';return json(await refresh(env,fetch,()=>Date.now(),trigger));
  }
  if(path==='/api/catalog'){
   const rows=await requireSupabaseCatalog(env);
   return json({source:'supabase',rows});
  }
  if(path==='/api/runs')return json({timezone:'Europe/Madrid',retention:30,runs:await loadSupabaseRuns(env)});
  if(path==='/api/status')return json(await loadSupabaseStatus(env));
  if(path==='/data.json')return json(await requireSupabaseCatalog(env));
  if(path==='/data.js'){
   const rows=await requireSupabaseCatalog(env);
   return new Response('window.BUNDLES='+JSON.stringify(rows)+';',{headers:{'content-type':'text/javascript','cache-control':'no-store'}});
  }
  const key=path==='/'?'/index.html':path;if(ASSETS[key])return new Response(ASSETS[key],{headers:{'content-type':key.endsWith('.csv')?'text/csv; charset=utf-8':key.endsWith('.json')?'application/json':key.endsWith('.css')?'text/css':key.endsWith('.js')?'text/javascript':'text/html','cache-control':'no-cache'}});
  return json({error:'Not found'},404);
 }catch(e){return json({error:e.message},503);}
}};
