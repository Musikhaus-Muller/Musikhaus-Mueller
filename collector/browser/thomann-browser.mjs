import { cents, evaluateBrowserOffer, evaluateBrowserTarget } from './browser-price-collector.mjs';

// Derived from the rendered product root, not a page-wide price search. Related
// products live under .fx-product-box and cannot enter this selector.
export function selectThomannProductRootPrice(rendered) {
  const root = rendered.thomannRoot;
  const candidates = (root?.prices || []).flatMap(raw => {
    const value = cents(raw.replace(/[^0-9,.-]/g, ''));
    return value ? [{ cents: value, source: 'thomann_product_root', raw }] : [];
  });
  const values = [...new Set(candidates.map(candidate => candidate.cents))];
  const diagnostics = root ? { selector: root.selector, container_text: root.text, ancestry: root.ancestry, rejected: ['related product roots', 'accessory roots', '30-Tage-Bestpreis', 'UVP', 'financing'] } : { selector: null, rejected: ['product root absent'] };
  if (values.length !== 1) return { cents: null, candidates, diagnostics, error: values.length ? 'Ambiguous main-product price inside product root' : 'Main product root price missing' };
  return { cents: values[0], candidates, source: 'thomann_product_root', diagnostics };
}

export const evaluateThomannBrowserTarget = (target, options = {}) => evaluateBrowserTarget(target, { ...options, shop: 'Thomann', priceExtractor: selectThomannProductRootPrice });
export const evaluateThomannBrowserOffer = (target, options = {}) => evaluateBrowserOffer(target, { ...options, shop: 'Thomann', priceExtractor: selectThomannProductRootPrice });
