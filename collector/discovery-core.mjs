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
  .replace(/(\d)m\b/g, '$1 m')
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
  const base=normalize(value).split(' ').filter(t => t.length > 1 && !stop.has(t));
  const expanded=[];
  for(const token of base){
    expanded.push(token);
    if(token.endsWith('kabel') && token!=='kabel') expanded.push('kabel');
  }
  return [...new Set(expanded)];
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

function cableLengthMeters(value) {
  const raw = decode(value).toLowerCase().replace(/&nbsp;|&#160;/gi, ' ');
  const matches = [...raw.matchAll(/(?:^|[^a-z0-9])(\d+(?:[.,]\d+)?)\s*m\b/gi)];
  if (!matches.length) return null;
  const parsed = Number(matches[matches.length - 1][1].replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function gravityModel(value) {
  const n = normalize(value);
  const m = n.match(/\b(sp|tsp)\s*(\d{4})\s*b\b/);
  return m ? `${m[1]}-${m[2]}-b` : null;
}

function accessoryFamily(value) {
  const n = normalize(value);
  for (const family of ['icoa','stinger','maui','dave']) {
    if (new RegExp(`\\b${family}\\b`).test(n)) return family;
  }
  return null;
}


function accessoryKind(value) {
  const n = normalize(value);
  if (/\b(sat bag|sub bag|sub pc|wpc|bag|tasche|tragetasche|schutzhuelle|schutzhulle|wetterschutzhuelle|cover|rollbrett|roll board|caster board|casterboard|cb|pc|easymount|traversenhalterung|halterung|xlr|kabel|cable|stativ|stative|speaker stand|distanzstange|distanzrohr|powercon|power twist)\b/.test(n)) {
    return 'accessory';
  }
  return null;
}

function accessorySubtype(value) {
  const n = normalize(value);
  if (/\b(sat bag|saulen.*bag|tragetasche.*saulen)\b/.test(n)) return 'sat_bag';
  if (/\b(sub bag|sub pc|subwooferhulle|subwoofer.*schutzhuelle)\b/.test(n)) return 'sub_cover';
  if (/\b(cb|rollbrett|roll board|caster board|casterboard)\b/.test(n)) return 'rollboard';
  if (/\b(wpc|wetterschutzhuelle)\b/.test(n)) return 'weather_cover';
  if (/\bpc\b/.test(n)) return 'padded_cover';
  if (/\b(cover|schutzhuelle|schutzhulle|hulle)\b/.test(n)) return 'cover';
  if (/\b(stativ|stative|speaker stand|distanzstange|distanzrohr)\b/.test(n) || /\b(?:sp|tsp)\s*\d{4}\s*b\b/.test(n)) return 'stand';
  if (/\b(xlr)\b/.test(n) && /\b(powercon|power con|p con|power twist)\b/.test(n)) return 'hybrid_cable';
  if (/\b(powercon|power con|p con|power twist)\b/.test(n)) return 'powercon_cable';
  if (/\b(dmx|dmx512)\b/.test(n) && /\b(xlr)\b/.test(n)) return 'dmx_xlr_cable';
  if (/\b(xlr)\b/.test(n)) return 'xlr_cable';
  if (/\b(kabel|cable)\b/.test(n)) return 'cable';
  if (/\b(easymount|traversenhalterung|halterung)\b/.test(n)) return 'mount';
  return null;
}

function activeKind(value) {
  const n = normalize(value);
  if (/\b(passiv|passive|passiver)\b/.test(n)) return 'passive';
  if (/\b(aktiv|aktive|aktiver|active)\b/.test(n)) return 'active';
  if (/\b\d{1,2}\s*a\b/.test(n) || /\bsub\s+\d{1,2}\s+a\b/.test(n)) return 'active';
  return null;
}

function isBundleProduct(value) {
  const n = normalize(value);
  return /\b(stereo bundle|bundle|bundle set|2x|2 x)\b/.test(n);
}

function structuralSubtype(value) {
  const n = normalize(value);
  if (/\b(sub|subwoofer)\b/.test(n)) return 'subwoofer';
  if (/\bmix\b/.test(n)) return 'mixer_system';
  return 'system';
}

function icoaStructuralVariant(value) {
  const n = normalize(value);
  if (!/\bicoa\b/.test(n)) return null;
  return {
    pro: /\bicoa\s+pro\b/.test(n) || /\bicoa\s+sub\s+\d{1,2}\s+a\s+pro\b/.test(n),
    bt: /\bicoa\s+\d{1,2}\s+a\s+bt\b/.test(n)
  };
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
  const accessorySources = [
    'https://www.prolighting.de/de/zubehoer/kabel-stecker/audiokabel/xlr-xlr.html?view=classic',
    'https://www.prolighting.de/de/zubehoer/kabel-stecker/stromkabel/powerconkabel.html?view=classic',
    'https://www.prolighting.de/de/hersteller/gravity.html?sort=2&view=list',
    'https://www.prolighting.de/de/zubehoer/cases-racks-taschen/taschen/stativtaschen.html?sort=1&view=list'
  ];

  if (family === 'maui') return [
    'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-maui-serie.html?view=classic',
    ldBase,
    ...accessorySources
  ];
  if (family === 'dave') return [ldBase];
  if (family === 'stinger') return [
    'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-stinger-g3-serie.html?view=classic',
    ldBase,
    ...accessorySources
  ];
  if (family === 'icoa') {
    const specific = name.includes('pro')
      ? 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-pro-serie.html?view=classic'
      : 'https://www.prolighting.de/de/tontechnik/lautsprecherboxen/boxen-nach-hersteller/ld-systems/ld-systems-icoa-serie.html?view=classic';
    return [specific, ldBase, ...accessorySources];
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


export function scoreComponentCandidate(component, candidate) {
  const expectedName = component?.expected || component?.label || '';
  const candidateName = candidate?.name || '';
  const expectedAccessory = component?.kind === 'accessory';
  const candidateAccessory = Boolean(accessoryKind(candidateName));

  if (expectedAccessory !== candidateAccessory) {
    return { score: 0, accepted: false, reason: 'component_kind_mismatch' };
  }

  if (!expectedAccessory && isBundleProduct(candidateName) && !isBundleProduct(expectedName)) {
    return { score: 0, accepted: false, reason: 'bundle_component_mismatch' };
  }

  if (!expectedAccessory) {
    const expectedSubtype = structuralSubtype(expectedName);
    const candidateSubtype = structuralSubtype(candidateName);
    if (expectedSubtype !== candidateSubtype) {
      return { score: 0, accepted: false, reason: 'structural_subtype_mismatch' };
    }

    const expectedIcoa = icoaStructuralVariant(expectedName);
    const candidateIcoa = icoaStructuralVariant(candidateName);
    if (expectedIcoa && candidateIcoa && (
      expectedIcoa.pro !== candidateIcoa.pro || expectedIcoa.bt !== candidateIcoa.bt
    )) {
      return { score: 0, accepted: false, reason: 'model_variant_mismatch' };
    }
  }

  if (expectedAccessory) {
    const expectedSubtype = accessorySubtype(expectedName);
    const candidateSubtype = accessorySubtype(candidateName);
    if (expectedSubtype && candidateSubtype && expectedSubtype !== candidateSubtype) {
      return { score: 0, accepted: false, reason: 'accessory_subtype_mismatch' };
    }

    if (['xlr_cable','powercon_cable','hybrid_cable','cable'].includes(expectedSubtype)) {
      const expectedLength = cableLengthMeters(expectedName);
      const candidateLength = cableLengthMeters(candidateName);
      if (expectedLength !== null && candidateLength !== expectedLength) {
        return { score: 0, accepted: false, reason: 'cable_length_mismatch' };
      }
    }

    if (expectedSubtype === 'stand') {
      const expectedGravity = gravityModel(expectedName);
      const candidateGravity = gravityModel(candidateName);
      if (expectedGravity && candidateGravity !== expectedGravity) {
        return { score: 0, accepted: false, reason: 'stand_model_mismatch' };
      }
    }

    if (['padded_cover','sub_cover','cover','weather_cover'].includes(expectedSubtype)) {
      const expectedFamily = accessoryFamily(expectedName);
      const candidateFamily = accessoryFamily(candidateName);
      if (expectedFamily && candidateFamily !== expectedFamily) {
        return { score: 0, accepted: false, reason: 'accessory_family_mismatch' };
      }
    }
  }

  const expectedActive = activeKind(expectedName);
  const candidateActive = activeKind(candidateName);
  if (expectedActive && candidateActive && expectedActive !== candidateActive) {
    return { score: 0, accepted: false, reason: 'amplification_mismatch' };
  }
  if (expectedActive === 'active' && !candidateActive && /\b\d{1,2}\s+a\b/.test(normalize(expectedName))) {
    return { score: 0, accepted: false, reason: 'amplification_mismatch' };
  }

  const expectedGen = generationOf(expectedName);
  const candidateGen = generationOf(candidateName);
  if (expectedGen && candidateGen !== expectedGen) {
    return { score: 0, accepted: false, reason: 'generation_mismatch' };
  }

  const expectedColor = colorOf(expectedName);
  const candidateColor = colorOf(candidateName);
  if (expectedColor && candidateColor && expectedColor !== candidateColor) {
    return { score: 0, accepted: false, reason: 'color_mismatch' };
  }

  const requiredNumbers = modelNumbers(expectedName);
  const candidateNums = new Set(modelNumbers(candidateName));
  if (requiredNumbers.some(n => !candidateNums.has(n))) {
    return { score: 0, accepted: false, reason: 'model_number_mismatch' };
  }

  const wanted = tokens(expectedName);
  const got = new Set(tokens(candidateName));
  const matched = wanted.filter(t => got.has(t));
  let score = wanted.length ? matched.length / wanted.length : 0;

  if (expectedGen && candidateGen === expectedGen) score += 0.08;
  if (expectedColor && candidateColor === expectedColor) score += 0.08;
  if (requiredNumbers.length) score += 0.08;
  if (expectedAccessory && candidateAccessory) score += 0.05;
  score = Math.min(1, Math.round(score * 10000) / 10000);

  return {
    score,
    accepted: score >= 0.68,
    reason: score >= 0.68 ? 'component_candidate' : 'low_score',
    matchedTokens: matched
  };
}

export function discoveryRecipe(config) {
  const recipe = config?.metadata?.discovery_recipe;
  if (!recipe || recipe.mode !== 'components' || !Array.isArray(recipe.components)) return null;
  return recipe;
}


export function discoverySeedCandidatesFor(config) {
  const family = normalize(config?.family);
  if (!['maui','stinger','icoa'].includes(family)) return [];
  return [
    {
      name: 'ah Cables 3 STAR MMF 0300 - Mikrofonkabel - Adam Hall XLR Female x XLR Male - 3 m',
      url: 'https://www.prolighting.de/en/accessories/cable-connectors/audio-cable/xlr-xlr/ah-cables-3-star-mmf-0300-mikrofonkabel-adam-hall-r-xlr-female-x-xlr-male-3-m.html',
      price: null
    },
    {
      name: 'Gravity SP 2332 B - Verstellbares Distanzrohr, 35 mm auf M20, 1400 mm',
      url: 'https://www.prolighting.de/en/stands/distance-rod/distance-rod-35mm/gravity-sp-2332-b-verstellbares-distanzrohr-35-mm-auf-m20-1400-mmgravity-sp-2332-b-verstellbares-distanzrohr-35.html',
      price: null
    }
  ];
}
