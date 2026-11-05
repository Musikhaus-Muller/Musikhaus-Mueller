import {
  discoverySourcesFor,
  extractCatalogCandidates,
  scoreDiscoveryCandidate,
  likelyNeedsComponents,
  confidenceBand
} from './discovery-core.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');

const args = Object.fromEntries(process.argv.slice(2).map(v => {
  const [k, ...rest] = v.replace(/^--/, '').split('=');
  return [k, rest.length ? rest.join('=') : true];
}));
const shopSlug = args.shop && args.shop !== true ? String(args.shop) : 'prolighting';
const limit = args.limit && args.limit !== true ? Number(args.limit) : Infinity;
if (shopSlug !== 'prolighting') throw new Error('Collector 2.1 MVP currently supports --shop=prolighting only');

const headers = {
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
  ...(SUPABASE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE_KEY}` } : {})
};

async function rest(path, { method = 'GET', body, prefer } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6',
      'User-Agent': 'Mozilla/5.0 (compatible; PA-Bundle-Discovery/2.1; +candidate-monitor)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

const [shop] = await rest(`shops?select=id,slug,name&slug=eq.${encodeURIComponent(shopSlug)}&enabled=eq.true`);
if (!shop) throw new Error(`Shop not found: ${shopSlug}`);

const [configs, existing] = await Promise.all([
  rest('configurations?select=id,legacy_id,brand,family,name,subtitle,metadata&active=eq.true&order=legacy_id.asc'),
  rest(`offers?select=configuration_id&shop_id=eq.${shop.id}&active=eq.true`)
]);
const existingIds = new Set(existing.map(x => x.configuration_id));
const missing = configs.filter(c => !existingIds.has(c.id)).slice(0, Number.isFinite(limit) ? limit : configs.length);

const [run] = await rest('discovery_runs', {
  method: 'POST',
  prefer: 'return=representation',
  body: [{
    shop_id: shop.id,
    trigger_type: process.env.DISCOVERY_TRIGGER || 'manual',
    configurations_missing: missing.length,
    metadata: { collector: '2.1', mode: 'proposal-only' }
  }]
});

const sourceCache = new Map();
const sourceErrors = new Map();
const errors = [];
const confidenceCounts = { high: 0, medium: 0, low: 0 };
let candidatesFound = 0;
let configurationsWithCandidate = 0;
let noSource = 0;

for (const config of missing) {
  const sources = discoverySourcesFor(config);
  if (!sources.length) {
    noSource++;
    console.log(`[${config.legacy_id}] ${config.name} ... no_source`);
    continue;
  }

  const all = [];
  for (const sourceUrl of sources) {
    if (sourceErrors.has(sourceUrl)) continue;
    try {
      if (!sourceCache.has(sourceUrl)) sourceCache.set(sourceUrl, await fetchHtml(sourceUrl));
      const html = sourceCache.get(sourceUrl);
      for (const candidate of extractCatalogCandidates(html, sourceUrl)) {
        all.push({ ...candidate, sourceUrl });
      }
    } catch (e) {
      const error = { configuration: config.legacy_id, sourceUrl, message: e.message };
      sourceErrors.set(sourceUrl, error);
      errors.push(error);
    }
  }

  const ranked = all
    .map(candidate => ({ candidate, match: scoreDiscoveryCandidate(config, candidate) }))
    .filter(x => x.match.accepted)
    .sort((a, b) => b.match.score - a.match.score)
    .filter((x, i, arr) => arr.findIndex(y => y.candidate.url === x.candidate.url) === i)
    .slice(0, 3);

  if (!ranked.length) {
    console.log(`[${config.legacy_id}] ${config.name} ... no_candidate`);
    continue;
  }

  configurationsWithCandidate++;
  for (let rank = 0; rank < ranked.length; rank++) {
    const { candidate, match } = ranked[rank];
    const confidence = confidenceBand(match.score);
    confidenceCounts[confidence]++;
    await rest('discovery_candidates?on_conflict=configuration_id,shop_id,candidate_url', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: [{
        run_id: run.id,
        configuration_id: config.id,
        shop_id: shop.id,
        status: 'proposed',
        candidate_name: candidate.name,
        candidate_url: candidate.url,
        candidate_price: candidate.price,
        currency: 'EUR',
        match_score: match.score,
        source_url: candidate.sourceUrl,
        evidence: 'Official PRO LIGHTING catalog discovery; proposal only',
        metadata: {
          rank: rank + 1,
          matched_tokens: match.matchedTokens || [],
          likely_requires_components: likelyNeedsComponents(config),
          collector_version: '2.1',
          confidence
        },
        discovered_at: new Date().toISOString()
      }]
    });
    candidatesFound++;
  }
  console.log(`[${config.legacy_id}] ${config.name} ... ${ranked.length} candidate(s), best=${ranked[0].match.score} (${confidenceBand(ranked[0].match.score)})`);
}

const status = errors.length ? (candidatesFound ? 'partial' : 'failed') : 'success';
await rest(`discovery_runs?id=eq.${run.id}`, {
  method: 'PATCH',
  prefer: 'return=minimal',
  body: {
    status,
    finished_at: new Date().toISOString(),
    sources_scanned: sourceCache.size,
    candidates_found: candidatesFound,
    errors_count: errors.length,
    metadata: {
      collector: '2.1',
      mode: 'proposal-only',
      configurations_with_candidate: configurationsWithCandidate,
      configurations_without_source: noSource,
      confidence_counts: confidenceCounts,
      errors
    }
  }
});

if (errors.length) {
  console.log('sourceErrors=' + JSON.stringify(errors, null, 2));
}

console.log(JSON.stringify({
  runId: run.id,
  status,
  missingConfigurations: missing.length,
  sourcesScanned: sourceCache.size,
  configurationsWithCandidate,
  candidatesFound,
  noSource,
  confidence: confidenceCounts,
  errors: errors.length
}, null, 2));
