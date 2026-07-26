// lib/domain.js
// Registrable domain (eTLD+1) extraction. Simplified implementation
// covering the most common multi-part public suffixes. For full accuracy
// consider bundling a Public Suffix List library (e.g. tldts).

const MULTI_PART_TLDS = new Set([
  // UK
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'me.uk', 'net.uk', 'sch.uk',
  // AU / NZ
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
  'co.nz', 'net.nz', 'org.nz', 'govt.nz', 'ac.nz', 'school.nz',
  // Japan / Korea
  'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp',
  'co.kr', 'or.kr', 'ac.kr', 'go.kr', 'ne.kr',
  // South America
  'com.br', 'net.br', 'org.br', 'com.ar', 'com.mx', 'com.co', 'com.pe',
  'com.ve', 'com.cl', 'com.uy',
  // South / Southeast Asia
  'co.in', 'net.in', 'org.in', 'gov.in', 'ac.in',
  'com.sg', 'com.my', 'com.ph', 'com.id', 'com.hk', 'com.tw', 'com.cn',
  // Africa
  'co.za', 'org.za', 'ac.za', 'gov.za',
  // Europe
  'co.za', 'com.tr', 'com.gr', 'com.pt', 'com.pl', 'co.il',
  // Misc
  'co.ke', 'com.ng', 'com.eg', 'com.sa', 'com.ae'
]);

/**
 * Extract the registrable domain (eTLD+1) from a URL string or hostname.
 * Returns null for empty / invalid / local addresses.
 */
export function getRegistrableDomain(input) {
  if (!input || typeof input !== 'string') return null;

  let hostname;
  try {
    hostname = new URL(input).hostname;
  } catch {
    hostname = input;
  }
  hostname = hostname.toLowerCase().trim().replace(/\.+$/, '');

  if (!hostname) return null;
  // Skip local / file / dev addresses
  if (
    hostname === 'localhost' ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || // IPv4
    hostname.includes(':') ||                    // IPv6
    !hostname.includes('.')
  ) {
    return null;
  }

  const parts = hostname.split('.');
  if (parts.length < 2) return hostname;
  if (parts.length === 2) return hostname;

  const last2 = parts.slice(-2).join('.');
  if (MULTI_PART_TLDS.has(last2) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }
  return last2;
}

/**
 * Returns true if a cookie with the given `cookieDomain` is
 * first-party relative to the registrable domain `registrableDomain`.
 *
 * A cookie is first-party when its domain is equal to the registrable
 * domain, OR a parent of it (e.g. cookie ".example.com" is first-party
 * for "shop.example.com").
 */
export function isFirstParty(cookieDomain, registrableDomain) {
  if (!cookieDomain || !registrableDomain) return false;
  const cd = cookieDomain.toLowerCase().startsWith('.')
    ? cookieDomain.toLowerCase().slice(1)
    : cookieDomain.toLowerCase();
  const rd = registrableDomain.toLowerCase();
  if (cd === rd) return true;
  if (rd.endsWith('.' + cd)) return true;
  return false;
}
