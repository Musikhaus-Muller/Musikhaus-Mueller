import { fileURLToPath } from 'node:url';
import { KIRSTEIN_EXACT_SKU_BINDINGS } from './kirstein-exact-sku-bindings.mjs';
import { runKirsteinShadow } from './kirstein-shadow.mjs';
import { applyOfferMultiplier, multiplierFor } from './pricing.mjs';
import { deriveRunHealth } from './result-health.mjs';

export const KIRSTEIN_OFFER_QUANTITIES = Object.freeze({
  r1: 2,
  r2: 2,
  r3: 1,
  r5: 2,
  r7: 2,
  r11: 2,
  r15: 1,
  r16: 1,
  r17: 1
});

const BOUND = KIRSTEIN_EXACT_SKU_BINDINGS.filter(binding => binding.status === 'bound');
const WRITE_CONFIRMATION = 'WRITE_KIRSTEIN_9';

function statusForDecision(decision) {
  if (decision === 'refreshable_shadow') return 'success';
  if (decision === 'blocked') return 'blocked';
  if (decision === 'not_found') return 'not_found';
  return 'parse_error';
}

export function buildKirsteinProductionPlan(shadowReport) {
  const byReference = new Map(shadowReport.results.map(result => [result.reference, result]));
  const rows = BOUND.map(binding => {
    const result = byReference.get(binding.reference);
    if (!result) throw new Error(`Missing shadow result for ${binding.reference}`);
    const quantity = KIRSTEIN_OFFER_QUANTITIES[binding.reference];
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error(`Missing safe quantity for ${binding.reference}`);
    }
    const refreshable = result.decision === 'refreshable_shadow';
    const totalPrice = refreshable ? applyOfferMultiplier(result.price, quantity) : null;
    return {
      reference: binding.reference,
      url: binding.url,
      expected_sku: binding.sku,
      quantity,
      unit_price: refreshable ? result.price : null,
      total_price: totalPrice,
      decision: result.decision,
      status: statusForDecision(result.decision),
      identity_valid: result.identity_valid === true,
      price_valid: result.price_valid === true
    };
  });

  return {
    execution_environment: shadowReport.execution_environment,
    observed_at: shadowReport.observed_at,
    writes: false,
    rows,
    summary: {
      total_bound: rows.length,
      refreshable: rows.filter(row => row.status === 'success').length,
      preserved: rows.filter(row => row.status !== 'success').length
    }
  };
}

