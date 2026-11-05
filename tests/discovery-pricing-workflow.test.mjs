import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Collector 2.1 discovery hydrates candidate prices without publishing offers',async()=>{
  const src=await fs.readFile('collector/discover.mjs','utf8');
  assert.match(src,/createCandidatePriceResolver/);
  assert.match(src,/candidate_price:\s*pricedCandidate\.price/);
  assert.doesNotMatch(src,/rest\('offers'\s*,\s*\{\s*method:\s*['"]POST/);
});

test('review reports comparable totals through pricing helper',async()=>{
  const src=await fs.readFile('collector/review-discovery.mjs','utf8');
  assert.match(src,/comparableRecipeTotal/);
  assert.match(src,/comparableTotalsAvailable/);
});
