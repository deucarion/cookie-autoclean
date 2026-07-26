// lib/state.js
// Wrappers around chrome.storage with sensible defaults.

const SYNC_DEFAULTS = {
  enabled: true,
  notify: false
};

const LOCAL_DEFAULTS = {
  totalCleaned: 0,
  lastEvent: null  // { firstParty, deleted, kept, at }
};

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

export async function resetStats() {
  await chrome.storage.local.set({ totalCleaned: 0, lastEvent: null });
}
