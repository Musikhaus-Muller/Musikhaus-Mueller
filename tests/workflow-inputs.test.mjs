import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('workflow exposes explicit shop choice and passes manual/schedule trigger', async () => {
  const wf = await fs.readFile('.github/workflows/collect-prices.yml','utf8');
  assert.match(wf,/type: choice/);
  assert.match(wf,/\n\s+- all/);
  assert.match(wf,/COLLECT_TRIGGER:/);
  assert.match(wf,/github\.event_name == 'schedule'/);
  assert.match(wf,/\[ "\$SHOP" != "all" \]/);
});

test('collector stores trigger from COLLECT_TRIGGER', async () => {
  const src = await fs.readFile('collector/run.mjs','utf8');
  assert.match(src,/trigger_type: process\.env\.COLLECT_TRIGGER/);
});
