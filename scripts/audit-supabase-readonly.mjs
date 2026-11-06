import fs from 'node:fs/promises';

const base=String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');

const headers={
  apikey:key,
  ...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})
};

async function get(path){
  const res=await fetch(base+'/rest/v1/'+path,{headers,signal:AbortSignal.timeout(20000)});
  const text=await res.text();
  if(!res.ok) throw new Error('GET '+path+': '+res.status+' '+text.slice(0,500));
  return text?JSON.parse(text):[];
}

const HOTSOUND_BAD_RUN='26b5de17-c258-4503-997f-a51831f37a44';

const [shops,configs,offers,components,prices,componentPrices,runs,results,current]=await Promise.all([
  get('shops?select=id,slug,name,enabled'),
  get('configurations?select=id,legacy_id,name,active'),
  get('offers?select=id,configuration_id,shop_id,shop_product_name,active'),
  get('offer_components?select=id,offer_id,active'),
  get('price_observations?select=id,offer_id,run_id,price,status,verified,source_method,observed_at,created_at'),
  get('component_price_observations?select=id,offer_component_id,run_id,price,status,verified,observed_at,created_at'),
  get('collection_runs?select=id,trigger_type,status,started_at,finished_at,offers_total,offers_checked,offers_updated,offers_failed,metadata&order=started_at.desc&limit=50'),
  get('collection_results?select=id,run_id,offer_id,status,price,source_method,http_status,created_at'),
  get('current_offer_status?select=offer_id,price,price_observed_at,last_attempt_status,last_attempt_at')
]);

const shopById=new Map(shops.map(x=>[x.id,x]));
const configById=new Map(configs.map(x=>[x.id,x]));
const offerById=new Map(offers.map(x=>[x.id,x]));
const componentById=new Map(components.map(x=>[x.id,x]));

const activeOffers=offers.filter(x=>x.active);
const activeConfigs=configs.filter(x=>x.active);
const activeShops=shops.filter(x=>x.enabled);

const pricesByOffer=new Map();
for(const row of prices){
  const a=pricesByOffer.get(row.offer_id)||[];
  a.push(row);
  pricesByOffer.set(row.offer_id,a);
}

const strictLatest=new Map();
const currentRuleLatest=new Map();
const ambiguous=[];
for(const offer of activeOffers){
  const rows=(pricesByOffer.get(offer.id)||[]);
  const currentRule=rows
    .filter(x=>x.status==='success'&&x.price!==null)
    .sort((a,b)=>String(b.observed_at).localeCompare(String(a.observed_at))||String(b.created_at).localeCompare(String(a.created_at))||String(b.id).localeCompare(String(a.id)));
  const strict=rows
    .filter(x=>x.status==='success'&&x.verified===true&&Number(x.price)>0)
    .sort((a,b)=>String(b.observed_at).localeCompare(String(a.observed_at))||String(b.created_at).localeCompare(String(a.created_at))||String(b.id).localeCompare(String(a.id)));
  if(currentRule[0]) currentRuleLatest.set(offer.id,currentRule[0]);
  if(strict[0]) strictLatest.set(offer.id,strict[0]);

  const successful=rows.filter(x=>x.status==='success'&&x.price!==null);
  const groups=new Map();
  for(const row of successful){
    const k=row.observed_at;
    const arr=groups.get(k)||[];
    arr.push(row);
    groups.set(k,arr);
  }
  for(const [observedAt,arr] of groups){
    if(arr.length>1) ambiguous.push({offer_id:offer.id,observed_at:observedAt,count:arr.length});
  }
}

const successUnverified=prices.filter(x=>x.status==='success'&&x.verified!==true);
const successNull=prices.filter(x=>x.status==='success'&&x.price===null);
const nonPositive=prices.filter(x=>x.price!==null&&Number(x.price)<=0);
const activeWithoutStrict=activeOffers.filter(x=>!strictLatest.has(x.id));

const currentByOffer=new Map(current.map(x=>[x.offer_id,x]));
const changedUnderStrict=[];
for(const offer of activeOffers){
  const cur=currentByOffer.get(offer.id);
  const strict=strictLatest.get(offer.id);
  const curPrice=cur?.price===null||cur?.price===undefined?null:Number(cur.price);
  const strictPrice=strict?.price===null||strict?.price===undefined?null:Number(strict.price);
  const curAt=cur?.price_observed_at||null;
  const strictAt=strict?.observed_at||null;
  if(curPrice!==strictPrice||curAt!==strictAt){
    const shop=shopById.get(offer.shop_id);
    const config=configById.get(offer.configuration_id);
    changedUnderStrict.push({
      offer_id:offer.id,
      shop:shop?.slug||'unknown',
      configuration:config?.legacy_id||null,
      current_price:curPrice,
      strict_price:strictPrice,
      current_observed_at:curAt,
      strict_observed_at:strictAt
    });
  }
}

