import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { applyOfferMultiplier, classifyError, classifyHttpStatus, multiplierFor } from '../collector/pricing.mjs';

const src=await fs.readFile('dist/server/index.js','utf8');
const {default:worker,parsePrice}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));

const html=(name,price=929,currency='EUR')=>`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name,offers:{price,priceCurrency:currency}})}</script>`;

test('precio EUR único y producto correcto',()=>{
 assert.equal(parsePrice(html('LD Systems MAUI 11 G3',929),'MAUI 11 G3','www.kirstein.de').price,929);
 assert.throws(()=>parsePrice(html('DAVE 18 G4X'),'MAUI 11 G3','www.kirstein.de'));
 assert.throws(()=>parsePrice(html('MAUI 11 G3',929,'USD'),'MAUI 11 G3','www.kirstein.de'));
 assert.throws(()=>parsePrice(html('MAUI 11 G3')+html('MAUI 11 G3',999),'MAUI 11 G3','www.kirstein.de'));
 assert.throws(()=>parsePrice('Just a moment','MAUI','www.kirstein.de'));
});

test('PRO LIGHTING MAUI 28 G3 black system price remains valid for r11',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</h1><div id="artd-buybox"><meta itemprop="price" content="1289.00"><meta itemprop="priceValidUntil" content="2027-11-06"></div><li>Farbe: Schwarz</li>';
 assert.equal(parsePrice(htmlFixture,'LD Systems MAUI 28 G3 schwarz','www.prolighting.de').price,1289);
});

test('rechaza generación y color distintos',()=>{
 assert.throws(()=>parsePrice(html('MAUI 11 G2 schwarz'),'MAUI 11 G3 schwarz','www.kirstein.de'));
 assert.throws(()=>parsePrice(html('MAUI 11 G3 schwarz'),'MAUI 11 G3 weiss','www.kirstein.de'));
});

test('normaliza alemán weiß y weiss como el mismo color',()=>{
 const parsed=parsePrice(html('DAP Frigga Aktive Einzelsäule PA-System Weiß',1089),'dap frigga aktive einzelsaeule pa system weiss','www.prolighting.de');
 assert.equal(parsed.price,1089);
});


test('PRO LIGHTING usa ecommerce item_name + precio neto cuando falta precio visible',()=>{
 const htmlFixture='<h1>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</h1><script>items:[{item_name: \'DAP Frigga - Aktive Einzelsäule PA-System - Weiß\', coupon: \'\', discount: 525.31, affiliation: \'www.prolighting.de\', item_brand: \'DAP Audio\', price: 907.56}]</script>';
 const parsed=parsePrice(htmlFixture,'2 × DAP Frigga - Aktive Einzelsäule PA-System - Weiß','www.prolighting.de');
 assert.equal(parsed.price,1080);
});

test('PRO LIGHTING ecommerce neto resuelve MAUI 28 G3 W',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß</h1><script>items:[{item_name: \'LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß\', price: 1116.81}]</script>';
 const parsed=parsePrice(htmlFixture,'2 × LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß','www.prolighting.de');
 assert.equal(parsed.price,1329);
});

test('PRO LIGHTING ecommerce no acepta otro producto o color',()=>{
 const htmlFixture='<h1>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</h1><script>items:[{item_name: \'DAP Frigga - Aktive Einzelsäule PA-System - Schwarz\', price: 881.51}]</script>';
 assert.throws(()=>parsePrice(htmlFixture,'DAP Frigga - Aktive Einzelsäule PA-System - Weiß','www.prolighting.de'));
});

test('PRO LIGHTING acepta itemprop price aunque content aparezca después',()=>{
 const htmlFixture='<h1>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</h1><meta itemprop="price" content="1089.00">';
 const parsed=parsePrice(htmlFixture,'DAP Frigga Aktive Einzelsäule PA-System Weiss','www.prolighting.de');
 assert.equal(parsed.price,1089);
});

test('PRO LIGHTING acepta itemprop price aunque content aparezca antes',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß</h1><meta content="1439.00" itemprop="price">';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G3 W Kompaktes Cardioid Saeulen PA System Weiss','www.prolighting.de');
 assert.equal(parsed.price,1439);
});

test('PRO LIGHTING ignora itemprop price cero y usa el precio comercial positivo',()=>{
 const htmlFixture='<h1 itemprop="name">LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</h1><div id="artd-buybox"><span content="0.00" itemprop="price">0,00 €</span><span class="price"><span content="1289.00" itemprop="price">1.289,00 €</span></span><meta itemprop="priceValidUntil" content="2027-11-06"></div><li>Farbe: Schwarz</li>';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G3 schwarz','www.prolighting.de');
 assert.equal(parsed.price,1289);
});

