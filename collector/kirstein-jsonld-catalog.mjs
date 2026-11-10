const normalize = value => String(value || '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

function flatten(value, out = []) {
  if (Array.isArray(value)) value.forEach(item => flatten(item, out));
  else if (value && typeof value === 'object') {
    out.push(value);
    if (value['@graph']) flatten(value['@graph'], out);
  }
  return out;
}

function exactName(expected, actual) {
  const wanted = normalize(expected).split(' ').filter(Boolean);
  const got = new Set(normalize(actual).split(' ').filter(Boolean));
  const variants = ['pro', 'bt', 'mix', 'g2', 'g3', 'g4x', 'schwarz', 'black', 'weiss', 'white'];
  for (const token of variants) {
    if (wanted.includes(token) !== got.has(token)) return false;
  }
  return wanted.filter(token => token.length > 1 && !['ld', 'systems', 'system', 'pa'].includes(token)).every(token => got.has(token));
}

export function parseKirsteinJsonLd(html, { sku, expectedName }) {
  if (!sku || !expectedName) throw new Error('Kirstein exact SKU and expected product name are required');
  const structured = [...String(html || '').matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap(match => { try { return flatten(JSON.parse(match[1])); } catch { return []; } });
  const products = structured.filter(item => {
    const type = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
    return type.includes('Product') && String(item.sku || '') === String(sku);
  });
  if (products.length !== 1) throw new Error(products.length ? 'Ambiguous Kirstein SKU' : 'Kirstein SKU not found');
  const product = products[0];
  if (!exactName(expectedName, product.name)) throw new Error('Kirstein JSON-LD identity mismatch');
  const offers = flatten(product.offers).filter(offer => String(offer.priceCurrency || 'EUR').toUpperCase() === 'EUR');
  const prices = [...new Set(offers.map(offer => Number(offer.price)).filter(price => Number.isFinite(price) && price > 0))];
  if (prices.length !== 1) throw new Error(prices.length ? 'Ambiguous Kirstein JSON-LD price' : 'Kirstein JSON-LD price not found');
  return { sku: String(sku), name: product.name, price: prices[0], sourceMethod: 'kirstein_jsonld_exact_sku' };
}
