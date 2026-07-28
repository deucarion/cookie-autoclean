# Cookie AutoClean — Chrome Web Store Listing

Este archivo contiene los textos de la ficha de la Chrome Web Store, listos para copiar y pegar. Hay versiones en inglés (idioma principal) y en español (idioma secundario). Incluye resumen corto, descripción larga, justificación de permisos y notas para el revisor.

---

## 🇬🇧 English (primary)

### Short summary (≤132 characters)

```
Auto-deletes third-party cookies when you close the last tab of a website. Privacy-friendly, no data collection.
```

(109 characters)

### Long description

```
Cookie AutoClean removes third-party cookies from your browser automatically — but only at the moment you actually stop using a site.

## How it works

When you close a tab, the extension checks if any other tab you have open belongs to the same website. If not — meaning you are truly done with that site — it removes the third-party cookies that site had set, while keeping the cookies of any site you still have open.

For example: if you have example.com and youtube.com open, and you close the last tab of example.com, the trackers that both sites share are kept (because youtube.com is still using them), but orphaned third-party cookies are cleaned up.

## Why you want this

- Less tracking. Cookies used by ad networks and analytics are removed as soon as you leave a site.
- Cleaner browser. Fewer stale cookies means less surprise when a site remembers things you thought it forgot.
- No surprises. First-party cookies of your open tabs are never touched.

## Features

- Automatic cleanup triggered on tab close.
- Preserves cookies of any site you still have open.
- Enable/disable from the popup or the options page.
- Optional desktop notification after each cleanup.
- Statistics: total cookies cleaned, last site cleaned, and a detailed table of the cookies removed in the most recent cleanup (domain, name, path, `SameSite`, `Secure`, session, partitioned — values are never stored).
- Open source: read the code, audit the privacy claims.
- Available in English and Spanish.

## What we do NOT do

- We do not collect, store, transmit, or sell any data.
- We do not track your browsing.
- We do not load remote code.
- We do not modify the pages you visit.
- We do not show ads.

## Permissions, in plain English

- cookies, tabs, storage, notifications, <all_urls> — all used solely to deliver the described functionality. See the privacy policy for the full breakdown.

## Open source & privacy

Source code: public repository (link below).
Privacy policy: https://deucarion.github.io/cookie-autoclean/privacy/

Made in Spain.
```

### Category
Productivity **or** Privacy & Security (use Privacy & Security — better fit)

### Language
English (United States)

---

## 🇪🇸 Español (secondary)

### Resumen corto (≤132 caracteres)

```
Elimina automáticamente las cookies de terceros al cerrar la última pestaña de un sitio. Sin recopilación de datos.
```

(108 caracteres)

### Descripción larga

```
Cookie AutoClean elimina las cookies de terceros de tu navegador de forma automática — pero solo en el momento en que dejas de usar un sitio.

## Cómo funciona

Cuando cierras una pestaña, la extensión comprueba si hay alguna otra pestaña abierta del mismo sitio. Si no la hay — es decir, si realmente has terminado con ese sitio — elimina las cookies de terceros que ese sitio había dejado, conservando las cookies de cualquier sitio que aún tengas abierto.

Por ejemplo: si tienes example.com y youtube.com abiertos, y cierras la última pestaña de example.com, los rastreadores que ambos sitios comparten se conservan (porque youtube.com los sigue usando), pero las cookies de terceros huérfanas se eliminan.

## Por qué te interesa

- Menos seguimiento. Las cookies de redes publicitarias y analítica se eliminan en cuanto sales del sitio.
- Navegador más limpio. Menos cookies caducadas significan menos sorpresas cuando un sitio "recuerda" cosas.
- Sin sorpresas. Las cookies de primera parte de tus pestañas abiertas nunca se tocan.

## Funcionalidades

- Limpieza automática al cerrar pestañas.
- Conserva las cookies de cualquier sitio que aún tengas abierto.
- Activar/desactivar desde el popup o la página de opciones.
- Notificación de escritorio opcional tras cada limpieza.
- Estadísticas: total de cookies eliminadas, último sitio limpiado y tabla detallada de las cookies eliminadas en la última limpieza (dominio, nombre, ruta, `SameSite`, `Secure`, sesión, particionada — los valores nunca se almacenan).
- Código abierto: audita las afirmaciones de privacidad.
- Disponible en español e inglés.

## Lo que NO hacemos

- No recopilamos, almacenamos, transmitimos ni vendemos datos.
- No rastreamos tu navegación.
- No cargamos código remoto.
- No modificamos las páginas que visitas.
- No mostramos anuncios.

## Permisos, en lenguaje claro

- cookies, tabs, storage, notifications, <all_urls> — todos se usan exclusivamente para la funcionalidad descrita. Consulta la política de privacidad para el desglose completo.

## Código abierto y privacidad

Código fuente: repositorio público (enlace abajo).
Política de privacidad: https://deucarion.github.io/cookie-autoclean/privacy/

Hecho en España.
```

