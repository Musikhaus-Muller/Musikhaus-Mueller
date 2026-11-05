import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Collector 2.1 recipes use Mueller as reference and classify structural vs secondary parts', async()=>{
  const sql=await fs.readFile('supabase/migrations/20261105103000_collector_v21_component_discovery.sql','utf8');
  assert.match(sql,/"reference_shop":"mueller"/);
  assert.match(sql,/"recipe_version":2/);
  assert.match(sql,/"role":"structural"/);
  assert.match(sql,/"role":"secondary"/);
  for (const id of ['r2','r8','r9','r10','r11','r12','r13','r14','r22','r23','r24','r25','r26','r27','r28','r29']) {
    assert.match(sql,new RegExp("where legacy_id = '"+id+"'"));
  }
});

test('Mueller recipe comparison exposes only exact, similar, incomplete or wrong recipe outcomes', async()=>{
  const src=await fs.readFile('collector/review-core.mjs','utf8');
  for(const signal of ['exact_recipe_match','similar_recipe_match','incomplete_recipe','wrong_recipe']) {
    assert.match(src,new RegExp(signal));
  }
});
