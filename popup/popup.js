// popup/popup.js
import { applyI18n } from '../lib/i18n.js';
import { getSettings, getStats } from '../lib/state.js';

const $ = (id) => document.getElementById(id);

const enableToggle = $('enableToggle');
const status = $('status');
const totalCleaned = $('totalCleaned');
const lastSite = $('lastSite');
const openOptions = $('openOptions');

function setStatus(enabled) {
  if (enabled) {
    status.textContent = chrome.i18n.getMessage('popup_enabled');
    status.className = 'badge enabled';
  } else {
    status.textContent = chrome.i18n.getMessage('popup_disabled');
    status.className = 'badge disabled';
  }
}

async function refresh() {
  const settings = await getSettings();
  enableToggle.checked = !!settings.enabled;
  setStatus(settings.enabled);

  const stats = await getStats();
  totalCleaned.textContent = stats.totalCleaned || 0;
  lastSite.textContent = stats.lastEvent?.firstParty || '—';
}

enableToggle.addEventListener('change', async () => {
  await chrome.storage.sync.set({ enabled: enableToggle.checked });
  setStatus(enableToggle.checked);
});

openOptions.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// React to live changes (popup open while another tab closes).
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.enabled) {
    enableToggle.checked = !!changes.enabled.newValue;
    setStatus(enableToggle.checked);
  }
  if (area === 'local' && (changes.totalCleaned || changes.lastEvent)) {
    refresh();
  }
});

applyI18n();
refresh();
