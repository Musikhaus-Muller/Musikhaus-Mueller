import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Collector 2.1 discovery workflow is proposal-only and scheduled', async()=>{
  const [workflow,runner]=await Promise.all([
    fs.readFile('.github/workflows/discover-offers.yml','utf8'),
    fs.readFile('collector/discover.mjs','utf8')
  ]);
  assert.match(workflow,/cron: '30 6 \* \* 0'/);
  assert.match(workflow,/node discover\.mjs/);
  assert.match(runner,/status: 'proposed'/);
  assert.doesNotMatch(runner,/POST[^\n]*offers\?/);
});
