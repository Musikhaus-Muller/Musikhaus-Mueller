import { test } from 'node:test';
import assert from 'node:assert/strict';
import { strategyFor } from '../collector/strategies.mjs';

test('collector strategies avoid browser retries for known blocked shops', () => {
  assert.equal(strategyFor('mueller').browserFallback, false);
  assert.equal(strategyFor('thomann').browserFallback, false);
  assert.equal(strategyFor('kirstein').browserFallback, false);
  assert.equal(strategyFor('hotsound').browserFallback, false);
  assert.equal(strategyFor('musicstore').browserFallback, false);
});

test('Kirstein retries the same official page once with a static compatible profile before preserving', () => {
  const kirstein = strategyFor('kirstein');
  assert.equal(kirstein.mode, 'http-with-compatible-retry');
  assert.equal(kirstein.compatibleHttpRetry, true);
  assert.equal(kirstein.browserFallback, false);
  assert.equal(kirstein.publicSource, null);
});

test('PRO LIGHTING uses official public catalog fallback without browser retry', () => {
  const prolighting = strategyFor('prolighting');
  assert.equal(prolighting.mode, 'http-with-public-catalog');
  assert.equal(prolighting.browserFallback, false);
  assert.equal(prolighting.publicSource.type, 'catalog-map');
});

test('Thomann keeps an explicit public discovery source', () => {
  const thomann = strategyFor('thomann');
  assert.equal(thomann.publicSource.type, 'sitemap');
  assert.equal(thomann.publicSource.url, 'https://www.thomann.de/sitemap.xml');
});


test('Music Store preserves the last valid price after access blocks', () => {
  const musicstore = strategyFor('musicstore');
  assert.equal(musicstore.mode, 'http-preserve-on-block');
  assert.equal(musicstore.browserFallback, false);
});
