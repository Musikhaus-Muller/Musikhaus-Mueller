# PA Bundle Comparador

## Estado actual

Comparador de 40 configuraciones con 6 tiendas integradas: Musikhaus Müller, Thomann, Kirstein, PRO LIGHTING, Hot Sound y Music Store.

La arquitectura actual separa claramente:
- **GitHub**: código, tests, migraciones y collector programable.
- **Supabase**: fuente de verdad para tiendas, configuraciones, ofertas, observaciones de precio y ejecuciones.
- **Frontend/Worker**: interfaz compatible con el snapshot histórico, con transición segura hacia lectura desde Supabase.

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

La UI mantiene `web/seed.json` / snapshot como fallback. Cuando el backend dispone de `SUPABASE_URL` y `SUPABASE_SECRET_KEY`, `/api/catalog` devuelve el catálogo actual desde Supabase. Si Supabase no está disponible, la interfaz continúa funcionando con el snapshot existente.

Esto permite validar paridad antes de retirar definitivamente R2.

## Estrategias por tienda

- Musikhaus Müller: HTTP directo.
- PRO LIGHTING: HTTP directo.
- Thomann: HTTP; sitemap público para discovery; preservación ante bloqueo.
- Kirstein: HTTP; preservación ante bloqueo.
- Hot Sound: HTTP; preservación ante bloqueo.
- Music Store: HTTP; preservación ante bloqueo.

No se intenta saltar CAPTCHA.

## Próximos pasos

1. Aplicar y validar la proyección frontend de Supabase.
2. Configurar las variables de servidor del hosting/Worker.
3. Comparar `/api/catalog` contra el snapshot actual.
4. Cambiar definitivamente la UI a Supabase cuando la paridad sea satisfactoria.
5. Retirar R2 solo después de validar historial, filtros, CSV y casos de bloqueo.
