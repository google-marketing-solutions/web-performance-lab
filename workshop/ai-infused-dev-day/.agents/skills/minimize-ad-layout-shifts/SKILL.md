---
name: minimize-ad-layout-shifts
description: >-
  Minimizes Cumulative Layout Shift (CLS) caused by Google Publisher Tag (GPT) ads based on Google's official best practices. Guides developers to infer ad slot dimensions, breakpoints, and sizing strategies directly from codebase definitions (defineSlot, sizeMapping, and CSS) without relying on ad server reports. Covers CSS min-height/min-width space reservation, responsive media queries, horizontal and vertical centering, collapseDiv strategy, and ATF vs. BTF optimization.
---

# Minimizing Layout Shifts from Google Publisher Tag (GPT) Ads

## Description & Purpose

This skill guides agents and developers in auditing codebases, eliminating ad-induced layout shifts, and meeting Core Web Vitals Cumulative Layout Shift (CLS) targets (75th percentile CLS < 0.1). 

Following Google's official [Minimize Layout Shift Guide](https://developers.google.com/publisher-tag/guides/minimize-layout-shift), this skill is specifically engineered to operate **without requiring access to Google Ad Manager (GAM) reporting or historical fill rate data**. All space reservation, responsive breakpoint alignment, and container styling decisions are inferred directly from the codebase's existing ad slot definitions, size mappings, and HTML/CSS layout structure.

---

## Triggering Conditions

### When to Use
- Diagnosing or fixing Cumulative Layout Shift (CLS) or Core Web Vitals regressions caused by ad slots.
- Adding or refactoring ad slot container elements (`<div>` elements) for Google Publisher Tag (GPT).
- Sizing ad slots with CSS `min-height` and `min-width` across responsive breakpoints.
- Resolving multi-size ad slot layout jumps (e.g., `300x250` vs `300x600`, or `728x90` vs `970x250`).
- Configuring GPT `collapseDiv` (`collapseEmptyDivs`) or `lazyLoad` policies to prevent layout instability.
- Synchronizing GPT responsive `sizeMapping` definitions with CSS media queries.
- Auditing Above-the-Fold (ATF) vs Below-the-Fold (BTF) ad placements for layout stability.

### When NOT to Use
- Non-ad layout shifts (e.g., unsized images, missing font display swap/FOIT/FOUT, dynamic cookie banners, or framework hydration shifts unrelated to ad containers).
- Native mobile applications using the Google Mobile Ads (GMA) SDK for Android or iOS.
- Video stream ad insertion (DAI / VAST / VMAP) that does not involve display container reflow.

---

## Technical Mechanics of Ad-Related Layout Shift

### Why Ads Cause Layout Shift
Ad slots are typically requested asynchronously. While ad scripts and bids resolve, page content around the ad slot renders. When the ad creative finally returns and mounts:
1. If the container element was not pre-allocated sufficient space, it expands from `0px` height, forcefully displacing subsequent page content downward.
2. If the container was pre-allocated one size but an ad of a different size renders, the container expands or contracts, shifting content.
3. If an ad slot fails to fill (no-fill) and collapses to `0px`, surrounding content jumps upward.

### Lifecycle Points Where Shifts Occur
1. **When `googletag.display()` is called**: If the slot is configured to expand or collapse upfront (e.g., `BEFORE_FETCH`).
2. **When ad content renders**: The slot resizes if the creative size exceeds the container, or if `collapseDiv` triggers on no-fill (`ON_NO_FILL`).
3. **After ad content renders**: Expandable creatives, interstitials, pushdowns, or third-party scripts that inject unconstrained markup into the ad iframe or surrounding DOM.

### Impact of Viewport Position: ATF vs. BTF
- **Above the Fold (ATF)**: The higher an ad slot is in the viewport, the greater the volume of downstream content it displaces. ATF shifts incur the maximum possible CLS penalty because visible content in the initial viewport shifts while the user is actively reading. **ATF slots must be stabilized with zero tolerance for vertical shift.**
- **Below the Fold (BTF)**: BTF slots only generate CLS if they shift *while visible in the user's viewport*. Using GPT Lazy Loading ensures BTF slots fetch and render before the user scrolls them into view, mitigating shift even if minor size variations occur.

---

## Inferring Ad Dimensions Directly From Code (No Reports Assumed)

