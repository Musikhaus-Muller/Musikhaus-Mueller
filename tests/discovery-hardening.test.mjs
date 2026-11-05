import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Collector 2.1 logs unique source errors and stores confidence metadata', async()=>{
  const src=await fs.readFile('collector/discover.mjs','utf8');
  assert.match(src,/sourceErrors = new Map\(\)/);
  assert.match(src,/sourceErrors\.has\(sourceUrl\)/);
  assert.match(src,/confidence_counts: confidenceCounts/);
  assert.match(src,/confidence\n/);
  assert.match(src,/sourceErrors=/);
});
