import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reviewSignal, formatCandidate } from '../collector/review-core.mjs';

const c=(score,{components=false,id='x'}={})=>({
  id,
  candidate_name:'Candidate '+id,
  candidate_url:'https://www.prolighting.de/'+id+'.html',
  candidate_price:100,
  match_score:score,
  source_url:'https://www.prolighting.de/category',
  metadata:{confidence:score>=0.9?'high':'low',likely_requires_components:components}
});

test('review marks a separated >=0.95 top candidate as unique_high',()=>{
  assert.deepEqual(reviewSignal([c(1),c(0.88)]),{signal:'unique_high',margin:0.12});
});

test('review keeps close high candidates ambiguous',()=>{
  assert.deepEqual(reviewSignal([c(1),c(0.98)]),{signal:'ambiguous_high',margin:0.02});
});

test('review sends component-like bundles to components_review even with score 1',()=>{
  assert.equal(reviewSignal([c(1,{components:true})]).signal,'components_review');
});

test('review keeps sub-0.90 candidates weak',()=>{
  assert.equal(reviewSignal([c(0.75)]).signal,'weak');
});

test('formatted candidate exposes id score confidence price and URL',()=>{
  const out=formatCandidate(c(0.96,{id:'abc'}),1);
  assert.equal(out.id,'abc');
  assert.equal(out.score,0.96);
  assert.equal(out.confidence,'high');
  assert.equal(out.price,100);
  assert.match(out.url,/abc\.html$/);
});
