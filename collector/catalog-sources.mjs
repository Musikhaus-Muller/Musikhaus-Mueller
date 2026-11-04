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
    return 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie.html?sort=6&view=classic';
  }
  if (n.includes('frigga') && (n.includes('weiss') || n.includes('white'))) {
    return 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxenzubehoer-und-ersatzteile/boxentaschen-cover-und-cases/dap-frigga-bodenplatte-fuer-frigga-subwoofer.html';
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

  for(let i=0;i<lines.length;i++){
    const words=new Set(normalize(lines[i]).split(' '));
    if(required.some(t=>!words.has(t))) continue;
    const score=tokens.length?tokens.filter(t=>words.has(t)).length/tokens.length:0;
    if(score>=0.6 && score>bestScore){best=i;bestScore=score}
  }
  if(best<0) throw new Error('Catalog product not found');

  for(let i=best+1;i<Math.min(lines.length,best+14);i++){
    const line=lines[i];
    if(/finanzierung|monat|uvp|retail price/i.test(line)) continue;
    const m=line.match(/\b\d{1,3}(?:\.\d{3})*,\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/i)
      || line.match(/\b\d{1,3}(?:,\d{3})*\.\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/i);
    if(!m) continue;
    const price=priceNumber(m[0]);
    if(!Number.isFinite(price)||price<=0) continue;
    const availabilityWindow=lines.slice(i+1,i+5).join(' ');
    const available=/lieferbar|available/i.test(availabilityWindow)?true:/nicht verf[uü]gbar|nicht lieferbar/i.test(availabilityWindow)?false:undefined;
    return {price,available};
  }
  throw new Error('Catalog product price not found');
}
