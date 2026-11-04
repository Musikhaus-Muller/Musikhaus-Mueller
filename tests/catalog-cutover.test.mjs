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

test('R2 remains only for legacy refresh and MCP state', async () => {
  const src = await fs.readFile('worker/handler.mjs','utf8');
  assert.match(src, /export async function refresh\([\s\S]*load\(env\)/);
  assert.match(src, /q\.params\.name==='refresh_prices'\?await refresh\(env\)/);
  assert.doesNotMatch(src, /if\(path==='\/api\/runs'\)[\s\S]*load\(env\)/);
  assert.doesNotMatch(src, /if\(path==='\/api\/status'\)[\s\S]*load\(env\)/);
});
