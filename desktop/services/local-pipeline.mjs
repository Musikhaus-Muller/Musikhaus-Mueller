import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { locateChromium } from './browser-runtime.mjs';

function runNode(root, script, args = [], runtime = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], { cwd: root, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', ...(runtime ? { PLAYWRIGHT_BROWSERS_PATH: runtime.browserRoot, PLAYWRIGHT_EXECUTABLE_PATH: runtime.executablePath } : {}) }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', errors = '';
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { errors += data; });
    const timer = setTimeout(() => child.kill(), 12 * 60_000);
    child.once('exit', code => { clearTimeout(timer); code === 0 ? resolve(output) : reject(new Error(`Local pipeline step failed (${code}): ${errors.slice(-500)}`)); });
  });
}

export function createLocalPipeline({ root, auth, browserRuntime = null }) {
  return {
    async runShadow(shop) {
      const runtime = browserRuntime ? await browserRuntime() : await locateChromium({ projectRoot: root });
      await runNode(root, 'scripts/run-browser-shadow.mjs', [`--shop=${shop}`, '--headed', '--full-shadow'], runtime);
      return JSON.parse(await fs.readFile(path.join(root, 'reports', `${shop}-browser-shadow-full.json`), 'utf8'));
    },
    async buildPlan() {
      await runNode(root, 'scripts/build-browser-prewriter-plan.mjs');
      await runNode(root, 'scripts/plan-browser-production-writes.mjs', ['--plan']);
      const bytes = await fs.readFile(path.join(root, 'reports', 'browser-production-write-plan.json'));
      return { writePlan: JSON.parse(bytes), writePlanBytes: bytes };
    },
    backend: {
      async preflight(writePlan) {
        const { data, error } = await auth.invoke('desktop-price-update', { action: 'preflight', write_plan: writePlan });
        if (error || !data?.preflight) throw new Error('Secure preflight was rejected');
        return { ...data.preflight, bytes: Buffer.from(JSON.stringify(data.preflight)) };
      }
    }
  };
}
