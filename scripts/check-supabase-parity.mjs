import fs from 'node:fs/promises';

const endpoint = process.argv[2] || 'http://127.0.0.1:8767/api/catalog';
const seed = JSON.parse(await fs.readFile('web/seed.json','utf8'));
const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
const payload = await response.json();
if (payload.source !== 'supabase') throw new Error(`Expected source=supabase, got ${payload.source}`);
if (!Array.isArray(payload.rows)) throw new Error('Catalog rows missing');

const shops = ['mueller','thomann','kirstein','prolighting','hotsound','musicstore'];
const seedById = new Map(seed.map(r=>[r.id,r]));
const liveById = new Map(payload.rows.map(r=>[r.id,r]));
const missingRows = seed.filter(r=>!liveById.has(r.id)).map(r=>r.id);
const extraRows = payload.rows.filter(r=>!seedById.has(r.id)).map(r=>r.id);

const missingOffers = [];
const extraOffers = [];
const urlMismatches = [];
const priceDiffs = [];

for (const id of new Set([...seedById.keys(), ...liveById.keys()])) {
  const a = seedById.get(id);
  const b = liveById.get(id);
  if (!a || !b) continue;
  for (const shop of shops) {
    const sa = a.offers?.[shop] || null;
    const sb = b.offers?.[shop] || null;
    if (sa && !sb) missingOffers.push(`${id}:${shop}`);
    if (!sa && sb) extraOffers.push(`${id}:${shop}`);
    if (sa && sb) {
      if ((sa.url||'') !== (sb.url||'')) urlMismatches.push({ id, shop, seed: sa.url||null, supabase: sb.url||null });
      if (Number.isFinite(sa.price) && Number.isFinite(sb.price) && Number(sa.price) !== Number(sb.price)) {
        priceDiffs.push({ id, shop, seed: Number(sa.price), supabase: Number(sb.price) });
      }
    }
  }
}

const offerCount = rows => rows.reduce((n,r)=>n+shops.filter(s=>r.offers?.[s]).length,0);
const report = {
  source: payload.source,
  rows: { seed: seed.length, supabase: payload.rows.length, missing: missingRows, extra: extraRows },
  offers: {
    seed: offerCount(seed),
    supabase: offerCount(payload.rows),
    missing: missingOffers,
    extra: extraOffers
  },
  urlMismatches,
  priceDiffs,
  musicstoreRows: payload.rows.filter(r=>r.offers?.musicstore).map(r=>({ id:r.id, price:r.offers.musicstore.price, url:r.offers.musicstore.url }))
};

console.log(JSON.stringify(report,null,2));

const structuralOk =
  seed.length === 40 &&
  payload.rows.length === 40 &&
  missingRows.length === 0 &&
  extraRows.length === 0 &&
  missingOffers.length === 0 &&
  extraOffers.length === 0 &&
  urlMismatches.length === 0;

if (!structuralOk) process.exitCode = 2;
