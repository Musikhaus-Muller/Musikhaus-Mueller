import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('catalog endpoints no longer read R2 snapshot', async () => {
  const src = await fs.readFile('worker/handler.mjs','utf8');
  assert.match(src, /if\(path==='\/api\/catalog'\)[\s\S]*source:'supabase'/);
  assert.match(src, /if\(path==='\/data\.json'\)return json\(await requireSupabaseCatalog\(env\)\)/);
  assert.match(src, /if\(path==='\/data\.js'\)[\s\S]*requireSupabaseCatalog\(env\)/);
  assert.doesNotMatch(src, /source:'snapshot'/);
});

test('R2 is fully removed from the Worker runtime', async () => {
  const src = await fs.readFile('worker/handler.mjs','utf8');
  assert.doesNotMatch(src, /BUCKET/);
  assert.doesNotMatch(src, /price-snapshot-v1\.json/);
  assert.doesNotMatch(src, /export async function refresh/);
  assert.match(src, /Endpoint retirado/);
});
