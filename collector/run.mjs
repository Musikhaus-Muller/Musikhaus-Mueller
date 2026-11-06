import { chromium } from 'playwright';
import { parsePrice } from '../worker/handler.mjs';
import { strategyFor } from './strategies.mjs';
import { aggregateComponentResults, expectedNameFromUrl } from './components.mjs';
import { applyOfferMultiplier, classifyError, classifyHttpStatus, multiplierFor } from './pricing.mjs';
import { publicCatalogSourceFor, parseCatalogProductPrice, parseMusicStoreSkuPrice, catalogDiagnostic } from './catalog-sources.mjs';
import { deriveRunHealth } from './result-health.mjs';
import { formatResultLogMessage } from './result-log.mjs';

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

async function catalogAttemptTarget(offer, shopSlug) {
  const sourceUrl = publicCatalogSourceFor(shopSlug, offer.shop_product_name || '', offer.product_url || '');
  if (!sourceUrl) return { method: 'catalog', status: 'skipped', error: 'No public catalog source configured' };

  let res;
  try {
    res = await fetch(sourceUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6',
        'User-Agent': 'Mozilla/5.0 (compatible; PA-Bundle-Preisvergleich/1.0; +price-monitor)'
      }
    });
  } catch (e) {
    return { method: 'catalog', status: 'network_error', error: e.message };
  }
  if (!res.ok) {
    return { method: 'catalog', status: classifyHttpStatus(res.status), httpStatus: res.status, error: `HTTP ${res.status}` };
  }

  const html = await res.text();
  try {
    const parsed = shopSlug === 'musicstore'
      ? parseMusicStoreSkuPrice(html, offer.product_url || '', offer.shop_product_name || '')
      : parseCatalogProductPrice(html, offer.shop_product_name || '');
    const multiplier = multiplierFor(offer);
    return {
      method: 'catalog',
      status: 'success',
      httpStatus: res.status,
      price: applyOfferMultiplier(parsed.price, multiplier),
      available: parsed.available,
      evidence: `Official shop catalog fallback: ${sourceUrl}`
    };
  } catch (e) {
    const diagnostic = catalogDiagnostic(html, offer.shop_product_name || '');
    return {
      method: 'catalog',
      status: classifyError(e),
      httpStatus: res.status,
      error: `${e.message}; diagnostic=${JSON.stringify(diagnostic)}`
    };
  }
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
  if (!res.ok) {
    return { method: 'http', status: classifyHttpStatus(res.status), httpStatus: res.status, error: `HTTP ${res.status}` };
  }
  const html = await res.text();
  try {
    const parsed = parsePrice(html, offer.shop_product_name || '', new URL(offer.product_url).hostname, offer.contents || '');
    const multiplier = multiplierFor(offer);
    return {
      method: 'http',
      status: 'success',
      httpStatus: res.status,
      price: applyOfferMultiplier(parsed.price, multiplier),
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
        parsed = parsePrice(html, offer.shop_product_name || '', new URL(resolvedUrl).hostname, offer.contents || '');
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
        parsed = parsePrice(html, offer.shop_product_name || '', new URL(resolvedUrl).hostname, offer.contents || '');
      }
      const multiplier = multiplierFor(offer);
      await context.close();
      return {
        method: 'browser',
        status: 'success',
        httpStatus: response?.status(),
        price: applyOfferMultiplier(parsed.price, multiplier),
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
  rest('offers?select=id,configuration_id,shop_id,shop_product_name,product_url,contents,calculation,metadata&active=eq.true&product_url=not.is.null'),
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

const runMetadata = { shop: shopFilter, httpOnly, strategyVersion: 1 };
let run;
if (process.env.COLLECT_RUN_ID) {
  const runId = process.env.COLLECT_RUN_ID;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(runId)) {
    throw new Error('COLLECT_RUN_ID must be a UUID');
  }
  [run] = await rest(`collection_runs?id=eq.${encodeURIComponent(runId)}&status=eq.running`, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: {
      offers_total: selected.length,
      metadata: {
        ...(run.metadata || {}),
        ...runMetadata,
        source: 'web',
        lifecycle: 'running'
      }
    }
  });
  if (!run) throw new Error(`Reserved collection run not found: ${runId}`);
} else {
  [run] = await rest('collection_runs', {
    method: 'POST',
    prefer: 'return=representation',
    body: [{
      trigger_type: process.env.COLLECT_TRIGGER || 'manual',
      status: 'running',
      offers_total: selected.length,
      metadata: runMetadata
    }]
  });
}

