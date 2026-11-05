import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  discoverySourcesFor,
  extractCatalogCandidates,
  scoreDiscoveryCandidate,
  likelyNeedsComponents,
  confidenceBand,
  scoreComponentCandidate,
  discoveryRecipe
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


test('discovery rejects MAUI accessories as primary candidates',()=>{
  const config={brand:'LD Systems',family:'MAUI',name:'MAUI 44 G2 Stereo',subtitle:'2 Säulensysteme'};
  for (const name of [
    'LD Systems MAUI 44 G2 CB - Rollbrett für MAUI 44 G2',
    'LD Systems MAUI 44 G2 SAT BAG',
    'LD Systems MAUI 44 G2 SUB PC - Gepolsterte Schutzhülle'
  ]) {
    const match=scoreDiscoveryCandidate(config,{name});
    assert.equal(match.accepted,false,name);
    assert.equal(match.reason,'accessory_mismatch',name);
  }
});

test('discovery keeps the actual MAUI system as a candidate',()=>{
  const config={brand:'LD Systems',family:'MAUI',name:'MAUI 44 G2 Stereo',subtitle:'2 Säulensysteme'};
  const match=scoreDiscoveryCandidate(config,{name:'LD Systems MAUI 44 G2 - Säulen PA System'});
  assert.equal(match.accepted,true);
});

test('bundle configurations do not promote accessory-only pages as their main candidate',()=>{
  const config={brand:'LD Systems',family:'MAUI',name:'MAUI 11 G3 Power Bundle',subtitle:'System + Taschen'};
  const match=scoreDiscoveryCandidate(config,{name:'LD Systems MAUI 11 G3 SAT BAG, Gepolsterte Tragetasche'});
  assert.equal(match.accepted,false);
  assert.equal(match.reason,'accessory_mismatch');
});


test('component discovery accepts a matching main product and rejects accessories',()=>{
  const component={expected:'LD Systems MAUI 11 G3',label:'MAUI 11 G3',kind:'main'};
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems MAUI 11 G3 Portables Cardioid Säulen PA System'}).accepted,true);
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems MAUI 11 G3 SAT BAG'}).reason,'component_kind_mismatch');
});

test('component discovery accepts an expected accessory but rejects a main system',()=>{
  const component={expected:'LD Systems MAUI 11 G3 SAT BAG',label:'MAUI 11 G3 SAT BAG',kind:'accessory'};
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems MAUI 11 G3 SAT BAG Gepolsterte Tragetasche'}).accepted,true);
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems MAUI 11 G3 Portables Cardioid Säulen PA System'}).reason,'component_kind_mismatch');
});

test('component discovery enforces model numbers for ICOA recipes',()=>{
  const component={expected:'LD Systems ICOA 12 A BT',label:'ICOA 12 A BT',kind:'main'};
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems ICOA 15 A BT'}).reason,'model_number_mismatch');
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems ICOA 12 A BT'}).accepted,true);
});

test('discovery recipe is read from configuration metadata only when component mode is valid',()=>{
  assert.equal(discoveryRecipe({metadata:{}}),null);
  const recipe={mode:'components',components:[{key:'main'}]};
  assert.deepEqual(discoveryRecipe({metadata:{discovery_recipe:recipe}}),recipe);
});


test('component discovery rejects white when Mueller recipe explicitly expects black',()=>{
  const component={expected:'LD Systems MAUI 11 G3 schwarz',label:'MAUI 11 G3',kind:'main'};
  assert.equal(
    scoreComponentCandidate(component,{name:'LD Systems MAUI 11 G3 W Portables Cardioid Säulen PA System Weiß'}).reason,
    'color_mismatch'
  );
});

test('component discovery rejects bundle pages when recipe component expects one product type',()=>{
  const component={expected:'LD Systems MAUI 28 G3 schwarz',label:'MAUI 28 G3',kind:'main'};
  assert.equal(
    scoreComponentCandidate(component,{name:'LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen'}).reason,
    'bundle_component_mismatch'
  );
});

test('component discovery distinguishes active and passive STINGER products',()=>{
  const component={expected:'LD Systems STINGER 8 A G3',label:'STINGER 8 A G3',kind:'main'};
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems STINGER 8 G3'}).reason,'amplification_mismatch');
  assert.equal(scoreComponentCandidate(component,{name:'LD Systems STINGER 8 A G3'}).accepted,true);
});

test('component discovery distinguishes accessory subtypes',()=>{
  const sat={expected:'LD Systems MAUI 44 G2 SAT BAG',label:'SAT BAG',kind:'accessory'};
  assert.equal(
    scoreComponentCandidate(sat,{name:'LD Systems MAUI 44 G2 CB - Rollbrett'}).reason,
    'accessory_subtype_mismatch'
  );
});

test('component discovery treats WPC and EasyMount pages as accessories',()=>{
  const main={expected:'LD Systems ICOA PRO 12 A',label:'ICOA PRO 12 A',kind:'main'};
  assert.equal(
    scoreComponentCandidate(main,{name:'LD Systems ICOA 12 WPC Wetterschutzhülle für ICOA PRO 12'}).reason,
    'component_kind_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(main,{name:'LD Systems EasyMount Traversenhalterung für ICOA PRO 12'}).reason,
    'component_kind_mismatch'
  );
});


