import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Collector 2.1 routes recipe configurations to component proposals without publishing offers', async()=>{
  const src=await fs.readFile('collector/discover.mjs','utf8');
  assert.match(src,/discoveryRecipe\(config\)/);
  assert.match(src,/discovery_component_candidates/);
  assert.match(src,/component_discovery/);
  assert.doesNotMatch(src,/method:\s*['"]POST['"][\s\S]{0,120}offers\?/);
});
