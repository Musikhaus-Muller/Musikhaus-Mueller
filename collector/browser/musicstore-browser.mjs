import { evaluateBrowserOffer, evaluateBrowserTarget } from './browser-price-collector.mjs';
import { articleNumberFromMusicStoreUrl } from '../musicstore-article-catalog.mjs';

export const evaluateMusicStoreBrowserTarget = (target, options = {}) => evaluateBrowserTarget({ ...target, expectedSku: target.expectedSku || articleNumberFromMusicStoreUrl(target.url) }, { ...options, shop: 'Music Store' });
export const evaluateMusicStoreBrowserOffer = (target, options = {}) => evaluateBrowserOffer(target, { ...options, shop: 'Music Store' });
