import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogDiagnostic } from '../collector/catalog-sources.mjs';

test('catalog diagnostic reports expected tokens, nearby hits and visible prices',()=>{
  const html='<div>LD Systems MAUI 28 G3 W</div><div>Weiß</div><div>1.329,00 €</div>';
  const out=catalogDiagnostic(html,'LD Systems MAUI 28 G3 W Weiß');
  assert.ok(out.tokens.includes('maui'));
  assert.ok(out.tokens.includes('weiss'));
  assert.equal(out.prices[0],'1.329,00 €');
  assert.ok(out.hits.length>0);
  assert.ok(out.textLength>0);
});
