import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('desktop renderer has no Node access and preload exposes only constrained IPC', async () => {
  const main = await fs.readFile('desktop/main.mjs', 'utf8');
  const preload = await fs.readFile('desktop/preload.mjs', 'utf8');
  assert.match(main, /contextIsolation: true/); assert.match(main, /nodeIntegration: false/); assert.match(main, /sandbox: true/);
  assert.doesNotMatch(preload, /ipcRenderer\.send\(/); assert.doesNotMatch(preload, /SUPABASE_SECRET|SERVICE_ROLE/);
  assert.match(main, /safeStorage\.isEncryptionAvailable\(\)/); assert.match(main, /temporary_session/);
});

test('desktop pilot endpoint is JWT/role-gated, preflight-only, and has no write route', async () => {
  const source = await fs.readFile('supabase/functions/desktop-price-update/index.ts', 'utf8');
  assert.match(source, /Bearer\\s\+\(\.\+\)/); assert.match(source, /app_metadata\?\.role/); assert.match(source, /allowedRoles/);
  assert.match(source, /body\.action !== 'preflight'/); assert.match(source, /unsupported_action/); assert.match(source, /invalid_plan/);
  assert.match(source, /writes !== false/); assert.match(source, /Object\.keys\(body\).*write_plan/);
  assert.doesNotMatch(source, /price_observations|method:\s*'POST'|insert\(|upsert\(|rpc\(|update\(|delete\(/i);
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
});

test('desktop pilot UI and local pipeline cannot opt into apply or audit', async () => {
  const [main, preload, renderer, pipeline, runner] = await Promise.all([
    fs.readFile('desktop/main.mjs', 'utf8'), fs.readFile('desktop/preload.mjs', 'utf8'), fs.readFile('desktop/renderer/index.html', 'utf8'), fs.readFile('desktop/services/local-pipeline.mjs', 'utf8'), fs.readFile('desktop/services/price-update-runner.mjs', 'utf8')
  ]);
  assert.match(main, /Run dry-run/); assert.doesNotMatch(main, /Update prices/);
  assert.doesNotMatch(preload, /dryRun/); assert.doesNotMatch(renderer, /id="dry-run"/);
  assert.doesNotMatch(pipeline, /action: 'apply'|action: 'audit'/); assert.doesNotMatch(runner, /writing|auditing|backend\.apply/);
});
