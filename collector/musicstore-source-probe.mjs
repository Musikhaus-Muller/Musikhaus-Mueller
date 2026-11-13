import { probeSources } from './source-probe.mjs';
export const probeMusicStoreSources = options => probeSources({ shop: 'musicstore', ...options });
