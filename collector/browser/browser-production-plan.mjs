const ALLOWED_SHOPS = Object.freeze({
  'Hot Sound': 'hotsound',
  Thomann: 'thomann'
});

function positive(value) {
  return Number.isFinite(value) && value > 0;
}

function invalid(...errors) {
  return { valid: false, errors: errors.filter(Boolean) };
}

function validateComponent(component) {
  const errors = [];
  if (!component?.name) errors.push('component_name_missing');
  if (!positive(component?.quantity)) errors.push('component_quantity_invalid');
  if (!component?.url) errors.push('component_url_missing');
  if (!component?.final_url) errors.push('component_final_url_missing');
  if (component?.currency !== 'EUR') errors.push('component_currency_invalid');
  if (component?.identity_valid !== true) errors.push('component_identity_invalid');
  if (component?.verified !== true) errors.push('component_not_verified');
  if (!positive(component?.observed_price)) errors.push('component_price_invalid');
  if (!component?.price_source) errors.push('component_price_source_missing');
  if (component?.evidence_valid !== true) errors.push('component_evidence_invalid');
  return errors;
}

export function validateBrowserPreWriterRow(row) {
  const errors = [];
  if (!row?.reference) errors.push('reference_missing');
  if (!ALLOWED_SHOPS[row?.shop]) errors.push('shop_not_allowed');
  if (row?.proposed_decision !== 'eligible') errors.push('decision_not_eligible');
  if (row?.shadow_decision !== 'refreshable') errors.push('shadow_not_refreshable');
  if (!positive(row?.observed_price)) errors.push('price_invalid');
  if (row?.currency !== 'EUR') errors.push('currency_invalid');
  if (row?.verified !== true) errors.push('not_verified');
  if (row?.identity_valid !== true) errors.push('identity_invalid');
  if (row?.challenge_detected === true) errors.push('challenge_detected');
  if (row?.ambiguity_detected === true) errors.push('evidence_ambiguous');
  if (!row?.url || !row?.final_url) errors.push('source_url_missing');
  if (!row?.price_source) errors.push('price_source_missing');

  const componentCart = row?.pricing_kind === 'component_cart';
  if (componentCart) {
    if (!Array.isArray(row.components) || row.components.length === 0) errors.push('component_cart_incomplete');
    else row.components.forEach(component => errors.push(...validateComponent(component)));
  } else if (row?.pricing_kind !== 'direct_price') {
    errors.push('pricing_kind_invalid');
  }
  return errors.length ? invalid(...errors) : { valid: true, errors: [] };
}

function componentPayload(component, position, observedAt, shopSlug) {
  return {
    offer_component_match: {
      position,
      expected_product_name: component.name,
      product_url: component.url
    },
    price_observation: {
      price: component.observed_price,
      currency: 'EUR',
      availability: null,
      status: 'success',
      source_method: 'browser',
      http_status: component.http_status,
      verified: true,
      evidence: 'Browser-shadow exact component identity and unique commercial EUR price.',
      observed_at: observedAt,
      metadata: {
        shop: shopSlug,
        collector_method: 'browser_shadow_self_hosted',
        source_url: component.url,
        final_url: component.final_url,
        product_identity: component.identity,
        sku: component.sku,
        quantity: component.quantity,
        price_source: component.price_source,
        price_candidates: component.price_candidates
      }
    }
  };
}

function componentEvidence(component) {
  return {
    name: component.name,
    quantity: component.quantity,
    source_url: component.url,
    final_url: component.final_url,
    product_identity: component.identity,
    sku: component.sku,
    observed_price: component.observed_price,
    currency: component.currency,
    price_source: component.price_source,
    price_candidates: component.price_candidates || [],
    identity_valid: component.identity_valid,
    verified: component.verified,
    challenge_detected: component.challenge_detected === true,
    evidence_valid: component.evidence_valid,
    http_status: component.http_status
  };
}

export function buildBrowserObservationPayload(row, { observedAt }) {
  const validation = validateBrowserPreWriterRow(row);
  if (!validation.valid) return { validation, payload: null };
  const shopSlug = ALLOWED_SHOPS[row.shop];
  const componentCart = row.pricing_kind === 'component_cart';
  const payload = {
    offer_match: {
      shop_slug: shopSlug,
      configuration_legacy_id: row.reference
    },
    price_observation: {
      price: row.observed_price,
      currency: 'EUR',
      availability: null,
      status: 'success',
      source_method: componentCart ? 'component_calc' : 'browser',
      http_status: null,
      verified: true,
      raw_product_name: row.identity?.name || (componentCart ? 'Browser verified component cart' : null),
      evidence: componentCart
        ? 'Browser-shadow complete exact component cart; all component identities and prices verified.'
        : 'Browser-shadow exact product identity and unique commercial EUR price verified.',
      observed_at: observedAt,
      metadata: {
        reference: row.reference,
        shop: shopSlug,
        collector_method: 'browser_shadow_self_hosted',
        pricing_kind: row.pricing_kind,
        source_url: row.url,
        final_url: row.final_url,
        product_identity: row.identity,
        sku: row.sku,
        price_source: row.price_source,
        price_candidates: row.price_candidates || [],
        previous_price: row.previous_price,
        delta: row.delta,
        delta_pct: row.delta_pct,
        source_plan_decision: row.proposed_decision,
        identity_valid: row.identity_valid,
        manual_review_required: row.manual_review_required === true,
        challenge_detected: row.challenge_detected === true,
        ambiguity_detected: row.ambiguity_detected === true,
        component_evidence: componentCart ? row.components.map(componentEvidence) : []
      }
    },
    component_price_observations: componentCart
      ? row.components.map((component, index) => componentPayload(component, index + 1, observedAt, shopSlug))
      : []
  };
  return { validation, payload };
}

export function buildBrowserProductionWritePlan(sourcePlan, { generatedAt = new Date().toISOString(), sourcePlanPath = 'reports/browser-prewriter-plan.json' } = {}) {
  if (sourcePlan?.writes !== false || sourcePlan?.purpose !== 'pre_writer_browser_shadow_plan') {
    throw new Error('Expected a read-only browser pre-writer plan');
  }
  const shops = sourcePlan.shops.map(shop => {
    const rows = shop.rows.map(row => {
      if (row.proposed_decision !== 'eligible') {
        return {
          reference: row.reference,
          shop: row.shop,
          decision: 'skipped',
          proposed_observation: null,
          validation: { valid: false, errors: ['source_plan_not_eligible'] },
          reason: row.reasons.length ? row.reasons.join(', ') : 'source_plan_not_eligible'
        };
      }
      const { validation, payload } = buildBrowserObservationPayload(row, { observedAt: shop.artifact_observed_at });
      return {
        reference: row.reference,
        shop: row.shop,
        decision: validation.valid ? 'planned' : 'failed',
        proposed_observation: payload,
        validation,
        reason: validation.valid ? null : validation.errors.join(', ')
      };
    });
    const count = decision => rows.filter(row => row.decision === decision).length;
    return { shop: shop.shop, rows, totals: { planned: count('planned'), inserted: 0, skipped: count('skipped'), failed: count('failed') } };
  });
  const total = key => shops.reduce((sum, shop) => sum + shop.totals[key], 0);
  return {
    writes: false,
    mode: 'plan',
    generated_at: generatedAt,
    source_plan: sourcePlanPath,
    totals: { planned: total('planned'), inserted: 0, skipped: total('skipped'), failed: total('failed') },
    shops
  };
}
