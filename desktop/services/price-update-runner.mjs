import { createHash } from 'node:crypto';

const SHOPS = Object.freeze([{ slug: 'hotsound', label: 'Hot Sound' }, { slug: 'thomann', label: 'Thomann' }]);
export const checksum = value => createHash('sha256').update(value).digest('hex');

export async function runPriceUpdate({ state, runShadow, buildPlan, backend, audit, dryRun = false }) {
  if (state.get().running) throw new Error('An update is already running');
  const shadows = {};
  try {
    for (const shop of SHOPS) {
      state.move(shop.slug === 'hotsound' ? 'collecting_hotsound' : 'collecting_thomann', { shop: shop.label });
      shadows[shop.slug] = await runShadow(shop.slug);
    }
    state.move('building_plan');
    const artifacts = await buildPlan(shadows);
    state.move('preflight');
    const preflight = await backend.preflight(artifacts.writePlan);
    if (preflight.totals?.resolved !== artifacts.writePlan.totals?.planned) throw new Error('Secure preflight did not resolve every planned observation');
    if (dryRun) {
      const summary = { dry_run: true, updated: 0, planned: artifacts.writePlan.totals?.planned || 0, preserved: artifacts.writePlan.totals?.skipped || 0, manual_review: 0, failures: 0 };
      state.complete(summary, false);
      return summary;
    }
    const planSha256 = checksum(artifacts.writePlanBytes);
    const preflightSha256 = checksum(preflight.bytes);
    state.move('writing');
    const applied = await backend.apply({ writePlan: artifacts.writePlan, preflight, planSha256, preflightSha256 });
    state.move('auditing');
    const result = await audit({ writePlan: artifacts.writePlan, preflight, applied });
    const warnings = result.failures > 0 || result.manual_review > 0;
    state.complete(result, warnings);
    return result;
  } catch (error) { state.fail(error); throw error; }
}
