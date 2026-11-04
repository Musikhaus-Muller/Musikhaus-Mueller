const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const normalize=s=>String(s).toLowerCase().replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&[^;]+;/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const plain=s=>s.replace(/&nbsp;|&#160;/gi,' ').replace(/&euro;|&#8364;|&#x20ac;/gi,'€').replace(/&amp;/gi,'&').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
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
  const after=html.slice(html.search(/<h1\b/i));
  let price;
  for(const tag of after.match(/<[^>]+>/g)||[]){
   if(!/itemprop=["']price["']/i.test(tag))continue;
   const m=tag.match(/content=["']([\d.,]+)["']/i);
   if(m){price=priceNumber(m[1]);break}
  }
  if(!Number.isFinite(price)){
   const vatIndex=after.search(/inkl\.?\s*MwSt\.?/i);
   const visible=plain(vatIndex>=0?after.slice(0,vatIndex):after.slice(0,12000));
   const money=[...visible.matchAll(/\b\d{1,3}(?:\.\d{3})*,\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/gi)];
   if(money.length)price=priceNumber(money.at(-1)[0].replace(/\s*(?:€|EUR)\s*$/i,''));
  }
  if(Number.isFinite(price))offers.push({price,available:/nicht verf[uü]gbar|nicht lieferbar/i.test(after.slice(0,18000))?false:undefined});
 }
 const unique=[...new Set(offers.map(o=>o.price))];if(unique.length!==1||!Number.isFinite(unique[0])||unique[0]<=0)throw Error('Kein eindeutiger EUR-Produktpreis');
 return offers[0];
}
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
export function mapSupabaseRun(run,results=[]){
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
const toolList=[
 {name:'refresh_prices',description:'Devuelve el estado actual de la recolección. La actualización de precios se ejecuta mediante el collector programado en GitHub Actions.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'price_update_status',description:'Lee desde Supabase el estado y las incidencias de la última recolección.',inputSchema:{type:'object',properties:{},additionalProperties:false}}
];
export default{async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;
 try{
  if(path==='/mcp'&&request.method==='POST'){
   const q=await request.json();let result;
   if(q.method==='server/discover')result={supportedVersions:['2026-07-28'],capabilities:{tools:{}}};
   else if(q.method==='initialize')result={protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'PA Radar Updates',version:'1.0.0'}};
   else if(q.method==='tools/list')result={tools:toolList};
   else if(q.method==='tools/call'){try{
    const status=await loadSupabaseStatus(env);
    const v=q.params.name==='refresh_prices'
      ?{...status,collector:'github-actions',message:'Preisaktualisierungen werden durch den Collector/GitHub Actions ausgeführt.'}
      :q.params.name==='price_update_status'?status:null;
    if(!v)throw Error('Unknown tool');
    result={content:[{type:'text',text:JSON.stringify(v)}]};
   }catch(e){result={isError:true,content:[{type:'text',text:e.message}]};}}
   else if(q.method?.startsWith('notifications/'))return new Response(null,{status:204});
   else return json({jsonrpc:'2.0',id:q.id,error:{code:-32601,message:'Method not found'}});
   return json({jsonrpc:'2.0',id:q.id,result});
  }
  if(path==='/api/refresh'&&request.method==='POST'){
   return json({error:'Endpoint retirado',collector:'github-actions',message:'La actualización de precios se ejecuta mediante el collector programado.'},410);
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
