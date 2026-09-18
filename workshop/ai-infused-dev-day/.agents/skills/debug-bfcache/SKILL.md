---
name: debug-bfcache
description: Automates testing, debugging, and optimization of the Back/Forward Cache (BfCache) for a web page. It programmatically replicates the Chrome DevTools Application panel's "Test back/forward cache" feature and extracts actionable blockers using the `notRestoredReasons` API.
---

## What is Back/forward cache (bfCache) and why it matters

Back/forward cache (or bfcache) is a browser optimization that enables instant back and forward navigation. It significantly improves the browsing experience, especially for users with slower networks or devices. Because bfcache works with browser-managed navigations, it doesn't work for "soft navigations" within a single-page app (SPA). However, bfcache can still help when going back to an SPA rather than doing a full re-initialisation of that app again from the start.

## Debugging Workflow

When tasked to "Test/Debug BfCache for [URL]", the agent must execute the following 3 steps sequentially:

### Step 1: Establish the Baseline Setup
Load the target URL and inject a tracking script to monitor the `pageshow` event.

1. **Tool Call (`navigate`):** Load the target `[URL]` and `wait_for` 6 seconds.
2. **Tool Call (`evaluate`):** Inject the tracker:

```javascript
   sessionStorage.removeItem('bfcache_tested_status');
   window.addEventListener('pageshow', (event) => {
       // event.persisted is true ONLY if restored from BfCache
       sessionStorage.setItem('bfcache_tested_status', event.persisted ? 'HIT' : 'MISS');
   });
   ```

### Step 2: Simulate Navigation Cycle

1. **Tool Call (`navigate`):** to the following page `about:blank` and `wait_for` 2 seconds
2. **Tool Call (`evaluate`):** to trigger back navigation

```javascript
  window.history.back();
```
### Step 3: Extract Diagnostics
Check if the cache was a HIT or MISS, and extract the exact blocking reasons tree.

1. **Tool Call (`evaluate`):** to evaluate the status

```javascript
(() => {
       const status = sessionStorage.getItem('bfcache_tested_status') || 'unknown';
       const navEntry = performance.getEntriesByType('navigation')[0];
       
       return {
           bfcache_status: status,
           blockers: (navEntry && navEntry.notRestoredReasons) ? navEntry.notRestoredReasons : null
       };
   })();
   ```

## 📊 Analysis & Remediation Matrix

Analyze the extracted `notRestoredReasons` diagnostics to determine the optimization status. 

* ✅ **If `bfcache_status === 'HIT'`:** The page is successfully optimized for the Back/Forward Cache. Advise the developer to ensure stale data (e.g., shopping cart counts, user auth states) is updated by triggering a data fetch inside the `pageshow` event when `event.persisted === true`.
* ❌ **If `bfcache_status === 'MISS'`:** Map the extracted `blockers` tree against the rules below to generate a specific remediation report.

### 🔴 Actionable Blockers (Developer Must Fix)

| Blocker Trigger | The Problem | Optimization Advice |
| :--- | :--- | :--- |
| `unload-listener` | Page or third-party script uses `window.addEventListener('unload')`. Browsers will **never** cache a page with this listener. | Remove all `unload` listeners. Replace them with modern alternatives like `pagehide` or `visibilitychange` events, which are fully BfCache compatible. |
| `cache-control-no-store` | The server returned a `Cache-Control: no-store` HTTP header for the HTML document, which is treated as a strict privacy directive. | If the page data isn't highly sensitive, change this to `Cache-Control: no-cache` (which allows the browser to store the page, but requires standard reloads to revalidate). |
| `websocket`, `webrtc`, or `indexeddb-transaction` | The browser cannot safely pause active, persistent connections in the background. | Explicitly close these connections inside a `pagehide` event listener. Cleanly re-open them inside a `pageshow` listener when returning to the page. |
| `fetch` or `xhr` | A network request (like an API call or analytics ping) was still in-flight when the user navigated away. | If it's an analytics beacon, swap to `navigator.sendBeacon()` or `fetch` with the `{ keepalive: true }` flag, allowing the request to complete without blocking the cache. |

### 🟡 External / Environmental Blockers

| Blocker Trigger | The Problem | Optimization Advice |
| :--- | :--- | :--- |
| Found in `children` array | A cross-origin `iframe` (e.g., an ad or embedded widget) contains an actionable blocker. | The parent frame cannot control cross-origin iframes. Conditionally lazy-load the iframe, or reach out to the third-party vendor to fix their scripts. |
| `related-active-contents` | The page was opened via another tab maintaining an active `window.opener` reference. | Ensure that external links pointing to the site use the `rel="noopener"` attribute. |
| `extensions` | A Chrome extension injected a script that blocked the cache. | Ignore for application code. Re-run the test in a clean browser profile or Incognito mode to verify baseline behavior. |