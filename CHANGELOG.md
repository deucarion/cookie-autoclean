# Changelog

Todos los cambios notables de Cookie AutoClean se documentan aquí. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-07-29

### Añadido
- **Toggle "Conservar cookies de sesión" en la página de opciones**: nueva preferencia `keepSessionCookies` (almacenada en `chrome.storage.sync`, sincronizada entre dispositivos del usuario). Por defecto está **activada**. Cuando lo está, la lógica de limpieza funciona a nivel de dominio: si un dominio tiene al menos una cookie de sesión, **todas** las cookies de ese dominio (incluidas las persistentes y no-sesión) se preservan. Esto es una red de seguridad para sitios que están usando cookies de sesión activamente — borrar un "hermano" persistente de una cookie de sesión es más probable que rompa algo (estado de UI, carritos, autenticación implícita) que lo que protege. Si el usuario quiere un comportamiento más agresivo, puede desactivar el toggle y volver al esquema de "solo se borra lo que es true third-party".
- **Cadenas i18n `options_keep_session` y `options_keep_session_desc`**: título y descripción del toggle. Disponibles en `es` y `en`.

### Cambiado
- `lib/state.js` añade la clave `keepSessionCookies: true` a `SYNC_DEFAULTS` y la función `setKeepSessionCookies()`.
- `lib/cleanup.js` precalcula el conjunto de dominios protegidos por sesión (una sola pasada sobre `allCookies` cuando el toggle está activo) y lo aplica como un check de "in use" adicional, antes del filtro de "isTrueThirdParty". Las llamadas a `getSettings`, `getActiveFirstParties` y `chrome.cookies.getAll` se ejecutan en paralelo con `Promise.all` para no penalizar el rendimiento.

### Notas técnicas
- El incremento es minor (1.2.3 → 1.3.0) porque añade una funcionalidad visible para el usuario (un toggle nuevo en la página de opciones con un comportamiento de limpieza nuevo). El comportamiento por defecto cambia: con el toggle activo (que es el estado por defecto en nuevas instalaciones), más cookies sobreviven a la limpieza — la diferencia observable es que la sesión de sitios como Steam ya no se ve amenazada aunque haya cookies persistentes en el mismo dominio.
- **Para usuarios existentes que actualizan**: el nuevo `keepSessionCookies` se inicializa como `true` la primera vez que la extensión se carga con la versión 1.3.0 (porque `getSettings()` fusiona `SYNC_DEFAULTS` con lo que hay en `chrome.storage.sync` y, si no hay valor guardado, usa el default). Si alguien quiere agresividad total, tiene que entrar a la página de opciones y desactivar el toggle.
- **Privacidad**: este cambio no introduce ningún dato nuevo que la extensión maneje. Solo consulta los campos ya disponibles en los `chrome.cookies.Cookie` existentes (en concreto `expirationDate` para detectar cookies de sesión). No se transmite nada a ningún servidor.

## [1.2.3] - 2026-07-29

### Corregido
- **Sustitución de placeholders de i18n en la página de opciones**: aunque la 1.2.2 dejó bien declarados los placeholders en el JSON (claves `1`/`2` con `content` `$1`/`$2`), el código JS seguía usando un `.replace()` manual sobre el resultado de `chrome.i18n.getMessage(...)` sin args, que en este caso Chrome devuelve con los placeholders ya **eliminados** (en lugar de preservados como `$1`/`$2`). Por eso veíamos `"Eliminadas al cerrar  el ."` con doble espacio. El call site de `notif_message` ya usaba el patrón correcto (`getMessage(name, [arg1, arg2])` con array posicional) y por eso esa notificación sí funcionaba. Se aplica el mismo patrón a `options_deleted_context` y `options_deleted_truncated`, y se sustituye el `.replace()` manual por un fallback con template literals por si `getMessage` devolviera la cadena vacía (mensaje no encontrado en el JSON).

### Notas técnicas
- El incremento es patch (1.2.2 → 1.2.3) porque es un refinamiento del mismo fix; el comportamiento esperado es idéntico al de 1.2.0.
- Con este release, **todas** las llamadas a `chrome.i18n.getMessage` con placeholders de la extensión siguen el mismo patrón: `getMessage(name, [arg1, arg2, ...])` con un array posicional. No hay `.replace()` manuales en ninguna parte.
- Lección de proceso: cuando algo "debería funcionar" según la documentación pero no funciona, vale la pena comparar con un call site que sí funciona (`notif_message` en este caso) en vez de seguir tocando los mismos archivos.

