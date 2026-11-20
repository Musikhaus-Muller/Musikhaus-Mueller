import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import asar from '@electron/asar';
import { findInstaller, verifyDesktopInstaller } from '../scripts/verify-desktop-installer.mjs';

async function fixture({ embeddedBrowser = false, externalBrowser = true, publicConfig = { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'public-anon-key' } } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-installer-'));
  const source = path.join(root, 'source');
  const resources = path.join(root, 'dist', 'win-unpacked', 'resources');
  await fs.mkdir(path.join(source, 'desktop', 'services'), { recursive: true });
  await fs.mkdir(resources, { recursive: true });
  await fs.writeFile(path.join(root, 'dist', 'Musikhaus-Mueller-Price-Updater-Setup.exe'), 'installer');
  await fs.writeFile(path.join(root, 'dist', 'win-unpacked', 'Musikhaus-Mueller-Price-Updater.exe'), 'app');
  await fs.writeFile(path.join(source, 'desktop', 'services', 'browser-runtime.mjs'), "const browserDir = 'playwright-browsers';\nconst guardedName = 'SUPABASE_SERVICE_ROLE_KEY';\n");
  await fs.writeFile(path.join(source, 'desktop', 'public-config.json'), JSON.stringify(publicConfig));
  if (embeddedBrowser) {
    await fs.mkdir(path.join(source, 'desktop', 'playwright-browsers', 'win32-x64'), { recursive: true });
    await fs.writeFile(path.join(source, 'desktop', 'playwright-browsers', 'win32-x64', 'chrome.exe'), 'embedded');
  }
  await asar.createPackage(source, path.join(resources, 'app.asar'));
  if (externalBrowser) {
    await fs.mkdir(path.join(resources, 'playwright-browsers', 'chromium-1'), { recursive: true });
    await fs.writeFile(path.join(resources, 'playwright-browsers', 'chromium-1', 'chrome.exe'), 'external');
  }
  return root;
}

async function verify(root) {
  return verifyDesktopInstaller({ directory: path.join(root, 'dist'), platform: 'win32', arch: 'x64', extension: '.exe' });
}

test('desktop installer verifier selects only the top-level strict NSIS installer and accepts a source literal', async t => {
  const root = await fixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'dist');
  assert.equal(path.basename(await findInstaller({ directory, platform: 'win32', extension: '.exe' })), 'Musikhaus-Mueller-Price-Updater-Setup.exe');
  const result = await verify(root);
  assert.equal(result.installer, 'Musikhaus-Mueller-Price-Updater-Setup.exe');
  assert.equal(result.bytes, 9);
  assert.equal(result.chromium, 'external_resource_only');
  assert.match(result.externalChromium[0].executablePath, /playwright-browsers[\\/]chromium-1[\\/]chrome\.exe$/);
});

test('desktop installer verifier rejects a real Chromium entry in app.asar', async t => {
  const root = await fixture({ embeddedBrowser: true });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await assert.rejects(() => verify(root), /Chromium must not be embedded.*desktop\/playwright-browsers/);
});

test('desktop installer verifier rejects a missing external Chromium resource', async t => {
  const root = await fixture({ externalBrowser: false });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await assert.rejects(() => verify(root), /Bundled Chromium missing or ambiguous/);
});

test('desktop installer verifier rejects an administrative key field while allowing security literals in source code', async t => {
  const root = await fixture({ publicConfig: { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'public-anon-key', supabaseServiceRoleKey: 'real-secret' } });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await assert.rejects(() => verify(root), /Packaged configuration contains unsupported fields/);
});

test('desktop installer verifier rejects a non-NSIS top-level executable', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-installer-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'dist');
  await fs.mkdir(directory);
  await fs.writeFile(path.join(directory, 'other.exe'), 'not installer');
  await assert.rejects(() => findInstaller({ directory, platform: 'win32', extension: '.exe' }), /Musikhaus-Mueller-Price-Updater-Setup\.exe/);
});
