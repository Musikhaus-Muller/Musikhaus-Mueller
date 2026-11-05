import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCandidate, formatComponentCandidate } from '../collector/review-core.mjs';

test('review formatting exposes price diagnostics from candidate metadata',()=>{
  const base={
    id:'x',candidate_name:'X',candidate_url:'https://www.prolighting.de/x.html',candidate_price:null,
    match_score:1,source_url:'https://www.prolighting.de/cat',metadata:{confidence:'high',price_source:null,price_error:'HTTP 403'}
  };
  const direct=formatCandidate(base,1);
  assert.equal(direct.priceError,'HTTP 403');
  assert.equal(direct.priceSource,null);
  const component=formatComponentCandidate({...base,component_key:'main',component_label:'X',component_kind:'main',quantity:1},1);
  assert.equal(component.priceError,'HTTP 403');
  assert.equal(component.priceSource,null);
});
