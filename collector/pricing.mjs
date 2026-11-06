export function multiplierFor(offer) {
  const match = String(offer.calculation || '').match(/^\s*(\d+)\s*[×x]/);
  return match ? Number(match[1]) : 1;
}

export function applyOfferMultiplier(price, multiplier) {
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(multiplier) || multiplier <= 0) {
    throw new Error('Invalid price or offer multiplier');
  }
  const unitCents = Math.round(amount * 100);
  const totalCents = unitCents * multiplier;
  if (!Number.isSafeInteger(totalCents)) throw new Error('Offer total exceeds safe EUR precision');
  return totalCents / 100;
}

export function classifyError(error) {
  const message = String(error?.message || error);
  if (/captcha|cf-chl|just a moment|zugriffsschutz/i.test(message)) return 'captcha';
  if (/HTTP (403|429)/i.test(message)) return 'blocked';
  if (/HTTP (404|410)/i.test(message)) return 'not_found';
  if (/timeout|zeitüberschreitung/i.test(message)) return 'network_error';
  if (/eindeutiger EUR|price|preis|bundle contents|bundle composition|set composition|components; expected|black MAUI|unclassified component|unrecognized quantity|invalid quantity|official page does not expose/i.test(message)) return 'parse_error';
  return 'network_error';
}

export function classifyHttpStatus(status) {
  return classifyError(new Error(`HTTP ${Number(status)}`));
}
