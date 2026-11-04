import { chromium } from 'playwright';
import { parsePrice } from '../worker/handler.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const args = Object.fromEntries(process.argv.slice(2).map(v => {
  const [k, ...rest] = v.replace(/^--/, '').split('=');
  return [k, rest.length ? rest.join('=') : true];
}));
const shopFilter = args.shop && args.shop !== true ? String(args.shop) : null;
const limit = args.limit && args.limit !== true ? Number(args.limit) : Infinity;
const httpOnly = args['http-only'] === true;

const headers = {
  apikey: SERVICE_ROLE,
  Authorization: `Bearer ${SERVICE_ROLE}`,
  'Content-Type': 'application/json'
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

async function httpAttempt(offer, shop) {
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
async function browserAttempt(offer) {
  try {
    browser ||= await chromium.launch({ headless: true });
    const context = await browser.newContext({
      locale: 'de-DE',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/156 Safari/537.36'
    });
    const page = await context.newPage();
    const response = await page.goto(offer.product_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const html = await page.content();
    const title = await page.title().catch(() => '');
    if (/captcha|just a moment|challenge|access denied/i.test(title + '\n' + html.slice(0, 50000))) {
      await context.close();
      return { method: 'browser', status: 'captcha', httpStatus: response?.status(), error: 'CAPTCHA / access challenge detected' };
    }
    try {
      const parsed = parsePrice(html, offer.shop_product_name || '', new URL(offer.product_url).hostname);
      const multiplier = multiplierFor(offer);
      await context.close();
      return {
        method: 'browser',
        status: 'success',
        httpStatus: response?.status(),
        price: Math.round(parsed.price * multiplier * 100) / 100,
        available: parsed.available,
        evidence: 'Chromium page render with product-name validation'
      };
    } catch (e) {
      await context.close();
      return { method: 'browser', status: classifyError(e), httpStatus: response?.status(), error: e.message };
    }
  } catch (e) {
    return { method: 'browser', status: classifyError(e), error: e.message };
  }
}

const [shops, configurations, offers] = await Promise.all([
  rest('shops?select=id,slug,name,collector_type&enabled=eq.true'),
  rest('configurations?select=id,legacy_id,name&active=eq.true'),
  rest('offers?select=id,configuration_id,shop_id,shop_product_name,product_url,calculation&active=eq.true&product_url=not.is.null')
]);

const shopMap = new Map(shops.map(x => [x.id, x]));
const configMap = new Map(configurations.map(x => [x.id, x]));
const selected = offers
  .map(o => ({ ...o, shop: shopMap.get(o.shop_id), configuration: configMap.get(o.configuration_id) }))
  .filter(o => o.shop && (!shopFilter || o.shop.slug === shopFilter))
  .slice(0, Number.isFinite(limit) ? limit : offers.length);

const [run] = await rest('collection_runs', {
  method: 'POST',
  prefer: 'return=representation',
  body: [{
    trigger_type: process.env.GITHUB_ACTIONS ? 'schedule' : 'manual',
    status: 'running',
    offers_total: selected.length,
    metadata: { shop: shopFilter, httpOnly }
  }]
});

let checked = 0, updated = 0, failed = 0;
try {
  for (const offer of selected) {
    const shop = offer.shop;
    process.stdout.write(`[${checked + 1}/${selected.length}] ${shop.name} · ${offer.configuration?.name || offer.id} ... `);

    const http = await httpAttempt(offer, shop);
    await recordObservation({ offer, runId: run.id, result: http });

    let final = http;
    if (http.status !== 'success' && !httpOnly) {
      final = await browserAttempt(offer);
      await recordObservation({ offer, runId: run.id, result: final });
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
