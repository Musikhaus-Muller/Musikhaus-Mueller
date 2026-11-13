import { applyOfferMultiplier, multiplierFor } from '../pricing.mjs';
import { validateSourceIdentity } from '../source-resolution.mjs';

const CHALLENGE = /captcha|cloudflare|just a moment|access denied|bot protection|security check|verify you are human/i;
const MONEY = /(?:€\s*|EUR\s*)(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?|\d+(?:\.\d{2})?)|(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?|\d+(?:\.\d{2})?)\s*(?:€|EUR)/gi;

export function challengeDetected({ title = '', html = '', iframeCount = 0 } = {}) {
  return CHALLENGE.test(`${title}\n${String(html).slice(0, 100000)}`) || iframeCount > 0 && /challenge|captcha/i.test(html);
}

export function cents(value) {
  const raw = String(value || '').trim();
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : /^\d+\.\d{2}$/.test(raw)
      ? raw
      : raw.replace(/\./g, '');
  const number = typeof value === 'number' ? value : Number(normalized);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : null;
}

function readPrice(value) {
  const match = String(value || '').match(MONEY);
  if (!match?.length) return null;
  const raw = match[0].replace(/[^0-9,.-]/g, '');
  return cents(raw);
}

function flattenJsonLd(value, output = []) {
  if (Array.isArray(value)) value.forEach(item => flattenJsonLd(item, output));
  else if (value && typeof value === 'object') {
    output.push(value);
    if (value['@graph']) flattenJsonLd(value['@graph'], output);
  }
  return output;
}

export function extractStructuredProduct(jsonTexts = []) {
  const products = [];
  for (const text of jsonTexts) {
    try {
      for (const entry of flattenJsonLd(JSON.parse(text))) {
        const types = Array.isArray(entry['@type']) ? entry['@type'] : [entry['@type']];
        if (types.includes('Product')) products.push(entry);
      }
    } catch { /* Invalid JSON-LD is not an identity shortcut. */ }
  }
  return products.map(product => {
    const offers = Array.isArray(product.offers) ? product.offers : [product.offers].filter(Boolean);
    const prices = offers.flatMap(offer => {
      const currency = offer.priceCurrency || offer.priceSpecification?.priceCurrency;
      const value = offer.price ?? offer.priceSpecification?.price;
      const amount = cents(value);
      return currency === 'EUR' && amount ? [{ cents: amount, source: 'json_ld', raw: String(value) }] : [];
    });
    return { name: product.name || '', sku: product.sku || product.mpn || '', brand: typeof product.brand === 'string' ? product.brand : product.brand?.name || '', prices };
  });
}

export function selectCommercialPrice({ products = [], metaPrices = [], visiblePrices = [] } = {}) {
  const jsonLd = products.flatMap(product => product.prices || []);
  const tiers = [jsonLd, metaPrices, visiblePrices];
  for (const candidates of tiers) {
    const values = [...new Set(candidates.map(candidate => candidate.cents).filter(Boolean))];
    if (values.length === 1) return { cents: values[0], candidates };
    if (values.length > 1) return { cents: null, candidates, error: 'Multiple commercial EUR prices in one extraction tier' };
  }
  return { cents: null, candidates: [], error: 'No commercial EUR price found' };
}

export async function inspectRenderedPage(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText || '';
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => node.textContent || '');
    const h1 = document.querySelector('h1')?.textContent?.trim() || '';
    const skuText = [...document.querySelectorAll('[itemprop="sku"], [data-sku], [data-article-number], [class*="article" i], [class*="sku" i]')]
      .map(node => `${node.getAttribute('content') || ''} ${node.getAttribute('data-sku') || ''} ${node.getAttribute('data-article-number') || ''} ${node.textContent || ''}`).join('\n');
    const rawPrices = [...document.querySelectorAll('[itemprop="price"], meta[property="product:price:amount"], meta[itemprop="price"], [data-testid*="price" i], [class*="price" i]')]
      .map(node => ({ text: `${node.getAttribute('content') || ''} ${node.textContent || ''}`.trim(), html: node.outerHTML.slice(0, 1000) }))
      .filter(row => row.text);
    return { title: document.title, text: text.slice(0, 100000), h1, jsonLd, skuText, rawPrices, iframeCount: document.querySelectorAll('iframe[src*="challenge" i], iframe[src*="captcha" i]').length };
  });
}

function visibleCommercialCandidates(rows) {
  return rows.flatMap(row => {
    if (/uvp|rrp|listenpreis|streichpreis|finanzierung|monat|sparen|versand/i.test(`${row.text} ${row.html}`)) return [];
    const price = readPrice(row.text);
    return price ? [{ cents: price, source: 'visible_price', raw: row.text }] : [];
  });
}

function pickProduct(products, expected) {
  const candidates = products.filter(product => validateSourceIdentity(expected, { ...product, shop: expected.shop }).valid);
  return candidates.length === 1 ? candidates[0] : null;
}

