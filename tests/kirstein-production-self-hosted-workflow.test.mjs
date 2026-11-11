import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const file = '.github/workflows/kirstein-production-self-hosted.yml';

test('guarded Kirstein production workflow is manual-only, self-hosted and plan-only', async () => {
  const source = await fs.readFile(file, 'utf8');
  assert.match(source, /workflow_dispatch:/);
  assert.doesNotMatch(source, /\bschedule:/);
  assert.match(source, /runs-on: self-hosted/);
  assert.match(source, /--mode=plan/);
  assert.match(source, /kirstein-production-plan\.json/);
  assert.match(source, /permissions:\n  contents: read/);
});

test('workflow never exposes Supabase secrets or write mode on public self-hosted runner', async () => {
  const source = await fs.readFile(file, 'utf8');
  assert.doesNotMatch(source, /SUPABASE|SERVICE_ROLE|SECRET_KEY|secrets\./i);
  assert.doesNotMatch(source, /--mode=write|WRITE_KIRSTEIN_9/);
  assert.doesNotMatch(source, /playwright|proxy|captcha|retry/i);
});
