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

// Deleted-cookies view
const deletedContext = $('deletedContext');
const deletedWrap = $('deletedWrap');
const deletedTbody = $('deletedTbody');
const deletedEmpty = $('deletedEmpty');
const deletedTruncated = $('deletedTruncated');

// Must match LAST_DELETED_MAX in lib/state.js. We can't import it cleanly
// (state.js doesn't export it), so we duplicate the constant here. If it
// ever changes in state.js, update it here too.
const LAST_DELETED_MAX = 200;

const SAME_SITE_LABEL = {
  no_restriction: 'None',
  lax: 'Lax',
  strict: 'Strict',
  unspecified: '—'
};

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString();
}

function sameSiteLabel(value) {
  if (value === null || value === undefined) return '—';
  return SAME_SITE_LABEL[value] || value;
}

function renderDeletedList(list, lastEvent) {
  deletedTbody.textContent = '';

  const hasList = Array.isArray(list) && list.length > 0;

  // Context line: site + timestamp of the cleanup that produced this list.
  if (hasList && lastEvent && lastEvent.firstParty) {
    const when = formatTime(lastEvent.at);
    const tmpl = chrome.i18n.getMessage('options_deleted_context') ||
      'Removed when you closed $SITE$ at $WHEN$.';
    deletedContext.textContent = tmpl
      .replace('$SITE$', lastEvent.firstParty)
      .replace('$WHEN$', when);
  } else {
    deletedContext.textContent = '';
  }

  if (!hasList) {
    deletedWrap.hidden = true;
    deletedEmpty.hidden = false;
    return;
  }

  deletedEmpty.hidden = true;
  deletedWrap.hidden = false;

  // Build rows in a fragment for one-shot insertion.
  const frag = document.createDocumentFragment();
  for (const c of list) {
    const tr = document.createElement('tr');

    const cells = [
      c.domain || '',
      c.name || '',
      c.path || '/',
      sameSiteLabel(c.sameSite),
      c.secure ? '✓' : '',
      c.session ? '✓' : '',
      c.partitioned
        ? (c.partitionTopLevelSite ? '✓ ' + c.partitionTopLevelSite : '✓')
        : ''
    ];

    for (const cell of cells) {
      const td = document.createElement('td');
      // textContent is auto-escaping, so cookie names like "<script>" or
      // quotes render as plain text — no innerHTML needed.
      td.textContent = cell;
      tr.appendChild(td);
    }
    frag.appendChild(tr);
  }
  deletedTbody.appendChild(frag);

  // If the list hit the cap in state.js, warn the user we only show a slice.
  if (list.length >= LAST_DELETED_MAX && lastEvent && lastEvent.deleted > list.length) {
    const tmpl = chrome.i18n.getMessage('options_deleted_truncated') ||
      'Showing the first $SHOWN$ of $TOTAL$ cookies removed.';
    deletedTruncated.textContent = tmpl
      .replace('$SHOWN$', String(list.length))
      .replace('$TOTAL$', String(lastEvent.deleted));
    deletedTruncated.hidden = false;
  } else {
    deletedTruncated.hidden = true;
  }
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

  renderDeletedList(stats.lastDeleted || [], stats.lastEvent);
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
