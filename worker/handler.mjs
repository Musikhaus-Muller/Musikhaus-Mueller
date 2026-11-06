import { classifyResultHealth, deriveRunHealth } from '../collector/result-health.mjs';

const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const normalize=s=>String(s).toLowerCase().replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&[^;]+;/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const plain=s=>s.replace(/&nbsp;|&#160;/gi,' ').replace(/&euro;|&#8364;|&#x20ac;/gi,'€').replace(/&szlig;|&#0*223;|&#x0*df;/gi,'ß').replace(/&amp;/gi,'&').replace(/<\/(?:div|p|li|h\d)\s*>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/[ \t]+/g,' ').replace(/\n\s+/g,'\n').trim();
const priceNumber=x=>{if(typeof x==='number')return x;if(typeof x!=='string')return NaN;return Number(x.includes(',')?x.replace(/\./g,'').replace(',','.'):x)};
function validateProlightingMaui28G3Bundle(html,expected,contents){
 const normalizedExpected=normalize(expected);
 if(!/maui 28 g3/.test(normalizedExpected)||!/\btaschen/.test(normalizedExpected))return;
 if(!contents)throw Error('Bundle composition unavailable; cannot verify complete MAUI 28 G3 cart');
 const expectedPieces=String(contents).split(/[;.\n]+/).map(value=>value.trim()).filter(Boolean).map(value=>{
  const match=value.match(/^(\d+)\s*[×x]\s*(.+)$/);
  if(!match)throw Error('Bundle composition has an unrecognized quantity');
  const quantity=Number(match[1]);
  if(!Number.isSafeInteger(quantity)||quantity<=0)throw Error('Bundle composition has an invalid quantity');
  const name=normalize(match[2]);
  const kind=/maui 28 g3/.test(name)?'system':/sat bag|saulentasche|column bag/.test(name)?'sat_bag':/sub pc|subwooferhulle|sub cover/.test(name)?'sub_cover':null;
  if(!kind)throw Error(`Bundle composition contains an unclassified component: ${match[2]}`);
  return {quantity,kind,name};
 });
 const requiredKinds=['system','sat_bag','sub_cover'];
 if(requiredKinds.some(kind=>!expectedPieces.some(piece=>piece.kind===kind))){
  throw Error('Bundle composition does not specify the MAUI 28 G3 system, SAT BAG, and SUB PC');
 }
 const headings=[...html.matchAll(/set\s+besteht\s+aus/gi)];
 const lastHeading=headings.at(-1)?.index??-1;
 const candidateListStart=lastHeading>=0?html.indexOf('<ul',lastHeading):-1;
 const listStart=candidateListStart>=lastHeading&&candidateListStart-lastHeading<=12000?candidateListStart:-1;
 const listEnd=listStart>=0?html.indexOf('</ul>',listStart):-1;
 let setList='';
 let lines=[];
 let compositionEnd=-1;
 if(listStart>=0&&listEnd>=0){
  setList=html.slice(listStart,listEnd+5);
  compositionEnd=listEnd+5;
  lines=[...setList.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(match=>plain(match[1]));
 }else{
  const configurators=[...html.matchAll(/<div\b[^>]*class=["']([^"']*)["'][^>]*>/gi)]
   .filter(match=>match[1].split(/\s+/).includes('artd-configurator'));
  const start=configurators.at(-1)?.index??-1;
  if(start>=0){
   let depth=0;
   for(const tag of html.matchAll(/<\/?div\b[^>]*>/gi)){
    if(tag.index<start)continue;
    depth+=tag[0].startsWith('</')?-1:1;
    if(depth===0){compositionEnd=tag.index+tag[0].length;break}
   }
   if(compositionEnd>start)setList=html.slice(start,compositionEnd);
   lines=[...setList.matchAll(/<div\b[^>]*class=["'][^"']*\bartd-configurator-element-selection-title\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)].map(match=>plain(match[1]));
  }
 }
 if(!lines.length)throw Error('Official page does not expose a readable set composition');
 const quantityOf=line=>Number(line.match(/^\s*(\d+)\s*[×x]\s*/)?.[1]||1);
 const isSystemLine=line=>{
  const name=normalize(line);
  return name.includes('maui')&&name.includes('28')&&name.includes('g3')&&!/sat bag|sub pc|saulentasche|subwooferhulle/.test(name);
 };
 const actualQuantity=(kind)=>{
  const matches=lines.filter(line=>{
   const name=normalize(line);
   if(kind==='system')return isSystemLine(line);
   if(kind==='sat_bag')return /sat bag|saulentasche|column bag/.test(name);
   return /sub pc|subwooferhulle|sub cover/.test(name);
  });
  return matches.reduce((total,line)=>total+quantityOf(line),0);
 };
 const productMultiplier=Number(normalizedExpected.match(/\b(\d+)\s*x\s*maui 28 g3\b/)?.[1]||1);
 if(!Number.isSafeInteger(productMultiplier)||productMultiplier<=0)throw Error('Bundle title has an invalid system quantity');
 for(const kind of requiredKinds){
  const expectedQuantity=expectedPieces.filter(piece=>piece.kind===kind).reduce((total,piece)=>total+piece.quantity,0);
  const foundQuantity=actualQuantity(kind);
  if(foundQuantity*productMultiplier!==expectedQuantity){
   throw Error(`Official bundle contents confirm ${foundQuantity} ${kind} components per unit; expected ${expectedQuantity/productMultiplier} per unit`);
  }
 }
 const expectedSystem=expectedPieces.find(piece=>piece.kind==='system');
 if(/schwarz|black/.test(expectedSystem.name)){
  const systemLines=lines.filter(isSystemLine);
  const accessoryDetails=html.indexOf('LD Systems MAUI 28 G3 SUB PC',compositionEnd);
  const setProductDetails=plain(html.slice(compositionEnd,accessoryDetails>compositionEnd?accessoryDetails:undefined));
  const systemColor=setProductDetails.match(/\bFarbe\s*:\s*(Schwarz|Weiß|Weiss|Black|White)\b/i)?.[1]||'';
  if(systemLines.some(line=>/\b(?:weiss|white)\b/.test(normalize(line)))||(!systemLines.some(line=>/\b(?:schwarz|black)\b/.test(normalize(line)))&&!['schwarz','black'].includes(normalize(systemColor)))){
   throw Error('Official bundle contents do not confirm the required black MAUI 28 G3 system');
  }
 }
}
export function parsePrice(html,expected,host,expectedContents){
 if(/cf-mitigated|cf-chl-|just a moment|captcha/i.test(html))throw Error('Zugriffsschutz / CAPTCHA');
 if(host==='www.prolighting.de')validateProlightingMaui28G3Bundle(html,expected,expectedContents);
 const h1=plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
 const tokens=normalize(expected.replace(/^2\s*[×x]\s*/, '')).split(' ').filter(t=>!['ld','systems','set','bundle','2','x'].includes(t));
 const matches=name=>{const n=normalize(name);const words=n.split(' ');const required=tokens.filter(t=>/\d/.test(t)||['schwarz','black','weiss','white'].includes(t));return tokens.length>0&&required.every(t=>words.includes(t))&&tokens.filter(t=>words.includes(t)).length/tokens.length>=.65};
 const colors=['schwarz','black','weiss','white'];
 const expectedColors=tokens.filter(t=>colors.includes(t));
 const colorMatches=value=>{
  const actual=normalize(value);
  return expectedColors.length>0&&expectedColors.every(color=>actual.split(' ').includes(color==='black'?'schwarz':color==='white'?'weiss':color));
 };
 const productPageMatches=()=>{
  if(matches(h1))return true;
  if(!expectedColors.length)return false;
  const headingWords=normalize(h1).split(' ');
  const headingColors=headingWords.filter(t=>colors.includes(t));
  if(headingColors.length&&!colorMatches(headingColors.join(' ')))return false;
  const nonColorTokens=tokens.filter(t=>!colors.includes(t));
  const required=nonColorTokens.filter(t=>/\d/.test(t));
  if(!required.every(t=>headingWords.includes(t)))return false;
  const headingScore=nonColorTokens.filter(t=>headingWords.includes(t)).length+expectedColors.length;
  if(!tokens.length||headingScore/tokens.length<.65)return false;
  const listedColor=html.match(/<li\b[^>]*>\s*Farbe\s*:\s*([^<]+)/i)?.[1]||'';
  return colorMatches(plain(listedColor));
 };
 let candidates=[];
 function walk(x){if(!x||typeof x!=='object')return;if(Array.isArray(x)){x.forEach(walk);return}if([].concat(x['@type']||[]).includes('Product')&&matches(x.name||''))candidates.push(x);for(const v of Object.values(x))if(v&&typeof v==='object')walk(v);}
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1]))}catch{}}
 let offers=[];
 for(const p of candidates)for(const o of [].concat(p.offers||[])){const price=priceNumber(o.price);if(o.priceCurrency==='EUR'&&Number.isFinite(price)&&price>0)offers.push({price,available:/^(?:https?:\/\/schema.org\/)?(?:InStock|PreOrder|BackOrder)\/?$/.test(o.availability)?true:/^(?:https?:\/\/schema.org\/)?(?:OutOfStock|SoldOut|Discontinued)\/?$/.test(o.availability)?false:undefined});}
 if(!offers.length&&host==='www.prolighting.de'&&productPageMatches()){
  const buybox=html.match(/<div\b(?=[^>]*\bid=["']artd-buybox["'])[^>]*>/i);
  const offerStart=buybox?.index??html.search(/<h1\b/i);
  const after=html.slice(offerStart<0?0:offerStart);
  const validUntil=after.search(/itemprop=["']priceValidUntil["']/i);
  const offerMarkup=after.slice(0,validUntil>=0?validUntil:12000);
  const itempropPrices=[...offerMarkup.matchAll(/<[^>]*itemprop=["']price["'][^>]*>/gi)]
   .map(m=>priceNumber(m[0].match(/content=["']([\d.,]+)["']/i)?.[1]))
   .filter(value=>Number.isFinite(value)&&value>0);
  const uniqueItempropPrices=[...new Set(itempropPrices)];
  const itempropAmbiguous=uniqueItempropPrices.length>1;
  let price=uniqueItempropPrices.length===1?uniqueItempropPrices[0]:undefined;
  if(!Number.isFinite(price)&&!itempropAmbiguous){
   const vatIndex=after.search(/inkl\.?\s*MwSt\.?/i);
   const visible=plain(vatIndex>=0?after.slice(0,vatIndex):after.slice(0,12000));
   const money=[...visible.matchAll(/\b\d{1,3}(?:\.\d{3})*,\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/gi)]
    .filter(m=>{
     const lineStart=visible.lastIndexOf('\n',m.index)+1;
     const lineEnd=visible.indexOf('\n',m.index);
     const line=visible.slice(lineStart,lineEnd<0?visible.length:lineEnd);
     return !/uvp|retail price|finanzierung|\/\s*monat|\brate\b/i.test(line);
    });
   if(money.length)price=priceNumber(money.at(-1)[0].replace(/\s*(?:€|EUR)\s*$/i,''));
  }
  if(Number.isFinite(price)&&price>0)offers.push({price,available:/nicht verf[uü]gbar|nicht lieferbar/i.test(after.slice(0,18000))?false:undefined});
 }
 if(!offers.length&&host==='www.prolighting.de'){
  for(const m of html.matchAll(/item_name\s*:\s*['"]([^'"]+)['"][\s\S]{0,1800}?\bprice\s*:\s*([0-9]+(?:\.[0-9]+)?)/gi)){
   if(!matches(m[1]))continue;
   const net=priceNumber(m[2]);
   const gross=Math.round(net*1.19*100)/100;
   if(Number.isFinite(gross)&&gross>0){offers.push({price:gross});break}
  }
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
  const observedTimestamp=observed?Date.parse(observed):NaN;
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
   priceObservedAt:observed,
   priceAgeDays:Number.isFinite(observedTimestamp)?Math.max(0,Math.floor((Date.now()-observedTimestamp)/86400000)):null,
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
 const hasResults=results.length>0;
 const calculated=deriveRunHealth(results);
 const storedCounts=run.metadata?.result_counts;
 const counts=hasResults?calculated:{
  checked:storedCounts?.checked??run.offers_checked??0,
  updated:storedCounts?.updated??run.offers_updated??0,
  preserved:storedCounts?.preserved??0,
  hardFailed:storedCounts?.hard_failed??run.offers_failed??0,
  preservedBlocked:storedCounts?.preserved_blocked??0,
  preservedCaptcha:storedCounts?.preserved_captcha??0,
  preservedNotFound:storedCounts?.preserved_not_found??0,
  preservedParseError:storedCounts?.preserved_parse_error??0,
  networkErrors:storedCounts?.network_error??0,
  unknownFailures:storedCounts?.unknown_failure??0,
  status:run.status,
  healthStatus:run.metadata?.health_status||null,
  resultCounts:storedCounts||null
 };
 const status=run.status==='running'?run.status:hasResults?calculated.status:run.status;
 const mappedResults=results.map(x=>({
  shop:x.offer?.shop?.slug||'unknown',
  url:x.offer?.product_url||'',
  product:x.offer?.shop_product_name||'',
  checkedAt:x.created_at||run.finished_at||run.started_at,
  status:x.status==='success'?'confirmed':classifyResultHealth(x.status)==='hard_failed'?'error':'preserved',
  sourceStatus:x.status,
  message:x.message||x.status,
  changes:[]
 }));
 const issues=mappedResults.filter(x=>x.status==='error').map(x=>({shop:x.shop,url:x.url,sourceStatus:x.sourceStatus,message:x.message}));
 const warnings=mappedResults.filter(x=>x.status==='preserved').map(x=>({shop:x.shop,url:x.url,sourceStatus:x.sourceStatus,message:x.message}));
 const shops=[...mappedResults.reduce((groups,result)=>{
  const group=groups.get(result.shop)||{shop:result.shop,total:0,confirmed:0,preserved:0,failed:0,preservedBlocked:0,preservedCaptcha:0,preservedNotFound:0,preservedParseError:0};
  group.total++;
  if(result.status==='confirmed')group.confirmed++;
  else if(result.status==='preserved'){
   group.preserved++;
   if(result.sourceStatus==='blocked')group.preservedBlocked++;
   else if(result.sourceStatus==='captcha')group.preservedCaptcha++;
   else if(result.sourceStatus==='not_found')group.preservedNotFound++;
   else if(result.sourceStatus==='parse_error')group.preservedParseError++;
  }else group.failed++;
  groups.set(result.shop,group);
  return groups;
 },new Map()).values()].map(shop=>({
  ...shop,
  status:shop.failed===0?(shop.preserved>0?'success_with_preserved':'success'):(shop.confirmed+shop.preserved>0?'partial':'failed')
 }));
 return {
  id:run.id,
  trigger,
  status,
  phase:run.metadata?.lifecycle||null,
  reason:run.metadata?.error||run.metadata?.finalized_reason||null,
  startedAt:run.started_at,
  finishedAt:run.finished_at,
  processed:counts.checked,
  total:run.offers_total||0,
  confirmed:counts.updated,
  preserved:counts.preserved,
  failed:counts.hardFailed,
  healthStatus:counts.healthStatus||run.metadata?.health_status||null,
  resultCounts:counts.resultCounts,
  changed:0,
  shops,
  issues,
  warnings,
  results:mappedResults
 };
}
async function loadSupabaseRuns(env,fetcher=fetch,limit=30){
 const {base,headers}=supabaseHeaders(env);
 const runsRes=await fetcher(base+`/rest/v1/collection_runs?select=id,trigger_type,status,started_at,finished_at,offers_total,offers_checked,offers_updated,offers_failed,metadata&order=started_at.desc&limit=${limit}`,{headers,signal:AbortSignal.timeout(15000)});
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
 return {updatedAt:runs[0]?.finishedAt||runs[0]?.startedAt||null,run:runs[0]||null};
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
   return json({error:'Endpoint retirado',collector:'github-actions',message:'Las actualizaciones manuales se ejecutan únicamente desde GitHub Actions.'},410);
  }
  if(path==='/api/updates/manual'&&request.method==='POST')return json({error:'Endpoint retirado',collector:'github-actions',message:'Las actualizaciones manuales están disponibles solo para administradores mediante GitHub Actions.'},410);
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
