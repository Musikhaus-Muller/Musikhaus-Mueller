const target = process.env.DESKTOP_BROWSER_TARGET;
if (!target) throw new Error('DESKTOP_BROWSER_TARGET is required');
export default {
  appId: 'de.musikhausmueller.priceupdater', productName: 'Musikhaus-Mueller-Price-Updater', asar: true,
  asarUnpack: ['collector/**', 'scripts/**', 'web/seed.json'],
  files: ['desktop/**', '!desktop/playwright-browsers/**', 'collector/**', 'scripts/**', 'web/seed.json', 'package.json'],
  extraResources: [{ from: `desktop/playwright-browsers/${target}`, to: 'playwright-browsers', filter: ['**/*'] }],
  win: { target: 'nsis', artifactName: 'Musikhaus-Mueller-Price-Updater-Setup.${ext}' },
  mac: { target: 'dmg', artifactName: 'Musikhaus-Mueller-Price-Updater.${ext}' }
};
