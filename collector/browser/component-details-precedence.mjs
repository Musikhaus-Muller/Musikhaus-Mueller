import { VERSIONED_COMPONENT_DETAILS } from './versioned-component-details.mjs';

export function componentDetailsForBrowserShadow({ shop, reference, offer, articleNumberFromUrl }) {
  const details = VERSIONED_COMPONENT_DETAILS[shop]?.[reference] || offer.componentDetails || [];
  return details.map(component => ({
    ...component,
    articleNumber: shop === 'musicstore' ? articleNumberFromUrl(component.url) : null
  }));
}
