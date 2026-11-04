export function expectedNameFromUrl(value) {
  const url = new URL(value);
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  let segment = parts.at(-1) || '';
  if (/^(art-|[a-z]{3}\d{4,})/i.test(segment) && parts.length > 1) segment = parts.at(-2);
  return segment
    .replace(/\.(?:html?|php)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\d{4,}\b$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;

export function aggregateComponentResults(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { method: 'component_calc', status: 'skipped', error: 'No bundle components configured' };
  }

  const failed = items.find(x => x.result?.status !== 'success' || !Number.isFinite(Number(x.result?.price)));
  if (failed) {
    const label = failed.component?.label || expectedNameFromUrl(failed.component?.product_url || 'https://invalid.local/component');
    return {
      method: 'component_calc',
      status: failed.result?.status || 'parse_error',
      httpStatus: failed.result?.httpStatus ?? null,
      error: `Component failed: ${label} · ${failed.result?.error || failed.result?.status || 'unknown error'}`
    };
  }

  let total = 0;
  let anyUnavailable = false;
  let allAvailabilityKnown = true;
  const evidenceParts = [];

  for (const { component, result } of items) {
    const quantity = Number(component.quantity || 1);
    const unitPrice = Number(result.price);
    const lineTotal = roundMoney(quantity * unitPrice);
    total += lineTotal;
    if (result.available === false) anyUnavailable = true;
    if (result.available === undefined || result.available === null) allAvailabilityKnown = false;
    evidenceParts.push(`${quantity} × ${unitPrice.toFixed(2)} EUR`);
  }

  return {
    method: 'component_calc',
    status: 'success',
    price: roundMoney(total),
    available: anyUnavailable ? false : (allAvailabilityKnown ? true : undefined),
    evidence: `Component calculation: ${evidenceParts.join(' + ')} = ${roundMoney(total).toFixed(2)} EUR`
  };
}
