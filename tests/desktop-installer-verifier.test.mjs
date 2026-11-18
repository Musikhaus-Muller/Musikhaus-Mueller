import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { findInstaller, verifyDesktopInstaller } from '../scripts/verify-desktop-installer.mjs';

async function fixture() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-installer-'));
  await fs.mkdir(path.join(directory, 'win-unpacked', 'resources'), { recursive: true });
  await fs.writeFile(path.join(directory, 'Musikhaus-Mueller-Price-Updater-Setup.exe'), 'installer');
  await fs.writeFile(path.join(directory, 'win-unpacked', 'Musikhaus-Mueller-Price-Updater.exe'), 'app');
  await fs.writeFile(path.join(directory, 'win-unpacked', 'chrome.exe'), 'chromium');
  await fs.writeFile(path.join(directory, 'win-unpacked', 'resources', 'app.asar'), 'desktop application');
  return directory;
}

test('desktop installer verifier selects only the top-level strict NSIS installer', async t => {
  const directory = await fixture();
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  assert.equal(path.basename(await findInstaller({ directory, platform: 'win32', extension: '.exe' })), 'Musikhaus-Mueller-Price-Updater-Setup.exe');
  const result = await verifyDesktopInstaller({ directory, platform: 'win32', arch: 'x64', extension: '.exe' });
  assert.equal(result.installer, 'Musikhaus-Mueller-Price-Updater-Setup.exe');
  assert.equal(result.bytes, 9);
  assert.equal(result.chromium, 'external_resource_only');
});

test('desktop installer verifier rejects a non-NSIS top-level executable', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'desktop-installer-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, 'other.exe'), 'not installer');
  await assert.rejects(() => findInstaller({ directory, platform: 'win32', extension: '.exe' }), /Musikhaus-Mueller-Price-Updater-Setup\.exe/);
});
