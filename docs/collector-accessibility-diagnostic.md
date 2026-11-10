# Collector accessibility diagnostic — 2026-11-10

All observations below used `node collector/run.mjs --shop=<shop> --diagnostic-only`. This command reads `web/seed.json`, performs public GET requests, prints JSON, and exits before Supabase initialization. It never creates runs, observations, results, or offers.

| Shop | GitHub HTTP | GitHub alt source | Local HTTP | Local alt source | Classification | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| Music Store | 403 on direct product route | 403 previously observed from GitHub profile | 403 direct (1/1) | 200 brand catalog | runner-sensitive / preserve-only | Keep production fallback disabled; validate the exact Art.-Nr. block in an authorised runtime before any activation. |
| Kirstein | not measured in a GitHub runner | not measured in a GitHub runner | 9/10 distinct existing URLs 200; 1 URL 404 | sitemap 200 | GitHub status unknown; locally compatible | Run diagnostic-only in GitHub before changing production strategy. Preserve the 404 row. |
| Hot Sound | not measured in a GitHub runner | n/a | 32/32 component/direct URLs 200 | n/a | GitHub status unknown; locally compatible | Keep exact URL/SKU-only collection and preservation on errors. |
| Thomann | not measured in a GitHub runner | not measured in a GitHub runner | 16/39 URLs 200, 20/39 HTTP 429, 3/39 HTTP 404 | sitemap HTTP 429 | source-blocked / preserve-only | Continue preservation; sitemap is not a usable fallback in this execution profile. |

The observed Kirstein 404 is `LD-Systems-MAUI-28-G3-Weiss.html`. It is not treated as an alternative variant or redirected to a neighbouring product.

## Execution environment

Normal runs accept `COLLECT_EXECUTION_ENV=github|local|self_hosted` (default `github`) and persist the selected value in `collection_runs.metadata.execution_environment`. It is metadata only: it does not change headers, matching, source selection, credentials, or write behaviour.

`--diagnostic-only` accepts the same variable but does not access Supabase. This enables a genuine GitHub/local/self-hosted comparison when each environment runs the same command. This repository change does not deploy or schedule a self-hosted runner.
