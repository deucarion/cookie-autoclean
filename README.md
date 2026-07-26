# Cookie AutoClean

Extensión de Chrome (Manifest V3) que elimina automáticamente las **cookies de terceros** cuando cierras la última pestaña de un sitio web. Conserva las cookies de cualquier sitio que aún tengas abierto.

## Comportamiento

1. Cuando se cierra una pestaña, la extensión captura su URL.
2. Se calcula el *registrable domain* (eTLD+1) — por ejemplo, `shop.example.com` → `example.com`.
3. Si **ninguna otra pestaña** abierta comparte ese mismo registrable domain, se procede a la limpieza.
4. Se eliminan todas las cookies que sean **de terceros** desde la perspectiva de ese sitio, pero se respetan las cookies que sean de primera parte para **cualquier otro sitio que aún tengas abierto**.

Resultado: al cerrar la última pestaña de un sitio, sus cookies de rastreo / terceros se eliminan. Si tenías otros sitios abiertos en otras pestañas, sus cookies (propias o de terceros) se conservan.

## Estructura

```
Cookie AutoClean/
├── manifest.json               # MV3, permisos: cookies, tabs, storage, alarms
├── background/
│   └── service-worker.js       # Listener de onRemoved + lógica de limpieza
├── lib/
│   ├── domain.js               # eTLD+1 + first-party check
│   ├── cleanup.js              # Bucle de borrado por lotes
│   ├── state.js                # Wrappers de chrome.storage
│   └── i18n.js                 # Helper data-i18n para HTML
├── popup/                      # Toggle on/off + estadísticas rápidas
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/                    # Página de ajustes completa
│   ├── options.html
│   ├── options.js
│   └── options.css
├── _locales/
│   ├── en/messages.json
│   └── es/messages.json
├── icons/                      # 16, 48, 128
└── README.md
```

## Cargar la extensión en Chrome (modo desarrollador)

1. Abre `chrome://extensions/`.
2. Activa el **Modo desarrollador** (esquina superior derecha).
3. Pulsa **Cargar descomprimida** y selecciona la carpeta `Cookie AutoClean`.
4. Listo. Verás el icono de la galleta en la barra de extensiones.

Los cambios en los archivos se recargan desde `chrome://extensions/` con el botón de recarga circular.

## Historial de versiones

Consulta [`CHANGELOG.md`](./CHANGELOG.md) para ver el detalle de cambios entre versiones.

## Permisos solicitados

| Permiso | Por qué |
|---------|---------|
| `cookies` | Leer y borrar cookies del navegador. |
| `tabs` | Conocer qué pestañas hay abiertas para decidir si hay otras pestañas del mismo sitio. |
| `storage` | Guardar la preferencia activado/desactivado y estadísticas. |
| `alarms` | Reservado para mantenimiento periódico futuro. |
| `notifications` | Mostrar la notificación opcional tras cada limpieza. |
| `<all_urls>` | Necesario para poder inspeccionar/borrar cookies de cualquier sitio. |

## Configuración

- **Popup**: interruptor principal activado/desactivado + contador de cookies eliminadas + último sitio limpiado.
- **Opciones** (clic en "Open settings"): interruptor principal, opción de notificación, estadísticas detalladas, botón para restablecer contador.

## Notas de implementación

- **Service worker (MV3)**: el worker se duerme tras inactividad. Los listeners (`onUpdated`, `onRemoved`, `onReplaced`, `onInstalled`) están en el top-level para sobrevivir al ciclo de vida.
- **Caché de URLs**: como el objeto `tab` ya no existe cuando se dispara `onRemoved`, mantenemos un `Map<tabId, url>` actualizado por `onUpdated` y `onCreated`.
- **Borrado por lotes**: `chrome.cookies.remove` se llama con `Promise.allSettled` en chunks de 50 para no saturar la API.
- **Borrado idempotente**: si una cookie ya no existe, `remove` devuelve `null` sin error. Seguro de reintentar.
- **i18n**: usa `chrome.i18n` con `__MSG_*__` en el manifest y atributos `data-i18n` en HTML. Idiomas incluidos: `es` (por defecto) y `en`.

## Limitaciones conocidas

- El cálculo de *registrable domain* usa un set curado de TLDs multi-parte. No es 100% exacto para todos los public suffixes exóticos. Si necesitas precisión total, sustituye `lib/domain.js` por una biblioteca como `tldts`.
- En modo Incógnito, las cookies se manejan en un *cookie store* separado. La extensión, por defecto, no actúa ahí. Si quieres incluirlo, ve a `chrome://extensions/` → detalles de Cookie AutoClean → "Permitir en modo Incógnito".

## Próximos pasos posibles

- Whitelist/blacklist de dominios
- Limpieza periódica con `chrome.alarms`
- Throttle de notificaciones (máx. una por minuto para no spamear)
- Exportar estadísticas
