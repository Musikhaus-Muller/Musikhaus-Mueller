import fs from 'node:fs/promises';
import { buildBrowserProductionWritePlan } from '../collector/browser/browser-production-plan.mjs';

if (process.argv.includes('--apply')) {
  throw new Error('--apply is disabled: browser production writes are not implemented');
}
if (!process.argv.includes('--plan')) {
  throw new Error('--plan is required; this command only produces a local write plan');
}

const sourcePlanPath = 'reports/browser-prewriter-plan.json';
const sourcePlan = JSON.parse(await fs.readFile(new URL(`../${sourcePlanPath}`, import.meta.url), 'utf8'));
const writePlan = buildBrowserProductionWritePlan(sourcePlan, { sourcePlanPath });
await fs.writeFile(new URL('../reports/browser-production-write-plan.json', import.meta.url), JSON.stringify(writePlan, null, 2) + '\n');
console.log(JSON.stringify({ writes: false, mode: 'plan', totals: writePlan.totals, shops: writePlan.shops.map(shop => ({ shop: shop.shop, ...shop.totals })) }));
