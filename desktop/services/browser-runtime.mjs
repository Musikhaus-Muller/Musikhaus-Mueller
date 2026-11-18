import fs from 'node:fs/promises';
import path from 'node:path';

export function platformKey(platform = process.platform, arch = process.arch) {
  if (!['win32', 'darwin'].includes(platform)) throw new Error(`Unsupported desktop platform: ${platform}`);
  if (!['x64', 'arm64'].includes(arch)) throw new Error(`Unsupported desktop architecture: ${arch}`);
  return `${platform}-${arch}`;
}

export function browserResourceDirectory({ packaged = false, resourcesPath = process.resourcesPath, projectRoot, platform = process.platform, arch = process.arch, pathApi = path } = {}) {
  const key = platformKey(platform, arch);
  if (packaged) return pathApi.join(resourcesPath, 'playwright-browsers');
  if (!projectRoot) throw new Error('projectRoot is required in development mode');
  return pathApi.join(projectRoot, 'desktop', 'playwright-browsers', key);
}

async function walk(directory, fsApi = fs, pathApi = path) {
  const entries = await fsApi.readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const full = pathApi.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(full, fsApi, pathApi));
    else result.push(full);
  }
  return result;
}

export async function locateChromium(options = {}) {
  const root = browserResourceDirectory(options);
  const files = await walk(root, options.fsApi || fs, options.pathApi || path).catch(() => []);
  const platform = options.platform || process.platform;
  const candidates = platform === 'win32'
    ? files.filter(file => /(?:^|[\\/])chrome\.exe$/i.test(file))
    : files.filter(file => /(?:Chromium|Google Chrome for Testing)\.app[\\/]Contents[\\/]MacOS[\\/](?:Chromium|Google Chrome for Testing)$/.test(file));
  if (candidates.length !== 1) throw new Error(`Bundled Chromium missing or ambiguous for ${platformKey(options.platform, options.arch)}`);
  return { executablePath: candidates[0], browserRoot: root, platform, arch: options.arch || process.arch };
}

export async function smokeChromium({ chromium, ...options }) {
  const runtime = await locateChromium(options);
  const browser = await chromium.launch({ headless: true, executablePath: runtime.executablePath });
  try {
    const page = await browser.newPage();
    await page.setContent('<title>desktop smoke</title><main>ok</main>');
    if (await page.title() !== 'desktop smoke' || await page.locator('main').textContent() !== 'ok') throw new Error('Chromium DOM smoke check failed');
    return runtime;
  } finally { await browser.close(); }
}
