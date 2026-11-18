import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

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

export async function verifyDesktopInstaller({ directory = 'dist', platform, arch, extension, fsApi = fs }) {
  const installer = await findInstaller({ directory, platform, extension, fsApi });
  const all = await files(directory, fsApi);
  const bytes = await fsApi.readFile(installer);
  const asars = all.filter(file => path.basename(file) === 'app.asar');
  if (!asars.length) throw new Error('Packaged app.asar not found');
  for (const asar of asars) {
    const source = await fsApi.readFile(asar);
    if (source.includes(Buffer.from('playwright-browsers'))) throw new Error('Chromium must not be embedded in app.asar');
    if (source.includes(Buffer.from('SUPABASE_SERVICE_ROLE_KEY')) || source.includes(Buffer.from('SUPABASE_SECRET_KEY'))) throw new Error('Administrative Supabase key marker found in app.asar');
  }
  return { installer: path.basename(installer), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), platform, arch, chromium: 'external_resource_only' };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const platform = arg('platform'), arch = arg('arch'), extension = arg('extension');
  if (!platform || !arch || !extension) throw new Error('platform, arch and extension are required');
  console.log(JSON.stringify(await verifyDesktopInstaller({ platform, arch, extension })));
}
