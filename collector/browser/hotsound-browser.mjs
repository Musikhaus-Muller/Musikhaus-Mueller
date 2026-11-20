import { evaluateBrowserOffer, evaluateBrowserTarget } from './browser-price-collector.mjs';

export const evaluateHotSoundBrowserTarget = (target, options = {}) => evaluateBrowserTarget(target, { ...options, shop: 'Hot Sound' });
export const evaluateHotSoundBrowserOffer = (target, options = {}) => evaluateBrowserOffer(target, { ...options, shop: 'Hot Sound' });
