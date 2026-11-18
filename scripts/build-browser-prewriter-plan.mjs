import fs from 'node:fs/promises';
import { buildBrowserPreWriterPlan } from '../collector/browser/pre-writer-plan.mjs';

const inputs = [
  new URL('../reports/hotsound-browser-shadow-full.json', import.meta.url),
  new URL('../reports/thomann-browser-shadow-full.json', import.meta.url)
];
const reports = await Promise.all(inputs.map(async input => JSON.parse(await fs.readFile(input, 'utf8'))));
const plan = buildBrowserPreWriterPlan(reports);
const output = new URL('../reports/browser-prewriter-plan.json', import.meta.url);
await fs.writeFile(output, JSON.stringify(plan, null, 2) + '\n');
console.log(JSON.stringify({ writes: false, shops: plan.shops.map(shop => ({ shop: shop.shop, ...shop.summary })) }));
