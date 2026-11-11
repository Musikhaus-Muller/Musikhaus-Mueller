import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const WORKFLOW = '.github/workflows/kirstein-shadow-self-hosted.yml';

test('Kirstein self-hosted shadow workflow is manual and read-only', async () => {
  const source = await fs.readFile(WORKFLOW, 'utf8');

  assert.match(source, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(source, /\bschedule:/);
  assert.match(source, /permissions:\n  contents: read/);
  assert.match(source, /runs-on: self-hosted/);
  assert.match(source, /actions\/checkout@v4/);
  assert.match(source, /actions\/setup-node@v4/);
  assert.match(source, /node-version: ['"]22['"]/);
  assert.match(source, /collector\/kirstein-shadow\.mjs/);
  assert.match(source, /--execution-environment=self_hosted/);
  assert.match(source, /> kirstein-shadow-self-hosted\.json/);
  assert.match(source, /actions\/upload-artifact@v4/);
  assert.match(source, /name: kirstein-shadow-self-hosted/);
  assert.match(source, /path: kirstein-shadow-self-hosted\.json/);
});

test('Kirstein self-hosted shadow workflow has no production credentials or bypass mechanisms', async () => {
  const source = await fs.readFile(WORKFLOW, 'utf8');

  assert.doesNotMatch(source, /SUPABASE|SERVICE_ROLE|SECRET_KEY|secrets\./i);
  assert.doesNotMatch(source, /playwright|puppeteer|proxy|captcha|retry/i);
  assert.doesNotMatch(source, /collector\/run\.mjs/i);
  assert.doesNotMatch(source, /schedule:/i);
});
