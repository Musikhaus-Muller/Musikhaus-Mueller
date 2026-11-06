import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('workflow exposes explicit shop choice and passes manual/schedule trigger', async () => {
  const wf = await fs.readFile('.github/workflows/collect-prices.yml','utf8');
  assert.match(wf,/type: choice/);
  assert.match(wf,/\n\s+- all/);
  assert.match(wf,/COLLECT_TRIGGER:/);
  assert.match(wf,/COLLECT_RUN_ID: \$\{\{ inputs\.collection_run_id \}\}/);
  assert.match(wf,/github\.event_name == 'schedule'/);
  assert.match(wf,/\[ "\$SHOP" != "all" \]/);
});

test('one non-overlapping daily workflow discovers then collects every shop', async () => {
  const collect = await fs.readFile('.github/workflows/collect-prices.yml','utf8');
  const discover = await fs.readFile('.github/workflows/discover-offers.yml','utf8');
  const review = await fs.readFile('.github/workflows/review-discovery.yml','utf8');
  const workflows = [collect, discover, review].join('\n');

  assert.deepEqual([...workflows.matchAll(/cron:\s*['"]([^'"]+)['"]/g)].map(x=>x[1]),['15 7 * * *']);
  assert.match(collect,/discover:\n\s+if: github\.event_name == 'schedule'/);
  assert.match(collect,/DISCOVERY_TRIGGER: schedule/);
  assert.match(collect,/node discover\.mjs --shop=prolighting/);
  assert.match(collect,/collect:\n\s+needs: discover\n\s+if: always\(\)/);
  assert.match(collect,/default: all/);
  assert.match(collect,/group: price-update-pipeline/);
  assert.match(discover,/group: price-update-pipeline/);
  assert.doesNotMatch(discover,/\bschedule:/);
});

test('manual collection run is finalized if setup or collection fails', async () => {
  const wf = await fs.readFile('.github/workflows/collect-prices.yml','utf8');
  const finalizer = await fs.readFile('collector/finalize-run.mjs','utf8');
  assert.match(wf,/Claim website-reserved run/);
  assert.match(wf,/inputs\.collection_run_id != '' && steps\.claim\.outcome == 'success'/);
  assert.match(wf,/Finalize failed manual run/);
  assert.match(wf,/steps\.collect\.outcome != 'success'/);
  assert.match(finalizer,/status: 'failed'/);
});

test('collector stores trigger from COLLECT_TRIGGER', async () => {
  const src = await fs.readFile('collector/run.mjs','utf8');
  assert.match(src,/trigger_type: process\.env\.COLLECT_TRIGGER/);
});
