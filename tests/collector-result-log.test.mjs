import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatResultLogMessage } from '../collector/result-log.mjs';

const preservationText = 'previous valid price preserved';

for (const status of ['blocked', 'captcha', 'not_found']) {
  test(`${status} log preserves an existing preservation message exactly once`,()=>{
    const message = formatResultLogMessage({
      status,
      error: `HTTP result; strategy=http-preserve-on-block; ${preservationText}`
    });
    assert.equal(message.split(preservationText).length - 1,1);
  });
}

test('a blocked component bundle has one coherent bundle preservation message',()=>{
  const preservationText = 'previous valid bundle price preserved';
  const message = formatResultLogMessage({
    status:'blocked',
    error:`Component failed: Sub · HTTP 403; strategy=http-preserve-on-block; ${preservationText}`
  },{bundle:true});
  assert.equal(message.split(preservationText).length - 1,1);
  assert.equal(message.includes('; previous valid price preserved'),false);
});

test('logging adds preservation text only when final.error has none',()=>{
  const message = formatResultLogMessage({status:'blocked',error:'HTTP 403'});
  assert.equal(message,'HTTP 403; previous valid price preserved');
  assert.equal(message.split(preservationText).length - 1,1);
});