## [1.2.2] - 2026-07-29

### Corregido
- **Placeholders de i18n seguían sin renderizarse**: la versión 1.2.1 cambió los placeholders en los mensajes a sintaxis posicional (`$1`/`$2`) y alineó el `placeholders.content` correspondiente, pero las **claves** del objeto `placeholders` seguían siendo nombres descriptivos (`site`, `when`, `shown`, `total`, `count`). Chrome extrae el nombre del placeholder del propio mensaje (`$1` → nombre `1`, `$SITE$` → nombre `SITE`) y lo usa como clave para buscar en el objeto `placeholders`. Como las claves declaradas no coincidían con los nombres extraídos, Chrome descartaba los placeholders en silencio. Resultado visible: el contexto sobre la última limpieza seguía apareciendo como `"Eliminadas al cerrar  el ."` (con doble espacio) en lugar de `"Eliminadas al cerrar example.com el 28/07/2026, 23:50:00."`. El bug se reproducía tanto en Vivaldi como en Chrome con instalación limpia, descartando problemas de caché. Fix: renombrar las claves del objeto `placeholders` a `1` y `2` para que coincidan con los nombres extraídos de los marcadores `$1`/`$2` del message.

### Notas técnicas
- El incremento es patch (1.2.1 → 1.2.2) porque es un refinamiento del mismo fix, no una nueva funcionalidad. El comportamiento esperado es idéntico al de 1.2.0 y 1.2.1, simplemente ahora la sustitución de placeholders se materializa en runtime.
- A partir de esta versión, **cada cambio de código irá acompañado de un bump de versión** (incluso para fixes que no alteren comportamiento de cara al usuario) para que sea fácil saber de un vistazo si Vivaldi/Chrome ha recargado la última versión del código, sin tener que mirar el `git log` o añadir logs de diagnóstico.

## [1.2.1] - 2026-07-28

### Corregido
- **Falsos positivos al limpiar cookies de subdominios propios**: la función `isFirstParty()` en `lib/domain.js` tenía los operandos de la condición `endsWith` intercambiados. Resultado: las cookies de subdominios del mismo sitio que se estaba cerrando (por ejemplo `store.steampowered.com`, `login.steampowered.com`, `help.steampowered.com` al cerrar `store.steampowered.com`) caían al filtro de "third-party real" y se borraban aunque fueran claramente de primera parte. El fix es una sola línea: `rd.endsWith('.' + cd)` → `cd.endsWith('.' + rd)`.
- **Placeholders de i18n sin expandir en la página de opciones**: el contexto sobre la última limpieza (`"Eliminadas al cerrar ... el ..."`) se renderizaba con los placeholders eliminados en silencio por Chrome (aparecía como `"Eliminadas al cerrar el ."` con doble espacio). Causa: las cadenas de mensaje usaban placeholders con nombre (`$SITE$`, `$WHEN$`) pero la declaración `placeholders.content` decía `$1`/`$2`, así que Chrome los descartaba al no reconocerlos. Mismo bug latente en `notif_message` (la notificación nativa habría mostrado placeholders en crudo si el toggle estuviese activado). Fix: unificar todos los mensajes con placeholders a la sintaxis posicional `$1`/`$2`, que es lo que ya esperaba el call site de `notif_message` y con la que el `content` ya estaba alineado.

### Notas técnicas
- El incremento es patch (1.2.0 → 1.2.1) porque ambos son arreglos de bugs, no funcionalidades nuevas. La superficie de cara al usuario es exactamente la misma que en 1.2.0, solo que ahora funciona como se esperaba.
- El bump de versión también cumple un propósito práctico: en extensiones cargadas en modo "unpacked", Chrome cachea los archivos de `_locales/` y no los invalida con un simple `chrome.runtime.reload()`. Al cambiar la versión en el manifest, Chrome relee los locales del disco la próxima vez que se carga la extensión, lo que permite que el fix de i18n se materialice sin necesidad de desinstalar y reinstalar manualmente.

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

[1.3.0]: #130---2026-07-29
[1.2.3]: #123---2026-07-29
[1.2.2]: #122---2026-07-29
[1.2.1]: #121---2026-07-28
[1.2.0]: #120---2026-07-28
[1.1.2]: #112---2026-07-27
[1.1.1]: #111---2026-07-27
[1.1.0]: #110---2026-07-27
[1.0.0]: #100---2026-07-27
