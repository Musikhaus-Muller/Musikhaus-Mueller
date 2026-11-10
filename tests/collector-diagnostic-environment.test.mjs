import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { strategyFor } from '../collector/strategies.mjs';

test('diagnostic-only exits before Supabase and reports no writes', async () => {
  const source = await fs.readFile('collector/run.mjs', 'utf8');
  assert.match(source, /if \(diagnosticOnly\) \{\s+await runDiagnosticOnly\(\);\s+process\.exit\(0\);/);
  assert.match(source, /writes: false/);
  assert.match(source, /execution_environment: executionEnvironment/);
  assert.match(source, /COLLECT_EXECUTION_ENV must be github, local, or self_hosted/);
});

test('diagnostics expose only declared official alternate sources', () => {
  assert.deepEqual(strategyFor('thomann').diagnosticSources, ['https://www.thomann.de/sitemap.xml']);
  assert.deepEqual(strategyFor('kirstein').diagnosticSources, ['https://www.kirstein.de/sitemap.xml']);
  assert.equal(strategyFor('hotsound').diagnosticSources.length, 0);
  assert.equal(strategyFor('musicstore').diagnosticSources.length, 1);
});
