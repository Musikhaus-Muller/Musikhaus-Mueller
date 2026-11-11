import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { articleNumberFromMusicStoreUrl, parseMusicStoreArticleCatalog } from './musicstore-article-catalog.mjs';

const TIMEOUT_MS=15000;
const USER_AGENT='PA-Bundle-Comparator/2.1 Music Store exact Art.-Nr. shadow';

function safeError(value){
  return String(value?.message || value || '').replace(/\s+/g,' ').trim().slice(0,500);
}

function isOfficialMusicStoreUrl(url){
  try{
    const host=new URL(url).hostname.toLowerCase();
    return host==='www.musicstore.de' || host==='musicstore.de';
  }catch{
    return false;
  }
}

async function fetchPage(url,{fetchImpl=fetch,cache=new Map()}={}){
  if(cache.has(url)) return cache.get(url);
  const promise=(async()=>{
    try{
      const response=await fetchImpl(url,{
        redirect:'follow',
        signal:AbortSignal.timeout(TIMEOUT_MS),
        headers:{
          Accept:'text/html,application/xhtml+xml',
          'Accept-Language':'de-DE,de;q=0.9,en;q=0.6',
          'User-Agent':USER_AGENT
        }
      });
      const html=response.ok ? await response.text() : '';
      return {ok:response.ok,status:response.status,finalUrl:response.url || url,html};
    }catch(error){
      return {ok:false,status:null,finalUrl:url,html:'',networkError:safeError(error)};
    }
  })();
  cache.set(url,promise);
  return promise;
}

function failureForHttp(page){
  if(page.networkError) return {decision:'network_error',error:page.networkError};
  if(page.status===403 || page.status===429) return {decision:'blocked',error:`HTTP ${page.status}`};
  if(page.status===404 || page.status===410) return {decision:'not_found',error:`HTTP ${page.status}`};
  return {decision:'network_error',error:`HTTP ${page.status}`};
}

function parserDecision(error){
  const message=safeError(error);
  if(/Art\.-Nr\. (?:not found|is required|Ambiguous)/i.test(message)){
    return {decision:'article_number_mismatch',error:message};
  }
  if(/identity mismatch/i.test(message)){
    return {decision:'identity_mismatch',error:message};
  }
  if(/Invalid Music Store catalog price/i.test(message)){
    return {decision:'invalid_price',error:message};
  }
  return {decision:'parse_error',error:message};
}

export async function evaluateMusicStoreTarget(target,{
  fetchImpl=fetch,
  cache=new Map(),
  parseImpl=parseMusicStoreArticleCatalog
}={}){
  const articleNumber=target.articleNumber || articleNumberFromMusicStoreUrl(target.url);
  const base={
    source_url:target.url,
    expected_name:target.expectedName,
    article_number:articleNumber,
    http_status:null,
    identity_valid:false,
    article_number_valid:false,
    price_valid:false,
    unit_price:null,
    total_price:null
  };

  if(!isOfficialMusicStoreUrl(target.url)){
    return {...base,decision:'identity_mismatch',error:'Non-official Music Store URL'};
  }
  if(!articleNumber){
    return {...base,decision:'article_number_mismatch',error:'Music Store Art.-Nr. missing from exact URL'};
  }

  const page=await fetchPage(target.url,{fetchImpl,cache});
  if(!page.ok){
    const failed=failureForHttp(page);
    return {...base,source_url:page.finalUrl,http_status:page.status,...failed};
  }

  let parsed;
  try{
    parsed=parseImpl(page.html,{articleNumber,expectedName:target.expectedName});
  }catch(error){
    const failed=parserDecision(error);
    return {...base,source_url:page.finalUrl,http_status:page.status,...failed};
  }

  if(parsed.articleNumber!==articleNumber){
    return {
      ...base,
      source_url:page.finalUrl,
      http_status:page.status,
      decision:'article_number_mismatch',
      error:`Parser returned ${parsed.articleNumber || 'no Art.-Nr.'}; expected ${articleNumber}`
    };
  }

  const price=Number(parsed.price);
  if(!Number.isFinite(price) || price<=0){
    return {
      ...base,
      source_url:page.finalUrl,
      http_status:page.status,
      identity_valid:true,
      article_number_valid:true,
      decision:'invalid_price',
      error:'Non-positive or invalid EUR price'
    };
  }

  return {
    ...base,
    source_url:page.finalUrl,
    http_status:page.status,
    identity_valid:true,
    article_number_valid:true,
    price_valid:true,
    unit_price:price,
    total_price:price,
    available:parsed.available,
    decision:'refreshable_shadow',
    source_method:parsed.sourceMethod || 'musicstore_public_catalog_article_number'
  };
}

