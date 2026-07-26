# Changelog

Todos los cambios notables de Cookie AutoClean se documentan aquí. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: #110---2026-07-27
[1.0.0]: #100---2026-07-27