const results = [];
const browserBlockedHosts = new Set();
let fatalError = null;
try {
  for (const offer of selected) {
    const shop = offer.shop;
    const strategy = strategyFor(shop.slug);
    process.stdout.write(`[${results.length + 1}/${selected.length}] ${shop.name} · ${offer.configuration?.name || offer.id} ... `);

    let final;
    if (offer.components.length > 0) {
      const componentResults = [];
      for (const component of offer.components) {
        const expected = component.expected_product_name || component.label || expectedNameFromUrl(component.product_url);
        const target = {
          product_url: component.product_url,
          shop_product_name: expected,
          calculation: null
        };
        const http = await httpAttemptTarget(target);
        await recordComponentObservation({ component, runId: run.id, result: http });

        let result = http;
        if (http.status !== 'success' && strategy.publicSource) {
          const catalog = await catalogAttemptTarget(target, shop.slug);
          if (catalog.status === 'success') {
            result = catalog;
            await recordComponentObservation({ component, runId: run.id, result });
          } else if (catalog.status !== 'skipped') {
            result = {
              ...http,
              error: `${http.error || http.status}; catalog=${catalog.error || catalog.status}`
            };
          }
        }
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
      if (http.status !== 'success' && strategy.publicSource) {
        const catalog = await catalogAttemptTarget(offer, shop.slug);
        if (catalog.status === 'success') {
          final = catalog;
          await recordObservation({ offer, runId: run.id, result: final });
        } else if (catalog.status !== 'skipped') {
          final = {
            ...http,
            error: `${http.error || http.status}; catalog=${catalog.error || catalog.status}`
          };
        }
      }
      if (final.status !== 'success' && !strategy.browserFallback) {
        final = {
          ...final,
          error: `${final.error || final.status}; strategy=${strategy.mode}; previous valid price preserved`
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

    results.push({ status: final.status });
    if (final.status === 'success') {
      console.log(`OK ${final.price} EUR (${final.method})`);
    } else {
      console.log(`${final.status}: ${formatResultLogMessage(final, { bundle: offer.components.length > 0 })}`);
    }
  }
} catch (error) {
  fatalError = error;
  throw error;
} finally {
  let closeError = null;
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      closeError = error;
      if (!fatalError) fatalError = error;
    }
  }
  const health = deriveRunHealth(results, { fatalError });
  const { status, checked, updated, preserved, hardFailed } = health;
  const finishedAt = new Date().toISOString();
  await rest(`collection_runs?id=eq.${run.id}`, {
    method: 'PATCH',
    prefer: 'return=minimal',
    body: {
      status,
      finished_at: finishedAt,
      offers_checked: checked,
      offers_updated: updated,
      offers_failed: hardFailed,
      metadata: {
        ...(run.metadata || runMetadata),
        lifecycle: status,
        health_status: health.healthStatus,
        result_counts: health.resultCounts,
        ...(fatalError ? { error: String(fatalError.message || fatalError) } : {}),
        collector_finished_at: finishedAt
      }
    }
  });
  console.log(`Run ${run.id}: ${status} · ${updated} updated · ${preserved} preserved · ${hardFailed} hard failures`);
  console.log(JSON.stringify({
    runId: run.id,
    status,
    health_status: health.healthStatus,
    checked,
    updated,
    preserved,
    hardFailed,
    result_counts: health.resultCounts
  }, null, 2));
  if (closeError && closeError === fatalError) throw closeError;
}
