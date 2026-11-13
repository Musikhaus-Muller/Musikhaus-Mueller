import fs from 'node:fs/promises';

const shops = ['thomann', 'musicstore', 'hotsound'];
const reports = await Promise.all(shops.map(async shop => {
  try { return [shop, JSON.parse(await fs.readFile(new URL(`../reports/${shop}-browser-shadow.json`, import.meta.url), 'utf8'))]; }
  catch { return [shop, null]; }
}));
const byShop = Object.fromEntries(reports.map(([shop, report]) => [shop, report?.summary || { status: 'not_run' }]));
const total = reports.reduce((sum, [, report]) => sum + (report?.summary?.tested || 0), 0);
const recovered = reports.reduce((sum, [, report]) => sum + (report?.summary?.prices_recovered || 0), 0);
await fs.writeFile(new URL('../reports/browser-shadow-summary.json', import.meta.url), JSON.stringify({ writes: false, shops: byShop, total_tested: total, prices_recovered: recovered }, null, 2) + '\n');
console.log(JSON.stringify({ total_tested: total, prices_recovered: recovered }));
