import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const path='supabase/migrations/20261110100000_offer_freshness_status.sql';

test('freshness projection preserves strict valid-price selection and deterministic ordering',async()=>{
  const sql=await fs.readFile(path,'utf8');
  for(const fragment of ["po.status='success'",'po.verified=true','po.price is not null','po.price>0','order by po.observed_at desc, po.created_at desc, po.id desc']) assert.match(sql,new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('freshness projection exposes the requested derived diagnostics without changing the current price',async()=>{
  const sql=await fs.readFile(path,'utf8');
  for(const field of ['last_verified_at','age_days','freshness_status','latest_attempt_source_method','latest_attempt_http_status','preservation_reason']) assert.match(sql,new RegExp('\\b'+field+'\\b'));
  for(const state of ['fresh','aging','stale','very_stale']) assert.match(sql,new RegExp("'"+state+"'"));
  assert.match(sql,/interval '1 day'/);
  assert.match(sql,/interval '3 days'/);
  assert.match(sql,/interval '7 days'/);
  assert.match(sql,/attempt\.status in \('blocked','captcha','not_found','parse_error','http_error'\)/);
});
