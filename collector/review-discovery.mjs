import {
  reviewSignal,
  formatCandidate,
  componentReviewSignal,
  formatComponentCandidate
} from './review-core.mjs';

const SUPABASE_URL=process.env.SUPABASE_URL;
const SUPABASE_KEY=process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!SUPABASE_URL || !SUPABASE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');

const args=Object.fromEntries(process.argv.slice(2).map(v=>{
  const [k,...rest]=v.replace(/^--/,'').split('=');
  return [k,rest.length?rest.join('='):true];
}));
const shopSlug=args.shop && args.shop!==true ? String(args.shop) : 'prolighting';

const headers={
  apikey:SUPABASE_KEY,
  ...(SUPABASE_KEY.startsWith('eyJ') ? {Authorization:`Bearer ${SUPABASE_KEY}`} : {})
};

async function rest(path){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{headers});
  const text=await res.text();
  if(!res.ok) throw new Error(`GET ${path}: ${res.status} ${text}`);
  return text?JSON.parse(text):null;
}

const [shop]=await rest(`shops?select=id,slug,name&slug=eq.${encodeURIComponent(shopSlug)}&enabled=eq.true`);
if(!shop) throw new Error(`Shop not found: ${shopSlug}`);

const [run]=await rest(`discovery_runs?select=id,status,started_at,finished_at,candidates_found,metadata&shop_id=eq.${shop.id}&order=started_at.desc&limit=1`);
if(!run) throw new Error(`No discovery run found for ${shopSlug}`);

const [configs,candidates,componentCandidates]=await Promise.all([
  rest('configurations?select=id,legacy_id,brand,family,name,subtitle,metadata&active=eq.true'),
  rest(`discovery_candidates?select=id,run_id,configuration_id,candidate_name,candidate_url,candidate_price,match_score,source_url,metadata,status,discovered_at&run_id=eq.${run.id}&status=eq.proposed&order=match_score.desc`),
  rest(`discovery_component_candidates?select=id,run_id,configuration_id,component_key,component_label,component_kind,quantity,candidate_name,candidate_url,candidate_price,match_score,source_url,metadata,status,discovered_at&run_id=eq.${run.id}&status=eq.proposed&order=match_score.desc`)
]);

const configById=new Map(configs.map(c=>[c.id,c]));
const grouped=new Map();
for(const c of candidates){
  if(!grouped.has(c.configuration_id)) grouped.set(c.configuration_id,[]);
  grouped.get(c.configuration_id).push(c);
}

const counts={unique_high:0,ambiguous_high:0,components_review:0,manual_review:0,weak:0,none:0};
const componentCounts={exact_recipe_match:0,similar_recipe_match:0,incomplete_recipe:0,wrong_recipe:0};
const rows=[];
const componentRows=[];

const componentGroupedByConfig=new Map();
for(const c of componentCandidates){
  if(!componentGroupedByConfig.has(c.configuration_id)) componentGroupedByConfig.set(c.configuration_id,new Map());
  const byKey=componentGroupedByConfig.get(c.configuration_id);
  if(!byKey.has(c.component_key)) byKey.set(c.component_key,[]);
  byKey.get(c.component_key).push(c);
}

for(const [configurationId,byKey] of componentGroupedByConfig){
  const config=configById.get(configurationId);
  if(!config) continue;
  const recipe=config.metadata?.discovery_recipe?.components || [];
  const review=componentReviewSignal(recipe,byKey);
  componentCounts[review.signal]=(componentCounts[review.signal]||0)+1;
  const components=recipe.map(component=>{
    const list=[...(byKey.get(component.key)||[])].sort((a,b)=>Number(b.match_score)-Number(a.match_score));
    return {
      key:component.key,
      label:component.label,
      kind:component.kind,
      quantity:Number(component.quantity||1),
      top1:formatComponentCandidate(list[0],1),
      top2:formatComponentCandidate(list[1],2)
    };
  });
  componentRows.push({
    legacyId:config.legacy_id,
    configuration:config.name,
    signal:review.signal,
    covered:review.covered,
    total:review.total,
    components
  });
}
for(const [configurationId,list] of grouped){
  const config=configById.get(configurationId);
  if(!config) continue;
  const sorted=[...list].sort((a,b)=>Number(b.match_score)-Number(a.match_score));
  const review=reviewSignal(sorted);
  counts[review.signal]=(counts[review.signal]||0)+1;
  rows.push({
    legacyId:config.legacy_id,
    configuration:config.name,
    subtitle:config.subtitle,
    signal:review.signal,
    margin:review.margin,
    top1:formatCandidate(sorted[0],1),
    top2:formatCandidate(sorted[1],2),
    top3:formatCandidate(sorted[2],3)
  });
}

rows.sort((a,b)=>String(a.legacyId).localeCompare(String(b.legacyId),undefined,{numeric:true}));
componentRows.sort((a,b)=>String(a.legacyId).localeCompare(String(b.legacyId),undefined,{numeric:true}));

console.log(`review run=${run.id} shop=${shopSlug} discoveryStatus=${run.status}`);
for(const row of componentRows){
  console.log(`[${row.legacyId}] ${row.configuration} ... ${row.signal} | coverage=${row.covered}/${row.total}`);
  for(const component of row.components){
    const t1=component.top1;
    console.log(`  [${component.key}] qty=${component.quantity} ${component.label} | ${t1 ? `top1=${t1.score} ${t1.price ?? 'no-price'} EUR` : 'no_candidate'}`);
    if(t1) console.log(`    #1 ${t1.id} | ${t1.name} | ${t1.url}`);
    if(component.top2) console.log(`    #2 ${component.top2.id} | ${component.top2.score} | ${component.top2.name} | ${component.top2.url}`);
  }
}
for(const row of rows){
  const t1=row.top1;
  const t2=row.top2;
  console.log(`[${row.legacyId}] ${row.configuration} ... ${row.signal} | top1=${t1.score} ${t1.price ?? 'no-price'} EUR | margin=${row.margin ?? 'n/a'}`);
  console.log(`  #1 ${t1.id} | ${t1.name} | ${t1.url}`);
  if(t2) console.log(`  #2 ${t2.id} | ${t2.score} | ${t2.name} | ${t2.url}`);
}
console.log(JSON.stringify({
  runId:run.id,
  shop:shopSlug,
  configurationsReviewed:rows.length + componentRows.length,
  directConfigurationsReviewed:rows.length,
  componentConfigurationsReviewed:componentRows.length,
  signals:counts,
  componentSignals:componentCounts,
  note:'Read-only review report. No candidate status or offer was modified.'
},null,2));
