import { parseMusicStoreArticleCatalog } from '../collector/musicstore-article-catalog.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(value => {
  const [key, ...rest] = value.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));

if (!args.url || !args.article || !args.expected) {
  throw new Error('Usage: --url=<official public catalog URL> --article=<Art.-Nr.> --expected=<exact product name>');
}

const response = await fetch(args.url, {
  redirect: 'follow',
  signal: AbortSignal.timeout(15000),
  headers: {
    Accept: 'text/html,application/xhtml+xml',
    'Accept-Language': 'de-DE,de;q=0.9',
    'User-Agent': 'PA-Bundle-Comparator/2.1 proposal-only diagnostic'
  }
});
if (!response.ok) throw new Error(`Official public catalog returned HTTP ${response.status}`);

const result = parseMusicStoreArticleCatalog(await response.text(), {
  articleNumber: args.article,
  expectedName: args.expected
});

// This command deliberately emits only a proposal: it has no Supabase imports,
// credentials, write methods, or collector integration.
console.log(JSON.stringify({ ...result, sourceUrl: args.url, mode: 'proposal_only' }, null, 2));
