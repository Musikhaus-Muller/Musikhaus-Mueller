// Music Store's public catalog/search pages can contain several products.  This
// parser deliberately treats the Art.-Nr. as the sole lookup key: no name-only
// or nearest-price fallback is permitted.
const decode = value => String(value || '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&euro;|&#8364;|&#x20ac;/gi, '€')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(?:p|div|li|h[1-6]|article|section)>/gi, '\n')
  .replace(/<[^>]*>/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n\s+/g, '\n')
  .trim();

const normal = value => String(value || '')
  .toLowerCase().replace(/ß/g, 'ss').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const priceNumber = value => Number(String(value)
  .replace(/\s*(?:€|EUR)\s*$/i, '').replace(/\./g, '').replace(',', '.'));

export function articleNumberFromMusicStoreUrl(url) {
  return String(url || '').match(/\/art-([A-Z0-9-]+)/i)?.[1]?.toUpperCase() || null;
}

function exactIdentity(expected, actual) {
  const wanted = normal(expected);
  const found = normal(actual);
  if (!wanted || !found) return false;

  // Variant tokens are deliberately symmetric: a PRO/BT/Gx/colour variant must
  // neither disappear nor be introduced by the catalog block.
  const variants = ['pro', 'bt', 'mix', 'black', 'schwarz', 'white', 'weiss', 'g2', 'g3', 'g4x'];
  for (const variant of variants) {
    if ((wanted.split(' ').includes(variant)) !== (found.split(' ').includes(variant))) return false;
  }

  const required = wanted.split(' ').filter(token =>
    token.length > 1 && !['ld', 'systems', 'system', 'pa', 'aktiv', 'active'].includes(token)
  );
  const words = new Set(found.split(' '));
  return required.every(token => words.has(token));
}

function blocksFor(text) {
  const marks = [...text.matchAll(/(?:Art\.-?Nr\.|Artikel)\s*:?\s*([A-Z]{2,}[A-Z0-9]*-[A-Z0-9-]+)/gi)];
  return marks.map((mark, index) => ({
    articleNumber: mark[1].toUpperCase(),
    // A listing normally puts the title immediately before Art.-Nr.  Start at
    // the previous marker's end (or page start) so that title is retained,
    // while the next SKU remains an absolute boundary.
    text: text.slice(index ? marks[index - 1].index + marks[index - 1][0].length : 0, marks[index + 1]?.index ?? text.length),
    priceText: text.slice(mark.index + mark[0].length, marks[index + 1]?.index ?? text.length)
  }));
}

function productNameFromBlock(block) {
  const lines = block.split(/\n+/).map(line => line.trim()).filter(Boolean);
  // On official catalog pages the product name is immediately before or after
  // the Art.-Nr. marker. Joining this block never crosses into a neighbouring SKU.
  const skuIndex = lines.findIndex(line => /(?:Art\.-?Nr\.|Artikel)\s*:/i.test(line));
  const inline = lines[skuIndex]?.replace(/.*?(?:Art\.-?Nr\.|Artikel)\s*:\s*[A-Z]{2,}[A-Z0-9]*-[A-Z0-9-]+\s*/i, '');
  const candidates = [inline, lines[skuIndex - 1], lines[skuIndex + 1], lines[skuIndex + 2]]
    .filter(Boolean).filter(line => !/(€|EUR|lieferbar|verf[uü]gbar|Art\.-?Nr\.|Artikel)/i.test(line));
  return candidates[0] || null;
}

export function parseMusicStoreArticleCatalog(html, { articleNumber, expectedName }) {
  const requested = String(articleNumber || '').toUpperCase();
  if (!/^[A-Z]{2,}[A-Z0-9]*-[A-Z0-9-]+$/.test(requested)) throw new Error('Music Store Art.-Nr. is required');
  const text = decode(html);
  const matching = blocksFor(text).filter(block => block.articleNumber === requested);
  if (matching.length !== 1) throw new Error(matching.length ? 'Ambiguous Music Store Art.-Nr.' : 'Music Store Art.-Nr. not found');

  const block = matching[0].text;
  const name = productNameFromBlock(block);
  if (!exactIdentity(expectedName, name)) throw new Error('Music Store catalog identity mismatch');

  const priceMatches = [...matching[0].priceText.matchAll(/\b\d{1,3}(?:\.\d{3})*,\d{2}\s*(?:€|EUR)(?![A-Za-z0-9_])/gi)]
    .filter(match => !/uvp|retail price|statt/i.test(matching[0].priceText.slice(Math.max(0, match.index - 30), match.index)));
  if (priceMatches.length !== 1) throw new Error(priceMatches.length ? 'Ambiguous Music Store catalog price' : 'Music Store catalog price not found');
  const price = priceNumber(priceMatches[0][0]);
  if (!Number.isFinite(price) || price <= 0) throw new Error('Invalid Music Store catalog price');

  return {
    articleNumber: requested,
    name,
    price,
    available: /nicht\s+lieferbar|nicht\s+verf[uü]gbar/i.test(block) ? false
      : /lieferbar|verf[uü]gbar/i.test(block) ? true : undefined,
    sourceMethod: 'musicstore_public_catalog_article_number'
  };
}