test('PRO LIGHTING ignora varios placeholders cero antes del precio del producto',()=>{
 const htmlFixture='<h1 itemprop="name">LD Systems MAUI 28 G2</h1><div id="artd-buybox"><span content="0.00" itemprop="price">0,00 €</span><span content="0,00" itemprop="price">0,00 €</span><span content="919.00" itemprop="price">919,00 €</span><meta itemprop="priceValidUntil" content="2027-11-06"></div><li>Farbe: schwarz</li>';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G2 schwarz','www.prolighting.de');
 assert.equal(parsed.price,919);
});

test('PRO LIGHTING rechaza varios precios positivos distintos en el mismo producto',()=>{
 const htmlFixture='<h1 itemprop="name">LD Systems MAUI 28 G3</h1><div id="artd-buybox"><span content="0.00" itemprop="price">0,00 €</span><span content="1289.00" itemprop="price">1.289,00 €</span><span content="1399.00" itemprop="price">1.399,00 €</span><meta itemprop="priceValidUntil" content="2027-11-06"></div><li>Farbe: Schwarz</li>';
 assert.throws(()=>parsePrice(htmlFixture,'LD Systems MAUI 28 G3 schwarz','www.prolighting.de'));
});

test('PRO LIGHTING rechaza el precio positivo de un producto de color equivocado',()=>{
 const htmlFixture='<h1 itemprop="name">LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß</h1><div id="artd-buybox"><span content="0.00" itemprop="price">0,00 €</span><span content="999.00" itemprop="price">999,00 €</span><meta itemprop="priceValidUntil" content="2027-11-06"></div><li>Farbe: Weiß</li>';
 assert.throws(()=>parsePrice(htmlFixture,'LD Systems MAUI 28 G3 schwarz','www.prolighting.de'));
});

test('PRO LIGHTING no acepta UVP ni financiación como precio comercial',()=>{
 const htmlFixture='<h1 itemprop="name">LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</h1><div id="artd-buybox"><span content="0.00" itemprop="price">0,00 €</span><div>Finanzierung ab 25,99 EUR / Monat</div><div>UVP: 1.559,90 €</div><div>inkl. MwSt.</div></div><li>Farbe: Schwarz</li>';
 assert.throws(()=>parsePrice(htmlFixture,'LD Systems MAUI 28 G3 schwarz','www.prolighting.de'));
});

test('PRO LIGHTING usa el precio visible inmediatamente anterior a inkl MwSt',()=>{
 const htmlFixture='<h1>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</h1><div>Finanzierung ab 19,67 EUR / Monat</div><div>UVP: 1.605,31 €</div><div>1.089,00 €</div><div>inkl. MwSt.</div>';
 const parsed=parsePrice(htmlFixture,'DAP Frigga Aktive Einzelsäule PA-System Weiss','www.prolighting.de');
 assert.equal(parsed.price,1089);
});

