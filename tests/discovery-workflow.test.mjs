import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Collector 2.1 discovery workflow is proposal-only and scheduled', async()=>{
  const [manualWorkflow,dailyWorkflow,runner]=await Promise.all([
    fs.readFile('.github/workflows/discover-offers.yml','utf8'),
    fs.readFile('.github/workflows/collect-prices.yml','utf8'),
    fs.readFile('collector/discover.mjs','utf8')
  ]);
  assert.match(dailyWorkflow,/cron: '15 7 \* \* \*'/);
  assert.match(dailyWorkflow,/node discover\.mjs --shop=prolighting/);
  assert.match(manualWorkflow,/node discover\.mjs/);
  assert.match(runner,/status: 'proposed'/);
  assert.doesNotMatch(runner,/POST[^\n]*offers\?/);
});
