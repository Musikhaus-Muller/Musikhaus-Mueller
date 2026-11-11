import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { KIRSTEIN_EXACT_SKU_BINDINGS } from '../collector/kirstein-exact-sku-bindings.mjs';
import { runKirsteinShadow } from '../collector/kirstein-shadow.mjs';

const jsonLd = (sku, name, price = 929) => `<script type="application/ld+json">${JSON.stringify({
  '@type': 'Product',
  sku,
  name,
  offers: { '@type': 'Offer', priceCurrency: 'EUR', price }
})}</script>`;

function response(status, body = '') {
  return {
    status,
    ok: status >= 200 && status < 300,
    async text() { return body; }
  };
}

test('Kirstein shadow processes only explicit bound references and never r4/r6', async () => {
  const bound = KIRSTEIN_EXACT_SKU_BINDINGS.filter(binding => binding.status === 'bound');
  assert.equal(bound.length, 9);
  assert.equal(bound.some(binding => binding.reference === 'r4'), false);
  assert.equal(bound.some(binding => binding.reference === 'r6'), false);

  const calls = [];
  const result = await runKirsteinShadow({
    executionEnvironment: 'self_hosted',
    observedAt: '2026-11-11T00:00:00.000Z',
    fetchImpl: async url => {
      calls.push(url);
      const binding = bound.find(item => item.url === url);
      return response(200, jsonLd(binding.sku, binding.expectedName, 1234));
    }
  });

  assert.equal(result.writes, false);
  assert.equal(result.execution_environment, 'self_hosted');
  assert.deepEqual(result.summary, {
    total_bound: 9,
    http_usable: 9,
    identity_valid: 9,
    price_valid: 9,
    refreshable: 9
  });
  assert.equal(calls.length, 9);
  assert.equal(result.results.every(item => item.decision === 'refreshable_shadow'), true);
});

test('Kirstein shadow rejects blocked, not found, SKU, identity and price failures', async () => {
  const bound = KIRSTEIN_EXACT_SKU_BINDINGS.filter(binding => binding.status === 'bound');
  let i = 0;
  const result = await runKirsteinShadow({
    observedAt: '2026-11-11T00:00:00.000Z',
    fetchImpl: async url => {
      const binding = bound.find(item => item.url === url);
      i += 1;
      if (i === 1) return response(403);
      if (i === 2) return response(404);
      if (i === 3) return response(200, jsonLd('wrong-sku', binding.expectedName, 100));
      if (i === 4) return response(200, jsonLd(binding.sku, binding.expectedName + ' BT', 100));
      if (i === 5) return response(200, jsonLd(binding.sku, binding.expectedName, 0));
      return response(200, jsonLd(binding.sku, binding.expectedName, 100));
    }
  });

  const decisions = result.results.map(item => item.decision);
  assert.deepEqual(decisions.slice(0, 5), [
    'blocked',
    'not_found',
    'sku_mismatch',
    'identity_mismatch',
    'invalid_price'
  ]);
});

test('Kirstein shadow source is read-only and contains no fallback or privileged integration', async () => {
  const source = await fs.readFile('collector/kirstein-shadow.mjs', 'utf8');
  assert.match(source, /writes:\s*false/);
  assert.doesNotMatch(source, /SUPABASE|SERVICE_ROLE|SECRET_KEY|createClient|insert\(|update\(|upsert\(/i);
  assert.doesNotMatch(source, /playwright|puppeteer|proxy|captcha|sitemap|search/i);
  assert.doesNotMatch(source, /process\.env/i);
});
