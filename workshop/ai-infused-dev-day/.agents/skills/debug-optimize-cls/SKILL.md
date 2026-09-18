---
name: debug-optimize-cls
description: Guides debugging and optimizing Cumulative Layout Shift (CLS) using Chrome DevTools MCP tools. Use this skill whenever the user asks about CLS performance, measuring visual stability, or wants to understand why their page's main content is shifting while it renders. To provide a good user experience, a site must maintain a CLS score of **0.1 or less**. 
---

## What is Cumulative Layout Shift (CLS) and why it matters

CLS is a measure of the largest burst of layout shift scores for every unexpected layout shift that occurs during the entire lifecycle of a page. A layout shift occurs any time a visible element changes its position from one rendered frame to the next.
CLS tracks how much the page layout shifts unexpectedly during its lifetime, providing a single score that represents the worst batch impact of all unexpected layout shifts.

- **Good**:  ≤ 0.1 or less
- **Needs improvement**: 0.1-0.25 
- **Poor**:  > 0.25 

## 1. Diagnosing CLS with DevTools MCP

Before optimizing, use your DevTools MCP to identify whether the shifts happen during the initial load or post-load.

### A. Measuring Load CLS
- **Action**: Trigger a Lighthouse performance audit using `lighthouse_audit` tool.
- **Analysis**: Inspect the `cumulative-layout-shift` metric results. Lighthouse audits highlight root causes (e.g., "Image elements do not have explicit width and height") and list the specific DOM elements that shifted, along with their CLS contribution score. 
*Note: Lighthouse identifies the elements that were shifted, which are often the victims rather than the root cause.*

### B. Identifying Post-Load CLS

1. `navigate_page` to the target URL then `performance_start_trace` with `reload: true` and `autoStop: false`.

2. Use these JavaScript snippet with the `evaluate_script` tool to extract deep insights from the page and log unexpected layout shifts dynamically:

```javascript
(() => {
  let cls = 0;

  const valueToRating = (score) =>
    score <= 0.1 ? "good" : score <= 0.25 ? "needs-improvement" : "poor";

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) cls += entry.value;
    }
  });

  observer.observe({ type: "layout-shift", buffered: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") observer.takeRecords();
  });

  window.getCLS = () => ({
    script: "CLS",
    status: "ok",
    metric: "CLS",
    value: Math.round(cls * 10000) / 10000,
    unit: "score",
    rating: valueToRating(cls),
    thresholds: { good: 0.1, needsImprovement: 0.25 },
  });

  // Synchronous return for agent (buffered entries)
  const clsSync = performance
    .getEntriesByType("layout-shift")
    .reduce((sum, e) => (!e.hadRecentInput ? sum + e.value : sum), 0);

  return {
    script: "CLS",
    status: "ok",
    metric: "CLS",
    value: Math.round(clsSync * 10000) / 10000,
    unit: "score",
    rating: valueToRating(clsSync),
    thresholds: { good: 0.1, needsImprovement: 0.25 },
    message: "CLS measurement active. Call getCLS() for updated value after page interactions.",
  };
})();
```
3. `wait_for` 4 seconds then scroll down to the end of the page then call `performance_stop_trace` to finish capturing CLS issues.


## Optimization Strategies

## 1. Resolving Common CLS Causes
### Target 1: Images Without Dimensions
*   **Detection**: Query the DOM for `<img>` and `<video>` tags. Verify if `width` and `height` HTML attributes or a CSS `aspect-ratio` are present.
*   **Fix**: Apply explicit dimension attributes to reserve the layout space before the image downloads.
```css
    /* Alternatively, reserve space using CSS */
    img {
      aspect-ratio: 16 / 9;
      width: 100%;
      height: auto;
    }
    ```

### Target 2: Ads, Embeds, and Late-Loaded Content
*   **Detection**: Inspect dynamically injected elements (iframes, ad containers) that push visible content down the page.
*   **Fix**: 
    *   **Reserve Space:** Guarantee initial space using `min-height` or `aspect-ratio` on the parent container.
    *   **Handle Empty States:** If an ad fails to load, do not collapse the reserved space. Display a placeholder instead.
    *   **Optimal Placement:** Inject dynamic content lower in the viewport rather than near the top, as lower shifts have a smaller impact on the viewport.
    *   **User Interaction:** If injecting new UI elements (like banners), seamlessly load them offscreen and provide a manual trigger (e.g., "Scroll to top" or "Load more" button).

### Target 3: Layout-Triggering Animations
*   **Detection**: Parse active CSS rules for animations or transitions applied to `top`, `left`, `box-shadow`, or `box-sizing`.
*   **Fix**: Refactor animations to use composited properties that bypass the layout phase entirely. Replace `top` and `left` animations with `transform: translate()`, `transform: scale()`, or `transform: rotate()`.

### Target 4: Web Fonts (FOUT/FOIT)
*   **Detection**: Analyze network requests and render logs to see if the swapping of fallback fonts (FOUT) or the loading of invisible text (FOIT) causes text blocks to resize.
*   **Fix**:
    *   Add `font-display: optional` to your `@font-face` rule.
    *   Apply the `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` CSS APIs to perfectly match the fallback font's bounding box to the target web font.
    *   Use `<link rel="preload">` in the document `<head>` to fetch critical web fonts as early as possible.