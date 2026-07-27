# Privacy Policy — Cookie AutoClean

**Effective date:** 2026-07-27
**Last updated:** 2026-07-27
**Extension version:** 1.1.2

Cookie AutoClean ("the extension", "we", "our") is a browser extension for Google Chrome and Chromium-based browsers. This page explains what data the extension handles, why, and what we do with it.

## Summary

**The extension does not collect, store, transmit, sell, or share any user data.** All operations happen locally in your browser. The extension accesses cookies solely to delete third-party cookies from your browser, as you have requested. No cookie data, browsing history, or any other information leaves your device.

## What data the extension accesses

| Data | Why | Where it goes |
|---|---|---|
| Cookies stored by your browser | To identify and remove third-party cookies after you close the last tab of a website | Stays in your browser. Deleted locally. |
| URLs of your open tabs | To determine whether other tabs are open on the same first-party domain, so the extension knows whether to trigger a cleanup | Read transiently. Never stored or transmitted. |
| Your preferences (extension on/off, notifications on/off) | To remember your settings between sessions | Stored locally in `chrome.storage.sync` (synced between your devices if Chrome Sync is enabled). Never transmitted to any server. |
| Statistics (total cookies cleaned, last cleaned site) | To display them in the popup and options page | Stored locally in `chrome.storage.local`. Never transmitted to any server. |

## What the extension does NOT do

- We do not collect personal information.
- We do not track your browsing activity.
- We do not use cookies or any other mechanism to identify you.
- We do not transmit any data to remote servers, analytics platforms, or third parties.
- We do not sell, share, or rent user data.
- We do not display advertising.
- We do not run remote code or load external scripts.
- We do not modify the content of web pages you visit.
- We do not read or transmit form data, passwords, or any other sensitive information.

## How the extension works

When you close a browser tab, the extension:

1. Reads the URL of the closed tab from a local cache.
2. Determines the registrable domain (eTLD+1) of that URL, e.g. `shop.example.com` becomes `example.com`.
3. Checks whether any other tab you have open shares that same registrable domain.
4. If none, it iterates over the cookies in your browser and removes those that are **third-party** relative to that domain, while preserving cookies that are first-party to any site you still have open.

The extension never reads the content of cookies; it only inspects their domain, name, path, and security attributes to decide which ones to remove.

## Permissions, in plain language

The extension requests the following Chrome permissions. Each is used only for the purpose described:

- **`cookies`** — Read and remove cookies from your browser. Required for the core functionality.
- **`tabs`** — List your open tabs to determine whether other tabs are open on the same site. The extension reads tab URLs only; it does not read page content, history, or form data.
- **`storage`** — Save your settings (on/off, notification preference) and local statistics. Stored via the standard `chrome.storage` API.
- **`notifications`** — Show an optional desktop notification after a cleanup, only if you have enabled that setting in the options page.
- **`<all_urls>` (host permission)** — Required because the extension must be able to operate on any website you visit, not just a predefined list. You can close the last tab of any site at any time.

## Your controls

- You can disable the extension at any time from `chrome://extensions/`.
- You can uninstall it from the same page; all locally stored settings and statistics are removed with it.
- You can clear the statistics counter from the options page without uninstalling.
- The extension is fully functional with notifications disabled, if you prefer no desktop interruptions.

## Children

The extension is not directed at children under the age of 13, and we do not knowingly collect any data from children. Because we do not collect any data at all, this policy applies equally to all users regardless of age.

## Changes to this policy

If we make material changes to this policy, we will:

1. Update the "Last updated" date at the top of this page.
2. Mention the change in the `CHANGELOG.md` of the extension's public repository.
3. Bump the extension's version number and submit an update to the Chrome Web Store.

Minor editorial changes (typos, clarifications that do not alter meaning) may be made without a version bump.

## Open source

The extension's source code is publicly available. You can audit it to verify the claims in this policy. See the project repository link in the Chrome Web Store listing.

## Contact

If you have questions, concerns, or requests regarding this privacy policy or the extension's data practices, please contact:

**Email:** deucarion@proton.me

We aim to respond within 7 business days.

## Jurisdiction

This extension is provided from Spain / European Union and is designed to comply with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), among other applicable privacy regulations. Because no personal data is collected, most rights under these regulations (access, deletion, portability) are satisfied automatically by the local-only design of the extension.

---

*This privacy policy is provided in markdown so it can be hosted on GitHub Pages or any static site. It is written in plain language; no legal advice is implied or intended.*