test('component discovery requires explicit generation when Mueller recipe specifies it',()=>{
  const g3={expected:'LD Systems MAUI 11 G3 schwarz',label:'MAUI 11 G3',kind:'main'};
  assert.equal(
    scoreComponentCandidate(g3,{name:'LD Systems MAUI 11'}).reason,
    'generation_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(g3,{name:'LD Systems MAUI 11 G3'}).accepted,
    true
  );
});

test('component discovery treats PC as padded cover and rejects mounts or WPC substitutes',()=>{
  const cover={expected:'ICOA 15 PC',label:'ICOA 15 PC',kind:'accessory'};
  assert.equal(
    scoreComponentCandidate(cover,{name:'LD Systems EasyMount Traversenhalterung für ICOA PRO 15'}).reason,
    'accessory_subtype_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(cover,{name:'LD Systems ICOA 15 WPC Wetterschutzhülle'}).reason,
    'accessory_subtype_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(cover,{name:'LD Systems ICOA 15 PC Gepolsterte Schutzhülle'}).accepted,
    true
  );
});


test('component discovery recognizes casterboard as rollboard subtype',()=>{
  const roll={expected:'ICOA PRO SUB 21 Casterboard',label:'Casterboard',kind:'accessory'};
  assert.equal(
    scoreComponentCandidate(roll,{name:'LD Systems ICOA PRO SUB 21 PC Gepolsterte Schutzhülle'}).reason,
    'accessory_subtype_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(roll,{name:'LD Systems ICOA PRO SUB 21 CB Rollbrett'}).accepted,
    true
  );
});

test('component discovery distinguishes padded PC covers from weatherproof WPC covers',()=>{
  const cover={expected:'ICOA 15 PC',label:'ICOA 15 PC',kind:'accessory'};
  assert.equal(
    scoreComponentCandidate(cover,{name:'LD Systems ICOA 15 WPC Wetterschutzhülle'}).reason,
    'accessory_subtype_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(cover,{name:'LD Systems ICOA 15 PC Gepolsterte Schutzhülle'}).accepted,
    true
  );
});


test('component discovery distinguishes complete MAUI systems from extra subwoofers',()=>{
  const main={expected:'LD Systems MAUI 28 G3 schwarz',label:'MAUI 28 G3',kind:'main'};
  const sub={expected:'LD Systems MAUI 28 G3 SUB schwarz',label:'MAUI 28 G3 SUB',kind:'main'};

  assert.equal(
    scoreComponentCandidate(main,{name:'LD Systems MAUI 28 G3 SUB Aktiver Subwoofer'}).reason,
    'structural_subtype_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(sub,{name:'LD Systems MAUI 28 G3 Kompaktes Cardioid Säulen PA System'}).reason,
    'structural_subtype_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(main,{name:'LD Systems MAUI 28 G3 Kompaktes Cardioid Säulen PA System'}).accepted,
    true
  );
  assert.equal(
    scoreComponentCandidate(sub,{name:'LD Systems MAUI 28 G3 SUB Aktiver Subwoofer'}).accepted,
    true
  );
});

test('component discovery rejects MIX variant when Mueller recipe expects standard system',()=>{
  const main={expected:'LD Systems MAUI 28 G3 schwarz',label:'MAUI 28 G3',kind:'main'};
  assert.equal(
    scoreComponentCandidate(main,{name:'LD Systems MAUI 28 G3 MIX Kompaktes Cardioid Säulen PA System Schwarz'}).reason,
    'structural_subtype_mismatch'
  );
});


test('supported component recipes include generic PRO LIGHTING accessory sources',()=>{
  const sources=discoverySourcesFor({family:'ICOA',name:'ICOA PRO 15A'});
  assert.ok(sources.some(x=>x.includes('/audiokabel/xlr-xlr.html')));
  assert.ok(sources.some(x=>x.includes('/stromkabel/powerconkabel.html')));
  assert.ok(sources.some(x=>x.includes('/hersteller/gravity.html')));
  assert.ok(sources.some(x=>x.includes('/stativtaschen.html')));
});

test('component discovery distinguishes XLR, PowerCon and hybrid cables',()=>{
  const xlr={expected:'XLR Kabel 3 m',label:'XLR 3m',kind:'accessory'};
  const power={expected:'PowerCon Kabel 3 m',label:'PowerCon 3m',kind:'accessory'};

  assert.equal(
    scoreComponentCandidate(xlr,{name:'DAP XLR Mikrofon Kabel schwarz 3m'}).accepted,
    true
  );
  assert.equal(
    scoreComponentCandidate(xlr,{name:'DAP powerCON/XLR M - powerCON/XLR F - DMX / Strom - 3 m'}).reason,
    'accessory_subtype_mismatch'
  );
  assert.equal(
    scoreComponentCandidate(power,{name:'PROmagiX Powercon Verbindungskabel 1,5 mm² 3 m'}).accepted,
    true
  );
  assert.equal(
    scoreComponentCandidate(power,{name:'DAP XLR Mikrofon Kabel schwarz 3m'}).reason,
    'accessory_subtype_mismatch'
  );
});

test('component discovery keeps cable length strict',()=>{
  const xlr3={expected:'XLR Kabel 3 m',label:'XLR 3m',kind:'accessory'};
  assert.equal(
    scoreComponentCandidate(xlr3,{name:'ADJ AC-XMXF/5 microphone cable XLR/XLR 5m'}).reason,
    'model_number_mismatch'
  );
});
