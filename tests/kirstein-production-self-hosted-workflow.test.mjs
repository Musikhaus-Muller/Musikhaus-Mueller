import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const file = '.github/workflows/kirstein-production-self-hosted.yml';

test('guarded Kirstein production workflow is manual-only and defaults to read-only plan', async () => {
  const source = await fs.readFile(file, 'utf8');
  assert.match(source, /workflow_dispatch:/);
  assert.doesNotMatch(source, /\bschedule:/);
  assert.match(source, /default: plan/);
  assert.match(source, /runs-on: self-hosted/g);
  assert.match(source, /--mode=plan/);
  assert.match(source, /kirstein-production-plan\.json/);
});

test('write job requires literal confirmation and exposes Supabase secrets only there', async () => {
  const source = await fs.readFile(file, 'utf8');
  assert.match(source, /inputs\.mode == 'write' && inputs\.confirm == 'WRITE_KIRSTEIN_9'/);
  assert.match(source, /SUPABASE_URL: \$\{\{ secrets\.SUPABASE_URL \}\}/);
  assert.match(source, /SUPABASE_SECRET_KEY: \$\{\{ secrets\.SUPABASE_SECRET_KEY \}\}/);
  assert.match(source, /KIRSTEIN_WRITE_CONFIRM: \$\{\{ inputs\.confirm \}\}/);
  assert.match(source, /--mode=write/);
  assert.doesNotMatch(source, /playwright|proxy|captcha|retry/i);
});
