import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createUpdateState } from '../desktop/services/update-state.mjs';
import { runPriceUpdate } from '../desktop/services/price-update-runner.mjs';

test('desktop pipeline serializes shops, runs secure preflight, and always stops before writes', async () => {
  const phases = [], state = createUpdateState(value => phases.push(value.phase)); state.ready();
  const result = await runPriceUpdate({ state,
    runShadow: async shop => ({ shop }),
    buildPlan: async () => ({ writePlan: { totals: { planned: 2 } }, writePlanBytes: Buffer.from('plan') }),
    backend: { preflight: async () => ({ totals: { resolved: 2 }, rows: [], bytes: Buffer.from('preflight') }) }
  });
  assert.equal(result.dry_run, true);
  assert.equal(result.updated, 0);
  assert.deepEqual(phases.slice(1), ['collecting_hotsound', 'collecting_thomann', 'building_plan', 'preflight', 'completed']);
});

test('desktop pipeline rejects concurrent execution and aborts on structural preflight failure', async () => {
  const state = createUpdateState(); state.ready(); state.move('collecting_hotsound');
  await assert.rejects(() => runPriceUpdate({ state }), /already running/);
  const fresh = createUpdateState(); fresh.ready();
  await assert.rejects(() => runPriceUpdate({
    state: fresh,
    runShadow: async () => ({}),
    buildPlan: async () => ({ writePlan: { totals: { planned: 1 } }, writePlanBytes: Buffer.from('plan') }),
    backend: { preflight: async () => ({ totals: { resolved: 0 }, bytes: Buffer.from('preflight') }) },
    audit: async () => ({})
  }), /did not resolve/);
  assert.equal(fresh.get().phase, 'failed');
});

test('desktop dry-run has no apply or audit dependency after secure preflight', async () => {
  const state = createUpdateState(); state.ready();
  const result = await runPriceUpdate({ state,
    runShadow: async () => ({}),
    buildPlan: async () => ({ writePlan: { totals: { planned: 2, skipped: 4 } }, writePlanBytes: Buffer.from('plan') }),
    backend: { preflight: async () => ({ totals: { resolved: 2 }, bytes: Buffer.from('preflight') }) }
  });
  assert.equal(result.dry_run, true);
  assert.equal(result.updated, 0);
  assert.equal(result.preserved, 4);
});