### Categoría
Privacidad y seguridad

### Idioma
Español (España)

---

## Justificación de permisos para el revisor (Dashboard → Privacy practices)

Copia y pega estos textos en los campos de justificación:

- **cookies**: "Required to read and remove third-party cookies from the user's browser as part of the core functionality. The extension does not read cookie values; it only inspects the domain, name, path, and secure attribute to decide which cookies to remove."

- **tabs**: "Required to determine whether the user has other tabs open on the same first-party domain. The extension only reads the URL of open tabs to compute the registrable domain (eTLD+1); it does not read page content, history, or form data."

- **storage**: "Required to persist user preferences (extension on/off, notification on/off) and local statistics (total cookies cleaned, last cleaned site, timestamp, and a short list of metadata for the cookies removed in the most recent cleanup — domain, name, path, `SameSite`, `Secure`, session, partition info). Stored via the standard chrome.storage API. The cookie values themselves are NEVER stored. Never transmitted to any server."

- **notifications**: "Optional. Used to inform the user when a cleanup has been performed, only if the user has enabled the notification setting in the options page. The extension is fully functional with notifications disabled."

- **`<all_urls>`**: "Required because the extension must be able to operate on any website the user visits, not just a predefined allowlist. The user can close the last tab of any site at any time, and the extension must be able to inspect that site's cookies. The permission is exercised only on the closed tab's domain and never on pages actively being viewed by content scripts (this extension has no content scripts)."

---

## Capturas de pantalla necesarias

1. **Popup principal** (1280×800) — El toggle activado, contador de cookies eliminadas visible, badge "Enabled" en verde.
2. **Popup desactivado** (1280×800) — El toggle apagado, badge "Disabled" en rojo. Sirve para mostrar el control de activación.
3. **Página de opciones** (1280×800) — Mostrando las dos switches y el panel de estadísticas con datos de ejemplo.
4. **Notificación nativa** (opcional, 1280×800) — Captura de la notificación del sistema tras una limpieza, con el icono y el texto.
5. **Flujo en uso** (opcional, 1280×800) — Antes/después de cerrar una pestaña con muchas cookies de terceros.

> Las capturas deben ser reales, no mockups. Para tomarlas: carga la extensión, navega a un sitio con trackers, espera a que se acumulen cookies, abre DevTools → Application → Cookies para tener datos que mostrar, captura pantallas reales.

---

## Icono promocional

- Tamaño: **440×280** PNG
- Archivo: `docs/store/promo-440x280.png`
- Diseño: galleta sobre fondo degradado azul con el nombre "Cookie AutoClean" a la derecha.

## Icono de la extensión

- 16×16, 48×48, 128×128 — ya incluidos en `icons/`

---

## Checklist final antes de enviar

- [ ] Cuenta de desarrollador creada (5 USD pagados, verificada)
- [ ] Política de privacidad subida y URL pública funcional
- [ ] Capturas de pantalla listas (mínimo 1, recomendado 3)
- [ ] Icono promocional 440×280 listo
- [ ] Zip de la extensión generado (cookie-autoclean-1.3.0.zip o versión actualizada)
- [x] Email de contacto actualizado en la política de privacidad (`deucarion@proton.me`)
- [x] URL de la política de privacidad real: `https://deucarion.github.io/cookie-autoclean/privacy/`
- [ ] Categoría, idioma, descripción revisados
- [ ] Cuestionario de Privacy practices rellenado con las justificaciones de arriba
- [ ] Versión del manifest.json correcta
