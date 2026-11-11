import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parsePrice } from '../worker/handler.mjs';
import { applyOfferMultiplier, classifyError, classifyHttpStatus, multiplierFor } from './pricing.mjs';

const USER_AGENT='PA-Bundle-Comparator/2.1 Thomann freshness shadow';
const TIMEOUT_MS=15000;

function safeError(value){
  return String(value?.message || value || '').replace(/\s+/g,' ').trim().slice(0,500);
}

function normalize(value){
  return String(value || '').toLowerCase()
    .replace(/ß/g,'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

function headingFromHtml(html){
  return String(html || '').match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim() || '';
}

function likelyIdentityMismatch(html, expectedName){
  const heading=normalize(headingFromHtml(html));
  if(!heading) return false;
  const expected=normalize(String(expectedName || '').replace(/^\s*\d+\s*[×x]\s*/,''));
  const headingWords=new Set(heading.split(' '));
  const hardTokens=expected.split(' ').filter(token =>
    /\d/.test(token) || ['pro','bt','mix','g2','g3','g4x','black','white','schwarz','weiss'].includes(token)
  );
  const aliases={black:['schwarz'],schwarz:['black'],white:['weiss'],weiss:['white']};
  return hardTokens.some(token => {
    if(headingWords.has(token)) return false;
    return !(aliases[token] || []).some(alias=>headingWords.has(alias));
  });
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

function failedDecision(page){
  if(page.networkError) return {decision:'network_error',error:page.networkError};
  if(page.status===429 || page.status===403) return {decision:'blocked',error:`HTTP ${page.status}`};
  if(page.status===404 || page.status===410) return {decision:'not_found',error:`HTTP ${page.status}`};
  const classified=page.status===null ? 'network_error' : classifyHttpStatus(page.status);
  return {decision:classified==='blocked'?'blocked':classified==='not_found'?'not_found':'network_error',error:`HTTP ${page.status}`};
}

export async function evaluateThomannTarget(target,{
  fetchImpl=fetch,
  cache=new Map(),
  parsePriceImpl=parsePrice
}={}){
  const page=await fetchPage(target.url,{fetchImpl,cache});
  if(!page.ok) return {
    decision:failedDecision(page).decision,
    http_status:page.status,
    identity_valid:false,
    price_valid:false,
    unit_price:null,
    total_price:null,
    multiplier:multiplierFor({calculation:target.calculation}),
    error:failedDecision(page).error
  };

  let parsed;
  try{
    parsed=parsePriceImpl(page.html,target.expectedName,new URL(target.url).hostname,target.contents || '');
  }catch(error){
    const classified=classifyError(error);
    const decision=(classified==='captcha'||classified==='blocked')?'blocked':likelyIdentityMismatch(page.html,target.expectedName)?'identity_mismatch':'parse_error';
    return {
      decision,
      http_status:page.status,
      identity_valid:false,
      price_valid:false,
      unit_price:null,
      total_price:null,
      multiplier:multiplierFor({calculation:target.calculation}),
      error:safeError(error)
    };
  }

  const unitPrice=Number(parsed?.price);
  if(!Number.isFinite(unitPrice) || unitPrice<=0){
    return {
      decision:'invalid_price',
      http_status:page.status,
      identity_valid:true,
      price_valid:false,
      unit_price:Number.isFinite(unitPrice)?unitPrice:null,
      total_price:null,
      multiplier:multiplierFor({calculation:target.calculation}),
      error:'Non-positive or invalid EUR price'
    };
  }

  const multiplier=multiplierFor({calculation:target.calculation});
  let totalPrice;
  try{
    totalPrice=applyOfferMultiplier(unitPrice,multiplier);
  }catch(error){
    return {
      decision:'invalid_price',
      http_status:page.status,
      identity_valid:true,
      price_valid:false,
      unit_price:unitPrice,
      total_price:null,
      multiplier,
      error:safeError(error)
    };
  }

  return {
    decision:'refreshable_shadow',
    http_status:page.status,
    identity_valid:true,
    price_valid:true,
    unit_price:unitPrice,
    total_price:totalPrice,
    multiplier,
    availability:parsed?.available
  };
}

async function evaluateComponentOffer(row,offer,options){
  const details=Array.isArray(offer.componentDetails)?offer.componentDetails:[];
  if(!details.length){
    return {
      reference:row.id,
      url:offer.url,
      expected_name:offer.name,
      contents:offer.contents || null,
      calculation:offer.calculation || null,
      previous_price:Number(offer.price),
      previous_price_date:offer.priceDate || null,
      collection_disabled:offer.collectionDisabled===true,
      http_status:null,
      identity_valid:false,
      price_valid:false,
      unit_price:null,
      multiplier:null,
      total_price:null,
      decision:'parse_error',
      error:'collection_disabled offer has no explicit versioned component recipe'
    };
  }

  const componentRows=[];
  for(const component of details){
    const target={
      url:component.url,
      expectedName:component.name,
      contents:'',
      calculation:null
    };
    const result=await evaluateThomannTarget(target,options);
    componentRows.push({...result,name:component.name,url:component.url,quantity:Number(component.quantity)});
    if(result.decision!=='refreshable_shadow'){
      return {
        reference:row.id,
        url:offer.url,
        expected_name:offer.name,
        contents:offer.contents || null,
        calculation:offer.calculation || null,
        previous_price:Number(offer.price),
        previous_price_date:offer.priceDate || null,
        collection_disabled:true,
        http_status:result.http_status,
        identity_valid:false,
        price_valid:false,
        unit_price:null,
        multiplier:null,
        total_price:null,
        decision:result.decision,
        error:`component ${component.name}: ${result.error || result.decision}`,
        components:componentRows
      };
    }
  }

  let totalCents=0;
  for(const component of componentRows){
    const quantity=component.quantity;
    if(!Number.isSafeInteger(quantity) || quantity<=0){
      return {
        reference:row.id,url:offer.url,expected_name:offer.name,
        previous_price:Number(offer.price),previous_price_date:offer.priceDate || null,
        collection_disabled:true,decision:'parse_error',identity_valid:false,price_valid:false,
        total_price:null,error:`Invalid component quantity for ${component.name}`,components:componentRows
      };
    }
    totalCents += Math.round(component.unit_price*100)*quantity;
  }
  if(!Number.isSafeInteger(totalCents) || totalCents<=0){
    return {
      reference:row.id,url:offer.url,expected_name:offer.name,
      previous_price:Number(offer.price),previous_price_date:offer.priceDate || null,
      collection_disabled:true,decision:'invalid_price',identity_valid:true,price_valid:false,
      total_price:null,error:'Invalid component total',components:componentRows
    };
  }

  return {
    reference:row.id,
    url:offer.url,
    expected_name:offer.name,
    contents:offer.contents || null,
    calculation:offer.calculation || null,
    previous_price:Number(offer.price),
    previous_price_date:offer.priceDate || null,
    collection_disabled:true,
    http_status:200,
    identity_valid:true,
    price_valid:true,
    unit_price:null,
    multiplier:null,
    total_price:totalCents/100,
    decision:'refreshable_shadow',
    components:componentRows
  };
}

export async function evaluateThomannOffer(row,{
  fetchImpl=fetch,
  cache=new Map(),
  parsePriceImpl=parsePrice
}={}){
  const offer=row?.offers?.thomann;
  if(!offer) throw new Error(`Reference ${row?.id || 'unknown'} has no Thomann offer`);

  const options={fetchImpl,cache,parsePriceImpl};
  if(offer.collectionDisabled===true){
    return evaluateComponentOffer(row,offer,options);
  }

  const result=await evaluateThomannTarget({
    url:offer.url,
    expectedName:offer.name,
    contents:offer.contents || '',
    calculation:offer.calculation || null
  },options);

  return {
    reference:row.id,
    url:offer.url,
    expected_name:offer.name,
    contents:offer.contents || null,
    calculation:offer.calculation || null,
    previous_price:Number(offer.price),
    previous_price_date:offer.priceDate || null,
    collection_disabled:false,
    ...result
  };
}

export async function buildThomannShadowReport({
  seed,
  executionEnvironment='local',
  fetchImpl=fetch,
  parsePriceImpl=parsePrice
}={}){
  if(!Array.isArray(seed)) throw new Error('seed array is required');
  if(!['local','github','self_hosted'].includes(executionEnvironment)){
    throw new Error('execution_environment must be local, github, or self_hosted');
  }

  const rows=[];
  const cache=new Map();
  for(const row of seed.filter(item=>item?.offers?.thomann)){
    rows.push(await evaluateThomannOffer(row,{fetchImpl,cache,parsePriceImpl}));
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
      identity_invalid:count('identity_mismatch'),
      invalid_price:count('invalid_price'),
      parse_error:count('parse_error'),
      network_error:count('network_error')
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
  const report=await buildThomannShadowReport({seed,executionEnvironment});
  console.log(JSON.stringify(report,null,2));
}
