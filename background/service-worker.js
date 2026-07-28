// background/service-worker.js
// Service Worker for Cookie AutoClean. MV3, module type.
// Listens to tab removal; if no other tab of the same first-party
// remains, deletes third-party cookies while preserving those still
// in use by other open tabs.

import { getRegistrableDomain } from '../lib/domain.js';
import { deleteThirdPartyCookies, getActiveFirstParties } from '../lib/cleanup.js';
import { getSettings, addCleaned, setLastEvent, setLastDeleted } from '../lib/state.js';

// Cache of tabId -> last known URL. The tab object is gone by the time
// onRemoved fires, so we capture URLs as tabs navigate and read them here.
const tabUrlCache = new Map();

// Capture URL on every navigation / load.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    tabUrlCache.set(tabId, changeInfo.url);
  } else if (tab && tab.url) {
    tabUrlCache.set(tabId, tab.url);
  }
});

// Capture URL as soon as a tab is created (best effort).
chrome.tabs.onCreated.addListener((tab) => {
  if (tab && tab.url) tabUrlCache.set(tab.id, tab.url);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const url = tabUrlCache.get(tabId);
  tabUrlCache.delete(tabId);
  if (!url || !/^https?:/i.test(url)) return;

  let settings;
  try { settings = await getSettings(); }
  catch (e) { return; }

  if (!settings.enabled) return;

  const firstParty = getRegistrableDomain(url);
  if (!firstParty) return;

  // Are any other open tabs on the same first-party?
  const active = await getActiveFirstParties();
  if (active.has(firstParty)) return; // still in use, keep everything

  // Clean up. deleteThirdPartyCookies() already excludes first-party
  // cookies of other still-open sites, so we just call it.
  let result;
  try { result = await deleteThirdPartyCookies(firstParty); }
  catch (e) {
    console.warn('[Cookie AutoClean] cleanup failed:', e);
    return;
  }

  if (result.deleted > 0) {
    await addCleaned(result.deleted);
  }
  await setLastEvent({
    firstParty,
    deleted: result.deleted,
    kept: result.kept,
    at: Date.now()
  });
  // Persist the list of removed cookies so the options page can show them.
  // Always set (even if empty) so a previous run's list doesn't linger when
  // the latest cleanup happened to remove nothing.
  await setLastDeleted(result.deletedList || []);

  if (result.deleted > 0) {
    console.log(
      `[Cookie AutoClean] Closed last tab of ${firstParty}. ` +
      `Removed ${result.deleted} third-party cookies (kept ${result.kept}).`
    );

    if (settings.notify) {
      try {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/128.png'),
          title: chrome.i18n.getMessage('notif_title'),
          message: chrome.i18n.getMessage('notif_message', [
            String(result.deleted),
            firstParty
          ]),
          priority: 0
        });
      } catch (e) {
        console.warn('[Cookie AutoClean] notification failed:', e);
      }
    }
  }
});

// Keep the cache from growing forever in pathological cases.
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  const url = tabUrlCache.get(removedTabId);
  if (url) {
    tabUrlCache.set(addedTabId, url);
    tabUrlCache.delete(removedTabId);
  }
});

// On install / update: make sure defaults exist.
chrome.runtime.onInstalled.addListener(async (details) => {
  await getSettings(); // initializes defaults via first read
  if (details.reason === 'install') {
    console.log('[Cookie AutoClean] Installed. Auto-cleaning is enabled by default.');
  }
});
