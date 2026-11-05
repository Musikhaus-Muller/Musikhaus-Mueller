import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCandidatePriceResolver, comparableRecipeTotal } from '../collector/discovery-pricing.mjs';

test('candidate price resolver keeps existing catalog price without fetching',async()=>{
  let calls=0;
  const resolve=createCandidatePriceResolver(async()=>{calls++;throw new Error('unexpected');},()=>({price:1}));
  const out=await resolve({name:'A',url:'https://www.prolighting.de/a.html',price:123.45});
  assert.equal(out.price,123.45);
  assert.equal(out.priceSource,'catalog');
  assert.equal(calls,0);
});

test('candidate price resolver verifies product page and caches by URL',async()=>{
  let calls=0;
  const fetcher=async()=>({ok:true,status:200,text:async()=>{calls++;return '<html>ok</html>';}});
  const parser=(html,expected,host)=>{
    assert.equal(expected,'LD Systems MAUI 28 G2');
    assert.equal(host,'www.prolighting.de');
    return {price:999};
  };
  const resolve=createCandidatePriceResolver(fetcher,parser);
  const candidate={name:'LD Systems MAUI 28 G2',url:'https://www.prolighting.de/maui-28-g2.html',price:null};
  assert.equal((await resolve(candidate)).price,999);
  assert.equal((await resolve(candidate)).price,999);
  assert.equal(calls,1);
});

test('candidate price resolver keeps no-price when product validation fails',async()=>{
  const fetcher=async()=>({ok:true,status:200,text:async()=>'<html>wrong</html>'});
  const resolve=createCandidatePriceResolver(fetcher,()=>{throw new Error('Kein eindeutiger EUR-Produktpreis');});
  const out=await resolve({name:'Expected',url:'https://www.prolighting.de/x.html',price:null});
  assert.equal(out.price,null);
  assert.match(out.priceError,/Kein eindeutiger/);
});

test('comparable total requires exact or similar recipe and all prices',()=>{
  const components=[{quantity:2,top1:{price:100}},{quantity:1,top1:{price:50}}];
  assert.equal(comparableRecipeTotal(components,'exact_recipe_match'),250);
  assert.equal(comparableRecipeTotal(components,'similar_recipe_match'),250);
  assert.equal(comparableRecipeTotal(components,'incomplete_recipe'),null);
  assert.equal(comparableRecipeTotal([{quantity:2,top1:{price:null}}],'exact_recipe_match'),null);
});