When server-side historical fill reports from Google Ad Manager are unavailable, all dimensions must be deduced deterministically from the codebase. Inspect the following three sources:

### 1. Slot Definitions (`googletag.defineSlot`)
Locate calls to `googletag.defineSlot()`:
```javascript
// Case A: Fixed single size -> width: 300px, height: 250px
googletag.defineSlot('/1234/sidebar', [300, 250], 'div-gpt-ad-sidebar');

// Case B: Multi-size array -> widths: {300}, heights: {250, 600}
googletag.defineSlot('/1234/sidebar', [[300, 250], [300, 600]], 'div-gpt-ad-sidebar');

// Case C: Multi-size leaderboard -> widths: {728, 970}, heights: {90, 250}
googletag.defineSlot('/1234/top-nav', [[728, 90], [970, 90], [970, 250]], 'div-gpt-ad-top');
```

### 2. Responsive Size Mappings (`googletag.sizeMapping()`)
Locate `sizeMapping` chains defined on slots:
```javascript
const headerMapping = googletag.sizeMapping()
  // Desktop: viewport width >= 1024px -> [970x250, 970x90, 728x90]
  .addSize([1024, 0], [[970, 250], [970, 90], [728, 90]])
  // Tablet: 768px <= viewport width < 1024px -> [728x90]
  .addSize([768, 0], [[728, 90]])
  // Mobile: viewport width < 768px -> [320x50, 300x250]
  .addSize([0, 0], [[320, 50], [300, 250]])
  .build();
```
*Inference*:
- Viewport >= 1024px: Width max 970px, Height max 250px, Height min 90px.
- Viewport 768px - 1023px: Width 728px, Height 90px (deterministic fixed size).
- Viewport < 768px: Width max 320px, Height max 250px, Height min 50px.

### 3. DOM Containers & Existing CSS
Inspect the HTML target elements:
```html
<!-- Unconstrained: causes 100% shift from 0px -->
<div id="div-gpt-ad-top"></div>

<!-- Check surrounding layout: Is it a flex child? Inside an article body? In a sidebar? -->
<aside class="sidebar">
  <div id="div-gpt-ad-sidebar"></div>
</aside>
```

---

## Code-Inferred Space Reservation Strategies

When choosing how much space to reserve for multi-size slots without fill reports, apply the following deterministic rules based on slot position and the inferred size set:

```
┌─────────────────────────────────────────────────────────────┐
│                   Position in Viewport?                     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Above-the-Fold (ATF)            Below-the-Fold (BTF)
               │                               │
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  Strategy 1:         │        │  Strategy 2:         │
    │  Reserve for LARGEST │        │  Reserve BASELINE /  │
    │  height in size set  │        │  COMMON size +       │
    │  + Center creatives  │        │  GPT Lazy Loading    │
    └──────────────────────┘        └──────────────────────┘
```

### Strategy 1: Max-Height Reservation (Mandatory for Above-the-Fold)
- **Rule**: For any ad slot located Above-the-Fold (headers, hero banners, top-of-sidebar), **always reserve space for the largest height** present in that breakpoint's size set.
- **Why**: An ATF layout shift pushes down the entire document, causing catastrophic CLS scores (> 0.25 on a single shift). If a slot supports `[970, 90]` and `[970, 250]`, reserving `250px` completely eliminates layout shift, regardless of which size serves.
- **Handling Blank Space**: If a `90px` ad serves into a `250px` reserved container, use CSS vertical and horizontal centering (`display: flex; justify-content: center; align-items: center;`). A centered `90px` banner looks visually balanced and intentional, whereas a sudden `160px` layout shift degrades user experience and search ranking.

### Strategy 2: Baseline / Shared Dimension Reservation (For Below-the-Fold)
- **Rule**: For BTF slots with widely disparate heights (e.g., `[300, 250]` and `[300, 600]` in an infinite scroll or mid-article position), reserve for the **common baseline size** (`min-height: 250px`).
- **Why**: In mid-content, allocating `600px` for a slot that frequently serves `250px` may leave excessive empty space. Reserving `min-height: 250px` guarantees zero shift for `250px` ads, and limits the shift to only `350px` (instead of `600px` from zero) if a half-page serves.
- **Pairing with Lazy Loading**: Always pair BTF baseline reservation with GPT Lazy Loading (`fetchMarginPercent` and `renderMarginPercent`) so the ad renders before it is scrolled into view, preventing the user from observing any residual shift.

