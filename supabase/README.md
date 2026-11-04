# Supabase setup

1. Open Supabase > SQL Editor.
2. Run `supabase/migrations/20261104135000_foundation.sql`.
3. In the shell, set:
   - `SUPABASE_URL=https://hhzgcituicdwmukfshop.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=<service role key>`
4. Run `node scripts/import-seed-to-supabase.mjs`.
5. Verify expected baseline:
   - 6 shops
   - 40 configurations
   - offers and price observations matching `web/seed.json`

Do not commit the service-role key. It is intended only for trusted server-side jobs / GitHub Actions.
