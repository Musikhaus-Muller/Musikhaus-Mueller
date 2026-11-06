export function requestHeaders({ compatible = false } = {}) {
  if (compatible) {
    return {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.7',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    };
  }
  return {
    Accept: 'text/html,application/xhtml+xml',
    'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6',
    'User-Agent': 'Mozilla/5.0 (compatible; PA-Bundle-Preisvergleich/1.0; +price-monitor)'
  };
}

export function shouldCompatibleRetry(strategy, result) {
  if (!strategy?.compatibleHttpRetry) return false;
  return ['blocked', 'captcha'].includes(result?.status);
}
