import { resolvePrice } from './source-resolution.mjs';

export async function probeSources({ shop, reference, expectedIdentity, sources, fetcher = fetch }) {
  const results = [];
  for (const source of sources) {
    try {
      const response = await fetcher(source.url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { Accept: 'text/html,application/json,application/xml', 'User-Agent': 'PA-Bundle-Source-Probe/1.0 read-only' } });
      let parsed = null;
      let parseError = null;
      if (response.ok && source.parse) {
        try { parsed = await source.parse(await response.text(), response.url); } catch (error) { parseError = String(error.message || error); }
      }
      const status = response.ok && parsed ? 'success'
        : response.status === 403 ? 'blocked'
        : response.status === 429 ? 'blocked'
        : response.status === 404 || response.status === 410 ? 'not_found'
        : response.ok ? 'parse_error' : 'error';
      results.push({ status, ...(parseError ? { error: parseError } : {}), ...(response.status === 429 ? { reason: 'rate_limited', retryAfter: response.headers.get('retry-after') || null } : {}), ...(response.status === 403 ? { reason: 'blocked' } : {}), source: { type: source.type, url: source.url, method: source.method }, httpStatus: response.status, ...(parsed || {}) });
    } catch (error) { results.push({ status: 'network_error', source: { type: source.type, url: source.url, method: source.method }, error: String(error.message || error) }); }
  }
  const selected = resolvePrice({ expectedIdentity, candidates: results });
  return { shop, reference, expected_sku: expectedIdentity.sku || null, sources: results, selected_source: selected.source?.method || null, result: selected };
}
