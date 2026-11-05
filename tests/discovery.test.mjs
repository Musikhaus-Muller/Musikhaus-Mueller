import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  discoverySourcesFor,
  extractCatalogCandidates,
  scoreDiscoveryCandidate,
  likelyNeedsComponents,
  confidenceBand
} from '../collector/discovery-core.mjs';

test('PRO LIGHTING discovery has official sources for supported LD Systems families',()=>{
  for (const family of ['MAUI','DAVE','STINGER','ICOA']) {
    const sources=discoverySourcesFor({family,name:family});
    assert.ok(sources.length > 0, family);
    assert.ok(sources.every(x=>x.startsWith('https://www.prolighting.de/')));
  }
  assert.deepEqual(discoverySourcesFor({family:'Wharfedale',name:'DELTA-X218B'}),[]);
});

test('discovery extracts product links and nearby sale price from official catalog HTML',()=>{
  const html='<a href="/de/audio/ld-systems-icoa-12-a.html" title="LD Systems ICOA 12 A">LD Systems ICOA 12 A</a><div>UVP: 456,90 €</div><div>359,00 €</div><div>inkl. MwSt.</div>';
  const rows=extractCatalogCandidates(html,'https://www.prolighting.de/de/tontechnik/');
  assert.equal(rows.length,1);
  assert.equal(rows[0].name,'LD Systems ICOA 12 A');
  assert.equal(rows[0].price,359);
  assert.match(rows[0].url,/prolighting\.de\/de\/audio\/ld-systems-icoa-12-a\.html/);
});

test('discovery rejects different generation, color and model number',()=>{
  const config={brand:'LD Systems',family:'MAUI',name:'MAUI 28 G3 Stereo',subtitle:'Weiß · 2 Säulensysteme'};
  assert.equal(scoreDiscoveryCandidate(config,{name:'LD Systems MAUI 28 G2 Weiß'}).reason,'generation_mismatch');
  assert.equal(scoreDiscoveryCandidate(config,{name:'LD Systems MAUI 28 G3 Schwarz'}).reason,'color_mismatch');
  assert.equal(scoreDiscoveryCandidate(config,{name:'LD Systems MAUI 11 G3 Weiß'}).reason,'model_number_mismatch');
});

test('discovery accepts same model/generation/color with a high score',()=>{
  const config={brand:'LD Systems',family:'MAUI',name:'MAUI 28 G3 Stereo',subtitle:'Weiß · 2 Säulensysteme'};
  const match=scoreDiscoveryCandidate(config,{name:'LD Systems MAUI 28 G3 W Kompaktes Cardioid Säulen PA System Weiß'});
  assert.equal(match.accepted,true);
  assert.ok(match.score >= 0.62);
});

test('discovery flags bundles likely to require components instead of auto-publishing them',()=>{
  assert.equal(likelyNeedsComponents({name:'MAUI 28 G3 Stereo + Taschen',subtitle:'2 Systeme + 4 Taschen/Hüllen'}),true);
  assert.equal(likelyNeedsComponents({name:'MAUI 28 G3 Stereo',subtitle:'2 Säulensysteme'}),false);
});


test('discovery confidence bands keep weak candidates visibly separate',()=>{
  assert.equal(confidenceBand(1),'high');
  assert.equal(confidenceBand(0.96),'high');
  assert.equal(confidenceBand(0.85),'medium');
  assert.equal(confidenceBand(0.75),'low');
});
