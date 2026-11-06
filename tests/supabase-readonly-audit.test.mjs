import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Supabase production audit is GET-only and workflow is manual', async()=>{
  const script=await fs.readFile('scripts/audit-supabase-readonly.mjs','utf8');
  const workflow=await fs.readFile('.github/workflows/audit-supabase-readonly.yml','utf8');

  assert.match(workflow,/workflow_dispatch:/);
  assert.doesNotMatch(workflow,/schedule:/);
  assert.match(workflow,/permissions:\s*\n\s*contents: read/);
  assert.match(script,/fetch\(base\+'\/rest\/v1\/'\+path,\{headers/);
  assert.match(script,/async function getAll\(/);
  assert.match(script,/limit='\+pageSize\+'\&offset='\+offset/);
  assert.match(script,/getAll\('price_observations/);
  assert.match(script,/getAll\('component_price_observations/);
  assert.match(script,/getAll\('collection_results/);
  assert.doesNotMatch(script,/method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/i);
  assert.doesNotMatch(script,/\.rpc\(|\/rpc\//i);
  assert.doesNotMatch(script,/insert\s+into|update\s+public\.|delete\s+from/i);
});
