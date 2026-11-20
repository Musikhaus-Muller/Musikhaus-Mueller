const ANOMALY_THRESHOLD_PCT = 20;
const DISPLAY_SHOP = Object.freeze({ hotsound: 'Hot Sound', thomann: 'Thomann' });

function positive(value) {
  return Number.isFinite(value) && value > 0;
}

function uniquePositiveCandidates(candidates = []) {
  const values = [...new Set(candidates.map(candidate => candidate?.cents).filter(cents => Number.isInteger(cents) && cents > 0))];
  return values.length === 1;
}

function componentEvidence(component) {
  const evidenceValid = component.decision === 'refreshable'
    && component.identity_valid === true
    && positive(component.observed_price)
    && !component.challenge_detected
    && Boolean(component.final_url || component.url)
    && Boolean(component.price_source)
    && uniquePositiveCandidates(component.price_candidates);
  return {
    name: component.name,
    quantity: component.quantity,
    url: component.url,
    final_url: component.final_url || null,
    identity: component.product_identity || {},
    sku: component.sku || null,
    observed_price: component.observed_price ?? null,
    currency: 'EUR',
    price_source: component.price_source || null,
    price_candidates: component.price_candidates || [],
    decision: component.decision,
    identity_valid: component.identity_valid === true,
    challenge_detected: component.challenge_detected === true,
    http_status: component.http_status ?? null,
    verified: evidenceValid,
    evidence_valid: evidenceValid
  };
}

function planRow(row, { anomalyThresholdPct = ANOMALY_THRESHOLD_PCT } = {}) {
  const components = (row.components || []).map(componentEvidence);
  const componentCart = components.length > 0 || row.price_source === 'component_calc';
  const reasons = [];
  const directPriceEvidence = !componentCart && uniquePositiveCandidates(row.price_candidates);
  const cartEvidence = componentCart && components.length > 0 && components.every(component => component.evidence_valid);

  if (row.decision !== 'refreshable') reasons.push(`shadow_${row.decision || 'unknown'}`);
  if (row.identity_valid !== true) reasons.push('identity_not_verified');
  if (!positive(row.observed_price)) reasons.push('invalid_observed_price');
  if (row.challenge_detected === true) reasons.push('challenge_detected');
  if (!row.final_url && !row.url) reasons.push('missing_source_url');
  if (!row.price_source) reasons.push('missing_price_source');
  if (componentCart && !cartEvidence) reasons.push('component_evidence_incomplete_or_ambiguous');
  if (!componentCart && !directPriceEvidence) reasons.push('price_evidence_ambiguous_or_missing');

  const baseEligible = reasons.length === 0;
  const deltaPct = Number.isFinite(row.delta_pct) ? row.delta_pct : null;
  const anomaly = row.manual_review_required === true || (deltaPct !== null && Math.abs(deltaPct) > anomalyThresholdPct);
  if (anomaly) reasons.push('delta_exceeds_anomaly_threshold');

  const proposedDecision = !baseEligible ? 'preserve_only' : anomaly ? 'manual_review' : 'eligible';
  return {
    reference: row.reference,
    shop: row.shop,
    url: row.url,
    final_url: row.final_url || null,
    identity: row.product_identity || {},
    sku: row.sku || null,
    observed_price: row.observed_price ?? null,
    currency: 'EUR',
    previous_price: row.previous_price ?? null,
    delta: row.delta ?? null,
    delta_pct: deltaPct,
    price_source: row.price_source || null,
    pricing_kind: componentCart ? 'component_cart' : 'direct_price',
    components,
    shadow_decision: row.decision || null,
    identity_valid: row.identity_valid === true,
    verified: baseEligible,
    challenge_detected: row.challenge_detected === true,
    ambiguity_detected: componentCart ? !cartEvidence : !directPriceEvidence,
    manual_review_required: anomaly,
    proposed_decision: proposedDecision,
    reasons
  };
}

export function buildBrowserPreWriterPlan(reports, { anomalyThresholdPct = ANOMALY_THRESHOLD_PCT } = {}) {
  const shops = reports.map(report => {
    const rows = report.rows.map(row => planRow(row, { anomalyThresholdPct }));
    const count = decision => rows.filter(row => row.proposed_decision === decision).length;
    return {
      shop: DISPLAY_SHOP[report.shop] || report.shop,
      artifact_observed_at: report.observed_at,
      source_scope: report.scope,
      source_writes: report.writes === true,
      summary: {
        total: rows.length,
        eligible: count('eligible'),
        manual_review: count('manual_review'),
        preserve_only: count('preserve_only')
      },
      decision_lists: {
        eligible: rows.filter(row => row.proposed_decision === 'eligible').map(row => row.reference),
        manual_review: rows.filter(row => row.proposed_decision === 'manual_review').map(row => row.reference),
        preserve_only: rows.filter(row => row.proposed_decision === 'preserve_only').map(row => row.reference)
      },
      rows
    };
  });
  return {
    writes: false,
    purpose: 'pre_writer_browser_shadow_plan',
    anomaly_threshold_pct: anomalyThresholdPct,
    shops
  };
}