function baseOfferRow(row,offer){
  return {
    reference:row.id,
    url:offer.url,
    expected_name:offer.name,
    article_number:articleNumberFromMusicStoreUrl(offer.url),
    previous_price:Number(offer.price),
    previous_price_date:offer.priceDate || null,
    contents:offer.contents || null,
    calculation:offer.calculation || null,
    collection_disabled:offer.collectionDisabled===true
  };
}

async function evaluateComponentOffer(row,offer,options){
  const base=baseOfferRow(row,offer);
  const details=Array.isArray(offer.componentDetails)?offer.componentDetails:[];
  if(!details.length){
    return {
      ...base,
      source_url:null,
      http_status:null,
      identity_valid:false,
      article_number_valid:false,
      price_valid:false,
      unit_price:null,
      multiplier:null,
      total_price:null,
      decision:'incomplete_recipe',
      error:'collection_disabled offer has no explicit versioned componentDetails recipe'
    };
  }

  const components=[];
  for(const component of details){
    const quantity=Number(component.quantity);
    if(!Number.isSafeInteger(quantity) || quantity<=0 || !component.url || !component.name){
      return {
        ...base,
        source_url:null,
        http_status:null,
        identity_valid:false,
        article_number_valid:false,
        price_valid:false,
        unit_price:null,
        multiplier:null,
        total_price:null,
        decision:'incomplete_recipe',
        error:`Invalid explicit component recipe for ${component.name || component.url || 'unknown component'}`,
        components
      };
    }

    const articleNumber=articleNumberFromMusicStoreUrl(component.url);
    if(!articleNumber){
      return {
        ...base,
        source_url:component.url,
        http_status:null,
        identity_valid:false,
        article_number_valid:false,
        price_valid:false,
        unit_price:null,
        multiplier:null,
        total_price:null,
        decision:'incomplete_recipe',
        error:`Component ${component.name} has no exact Art.-Nr. URL`,
        components
      };
    }

    const result=await evaluateMusicStoreTarget({
      url:component.url,
      expectedName:component.name,
      articleNumber
    },options);

    components.push({
      name:component.name,
      url:component.url,
      article_number:articleNumber,
      quantity,
      ...result
    });

    if(result.decision!=='refreshable_shadow'){
      return {
        ...base,
        source_url:result.source_url,
        http_status:result.http_status,
        identity_valid:false,
        article_number_valid:false,
        price_valid:false,
        unit_price:null,
        multiplier:null,
        total_price:null,
        decision:result.decision,
        error:`component ${component.name}: ${result.error || result.decision}`,
        components
      };
    }
  }

  let totalCents=0;
  for(const component of components){
    const cents=Math.round(Number(component.unit_price)*100);
    if(!Number.isSafeInteger(cents) || cents<=0){
      return {
        ...base,
        source_url:component.source_url,
        http_status:component.http_status,
        identity_valid:true,
        article_number_valid:true,
        price_valid:false,
        unit_price:null,
        multiplier:null,
        total_price:null,
        decision:'invalid_price',
        error:`Invalid component price for ${component.name}`,
        components
      };
    }
    totalCents += cents*component.quantity;
  }

  if(!Number.isSafeInteger(totalCents) || totalCents<=0){
    return {
      ...base,
      source_url:null,
      http_status:200,
      identity_valid:true,
      article_number_valid:true,
      price_valid:false,
      unit_price:null,
      multiplier:null,
      total_price:null,
      decision:'invalid_price',
      error:'Invalid component cart total',
      components
    };
  }

  return {
    ...base,
    source_url:null,
    http_status:200,
    identity_valid:true,
    article_number_valid:true,
    price_valid:true,
    unit_price:null,
    multiplier:null,
    total_price:totalCents/100,
    decision:'refreshable_shadow',
    source_method:'musicstore_public_catalog_article_number_components',
    components
  };
}

