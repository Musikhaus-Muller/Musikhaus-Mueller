# Kirstein exact SKU bindings — proposal-only

| reference | URL | expected name | discovered SKU | discovered name | variant exact | decision |
| --- | --- | --- | --- | --- | --- | --- |
| r1 | MAUI 11 G3 Schwarz | MAUI 11 G3 Schwarz | 00095963 | MAUI 11 G3 Schwarz | yes | bound |
| r2 | MAUI 11 G3 Schwarz Set | MAUI 11 G3 Schwarz Set | 00096126 | MAUI 11 G3 Schwarz Set | yes | bound |
| r3 | MAUI 28 G3 Schwarz Set | MAUI 28 G3 Schwarz Set | 00096122 | MAUI 28 G3 Schwarz Set | yes | bound |
| r4 | same URL as r3 | different configuration | 00096122 | MAUI 28 G3 Schwarz Set | n/a | absent: duplicate SKU invariant |
| r5 | MAUI 28 G3 Schwarz | MAUI 28 G3 Schwarz | 00095958 | MAUI 28 G3 Schwarz | yes | bound |
| r6 | MAUI 28 G3 Weiss | MAUI 28 G3 Weiss | — | — | — | not_found (HTTP 404) |
| r7 | MAUI 28 G3 Mix Schwarz | MAUI 28 G3 Mix Schwarz | 00104330 | MAUI 28 G3 Mix Schwarz | yes | bound |
| r11 | MAUI 28 G3 Subwoofer Cardioid Set Schwarz | same | 00104319 | same | yes | bound |
| r15 | Dave 12 G4X Set | same | 00093873 | same | yes | bound |
| r16 | Dave 15 G4X Set | same | 00093874 | same | yes | bound |
| r17 | Dave 18 G4X Set | same | 00093875 | same | yes | bound |

Result: 9 bound, 9 identity-valid and price-valid in the earlier read-only audit. r4 remains pending because its configuration cannot share r3's binding under the no-duplicate-SKU rule; r6 is not found. No binding is read from a live page at runtime and this document does not enable collection or persistence.
