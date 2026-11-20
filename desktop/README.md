# Musikhaus Müller – Price Updater

Electron MVP for Windows 10/11 x64, macOS Apple Silicon and macOS Intel (on an Intel build runner). The renderer has no Node access; it only calls the fixed preload IPC API. The main process holds the authenticated Supabase session, writes encrypted session material only through Electron `safeStorage`, and stores sanitized support logs under `app.getPath('userData')`.

## Public configuration

Development requires only public values:

```text
DESKTOP_SUPABASE_URL=https://…supabase.co
DESKTOP_SUPABASE_ANON_KEY=…
```

Never provide a service-role or secret key to Electron. Authorization is based on the authenticated user's `app_metadata.role`, currently restricted to `root` and `admin`. The existing schema has no application profile/role table; this is therefore an explicit deployment prerequisite for the Supabase Auth administrator.

## Secure pilot preflight

`supabase/functions/desktop-price-update` is a preflight-only pilot endpoint. It verifies the Bearer JWT and `app_metadata.role`, accepts only a closed Hot Sound/Thomann read-only plan, and resolves active configuration/shop/offer IDs through the authenticated RLS scope. It has no apply, audit, insert, update, delete, RPC route, or service-role dependency.

## Local pipeline

The main process runs only fixed local commands: the existing Hot Sound and Thomann full browser shadows, pre-writer plan and production plan. It delegates only preflight to the restricted Edge Function, then stops. Music Store is intentionally absent.

## Chromium and portable packaging

Before packaging, download Playwright Chromium on the target platform and architecture. It is placed under `desktop/playwright-browsers/<platform>-<arch>` and is never shared across platforms:

```bash
npm run desktop:install-browser
npm run desktop:smoke-browser
npm run desktop:build:mac # macOS native runner
npm run desktop:build:win # Windows x64 native runner
```

The build refuses to run without native Chromium. Electron Builder emits `Musikhaus-Mueller-Price-Updater-Setup.exe` on Windows and `Musikhaus-Mueller-Price-Updater.dmg` on macOS. The runtime resolves only `process.resourcesPath/playwright-browsers` once packaged; development uses the platform-qualified directory above. Paths are assembled with Node `path`, including installations under `C:\Program Files\Musikhaus Müller`.

`.github/workflows/desktop-build.yml` compiles only (no Supabase secrets, production update, or service role) on Windows and macOS ARM and uploads installers as artifacts. macOS x64 remains a reasonable native-runner target through `npm run desktop:build:mac:x64`.

Windows SmartScreen and macOS Gatekeeper may warn for this internal unsigned MVP. A professional release needs Windows code signing and Apple Developer ID/notarization.
