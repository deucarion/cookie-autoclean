// lib/cleanup.js
// Cookie cleanup logic. MV3-friendly: batched, idempotent, with safe errors.

import { getRegistrableDomain, isFirstParty } from './domain.js';
import { getSettings } from './state.js';

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
 * Reduce a chrome.cookies.Cookie to a small, display-safe record.
 * We intentionally drop the cookie `value` to avoid storing secrets
 * (session tokens, OAuth codes, etc.) in chrome.storage.local.
 */
function summarizeCookie(cookie) {
  return {
    name: cookie.name,
    domain: cookie.domain,
    path: cookie.path,
    sameSite: cookie.sameSite,         // 'no_restriction' | 'lax' | 'strict' | 'unspecified'
    secure: !!cookie.secure,
    httpOnly: !!cookie.httpOnly,
    storeId: cookie.storeId,
    session: !cookie.expirationDate,   // true = session cookie (no expires)
    expires: cookie.expirationDate || null,
    partitioned: !!(cookie.partitionKey && cookie.partitionKey.topLevelSite),
    partitionTopLevelSite:
      (cookie.partitionKey && cookie.partitionKey.topLevelSite) || null
  };
}

/**
 * Delete all third-party cookies for the given closed first-party,
 * while preserving cookies that are still in use by any other open tab.
 *
 * @param {string} closedFirstParty - registrable domain of the tab that just closed.
 * @returns {Promise<{deleted: number, kept: number, total: number, deletedList: Array}>}
 *   `deletedList` is a per-cookie summary (no values) of what was actually removed,
 *   in the order the cookies were processed. Its length equals `deleted` unless a
 *   removal call failed (e.g. cookie had already disappeared) — in that case the
 *   count and the list are kept consistent by only recording successful removals.
 */
export async function deleteThirdPartyCookies(closedFirstParty) {
  if (!closedFirstParty) return { deleted: 0, kept: 0, total: 0, deletedList: [] };

  const [settings, activeFirstParties, allCookies] = await Promise.all([
    getSettings(),
    getActiveFirstParties(),
    chrome.cookies.getAll({})
  ]);

  // If the keepSessionCookies option is on, pre-compute the set of domains
  // that have at least one session cookie. Any cookie in those domains is
  // protected, not just the session cookie itself. This is a safety net for
  // sites that are actively using session state.
  const sessionProtectedDomains = new Set();
  if (settings.keepSessionCookies) {
    for (const c of allCookies) {
      if (!c.expirationDate && c.domain) sessionProtectedDomains.add(c.domain);
    }
  }

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

    // Domain-level session preservation: if any cookie in this domain is a
    // session cookie, keep ALL cookies in this domain — the user is actively
    // using the site, and nuking a non-session sibling of a session cookie
    // is more likely to break things than to protect privacy.
    if (!inUse && sessionProtectedDomains.has(cookie.domain)) {
      inUse = true;
    }

    // Mirror Chrome's "block third-party cookies" behaviour: only delete cookies
    // that Chrome itself would consider true third-party (SameSite=None without
    // Partitioned). Lax/Strict cookies are first-party-eligible and must survive
    // the cleanup so SSO sessions (e.g. Google on YouTube) stay intact. Same goes
    // for partitioned cookies — they are already scoped to a first-party site.
    if (!inUse) {
      const isTrueThirdParty =
        cookie.sameSite === 'no_restriction' &&
        !(cookie.partitionKey && cookie.partitionKey.topLevelSite);
      if (!isTrueThirdParty) inUse = true;
    }

    if (inUse) kept++;
    else toDelete.push(cookie);
  }

  let deleted = 0;
  const deletedList = [];
  for (let i = 0; i < toDelete.length; i += CHUNK_SIZE) {
    const batch = toDelete.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      batch.map(c => chrome.cookies.remove({
        url: buildCookieUrl(c),
        name: c.name,
        storeId: c.storeId
      }))
    );
    for (let r = 0; r < results.length; r++) {
      const res = results[r];
      if (res.status === 'fulfilled' && res.value !== null) {
        deleted++;
        deletedList.push(summarizeCookie(batch[r]));
      }
    }
  }

  return { deleted, kept, total: allCookies.length, deletedList };
}
