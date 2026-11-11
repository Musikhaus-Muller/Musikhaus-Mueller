# Music Store Art.-Nr. recovery — proposal-only

Date: 2026-11-10. This is a diagnostic route, not a collector fallback. It has no Supabase credentials or write path.

## Safe input contract

1. Obtain an official public Music Store catalog/search/category document.
2. Locate one **exact** `Art.-Nr.` block.
3. Validate the exact product identity inside that block, including `PRO`, `BT`, `MIX`, G2/G3/G4X and colour tokens.
4. Extract one non-UVP price only from that same block. Multiple candidate prices, no price, an absent SKU, or a variant mismatch are rejected.

The diagnostic rejects a neighbouring Art.-Nr. and its price by construction. It does not use fuzzy matching, nearest blocks, category-only prices, proxying, browser retries, or CAPTCHA workarounds.

## Official-public evidence revalidated

| Art.-Nr. | exact product | price shown | availability |
|---|---|---:|---|
| PAH0024126-000 | LD Systems ICOA Pro 12 A | 1,089.00 EUR | listed as available |
| PAH0024127-000 | LD Systems ICOA Pro 15 A | 1,299.00 EUR | listed as available |
| PAH0021617-000 | LD Systems ICOA 12 A BT | 429.00 EUR | listed as available |
| PAH0021619-000 | LD Systems ICOA 15 A BT | 469.00 EUR | listed as available |
| PAH0021620-000 | LD Systems ICOA 12 PC | 42.00 EUR | listed as available |
| PAH0023678-000 | LD Systems STINGER 8 A G3 | 499.00 EUR | listed as available |

The public LD Systems brand/catalog pages expose `Art.-Nr.`, product name, availability and price together. The direct product route is still not used by the GitHub collector because it can return HTTP 403; the existing production strategy remains `http-preserve-on-block`.

## Existing offers

There are 19 Music Store offers in `web/seed.json`, with 39 distinct Art.-Nr. component URLs. Six of those SKUs above are independently revalidated by current public catalog blocks. No existing offer is marked updated: a complete component cart may be refreshed only after every one of its required component Art.-Nr. blocks has passed this diagnostic in the same run. Therefore the proposal-only result is **6 individually revalidated SKUs; 0 of 19 offers published or overwritten**.

## Priority gaps

| configuration | classification | blocking exact component/evidence |
|---|---|---|
| r9 | incomplete_recipe | current MAUI 44 G2 SAT BAG and SUB bag pair not substantiated |
| r11 | incomplete_recipe | additional black MAUI 28 G3 SUB composition not substantiated |
| r12 | incomplete_recipe | additional MAUI 44 G2 SUB not substantiated |
| r18 | incomplete_recipe | exact SAT WMB 10 B wall/ceiling brackets not substantiated |
| r20 | incomplete_recipe | complete STINGER 12 / SUB 18 accessory composition not substantiated |
| r21 | incomplete_recipe | complete STINGER 15 / 4 × SUB 18 composition not substantiated |
| r22 | incomplete_recipe | exact SUB 15, covers and stand/bag composition not substantiated |
| r27 | incomplete_recipe | three covers, dolly, exact stand-pair/bag and 5 m cables not all substantiated |
| r29 | incomplete_recipe | four covers, two dollies, audio and PowerCon accessory composition not substantiated |

No priority configuration is a `complete_component_cart` from the evidence available in this pass. Across the full 21 gaps, **0 are presently verified recoverable**; this means "not proved complete", not "not sold". No new offer is eligible.

## Production decision

Do not connect this parser to `collector/run.mjs` yet. The safe next step is a controlled proposal run covering all 39 component Art.-Nr. blocks and a cart-level verifier. The GitHub-hosted collector should continue preserving prior valid prices on direct-page 403. If Music Store removes usable public catalog blocks, an alternate/self-hosted runner cannot safely solve that by bypassing protection; it would require an authorised first-party access channel or a documented public source.
