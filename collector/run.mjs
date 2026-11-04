import { chromium } from 'playwright';
import { parsePrice } from '../worker/handler.mjs';
import { strategyFor } from './strategies.mjs';
import { aggregateComponentResults, expectedNameFromUrl } from './components.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');
}

const args = Object.fromEntries(process.argv.slice(2).map(v => {
  const [k, ...rest] = v.replace(/^--/, '').split('=');
  return [k, rest.length ? rest.join('=') : true];
}));
const shopFilter = args.shop && args.shop !== true ? String(args.shop) : null;
const limit = args.limit && args.limit !== true ? Number(args.limit) : Infinity;
const httpOnly = args['http-only'] === true;

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

function classifyError(error) {
  const msg = String(error?.message || error);
  if (/captcha|cf-chl|just a moment|zugriffsschutz/i.test(msg)) return 'captcha';
  if (/HTTP (403|429)/i.test(msg)) return 'blocked';
  if (/timeout|zeitüberschreitung/i.test(msg)) return 'network_error';
  if (/eindeutiger EUR|price|preis/i.test(msg)) return 'parse_error';
  return 'network_error';
}

function multiplierFor(offer) {
  const m = String(offer.calculation || '').match(/^\s*(\d+)\s*[×x]/);
  return m ? Number(m[1]) : 1;
}

async function recordComponentObservation({ component, runId, result }) {
  await rest('component_price_observations', {
    method: 'POST',
    prefer: 'return=minimal',
    body: [{
      offer_component_id: component.id,
      run_id: runId,
      price: result.price ?? null,
      currency: 'EUR',
      availability: result.available === undefined ? null : (result.available ? 'available' : 'unavailable'),
      status: result.status,
      source_method: result.method,
      http_status: result.httpStatus ?? null,
      verified: result.status === 'success',
      evidence: result.evidence ?? null,
      error_message: result.error ?? null,
      observed_at: new Date().toISOString(),
      metadata: { url: component.product_url, quantity: component.quantity }
    }]
  });
}

async function recordObservation({ offer, runId, result }) {
  await rest('price_observations', {
    method: 'POST',
    prefer: 'return=minimal',
    body: [{
      offer_id: offer.id,
      run_id: runId,
      price: result.price ?? null,
      currency: 'EUR',
      availability: result.available === undefined ? null : (result.available ? 'available' : 'unavailable'),
      status: result.status,
      source_method: result.method,
      http_status: result.httpStatus ?? null,
      verified: result.status === 'success',
      raw_product_name: offer.shop_product_name,
      evidence: result.evidence ?? null,
      error_message: result.error ?? null,
      observed_at: new Date().toISOString(),
      metadata: { url: offer.product_url }
    }]
  });
}

async function httpAttemptTarget(offer) {
  let res;
  try {
    res = await fetch(offer.product_url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6',
        'User-Agent': 'Mozilla/5.0 (compatible; PA-Bundle-Preisvergleich/1.0; +price-monitor)'
      }
    });
  } catch (e) {
    return { method: 'http', status: 'network_error', error: e.message };
  }
  if (res.status === 403 || res.status === 429) {
    return { method: 'http', status: 'blocked', httpStatus: res.status, error: `HTTP ${res.status}` };
  }
  if (!res.ok) {
    return { method: 'http', status: 'network_error', httpStatus: res.status, error: `HTTP ${res.status}` };
  }
  const html = await res.text();
  try {
    const parsed = parsePrice(html, offer.shop_product_name || '', new URL(offer.product_url).hostname);
    const multiplier = multiplierFor(offer);
    return {
      method: 'http',
      status: 'success',
      httpStatus: res.status,
      price: Math.round(parsed.price * multiplier * 100) / 100,
      available: parsed.available,
      evidence: 'Direct HTTP fetch with product-name validation'
    };
  } catch (e) {
    return { method: 'http', status: classifyError(e), httpStatus: res.status, error: e.message };
  }
}

let browser;

