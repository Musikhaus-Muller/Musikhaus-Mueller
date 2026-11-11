import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Music Store shadow workflow is manual-only, read-only, secret-free and artifact-producing',async()=>{
  const yaml=await fs.readFile('.github/workflows/musicstore-shadow.yml','utf8');
  assert.match(yaml,/workflow_dispatch:/);
  assert.doesNotMatch(yaml,/schedule:/);
  assert.match(yaml,/permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(yaml,/SUPABASE|SERVICE_ROLE|SECRET_KEY|secrets\./i);
  assert.doesNotMatch(yaml,/playwright|chromium|proxy|captcha|--mode=write/i);
  assert.match(yaml,/musicstore-shadow\.mjs --execution-environment=github/);
  assert.match(yaml,/upload-artifact@v4/);
});
