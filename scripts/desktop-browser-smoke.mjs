import { smokeChromium } from '../desktop/services/browser-runtime.mjs';
const { chromium } = await import('playwright');
const runtime = await smokeChromium({ chromium, projectRoot: process.cwd() });
console.log(JSON.stringify({ chromium: 'ok', browser_path: runtime.browserRoot, executable_path: runtime.executablePath, target: `${runtime.platform}-${runtime.arch}` }));
