import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreComponentCandidate, scoreDiscoveryCandidate } from '../collector/discovery-core.mjs';
import { parseCatalogProductPrice } from '../collector/catalog-sources.mjs';

const main=(expected, candidate)=>scoreComponentCandidate({expected,label:expected,kind:'main'}, {name:candidate});
const accessory=(expected, candidate)=>scoreComponentCandidate({expected,label:expected,kind:'accessory'}, {name:candidate});

test('strict identity rejects generation, MIX, colour, BT and PRO substitutions in both directions',()=>{
  for(const [expected,candidate] of [
    ['LD Systems MAUI 28 G2 schwarz','LD Systems MAUI 28 G3 schwarz'],
    ['LD Systems MAUI 28 G3 schwarz','LD Systems MAUI 28 G2 schwarz'],
    ['LD Systems MAUI 11 G3 schwarz','LD Systems MAUI 11 G3 MIX schwarz'],
    ['LD Systems MAUI 11 G3 MIX schwarz','LD Systems MAUI 11 G3 schwarz'],
    ['LD Systems MAUI 11 G3 schwarz','LD Systems MAUI 11 G3 weiß'],
    ['LD Systems MAUI 11 G3 weiß','LD Systems MAUI 11 G3 schwarz'],
    ['LD Systems ICOA 12 A BT','LD Systems ICOA 12 A'],
    ['LD Systems ICOA 12 A','LD Systems ICOA 12 A BT'],
    ['LD Systems ICOA PRO 12 A','LD Systems ICOA 12 A'],
    ['LD Systems ICOA 12 A','LD Systems ICOA PRO 12 A']
  ]) assert.equal(main(expected,candidate).accepted,false,`${expected} <- ${candidate}`);
});

test('strict identity rejects accessory, cable type and length substitutions in both directions',()=>{
  for(const [expected,candidate] of [
    ['ICOA 12 PC','ICOA 12 WPC'],['ICOA 12 WPC','ICOA 12 PC'],
    ['ICOA PRO SUB 21 CB Casterboard','ICOA PRO SUB 21 PC Cover'],['ICOA PRO SUB 21 PC Cover','ICOA PRO SUB 21 CB Casterboard'],
    ['MAUI 44 G2 SAT BAG','MAUI 44 G2 SUB PC'],['MAUI 44 G2 SUB PC','MAUI 44 G2 SAT BAG'],
    ['XLR Audio Kabel 3 m','DMX XLR Kabel 3 m'],['DMX XLR Kabel 3 m','XLR Audio Kabel 3 m'],
    ['XLR Audio Kabel 3 m','XLR Audio Kabel 5 m'],['XLR Audio Kabel 3 m','XLR Audio Kabel 6 m'],['XLR Audio Kabel 5 m','XLR Audio Kabel 10 m']
  ]) assert.equal(accessory(expected,candidate).accepted,false,`${expected} <- ${candidate}`);
});

test('strict identity requires a supplied SKU to match exactly',()=>{
  const component={expected:'LD Systems ICOA 12 A BT',sku:'AHLDICOA12ABT',kind:'main'};
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems ICOA 12 A BT',sku:'AHLDICOA12ABT'}).accepted,true);
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems ICOA 12 A BT',sku:'AHLDICOA12A'}).reason,'sku_mismatch');
  assert.equal(scoreDiscoveryCandidate({brand:'LD Systems',family:'ICOA',name:'ICOA 12 A BT',sku:'AHLDICOA12ABT'},{name:'LD Systems ICOA 12 A BT',sku:'AHLDICOA12A'}).reason,'sku_mismatch');
});

test('catalog parser never crosses a neighbouring product block for a price',()=>{
  const html='<div>LD Systems ICOA 12 A BT</div><div>not currently available</div><div>LD Systems ICOA 15 A BT</div><div>467,90 €</div><div>lieferbar</div>';
  assert.throws(()=>parseCatalogProductPrice(html,'LD Systems ICOA 12 A BT'),/price not found/);
});

test('main systems and accessories remain mutually exclusive',()=>{
  assert.equal(main('LD Systems MAUI 28 G3','LD Systems MAUI 28 G3 SAT BAG').reason,'component_kind_mismatch');
  assert.equal(accessory('LD Systems MAUI 28 G3 SAT BAG','LD Systems MAUI 28 G3').reason,'component_kind_mismatch');
});