test('PRO LIGHTING prefers the gross itemprop price over ecommerce net price',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G2 SUB PC, Gepolsterte Schutzhülle für MAUI 28 G2 Subwoofer, Schwarz</h1><div id="artd-buybox"><meta itemprop="price" content="45.00"><meta itemprop="priceValidUntil" content="2027-11-06"></div><script>items:[{item_name: \'LD Systems MAUI 28 G2 SUB PC, Gepolsterte Schutzhülle für MAUI 28 G2 Subwoofer, Schwarz\', price: 37.82}]</script>';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G2 SUB PC schwarz','www.prolighting.de');
 assert.equal(parsed.price,45);
});

test('PRO LIGHTING accepts the official white set only when its exact contents are expected',()=>{
 const htmlFixture='<div>Dieses Set besteht aus:<ul><li>LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</li></ul></div><h1>LD Systems MAUI 28 G3 W + Taschenset</h1><p><strong>Set besteht aus:</strong></p><ul><li>1x LD Systems MAUI 28 G3 E, Kompaktes Cardioid Säulen PA System, Weiß (AHLDMAUI28G3W)</li><li>1x LD Systems MAUI 28 G3 SAT BAG, Gepolsterte Tragetasche</li><li>1x LD Systems MAUI 28 G3 SUB PC, Gepolsterte Schutzhülle</li></ul><div id="artd-buybox"><meta itemprop="price" content="1428.25"></div>';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G3 W + Taschenset','www.prolighting.de','1 × MAUI 28 G3 weiß; 1 × Säulentasche; 1 × Subwooferhülle.');
 assert.equal(parsed.price,1428.25);
});

test('PRO LIGHTING validates r4 composition per advertised 2x set and keeps the published bundle total',async()=>{
 const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
 const r4=seed.find(configuration=>configuration.id==='r4').offers.prolighting;
 const htmlFixture='<h1>LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen</h1><div class="artd-configurator"><div class="h3">Dieses Set besteht aus:</div><div class="artd-configurator-content"><div class="artd-configurator-element"><div class="artd-configurator-element-selection-title selection-title">LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</div></div><div class="artd-configurator-element"><div class="artd-configurator-element-selection-title selection-title">LD Systems MAUI 28 G3 SAT BAG, Gepolsterte Tragetasche</div></div><div class="artd-configurator-element"><div class="artd-configurator-element-selection-title selection-title">LD Systems MAUI 28 G3 SUB PC, Gepolsterte Schutzhülle</div></div></div></div><p>Technische Daten: Farbe: Schwarz</p><div id="artd-buybox"><meta itemprop="price" content="2841.50"></div>';
 const parsed=parsePrice(htmlFixture,r4.name,'www.prolighting.de',r4.contents);
 assert.equal(parsed.price,2841.5);
 assert.equal(multiplierFor({calculation:null}),1);
 assert.equal(applyOfferMultiplier(parsed.price,multiplierFor({calculation:null})),2841.5);
});

test('PRO LIGHTING validates a unit price before applying an explicit offer multiplier',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen</h1><div class="artd-configurator"><div class="h3">Dieses Set besteht aus:</div><div class="artd-configurator-content"><div class="artd-configurator-element"><div class="artd-configurator-element-selection-title selection-title">LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</div></div><div class="artd-configurator-element"><div class="artd-configurator-element-selection-title selection-title">LD Systems MAUI 28 G3 SAT BAG, Gepolsterte Tragetasche</div></div><div class="artd-configurator-element"><div class="artd-configurator-element-selection-title selection-title">LD Systems MAUI 28 G3 SUB PC, Gepolsterte Schutzhülle</div></div></div></div><p>Technische Daten: Farbe: Schwarz</p><div id="artd-buybox"><meta itemprop="price" content="1420.75"></div>';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen','www.prolighting.de','2 × MAUI 28 G3 schwarz; 2 × Säulentasche; 2 × Subwooferhülle.');
 const offer={calculation:'2 × 1.420,75 € = 2.841,50 €'};
 assert.equal(multiplierFor(offer),2);
 assert.equal(applyOfferMultiplier(parsed.price,multiplierFor(offer)),2841.5);
});

test('PRO LIGHTING rejects incomplete or white r4 stereo set composition',()=>{
 const incomplete='<h1>LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen</h1><p>Set besteht aus:</p><ul><li>LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</li><li>LD Systems MAUI 28 G3 SAT BAG, Gepolsterte Tragetasche</li></ul><p>Farbe: Schwarz</p><div id="artd-buybox"><meta itemprop="price" content="2841.50"></div>';
 const wrongColor='<h1>LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen</h1><p>Set besteht aus:</p><ul><li>LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System, Weiß</li><li>LD Systems MAUI 28 G3 SAT BAG, Gepolsterte Tragetasche</li><li>LD Systems MAUI 28 G3 SUB PC, Gepolsterte Schutzhülle</li></ul><p>Farbe: Weiß</p><div id="artd-buybox"><meta itemprop="price" content="2841.50"></div>';
 const contents='2 × MAUI 28 G3 schwarz; 2 × Säulentasche; 2 × Subwooferhülle.';
 assert.throws(()=>parsePrice(incomplete,'LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen','www.prolighting.de',contents),/sub_cover/);
 assert.throws(()=>parsePrice(wrongColor,'LD Systems MAUI 28 G3 Stereo Bundle 2x Maui 28 G3 + Taschen','www.prolighting.de',contents),/black MAUI 28 G3 system/);
});

test('PRO LIGHTING composition validation errors are parse errors, not network errors',()=>{
 assert.equal(classifyError(new Error('Official bundle contents confirm 1 system components per unit; expected 1 per unit')),'parse_error');
 assert.equal(classifyError(new Error('Official page does not expose a readable set composition')),'parse_error');
 assert.equal(classifyError(new Error('Bundle composition contains an unclassified component')),'parse_error');
});

test('HTTP status classification distinguishes missing Thomann pages from transient failures',()=>{
 assert.equal(classifyHttpStatus(404),'not_found');
 assert.equal(classifyHttpStatus(410),'not_found');
 assert.equal(classifyError(new Error('HTTP 404')),'not_found');
 assert.equal(classifyHttpStatus(429),'blocked');
 assert.equal(classifyHttpStatus(403),'blocked');
 assert.equal(classifyHttpStatus(503),'network_error');
 assert.equal(classifyError(new Error('ETIMEDOUT')),'network_error');
 assert.equal(classifyError(new Error('CAPTCHA / access challenge detected')),'captcha');
});

