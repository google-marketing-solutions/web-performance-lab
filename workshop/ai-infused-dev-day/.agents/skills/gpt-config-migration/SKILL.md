---
name: gpt-config-migration
description: >-
  Migrates Google Publisher Tag (GPT) implementations from legacy PubAdsService and Slot configuration methods to the centralized googletag.setConfig and Slot.setConfig APIs. Use when refactoring legacy GPT code (such as setTargeting, clearTargeting, setCategoryExclusion, clearCategoryExclusions, collapseEmptyDivs, setCollapseEmptyDiv, disableInitialLoad, enableSingleRequest, enableLazyLoad, setCentering, setLocation, setForceSafeFrame, setSafeFrameConfig, setClickUrl, updateTargetingFromMap, or legacy get/getTargeting methods), updating ad tag setups, or consolidating fragmented ad configuration into unified setConfig calls. Don't use for Google Mobile Ads (GMA) SDK setups.
---

# Google Publisher Tag (GPT) setConfig API Migration

## Description & Purpose

This skill guides the agent in migrating Google Publisher Tag (GPT) ad setups from legacy, fragmented configuration methods on `PubAdsService` and `Slot` objects to the centralized `googletag.setConfig()` and `Slot.setConfig()` APIs.

### Core Objectives
1. **Centralized & Declarative Configuration**: Replace scattered procedural setter calls (`setTargeting`, `setCategoryExclusion`, `collapseEmptyDivs`, etc.) with structured, declarative configuration objects for both page-level and slot-level settings.
2. **Atomic Batching & Performance**: Reduce method invocation overhead and prevent race conditions by batching configuration changes into unified `setConfig` calls.
3. **Fine-Grained Partial Updates & Resets**: Update features independently without overwriting unrelated settings, and explicitly clear individual keys or entire features by passing `null`.
4. **Frozen Configuration State**: Leverage the corresponding `getConfig()` API to inspect frozen, immutable snapshot objects of active settings, preventing unintended runtime state mutations.
5. **Future-Proofing**: Adopt the required foundation for modern GPT features (such as Publisher Provided Signals (`pps`), Privacy Treatments, and Auto-Refresh).

---

## Triggering Conditions

### When to Use
- Refactoring legacy `googletag.pubads().set*`, `enable*`, or `disable*` methods.
- Refactoring legacy `slot.set*` or `slot.updateTargetingFromMap` methods on `googletag.defineSlot()` instances.
- Consolidating scattered GPT configurations into declarative objects.
- Migrating legacy getter calls (`pubads().getTargeting()`, `slot.getTargeting()`, `getAttributeKeys()`, `isInitialLoadDisabled()`).
- Modernizing ad stacks to support Publisher Provided Signals (`pps`) or `privacyTreatments`.

### When NOT to Use
- Google Mobile Ads (GMA) SDK implementations for native Android or iOS mobile applications.
- Standalone Prebid.js or Amazon TAM/APS wrapper code unrelated to GPT slots.
- Ad Manager UI server-side configurations (trafficking, line items, yield groups, key-value schema definitions).

---

## Source of Truth Documentation

Always reference the official Google migration guide and API reference before refactoring:

