import fs from 'node:fs/promises';
const reports = await Promise.all(['thomann', 'musicstore', 'hotsound'].map(async shop => JSON.parse(await fs.readFile(new URL(`../reports/${shop}-source-resolution.json`, import.meta.url), 'utf8'))));
const total = key => reports.reduce((sum, report) => sum + Number(report.summary[key] || 0), 0);
const summary = { writes: false, observed_at: new Date().toISOString(), shops: Object.fromEntries(reports.map(report => [report.shop, report.summary])), global: { total_evaluated: total('evaluated'), total_refreshable: total('refreshable'), total_proposal_only: total('proposal_only'), total_preserve_only: total('blocked') + total('not_found') + total('unresolved') } };
await fs.writeFile(new URL('../reports/source-resolution-summary.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary.global));
