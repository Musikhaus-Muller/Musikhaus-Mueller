import { fileURLToPath } from 'node:url';
import { KIRSTEIN_EXACT_SKU_BINDINGS } from './kirstein-exact-sku-bindings.mjs';
import { parseKirsteinJsonLd } from './kirstein-jsonld-catalog.mjs';

const BOUND = KIRSTEIN_EXACT_SKU_BINDINGS.filter(binding => binding.status === 'bound');

function decisionFromError(error) {
  const message = String(error?.message || error);
  if (/SKU not found|Ambiguous Kirstein SKU/i.test(message)) return 'sku_mismatch';
  if (/identity mismatch/i.test(message)) return 'identity_mismatch';
  if (/price/i.test(message)) return 'invalid_price';
  return 'parse_error';
}

async function fetchBinding(binding, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(binding.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6',
        'User-Agent': 'PA-Bundle-Comparator/2.1 kirstein shadow'
      }
    });
  } catch (error) {
    return {
      reference: binding.reference,
      url: binding.url,
      expected_sku: binding.sku,
      http_status: null,
      parsed_sku: null,
      parsed_name: null,
      identity_valid: false,
      price: null,
      price_valid: false,
      decision: 'blocked',
      error: String(error?.message || error)
    };
  }

  const base = {
    reference: binding.reference,
    url: binding.url,
    expected_sku: binding.sku,
    http_status: response.status,
    parsed_sku: null,
    parsed_name: null,
    identity_valid: false,
    price: null,
    price_valid: false
  };

  if (response.status === 404) return { ...base, decision: 'not_found' };
  if (!response.ok) return { ...base, decision: 'blocked' };

  let html;
  try {
    html = await response.text();
  } catch (error) {
    return { ...base, decision: 'parse_error', error: String(error?.message || error) };
  }

  try {
    const parsed = parseKirsteinJsonLd(html, {
      sku: binding.sku,
      expectedName: binding.expectedName
    });
    return {
      ...base,
      parsed_sku: parsed.sku,
      parsed_name: parsed.name,
      identity_valid: true,
      price: parsed.price,
      price_valid: Number.isFinite(parsed.price) && parsed.price > 0,
      decision: 'refreshable_shadow'
    };
  } catch (error) {
    return {
      ...base,
      decision: decisionFromError(error),
      error: String(error?.message || error)
    };
  }
}

export async function runKirsteinShadow({
  fetchImpl = fetch,
  executionEnvironment = 'local',
  observedAt = new Date().toISOString()
} = {}) {
  const results = [];
  for (const binding of BOUND) results.push(await fetchBinding(binding, fetchImpl));

  const summary = {
    total_bound: BOUND.length,
    http_usable: results.filter(result => result.http_status >= 200 && result.http_status < 300).length,
    identity_valid: results.filter(result => result.identity_valid).length,
    price_valid: results.filter(result => result.price_valid).length,
    refreshable: results.filter(result => result.decision === 'refreshable_shadow').length
  };

  return {
    execution_environment: executionEnvironment,
    observed_at: observedAt,
    writes: false,
    results,
    summary
  };
}

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.slice(2).find(arg => arg.startsWith(prefix));
  return raw ? raw.slice(prefix.length) : fallback;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const executionEnvironment = argValue('execution-environment', 'local');
  if (!['local', 'self_hosted'].includes(executionEnvironment)) {
    throw new Error('execution-environment must be local or self_hosted');
  }
  console.log(JSON.stringify(await runKirsteinShadow({ executionEnvironment }), null, 2));
}
