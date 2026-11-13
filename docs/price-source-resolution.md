# Price source resolution — read-only discovery

## Quality model

| Grade | source type | automatic write eligibility |
| --- | --- | --- |
| A1 | `official_product_api` | eligible after exact identity gate |
| A2 | `official_structured_product_data` | eligible after exact identity gate |
| A3 | `official_catalog` | eligible after exact identity gate |
| A4 | `official_search_endpoint` | eligible after exact identity gate |
| B1/B2 | public/external verified feed | proposal/review only |
| C1 | external aggregator | proposal/review only |

## Findings

| Shop | candidate source | public | exact identity evidence | price | outcome |
| --- | --- | --- | --- | --- | --- |
| Thomann | product HTML / sitemap | yes | product page when not rate-limited | price when 200 | partial; sitemap currently 429 |
| Music Store | official brand/catalog page | yes | Art.-Nr. + product name | catalogue price where accessible | environment-sensitive; requires exact Art.-Nr. binding |
| Hot Sound | exact product HTML | yes | no usable content when protection page returned | no | preserve-only until a legitimate structured source is demonstrated |

No source in this layer performs a write, retries aggressively, uses a proxy, bypasses a CAPTCHA, or changes product matching. An alternative source is selected only after retailer, exact SKU (when expected), identity/variant, positive EUR price, and provenance all validate.
