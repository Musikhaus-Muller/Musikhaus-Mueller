import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import asar from '@electron/asar';
import { locateChromium } from '../desktop/services/browser-runtime.mjs';

const arg = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);

export const installerName = ({ platform, extension }) => {
  if (platform === 'win32') return `Musikhaus-Mueller-Price-Updater-Setup${extension}`;
  if (platform === 'darwin') return `Musikhaus-Mueller-Price-Updater${extension}`;
  throw new Error(`Unsupported desktop platform: ${platform}`);
};

export async function findInstaller({ directory = 'dist', platform, extension, fsApi = fs }) {
  const expected = installerName({ platform, extension });
  const entries = await fsApi.readdir(directory, { withFileTypes: true }).catch(() => []);
  const installers = entries
    .filter(entry => entry.isFile() && entry.name === expected)
    .map(entry => path.join(directory, entry.name));
  if (installers.length !== 1) throw new Error(`Expected one ${expected} installer at the top level of ${directory}, found ${installers.length}`);
  return installers[0];
}

export async function files(directory, fsApi = fs) {
  const entries = await fsApi.readdir(directory, { withFileTypes: true }).catch(() => []);
  const result = [];
  for (const entry of entries) { const full = path.join(directory, entry.name); if (entry.isDirectory()) result.push(...await files(full, fsApi)); else result.push(full); }
  return result;
}

const normalizeAsarPath = entry => entry.replaceAll('\\', '/').replace(/^\/+/, '');
const embeddedBrowserEntry = entry => {
  const normalized = normalizeAsarPath(entry);
  return /(?:^|\/)playwright-browsers(?:\/|$)/i.test(normalized)
    || /(?:^|\/)(?:chromium|chromium_headless_shell)-\d+(?:\/|$)/i.test(normalized)
    || /(?:^|\/)(?:chrome-win(?:32|64)?|chrome-headless-shell-win(?:32|64)?|Chromium\.app)(?:\/|$)/i.test(normalized);
};

export function inspectAsarEntries(asarPath, asarApi = asar) {
  const entries = asarApi.listPackage(asarPath).map(normalizeAsarPath);
  const embeddedBrowser = entries.filter(embeddedBrowserEntry);
  if (embeddedBrowser.length) throw new Error(`Chromium must not be embedded in app.asar: ${embeddedBrowser[0]}`);
  return entries;
}

export function inspectPublicConfig(asarPath, entries, asarApi = asar) {
  if (entries.some(entry => /(?:^|\/)\.env(?:\.|$)/i.test(entry))) throw new Error('Environment configuration must not be packaged');
  const configEntry = entries.find(entry => entry === 'desktop/public-config.json');
  if (!configEntry) throw new Error('Packaged public configuration not found');
  const config = JSON.parse(asarApi.extractFile(asarPath, configEntry).toString('utf8'));
  const keys = Object.keys(config).sort();
  if (keys.join(',') !== 'supabaseAnonKey,supabaseUrl') throw new Error('Packaged configuration contains unsupported fields');
  if (!config.supabaseUrl || !config.supabaseAnonKey || /service|secret/i.test(config.supabaseAnonKey)) {
    throw new Error('Administrative Supabase key must not be packaged');
  }
  return config;
}

export async function inspectExternalChromium({ asarPath, platform, arch, fsApi = fs, pathApi = path }) {
  const resourcesPath = pathApi.dirname(asarPath);
  const runtime = await locateChromium({ packaged: true, resourcesPath, platform, arch, fsApi, pathApi });
  return { browserRoot: runtime.browserRoot, executablePath: runtime.executablePath };
}

export async function verifyDesktopInstaller({ directory = 'dist', platform, arch, extension, fsApi = fs, asarApi = asar, pathApi = path }) {
  const installer = await findInstaller({ directory, platform, extension, fsApi });
  const all = await files(directory, fsApi);
  const bytes = await fsApi.readFile(installer);
  const asars = all.filter(file => path.basename(file) === 'app.asar');
  if (!asars.length) throw new Error('Packaged app.asar not found');
  const externalChromium = [];
  for (const asar of asars) {
    const entries = inspectAsarEntries(asar, asarApi);
    inspectPublicConfig(asar, entries, asarApi);
    externalChromium.push(await inspectExternalChromium({ asarPath: asar, platform, arch, fsApi, pathApi }));
  }
  return { installer: path.basename(installer), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), platform, arch, chromium: 'external_resource_only', externalChromium };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const platform = arg('platform'), arch = arg('arch'), extension = arg('extension');
  if (!platform || !arch || !extension) throw new Error('platform, arch and extension are required');
  console.log(JSON.stringify(await verifyDesktopInstaller({ platform, arch, extension })));
}
