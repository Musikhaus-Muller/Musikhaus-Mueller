import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  reviewSignal,
  formatCandidate,
  componentReviewSignal,
  formatComponentCandidate
} from '../collector/review-core.mjs';

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


test('component review marks exact Mueller recipe when all structural components match strongly',()=>{
  const recipe=[
    {key:'top',role:'structural'},
    {key:'sub',role:'structural'}
  ];
  const groups=new Map([
    ['top',[{match_score:0.99}]],
    ['sub',[{match_score:0.97}]]
  ]);
  assert.deepEqual(componentReviewSignal(recipe,groups),{signal:'exact_recipe_match',covered:2,total:2});
});

test('component review marks equivalent secondary accessories as similar recipe',()=>{
  const recipe=[
    {key:'top',role:'structural'},
    {key:'cable',role:'secondary'}
  ];
  const groups=new Map([
    ['top',[{match_score:0.99}]],
    ['cable',[{match_score:0.88}]]
  ]);
  assert.deepEqual(componentReviewSignal(recipe,groups),{signal:'similar_recipe_match',covered:2,total:2});
});

test('component review marks missing required Mueller components as incomplete',()=>{
  const recipe=[{key:'top',role:'structural'},{key:'sub',role:'structural'}];
  assert.deepEqual(componentReviewSignal(recipe,new Map([
    ['top',[{match_score:0.98}]]
  ])),{signal:'incomplete_recipe',covered:1,total:2});
});

test('component review marks weak or ambiguous structural matches as wrong recipe',()=>{
  const recipe=[{key:'top',role:'structural'}];
  assert.equal(componentReviewSignal(recipe,new Map([
    ['top',[{match_score:0.75}]]
  ])).signal,'wrong_recipe');
  assert.equal(componentReviewSignal(recipe,new Map([
    ['top',[{match_score:0.98},{match_score:0.96}]]
  ])).signal,'wrong_recipe');
});

test('formatted component candidate preserves quantity and component identity',()=>{
  const out=formatComponentCandidate({
    id:'x',component_key:'sub',component_label:'ICOA SUB 18 A',component_kind:'main',quantity:4,
    candidate_name:'LD Systems ICOA SUB 18 A',candidate_url:'https://www.prolighting.de/sub.html',
    candidate_price:845,match_score:1,source_url:'https://www.prolighting.de/cat',
    metadata:{confidence:'high'}
  },1);
  assert.equal(out.quantity,4);
  assert.equal(out.key,'sub');
  assert.equal(out.score,1);
});
