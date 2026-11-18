import fs from 'node:fs/promises';
const target = `${process.platform}-${process.arch}`;
const entries = await fs.readdir(`desktop/playwright-browsers/${target}`).catch(() => []);
if (!entries.some(entry => entry.startsWith('chromium-'))) throw new Error('Run npm run desktop:install-browser before packaging; Chromium must be bundled.');