### Strategy Comparison & Trade-offs (Max vs. Min vs. Average)

When configuring multi-size slots, present these options to the user along with their respective trade-offs:

| Approach | Space Reserved | Pros | Trade-offs / Cons | Best Suited For |
| :--- | :--- | :--- | :--- | :--- |
| **Max Dimension** | `min-height: <max_height>` (e.g. 250px) | **Zero layout shift** across all creative fills; maximum CLS protection. | Leaves white space / padding when smaller creatives render. | **Above-the-Fold (ATF)** slots, header leaderboards, hero positions. |
| **Min Dimension** | `min-height: <min_height>` (e.g. 90px or 250px) | Preserves page content density; zero wasted whitespace for small ads. | Causes layout shift whenever larger creatives fill. | **Below-the-Fold (BTF)** slots paired with proactive lazy loading. |
| **Average / Intermediate** | `min-height: <average_height>` (e.g. 170px) | Compromise: splits the difference between blank space and shift magnitude. | Causes moderate shift for large ads AND slight padding for small ads. | Mid-article slots where neither empty gaps nor large jumps are desired. |
| **Historical Fill / Dominant** | `min-height: <most_frequent>` | Minimizes shift and whitespace based on actual traffic reality. | Requires historical GAM impression reporting from the user. | Any slot where the publisher has access to ad delivery metrics. |

---

## Key Principles for Space Reservation

Assuming standard CSS proficiency for styling and responsive layouts, focus on these critical ad-specific constraints:

1. **Use `min-height` and `min-width` (Never Fixed `height`)**:
   - Fixed heights (`height: 90px; overflow: hidden;`) clip creatives when SafeFrames, borders, or ad badges introduce extra pixels. Always use `min-height` so space is reserved upfront while allowing container expansion if needed.
2. **Static Declaration Only (Never JavaScript)**:
   - Space reservation must be declared in **static CSS** or inline HTML `style="..."` attributes. Setting heights via JavaScript (`DOMContentLoaded`, `onload`) runs after layout passes and causes the exact layout shift you are trying to prevent.
3. **Strict Breakpoint Synchronization**:
   - Align media query breakpoints with viewport widths in `googletag.sizeMapping().addSize([width, 0])`. Always pass `0` for height in `addSize` so viewport height does not cause unexpected fallback to smaller creative sizes.
4. **Creative Centering**:
   - When creatives smaller than the reserved container serve (e.g. 728x90 in a 250px container), center them using CSS flexbox on the container or GPT's built-in centering (`googletag.setConfig({ centering: true })`).


---

## Empty Ad Slot Collapsing (`collapseDiv`) Strategy

GPT provides options to collapse ad containers when no ad fills. Choosing the wrong setting guarantees severe layout shifts.

### The Three `collapseDiv` Modes

| Configuration (`googletag.setConfig({ collapseDiv })`) | Legacy API | Initial State | On No-Fill | Layout Shift Risk |
| :--- | :--- | :--- | :--- | :--- |
| `'DISABLED'` | *(default / not called)* | Reserved CSS size | Stays at reserved size | **Zero layout shift** (may leave blank space) |
| `'BEFORE_FETCH'` | `collapseEmptyDivs(true)` | Starts collapsed (`0px`) | Stays `0px` | **EXTREME**: Jumps from `0px` to full size on every fill |
| `'ON_NO_FILL'` | `collapseEmptyDivs(false)` | Starts at reserved size | Collapses to `0px` | Shifts only on no-fill |

### Code-Inferred Policy (No Reports Assumed)

When fill rates are unknown:

1. **Above-the-Fold (ATF) Slots**:
   - **Set `collapseDiv: 'DISABLED'`** or leave space permanently reserved.
   - If the business strictly demands collapsing unfilled ATF slots, use `'ON_NO_FILL'`.
   - **NEVER use `'BEFORE_FETCH'` on ATF slots.** This is the worst possible configuration for CLS because every single filled ad causes a full-height layout jump.
2. **Below-the-Fold (BTF) Slots**:
   - Use `collapseDiv: 'ON_NO_FILL'`. Since the slot is initialized with CSS `min-height`, it reserves space. If it fails to fill, it collapses offscreen (or before the user reaches it if lazy loading is enabled).
