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

const centsFor = value => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const decimal = amount.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
  const match = decimal.match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) return null;
  const whole = Number(match[1]);
  const fraction = (match[2] || '').padEnd(3, '0');
  let cents = whole * 100 + Number(fraction.slice(0, 2));
  if (fraction[2] >= '5') cents++;
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
};

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

  let totalCents = 0;
  let anyUnavailable = false;
  let allAvailabilityKnown = true;
  const evidenceParts = [];

  for (const { component, result } of items) {
    const quantity = Number(component.quantity || 1);
    const unitPriceCents = centsFor(result.price);
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || unitPriceCents === null) {
      return {
        method: 'component_calc',
        status: 'parse_error',
        error: `Invalid component quantity or EUR price: ${component.label || expectedNameFromUrl(component.product_url || 'https://invalid.local/component')}`
      };
    }
    const lineTotalCents = quantity * unitPriceCents;
    if (!Number.isSafeInteger(lineTotalCents) || !Number.isSafeInteger(totalCents + lineTotalCents)) {
      return {
        method: 'component_calc',
        status: 'parse_error',
        error: 'Component total exceeds safe EUR precision'
      };
    }
    totalCents += lineTotalCents;
    if (result.available === false) anyUnavailable = true;
    if (result.available === undefined || result.available === null) allAvailabilityKnown = false;
    evidenceParts.push(`${quantity} × ${(unitPriceCents / 100).toFixed(2)} EUR`);
  }

  const total = totalCents / 100;
  return {
    method: 'component_calc',
    status: 'success',
    price: total,
    available: anyUnavailable ? false : (allAvailabilityKnown ? true : undefined),
    evidence: `Component calculation: ${evidenceParts.join(' + ')} = ${total.toFixed(2)} EUR`
  };
}
