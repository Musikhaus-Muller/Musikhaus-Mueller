import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

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

test('rechaza generación y color distintos',()=>{
 assert.throws(()=>parsePrice(html('MAUI 11 G2 schwarz'),'MAUI 11 G3 schwarz','www.kirstein.de'));
 assert.throws(()=>parsePrice(html('MAUI 11 G3 schwarz'),'MAUI 11 G3 weiss','www.kirstein.de'));
});

test('normaliza alemán weiß y weiss como el mismo color',()=>{
 const parsed=parsePrice(html('DAP Frigga Aktive Einzelsäule PA-System Weiß',1089),'dap frigga aktive einzelsaeule pa system weiss','www.prolighting.de');
 assert.equal(parsed.price,1089);
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

test('PRO LIGHTING usa el precio visible inmediatamente anterior a inkl MwSt',()=>{
 const htmlFixture='<h1>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</h1><div>Finanzierung ab 19,67 EUR / Monat</div><div>UVP: 1.605,31 €</div><div>1.089,00 €</div><div>inkl. MwSt.</div>';
 const parsed=parsePrice(htmlFixture,'DAP Frigga Aktive Einzelsäule PA-System Weiss','www.prolighting.de');
 assert.equal(parsed.price,1089);
});

test('PRO LIGHTING visible-price fallback ignores financing and UVP',()=>{
 const htmlFixture='<h1>LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß</h1><div>Finanzierung ab 25,99 EUR / Monat</div><div>UVP: 1.559,90 €</div><span>1.439,00 €</span><div>inkl. MwSt.</div>';
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

test('API refresh legacy está retirada',async()=>{
 const r=await worker.fetch(new Request('https://site/api/refresh',{method:'POST'}),{});
 assert.equal(r.status,410);
 const body=await r.json();
 assert.equal(body.collector,'github-actions');
});

test('MCP conserva las dos herramientas sin depender de R2',async()=>{
 const r=await worker.fetch(new Request('https://site/mcp',{method:'POST',body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})}),{});
 const body=await r.json();
 assert.equal(body.result.tools.length,2);
 assert.deepEqual(body.result.tools.map(x=>x.name),['refresh_prices','price_update_status']);
});
