# PA Bundle Comparador — entrega portable

## Estado real
Comparador de 40 configuraciones y 5 tiendas visibles: Musikhaus Müller, Thomann, Kirstein, Hot Sound y PRO LIGHTING. Music Store está pendiente.

Incluye filtros, exportación CSV, botón de actualización, conservación de precios ante errores e historial de los últimos 30 registros. El extractor consulta las páginas desde el servidor; NO es todavía un agente autónomo con navegador. Thomann y Kirstein pueden bloquearlo con HTTP 403/CAPTCHA.

Supabase se eligió como próximo paso, pero NO está implementado: no hay esquema SQL ni conexión. Actualmente se utiliza Cloudflare R2 mediante BUCKET. El agente independiente y el repositorio GitHub tampoco se crearon.

## Ejecutar y probar
Node.js 22 o superior. No necesita dependencias npm.

```sh
npm run build
npm test
npm run preview
```
Abrir http://127.0.0.1:8767 . La vista previa utiliza almacenamiento simulado de solo lectura: permite consultar la interfaz, pero NO probar escrituras del botón. Los tests sí prueban escrituras con un almacenamiento simulado.

## Código
- web/: interfaz y datos de referencia.
- worker/handler.mjs: API, extractor e historial.
- scripts/build.mjs: genera dist/server/index.js y el manifiesto.
- tests/: pruebas del servidor y del botón manual.
- web/update-instructions.json: instrucciones para el proceso programado.

## Migrar a otra cuenta
1. Crear un repositorio PRIVADO en GitHub y subir esta carpeta sin claves.
2. Crear un nuevo proyecto de hosting. El project_id anterior se eliminó. En Sites, registrar un nuevo proyecto y añadir su ID al manifiesto .openai/hosting.json.
3. Proporcionar R2 con binding BUCKET, o implementar y probar la migración a Supabase antes de cambiar el almacenamiento.
4. Construir y publicar dist/server/index.js como Worker ESM con sus bindings. No publicar web/ como página estática: necesita servidor.
5. Mantener la web y API privadas. El código depende de la autenticación exterior de Sites. Origin NO sustituye autenticación. Fuera de Sites, añadir autenticación a lecturas, escrituras, /api/runs y /mcp antes de desplegar.
6. Sustituir TU-NUEVO-DOMINIO en web/update-instructions.json y configurar el acceso de servicio del nuevo proyecto.
7. Recrear el horario de las 09:00 Europe/Madrid en la nueva cuenta. La automatización NO se transfiere con este ZIP. Enviar X-PA-Trigger: scheduled. Evitar dos horarios sobre el mismo almacenamiento.
8. Probar una ejecución y verificar persistencia en /api/runs y /data.json.

## Datos
Incluye seed.json y browser-checks.json con referencias del 03/11/2026; no son precios consultados en vivo hoy. El historial y estado posteriores guardados en R2 NO están incluidos. Para conservarlos, exportar por separado price-snapshot-v1.json desde la cuenta propietaria. /api/runs y /data.json son exportaciones de consulta, no sustituyen el objeto interno completo.

El paquete no contiene tokens, sesiones, credenciales, configuración de GitHub ni ID del proyecto anterior.

## Próxima fase: Supabase y agente
Diseñar tablas de configuraciones, tiendas, ofertas, observaciones, ejecuciones y resultados. Importar el estado vigente conservando fechas, sin marcar precios antiguos como recién verificados. Crear un endpoint autenticado para observaciones del agente. Mantener separados MAUI G2/G3, MIX/estándar, colores, cantidades y accesorios. Las claves privadas deben estar solo en el servidor. Ante CAPTCHA o bloqueos, dejar pendiente y conservar el precio anterior.
