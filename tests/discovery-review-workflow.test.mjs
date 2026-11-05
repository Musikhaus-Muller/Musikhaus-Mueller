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
  assert.match(runner,/discovery_component_candidates/);
  assert.doesNotMatch(runner,/method:\s*['"](?:POST|PATCH|DELETE)/);
  assert.doesNotMatch(runner,/offers\?/);
});


test('review includes recipe configurations even when latest run found zero component candidates', async()=>{
  const runner=await fs.readFile('collector/review-discovery.mjs','utf8');
  assert.match(runner,/existingOffers/);
  assert.match(runner,/componentGroupedByConfig\.get\(config\.id\) \|\| new Map\(\)/);
  assert.match(runner,/existingOfferIds\.has\(config\.id\)/);
});
