/* ============================================================================
   CROSS-PAGE METRICS ENGINE (Core Web Vitals Observer)
   ============================================================================ */
let lcpValue = 0;
let cumulativeClsScore = 0;
let maximumInpLatency = 0;
let firstAdLoadTime = 0;

function getLcpRating(val) {
    if (val <= 0) return "No paint recorded";
    if (val <= 2500) return "Good";
    if (val <= 4000) return "Needs Improvement";
    return "Poor";
}

function getClsRating(val) {
    if (val <= 0.1) return "Good";
    if (val <= 0.25) return "Needs Improvement";
    return "Poor";
}

function getInpRating(val) {
    if (val <= 200) return "Good";
    if (val <= 500) return "Needs Improvement";
    return "Poor";
}

// Print all metrics together as a single consolidated block on any update
function logLiveMetricsSnapshot() {
    console.log(
        `[Metrics Update]\n` +
        `  LCP     : ${lcpValue > 0 ? lcpValue.toFixed(0) + 'ms' : 'No paint recorded'} (${getLcpRating(lcpValue)})\n` +
        `  CLS     : ${cumulativeClsScore.toFixed(4)} (${getClsRating(cumulativeClsScore)})\n` +
        `  INP     : ${maximumInpLatency > 0 ? maximumInpLatency.toFixed(0) + 'ms' : 'No interaction recorded'} (${getInpRating(maximumInpLatency)})\n` +
        `  Ad Load : ${firstAdLoadTime > 0 ? firstAdLoadTime.toFixed(0) + 'ms' : 'No ads loaded yet'}`
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const previousMetrics = localStorage.getItem("pending_lab_metrics");
    if (previousMetrics) {
        const data = JSON.parse(previousMetrics);
        console.group(`[Metrics] Core Web Vitals from last page: ${data.from}`);
        console.log(`LCP     : ${data.lcp ? data.lcp.toFixed(0) + 'ms' : 'No paint recorded'} (${getLcpRating(data.lcp)})`);
        console.log(`CLS     : ${data.cls.toFixed(4)} (${getClsRating(data.cls)})`);
        console.log(`INP     : ${data.inp > 0 ? data.inp.toFixed(0) + 'ms' : 'No interaction recorded'} (${getInpRating(data.inp)})`);
        console.log(`Ad Load : ${data.adLoad && data.adLoad > 0 ? data.adLoad.toFixed(0) + 'ms' : 'No ads loaded'}`);
        console.groupEnd();
        localStorage.removeItem("pending_lab_metrics");
    }
});

// 1. Largest Contentful Paint (LCP) Observer
const lcpObserver = new PerformanceObserver((l) => {
    const entries = l.getEntries();
    if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        lcpValue = lastEntry.startTime;
        logLiveMetricsSnapshot();
    }
});
lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

// 2. Cumulative Layout Shift (CLS) Observer
new PerformanceObserver((l) => {
    let updated = false;
    for (const e of l.getEntries()) {
        if (!e.hadRecentInput) {
            cumulativeClsScore += e.value;
            updated = true;
        }
    }
    if (updated) {
        logLiveMetricsSnapshot();
    }
}).observe({ type: 'layout-shift', buffered: true });

// 3. Interaction to Next Paint (INP) Observer
new PerformanceObserver((l) => {
    let updated = false;
    for (const e of l.getEntries()) {
        if (e.interactionId && e.duration > maximumInpLatency) {
            maximumInpLatency = e.duration;
            updated = true;
        }
    }
    if (updated) {
        logLiveMetricsSnapshot();
    }
}).observe({ type: 'event', buffered: true, durationThreshold: 16 });

// 4. Ad Load Speed Listener
// Captures the exact, concrete loading speed of the first rendered ad creative
window.addEventListener("adSlotRendered", () => {
    if (firstAdLoadTime === 0) {
        firstAdLoadTime = performance.now();
        logLiveMetricsSnapshot();
    }
});

function saveMetricsBeforeUnload() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const payload = { 
        from: currentPath, 
        cls: cumulativeClsScore, 
        inp: maximumInpLatency, 
        lcp: lcpValue,
        adLoad: firstAdLoadTime
    };
    localStorage.setItem("pending_lab_metrics", JSON.stringify(payload));
}
window.addEventListener('pagehide', saveMetricsBeforeUnload);

// BFCache diagnostics logger
window.addEventListener('pageshow', (e) => {
    const nav = window.performance?.getEntriesByType?.('navigation')[0];
    if (e.persisted) {
        console.log("[BFCache] Restored page from memory cache.");
    } else if (nav?.type === 'back_forward') {
        console.warn("[BFCache] Failed to restore from memory. Explicit 'unload' listener registered.");
    }
});