export async function evaluateMusicStoreOffer(row,{
  fetchImpl=fetch,
  cache=new Map(),
  parseImpl=parseMusicStoreArticleCatalog
}={}){
  const offer=row?.offers?.musicstore;
  if(!offer) throw new Error(`Reference ${row?.id || 'unknown'} has no Music Store offer`);
  const options={fetchImpl,cache,parseImpl};

  if(offer.collectionDisabled===true){
    return evaluateComponentOffer(row,offer,options);
  }

  const base=baseOfferRow(row,offer);
  const result=await evaluateMusicStoreTarget({
    url:offer.url,
    expectedName:offer.name,
    articleNumber:base.article_number
  },options);

  if(result.decision!=='refreshable_shadow'){
    return {...base,multiplier:null,...result};
  }

  const calculation=String(offer.calculation || '');
  const multiplierMatch=calculation.match(/^\s*(\d+)\s*[×x]/);
  const multiplier=multiplierMatch?Number(multiplierMatch[1]):1;
  if(!Number.isSafeInteger(multiplier) || multiplier<=0){
    return {
      ...base,
      ...result,
      multiplier,
      price_valid:false,
      total_price:null,
      decision:'invalid_price',
      error:'Invalid offer multiplier'
    };
  }

  const unitCents=Math.round(Number(result.unit_price)*100);
  const totalCents=unitCents*multiplier;
  if(!Number.isSafeInteger(totalCents) || totalCents<=0){
    return {
      ...base,
      ...result,
      multiplier,
      price_valid:false,
      total_price:null,
      decision:'invalid_price',
      error:'Offer total exceeds safe EUR precision'
    };
  }

  return {
    ...base,
    ...result,
    multiplier,
    total_price:totalCents/100
  };
}

export async function buildMusicStoreShadowReport({
  seed,
  executionEnvironment='local',
  fetchImpl=fetch,
  parseImpl=parseMusicStoreArticleCatalog
}={}){
  if(!Array.isArray(seed)) throw new Error('seed array is required');
  if(!['local','github','self_hosted'].includes(executionEnvironment)){
    throw new Error('execution_environment must be local, github, or self_hosted');
  }

  const rows=[];
  const cache=new Map();
  for(const row of seed.filter(item=>item?.offers?.musicstore)){
    rows.push(await evaluateMusicStoreOffer(row,{fetchImpl,cache,parseImpl}));
  }

  const count=decision=>rows.filter(row=>row.decision===decision).length;
  const refreshable=count('refreshable_shadow');
  return {
    execution_environment:executionEnvironment,
    writes:false,
    observed_at:new Date().toISOString(),
    rows,
    summary:{
      total:rows.length,
      refreshable,
      preserved:rows.length-refreshable,
      blocked:count('blocked'),
      not_found:count('not_found'),
      article_number_mismatch:count('article_number_mismatch'),
      identity_invalid:count('identity_mismatch'),
      invalid_price:count('invalid_price'),
      parse_error:count('parse_error'),
      network_error:count('network_error'),
      incomplete_recipe:count('incomplete_recipe')
    }
  };
}

function argValue(name,fallback){
  const prefix=`--${name}=`;
  const raw=process.argv.slice(2).find(arg=>arg.startsWith(prefix));
  return raw?raw.slice(prefix.length):fallback;
}

if(process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]){
  const seed=JSON.parse(await fs.readFile(new URL('../web/seed.json',import.meta.url),'utf8'));
  const executionEnvironment=argValue('execution-environment',process.env.COLLECT_EXECUTION_ENV || 'local');
  const report=await buildMusicStoreShadowReport({seed,executionEnvironment});
  console.log(JSON.stringify(report,null,2));
}
