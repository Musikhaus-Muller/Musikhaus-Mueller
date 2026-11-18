import fs from 'node:fs/promises';
import { resolveBrowserProductionWritePlan } from '../collector/browser/browser-production-preflight.mjs';

const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required for read-only preflight');

const headers = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
async function get(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { method: 'GET', headers, signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`);
  return text ? JSON.parse(text) : [];
}

const sourceWritePlan = 'reports/browser-production-write-plan.json';
const writePlan = JSON.parse(await fs.readFile(new URL(`../${sourceWritePlan}`, import.meta.url), 'utf8'));
const planned = writePlan.shops.flatMap(shop => shop.rows).filter(row => row.decision === 'planned');
const refs = [...new Set(planned.map(row => row.proposed_observation?.offer_match?.configuration_legacy_id).filter(Boolean))];
const slugs = [...new Set(planned.map(row => row.proposed_observation?.offer_match?.shop_slug).filter(Boolean))];
const inFilter = values => `in.(${values.map(encodeURIComponent).join(',')})`;

const [configurations, shops] = await Promise.all([
  get(`configurations?select=id,legacy_id,active&legacy_id=${inFilter(refs)}`),
  get(`shops?select=id,slug,enabled&slug=${inFilter(slugs)}`)
]);
const ids = configurations.map(configuration => configuration.id);
const offers = ids.length
  ? await get(`offers?select=id,configuration_id,shop_id,active,product_url,source_url&configuration_id=${inFilter(ids)}`)
  : [];

const preflight = {
  generated_at: new Date().toISOString(),
  ...resolveBrowserProductionWritePlan(writePlan, { configurations, shops, offers })
};
await fs.writeFile(new URL('../reports/browser-production-preflight.json', import.meta.url), JSON.stringify(preflight, null, 2) + '\n');
console.log(JSON.stringify({ writes: false, totals: preflight.totals }));
if (preflight.totals.unresolved || preflight.totals.ambiguous || preflight.totals.mismatches) process.exitCode = 1;