const offerIds=new Set(offers.map(x=>x.id));
const componentIds=new Set(components.map(x=>x.id));
const configIds=new Set(configs.map(x=>x.id));
const shopIds=new Set(shops.map(x=>x.id));
const integrity={
  price_observations_orphan_offer:prices.filter(x=>!offerIds.has(x.offer_id)).length,
  component_price_observations_orphan_component:componentPrices.filter(x=>!componentIds.has(x.offer_component_id)).length,
  offer_components_orphan_offer:components.filter(x=>!offerIds.has(x.offer_id)).length,
  offers_orphan_configuration:offers.filter(x=>!configIds.has(x.configuration_id)).length,
  offers_orphan_shop:offers.filter(x=>!shopIds.has(x.shop_id)).length
};

const quarantinePrices=prices.filter(x=>x.run_id===HOTSOUND_BAD_RUN);
const quarantineComponents=componentPrices.filter(x=>x.run_id===HOTSOUND_BAD_RUN);
const quarantineResults=results.filter(x=>x.run_id===HOTSOUND_BAD_RUN);
const quarantineRun=runs.find(x=>x.id===HOTSOUND_BAD_RUN)||null;
const quarantine={
  price_observations_total:quarantinePrices.length,
  price_observations_success:quarantinePrices.filter(x=>x.status==='success').length,
  price_observations_parse_error:quarantinePrices.filter(x=>x.status==='parse_error').length,
  price_observations_non_null_price:quarantinePrices.filter(x=>x.price!==null).length,
  price_observations_verified_true:quarantinePrices.filter(x=>x.verified===true).length,
  component_observations_total:quarantineComponents.length,
  component_observations_success:quarantineComponents.filter(x=>x.status==='success').length,
  component_observations_non_null_price:quarantineComponents.filter(x=>x.price!==null).length,
  component_observations_verified_true:quarantineComponents.filter(x=>x.verified===true).length,
  collection_results_success:quarantineResults.filter(x=>x.status==='success').length,
  run:quarantineRun?{
    status:quarantineRun.status,
    offers_checked:quarantineRun.offers_checked,
    offers_updated:quarantineRun.offers_updated,
    offers_failed:quarantineRun.offers_failed,
    health_status:quarantineRun.metadata?.health_status||null,
    corrected_reason:quarantineRun.metadata?.corrected_reason||null
  }:null
};

const now=Date.now();
function ageDays(ts){const n=Date.parse(ts);return Number.isFinite(n)?Math.max(0,(now-n)/86400000):null;}
function median(values){
  if(!values.length)return null;
  const a=[...values].sort((x,y)=>x-y);
  const m=Math.floor(a.length/2);
  return a.length%2?a[m]:(a[m-1]+a[m])/2;
}

const freshness=[];
for(const shop of activeShops){
  const shopOffers=activeOffers.filter(x=>x.shop_id===shop.id);
  const ages=shopOffers.map(o=>strictLatest.get(o.id)).filter(Boolean).map(x=>ageDays(x.observed_at)).filter(x=>x!==null);
  const latest=shopOffers.map(o=>strictLatest.get(o.id)?.observed_at).filter(Boolean).sort().at(-1)||null;
  freshness.push({
    shop:shop.slug,
    offers:shopOffers.length,
    with_valid_success:ages.length,
    without_valid_success:shopOffers.length-ages.length,
    latest_success:latest,
    age_min_days:ages.length?Math.min(...ages):null,
    age_median_days:median(ages),
    age_max_days:ages.length?Math.max(...ages):null,
    age_buckets:{
      le_1:ages.filter(x=>x<=1).length,
      d2_3:ages.filter(x=>x>1&&x<=3).length,
      d4_7:ages.filter(x=>x>3&&x<=7).length,
      gt_7:ages.filter(x=>x>7).length
    }
  });
}

const recentRuns=runs.slice(0,10).map(r=>({
  id:r.id,
  trigger:r.trigger_type,
  status:r.status,
  started_at:r.started_at,
  finished_at:r.finished_at,
  shop:r.metadata?.shop??null,
  checked:r.metadata?.result_counts?.checked??r.offers_checked??0,
  updated:r.metadata?.result_counts?.updated??r.offers_updated??0,
  preserved:r.metadata?.result_counts?.preserved??0,
  hard_failed:r.metadata?.result_counts?.hard_failed??r.offers_failed??0,
  health_status:r.metadata?.health_status??null
}));

const countsByShop=activeShops.map(shop=>({
  shop:shop.slug,
  active_offers:activeOffers.filter(x=>x.shop_id===shop.id).length
}));

