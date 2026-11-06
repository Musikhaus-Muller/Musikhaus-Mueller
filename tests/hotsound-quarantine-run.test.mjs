import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Hot Sound invalid fallback run is quarantined without inventing replacement prices', async () => {
  const sql=await fs.readFile('supabase/migrations/20261106172000_quarantine_invalid_hotsound_fallback_run.sql','utf8');
  assert.match(sql,/26b5de17-c258-4503-997f-a51831f37a44/);
  assert.match(sql,/update public\.price_observations/);
  assert.match(sql,/update public\.component_price_observations/);
  assert.match(sql,/update public\.collection_results/);
  assert.match(sql,/status = 'parse_error'/);
  assert.match(sql,/price = null/);
  assert.match(sql,/offers_updated = 0/);
  assert.match(sql,/'preserved_parse_error', 7/);
  assert.doesNotMatch(sql,/insert into public\.price_observations/);
});
