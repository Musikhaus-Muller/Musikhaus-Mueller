import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { browserResourceDirectory, locateChromium, platformKey } from '../desktop/services/browser-runtime.mjs';

const directory = name => ({ name, isDirectory: () => true });
const file = name => ({ name, isDirectory: () => false });

test('browser runtime derives native platform/architecture directories and portable Windows paths', () => {
  assert.equal(platformKey('win32', 'x64'), 'win32-x64');
  assert.equal(platformKey('darwin', 'arm64'), 'darwin-arm64');
  assert.equal(browserResourceDirectory({ projectRoot: 'C:\\Program Files\\Updater', platform: 'win32', arch: 'x64', pathApi: path.win32 }), 'C:\\Program Files\\Updater\\desktop\\playwright-browsers\\win32-x64');
  assert.equal(browserResourceDirectory({ packaged: true, resourcesPath: '/Applications/Updater.app/Contents/Resources', platform: 'darwin', arch: 'x64', pathApi: path.posix }), '/Applications/Updater.app/Contents/Resources/playwright-browsers');
});

test('browser runtime finds the correct native executable and rejects missing Chromium', async () => {
  const winFs = { readdir: async target => target.endsWith('playwright-browsers') ? [directory('chromium-1')] : [file('chrome.exe')] };
  const win = await locateChromium({ packaged: true, resourcesPath: 'C:\\Program Files\\Updater\\resources', platform: 'win32', arch: 'x64', pathApi: path.win32, fsApi: winFs });
  assert.equal(win.executablePath, 'C:\\Program Files\\Updater\\resources\\playwright-browsers\\chromium-1\\chrome.exe');
  const missingFs = { readdir: async () => [] };
  await assert.rejects(() => locateChromium({ projectRoot: '/work', platform: 'darwin', arch: 'arm64', fsApi: missingFs }), /missing or ambiguous/);
});

test('browser runtime accepts paths with spaces for macOS application resources', async () => {
  const macFs = { readdir: async target => target.endsWith('playwright-browsers') ? [directory('chromium-1')] : target.endsWith('chromium-1') ? [directory('Chromium.app')] : target.endsWith('Chromium.app') ? [directory('Contents')] : target.endsWith('Contents') ? [directory('MacOS')] : [file('Chromium')] };
  const runtime = await locateChromium({ packaged: true, resourcesPath: '/Applications/Musikhaus Müller.app/Contents/Resources', platform: 'darwin', arch: 'arm64', pathApi: path.posix, fsApi: macFs });
  assert.match(runtime.executablePath, /Musikhaus Müller\.app/);
});