function supabaseClient({ url, key, fetchImpl = fetch }) {
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required for write mode');
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {})
  };
  return async function rest(path, { method = 'GET', body, prefer } = {}) {
    const response = await fetchImpl(`${url}/rest/v1/${path}`, {
      method,
      headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${text}`);
    return text ? JSON.parse(text) : null;
  };
}

async function loadLiveOffers(rest) {
  const shops = await rest('shops?select=id,slug&slug=eq.kirstein&enabled=eq.true');
  if (shops.length !== 1) throw new Error('Expected exactly one enabled Kirstein shop');
  const shop = shops[0];

  const refs = BOUND.map(binding => binding.reference);
  const configs = await rest(`configurations?select=id,legacy_id&active=eq.true&legacy_id=in.(${refs.join(',')})`);
  const configById = new Map(configs.map(config => [config.id, config.legacy_id]));
  const offers = await rest(`offers?select=id,configuration_id,shop_id,shop_product_name,product_url,calculation,active&active=eq.true&shop_id=eq.${encodeURIComponent(shop.id)}`);

  return offers
    .map(offer => ({ ...offer, reference: configById.get(offer.configuration_id) }))
    .filter(offer => refs.includes(offer.reference));
}

export function validateLiveOfferBindings(liveOffers) {
  const byReference = new Map();
  for (const offer of liveOffers) {
    if (!offer.reference) continue;
    if (byReference.has(offer.reference)) throw new Error(`Duplicate live Kirstein offer for ${offer.reference}`);
    byReference.set(offer.reference, offer);
  }

  const validated = new Map();
  for (const binding of BOUND) {
    const offer = byReference.get(binding.reference);
    if (!offer) throw new Error(`Missing live Kirstein offer for ${binding.reference}`);
    if (offer.product_url !== binding.url) {
      throw new Error(`Live URL mismatch for ${binding.reference}`);
    }
    const multiplier = multiplierFor(offer);
    const expectedQuantity = KIRSTEIN_OFFER_QUANTITIES[binding.reference];
    if (multiplier !== expectedQuantity) {
      throw new Error(`Live quantity mismatch for ${binding.reference}: expected ${expectedQuantity}, got ${multiplier}`);
    }
    validated.set(binding.reference, offer);
  }
  return validated;
}

export async function writeKirsteinProduction({
  shadowReport,
  supabaseUrl,
  supabaseKey,
  confirmation,
  fetchImpl = fetch
}) {
  if (confirmation !== WRITE_CONFIRMATION) throw new Error(`Write mode requires confirmation ${WRITE_CONFIRMATION}`);
  if (shadowReport.execution_environment !== 'self_hosted') {
    throw new Error('Write mode requires a self_hosted shadow report');
  }

  const rest = supabaseClient({ url: supabaseUrl, key: supabaseKey, fetchImpl });
  const liveOffers = await loadLiveOffers(rest);
  const offerByReference = validateLiveOfferBindings(liveOffers);
  const plan = buildKirsteinProductionPlan(shadowReport);

  const [run] = await rest('collection_runs', {
    method: 'POST',
    prefer: 'return=representation',
    body: [{
      trigger_type: 'manual',
      status: 'running',
      offers_total: plan.rows.length,
      metadata: {
        shop: 'kirstein',
        execution_environment: 'self_hosted',
        strategy: 'kirstein_exact_sku_bindings_v1',
        guarded_manual_write: true
      }
    }]
  });

  const statuses = [];
  let fatalError = null;
  try {
    for (const row of plan.rows) {
      const offer = offerByReference.get(row.reference);
      const verified = row.status === 'success';
      const evidence = verified
        ? `Self-hosted exact URL + JSON-LD Product + exact expected SKU ${row.expected_sku}; quantity ${row.quantity}`
        : `Kirstein guarded self-hosted attempt preserved previous valid price; decision=${row.decision}`;

      await rest('price_observations', {
        method: 'POST',
        prefer: 'return=minimal',
        body: [{
          offer_id: offer.id,
          run_id: run.id,
          price: verified ? row.total_price : null,
          currency: 'EUR',
          availability: null,
          status: row.status,
          source_method: 'catalog',
          http_status: shadowReport.results.find(result => result.reference === row.reference)?.http_status ?? null,
          verified,
          raw_product_name: offer.shop_product_name,
          evidence,
          error_message: verified ? null : row.decision,
          observed_at: shadowReport.observed_at,
          metadata: {
            reference: row.reference,
            url: row.url,
            expected_sku: row.expected_sku,
            quantity: row.quantity,
            unit_price: row.unit_price,
            guarded_manual_write: true,
            collector_method: 'kirstein_jsonld_exact_sku_self_hosted'
          }
        }]
      });

      await rest('collection_results', {
        method: 'POST',
        prefer: 'return=minimal,resolution=merge-duplicates',
        body: [{
          run_id: run.id,
          offer_id: offer.id,
          status: row.status,
          price: verified ? row.total_price : null,
          source_method: 'catalog',
          http_status: shadowReport.results.find(result => result.reference === row.reference)?.http_status ?? null,
          message: evidence
        }]
      });

      statuses.push({ status: row.status });
    }
  } catch (error) {
    fatalError = error;
    throw error;
  } finally {
    const health = deriveRunHealth(statuses, { fatalError });
    const finishedAt = new Date().toISOString();
    await rest(`collection_runs?id=eq.${run.id}`, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: {
        status: health.status,
        finished_at: finishedAt,
        offers_checked: health.checked,
        offers_updated: health.updated,
        offers_failed: health.hardFailed,
        metadata: {
          shop: 'kirstein',
          execution_environment: 'self_hosted',
          strategy: 'kirstein_exact_sku_bindings_v1',
          guarded_manual_write: true,
          lifecycle: health.status,
          health_status: health.healthStatus,
          result_counts: health.resultCounts,
          ...(fatalError ? { error: String(fatalError.message || fatalError) } : {})
        }
      }
    });
  }

  return { ...plan, writes: true, run_id: run.id };
}

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.slice(2).find(arg => arg.startsWith(prefix));
  return raw ? raw.slice(prefix.length) : fallback;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const mode = argValue('mode', 'plan');
  if (!['plan', 'write'].includes(mode)) throw new Error('mode must be plan or write');

  const executionEnvironment = mode === 'write' ? 'self_hosted' : argValue('execution-environment', 'local');
  const shadowReport = await runKirsteinShadow({ executionEnvironment });

  if (mode === 'plan') {
    console.log(JSON.stringify(buildKirsteinProductionPlan(shadowReport), null, 2));
  } else {
    const result = await writeKirsteinProduction({
      shadowReport,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      confirmation: process.env.KIRSTEIN_WRITE_CONFIRM
    });
    console.log(JSON.stringify(result, null, 2));
  }
}
