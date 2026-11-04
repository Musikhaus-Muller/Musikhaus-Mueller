import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { aggregateComponentResults, expectedNameFromUrl } from '../collector/components.mjs';

test('component URL produces a useful expected product name', () => {
  assert.equal(
    expectedNameFromUrl('https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000'),
    'LD Systems MAUI 28 G3 Schwarz'
  );
  assert.equal(
    expectedNameFromUrl('https://www.thomann.de/de/ld_systems_icoa_sub_18_a.htm'),
    'ld systems icoa sub 18 a'
  );
});

test('component calculator multiplies quantities and sums the bundle', () => {
  const result=aggregateComponentResults([
    {component:{quantity:2,product_url:'https://x.test/top'},result:{status:'success',price:429,available:true}},
    {component:{quantity:2,product_url:'https://x.test/sub'},result:{status:'success',price:845,available:true}},
    {component:{quantity:2,product_url:'https://x.test/cable'},result:{status:'success',price:4.9,available:true}}
  ]);
  assert.equal(result.status,'success');
  assert.equal(result.method,'component_calc');
  assert.equal(result.price,2557.8);
  assert.equal(result.available,true);
});

test('component calculator refuses partial bundles and preserves previous aggregate upstream', () => {
  const result=aggregateComponentResults([
    {component:{quantity:2,label:'Top',product_url:'https://x.test/top'},result:{status:'success',price:429}},
    {component:{quantity:1,label:'Sub',product_url:'https://x.test/sub'},result:{status:'blocked',error:'HTTP 403'}}
  ]);
  assert.equal(result.status,'blocked');
  assert.equal(result.price,undefined);
  assert.match(result.error,/Component failed: Sub/);
});


test('collector v2 gives component targets the same public catalog fallback path', async () => {
  const src = await fs.readFile('collector/run.mjs','utf8');
  assert.match(src, /const target = \{/);
  assert.match(src, /catalogAttemptTarget\(target, shop\.slug\)/);
  assert.match(src, /recordComponentObservation\(\{ component, runId: run\.id, result \}\)/);
});
