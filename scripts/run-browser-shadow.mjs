import fs from 'node:fs/promises';
// The dependency belongs to the isolated collector package, not the production
// application dependency graph. Use its ESM entry explicitly from this shadow.
import { chromium } from '../collector/node_modules/playwright/index.mjs';
import { evaluateThomannBrowserOffer } from '../collector/browser/thomann-browser.mjs';
import { evaluateMusicStoreBrowserOffer } from '../collector/browser/musicstore-browser.mjs';
import { evaluateHotSoundBrowserOffer } from '../collector/browser/hotsound-browser.mjs';
import { articleNumberFromMusicStoreUrl } from '../collector/musicstore-article-catalog.mjs';
import { VERSIONED_COMPONENT_DETAILS } from '../collector/browser/versioned-component-details.mjs';

const shop = process.argv.find(arg => arg.startsWith('--shop='))?.slice(7);
const headed = process.argv.includes('--headed');
const headless = process.argv.includes('--headless');
const canary = process.argv.includes('--canary');
const fullShadow = process.argv.includes('--full-shadow');
if (!['thomann', 'musicstore', 'hotsound'].includes(shop)) throw new Error('--shop=thomann|musicstore|hotsound is required');
if (headed === headless) throw new Error('Choose exactly one of --headed or --headless');
if (canary === fullShadow) throw new Error('Choose exactly one of --canary or --full-shadow');
if (fullShadow && shop === 'musicstore') throw new Error('Music Store remains canary-only: Chromium is still blocked');

const seed = JSON.parse(await fs.readFile(new URL('../web/seed.json', import.meta.url), 'utf8'));
const canaries = {
  thomann: ['r1', 'r6', 'r7', 'r10', 'r2', 'r5'],
  musicstore: ['r1', 'r6', 'r7', 'r8', 'r23', 'r28'],
  hotsound: ['r2', 'r4', 'r7', 'r19', 'r28', 'r30']
};
const displayShop = { thomann: 'Thomann', musicstore: 'Music Store', hotsound: 'Hot Sound' };
const evaluator = { thomann: evaluateThomannBrowserOffer, musicstore: evaluateMusicStoreBrowserOffer, hotsound: evaluateHotSoundBrowserOffer }[shop];

function targetFor(row) {
  const offer = row.offers[shop];
  const normalizeComponent = component => ({ ...component, articleNumber: shop === 'musicstore' ? articleNumberFromMusicStoreUrl(component.url) : null });
  return {
    reference: row.id,
    shop: displayShop[shop],
    url: offer.url,
    expectedName: offer.name,
    expectedSku: shop === 'musicstore' ? articleNumberFromMusicStoreUrl(offer.url) : null,
    quantity: 1,
    componentDetails: ((offer.componentDetails?.length ? offer.componentDetails : VERSIONED_COMPONENT_DETAILS[shop]?.[row.id]) || []).map(normalizeComponent),
    collectionDisabled: offer.collectionDisabled === true,
    calculation: offer.calculation || null,
    previousPrice: Number(offer.price)
  };
}

const selected = (fullShadow ? seed.filter(row => row?.offers?.[shop]) : canaries[shop].map(reference => seed.find(row => row.id === reference)).filter(row => row?.offers?.[shop])).map(targetFor);
const browser = await chromium.launch({ headless });
const context = await browser.newContext({ locale: 'de-DE' });
const page = await context.newPage();
const cache = new Map();
const rows = [];
let rateLimited = 0;
try {
  for (const target of selected) {
    if (rateLimited >= 2) {
      rows.push({ reference: target.reference, shop: displayShop[shop], url: target.url, previous_price: target.previousPrice, product_identity: {}, price_candidates: [], observed_price: null, identity_valid: false, challenge_detected: false, decision: 'blocked', error: 'Stopped after repeated rate limiting' });
      continue;
    }
    const result = await evaluator(target, { page, cache, waitMs: 1200 });
    const delta = result.decision === 'refreshable' ? Math.round((result.observed_price - target.previousPrice) * 100) / 100 : null;
    const deltaPct = delta !== null && target.previousPrice > 0 ? delta / target.previousPrice * 100 : null;
    rows.push({ ...result, previous_price: target.previousPrice, delta, delta_pct: deltaPct, manual_review_required: deltaPct !== null && Math.abs(deltaPct) > 20 });
    if (result.http_status === 429) rateLimited += 1;
    await page.waitForTimeout(900);
  }
} finally {
  await context.close();
  await browser.close();
}

const refreshable = rows.filter(row => row.decision === 'refreshable');
const summary = {
  tested: rows.length,
  rendered: rows.filter(row => row.http_status >= 200 && row.http_status < 300 && !row.challenge_detected).length,
  exact_identities: rows.filter(row => row.identity_valid).length,
  prices_recovered: refreshable.length,
  unchanged: refreshable.filter(row => row.delta === 0).length,
  changed: refreshable.filter(row => row.delta !== 0).length,
  manual_review_required: refreshable.filter(row => row.manual_review_required).length,
  blocked: rows.filter(row => row.decision === 'blocked').length,
  not_found: rows.filter(row => row.decision === 'not_found').length,
  writes: false,
  incomplete_recipe: rows.filter(row => row.decision === 'incomplete_recipe').length,
  coverage_pct: rows.length ? refreshable.length / rows.length * 100 : 0,
  mode: headed ? 'headed' : 'headless'
};
const report = { shop, scope: fullShadow ? 'browser_full_shadow' : 'browser_canary', writes: false, observed_at: new Date().toISOString(), rows, summary };
await fs.mkdir(new URL('../reports/', import.meta.url), { recursive: true });
await fs.writeFile(new URL(`../reports/${shop}-browser-shadow${fullShadow ? '-full' : ''}.json`, import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(summary));
