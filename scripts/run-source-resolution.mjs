import fs from 'node:fs/promises';
import { buildThomannShadowReport } from '../collector/thomann-shadow.mjs';
import { buildMusicStoreShadowReport } from '../collector/musicstore-shadow.mjs';

const shop = process.argv.find(arg => arg.startsWith('--shop='))?.slice(7);
if (!['thomann', 'musicstore', 'hotsound'].includes(shop)) throw new Error('--shop=thomann|musicstore|hotsound is required');
const seed = JSON.parse(await fs.readFile(new URL('../web/seed.json', import.meta.url), 'utf8'));
const output = new URL(`../reports/${shop}-source-resolution.json`, import.meta.url);

async function hotSoundReport() {
  const cache = new Map();
  const rows = [];
  for (const row of seed.filter(item => item.offers?.hotsound)) {
    const offer = row.offers.hotsound;
    let page = cache.get(offer.url);
    if (!page) {
      try {
        const response = await fetch(offer.url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'PA-Bundle-Source-Resolution/1.0 read-only' } });
        page = { status: response.status, html: response.ok ? await response.text() : '' };
      } catch (error) { page = { status: null, error: String(error.message || error), html: '' }; }
      cache.set(offer.url, page);
    }
    const protectedContent = /captcha|access denied|just a moment|cloudflare|zugriffsschutz/i.test(page.html);
    const decision = page.status === 404 || page.status === 410 ? 'not_found'
      : page.status === 403 || page.status === 429 || protectedContent ? 'blocked'
      : page.status && page.status >= 200 && page.status < 300 ? 'parse_error' : 'network_error';
    rows.push({ reference: row.id, shop: 'hotsound', url: offer.url, expected_name: offer.name, previous_price: Number(offer.price), previous_price_date: offer.priceDate || null, sources_tested: [{ method: 'official_product_html', type: 'official_structured_product_data', http_status: page.status, protected_content: protectedContent }], selected_source: null, observed_unit_price: null, observed_total_price: null, auto_refresh_eligible: false, proposal_only: false, decision, ...(page.error ? { error: page.error } : {}) });
  }
  return { shop: 'hotsound', writes: false, observed_at: new Date().toISOString(), rows, summary: summarize(rows) };
}

function normalize(shop, report) {
  const rows = report.rows.map(row => ({ ...row, shop, expected_sku: row.article_number || null, sources_tested: [{ method: row.source_method || 'official_product_html', type: 'official_structured_product_data', url: row.source_url || row.url, http_status: row.http_status }], selected_source: row.decision === 'refreshable_shadow' ? row.source_method || 'official_product_html' : null, observed_unit_price: row.unit_price, observed_total_price: row.total_price, auto_refresh_eligible: row.decision === 'refreshable_shadow', proposal_only: false, decision: row.decision === 'refreshable_shadow' ? 'refreshable' : row.decision }));
  return { shop, writes: false, observed_at: report.observed_at, rows, summary: summarize(rows) };
}

function summarize(rows) {
  const count = decision => rows.filter(row => row.decision === decision).length;
  const refreshable = count('refreshable');
  return { active: rows.length, evaluated: rows.length, refreshable, proposal_only: count('proposal_only'), blocked: count('blocked'), rate_limited: rows.filter(row => row.http_status === 429).length, not_found: count('not_found'), invalid_identity: count('identity_mismatch') + count('article_number_mismatch'), unresolved: rows.length - refreshable - count('proposal_only') - count('blocked') - count('not_found'), coverage_pct: rows.length ? refreshable / rows.length * 100 : 0 };
}

const report = shop === 'thomann'
  ? normalize(shop, await buildThomannShadowReport({ seed, executionEnvironment: 'local' }))
  : shop === 'musicstore'
    ? normalize(shop, await buildMusicStoreShadowReport({ seed, executionEnvironment: 'local' }))
    : await hotSoundReport();
await fs.mkdir(new URL('../reports/', import.meta.url), { recursive: true });
await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary));
