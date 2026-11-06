import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicCatalogSourceFor, parseCatalogProductPrice, parseMusicStoreSkuPrice } from '../collector/catalog-sources.mjs';

test('PRO LIGHTING maps white MAUI and Frigga to official public catalog sources',()=>{
  assert.match(publicCatalogSourceFor('prolighting','LD Systems MAUI 28 G3 W Weiß'),/\/de\/kategorie\/3528/);
  assert.match(publicCatalogSourceFor('prolighting','DAP Frigga Aktive Einzelsäule PA-System Weiß'),/frigga-aktive-einzelsaeule-pa-system-weiss\.html\?fscs=1/);
  assert.equal(publicCatalogSourceFor('prolighting','DAP Frigga schwarz'),null);
});

test('Music Store maps only LD Systems SKU URLs to the official brand catalog',()=>{
  assert.equal(
    publicCatalogSourceFor('musicstore','LD Systems MAUI 28 G3 Schwarz','https://www.musicstore.de/de_DE/EUR/LD-Systems-MAUI-28-G3-Schwarz/art-PAH0023384-000'),
    'https://www.musicstore.de/de_DE/EUR/brands/ld-systems'
  );
  assert.equal(
    publicCatalogSourceFor('musicstore','Gravity SP 2332 B','https://www.musicstore.de/de_DE/EUR/Gravity-SP-2332-B/art-PAH0018485-000'),
    null
  );
});

test('Music Store SKU parser anchors price to exact article number and rejects neighbor products',()=>{
  const html='<div>Art.-Nr.: PAH0021618-000</div><div>LD-Systems ICOA 15 A</div><div>449,00 €</div><div>Art.-Nr.: PAH0024127-000</div><div>LD-Systems ICOA Pro 15 A</div><div>Sofort lieferbar</div><div>1.299,00 €</div><div>UVP*: 1.454,90 €</div>';
  const out=parseMusicStoreSkuPrice(html,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-15-A/art-PAH0024127-000','LD Systems ICOA Pro 15 A');
  assert.equal(out.price,1299);
  assert.equal(out.sku,'PAH0024127-000');
});

test('Music Store SKU parser never reads price before the exact SKU',()=>{
  const html='<div>LD-Systems ICOA 15 A</div><div>449,00 €</div><div>Art.-Nr.: PAH0024127-000</div><div>LD-Systems ICOA Pro 15 A</div><div>1.299,00 €</div>';
  const out=parseMusicStoreSkuPrice(html,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-15-A/art-PAH0024127-000','LD Systems ICOA Pro 15 A');
  assert.equal(out.price,1299);
});

test('Music Store SKU parser refuses a missing exact SKU even when similar products have prices',()=>{
  const html='<div>Art.-Nr.: PAH0021618-000</div><div>LD-Systems ICOA 15 A</div><div>449,00 €</div>';
  assert.throws(
    ()=>parseMusicStoreSkuPrice(html,'https://www.musicstore.de/de_DE/EUR/LD-Systems-ICOA-Pro-15-A/art-PAH0024127-000','LD Systems ICOA Pro 15 A'),
    /SKU not found/
  );
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
