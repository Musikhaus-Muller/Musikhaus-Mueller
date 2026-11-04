# Music Store audit — 2026-11-04

## Summary

- Configurations reviewed: 40
- Verified Music Store offers after this audit: 19
- Remaining without Music Store offer: 21
- Policy: only add exact/similar carts when every required core component is publicly verifiable. Never infer missing products or accessories.

## Newly added in this audit

| ID | Configuration | Classification | Price | Evidence |
| --- | --- | --- | ---: | --- |
| r13 | MAUI 11 G2 Bundle | exact | 839 € | MAUI 11 G2 729 € + Sat Bag 65 € + Sub PC 45 € |
| r14 | MAUI 28 G2 Bundle | exact | 1,079 € | MAUI 28 G2 949 € + Sat Bag 85 € + Sub PC 45 € |

Both are multi-component carts and therefore `collection_disabled=true` for the current single-URL collector.

## Remaining configurations

### Not verifiable with complete current Music Store components

| ID | Configuration | Reason |
| --- | --- | --- |
| r9 | MAUI 44 G2 Stereo Touring | MAUI 44 G2 and roll board are public, but the complete required cover/bag set was not found unambiguously. |
| r11 | MAUI 28 G3 Power Bundle | Base system is public, but the additional black MAUI 28 G3 subwoofer could not be identified unambiguously from a current public product page. |
| r12 | MAUI 44 G2 Power Bundle | Additional MAUI 44 G2 subwoofer not found as a current unambiguous public product. |
| r18 | DAVE 10 G4X Install Bundle | DAVE 10 G4X is public; the required SAT WMB 10 B wall/ceiling brackets were not found. DAVE 10 G4X STAND is not equivalent. |
| r20 | STINGER 12 / SUB 18 G3 | STINGER 12 A G3 is public; complete SUB 18 / transport accessory composition not verified. |
| r21 | STINGER 15 / 4 × SUB 18 G3 | Complete current STINGER 15 A G3 + four SUB 18 G3 + transport set not verified. |
| r22 | STINGER 8 / SUB 15 Basic | STINGER 8 A G3 is public; matching SUB 15 G3 + all covers/stands not verified. |
| r27 | ICOA PRO Entertain Touring | Core ICOA PRO products are public, but the full three-cover / dolly / stand-pair touring accessory set was not verified. |
| r29 | ICOA PRO 15A / 21A Power | ICOA PRO 15 A, SUB 21 cover and dolly are public; full 4-cover + 2-dolly + power/audio accessory set not verified. |

### Unavailable / discontinued

| ID | Configuration | Reason |
| --- | --- | --- |
| r19 | STINGER 10 / SUB 15 G3 | STINGER 10 A G3 is shown as discontinued / no longer a current Music Store product. |

### No public matching Music Store product found in this audit

| ID | Configuration | Family |
| --- | --- | --- |
| r30 | FRIGGA Stereo schwarz | DAP Frigga |
| r31 | FRIGGA Stereo weiß | DAP Frigga |
| r32 | FRIGGA Stereo schwarz + Taschen | DAP Frigga |
| r33 | FRIGGA Stereo weiß + Taschen | DAP Frigga |
| r34 | FRIGGA Schwarz + Taschen | DAP Frigga |
| r35 | FRIGGA Weiß + Taschen | DAP Frigga |
| r36 | DELTA-X218B 2× Bundle | Wharfedale Pro |
| r37 | DELTA-F18B Twin Bundle | Wharfedale Pro |
| r38 | DELTA-F18B Quad Bundle | Wharfedale Pro |
| r39 | WLA-210XP Line Array Base | Wharfedale Pro |
| r40 | WLA-210XP Line Array + Amps | Wharfedale Pro |

## Coverage after audit

Music Store has a verified offer for 19 of 40 configurations (47.5%).

The remaining 21 are intentionally left without an offer rather than approximated from incomplete or ambiguous components.
