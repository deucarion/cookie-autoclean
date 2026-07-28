# Changelog

Todos los cambios notables de Cookie AutoClean se documentan aquí. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-28

### Añadido
- **Listado de cookies eliminadas en la última limpieza**: la página de ajustes ahora muestra una nueva tarjeta con una tabla compacta de todas las cookies que se eliminaron en la limpieza más reciente. Por cada cookie se ve: dominio, nombre, ruta, atributo `SameSite`, si era segura (`Secure`), si era de sesión y si estaba particionada (con su `topLevelSite` cuando aplica). La lista lleva encima una línea de contexto que recuerda qué sitio cerraste y a qué hora.
- **Estado vacío elegante**: si todavía no se ha ejecutado ninguna limpieza —o la última no eliminó nada— la tarjeta muestra un mensaje suave en vez de la tabla. No hay layout roto en el primer arranque.
- **Aviso de truncado**: si una limpieza supera el tope interno de 200 entradas, se muestra un pie de aviso indicando que se están enseñando solo las primeras N de M. La persistencia ya recorta en `state.js`; el front solo informa.
- **Cadenas i18n** nuevas: `options_deleted_h`, `options_deleted_empty`, `options_deleted_context` (con placeholders `$SITE$` y `$WHEN$`), `options_deleted_truncated` (con `$SHOWN$` y `$TOTAL$`), y los nombres de columna `col_domain` / `col_name` / `col_path` / `col_samesite` / `col_secure` / `col_session` / `col_partitioned`. Disponibles en `es` y `en`.

### Cambiado
- `lib/cleanup.js` ahora devuelve también `deletedList` (resumen por cookie, sin el `value` por privacidad) además de los contadores `deleted` / `kept` / `total`. La lista se construye solo con las cookies cuya llamada a `chrome.cookies.remove` devolvió un resultado exitoso, así que su longitud coincide siempre con `deleted`.
- `lib/state.js` añade la clave `lastDeleted` (array) a las estadísticas locales y la función `setLastDeleted()`. La lista persistida se capa a 200 entradas. `resetStats()` también limpia la lista.
- `background/service-worker.js` siempre llama a `setLastEvent()` y `setLastDeleted()` tras cada limpieza (incluso si `deleted === 0`), para que el panel refleje siempre la realidad del último cierre y no quede una lista fantasma de un evento anterior.

### Notas técnicas
- El incremento es minor (1.1.2 → 1.2.0) porque añade una funcionalidad visible para el usuario (la tabla) sin romper el comportamiento existente. La extensión 1.2.0 sigue limpiando exactamente igual que la 1.1.2; lo único nuevo es la superficie de inspección.
- **Privacidad**: la lista persistida **no incluye el `value` de la cookie**. Solo metadatos identificativos (dominio, nombre, ruta, atributos). Esto es deliberado: el valor puede contener tokens de sesión, códigos OAuth u otras credenciales que no queremos que queden en `chrome.storage.local` después de que la cookie ya se ha borrado.
- **Tamaño**: cada entrada ocupa ~150–250 bytes. Con el tope de 200, el uso máximo de `chrome.storage.local` para esta lista es ~50 KB, muy por debajo de la cuota de 5 MB.
- **Compatibilidad**: la tabla se renderiza con `textContent`, así que nombres de cookie con caracteres especiales (`<`, `>`, comillas) se muestran como texto literal sin riesgo de inyección. El cambio en `cleanup.js` mantiene la compatibilidad con el contrato anterior (`deleted`/`kept`/`total`) y solo añade un cuarto campo.

## [1.1.2] - 2026-07-27

### Corregido
- **Falsos positivos al limpiar cookies SSO**: cuando se cierra la última pestaña de un sitio que utiliza un dominio hermano para autenticación (por ejemplo, `youtube.com` cierra sesión porque la extensión borraba las cookies de `google.com`), la extensión ahora respeta las cookies con `SameSite=Lax` y `SameSite=Strict`, que Chrome considera de primera parte. También respeta las cookies particionadas (`partitionKey.topLevelSite` presente), que ya están aisladas por sitio.

