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
- `POST /api/updates/manual`: retirado. La web pública no puede disparar GitHub Actions.
- MCP: consulta estado en Supabase; no mantiene persistencia propia.

La actualización diaria sigue ejecutándose a las 07:15 UTC. Las actualizaciones manuales se lanzan únicamente desde GitHub Actions (`Collect prices` → `Run workflow`) por usuarios con permisos sobre el repositorio. El Worker no necesita Cloudflare Access, `CF_ACCESS_*` ni `GITHUB_ACTIONS_TOKEN`; solo necesita acceso servidor a Supabase para catálogo, estado e historial.

El botón público `Preise neu laden` únicamente vuelve a leer catálogo, estado e historial desde Supabase. No inicia una recolección.

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
