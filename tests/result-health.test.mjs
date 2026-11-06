import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyResultHealth, deriveRunHealth } from '../collector/result-health.mjs';

test('result health classifies successful, preserved, hard, and unknown statuses',()=>{
 assert.equal(classifyResultHealth('success'),'updated');
 assert.equal(classifyResultHealth('blocked'),'preserved_blocked');
 assert.equal(classifyResultHealth('captcha'),'preserved_captcha');
 assert.equal(classifyResultHealth('not_found'),'preserved_not_found');
 assert.equal(classifyResultHealth('parse_error'),'preserved_parse_error');
 assert.equal(classifyResultHealth('network_error'),'hard_failed');
 assert.equal(classifyResultHealth('unexpected'),'hard_failed');
 assert.equal(classifyResultHealth('toString'),'hard_failed');
});

test('preserved results count as useful and do not fail the database run',()=>{
 const health=deriveRunHealth([
  {status:'success'},{status:'success'},{status:'captcha'},{status:'blocked'},
  {status:'not_found'},{status:'parse_error'}
 ]);
 assert.equal(health.checked,6);
 assert.equal(health.updated,2);
 assert.equal(health.preserved,4);
 assert.equal(health.hardFailed,0);
 assert.equal(health.status,'success');
 assert.equal(health.healthStatus,'success_with_preserved');
 assert.deepEqual(health.resultCounts,{
  checked:6,updated:2,preserved:4,hard_failed:0,preserved_blocked:1,
  preserved_captcha:1,preserved_not_found:1,preserved_parse_error:1,
  network_error:0,unknown_failure:0
 });
});

test('only hard failures are counted as failed and useful results yield partial',()=>{
 const health=deriveRunHealth([
  {status:'success'},{status:'network_error'},{status:'unrecognized'}
 ]);
 assert.equal(health.status,'partial');
 assert.equal(health.hardFailed,2);
 assert.equal(health.networkErrors,1);
 assert.equal(health.unknownFailures,1);
 assert.equal(health.resultCounts.hard_failed,2);
});

test('runs with only hard failures have failed health',()=>{
 const health=deriveRunHealth([{status:'network_error'}]);
 assert.equal(health.status,'failed');
 assert.equal(health.healthStatus,'failed');
});
