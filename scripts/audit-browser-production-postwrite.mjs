import fs from 'node:fs/promises';
import { appliedObservationIds, buildBrowserProductionPostwriteAudit, PRESERVE_ONLY_THOMANN } from '../collector/browser/browser-production-postwrite-audit.mjs';

const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required for the read-only post-write audit');

const headers = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
async function get(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { method: 'GET', headers, signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`);
  return text ? JSON.parse(text) : [];
}
const inFilter = values => `in.(${values.map(encodeURIComponent).join(',')})`;
const load = path => fs.readFile(new URL(`../${path}`, import.meta.url));
const [planBytes, preflightBytes, applyBytes] = await Promise.all([
  load('reports/browser-production-write-plan.json'),
  load('reports/browser-production-preflight.json'),
  load('reports/browser-production-apply-result.json')
]);
const writePlan = JSON.parse(planBytes);
const preflight = JSON.parse(preflightBytes);
const applyResult = JSON.parse(applyBytes);

const expectedOfferIds = [...new Set((preflight.rows || []).filter(row => row.status === 'resolved').map(row => row.offer_id))];
const insertedObservationIds = appliedObservationIds(applyResult);
if (insertedObservationIds.length !== 52) throw new Error(`Expected 52 applied observation IDs, found ${insertedObservationIds.length}`);
const [preserveConfigurations, thomannShops] = await Promise.all([
  get(`configurations?select=id,legacy_id&legacy_id=${inFilter(PRESERVE_ONLY_THOMANN)}`),
  get('shops?select=id,slug&slug=eq.thomann')
]);
const thomannShopId = thomannShops.length === 1 ? thomannShops[0].id : null;
const preserveConfigurationIds = preserveConfigurations.map(configuration => configuration.id);
const preserveOfferRows = thomannShopId && preserveConfigurationIds.length
  ? await get(`offers?select=id,configuration_id,shop_id&shop_id=eq.${encodeURIComponent(thomannShopId)}&configuration_id=${inFilter(preserveConfigurationIds)}`)
  : [];
const preserveOffers = PRESERVE_ONLY_THOMANN.map(reference => {
  const configuration = preserveConfigurations.find(row => row.legacy_id === reference);
  const offers = configuration ? preserveOfferRows.filter(offer => offer.configuration_id === configuration.id) : [];
  return { reference, offer_id: offers.length === 1 ? offers[0].id : null };
});
const auditedOfferIds = [...new Set([...expectedOfferIds, ...preserveOffers.map(offer => offer.offer_id).filter(Boolean)])];
const preserveOfferIds = preserveOffers.map(offer => offer.offer_id).filter(Boolean);
const [appliedObservations, preserveWindowObservations, currentOfferStatus] = auditedOfferIds.length ? await Promise.all([
  get(`price_observations?select=id,offer_id,price,currency,status,source_method,verified,observed_at,created_at,metadata&id=${inFilter(insertedObservationIds)}`),
  preserveOfferIds.length
    ? get(`price_observations?select=id,offer_id,price,currency,status,source_method,verified,observed_at,created_at,metadata&offer_id=${inFilter(preserveOfferIds)}&created_at=gte.${encodeURIComponent(applyResult.started_at)}`)
    : [],
  get(`current_offer_status?select=offer_id,price,currency,price_source_method,price_observed_at,last_verified_at&offer_id=${inFilter(auditedOfferIds)}`)
]) : [[], [], []];
const observations = [...appliedObservations, ...preserveWindowObservations];

const audit = buildBrowserProductionPostwriteAudit({
  writePlan,
  preflight,
  applyResult,
  observations,
  currentOfferStatus,
  preserveOffers,
  planBytes,
  preflightBytes
});
await fs.writeFile(new URL('../reports/browser-production-postwrite-audit.json', import.meta.url), JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify({ writes: false, expected_applied: audit.expected_applied, observations_found: audit.observations_found, observations_valid: audit.observations_valid, current_price_matches: audit.current_price_matches, duplicates: audit.duplicates, missing: audit.missing, invalid: audit.invalid, preserve_only_untouched: audit.preserve_only_untouched, failures: audit.failures.length }));
if (audit.failures.length) process.exitCode = 1;