test('PRO LIGHTING rejects the white official set and base-system page for the black bundle',async()=>{
 const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
 const r3=seed.find(configuration=>configuration.id==='r3').offers.prolighting;
 const officialWhiteSet='<div>Dieses Set besteht aus:<ul><li>LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</li></ul></div><h1>LD Systems MAUI 28 G3 W + Taschenset</h1><p><strong>Set besteht aus:</strong></p><ul><li>1x LD Systems MAUI 28 G3 E, Kompaktes Cardioid Säulen PA System, Weiß (AHLDMAUI28G3W)</li><li>1x LD Systems MAUI 28 G3 SAT BAG, Gepolsterte Tragetasche</li><li>1x LD Systems MAUI 28 G3 SUB PC, Gepolsterte Schutzhülle</li></ul><div id="artd-buybox"><meta itemprop="price" content="1428.25"></div>';
 const baseSystemOnly='<h1>LD Systems MAUI 28 G3, Kompaktes Cardioid Säulen PA System</h1><div id="artd-buybox"><meta itemprop="price" content="1289.00"></div><li>Farbe: Schwarz</li>';
 assert.throws(()=>parsePrice(officialWhiteSet,r3.name,'www.prolighting.de',r3.contents),/black MAUI 28 G3 system/);
 assert.throws(()=>parsePrice(baseSystemOnly,r3.name,'www.prolighting.de',r3.contents),/set composition/);
});

test('PRO LIGHTING visible-price fallback ignores financing and UVP',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß</h1><div>Finanzierung ab 25,99 EUR / Monat</div><div>UVP: 1.559,90 €</div><span>1.439,00 €</span><div>inkl. MwSt.</div>';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G3 W Kompaktes Cardioid Saeulen PA System Weiss','www.prolighting.de');
 assert.equal(parsed.price,1439);
});

test('PRO LIGHTING decodifica precio con nbsp y euro entity',()=>{
 const htmlFixture='<h1>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</h1><div>Finanzierung ab 19,67 EUR / Monat</div><div>UVP: 1.605,31&nbsp;&euro;</div><div>1.089,00&nbsp;&euro;</div><div>inkl. MwSt.</div>';
 const parsed=parsePrice(htmlFixture,'DAP Frigga Aktive Einzelsäule PA-System Weiss','www.prolighting.de');
 assert.equal(parsed.price,1089);
});

test('PRO LIGHTING decodifica euro entity en MAUI blanco',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß</h1><div>Finanzierung ab 25,99 EUR / Monat</div><div>UVP: 1.559,90&nbsp;&euro;</div><span>1.439,00&nbsp;&euro;</span><div>inkl. MwSt.</div>';
 const parsed=parsePrice(htmlFixture,'LD Systems MAUI 28 G3 W Kompaktes Cardioid Saeulen PA System Weiss','www.prolighting.de');
 assert.equal(parsed.price,1439);
});

test('stock acepta formato corto y no interpreta valores desconocidos como agotado',()=>{
 const fixture=availability=>JSON.stringify({'@type':'Product',name:'MAUI 11 G3',offers:{price:929,priceCurrency:'EUR',availability}});
 const parse=a=>parsePrice('<script type="application/ld+json">'+fixture(a)+'</script>','MAUI 11 G3','www.musikhaus-mueller.de');
 assert.equal(parse('InStock').available,true);
 assert.equal(parse('https://schema.org/OutOfStock').available,false);
 assert.equal(parse('Unknown').available,undefined);
});

test('JSON-LD ItemList anidado permite extraer producto de una categoría',()=>{
 const nested={"@type":"ItemList",itemListElement:[{"@type":"ListItem",position:1,item:{"@type":"Product",name:"LD Systems STINGER G3 POWER SET A Aktivsystem",offers:{price:"4169.00",priceCurrency:"EUR",availability:"https://schema.org/InStock"}}},{"@type":"ListItem",position:2,item:{"@type":"Product",name:"Otro producto",offers:{price:"999.00",priceCurrency:"EUR"}}}]};
 const parsed=parsePrice('<script type="application/ld+json">'+JSON.stringify(nested)+'</script>','LD Systems STINGER G3 POWER SET A Aktivsystem','www.hotsound-store.com');
 assert.equal(parsed.price,4169);
 assert.equal(parsed.available,true);
});

test('public refresh and manual dispatch endpoints stay retired',async()=>{
 const legacy=await worker.fetch(new Request('https://site/api/refresh',{method:'POST'}),{});
 assert.equal(legacy.status,410);
 const manual=await worker.fetch(new Request('https://site/api/updates/manual',{method:'POST'}),{});
 assert.equal(manual.status,410);
 const body=await manual.json();
 assert.match(body.message,/GitHub Actions/);
});

test('MCP conserva las dos herramientas sin depender de R2',async()=>{
 const r=await worker.fetch(new Request('https://site/mcp',{method:'POST',body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})}),{});
 const body=await r.json();
 assert.equal(body.result.tools.length,2);
 assert.deepEqual(body.result.tools.map(x=>x.name),['refresh_prices','price_update_status']);
});
