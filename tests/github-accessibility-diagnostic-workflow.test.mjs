import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('GitHub accessibility diagnostic is manual, read-only, and environment-scoped', async () => {
  const workflow = await fs.readFile('.github/workflows/github-accessibility-diagnostic.yml', 'utf8');
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\bschedule:/);
  assert.match(workflow, /COLLECT_EXECUTION_ENV: github/);
  assert.match(workflow, /--diagnostic-only/);
  assert.doesNotMatch(workflow, /SUPABASE_URL|SUPABASE_SECRET_KEY|SERVICE_ROLE|secrets\./i);
  assert.doesNotMatch(workflow, /playwright|proxy|retry|collector\/run\.mjs --shop=.*[^-]$/i);
  assert.match(workflow, /actions\/upload-artifact@v4/);
});

test('GitHub diagnostic only allows the four designated shops and all', async () => {
  const workflow = await fs.readFile('.github/workflows/github-accessibility-diagnostic.yml', 'utf8');
  for (const shop of ['kirstein', 'hotsound', 'musicstore', 'thomann', 'all']) assert.match(workflow, new RegExp(`- ${shop}`));
  assert.match(workflow, /for SHOP_NAME in kirstein hotsound musicstore thomann/);
});
