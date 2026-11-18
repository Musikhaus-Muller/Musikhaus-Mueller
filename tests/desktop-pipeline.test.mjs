import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createUpdateState } from '../desktop/services/update-state.mjs';
import { runPriceUpdate } from '../desktop/services/price-update-runner.mjs';

test('desktop pipeline serializes shops, writes only eligible plan via backend, and completes', async () => {
  const phases = [], state = createUpdateState(value => phases.push(value.phase)); state.ready();
  const result = await runPriceUpdate({ state,
    runShadow: async shop => ({ shop }),
    buildPlan: async () => ({ writePlan: { totals: { planned: 2 } }, writePlanBytes: Buffer.from('plan') }),
    backend: { preflight: async () => ({ totals: { resolved: 2 }, rows: [], bytes: Buffer.from('preflight') }), apply: async () => ({ totals: { inserted: 2 } }) },
    audit: async () => ({ updated: 2, preserved: 4, manual_review: 0, failures: 0 })
  });
  assert.equal(result.updated, 2);
  assert.deepEqual(phases.slice(1), ['collecting_hotsound', 'collecting_thomann', 'building_plan', 'preflight', 'writing', 'auditing', 'completed']);
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

test('desktop dry-run completes after secure preflight without invoking backend apply or audit', async () => {
  const state = createUpdateState(); state.ready();
  let applyCalls = 0, auditCalls = 0;
  const result = await runPriceUpdate({ state, dryRun: true,
    runShadow: async () => ({}),
    buildPlan: async () => ({ writePlan: { totals: { planned: 2, skipped: 4 } }, writePlanBytes: Buffer.from('plan') }),
    backend: { preflight: async () => ({ totals: { resolved: 2 }, bytes: Buffer.from('preflight') }), apply: async () => { applyCalls += 1; } },
    audit: async () => { auditCalls += 1; }
  });
  assert.equal(result.dry_run, true);
  assert.equal(result.updated, 0);
  assert.equal(result.preserved, 4);
  assert.equal(applyCalls, 0);
  assert.equal(auditCalls, 0);
});
