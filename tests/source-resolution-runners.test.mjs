import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('live source-resolution runner is seed-only and has no write path to Supabase', async () => {
  const source = await fs.readFile('scripts/run-source-resolution.mjs', 'utf8');
  assert.match(source, /buildThomannShadowReport/);
  assert.match(source, /buildMusicStoreShadowReport/);
  assert.match(source, /writes: false/);
  assert.doesNotMatch(source, /SUPABASE|\/rest\/v1|INSERT|UPDATE|POST.*supabase/i);
  assert.doesNotMatch(source, /proxy|playwright|captcha solving|retry/i);
});
