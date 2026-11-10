export const SHOP_STRATEGIES = {
  mueller: {
    mode: 'http',
    browserFallback: false,
    publicSource: null
  },
  prolighting: {
    mode: 'http-with-public-catalog',
    browserFallback: false,
    publicSource: {
      type: 'catalog-map'
    }
  },
  thomann: {
    mode: 'http-with-public-source',
    browserFallback: false,
    publicSource: {
      type: 'sitemap',
      url: 'https://www.thomann.de/sitemap.xml'
    },
    diagnosticSources: ['https://www.thomann.de/sitemap.xml']
  },
  kirstein: {
    mode: 'http-preserve-on-block',
    browserFallback: false,
    publicSource: null,
    diagnosticSources: ['https://www.kirstein.de/sitemap.xml']
  },
  hotsound: {
    mode: 'http-preserve-on-block',
    browserFallback: false,
    publicSource: null,
    diagnosticSources: []
  },
  musicstore: {
    mode: 'http-preserve-on-block',
    browserFallback: false,
    publicSource: null,
    diagnosticSources: ['https://www.musicstore.de/de_DE/EUR/brands/ld-systems/1']
  }
};

export function strategyFor(shopSlug) {
  return SHOP_STRATEGIES[shopSlug] || {
    mode: 'hybrid',
    browserFallback: true,
    publicSource: null
  };
}
