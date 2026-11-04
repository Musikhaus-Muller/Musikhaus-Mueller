const normalize=value=>String(value||'')
  .toLowerCase()
  .replace(/ß/g,'ss')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/saeulen/g,'saulen')
  .replace(/[^a-z0-9]+/g,' ')
  .trim();

const decode=value=>String(value||'')
  .replace(/&nbsp;|&#160;/gi,' ')
  .replace(/&euro;|&#8364;|&#x20ac;/gi,'€')
  .replace(/&amp;/gi,'&')
  .replace(/<br\s*\/?>/gi,'\n')
  .replace(/<\/p>|<\/div>|<\/li>|<\/h\d>/gi,'\n')
  .replace(/<[^>]*>/g,' ')
  .replace(/[ \t]+/g,' ')
  .replace(/\n\s+/g,'\n')
  .trim();

const priceNumber=value=>Number(
  String(value).replace(/\s*(?:€|EUR)\s*$/i,'').replace(/\./g,'').replace(',','.')
);

const significantTokens=expected=>normalize(expected.replace(/^\s*\d+\s*[×x]\s*/,''))
  .split(' ')
  .filter(t=>t.length>1 && !['ld','systems','system','set','bundle','kompaktes','portables','aktives','aktive','pa'].includes(t));

export function publicCatalogSourceFor(shopSlug, expected) {
  if (shopSlug !== 'prolighting') return null;
  const n=normalize(expected);
  if (n.includes('maui 28 g3') && (n.includes('weiss') || n.includes('white'))) {
    return 'https://www.prolighting.de/de/kategorie/3528';
  }
  if (n.includes('frigga') && (n.includes('weiss') || n.includes('white'))) {
    return 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets/dap-frigga-aktive-einzelsaeule-pa-system-weiss.html?fscs=1';
  }
  return null;
}

export function parseCatalogProductPrice(html, expected) {
  const text=decode(html);
  const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const tokens=significantTokens(expected);
  const required=tokens.filter(t=>/\d/.test(t)||['schwarz','black','weiss','white'].includes(t));
  let best=-1;
  let bestScore=0;
  let bestWindow='';

  for(let i=0;i<lines.length;i++){
    const window=lines.slice(i,Math.min(lines.length,i+4)).join(' ');
    const words=new Set(normalize(window).split(' '));
    if(required.some(t=>!words.has(t))) continue;
    const score=tokens.length?tokens.filter(t=>words.has(t)).length/tokens.length:0;
    if(score>=0.55 && score>bestScore){
      best=i;
      bestScore=score;
      bestWindow=window;
    }
  }
  if(best<0) throw new Error('Catalog product not found');

  const colorTokens=required.filter(t=>['schwarz','black','weiss','white'].includes(t));
  let anchor=best;
  if(colorTokens.length){
    for(let i=best;i<Math.min(lines.length,best+4);i++){
      const words=new Set(normalize(lines[i]).split(' '));
      if(colorTokens.some(t=>words.has(t))){
        anchor=i;
        break;
      }
    }
  }

  const searchLines=lines.slice(anchor,Math.min(lines.length,anchor+18));

  for(let i=0;i<searchLines.length;i++){
    const line=searchLines[i];
    if(/finanzierung|monat/i.test(line)) continue;
    const candidates=[...line.matchAll(/\b\d{1,3}(?:\.\d{3})*,\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/gi)];
    const filtered=candidates.filter(m=>!/uvp|retail price/i.test(line.slice(Math.max(0,m.index-20),m.index)));
    if(!filtered.length) continue;
    const m=filtered.at(-1);
    const price=priceNumber(m[0]);
    if(!Number.isFinite(price)||price<=0) continue;
    const availabilityWindow=searchLines.slice(i+1,i+5).join(' ');
    const available=/lieferbar|available/i.test(availabilityWindow)?true:/nicht verf[uü]gbar|nicht lieferbar/i.test(availabilityWindow)?false:undefined;
    return {price,available};
  }
  throw new Error('Catalog product price not found');
}


export function catalogDiagnostic(html, expected) {
  const text=decode(html);
  const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const tokens=significantTokens(expected);
  const needles=tokens.filter(t=>t.length>=3).slice(0,8);
  const hits=[];
  for(let i=0;i<lines.length;i++){
    const n=normalize(lines[i]);
    if(needles.some(t=>n.includes(t))){
      hits.push(lines.slice(Math.max(0,i-1),Math.min(lines.length,i+3)).join(' | ').slice(0,500));
      if(hits.length>=4)break;
    }
  }
  const prices=[...text.matchAll(/\b\d{1,3}(?:\.\d{3})*,\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/gi)]
    .slice(0,12)
    .map(m=>m[0]);
  return {
    expected:String(expected||'').slice(0,180),
    tokens,
    hits,
    prices,
    textLength:text.length
  };
}
