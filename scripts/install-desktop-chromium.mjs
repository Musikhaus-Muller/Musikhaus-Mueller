import { spawn } from 'node:child_process';
import path from 'node:path';
const cli = path.resolve('node_modules/playwright/cli.js');
const target = `${process.platform}-${process.arch}`;
const child = spawn(process.execPath, [cli, 'install', 'chromium'], { stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.resolve('desktop/playwright-browsers', target) } });
await new Promise((resolve, reject) => child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Playwright browser install failed (${code})`))));
