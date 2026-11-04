import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('local preview forwards Supabase server variables without exposing values', async () => {
  const src = await fs.readFile('scripts/preview.mjs', 'utf8');
  assert.match(src, /readFile\('\.env'/);
  assert.match(src, /SUPABASE_URL: process\.env\.SUPABASE_URL/);
  assert.match(src, /SUPABASE_SECRET_KEY: process\.env\.SUPABASE_SECRET_KEY/);
  assert.match(src, /SUPABASE_SERVICE_ROLE_KEY: process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(src, /sb_secret_/);
});
