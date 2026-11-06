import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicCatalogSourceFor, parseCatalogProductPrice } from '../collector/catalog-sources.mjs';

test('PRO LIGHTING maps white MAUI and Frigga to official public catalog sources',()=>{
  assert.match(publicCatalogSourceFor('prolighting','LD Systems MAUI 28 G3 W Weiß'),/\/de\/kategorie\/3528/);
  assert.match(publicCatalogSourceFor('prolighting','DAP Frigga Aktive Einzelsäule PA-System Weiß'),/frigga-aktive-einzelsaeule-pa-system-weiss\.html\?fscs=1/);
  assert.equal(publicCatalogSourceFor('prolighting','DAP Frigga schwarz'),null);
});

test('Kirstein maps MAUI and DAVE products to official public category pages',()=>{
  assert.equal(publicCatalogSourceFor('kirstein','2 × LD Systems MAUI 28 G3 Schwarz'),'https://www.kirstein.de/Saeulensysteme/');
  assert.equal(publicCatalogSourceFor('kirstein','LD Systems Dave 15 G4X Set'),'https://www.kirstein.de/PA-Komplettanlagen/');
  assert.equal(publicCatalogSourceFor('kirstein','Wharfedale Pro WLA-210XP'),null);
});

test('catalog parser extracts Kirstein DAVE price from official category HTML',()=>{
  const html='<div>LD Systems Dave 15 G4X Set</div><div>Aktive 2.1 PA</div><div>1.371,00 €</div><div>Versandkostenfrei inkl. MwSt.</div><div>Sofort lieferbar</div>';
  const out=parseCatalogProductPrice(html,'LD Systems Dave 15 G4X Set');
  assert.equal(out.price,1371);
  assert.equal(out.available,true);
});

test('catalog parser keeps Kirstein model matching strict across nearby DAVE variants',()=>{
  const html='<div>LD Systems Dave 15 G4X Set</div><div>1.371,00 €</div><div>Sofort lieferbar</div><div>LD Systems Dave 18 G4X Set</div><div>1.722,00 €</div><div>Sofort lieferbar</div>';
  assert.equal(parseCatalogProductPrice(html,'LD Systems Dave 15 G4X Set').price,1371);
  assert.equal(parseCatalogProductPrice(html,'LD Systems Dave 18 G4X Set').price,1722);
});

test('catalog parser does not cross-match nearby MAUI model numbers',()=>{
  const html='<div>LD Systems MAUI 11 G3 Schwarz</div><div>929,00 €</div><div>Sofort lieferbar</div><div>LD Systems MAUI 28 G3 Schwarz</div><div>1.309,00 €</div><div>Sofort lieferbar</div>';
  assert.equal(parseCatalogProductPrice(html,'LD Systems MAUI 11 G3 Schwarz').price,929);
  assert.equal(parseCatalogProductPrice(html,'LD Systems MAUI 28 G3 Schwarz').price,1309);
});

test('catalog parser extracts white MAUI sale price and ignores UVP',()=>{
  const html='<div>LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß</div><div>UVP: 1.559,90 €</div><div>1.329,00 €</div><div>Ab ZentralLager lieferbar</div>';
  const out=parseCatalogProductPrice(html,'LD Systems MAUI 28 G3 W Kompaktes Cardioid Saeulen PA System Weiss');
  assert.equal(out.price,1329);
  assert.equal(out.available,true);
});

test('catalog parser extracts related Frigga white price',()=>{
  const html='<div>Passendes Zubehör</div><div>DAP Frigga - Aktive Einzelsäule PA-System - Schwarz</div><div>1.049,00 €</div><div>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</div><div>1.080,00 €</div><div>Ab ZentralLager lieferbar</div>';
  const out=parseCatalogProductPrice(html,'dap frigga aktive einzelsaeule pa system weiss');
  assert.equal(out.price,1080);
  assert.equal(out.available,true);
});


test('catalog parser matches product name split across multiple HTML blocks',()=>{
  const html='<div>LD Systems MAUI 28 G3 W</div><div>Kompaktes Cardioid Säulen PA System</div><div>Weiß</div><div>UVP: 1.559,90 €</div><div>1.329,00 €</div><div>Ab ZentralLager lieferbar</div>';
  const out=parseCatalogProductPrice(html,'2 × LD Systems MAUI 28 G3 W, Kompaktes Cardioid Säulen PA System, Weiß');
  assert.equal(out.price,1329);
});

test('catalog parser finds Frigga price when name and price share a compact product block',()=>{
  const html='<section><span>DAP Frigga</span><span>Aktive Einzelsäule PA-System</span><span>Weiß</span><span>1.080,00 €</span><span>lieferbar</span></section>';
  const out=parseCatalogProductPrice(html,'dap frigga aktive einzelsaeule pa system weiss');
  assert.equal(out.price,1080);
});


test('catalog parser never takes the previous color variant price',()=>{
  const html='<div>DAP Frigga - Aktive Einzelsäule PA-System - Schwarz</div><div>1.049,00 €</div><div>DAP Frigga - Aktive Einzelsäule PA-System - Weiß</div><div>1.080,00 €</div>';
  const out=parseCatalogProductPrice(html,'DAP Frigga Aktive Einzelsäule PA-System Weiß');
  assert.equal(out.price,1080);
});
