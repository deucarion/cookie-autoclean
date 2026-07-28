// lib/state.js
// Wrappers around chrome.storage with sensible defaults.

const SYNC_DEFAULTS = {
  enabled: true,
  notify: false
};

const LOCAL_DEFAULTS = {
  totalCleaned: 0,
  lastEvent: null,      // { firstParty, deleted, kept, at }
  lastDeleted: []       // array of summarized cookies from the most recent cleanup
};

// Cap the persisted list so a pathological run (hundreds of cookies on a heavy
// site) can't blow the chrome.storage.local quota. 200 is plenty for a debug
// view; if a cleanup exceeds that, we keep the FIRST ones and drop the tail.
const LAST_DELETED_MAX = 200;

export async function getSettings() {
  const sync = await chrome.storage.sync.get(SYNC_DEFAULTS);
  return { ...SYNC_DEFAULTS, ...sync };
}

export async function setEnabled(enabled) {
  await chrome.storage.sync.set({ enabled: !!enabled });
}

export async function setNotify(notify) {
  await chrome.storage.sync.set({ notify: !!notify });
}

export async function getStats() {
  const local = await chrome.storage.local.get(LOCAL_DEFAULTS);
  return { ...LOCAL_DEFAULTS, ...local };
}

export async function addCleaned(count) {
  if (!count || count <= 0) return;
  const { totalCleaned = 0 } = await chrome.storage.local.get('totalCleaned');
  await chrome.storage.local.set({ totalCleaned: totalCleaned + count });
}

export async function setLastEvent(event) {
  await chrome.storage.local.set({ lastEvent: event });
}

/**
 * Persist the list of cookies removed in the most recent cleanup.
 * Accepts an empty array to clear the list.
 */
export async function setLastDeleted(list) {
  const arr = Array.isArray(list) ? list : [];
  const trimmed = arr.slice(0, LAST_DELETED_MAX);
  await chrome.storage.local.set({ lastDeleted: trimmed });
}

export async function resetStats() {
  await chrome.storage.local.set({
    totalCleaned: 0,
    lastEvent: null,
    lastDeleted: []
  });
}