const report={
  generated_at:new Date().toISOString(),
  mode:'READ_ONLY_GET_ONLY',
  counts:{
    active_shops:activeShops.length,
    active_configurations:activeConfigs.length,
    active_offers:activeOffers.length,
    offer_components:components.filter(x=>x.active).length,
    price_observations:prices.length,
    component_price_observations:componentPrices.length
  },
  offers_by_shop:countsByShop,
  anomalies:{
    success_unverified:successUnverified.length,
    success_null_price:successNull.length,
    non_positive_price:nonPositive.length,
    ambiguous_success_same_observed_at:ambiguous.length,
    active_offers_without_strict_valid_price:activeWithoutStrict.length,
    current_offer_status_changes_under_strict_rule:changedUnderStrict.length
  },
  integrity,
  quarantine,
  freshness,
  recent_runs:recentRuns,
  strict_rule_changes:changedUnderStrict.slice(0,100),
  ambiguous_successes:ambiguous.slice(0,100)
};

const fmt=v=>v===null?'—':typeof v==='number'?String(Math.round(v*10)/10):String(v);
const lines=[];
lines.push('# Supabase production read-only audit','');
lines.push('Generated: '+report.generated_at,'');
lines.push('Mode: **GET-only / no writes**','');
lines.push('## Summary','');
lines.push('- Active shops: **'+report.counts.active_shops+'**');
lines.push('- Active configurations: **'+report.counts.active_configurations+'**');
lines.push('- Active offers: **'+report.counts.active_offers+'**');
lines.push('- Price observations: **'+report.counts.price_observations+'**');
lines.push('- Component price observations: **'+report.counts.component_price_observations+'**','');
lines.push('## High-risk checks','');
lines.push('- success with verified=false: **'+report.anomalies.success_unverified+'**');
lines.push('- success with NULL price: **'+report.anomalies.success_null_price+'**');
lines.push('- non-positive prices: **'+report.anomalies.non_positive_price+'**');
lines.push('- ambiguous success timestamps: **'+report.anomalies.ambiguous_success_same_observed_at+'**');
lines.push('- active offers without strict valid price: **'+report.anomalies.active_offers_without_strict_valid_price+'**');
lines.push('- rows that would change under strict current-price rule: **'+report.anomalies.current_offer_status_changes_under_strict_rule+'**','');
lines.push('Strict candidate rule: status=success AND verified=true AND price>0, ordered by observed_at DESC, created_at DESC, id DESC.','');
lines.push('## Integrity','');
for(const [k,v] of Object.entries(integrity)) lines.push('- '+k+': **'+v+'**');
lines.push('','## Hot Sound quarantine run','');
for(const [k,v] of Object.entries(quarantine)){
  if(k==='run') continue;
  lines.push('- '+k+': **'+v+'**');
}
lines.push('- run: '+JSON.stringify(quarantine.run),'');
lines.push('## Freshness by shop','');
lines.push('| Shop | Offers | Valid | Missing | Latest success | Min age | Median age | Max age | <=1d | 2-3d | 4-7d | >7d |');
lines.push('|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|');
for(const x of freshness){
  lines.push('| '+x.shop+' | '+x.offers+' | '+x.with_valid_success+' | '+x.without_valid_success+' | '+(x.latest_success||'—')+' | '+fmt(x.age_min_days)+' | '+fmt(x.age_median_days)+' | '+fmt(x.age_max_days)+' | '+x.age_buckets.le_1+' | '+x.age_buckets.d2_3+' | '+x.age_buckets.d4_7+' | '+x.age_buckets.gt_7+' |');
}
lines.push('','## Latest 10 collection runs','');
lines.push('| Run | Shop | Status | Health | Checked | Updated | Preserved | Hard failed | Started |');
lines.push('|---|---|---|---|---:|---:|---:|---:|---|');
for(const x of recentRuns){
  lines.push('| '+x.id+' | '+(x.shop||'all')+' | '+x.status+' | '+(x.health_status||'—')+' | '+x.checked+' | '+x.updated+' | '+x.preserved+' | '+x.hard_failed+' | '+x.started_at+' |');
}
lines.push('','## Rows changed by strict current-price rule','');
if(!changedUnderStrict.length) lines.push('None.');
else for(const x of changedUnderStrict.slice(0,100)) lines.push('- '+JSON.stringify(x));

await fs.mkdir('reports',{recursive:true});
await fs.writeFile('reports/supabase-production-readonly-audit.json',JSON.stringify(report,null,2)+'\n');
await fs.writeFile('reports/supabase-production-readonly-audit.md',lines.join('\n')+'\n');

console.log(lines.join('\n'));
