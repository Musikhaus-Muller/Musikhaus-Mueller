export const SOURCE_QUALITY = Object.freeze({
  official_product_api: { rank: 1, autoRefresh: true },
  official_structured_product_data: { rank: 2, autoRefresh: true },
  official_catalog: { rank: 3, autoRefresh: true },
  official_search_endpoint: { rank: 4, autoRefresh: true },
  official_public_feed: { rank: 5, autoRefresh: false },
  external_verified_retailer_feed: { rank: 6, autoRefresh: false },
  external_price_aggregator: { rank: 7, autoRefresh: false }
});

const normalize = value => String(value || '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const canonicalTokens = value => normalize(value).split(' ').filter(Boolean).map(token => {
  if (token === 'schwarz' || token === 'black') return 'black';
  if (token === 'weiss' || token === 'white') return 'white';
  return token;
});

const variants = ['pro', 'bt', 'mix', 'g2', 'g3', 'g4x', 'black', 'white'];

export function validateSourceIdentity(expected, candidate) {
  if (expected.shop && !candidate.shop) return { valid: false, reason: 'retailer_missing' };
  if (expected.shop && normalize(expected.shop) !== normalize(candidate.shop)) return { valid: false, reason: 'retailer_mismatch' };
  if (expected.sku && String(expected.sku) !== String(candidate.sku || '')) return { valid: false, reason: 'sku_mismatch' };
  const wanted = canonicalTokens(expected.name);
  const found = new Set(canonicalTokens(candidate.name));
  for (const variant of variants) if (wanted.includes(variant) !== found.has(variant)) return { valid: false, reason: 'variant_mismatch' };
  const required = wanted.filter(token => token.length > 1 && !['ld', 'systems', 'system', 'pa', 'set', 'bundle'].includes(token));
  return required.every(token => found.has(token)) ? { valid: true } : { valid: false, reason: 'identity_mismatch' };
}

export function resolvePrice({ expectedIdentity, candidates }) {
  const ordered = [...candidates].sort((a, b) => (SOURCE_QUALITY[a.source?.type]?.rank ?? 99) - (SOURCE_QUALITY[b.source?.type]?.rank ?? 99));
  let unsupportedSourceType = false;
  for (const candidate of ordered) {
    if (candidate.status !== 'success') continue;
    const quality = SOURCE_QUALITY[candidate.source?.type];
    if (!quality) { unsupportedSourceType = true; continue; }
    if (!candidate.source?.type || !candidate.source?.method || !candidate.source?.url) continue;
    const identity = validateSourceIdentity(expectedIdentity, candidate);
    if (!identity.valid) continue;
    if (!Number.isFinite(candidate.price) || candidate.price <= 0 || candidate.currency !== 'EUR') continue;
    return { ...candidate, verified: true, identityValid: true, preservePrevious: false, quality: quality.rank, autoRefreshEligible: quality.autoRefresh, proposalOnly: !quality.autoRefresh };
  }
  return { status: ordered.some(item => item.status === 'blocked') ? 'blocked' : 'unresolved', ...(unsupportedSourceType ? { reason: 'unsupported_source_type' } : {}), verified: false, identityValid: false, preservePrevious: true };
}
