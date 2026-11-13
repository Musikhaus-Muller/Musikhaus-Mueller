import { evaluateBrowserOffer, evaluateBrowserTarget } from './browser-price-collector.mjs';

export const evaluateThomannBrowserTarget = (target, options = {}) => evaluateBrowserTarget(target, { ...options, shop: 'Thomann' });
export const evaluateThomannBrowserOffer = (target, options = {}) => evaluateBrowserOffer(target, { ...options, shop: 'Thomann' });
