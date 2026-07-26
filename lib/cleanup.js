// lib/cleanup.js
// Cookie cleanup logic. MV3-friendly: batched, idempotent, with safe errors.

import { getRegistrableDomain, isFirstParty } from './domain.js';

const CHUNK_SIZE = 50;

/** Build a URL string suitable for chrome.cookies.remove from a cookie object. */
function buildCookieUrl(cookie) {
  const scheme = cookie.secure ? 'https' : 'http';
  const host = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
  return `${scheme}://${host}${cookie.path || '/'}`;
}

/**
 * Returns the set of registrable domains (eTLD+1) of all currently open tabs.
 * Used to know which first-parties are still active and must keep their cookies.
 */
export async function getActiveFirstParties() {
  const tabs = await chrome.tabs.query({});
  const set = new Set();
  for (const tab of tabs) {
    if (!tab.url) continue;
    if (!/^https?:/i.test(tab.url)) continue;
    const fp = getRegistrableDomain(tab.url);
    if (fp) set.add(fp);
  }
  return set;
}

/**
 * Delete all third-party cookies for the given closed first-party,
 * while preserving cookies that are still in use by any other open tab.
 *
 * @param {string} closedFirstParty - registrable domain of the tab that just closed.
 * @returns {Promise<{deleted: number, kept: number, total: number}>}
 */
export async function deleteThirdPartyCookies(closedFirstParty) {
  if (!closedFirstParty) return { deleted: 0, kept: 0, total: 0 };

  const activeFirstParties = await getActiveFirstParties();
  const allCookies = await chrome.cookies.getAll({});

  const toDelete = [];
  let kept = 0;

  for (const cookie of allCookies) {
    if (!cookie.domain) { kept++; continue; }

    // Keep first-party cookies of the closed site (defensive — shouldn't be third-party
    // candidates) and first-party cookies of any other still-open site.
    let inUse = false;
    if (isFirstParty(cookie.domain, closedFirstParty)) inUse = true;
    else {
      for (const fp of activeFirstParties) {
        if (isFirstParty(cookie.domain, fp)) { inUse = true; break; }
      }
    }

    if (inUse) kept++;
    else toDelete.push(cookie);
  }

  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += CHUNK_SIZE) {
    const batch = toDelete.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      batch.map(c => chrome.cookies.remove({
        url: buildCookieUrl(c),
        name: c.name,
        storeId: c.storeId
      }))
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value !== null) deleted++;
    }
  }

  return { deleted, kept, total: allCookies.length };
}