### Notas técnicas
- El incremento de versión es patch (1.1.1 → 1.1.2) porque es un refinamiento del comportamiento de limpieza existente, no una nueva funcionalidad. La intención del usuario ("solo se borran cookies de terceros") ahora se cumple de forma más fiel: la nueva lógica replica lo que hace Chrome cuando tiene activada la opción "Bloquear cookies de terceros" en su configuración.
- La propiedad `partitionKey` del objeto `chrome.cookies.Cookie` requiere Chrome 132+. En versiones anteriores, la extensión sigue funcionando correctamente: simplemente trata las cookies particionadas como de primera parte, lo cual es conservador y seguro.

## [1.1.1] - 2026-07-27

### Eliminado
- **Permiso `alarms`**: se ha retirado del `manifest.json`. El permiso estaba reservado para una futura limpieza periódica que nunca se implementó, y mantenerlo sin uso comprometía la superficie de permisos de la extensión. Si en el futuro se añade la funcionalidad, se reintroducirá el permiso en una nueva versión.

### Cambiado
- Documentación: `README.md`, `docs/privacy/index.md` y `docs/store/listing.md` actualizados para reflejar la retirada del permiso.

### Notas técnicas
- El incremento de versión es patch (1.1.0 → 1.1.1) porque el cambio no añade ni modifica comportamiento de cara al usuario — solo reduce permisos.

## [1.1.0] - 2026-07-27

### Añadido
- **Notificaciones nativas al limpiar**: el toggle "Show notification when cleaning" de la página de ajustes ahora es funcional. Cuando se elimina al menos una cookie, se muestra una notificación nativa con el icono de la extensión, el título y un mensaje localizado que indica el número de cookies eliminadas y el sitio afectado. Solo se dispara si el toggle está activado y si se borró al menos una cookie.
- **Permiso `notifications`**: añadido al manifest.json para soportar la funcionalidad anterior. Es un permiso opcional — la extensión funciona perfectamente sin mostrar notificaciones si el usuario lo desactiva.
- **Cadenas i18n `notif_title` y `notif_message`**: con placeholders `$COUNT$` y `$SITE$`. Disponibles en `es` y `en`.

### Cambiado
- Documentación: tabla de permisos del `README.md` actualizada con `notifications`.
- Documentación: la entrada "Notificaciones nativas al limpiar" se ha movido de "Próximos pasos" a la lista de funcionalidades existentes. Se ha añadido "Throttle de notificaciones" como posible mejora futura.

### Notas técnicas
- El incremento de versión es minor (1.0.0 → 1.1.0) porque añade una funcionalidad opcional sin romper compatibilidad con versiones anteriores. La nueva instalación 1.1.0 hace exactamente lo mismo que 1.0.0 si la opción de notificación está desactivada.
- Añadir el permiso `notifications` técnicamente es un cambio de permisos. Si publicas en la Chrome Web Store, esto requerirá una revisión manual adicional por parte del equipo de Chrome.

## [1.0.0] - 2026-07-27

### Añadido
- Lanzamiento inicial.
- Limpieza automática de cookies de terceros al cerrar la última pestaña de un sitio web.
- Conservación de cookies de primera parte para cualquier sitio que aún permanezca abierto en otras pestañas.
- Popup con toggle principal, contador total de cookies eliminadas y último sitio limpiado.
- Página de opciones con ajustes (activado/desactivado, notificación, estadísticas, reset).
- Soporte i18n con español (por defecto) e inglés.
- Service Worker MV3 con caché de URLs de pestaña (`Map<tabId, url>`) y borrado de cookies en lotes de 50 con `Promise.allSettled`.
- Icono en tres tamaños (16, 48, 128) generado programáticamente.
- Documentación: `README.md` con instrucciones de instalación, permisos, estructura, notas de implementación y limitaciones.

[1.2.0]: #120---2026-07-28
[1.1.2]: #112---2026-07-27
[1.1.1]: #111---2026-07-27
[1.1.0]: #110---2026-07-27
[1.0.0]: #100---2026-07-27
