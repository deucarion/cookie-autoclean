// lib/i18n.js
// Tiny helper to apply chrome.i18n messages to HTML pages.

export function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
    if (msg) el.placeholder = msg;
  });
  const titleEl = document.querySelector('[data-i18n-title]');
  if (titleEl) {
    const msg = chrome.i18n.getMessage(titleEl.dataset.i18nTitle);
    if (msg) document.title = msg;
  } else {
    const t = chrome.i18n.getMessage('options_title');
    if (t) document.title = t;
  }
}
