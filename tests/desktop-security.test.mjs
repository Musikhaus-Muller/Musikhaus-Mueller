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

test('desktop backend is role-gated and exposes no generic SQL/RPC endpoint', async () => {
  const source = await fs.readFile('supabase/functions/desktop-price-update/index.ts', 'utf8');
  assert.match(source, /app_metadata\?\.role/); assert.match(source, /allowedRoles/); assert.match(source, /validation_rejected/);
  assert.doesNotMatch(source, /rpc\(|update\(|delete\(/i);
});