3. **Slot-Level vs Page-Level Configuration**:
   - In modern GPT, configure page-level or slot-level independently:
     ```javascript
     // Page-level default
     googletag.setConfig({
       collapseDiv: 'ON_NO_FILL'
     });

     // Critical ATF slot: override to DISABLED to prevent any collapse shift
     const topSlot = googletag.defineSlot('/1234/top', [[728, 90], [970, 250]], 'top-ad');
     topSlot.setConfig({
       collapseDiv: 'DISABLED'
     });
     ```

---

## Sticky & Out-Of-Page Ad Units

### Top Sticky / Anchor Ads
- If a top sticky banner is rendered with `position: fixed; top: 0`, and the site pushes the `<body>` down using JavaScript when the ad loads, it introduces a severe layout shift across the entire page.
- **Remediation**:
  - If using a sticky header ad, reserve a static `margin-top` or `padding-top` on the `<header>` or `<main>` container matching the ad's height.
  - Alternatively, use bottom anchor ads via `googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR`. Bottom anchors overlay the bottom of the viewport and **do not reflow or displace the page document structure**, resulting in 0 CLS.

### Sidebar Sticky Rails
- Sidebar ads should sit inside a dedicated column with a fixed CSS width (e.g. `width: 300px; min-height: 600px;`).
- Use CSS sticky positioning:
  ```css
  .sticky-sidebar-ad {
    position: sticky;
    top: 20px;
    min-width: 300px;
    min-height: 250px;
  }
  ```
- Because the sidebar is outside the main editorial content column, any size adjustment within the sidebar cannot shift the main article text horizontally or vertically.

---

## Step-by-Step Codebase Audit & Refactoring Workflow

Follow this 7-step workflow when auditing a project:

```text
Step 1: Scan Slot Definitions
 └── Grep for defineSlot, defineOutOfPageSlot, sizeMapping, addSize

Step 2: Map DOM Containers & Viewport Positions
 ├── Match slot div IDs to HTML/JSX/template files
 └── Classify each slot as Above-the-Fold (ATF) or Below-the-Fold (BTF)

Step 3: Extract Dimensions per Breakpoint
 ├── Group sizes by media query / viewport width
 └── Calculate Min, Max, and Average dimensions for each breakpoint

Step 4: Consult User on Sizing Strategy
 ├── Present extracted dimensions and sizing candidates for multi-size slots
 ├── Explain trade-offs: Max (Zero CLS) vs. Min (Content Density) vs. Average (Compromise)
 └── Prompt user to select preferred approach (or ask if GAM fill reports are available)

Step 5: Author Static CSS Space Reservation
 ├── Add min-height, min-width, display: flex, centering matching chosen strategy
 └── Write synchronized CSS @media queries matching sizeMapping breakpoints

Step 6: Configure GPT Policies (collapseDiv & lazyLoad)
 ├── Set collapseDiv: 'DISABLED' on ATF slots
 ├── Set collapseDiv: 'ON_NO_FILL' on BTF slots
 └── Enable googletag.setConfig({ lazyLoad: {...} }) for BTF inventory

Step 7: Validate & Verify
 ├── Ensure no JavaScript-driven height mutations exist
 └── Check DOM in browser (ensure div has reserved bounding box prior to ad load)
```

### Guidance for Step 4: Aligning Sizing Strategy with the User

When auditing multi-size slots, do not silently guess the sizing strategy without consulting the user. Present the findings clearly and ask for direction:

1. **Summarize Multi-Size Breakpoints**:
   List each slot that accepts multiple creative sizes across breakpoints. For example:
   > "Slot `#div-gpt-ad-top` on Desktop supports `[970x90]` and `[970x250]`."

2. **Present the Alternatives & Trade-offs**:
   - **Option A: Max Height (Recommended for ATF)**: Reserve `250px`. Guarantees **0 CLS**, but smaller `90px` creatives will have vertical whitespace.
   - **Option B: Min Height**: Reserve `90px`. Eliminates whitespace for `90px` ads, but causes a `160px` layout shift if a `250px` ad fills.
   - **Option C: Average / Midpoint**: Reserve `170px`. Splits the difference between empty space and shift distance.
   - **Option D: Historical Fill Data**: Inquire if the user has GAM historical delivery numbers (e.g., if one size accounts for >80% of impressions).

3. **Incorporate User Choice**:
   Apply the user's preferred strategy during CSS authoring in Step 5.

---

## Comprehensive Implementation Example

