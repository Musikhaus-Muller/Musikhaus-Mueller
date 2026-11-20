import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.argv[2] || 'dist';
async function list(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const result = [];
  for (const entry of entries) { const full = path.join(directory, entry.name); if (entry.isDirectory()) result.push(...await list(full)); else { const stat = await fs.stat(full); result.push({ file: full, bytes: stat.size }); } }
  return result;
}
const files = await list(root);
const browser = await list(`desktop/playwright-browsers/${process.platform}-${process.arch}`);
await fs.mkdir('desktop-build-diagnostics', { recursive: true });
await fs.writeFile('desktop-build-diagnostics/summary.json', JSON.stringify({ platform: process.platform, arch: process.arch, output_files: files, browser_resource_bytes: browser.reduce((sum, file) => sum + file.bytes, 0), app_asar_bytes: files.filter(file => path.basename(file.file) === 'app.asar').map(file => file.bytes) }, null, 2) + '\n');
