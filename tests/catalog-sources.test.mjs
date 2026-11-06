import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicCatalogSourceFor, parseCatalogProductPrice } from '../collector/catalog-sources.mjs';

test('PRO LIGHTING maps white MAUI and Frigga to official public catalog sources',()=>{
  assert.match(publicCatalogSourceFor('prolighting','LD Systems MAUI 28 G3 W Weiß'),/\/de\/kategorie\/3528/);
  assert.match(publicCatalogSourceFor('prolighting','DAP Frigga Aktive Einzelsäule PA-System Weiß'),/frigga-aktive-einzelsaeule-pa-system-weiss\.html\?fscs=1/);
  assert.equal(publicCatalogSourceFor('prolighting','DAP Frigga schwarz'),null);
});

test('Hot Sound maps LD Systems, DAP and Wharfedale to official brand catalog pages',()=>{
  assert.equal(publicCatalogSourceFor('hotsound','LD Systems MAUI 28 G3'),'https://www.hotsound-store.com/ld-systems/');
  assert.equal(publicCatalogSourceFor('hotsound','DAP Frigga Stereo schwarz'),'https://www.hotsound-store.com/dap/');
  assert.equal(publicCatalogSourceFor('hotsound','Wharfedale Pro WLA-210XP'),'https://www.hotsound-store.com/wharfedale-pro/');
  assert.equal(publicCatalogSourceFor('hotsound','RCF ART 932-A'),null);
});

test('catalog parser extracts Hot Sound brand-page product price with strict model matching',()=>{
  const html='<div>LD Systems MAUI 11 G3</div><div>919,00 €</div><div>Lieferbar</div><div>LD Systems MAUI 28 G3</div><div>1.289,00 €</div><div>Lieferbar</div>';
  assert.equal(parseCatalogProductPrice(html,'LD Systems MAUI 11 G3').price,919);
  assert.equal(parseCatalogProductPrice(html,'LD Systems MAUI 28 G3').price,1289);
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
