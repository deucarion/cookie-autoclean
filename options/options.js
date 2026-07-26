// options/options.js
import { applyI18n } from '../lib/i18n.js';
import { getSettings, getStats, resetStats } from '../lib/state.js';

const $ = (id) => document.getElementById(id);
const enableToggle = $('enableToggle');
const notifyToggle = $('notifyToggle');
const totalCleaned = $('totalCleaned');
const lastSite = $('lastSite');
const lastTime = $('lastTime');
const lastKept = $('lastKept');
const resetBtn = $('resetBtn');

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString();
}

async function refresh() {
  const settings = await getSettings();
  enableToggle.checked = !!settings.enabled;
  notifyToggle.checked = !!settings.notify;

  const stats = await getStats();
  totalCleaned.textContent = stats.totalCleaned || 0;
  lastSite.textContent = stats.lastEvent?.firstParty || '—';
  lastTime.textContent = formatTime(stats.lastEvent?.at);
  lastKept.textContent = stats.lastEvent?.kept ?? 0;
}

enableToggle.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: enableToggle.checked });
});
notifyToggle.addEventListener('change', () => {
  chrome.storage.sync.set({ notify: notifyToggle.checked });
});
resetBtn.addEventListener('click', async () => {
  await resetStats();
  refresh();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' || area === 'local') refresh();
});

applyI18n();
refresh();
