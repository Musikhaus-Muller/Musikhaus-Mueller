# PA Bundle Comparador

## Estado actual

Comparador de 40 configuraciones con 6 tiendas integradas: Musikhaus Müller, Thomann, Kirstein, PRO LIGHTING, Hot Sound y Music Store.

La arquitectura actual separa claramente:
- **GitHub**: código, tests, migraciones y collector programable.
- **Supabase**: fuente de verdad para tiendas, configuraciones, ofertas, observaciones de precio y ejecuciones.
- **Frontend/Worker**: lectura de catálogo, estado e historial exclusivamente desde Supabase.

El collector conserva siempre el último precio válido cuando un comercio devuelve 403, 429, CAPTCHA o un error de parseo. Actualmente Müller y PRO LIGHTING funcionan por HTTP directo. Thomann, Kirstein, Hot Sound y Music Store pueden bloquear automatización y usan estrategia de preservación del último precio válido.

Music Store tiene inicialmente comparaciones MAUI exactas para r1, r5, r6 y r7.

## Ejecutar y probar

Requiere Node.js 22 o superior.

```sh
npm run build
npm test
npm run preview
```

## Collector

El collector está en `collector/`.

Variables de servidor:

```sh
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

Nunca incluir `SUPABASE_SECRET_KEY` en frontend, commits o capturas.

Ejemplos:

```sh
cd collector
node run.mjs --shop=mueller --limit=3
node run.mjs --shop=musicstore --limit=4
```

## Supabase

Las migraciones están en `supabase/migrations/`.

Tablas principales:
- `shops`
- `configurations`
- `offers`
- `price_observations`
- `collection_runs`
- `collection_results`

`current_offer_status` conserva por separado el último precio correcto y el último intento de colección.

El frontend no debe consultar tablas internas de collector directamente. La transición utiliza una proyección sanitizada y acceso desde backend con clave secreta.

## Frontend

Supabase es la única fuente persistente del catálogo, precios, estado e historial. El Worker no usa R2.

- `/api/catalog`, `/data.json` y `/data.js`: catálogo desde Supabase.
- `/api/status` y `/api/runs`: ejecuciones desde Supabase.
- `POST /api/updates/manual`: exige un JWT firmado por Cloudflare Access, reserva una ejecución atómica en Supabase y dispara `collect-prices.yml` mediante GitHub Actions. `Origin` solo añade protección CSRF. El endpoint legacy `/api/refresh` permanece retirado. El token de GitHub solo vive en el Worker.
- MCP: consulta estado en Supabase; no mantiene persistencia propia.

Para habilitar el botón web solo a personal autorizado:

1. Aplicar en orden `supabase/migrations/20261105220000_manual_collection_dispatch.sql` y `supabase/migrations/20261105225000_manual_collection_lifecycle.sql`. La segunda migra instalaciones que ya aplicaron la primera.
2. Crear una aplicación Cloudflare Access para `POST /api/updates/manual`, con una policy que permita solo al grupo/cuentas administrativas designadas. No usar una policy `Everyone` o `Bypass`.
3. Configurar en el Worker:
   - Variables: `CF_ACCESS_TEAM_DOMAIN` (dominio del issuer, sin `https://`) y `CF_ACCESS_AUD` (audience tag de la aplicación Access).
   - Secrets: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` y `GITHUB_ACTIONS_TOKEN`. El token GitHub requiere `Actions: Read and write` solo para este repositorio.
4. Configurar en GitHub Actions los secrets `SUPABASE_URL` y `SUPABASE_SECRET_KEY`.
5. Habilitar `.github/workflows/reconcile-manual-runs.yml`; cada cinco minutos consulta los runs activos de Actions y reconcilia reservas sin un run correlacionado. Usa el `GITHUB_TOKEN` integrado con permiso `actions: read`; no requiere otro secreto.
6. El workflow de colección usa `collection_run_id` en su `run-name` y reclama ese mismo run al iniciar. Una reserva sin workflow activo y sin reclamación durante 10 minutos termina como fallida; una ejecución aún `queued`/`in_progress` o reclamada por el collector no se marca como huérfana. Si GitHub API no está disponible, la reconciliación falla sin modificar runs.

El JWT de Access se verifica en el Worker (firma RS256, issuer, audience y expiración); no se entrega credencial backend al navegador. No se debe exponer directamente el botón a usuarios públicos sin autenticar.

`web/seed.json` queda como fixture/referencia de desarrollo y para pruebas de paridad, no como fuente de producción.

## Estrategias por tienda

- Musikhaus Müller: HTTP directo.
- PRO LIGHTING: HTTP directo.
- Thomann: HTTP; sitemap público para discovery; preservación ante bloqueo.
- Kirstein: HTTP; preservación ante bloqueo.
- Hot Sound: HTTP; preservación ante bloqueo.
- Music Store: HTTP; preservación ante bloqueo.

No se intenta saltar CAPTCHA.

## Próximos pasos

1. Validar el despliegue del Worker sin binding R2.
2. Verificar los secrets `SUPABASE_URL` y `SUPABASE_SECRET_KEY` en el entorno de hosting y GitHub Actions.
3. Ejecutar una recolección programada/manual desde GitHub Actions y comprobar `/api/status` y `/api/runs`.
4. Ampliar Music Store y otras equivalencias verificables sin saltar CAPTCHA.
