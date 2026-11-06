import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const migrationPath='supabase/migrations/20261106203000_strict_current_offer_status.sql';

test('current_offer_status only exposes verified positive successes with deterministic ordering', async()=>{
  const sql=await fs.readFile(migrationPath,'utf8');
  assert.match(sql,/po\.status='success'/);
  assert.match(sql,/po\.verified=true/);
  assert.match(sql,/po\.price is not null/);
  assert.match(sql,/po\.price>0/);
  assert.match(sql,/order by po\.observed_at desc, po\.created_at desc, po\.id desc/);
});

test('frontend projection excludes offers without a valid positive current price', async()=>{
  const sql=await fs.readFile(migrationPath,'utf8');
  assert.match(sql,/join public\.current_offer_status cs on cs\.offer_id = o\.id/);
  assert.match(sql,/cs\.price is not null/);
  assert.match(sql,/cs\.price > 0/);
});

test('five browser-verified Thomann rows are normalized without rewriting history', async()=>{
  const sql=await fs.readFile(migrationPath,'utf8');
  for(const id of ['r11','r12','r14','r19','r29']) assert.match(sql,new RegExp("'"+id+"'"));
  for(const price of ['4419','7269','999','3305','7759']) assert.match(sql,new RegExp('\\b'+price+'\\b'));
  assert.match(sql,/'browser_audit'/);
  assert.match(sql,/verified,\n\s*true/);
  assert.doesNotMatch(sql,/update\s+public\.price_observations\s+set/i);
});
