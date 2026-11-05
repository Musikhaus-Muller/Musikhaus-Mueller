const decode = value => String(value || '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&euro;|&#8364;|&#x20ac;/gi, '€')
  .replace(/&amp;/gi, '&')
  .replace(/&#xDF;|&szlig;/gi, 'ß')
  .replace(/&#xE4;|&auml;/gi, 'ä')
  .replace(/&#xF6;|&ouml;/gi, 'ö')
  .replace(/&#xFC;|&uuml;/gi, 'ü');

export const normalize = value => decode(value)
  .toLowerCase()
  .replace(/ß/g, 'ss')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/saeulen|säulen/g, 'saulen')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const stripTags = value => decode(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const stop = new Set([
  'ld','systems','system','pa','stereo','bundle','set','mit','und','der','die','das',
  'aktive','aktiver','aktives','passive','passiver','portables','kompaktes','schwarz',
  'weiss','white','black','taschen','hullen','hulle','stativen','stative'
]);

function tokens(value) {
  return normalize(value).split(' ').filter(t => t.length > 1 && !stop.has(t));
}

function colorOf(value) {
  const n = normalize(value);
  if (/\b(weiss|white)\b/.test(n)) return 'white';
  if (/\b(schwarz|black)\b/.test(n)) return 'black';
  return null;
}

function generationOf(value) {
  const n = normalize(value);
  const m = n.match(/\bg\s*(2|3|4x)\b|\bg(2|3|4x)\b/);
  return m ? 'g' + (m[1] || m[2]) : null;
}

function modelNumbers(value) {
  return [...new Set(normalize(value).match(/\b\d{1,3}\b/g) || [])];
}


function accessoryKind(value) {
  const n = normalize(value);
  if (/\b(sat bag|sub pc|bag|tasche|tragetasche|schutzhuelle|schutzhulle|cover|rollbrett|roll board|caster board|cb|pc)\b/.test(n)) {
    return 'accessory';
  }
  return null;
}

function expectsStandaloneMainProduct(config) {
  return !likelyNeedsComponents(config);
}

function candidateLooksLikeMainSystem(value) {
  const n = normalize(value);
  return /\b(maui|dave|stinger|icoa|frigga)\b/.test(n)
    && !accessoryKind(n);
}

export function discoverySourcesFor(config) {
  const family = normalize(config.family);
  const name = normalize(config.name);
  const ldBase = 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems.html?view=classic';

  if (family === 'maui') return [
    'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie.html?view=classic',
    ldBase
  ];
  if (family === 'dave') return [ldBase];
  if (family === 'stinger') return [
    'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie.html?view=classic',
    ldBase
  ];
  if (family === 'icoa') {
    const specific = name.includes('pro')
      ? 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie.html?view=classic'
      : 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie.html?view=classic';
    return [specific, ldBase];
  }
  if (family === 'frigga') return [
    'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/audio-komplettsets.html?view=classic'
  ];
  return [];
}

function parsePrice(text) {
  const blockText = decode(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>|<\/span>|<\/section>|<\/article>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n');

  const matches = [...blockText.matchAll(/\d{1,3}(?:\.\d{3})*,\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/gi)];
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const lineStart = blockText.lastIndexOf('\n', m.index - 1) + 1;
    const sameLineBefore = blockText.slice(lineStart, m.index);
    if (/uvp|finanzierung|monat(?:lich)?/i.test(sameLineBefore)) continue;
    const price = Number(
      m[0].replace(/\s*(?:€|EUR)\s*$/i, '').replace(/\./g, '').replace(',', '.')
    );
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

export function extractCatalogCandidates(html, sourceUrl) {
  const out = [];
  const seen = new Set();
  const re = /<a\b([^>]*?)href=["']([^"']+\.html(?:\?[^"']*)?)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = (m[1] || '') + ' ' + (m[3] || '');
    const inner = m[4] || '';
    const title = (attrs.match(/\btitle=["']([^"']+)["']/i) || [])[1];
    const alt = (inner.match(/\balt=["']([^"']+)["']/i) || [])[1];
    const text = stripTags(inner);
    const name = stripTags(title || text || alt || '');
    if (name.length < 8) continue;

    let url;
    try { url = new URL(m[2], sourceUrl).href; } catch { continue; }
    if (new URL(url).hostname !== 'www.prolighting.de') continue;
    if (seen.has(url)) continue;
    seen.add(url);

    const nearby = html.slice(m.index, Math.min(html.length, m.index + m[0].length + 1800));
    out.push({ name, url, price: parsePrice(nearby) });
  }
  return out;
}

export function scoreDiscoveryCandidate(config, candidate) {
  const expected = [config.brand, config.family, config.name, config.subtitle].filter(Boolean).join(' ');
  const candidateName = candidate.name || '';

  if (accessoryKind(candidateName)) {
    return { score: 0, accepted: false, reason: 'accessory_mismatch' };
  }

  if (expectsStandaloneMainProduct(config) && !candidateLooksLikeMainSystem(candidateName)) {
    return { score: 0, accepted: false, reason: 'main_product_mismatch' };
  }
  const expectedGen = generationOf(expected);
  const candidateGen = generationOf(candidateName);
  if (expectedGen && candidateGen && expectedGen !== candidateGen) {
    return { score: 0, accepted: false, reason: 'generation_mismatch' };
  }

  const expectedColor = colorOf(expected);
  const candidateColor = colorOf(candidateName);
  if (expectedColor && candidateColor && expectedColor !== candidateColor) {
    return { score: 0, accepted: false, reason: 'color_mismatch' };
  }

  const requiredNumbers = modelNumbers(config.name);
  const candidateNums = new Set(modelNumbers(candidateName));
  if (requiredNumbers.some(n => !candidateNums.has(n))) {
    return { score: 0, accepted: false, reason: 'model_number_mismatch' };
  }

  const wanted = tokens([config.brand, config.family, config.name].filter(Boolean).join(' '));
  const got = new Set(tokens(candidateName));
  const matched = wanted.filter(t => got.has(t));
  let score = wanted.length ? matched.length / wanted.length : 0;

  if (expectedGen && candidateGen === expectedGen) score += 0.08;
  if (expectedColor && candidateColor === expectedColor) score += 0.08;
  if (requiredNumbers.length) score += 0.08;
  score = Math.min(1, Math.round(score * 10000) / 10000);

  return {
    score,
    accepted: score >= 0.62,
    reason: score >= 0.62 ? 'candidate' : 'low_score',
    matchedTokens: matched
  };
}

export function likelyNeedsComponents(config) {
  const n = normalize([config.name, config.subtitle].filter(Boolean).join(' '));
  return /taschen|hullen|stativen|stative|power|touring|2 tops|4 sub|2 sub|install/.test(n);
}


export function confidenceBand(score) {
  if (score >= 0.90) return 'high';
  if (score >= 0.80) return 'medium';
  return 'low';
}
