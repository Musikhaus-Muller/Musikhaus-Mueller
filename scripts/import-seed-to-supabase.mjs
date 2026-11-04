import fs from 'node:fs/promises';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE,
  Authorization: `Bearer ${SERVICE_ROLE}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation,resolution=merge-duplicates'
};

async function rest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const seed = JSON.parse(await fs.readFile(new URL('../web/seed.json', import.meta.url), 'utf8'));

const shopSlugs = new Set();
for (const row of seed) {
  for (const [slug, offer] of Object.entries(row.offers || {})) {
    if (offer) shopSlugs.add(slug);
  }
}

const shops = await rest('shops?select=id,slug');
const shopMap = new Map(shops.map(s => [s.slug, s.id]));

for (const slug of shopSlugs) {
  if (!shopMap.has(slug)) {
    throw new Error(`Shop "${slug}" is present in seed.json but missing from Supabase shops table`);
  }
}

for (const row of seed) {
  const [configuration] = await rest('configurations?on_conflict=legacy_id', {
    method: 'POST',
    body: [{
      legacy_id: row.id,
      brand: row.brand,
      family: row.family,
      name: row.name,
      subtitle: row.sub || null,
      comparison_status: row.status || null,
      note: row.note || null,
      source_date: row.date || null,
      metadata: {}
    }]
  });

  for (const [slug, offer] of Object.entries(row.offers || {})) {
    if (!offer) continue;

    const [savedOffer] = await rest('offers?on_conflict=configuration_id,shop_id', {
      method: 'POST',
      body: [{
        configuration_id: configuration.id,
        shop_id: shopMap.get(slug),
        shop_product_name: offer.name || null,
        product_url: offer.url || null,
        contents: offer.contents || null,
        match_type: offer.match || null,
        calculation: offer.calculation || null,
        note: offer.note || null,
        source_url: offer.source || offer.url || null,
        source_name: offer.sourceName || offer.name || null,
        evidence: offer.evidence || null,
        metadata: {
          lastAttempt: offer.lastAttempt || null,
          fetchStatus: offer.fetchStatus || null,
          previousPrice: offer.previousPrice ?? null,
          previousDate: offer.previousDate || null
        }
      }]
    });

    if (offer.price == null) continue;

    const date = offer.priceDate || row.date;
    const observedAt = date ? `${date}T12:00:00Z` : new Date().toISOString();

    await rest('price_observations?on_conflict=offer_id,source_method,observed_at', {
      method: 'POST',
      body: [{
        offer_id: savedOffer.id,
        price: Number(offer.price),
        currency: 'EUR',
        status: 'success',
        source_method: 'seed_import',
        verified: Boolean(offer.verifiedToday),
        raw_product_name: offer.sourceName || offer.name || null,
        evidence: offer.evidence || null,
        observed_at: observedAt,
        metadata: {
          fetchStatus: offer.fetchStatus || null,
          calculation: offer.calculation || null
        }
      }]
    });
  }
}

const counts = {};
for (const table of ['shops','configurations','offers','price_observations']) {
  const rows = await rest(`${table}?select=id`);
  counts[table] = rows.length;
}
console.log(JSON.stringify({ ok: true, counts }, null, 2));
