# Desktop MVP operations

## Public build configuration

Set these values only in the build environment. The build writes a temporary ignored `desktop/public-config.json`, which contains public Supabase client configuration only:

```text
DESKTOP_SUPABASE_URL=https://<project>.supabase.co
DESKTOP_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

Never set `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` for an Electron build. The build script rejects an anon key value containing `service` or `secret`.

## Authorized users

The current database has no profiles or role table. Assign the role in Supabase Auth **app metadata**, never user metadata, through the Dashboard or an administrative server-side tool:

```json
{ "role": "admin" }
```

or:

```json
{ "role": "root" }
```

The desktop app and Edge Function reject every other role. Verify one authorized test user before a client pilot.

## Edge Function deployment

Review and deploy from a trusted administrative workstation only:

```bash
supabase functions deploy desktop-price-update --project-ref <project-ref>
```

The preflight-only function uses the authenticated user's JWT plus existing RLS SELECT policies; it needs no service-role secret. Administrative keys must never be passed to Electron, placed in `desktop/public-config.json`, committed, or logged.

## Controlled first client test

The pilot exposes only **Modo prueba**. It runs Hot Sound, Thomann, pre-writer, production plan and secure preflight, then stops. There is no backend apply/audit stage and it writes no prices. Confirm the UI says: `Modo prueba — no se modificaron precios`.

## Native builds

Run each build on its matching runner after exporting the two public configuration values:

```bash
# macOS Apple Silicon
npm run desktop:install-browser
npm run desktop:smoke-browser
npm run desktop:build:mac

# Windows x64
npm run desktop:install-browser
npm run desktop:smoke-browser
npm run desktop:build:win
```

The macOS artifact is a `.dmg`; Windows is an NSIS `.exe`. Unsigned internal builds can trigger Gatekeeper or SmartScreen warnings.