async function loadRenderedUrl(page, url, cache, waitMs) {
  if (cache.has(url)) return cache.get(url);
  const task = (async () => {
    let response;
    try {
      response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(waitMs);
    } catch (error) {
      return { finalUrl: page.url() || url, httpStatus: response?.status?.() || null, networkError: String(error.message || error) };
    }
    const rendered = await inspectRenderedPage(page);
    return { finalUrl: page.url(), httpStatus: response?.status?.() || null, ok: response?.ok(), rendered };
  })();
  cache.set(url, task);
  return task;
}

export async function evaluateBrowserTarget(target, { page, cache = new Map(), shop, waitMs = 1200 } = {}) {
    const loaded = await loadRenderedUrl(page, target.url, cache, waitMs);
    if (loaded.networkError) return { reference: target.reference, shop, url: target.url, final_url: loaded.finalUrl, http_status: loaded.httpStatus, product_identity: {}, price_candidates: [], observed_price: null, identity_valid: false, challenge_detected: false, decision: 'network_error', error: loaded.networkError };
    const rendered = loaded.rendered;
    const base = { reference: target.reference, shop, url: target.url, final_url: loaded.finalUrl, http_status: loaded.httpStatus, page_title: rendered.title, product_identity: {}, price_candidates: [], observed_price: null, identity_valid: false, challenge_detected: challengeDetected({ title: rendered.title, html: rendered.text, iframeCount: rendered.iframeCount }) };
    if (base.challenge_detected || [403, 429].includes(base.http_status)) return { ...base, decision: 'blocked' };
    if ([404, 410].includes(base.http_status)) return { ...base, decision: 'not_found' };
    if (!loaded.ok) return { ...base, decision: 'network_error' };
    const products = extractStructuredProduct(rendered.jsonLd);
    const expected = { shop, name: target.expectedName, ...(target.expectedSku ? { sku: target.expectedSku } : {}) };
    // A structured Product that disagrees is stronger evidence than an H1 and
    // must not be hidden by a title fallback. H1 is only usable when no Product
    // structure is present at all.
    const product = pickProduct(products, expected) || (products.length === 0 && rendered.h1 ? { name: rendered.h1, sku: target.expectedSku || '' } : null);
    const identity = product && validateSourceIdentity(expected, { ...product, shop });
    if (!identity?.valid) return { ...base, product_identity: product || {}, decision: 'identity_mismatch', error: identity?.reason || 'No unique structured product identity' };

    const metaPrices = [...rendered.skuText.matchAll(/(?:price|preis)[^0-9]{0,30}([0-9][0-9.,]+)/gi)].flatMap(match => {
      const value = cents(match[1]);
      return value ? [{ cents: value, source: 'product_state', raw: match[0] }] : [];
    });
    const price = selectCommercialPrice({ products: [product], metaPrices, visiblePrices: visibleCommercialCandidates(rendered.rawPrices) });
    if (!price.cents) return { ...base, product_identity: product, price_candidates: [...price.candidates, ...visibleCommercialCandidates(rendered.rawPrices)], identity_valid: true, decision: 'invalid_price', error: price.error };
    return { ...base, product_identity: product, price_candidates: price.candidates, observed_price: price.cents / 100, identity_valid: true, challenge_detected: false, decision: 'refreshable' };
}

export async function evaluateBrowserOffer(target, options) {
  if (!target.collectionDisabled) {
    const result = await evaluateBrowserTarget(target, options);
    if (result.decision !== 'refreshable') return result;
    const multiplier = multiplierFor({ calculation: target.calculation });
    return { ...result, observed_price: applyOfferMultiplier(result.observed_price, multiplier), unit_price: result.observed_price / multiplier, multiplier };
  }
  const details = Array.isArray(target.componentDetails) ? target.componentDetails : [];
  if (!details.length) return { reference: target.reference, shop: options.shop, url: target.url, final_url: target.url, previous_price: target.previousPrice, product_identity: {}, price_candidates: [], observed_price: null, identity_valid: false, challenge_detected: false, decision: 'incomplete_recipe', error: 'collectionDisabled offer has no explicit componentDetails' };
  const components = [];
  for (const component of details) {
    const result = await evaluateBrowserTarget({ reference: target.reference, url: component.url, expectedName: component.name, expectedSku: component.articleNumber || null }, options);
    components.push({ ...result, name: component.name, quantity: component.quantity });
    if (result.decision !== 'refreshable') return { reference: target.reference, shop: options.shop, url: target.url, final_url: target.url, previous_price: target.previousPrice, product_identity: {}, price_candidates: [], observed_price: null, identity_valid: false, challenge_detected: result.challenge_detected, decision: result.decision === 'not_found' ? 'incomplete_recipe' : result.decision, components, error: `Required component unavailable: ${component.name}` };
  }
  const total = components.reduce((sum, component) => sum + Math.round(component.observed_price * 100) * Number(component.quantity), 0);
  return { reference: target.reference, shop: options.shop, url: target.url, final_url: target.url, previous_price: target.previousPrice, product_identity: {}, price_candidates: [], observed_price: total / 100, identity_valid: true, challenge_detected: false, decision: 'refreshable', components };
}
