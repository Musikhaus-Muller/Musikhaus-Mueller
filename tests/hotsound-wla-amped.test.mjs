import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const migrationPath='supabase/migrations/20261106160000_hotsound_wla_amped_verified_offer.sql';

test('Hot Sound r40 WLA Amped offer matches the exact reference composition',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const offer=seed.find(row=>row.id==='r40')?.offers?.hotsound;
  assert.ok(offer);
  assert.equal(offer.price,15290);
  assert.equal(offer.match,'exact');
  assert.equal(offer.classification,'exact_price');
  assert.equal(offer.collectionDisabled,undefined);
  assert.match(offer.contents,/8 × WLA-210XP/);
  assert.match(offer.contents,/2 × WLA-210X/);
  assert.match(offer.contents,/2 × DP-4100F MK2/);
  assert.equal(offer.priceDate,'2026-11-06');
  assert.equal(offer.verifiedToday,true);
});

test('Hot Sound r40 migration mirrors the direct verified set and preserves metadata',async()=>{
  const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
  const offer=seed.find(row=>row.id==='r40').offers.hotsound;
  const sql=await fs.readFile(migrationPath,'utf8');
  assert.ok(sql.includes("'r40'"));
  assert.ok(sql.includes(offer.url));
  assert.ok(sql.includes("15290"));
  assert.ok(sql.includes("2 × DP-4100F MK2"));
  assert.match(sql,/'direct_bundle',true/);
  assert.match(sql,/metadata\s*=\s*coalesce\(existing_offer\.metadata,'\{\}'::jsonb\)\s*\|\|\s*excluded\.metadata/);
});
