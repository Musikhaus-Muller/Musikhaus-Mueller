import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const arg = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const platform = arg('platform'), arch = arg('arch'), extension = arg('extension');
if (!platform || !arch || !extension) throw new Error('platform, arch and extension are required');
async function files(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const result = [];
  for (const entry of entries) { const full = path.join(directory, entry.name); if (entry.isDirectory()) result.push(...await files(full)); else result.push(full); }
  return result;
}
const all = await files('dist');
const installers = all.filter(file => file.endsWith(extension));
if (installers.length !== 1) throw new Error(`Expected one ${extension} installer, found ${installers.length}`);
const installer = installers[0], bytes = await fs.readFile(installer);
const asars = all.filter(file => path.basename(file) === 'app.asar');
if (!asars.length) throw new Error('Packaged app.asar not found');
for (const asar of asars) {
  const source = await fs.readFile(asar);
  if (source.includes(Buffer.from('playwright-browsers'))) throw new Error('Chromium must not be embedded in app.asar');
  if (source.includes(Buffer.from('SUPABASE_SERVICE_ROLE_KEY')) || source.includes(Buffer.from('SUPABASE_SECRET_KEY'))) throw new Error('Administrative Supabase key marker found in app.asar');
}
console.log(JSON.stringify({ installer: path.basename(installer), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), platform, arch, chromium: 'external_resource_only' }));
