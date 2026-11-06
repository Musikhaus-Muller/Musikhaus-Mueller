import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestHeaders, shouldCompatibleRetry } from '../collector/request-profiles.mjs';

test('compatible HTTP profile is static and browser-like without rotating identities',()=>{
  const a=requestHeaders({compatible:true});
  const b=requestHeaders({compatible:true});
  assert.deepEqual(a,b);
  assert.match(a['User-Agent'],/^Mozilla\/5\.0/);
  assert.match(a.Accept,/application\/xhtml\+xml/);
  assert.equal(a['Accept-Language'],'de-DE,de;q=0.9,en;q=0.7');
});

test('Kirstein-compatible retry is limited to blocked or captcha outcomes',()=>{
  const strategy={compatibleHttpRetry:true};
  assert.equal(shouldCompatibleRetry(strategy,{status:'blocked'}),true);
  assert.equal(shouldCompatibleRetry(strategy,{status:'captcha'}),true);
  assert.equal(shouldCompatibleRetry(strategy,{status:'not_found'}),false);
  assert.equal(shouldCompatibleRetry(strategy,{status:'parse_error'}),false);
  assert.equal(shouldCompatibleRetry({compatibleHttpRetry:false},{status:'blocked'}),false);
});
