import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('review discovery workflow is read-only', async()=>{
  const [wf,runner]=await Promise.all([
    fs.readFile('.github/workflows/review-discovery.yml','utf8'),
    fs.readFile('collector/review-discovery.mjs','utf8')
  ]);
  assert.match(wf,/Review discovery candidates/);
  assert.match(runner,/Read-only review report/);
  assert.doesNotMatch(runner,/method:\s*['"](?:POST|PATCH|DELETE)/);
  assert.doesNotMatch(runner,/offers\?/);
});
