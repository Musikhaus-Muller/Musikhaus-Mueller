import fs from 'node:fs/promises';
import {
  applyPreparedBrowserWrites,
  prepareBrowserProductionApply,
  sha256,
  verifyApplyChecksums
} from '../collector/browser/browser-production-writer.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const valueAfter = flag => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const planPath = 'reports/browser-production-write-plan.json';
const preflightPath = 'reports/browser-production-preflight.json';
const resultPath = 'reports/browser-production-apply-result.json';
const planBytes = await fs.readFile(new URL(`../${planPath}`, import.meta.url));
const preflightBytes = await fs.readFile(new URL(`../${preflightPath}`, import.meta.url));
const planSha256 = sha256(planBytes);
const preflightSha256 = sha256(preflightBytes);
const writePlan = JSON.parse(planBytes);
const preflight = JSON.parse(preflightBytes);

if (apply) {
  verifyApplyChecksums({
    planBytes,
    preflightBytes,
    confirmPlanSha256: valueAfter('--confirm-plan-sha256'),
    confirmPreflightSha256: valueAfter('--confirm-preflight-sha256')
  });
}

const prepared = prepareBrowserProductionApply(writePlan, preflight);
let rows = prepared.rows.map(row => ({ ...row, observation: undefined, result: row.result === 'ready' ? 'planned' : row.result }));
let totals = { planned: prepared.totals.ready, rejected: prepared.totals.rejected, skipped: prepared.totals.skipped, inserted: 0, already_applied: 0, failed: 0 };

if (apply) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required only with --apply');
  const headers = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
  const request = async (path, options) => {
    const response = await fetch(`${base}/rest/v1/${path}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(20000) });
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(`Supabase response ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return text ? JSON.parse(text) : [];
  };
  const client = {
    findExisting: observation => request(`price_observations?select=id,metadata&offer_id=eq.${encodeURIComponent(observation.offer_id)}&source_method=eq.${encodeURIComponent(observation.source_method)}&observed_at=eq.${encodeURIComponent(observation.observed_at)}`, { method: 'GET' }),
    insertObservation: async observation => (await request('price_observations', { method: 'POST', body: JSON.stringify(observation) }))[0]
  };
  const applied = await applyPreparedBrowserWrites(prepared, client);
  rows = applied.rows;
  totals = { planned: 0, ...prepared.totals, ...applied.totals };
}

const result = {
  writes: apply,
  started_at: new Date().toISOString(),
  finished_at: new Date().toISOString(),
  source_write_plan: planPath,
  source_preflight: preflightPath,
  plan_sha256: planSha256,
  preflight_sha256: preflightSha256,
  totals,
  rows
};
await fs.writeFile(new URL(`../${resultPath}`, import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ writes: result.writes, totals: result.totals, plan_sha256: planSha256, preflight_sha256: preflightSha256 }));
if (prepared.totals.rejected || totals.failed) process.exitCode = 1;
