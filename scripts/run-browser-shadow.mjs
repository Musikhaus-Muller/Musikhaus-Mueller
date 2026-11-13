import fs from 'node:fs/promises';
// The dependency belongs to the isolated collector package, not the production
// application dependency graph. Use its ESM entry explicitly from this shadow.
import { chromium } from '../collector/node_modules/playwright/index.mjs';
import { evaluateThomannBrowserOffer } from '../collector/browser/thomann-browser.mjs';
import { evaluateMusicStoreBrowserOffer } from '../collector/browser/musicstore-browser.mjs';
import { evaluateHotSoundBrowserOffer } from '../collector/browser/hotsound-browser.mjs';
import { articleNumberFromMusicStoreUrl } from '../collector/musicstore-article-catalog.mjs';

const shop = process.argv.find(arg => arg.startsWith('--shop='))?.slice(7);
const headed = process.argv.includes('--headed');
const headless = process.argv.includes('--headless');
if (!['thomann', 'musicstore', 'hotsound'].includes(shop)) throw new Error('--shop=thomann|musicstore|hotsound is required');
if (headed === headless) throw new Error('Choose exactly one of --headed or --headless');
if (!process.argv.includes('--canary')) throw new Error('This read-only runner starts with --canary only; it cannot collect all offers yet');

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
    componentDetails: (offer.componentDetails || []).map(normalizeComponent),
    collectionDisabled: offer.collectionDisabled === true,
    calculation: offer.calculation || null,
    previousPrice: Number(offer.price)
  };
}

const selected = canaries[shop].map(reference => seed.find(row => row.id === reference)).filter(row => row?.offers?.[shop]).map(targetFor);
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
    rows.push({ ...result, previous_price: target.previousPrice });
    if (result.http_status === 429) rateLimited += 1;
    await page.waitForTimeout(900);
  }
} finally {
  await context.close();
  await browser.close();
}

const summary = {
  tested: rows.length,
  rendered: rows.filter(row => row.http_status >= 200 && row.http_status < 300 && !row.challenge_detected).length,
  exact_identities: rows.filter(row => row.identity_valid).length,
  prices_recovered: rows.filter(row => row.decision === 'refreshable').length,
  blocked: rows.filter(row => row.decision === 'blocked').length,
  not_found: rows.filter(row => row.decision === 'not_found').length,
  writes: false,
  mode: headed ? 'headed' : 'headless'
};
const report = { shop, scope: 'browser_canary', writes: false, observed_at: new Date().toISOString(), rows, summary };
await fs.mkdir(new URL('../reports/', import.meta.url), { recursive: true });
await fs.writeFile(new URL(`../reports/${shop}-browser-shadow.json`, import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(summary));