async function resolveHotSoundProductPage(page, offer) {
  if (new URL(page.url()).hostname !== 'www.hotsound-store.com') return null;
  const expected = String(offer.shop_product_name || '').trim();
  if (!expected) return null;

  const href = await page.locator('a[href]').evaluateAll((anchors, wanted) => {
    const normalize = value => String(value || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
    const ignored = new Set(['ld','systems','system','aktivsystem','set','club','pa']);
    const tokens = normalize(wanted).split(' ').filter(t => t.length > 1 && !ignored.has(t));
    const required = tokens.filter(t => /\d/.test(t));
    let best = null;

    for (const a of anchors) {
      if (!a.href || !a.href.startsWith('http')) continue;
      const text = normalize([a.textContent, a.title, a.getAttribute('aria-label'), a.parentElement?.textContent?.slice(0,500)].filter(Boolean).join(' '));
      const words = new Set(text.split(' '));
      if (required.some(t => !words.has(t))) continue;
      const score = tokens.length ? tokens.filter(t => words.has(t)).length / tokens.length : 0;
      if (score >= 0.7 && (!best || score > best.score)) best = {href:a.href, score};
    }
    return best?.href || null;
  }, expected);

  if (!href || href === page.url()) return null;
  const target = new URL(href, page.url());
  return target.hostname === 'www.hotsound-store.com' ? target.href : null;
}

async function browserAttempt(offer) {
  try {
    browser ||= await chromium.launch({ headless: true });
    const context = await browser.newContext({
      locale: 'de-DE',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/156 Safari/537.36'
    });
    const page = await context.newPage();
    let response = await page.goto(offer.product_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    let html = await page.content();
    let title = await page.title().catch(() => '');
    if (/captcha|just a moment|challenge|access denied/i.test(title + '\n' + html.slice(0, 50000))) {
      await context.close();
      return { method: 'browser', status: 'captcha', httpStatus: response?.status(), error: 'CAPTCHA / access challenge detected' };
    }
    try {
      let parsed;
      let resolvedUrl = page.url();
      try {
        parsed = parsePrice(html, offer.shop_product_name || '', new URL(resolvedUrl).hostname);
      } catch (initialError) {
        const productUrl = await resolveHotSoundProductPage(page, offer);
        if (!productUrl) throw initialError;
        response = await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1200);
        html = await page.content();
        title = await page.title().catch(() => '');
        if (/captcha|just a moment|challenge|access denied/i.test(title + '\n' + html.slice(0, 50000))) {
          throw new Error('Zugriffsschutz / CAPTCHA');
        }
        resolvedUrl = page.url();
        parsed = parsePrice(html, offer.shop_product_name || '', new URL(resolvedUrl).hostname);
      }
      const multiplier = multiplierFor(offer);
      await context.close();
      return {
        method: 'browser',
        status: 'success',
        httpStatus: response?.status(),
        price: Math.round(parsed.price * multiplier * 100) / 100,
        available: parsed.available,
        evidence: resolvedUrl === offer.product_url
          ? 'Chromium page render with product-name validation'
          : 'Chromium category lookup resolved exact Hot Sound product page before price validation'
      };
    } catch (e) {
      await context.close();
      return { method: 'browser', status: classifyError(e), httpStatus: response?.status(), error: e.message };
    }
  } catch (e) {
    return { method: 'browser', status: classifyError(e), error: e.message };
  }
}

const [shops, configurations, offers, offerComponents] = await Promise.all([
  rest('shops?select=id,slug,name,collector_type&enabled=eq.true'),
  rest('configurations?select=id,legacy_id,name&active=eq.true'),
  rest('offers?select=id,configuration_id,shop_id,shop_product_name,product_url,calculation,metadata&active=eq.true&product_url=not.is.null'),
  rest('offer_components?select=id,offer_id,position,label,quantity,product_url,expected_product_name,metadata&active=eq.true&order=offer_id.asc,position.asc')
]);

const shopMap = new Map(shops.map(x => [x.id, x]));
const configMap = new Map(configurations.map(x => [x.id, x]));
const componentsByOffer = new Map();
for (const component of offerComponents) {
  if (!componentsByOffer.has(component.offer_id)) componentsByOffer.set(component.offer_id, []);
  componentsByOffer.get(component.offer_id).push(component);
}
const selected = offers
  .map(o => ({
    ...o,
    shop: shopMap.get(o.shop_id),
    configuration: configMap.get(o.configuration_id),
    components: componentsByOffer.get(o.id) || []
  }))
  .filter(o => o.shop && (o.metadata?.collection_disabled !== true || o.components.length > 0) && (!shopFilter || o.shop.slug === shopFilter))
  .slice(0, Number.isFinite(limit) ? limit : offers.length);

const [run] = await rest('collection_runs', {
  method: 'POST',
  prefer: 'return=representation',
  body: [{
    trigger_type: process.env.COLLECT_TRIGGER || (process.env.GITHUB_ACTIONS ? 'manual' : 'manual'),
    status: 'running',
    offers_total: selected.length,
    metadata: { shop: shopFilter, httpOnly, strategyVersion: 1 }
  }]
});

let checked = 0, updated = 0, failed = 0;
const browserBlockedHosts = new Set();
try {
  for (const offer of selected) {
    const shop = offer.shop;
    const strategy = strategyFor(shop.slug);
    process.stdout.write(`[${checked + 1}/${selected.length}] ${shop.name} · ${offer.configuration?.name || offer.id} ... `);

    let final;
    if (offer.components.length > 0) {
      const componentResults = [];
      for (const component of offer.components) {
        const expected = component.expected_product_name || component.label || expectedNameFromUrl(component.product_url);
        const result = await httpAttemptTarget({
          product_url: component.product_url,
          shop_product_name: expected,
          calculation: null
        });
        await recordComponentObservation({ component, runId: run.id, result });
        componentResults.push({ component, result });
      }
      final = aggregateComponentResults(componentResults);
      if (final.status !== 'success' && !strategy.browserFallback) {
        final = {
          ...final,
          error: `${final.error || final.status}; strategy=${strategy.mode}; previous valid bundle price preserved`
        };
      }
      await recordObservation({ offer, runId: run.id, result: final });
    } else {
      const http = await httpAttemptTarget(offer);
      await recordObservation({ offer, runId: run.id, result: http });

      final = http;
      const host = new URL(offer.product_url).hostname;
      if (http.status !== 'success' && !httpOnly && strategy.browserFallback) {
        if (browserBlockedHosts.has(host)) {
          final = { method: 'browser', status: 'blocked', error: 'Browser retry skipped after CAPTCHA / access block on this host' };
          await recordObservation({ offer, runId: run.id, result: final });
        } else {
          final = await browserAttempt(offer);
          await recordObservation({ offer, runId: run.id, result: final });
          if (final.status === 'captcha' || final.status === 'blocked') browserBlockedHosts.add(host);
        }
      } else if (http.status !== 'success' && !strategy.browserFallback) {
        final = {
          ...http,
          error: `${http.error || http.status}; strategy=${strategy.mode}; previous valid price preserved`
        };
      }
    }

    await rest('collection_results', {
      method: 'POST',
      prefer: 'return=minimal,resolution=merge-duplicates',
      body: [{
        run_id: run.id,
        offer_id: offer.id,
        status: final.status,
        price: final.price ?? null,
        source_method: final.method,
        http_status: final.httpStatus ?? null,
        message: final.error || final.evidence || null
      }]
    });

    checked++;
    if (final.status === 'success') {
      updated++;
      console.log(`OK ${final.price} EUR (${final.method})`);
    } else {
      failed++;
      console.log(`${final.status}: ${final.error}`);
    }
  }
} finally {
  if (browser) await browser.close();
  const status = failed === 0 ? 'success' : updated > 0 ? 'partial' : 'failed';
  await rest(`collection_runs?id=eq.${run.id}`, {
    method: 'PATCH',
    prefer: 'return=minimal',
    body: {
      status,
      finished_at: new Date().toISOString(),
      offers_checked: checked,
      offers_updated: updated,
      offers_failed: failed
    }
  });
  console.log(JSON.stringify({ runId: run.id, status, checked, updated, failed }, null, 2));
}
