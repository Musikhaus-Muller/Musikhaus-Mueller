import fs from 'node:fs/promises';
import { buildThomannShadowReport } from '../collector/thomann-shadow.mjs';
import { buildMusicStoreShadowReport } from '../collector/musicstore-shadow.mjs';
import { probeThomannSources } from '../collector/thomann-source-probe.mjs';
import { probeMusicStoreSources } from '../collector/musicstore-source-probe.mjs';
import { probeHotSoundSources } from '../collector/hotsound-source-probe.mjs';

const shop = process.argv.find(arg => arg.startsWith('--shop='))?.slice(7);
if (!['thomann', 'musicstore', 'hotsound'].includes(shop)) throw new Error('--shop=thomann|musicstore|hotsound is required');
const seed = JSON.parse(await fs.readFile(new URL('../web/seed.json', import.meta.url), 'utf8'));
const output = new URL(`../reports/${shop}-source-resolution.json`, import.meta.url);

async function sharedOfficialSources(shop) {
  const settings = shop === 'thomann'
    ? { probe: probeThomannSources, identity: { shop: 'Thomann', name: 'Official sitemap catalog' }, sources: [{ type: 'official_catalog', method: 'sitemap_catalog', url: 'https://www.thomann.de/sitemap.xml' }, { type: 'official_search_endpoint', method: 'public_search_endpoint', url: null, applicable: false }, { type: 'official_public_feed', method: 'public_product_feed', url: null, applicable: false }, { type: 'external_verified_retailer_feed', method: 'retailer_attributed_sku_feed', url: null, applicable: false }, { type: 'external_price_aggregator', method: 'retailer_attributed_sku_listing', url: null, applicable: false }] }
    : shop === 'musicstore'
      ? { probe: probeMusicStoreSources, identity: { shop: 'Music Store', name: 'LD Systems official brand catalog' }, sources: [{ type: 'official_catalog', method: 'brand_catalog', url: 'https://www.musicstore.de/de_DE/EUR/brands/ld-systems/1' }, { type: 'official_search_endpoint', method: 'article_search', url: null, applicable: false }, { type: 'official_public_feed', method: 'public_product_feed', url: null, applicable: false }, { type: 'external_verified_retailer_feed', method: 'retailer_attributed_sku_feed', url: null, applicable: false }, { type: 'external_price_aggregator', method: 'retailer_attributed_sku_listing', url: null, applicable: false }] }
      : { probe: probeHotSoundSources, identity: { shop: 'Hot Sound', name: 'Official product catalog' }, sources: [{ type: 'official_catalog', method: 'sitemap_catalog', url: 'https://www.hotsound-store.com/sitemap.xml' }, { type: 'official_search_endpoint', method: 'public_search_endpoint', url: null, applicable: false }, { type: 'official_public_feed', method: 'public_product_feed', url: null, applicable: false }, { type: 'external_verified_retailer_feed', method: 'retailer_attributed_sku_feed', url: null, applicable: false }, { type: 'external_price_aggregator', method: 'retailer_attributed_sku_listing', url: null, applicable: false }] };
  const applicable = settings.sources.filter(source => source.applicable !== false);
  const probed = await settings.probe({ reference: '__shared__', expectedIdentity: settings.identity, sources: applicable });
  return [...probed.sources, ...settings.sources.filter(source => source.applicable === false).map(source => ({ status: 'source_not_available', reason: 'No public endpoint demonstrated for this shop', source: { type: source.type, method: source.method, url: null }, httpStatus: null }))];
}

async function hotSoundReport(sharedSources) {
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
    rows.push({ reference: row.id, shop: 'hotsound', url: offer.url, expected_name: offer.name, previous_price: Number(offer.price), previous_price_date: offer.priceDate || null, sources_tested: [{ source: { method: 'official_product_html', type: 'official_structured_product_data', url: offer.url }, httpStatus: page.status, protected_content: protectedContent, status: decision }, ...sharedSources], selected_source: null, observed_unit_price: null, observed_total_price: null, auto_refresh_eligible: false, proposal_only: false, decision, ...(page.error ? { error: page.error } : {}) });
  }
  return { shop: 'hotsound', writes: false, observed_at: new Date().toISOString(), rows, summary: summarize(rows) };
}

function normalize(shop, report, sharedSources) {
  const rows = report.rows.map(row => ({ ...row, shop, expected_sku: row.article_number || null, sources_tested: [{ status: row.decision === 'refreshable_shadow' ? 'success' : row.decision, source: { method: row.source_method || 'official_product_html', type: 'official_structured_product_data', url: row.source_url || row.url }, httpStatus: row.http_status }, ...sharedSources], selected_source: row.decision === 'refreshable_shadow' ? row.source_method || 'official_product_html' : null, observed_unit_price: row.unit_price, observed_total_price: row.total_price, auto_refresh_eligible: row.decision === 'refreshable_shadow', proposal_only: false, decision: row.decision === 'refreshable_shadow' ? 'refreshable' : row.decision }));
  return { shop, writes: false, observed_at: report.observed_at, rows, summary: summarize(rows) };
}

function summarize(rows) {
  const count = decision => rows.filter(row => row.decision === decision).length;
  const refreshable = count('refreshable');
  const sources = rows.flatMap(row => row.sources_tested || []);
  const typeOf = source => source.source?.type;
  const methodOf = source => source.source?.method;
  return { active: rows.length, evaluated: rows.length, refreshable, proposal_only: count('proposal_only'), blocked: count('blocked'), rate_limited: rows.filter(row => row.http_status === 429).length, not_found: count('not_found'), invalid_identity: count('identity_mismatch') + count('article_number_mismatch'), unresolved: rows.length - refreshable - count('proposal_only') - count('blocked') - count('not_found'), coverage_pct: rows.length ? refreshable / rows.length * 100 : 0, sources_attempted: sources.filter(source => source.status !== 'source_not_available').length, official_sources_attempted: sources.filter(source => source.status !== 'source_not_available' && String(typeOf(source)).startsWith('official_')).length, external_sources_attempted: sources.filter(source => source.status !== 'source_not_available' && String(typeOf(source)).startsWith('external_')).length, references_with_2plus_sources: rows.filter(row => row.sources_tested?.length >= 2).length, references_with_alternative_source: rows.filter(row => row.sources_tested?.some(source => methodOf(source) !== 'official_product_html' && source.status === 'success')).length, direct_html_success: rows.filter(row => row.sources_tested?.[0]?.status === 'success').length, alternative_official_success: rows.filter(row => row.sources_tested?.some(source => methodOf(source) !== 'official_product_html' && source.status === 'success')).length, external_proposal_success: sources.filter(source => String(typeOf(source)).startsWith('external_') && source.status === 'success').length, preserve_only_after_all_sources: rows.filter(row => row.decision !== 'refreshable' && row.decision !== 'proposal_only').length };
}

const sharedSources = await sharedOfficialSources(shop);
const report = shop === 'thomann'
  ? normalize(shop, await buildThomannShadowReport({ seed, executionEnvironment: 'local' }), sharedSources)
  : shop === 'musicstore'
    ? normalize(shop, await buildMusicStoreShadowReport({ seed, executionEnvironment: 'local' }), sharedSources)
    : await hotSoundReport(sharedSources);
await fs.mkdir(new URL('../reports/', import.meta.url), { recursive: true });
await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary));
