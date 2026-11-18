const ALLOWED_SHOPS = new Set(['hotsound', 'thomann']);

function plannedRows(writePlan) {
  if (writePlan?.writes !== false || writePlan?.mode !== 'plan') throw new Error('Expected a read-only browser production write plan');
  return writePlan.shops.flatMap(shop => shop.rows)
    .filter(row => row.decision === 'planned');
}

function exact(rows, predicate) {
  return rows.filter(predicate);
}

function baseRow(row) {
  const match = row.proposed_observation?.offer_match || {};
  return {
    reference: row.reference,
    shop: row.shop,
    configuration_legacy_id: match.configuration_legacy_id || null,
    shop_slug: match.shop_slug || null,
    configuration_id: null,
    shop_id: null,
    offer_id: null,
    status: null,
    validation: { configuration: null, shop: null, offer: null, active: null, url: null },
    reason: null
  };
}

export function resolveBrowserProductionWritePlan(writePlan, { configurations = [], shops = [], offers = [] } = {}) {
  const rows = plannedRows(writePlan).map(planRow => {
    const row = baseRow(planRow);
    if (!row.configuration_legacy_id) return { ...row, status: 'mismatch', reason: 'configuration_legacy_id_missing' };
    if (!ALLOWED_SHOPS.has(row.shop_slug)) return { ...row, status: 'mismatch', reason: 'shop_slug_not_allowed' };

    const configurationsMatched = exact(configurations, config => config.legacy_id === row.configuration_legacy_id);
    if (configurationsMatched.length === 0) return { ...row, status: 'missing_configuration', reason: 'configuration_not_found' };
    if (configurationsMatched.length > 1) return { ...row, status: 'ambiguous_configuration', reason: 'configuration_not_unique' };
    const configuration = configurationsMatched[0];
    row.configuration_id = configuration.id;
    row.validation.configuration = 'unique';
    if (configuration.active !== true) return { ...row, status: 'mismatch', reason: 'configuration_inactive' };

    const shopsMatched = exact(shops, shop => shop.slug === row.shop_slug);
    if (shopsMatched.length === 0) return { ...row, status: 'missing_shop', reason: 'shop_not_found' };
    if (shopsMatched.length > 1) return { ...row, status: 'ambiguous_shop', reason: 'shop_not_unique' };
    const shop = shopsMatched[0];
    row.shop_id = shop.id;
    row.validation.shop = 'unique';
    if (shop.enabled !== true) return { ...row, status: 'mismatch', reason: 'shop_disabled' };

    const offersMatched = exact(offers, offer => offer.configuration_id === configuration.id && offer.shop_id === shop.id);
    if (offersMatched.length === 0) return { ...row, status: 'missing_offer', reason: 'offer_not_found' };
    if (offersMatched.length > 1) return { ...row, status: 'ambiguous_offer', reason: 'offer_not_unique' };
    const offer = offersMatched[0];
    row.offer_id = offer.id;
    row.validation.offer = 'unique';
    if (offer.active !== true) return { ...row, status: 'mismatch', reason: 'offer_inactive' };
    row.validation.active = 'active';

    const plannedUrl = planRow.proposed_observation?.price_observation?.metadata?.source_url || null;
    const offerUrls = [offer.product_url, offer.source_url].filter(Boolean);
    if (offerUrls.length) {
      if (!plannedUrl || !offerUrls.includes(plannedUrl)) {
        return { ...row, status: 'mismatch', reason: 'offer_url_mismatch', validation: { ...row.validation, url: 'mismatch' } };
      }
      row.validation.url = 'matched';
    } else {
      row.validation.url = 'not_available';
    }
    return { ...row, status: 'resolved', reason: null };
  });

  const count = status => rows.filter(row => row.status === status).length;
  return {
    writes: false,
    source_write_plan: 'reports/browser-production-write-plan.json',
    totals: {
      planned: rows.length,
      resolved: count('resolved'),
      unresolved: count('missing_configuration') + count('missing_shop') + count('missing_offer'),
      ambiguous: count('ambiguous_configuration') + count('ambiguous_shop') + count('ambiguous_offer'),
      mismatches: count('mismatch')
    },
    rows
  };
}
