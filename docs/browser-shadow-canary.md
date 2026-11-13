# Browser price shadow canary

This is a local/self-hosted, read-only canary. It is deliberately separate from `collector/run.mjs`: it has no Supabase client, no writer, no migration, no schedule and no production integration.

Run from the repository root after installing the declared collector dependency and Chromium:

```sh
npm --prefix collector install
npx --prefix collector playwright install chromium
node scripts/run-browser-shadow.mjs --shop=thomann --canary --headed
node scripts/run-browser-shadow.mjs --shop=musicstore --canary --headed
node scripts/run-browser-shadow.mjs --shop=hotsound --canary --headed
node scripts/build-browser-shadow-summary.mjs
```

`--headed` is the initial diagnostic mode. `--headless` is available only for comparison after a shop has shown equivalent behavior in headed mode. The command requires exactly one of these modes and refuses a non-canary run.

The canary opens only versioned existing offer URLs (or their existing explicit `componentDetails`), sequentially, caches a URL once, waits for normal rendering and stops issuing new navigation after repeated HTTP 429 responses. It does not use proxies, stealth, fingerprint changes, CAPTCHA solving, challenge tokens, retries or product discovery.

Reports are written to `reports/{thomann,musicstore,hotsound}-browser-shadow.json` and the combined `reports/browser-shadow-summary.json`. A 200 page with a challenge is reported as `blocked`. A price is emitted only after strict existing identity validation and an unambiguous EUR commercial-price extraction; component carts are summed in integer cents only when every required component is refreshable.