* **Official Migration Guide**: [https://developers.google.com/publisher-tag/guides/config-migration](https://developers.google.com/publisher-tag/guides/config-migration)
* **GPT API Reference (`setConfig` & `getConfig`)**: [https://developers.google.com/publisher-tag/reference#googletag.setConfig](https://developers.google.com/publisher-tag/reference#googletag.setConfig)

> [!NOTE]
> When new GPT properties or experimental feature flags are introduced, query `https://developers.google.com/publisher-tag/guides/config-migration` using `read_url_content` or `curl` to confirm the latest schema definitions before modifying code.

---

## Standard Migration Workflow

Follow this sequential 6-step workflow when performing a codebase migration:

```text
Step 1: Audit Existing Codebase
 ├── Grep for legacy pubads() calls: pubads().set*, pubads().enable*, pubads().disable*
 ├── Grep for legacy slot calls: slot.setTargeting, slot.setCollapseEmptyDiv, slot.setCategoryExclusion, etc.
 └── Grep for legacy getters: getTargeting, getTargetingKeys, getAttributeKeys, isInitialLoadDisabled
Step 2: Check Pre-Flight Timing
 ├── Ensure googletag.cmd.push wrapper exists
 └── Verify setConfig execution order (must execute before enableServices() and display()/refresh())
Step 3: Consolidate Page-Level Settings
 └── Merge all scattered pubads().* setters into a unified googletag.setConfig({...}) call
Step 4: Refactor Slot-Level Settings
 └── Convert slot chained setters (setTargeting, setCollapseEmptyDiv, etc.) to slot.setConfig({...})
Step 5: Migrate Getters to getConfig()
 └── Replace legacy getter methods with googletag.getConfig() or slot.getConfig() (unwrapping results)
Step 6: Validate & Verify
 ├── Verify syntax and correct type signatures (arrays for categoryExclusion, enum strings for collapseDiv)
 ├── Ensure no legacy setters remain in active execution paths
 └── Validate via Google Publisher Console (URL?googfc=1 or googletag.openConsole())
```

---

## Migration Mapping Reference

### 1. Page-Level Configuration (`googletag.pubads().*` -> `googletag.setConfig({ ... })`)

| Feature | Legacy Method | Modern `googletag.setConfig` Replacement | Notes |
| :--- | :--- | :--- | :--- |
| **AdSense Attributes** | `pubads().set(k, v)` | `googletag.setConfig({ adsenseAttributes: { [k]: v } })` | Key-value dictionary |
| **Category Exclusion** | `pubads().setCategoryExclusion(label)` | `googletag.setConfig({ categoryExclusion: [label] })` | **Must be an Array of strings** |
| | `pubads().clearCategoryExclusions()` | `googletag.setConfig({ categoryExclusion: null })` | Passing `null` clears all exclusions |
| **Centering** | `pubads().setCentering(centerAds)` | `googletag.setConfig({ centering: centerAds })` | Boolean |
| **Collapse Empty Divs** | `pubads().collapseEmptyDivs(true)` | `googletag.setConfig({ collapseDiv: 'BEFORE_FETCH' })` | Enum string |
| | `pubads().collapseEmptyDivs(false)` | `googletag.setConfig({ collapseDiv: 'ON_NO_FILL' })` | Enum string |
| | *(Disable collapsing)* | `googletag.setConfig({ collapseDiv: 'DISABLED' })` | Enum string |
| **Initial Load** | `pubads().disableInitialLoad()` | `googletag.setConfig({ disableInitialLoad: true })` | Boolean |
| **Single Request (SRA)**| `pubads().enableSingleRequest()` | `googletag.setConfig({ singleRequest: true })` | Must run before `enableServices()` |
| **Lazy Loading** | `pubads().enableLazyLoad(config)` | `googletag.setConfig({ lazyLoad: config })` | Object with `fetchMarginPercent`, `renderMarginPercent`, `mobileScaling` |
| **Location** | `pubads().setLocation(address)` | `googletag.setConfig({ location: address })` | String |
| **SafeFrame** | `pubads().setForceSafeFrame(force)` | `googletag.setConfig({ safeFrame: { forceSafeFrame: force } })` | Object |
| | `pubads().setSafeFrameConfig(config)`| `googletag.setConfig({ safeFrame: config })` | Merges SafeFrame config object |
| **Targeting** | `pubads().setTargeting(key, value)` | `googletag.setConfig({ targeting: { [key]: value } })` | Value: string or array of strings |
| | `pubads().clearTargeting(key)` | `googletag.setConfig({ targeting: { [key]: null } })` | Clear single key with `null` |
| | `pubads().clearTargeting()` | `googletag.setConfig({ targeting: null })` | Clear all page targeting with `null` |
| **Video Ads** | `pubads().enableVideoAds()` | `googletag.setConfig({ videoAds: { enableVideoAds: true } })` | Object |
| | `pubads().setVideoContent(id, cms)` | `googletag.setConfig({ videoAds: { videoContentId: id, videoCmsId: cms } })` | Object |
| **Publisher Provided Signals** | *(Modern API)* | `googletag.setConfig({ pps: { taxa: [...] } })` | Configured directly via `setConfig` |
| **Privacy Treatments** | *(Modern API)* | `googletag.setConfig({ privacyTreatments: { ... } })` | Configured directly via `setConfig` |

---

### 2. Slot-Level Configuration (`slot.*` -> `slot.setConfig({ ... })`)

| Feature | Legacy Method | Modern `slot.setConfig` Replacement | Notes |
| :--- | :--- | :--- | :--- |
| **AdSense Attributes** | `slot.set(k, v)` | `slot.setConfig({ adsenseAttributes: { [k]: v } })` | Key-value dictionary |
| **Category Exclusion** | `slot.setCategoryExclusion(label)` | `slot.setConfig({ categoryExclusion: [label] })` | **Must be an Array of strings** |
| | `slot.clearCategoryExclusions()` | `slot.setConfig({ categoryExclusion: null })` | Passing `null` clears all slot exclusions |
| **Click URL** | `slot.setClickUrl(url)` | `slot.setConfig({ clickUrl: url })` | String |
| **Collapse Empty Div** | `slot.setCollapseEmptyDiv(true, true)` | `slot.setConfig({ collapseDiv: 'BEFORE_FETCH' })` | Collapse before ad fetch |
| | `slot.setCollapseEmptyDiv(true, false)`| `slot.setConfig({ collapseDiv: 'ON_NO_FILL' })` | Collapse only when unfilled |
| | `slot.setCollapseEmptyDiv(false)` | `slot.setConfig({ collapseDiv: 'DISABLED' })` | Do not collapse slot container |
| **SafeFrame** | `slot.setForceSafeFrame(force)` | `slot.setConfig({ safeFrame: { forceSafeFrame: force } })` | Boolean flag inside object |
| | `slot.setSafeFrameConfig(config)` | `slot.setConfig({ safeFrame: config })` | SafeFrameConfig object |
| **Targeting** | `slot.setTargeting(key, value)` | `slot.setConfig({ targeting: { [key]: value } })` | Value: string or array of strings |
| | `slot.updateTargetingFromMap(map)` | `slot.setConfig({ targeting: map })` | Direct map assignment |
| | `slot.clearTargeting(key)` | `slot.setConfig({ targeting: { [key]: null } })` | Clear single key with `null` |
| | `slot.clearTargeting()` | `slot.setConfig({ targeting: null })` | Clear all slot targeting with `null` |

---

### 3. Getters (`*.get*()` -> `getConfig()`)

The `getConfig()` methods return a **frozen (immutable)** snapshot containing the requested property.

> [!IMPORTANT]
> **Supported `getConfig` Keys**: Not all configuration options can be read back via `getConfig()`.
> - `googletag.getConfig()` **only** supports: `'adsenseAttributes'`, `'disableInitialLoad'`, and `'targeting'`.
> - `slot.getConfig()` **only** supports: `'adsenseAttributes'`, `'categoryExclusion'`, and `'targeting'`.
> Passing unsupported keys returns an empty object. You may pass a single key string or an array of keys (e.g., `googletag.getConfig(['targeting', 'disableInitialLoad'])`).

```javascript
// --- Page-Level Getters ---

// Legacy: googletag.pubads().getTargeting('section')
const pageTargeting = googletag.getConfig('targeting').targeting || {};
const section = pageTargeting.section || [];

// Legacy: googletag.pubads().getTargetingKeys()
const targetingKeys = Object.keys(googletag.getConfig('targeting').targeting || {});

// Legacy: googletag.pubads().isInitialLoadDisabled()
const isInitialLoadDisabled = googletag.getConfig('disableInitialLoad').disableInitialLoad;

// Legacy: googletag.pubads().get('document_language')
const adsenseConfig = googletag.getConfig('adsenseAttributes').adsenseAttributes || {};
const docLang = adsenseConfig.document_language || null;


// --- Slot-Level Getters ---

// Legacy: slot.getTargeting('pos')
const slotTargeting = slot.getConfig('targeting').targeting || {};
const pos = slotTargeting.pos || [];

// Legacy: slot.getTargetingKeys()
const slotTargetingKeys = Object.keys(slot.getConfig('targeting').targeting || {});

// Legacy: slot.getCategoryExclusions()
const exclusions = slot.getConfig('categoryExclusion').categoryExclusion || [];
```

---

## Code Refactoring Patterns

### Pattern 1: Initial Page Load Ad Setup

#### Before: Legacy Fragmented Setup
```html
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script>
  window.googletag = window.googletag || { cmd: [] };

  googletag.cmd.push(() => {
    // Legacy Slot Configuration
    const leaderSlot = googletag.defineSlot('/1234567/sports_top', [728, 90], 'div-leader')
      .addService(googletag.pubads());
    leaderSlot.setTargeting('pos', 'top');
    leaderSlot.setCollapseEmptyDiv(true, true);
    leaderSlot.setCategoryExclusion('AirlineAd');

    // Legacy Page-Level Configuration
    googletag.pubads().enableSingleRequest();
    googletag.pubads().disableInitialLoad();
    googletag.pubads().setCentering(true);
    googletag.pubads().collapseEmptyDivs(true);
    googletag.pubads().setTargeting('section', ['sports', 'news']);
    googletag.pubads().enableLazyLoad({
      fetchMarginPercent: 500,
      renderMarginPercent: 200,
      mobileScaling: 2.0
    });

    googletag.enableServices();
  });
</script>
```

#### After: Consolidated `setConfig` Setup
```html
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script>
  window.googletag = window.googletag || { cmd: [] };

  googletag.cmd.push(() => {
    // 1. Consolidated Page-Level Configuration
    googletag.setConfig({
      singleRequest: true,
      disableInitialLoad: true,
      centering: true,
      collapseDiv: 'BEFORE_FETCH',
      targeting: {
        section: ['sports', 'news']
      },
      lazyLoad: {
        fetchMarginPercent: 500,
        renderMarginPercent: 200,
        mobileScaling: 2.0
      }
    });

    // 2. Slot-Level Configuration
    const leaderSlot = googletag.defineSlot('/1234567/sports_top', [728, 90], 'div-leader')
      .addService(googletag.pubads());

    leaderSlot.setConfig({
      collapseDiv: 'BEFORE_FETCH',
      categoryExclusion: ['AirlineAd'],
      targeting: {
        pos: 'top'
      }
    });

    googletag.enableServices();
  });
</script>
```

---

### Pattern 2: Dynamic Updates (SPAs, Infinite Scroll & Ad Refresh)

In single-page applications or infinite-scroll feeds where targeting changes dynamically before an ad refresh, batch targeting updates and clearings into a single `setConfig` call.

#### Before: Legacy Procedural Updates
```javascript
// Dynamic update on route change or content injection
function updateSlotForNewArticle(slot, newSection, newPos) {
  slot.clearTargeting('old_param');
  slot.setTargeting('section', newSection);
  slot.setTargeting('pos', newPos);
  googletag.pubads().refresh([slot]);
}
```

#### After: Atomic `setConfig` Update
```javascript
// Atomic update: Clears old_param and updates section/pos in one operation
function updateSlotForNewArticle(slot, newSection, newPos) {
  slot.setConfig({
    targeting: {
      old_param: null, // Passing null removes this key
      section: newSection,
      pos: newPos
    }
  });
  googletag.pubads().refresh([slot]);
}
```

---

## Critical Caveats & Common Pitfalls

| Pitfall | Common Mistake | Correct Pattern | Consequence if Ignored |
| :--- | :--- | :--- | :--- |
| **Category Exclusion Array** | Passing a single string: `{ categoryExclusion: 'Airline' }` | Pass an array of strings: `{ categoryExclusion: ['Airline'] }` | GPT throws a runtime type error or ignores the exclusion. |
| **Collapse Div Enum String** | Passing a boolean: `{ collapseDiv: true }` | Pass enum string: `'BEFORE_FETCH'`, `'ON_NO_FILL'`, or `'DISABLED'` | Sizing and layout shift protections fail silently. |
| **Clearing with Null** | Passing empty string or empty object: `{ targeting: {} }` | Pass `null` to clear: `{ targeting: null }` or `{ targeting: { key: null } }` | Empty object does not clear existing targeting keys. |
| **Getter Property Unwrap** | Reading property directly: `googletag.getConfig('targeting')[key]` | Unwrap the feature namespace first: `googletag.getConfig('targeting').targeting?.[key]` | Evaluates to `undefined`. |
| **Unsupported Getters** | Calling `googletag.getConfig('collapseDiv')` or `'lazyLoad'` | Only request supported keys (`targeting`, `adsenseAttributes`, `disableInitialLoad`, `categoryExclusion`) | Returns empty object. |
| **Frozen Object Mutation** | Mutating returned config: `const t = googletag.getConfig('targeting'); t.targeting.pos = '1';` | Use `setConfig` to modify state: `googletag.setConfig({ targeting: { pos: '1' } });` | Fails silently or throws `TypeError: Cannot assign to read only property in strict mode`. |
| **Execution Timing** | Calling `setConfig` after `display()` or `enableServices()` for service-wide settings | Place `googletag.setConfig({...})` at the beginning of `googletag.cmd.push()` before `enableServices()` | Settings like `singleRequest` will not apply. |

---

## Verification & Validation Runbook

When verifying a migration, perform the following verification steps:

### 1. Codebase Grep Audit
Confirm that all legacy setters and getters have been replaced in active application code:

```bash
# Check for remaining legacy pubads setters
grep -rnE "\.pubads\(\)\.(set|enable|disable|collapse)" .

# Check for remaining legacy slot setters
grep -rnE "\.set(Targeting|CollapseEmptyDiv|CategoryExclusion|ForceSafeFrame|ClickUrl)\(" .

# Check for remaining legacy getters
grep -rnE "\.(getTargeting|getTargetingKeys|getAttributeKeys|isInitialLoadDisabled)\(" .
```

### 2. Runtime Verification via Google Publisher Console
1. Append `?googfc=1` to the test page URL in a browser, or open DevTools console and execute:
   ```javascript
   googletag.openConsole();
   ```
2. In the Google Publisher Console overlay:
   - **Page Delivery Timeline**: Confirm Single Request Architecture (SRA) status and Initial Load settings.
   - **Ad Units**: Inspect each ad slot to confirm that `targeting` key-values and `categoryExclusion` labels are accurately mapped.
   - **Warnings Tab**: Confirm there are no configuration warnings or invalid argument errors logged by GPT.

### 3. Snapshot Inspection via Console
Execute in the browser console to verify active configuration snapshots:

```javascript
// Verify active page-level targeting
console.log('Page Targeting:', googletag.getConfig('targeting').targeting);

// Verify active slot targeting
googletag.pubads().getSlots().forEach(slot => {
  console.log(slot.getSlotElementId(), slot.getConfig('targeting').targeting);
});
```
