import { test } from 'node:test';
import assert from 'node:assert/strict';
import { strategyFor } from '../collector/strategies.mjs';

test('collector strategies avoid browser retries for known blocked shops', () => {
  assert.equal(strategyFor('mueller').browserFallback, false);
  assert.equal(strategyFor('prolighting').browserFallback, false);
  assert.equal(strategyFor('thomann').browserFallback, false);
  assert.equal(strategyFor('kirstein').browserFallback, false);
  assert.equal(strategyFor('hotsound').browserFallback, false);
  assert.equal(strategyFor('musicstore').browserFallback, true);
});

test('Thomann keeps an explicit public discovery source', () => {
  const thomann = strategyFor('thomann');
  assert.equal(thomann.publicSource.type, 'sitemap');
  assert.equal(thomann.publicSource.url, 'https://www.thomann.de/sitemap.xml');
});
