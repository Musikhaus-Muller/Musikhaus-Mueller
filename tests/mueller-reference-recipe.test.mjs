import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Collector 2.1 recipes cover all Mueller reference configurations', async()=>{
  const dir='supabase/migrations';
  const names=(await fs.readdir(dir)).filter(name =>
    name.includes('component_discovery') || name.includes('recipe_r')
  );
  const sql=(await Promise.all(names.map(name=>fs.readFile(dir+'/'+name,'utf8')))).join('\n');

  assert.ok(sql.includes('reference_shop'));
  assert.ok(sql.includes('mueller'));
  assert.ok(sql.includes('structural'));
  assert.ok(sql.includes('secondary'));

  for(const id of ['r2','r8','r9','r10','r11','r12','r13','r14','r22','r23','r24','r25','r26','r27','r28','r29']){
    assert.ok(sql.includes("legacy_id='"+id+"'") || sql.includes("legacy_id = '"+id+"'"), id);
  }
});

test('Mueller recipe comparison exposes exact, similar, incomplete and wrong outcomes', async()=>{
  const src=await fs.readFile('collector/review-core.mjs','utf8');
  for(const signal of ['exact_recipe_match','similar_recipe_match','incomplete_recipe','wrong_recipe']){
    assert.ok(src.includes(signal), signal);
  }
});