### 1. JavaScript Setup (`gpt-ads.js`)
```javascript
window.googletag = window.googletag || { cmd: [] };

googletag.cmd.push(() => {
  // 1. Define Responsive Size Mapping for Top Banner
  const topBannerMapping = googletag.sizeMapping()
    .addSize([1024, 0], [[970, 250], [970, 90], [728, 90]])
    .addSize([768, 0], [[728, 90]])
    .addSize([0, 0], [[320, 50], [300, 250]])
    .build();

  // 2. Define Slots
  const topSlot = googletag.defineSlot('/12345/homepage_top', [[970, 250], [970, 90], [728, 90]], 'div-gpt-ad-top')
    .defineSizeMapping(topBannerMapping)
    .addService(googletag.pubads());

  const sidebarSlot = googletag.defineSlot('/12345/sidebar', [[300, 250], [300, 600]], 'div-gpt-ad-sidebar')
    .addService(googletag.pubads());

  // 3. Centralized Modern Configuration
  googletag.setConfig({
    // Enable centering for all creatives
    centering: true,
    // Page-level collapse: only collapse on no-fill
    collapseDiv: 'ON_NO_FILL',
    // Proactive lazy loading for BTF slots
    lazyLoad: {
      fetchMarginPercent: 200,
      renderMarginPercent: 100,
      mobileScaling: 2.0
    }
  });

  // 4. ATF Slot Hardening: Never collapse top ATF slot to prevent any shift
  topSlot.setConfig({
    collapseDiv: 'DISABLED'
  });

  googletag.enableServices();
});
```

### 2. HTML Markup (`index.html`)
```html
<header class="site-header">
  <!-- Top ATF Ad Container with pre-allocated CSS class -->
  <div id="div-gpt-ad-top" class="ad-slot-top-banner">
    <script>
      googletag.cmd.push(() => { googletag.display('div-gpt-ad-top'); });
    </script>
  </div>
</header>

<main class="content-wrapper">
  <article class="main-content">
    <h1>Article Title</h1>
    <p>Editorial content starts here and will NOT be displaced by ad rendering.</p>
  </article>

  <aside class="sidebar-column">
    <!-- Sidebar Ad Container -->
    <div id="div-gpt-ad-sidebar" class="ad-slot-sidebar">
      <script>
        googletag.cmd.push(() => { googletag.display('div-gpt-ad-sidebar'); });
      </script>
    </div>
  </aside>
</main>
```

### 3. Reserved Dimensions (`ads.css`)
```css
/* ATF Top Banner: Reserve max height for 0 CLS */
.ad-slot-top-banner {
  min-height: 250px;
}
@media (max-width: 1023px) {
  .ad-slot-top-banner {
    min-height: 90px;
  }
}

/* BTF Sidebar: Reserve baseline dimensions */
.ad-slot-sidebar {
  min-width: 300px;
  min-height: 250px;
}
```

---

## Anti-Patterns & Common Mistakes to Avoid

| Anti-Pattern | Why It Causes Layout Shift | Remediation |
| :--- | :--- | :--- |
| **Unreserved `0px` Container** | Container has no CSS dimensions. Jumps from `0px` to full creative size upon load. | Add `min-height` and `min-width` to the ad div class or inline style. |
| **Reserving Space with JS** | JS executes after DOM layout, making the element snap into place visibly. | Use static CSS stylesheets or inline `style="..."` attributes on the HTML tag. |
| **`collapseDiv: 'BEFORE_FETCH'` on ATF** | Starts collapsed at `0px` and forces a layout shift every time an ad is filled. | Use `collapseDiv: 'DISABLED'` or `'ON_NO_FILL'` for ATF inventory. |
| **Mismatched Breakpoints (Height Bug)** | CSS `@media(min-width: Wpx)` only checks width, but `addSize([W, H])` checks both width AND height. If a user's browser height is less than `H`, GPT will serve a smaller ad but CSS will reserve space for a large ad. | Use `0` for height in `addSize([W, 0], ...)` to perfectly synchronize with width-only CSS media queries. |
| **Hardcoded Fixed `height` with `overflow: hidden`** | Clips creatives that slightly exceed dimensions (SafeFrame padding, badges). | Use `min-height` instead of fixed `height`. |
| **Top Sticky Header without Content Offset** | Inserting a top sticky banner reflows the body or pushes down navigation. | Reserve equivalent static padding/margin on the header/body, or use bottom anchor ads. |
