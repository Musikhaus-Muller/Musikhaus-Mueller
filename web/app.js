let bundles=Array.isArray(window.BUNDLES)?window.BUNDLES:[];
const SHOPS={mueller:'Musikhaus Müller',thomann:'Thomann',hotsound:'Hot Sound',kirstein:'Kirstein',prolighting:'PRO LIGHTING',musicstore:'Music Store'};
let catalogSource='snapshot';
const $=id=>document.getElementById(id),euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const date=d=>d?d.split('-').reverse().join('.'):'nicht live bestätigt';
const timestamp=value=>value?new Date(value).toLocaleString('de-DE',{timeZone:'Europe/Madrid'}):'—';
let family='Alle',expanded=new Set(),visible=[];
const keys=()=> $('shop').value==='all'?Object.keys(SHOPS):['mueller',$('shop').value];
const entries=(r,all=false)=>(all?Object.keys(SHOPS):keys()).filter(k=>r.offers[k]&&Number.isFinite(r.offers[k].price)).map(k=>({key:k,...r.offers[k]}));
const fresh=o=>Boolean(o?.verifiedToday)&&Date.now()-Date.parse(o.checkedAt||o.priceDate+'T00:00:00Z')<36*3600000;
const eligible=o=>fresh(o)&&o.match==='exact'&&o.available!==false;
const comparable=r=>entries(r).filter(eligible);
const low=r=>Math.min(...entries(r).map(o=>o.price));
const spread=r=>{const a=comparable(r);return a.length>1?Math.max(...a.map(o=>o.price))-Math.min(...a.map(o=>o.price)):0;};
function result(r){const a=comparable(r);if(a.length<2)return {label:'Kein belastbarer Preisvergleich',detail:entries(r).length<2?'Kein belegtes Gegenangebot':'Lieferumfang, Aktualität oder Verfügbarkeit abweichend',winners:[],tone:''};const min=Math.min(...a.map(o=>o.price)),w=a.filter(o=>o.price===min).map(o=>o.key);return {label:w.length>1?'Preisgleichstand':SHOPS[w[0]]+' am niedrigsten',detail:`Unter ${a.length} bestätigten, vergleichbaren Angeboten · ohne Versand`,winners:w,tone:w.length===1?'green':''};}
const thomannLower=r=>{const m=r.offers.mueller,t=r.offers.thomann;return fresh(m)&&fresh(t)&&m.available!==false&&t.available!==false&&t.price<m.price;};
function renderTabs(){$('families').innerHTML=['Alle','MAUI','DAVE','STINGER','ICOA','Frigga','Wharfedale'].map(f=>`<button type="button" class="${family===f?'active':''}" data-family="${f}" aria-pressed="${family===f}">${f}<span>${f==='Alle'?bundles.length:bundles.filter(r=>r.family===f).length}</span></button>`).join('');}
function cell(r,k,res){const o=r.offers[k];if(!o)return '<span class="missing">—<br>Kein belegtes<br>Gegenangebot</span>';const red=k==='thomann'&&thomannLower(r),win=res.winners.includes(k);return `<div class="price ${red?'thomann-red':win?'winner':''}">${euro(o.price)}</div><div class="price-meta ${fresh(o)?'':'stale-price'}">${fresh(o)?'Geprüft: '+date(o.priceDate):'Nicht live bestätigt'+(o.priceDate?' · '+date(o.priceDate):'')}</div><span class="badge ${o.match==='exact'?'':'amber'}">${o.match==='exact'?'Gleicher Lieferumfang':'Zubehör abweichend'}</span>${o.available===false?'<div class="stale-price price-meta">Nicht lieferbar</div>':''}${o.calculation?'<div class="price-meta">Berechneter Warenkorb</div>':''}${red?'<div class="price-meta thomann-red">'+euro(r.offers.mueller.price-o.price)+' unter Müller'+(o.match!=='exact'?' · Zubehör abweichend':'')+'</div>':''}<a class="shoplink" href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">Angebot / Quelle ↗</a>`;}
function detail(k,o){return `<div><h3>${SHOPS[k]}</h3>${o?`<strong>${esc(o.name)}</strong><p>${esc(o.contents)}</p>${o.calculation?'<p><b>'+esc(o.calculation)+'</b></p>':''}<p>${esc(o.note||'')} ${esc(o.shipping||'Versandkosten nicht in der Preiswertung berücksichtigt.')}</p><p><b>${esc(o.fetchStatus|| (fresh(o)?'Direktabruf bestätigt':'Nicht live bestätigt'))}</b><br>Letzter gültiger Preis: ${esc(timestamp(o.checkedAt))}<br>Letzter Abruf: ${esc(timestamp(o.lastAttemptAt))}<br><a href="${esc(o.source||o.url)}" target="_blank" rel="noopener noreferrer">${esc(o.evidence||'Produktquelle')} ↗</a></p>${o.sources?.length?'<p>'+o.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name||s.url)} ↗</a>`).join('<br>')+'</p>':''}`:'<p>Kein passendes Angebot belegt. Dies ist keine Aussage über das gesamte Shopsortiment.</p>'}</div>`;}
function render(){renderCoverage();const q=norm($('query').value.trim()),min=$('min').value===''?0:Number($('min').value),max=$('max').value===''?Infinity:Number($('max').value),status=$('status').value;
visible=bundles.filter(r=>(family==='Alle'||family===r.family)&&norm([r.brand,r.name,r.sub,...entries(r).flatMap(o=>[o.name,o.contents])].join(' ')).includes(q)&&low(r)>=min&&low(r)<=max&&(status==='all'||status==='paired'&&entries(r).length>1||status==='exact'&&comparable(r).length>1||status==='similar'&&entries(r).some(o=>o.match==='similar')||status==='unmatched'&&entries(r).length<2));
const sort=$('sort').value;if(sort==='asc'||sort==='desc')visible.sort((a,b)=>(low(a)-low(b))*(sort==='asc'?1:-1));if(sort==='name')visible.sort((a,b)=>a.name.localeCompare(b.name,'de',{numeric:true}));if(sort==='saving')visible.sort((a,b)=>spread(b)-spread(a));
$('resultCount').textContent=`${visible.length} von ${bundles.length} Konfigurationen`;$('empty').hidden=visible.length>0;
$('tableHead').innerHTML=`<tr><th>PRODUKT / KONFIGURATION</th>${keys().map(k=>'<th>'+SHOPS[k].toUpperCase()+'</th>').join('')}<th>PREISERGEBNIS</th><th>DETAILS</th></tr>`;
$('rows').innerHTML=visible.map(r=>{const res=result(r),open=expanded.has(r.id);return `<tr class="mainrow"><td><div class="brandline">${esc(r.brand)} / ${esc(r.family)}</div><div class="productname">${esc(r.name)}</div><div class="productsub">${esc(r.sub)}</div></td>${keys().map(k=>'<td>'+cell(r,k,res)+'</td>').join('')}<td><span class="badge ${res.tone}">${esc(res.label)}</span><p class="result-text">${esc(res.detail)}</p></td><td><button class="detailsbutton" type="button" data-detail="${r.id}" aria-expanded="${open}" aria-controls="detail-${r.id}">${open?'Schließen −':'Details +'}</button></td></tr><tr class="detailrow" id="detail-${r.id}" ${open?'':'hidden'}><td colspan="${keys().length+3}"><div class="detail-grid">${keys().map(k=>detail(k,r.offers[k])).join('')}</div><div class="detail-note">Referenzkonfiguration: ${r.mueller?'Musikhaus Müller':'Thomann'}. ${esc(r.note)} Artikelpreise inkl. MwSt.; Versand nicht vereinheitlicht.</div></td></tr>`;}).join('');
$('tableHead').closest('table').classList.toggle('six-shops',keys().length>=5);
}
$('statTotal').textContent=bundles.length;$('statPairs').textContent=bundles.filter(r=>entries(r,true).length>1).length;$('statMissing').textContent=bundles.filter(r=>entries(r,true).length<2).length;
function renderCoverage(){const allOffers=bundles.flatMap(r=>entries(r,true));$('coverage').innerHTML=`Preisübersicht · <strong>${allOffers.length} zugeordnete Händlerangebote</strong> für ${bundles.length} Konfigurationen. ${allOffers.filter(o=>!fresh(o)).length} Preisangaben sind nicht aktuell bestätigt und werden nicht für die Rangfolge verwendet. Gleicher Lieferumfang und abweichendes Zubehör sind getrennt gekennzeichnet.`;}

$('families').addEventListener('click',e=>{const b=e.target.closest('[data-family]');if(b){family=b.dataset.family;renderTabs();render();}});$('filters').addEventListener('input',render);
$('rows').addEventListener('click',e=>{const b=e.target.closest('[data-detail]');if(!b)return;const id=b.dataset.detail;expanded.has(id)?expanded.delete(id):expanded.add(id);render();document.querySelector(`[data-detail="${id}"]`).focus();});
$('reset').addEventListener('click',()=>{$('filters').reset();family='Alle';renderTabs();render();});
$('export').addEventListener('click',()=>{const headers=['Konfiguration','Familie','Händler','Produktname','Preis EUR','Lieferumfang','Vergleichbarkeit','Preisstand','Direkt bestätigt','Berechnung','Verfügbarkeit','Quelle'];const rows=visible.flatMap(r=>entries(r).map(o=>[r.name,r.family,SHOPS[o.key],o.name,o.price,o.contents,o.match==='exact'?'Gleich':'Zubehör abweichend',o.priceDate||'Unbekannt',fresh(o)?'Ja':'Nein',o.calculation||'',o.available===false?'Nicht lieferbar':'Siehe Shop',o.url]));const csv='\uFEFF'+[headers,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');a.href=u;a.download='pa-vergleich-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});renderTabs();render();

async function loadCatalog(){
 try{
  const response=await fetch('/api/catalog',{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const payload=await response.json();
  if(!Array.isArray(payload.rows))throw Error('Ungültiger Katalog');
  bundles.splice(0,bundles.length,...payload.rows);
  catalogSource=payload.source||'snapshot';
  renderTabs();render();
  return payload;
 }catch(e){
  catalogSource='snapshot';
  return {source:'snapshot',rows:bundles,error:e.message};
 }
}
loadCatalog();

const updateButton=$('refresh'),updateStatus=$('update-status');
function showUpdate(s,accepted=false){const r=s.run;if(!r){updateStatus.textContent=s.busy?'Ein anderer Lauf arbeitet gerade.':'Noch keine Ausführung registriert. Preisprüfungen laufen täglich oder werden administrativ über GitHub Actions gestartet.';return;}const labels={running:'Läuft',success:'Erfolgreich',success_with_preserved:'Erfolgreich (Preise erhalten)',partial:'Teilweise erfolgreich',failed:'Fehlgeschlagen'};const phases={reserved:'Reserviert',queued:'Von GitHub angenommen, wartet auf Start',running:'Collector läuft',success:'Collector abgeschlossen',partial:'Collector teilweise abgeschlossen',failed:'Fehlgeschlagen'};const trigger={scheduled:'Programmiert',manual:'Manuell'}[r.trigger]||'unbekannt';const shops=(r.shops||[]).map(x=>`${SHOPS[x.shop]||x.shop}: ${labels[x.status]||x.status} (${x.confirmed} bestätigt, ${x.preserved||0} erhalten, ${x.failed} fehlgeschlagen)`).join(' · ');const issues=new Map();for(const i of r.issues||[]){const label=(SHOPS[i.shop]||i.shop)+': '+i.message;issues.set(label,(issues.get(label)||0)+1);}updateStatus.textContent=`${accepted?'Manuelle Aktualisierung gestartet · ':''}${labels[r.status]||r.status}${phases[r.phase]?' · '+phases[r.phase]:''} · ${trigger} · ${r.processed}/${r.total} Angebote · ${r.confirmed} bestätigt · ${r.preserved||0} erhalten · ${r.failed} fehlgeschlagen · ${timestamp(r.finishedAt||r.startedAt)}`+(r.reason?' · '+r.reason:'')+(shops?' · '+shops:'')+(r.warnings?.length?` · ${r.warnings.length} vorherige Preise erhalten.`:'')+(issues.size?' · '+[...issues].map(([label,count])=>`${label} (${count})`).join('; ')+'. Der letzte gültige Preis bleibt bei Fehlern erhalten.':'');}

async function status(){try{const r=await fetch('/api/status',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('HTTP '+r.status);const current=await r.json();showUpdate(current);return current;}catch{updateStatus.textContent='Aktualisierungsdienst derzeit nicht erreichbar. Gespeicherte Preise bleiben sichtbar.';return null;}}
updateButton.addEventListener('click',async()=>{
 updateButton.disabled=true;
 updateStatus.textContent='Gespeicherte Preise werden aus Supabase neu geladen …';
 try{
  const payload=await loadCatalog();
  await loadHistory();
  const current=await status();
  if(payload.source!=='supabase')updateStatus.textContent='Supabase derzeit nicht erreichbar. Gespeicherter Snapshot bleibt sichtbar.';
  else if(!current?.run)updateStatus.textContent='Preisdaten neu geladen. Preisprüfungen laufen täglich oder administrativ über GitHub Actions.';
 }finally{
  updateButton.disabled=false;
 }
});status();

const runTime=t=>t?new Date(t).toLocaleString('de-DE',{timeZone:'Europe/Madrid'}):'—';
async function loadHistory(){
 const target=$('run-history');
 try{
  const response=await fetch('/api/runs',{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(!Array.isArray(data.runs))throw Error('Ungültiges Protokoll');
  target.innerHTML=data.runs.length?data.runs.map(r=>{
   const trigger={scheduled:'Programmiert',manual:'Manuell',test:'Test',unknown:'Auslöser unbekannt'}[r.trigger]||'Auslöser unbekannt';
   const label={running:'Läuft / noch nicht abgeschlossen',success:'Erfolgreich',partial:'Teilweise erfolgreich',failed:'Fehlgeschlagen',complete:'Abgeschlossen',skipped:'Nicht gestartet'}[r.status]||r.status;
   const duration=r.finishedAt?Math.max(0,Math.round((Date.parse(r.finishedAt)-Date.parse(r.startedAt))/1000))+' s':'—';
   const shops=(r.shops||[]).map(x=>`${SHOPS[x.shop]||x.shop}: ${x.confirmed}/${x.total} bestätigt, ${x.preserved||0} erhalten, ${x.failed} fehlgeschlagen`).join(' · ');
   const results=(r.results||[]).map(x=>{
    const outcome=x.status==='preserved'?`Preis erhalten (${x.sourceStatus}) · `:x.status==='error'?`Fehler (${x.sourceStatus}) · `:'';
    return '<li>'+esc(SHOPS[x.shop]||x.shop)+' · <a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.product)+'</a>: '+esc(outcome+x.message)+(x.changes?.length?' · '+x.changes.map(c=>esc(c.product)+': '+euro(c.previousPrice)+' → '+euro(c.price)).join('; '):'')+'</li>';
   }).join('');
   return `<details style="margin-top:16px;padding:12px;border:1px solid #ccd4df;border-radius:8px"><summary><b>${esc(trigger)} · ${esc(runTime(r.startedAt))}</b> · ${esc(label)}</summary><p>Ende: ${esc(runTime(r.finishedAt))} · Dauer: ${duration}<br>${r.processed||0}/${r.total||0} Angebote · ${r.confirmed||0} bestätigt · ${r.preserved||0} erhalten · ${r.failed||0} fehlgeschlagen</p>${shops?'<p>Pro Händler: '+esc(shops)+'</p>':''}${r.reason?'<p>'+esc(r.reason)+'</p>':''}<p>ID: ${esc(r.id)}</p>${results?'<ul>'+results+'</ul>':(r.issues||[]).length?'<ul>'+r.issues.map(x=>'<li>'+esc(SHPSafe(x.shop))+': '+esc(x.message)+'</li>').join('')+'</ul>':'<p>Keine Einzelfehler protokolliert.</p>'}</details>`;
  }).join(''):'Noch keine Ausführung registriert.';
 }catch(e){target.textContent='Protokoll nicht geladen: '+e.message;}
}
function SHPSafe(shop){return SHOPS[shop]||shop;}
$('reload-history').addEventListener('click',loadHistory);loadHistory();
