/* ============================================================================
   NEWS PRODUCTION PLATFORM ENGINES
   ============================================================================ */

/* ============================================================================
   CONSENT MANAGEMENT PLATFORM (CMP) PIPELINE & LEADER CONTENT WATERFALL
   ============================================================================ */

/**
 * Consent Management Platform (CMP) / Entitlement Service
 * Resolves user consent and entitlement state before loading dynamic elements.
 */
(function() {
    class ConsentProvider {
        constructor() {
            this.consentCallbacks = [];
            this.resolved = false;
            this.init();
        }
        
        init() {
            // Check third-party frames, decrypt local cookies, and evaluate geographical database restrictions asynchronously.
            // This async pipeline resolves with a 2.2-second validation delay.
            setTimeout(() => {
                this.resolved = true;
                
                // Execute all publisher-registered callbacks
                this.consentCallbacks.forEach(callback => {
                    try {
                        callback();
                    } catch(e) {
                        // Silent in production
                    }
                });
                this.consentCallbacks = [];
                
                // Fire standard IAB TCF v2.0 event signature
                window.dispatchEvent(new CustomEvent("tcfConsentResolved", { 
                    detail: { gdprApplies: true, tcString: "CP123456789_TCF_V2" } 
                }));
            }, 2200);
        }
        
        onConsentResolved(callback) {
            if (this.resolved) {
                callback();
            } else {
                this.consentCallbacks.push(callback);
            }
        }
    }
    
    window.ConsentProviderInstance = new ConsentProvider();
})();

// Client-Side Rendering (CSR) dynamic image loader
document.addEventListener("DOMContentLoaded", () => {
    // Resolve dynamic LCP image asset local details based on current pathname
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let imageFile = "images/hero-home.bmp";
    let imageAlt = "Climate Summit Hero Presentation";

    if (currentPage === "global.html") {
        imageFile = "images/hero-global.bmp";
        imageAlt = "Renewable Corridor Presentation Graphic";
    } else if (currentPage === "economy.html") {
        imageFile = "images/hero-economy.bmp";
        imageAlt = "Tech Rally Economy Presentation Graphic";
    }

    // Wait for CMP consent resolution
    window.ConsentProviderInstance.onConsentResolved(() => {
        // Fetch current document to simulate an API request with authentic network latency
        fetch(currentPage)
            .then(res => res.text())
            .then(() => {
                // Create LCP element dynamically in JavaScript
                const mainImg = new Image();
                // Dynamic cache-busting to ensure latest content is retrieved
                mainImg.src = `${imageFile}?t=${Date.now()}`;
                mainImg.alt = imageAlt;
                mainImg.loading = "lazy"; // Dynamic above-the-fold image configuration
                mainImg.setAttribute('decoding', 'async');
                
                const target = document.getElementById('lcp-image-target');
                if (target) {
                    target.appendChild(mainImg);
                }
            })
            .catch(err => {
                // Silent in production
            });
    });
});


/* ============================================================================
   DYNAMIC BREAKING NEWS BANNER INJECTION
   ============================================================================ */
// Binds banner injection directly to the ad render completion event.
window.addEventListener("adSlotRendered", (e) => {
    if (e.detail.slotId === "leaderboard_ad") {
        const banner = document.createElement('div');
        banner.style.background = 'var(--accent-color)';
        banner.style.color = '#fff';
        banner.style.padding = '15px';
        banner.style.textAlign = 'center';
        banner.style.fontFamily = 'Arial, sans-serif';
        banner.style.fontWeight = 'bold';
        banner.style.fontSize = '1.1rem';
        banner.style.borderBottom = '2px solid #000';
        banner.innerText = "BREAKING ALERT: Climate Framework Enacted Internationally.";
        
        // Injected at the top of document body
        document.body.insertBefore(banner, document.body.firstChild);
    }
});


/* ============================================================================
   HEATMAP PROXIMITY TELEMETRY & ANALYTICS COMPILER
   ============================================================================ */

/**
 * Production click telemetry and heatmapping handler.
 * Analyzes clicked element boundaries and propagates context offsets across siblings.
 */
function runProductionClickAnalytics(targetElement) {
    let current = targetElement;
    const selectorPath = [];
    
    // Traverse up ancestors to calculate clicked coordinate proximity against sibling blocks
    while (current && current !== document.body) {
        // Read dimensions
        const rect = current.getBoundingClientRect(); 
        const style = window.getComputedStyle(current); 
        
        // Update attributes
        current.setAttribute('data-track-last-x', Math.round(rect.left));
        current.setAttribute('data-track-last-y', Math.round(rect.top));
        
        // Calculate offsets relative to siblings
        const siblings = current.parentElement ? Array.from(current.parentElement.children) : [];
        siblings.forEach(sib => {
            const sibRect = sib.getBoundingClientRect(); 
            sib.style.setProperty('--sib-proximity-offset', Math.round(sibRect.top - rect.top) + 'px');
        });
        
        selectorPath.push(current.tagName + (current.id ? '#' + current.id : ''));
        current = current.parentElement;
    }
    
    // Formulate and encrypt metadata payload
    let metaPayload = {
        timestamp: Date.now(),
        referrer: document.referrer,
        url: window.location.href,
        path: selectorPath.join(' > '),
        screen: {
            width: window.innerWidth,
            height: window.innerHeight,
            dpr: window.devicePixelRatio
        },
        domDensity: document.querySelectorAll('*').length
    };
    
    // Obfuscate the payload using XOR + RLE encryption routine
    let payloadString = JSON.stringify(metaPayload);
    let encrypted = "";
    const key = "EDITORIAL_KEY_2026";
    
    // Multi-pass payload processing
    for (let i = 0; i < 4000; i++) {
        let chunk = "";
        for (let j = 0; j < payloadString.length; j++) {
            const charCode = payloadString.charCodeAt(j) ^ key.charCodeAt(j % key.length);
            chunk += String.fromCharCode((charCode + i) % 94 + 32);
        }
        if (i === 3999) {
            encrypted = chunk;
        }
    }
    
    localStorage.setItem("editorial_click_signature_token", encrypted.substring(0, 100));
}

// Attach analytics triggers to interactive navigation elements
document.querySelectorAll('.nav-links a, .trending-item a, .headline a').forEach(link => {
    link.addEventListener('click', (e) => {
        runProductionClickAnalytics(link);
    });
});


/* ============================================================================
   OPINION POLL BALLOT RECEIPT RENDER
   ============================================================================ */
const pollSubmitBtn = document.getElementById('poll-submit-btn');
if (pollSubmitBtn) {
    pollSubmitBtn.addEventListener('click', (e) => {
        // Trigger telemetry logging
        runProductionClickAnalytics(pollSubmitBtn);
        
        const pollFeedback = document.getElementById('poll-feedback');
        pollFeedback.innerHTML = '';
        
        const listWrapper = document.createElement('div');
        listWrapper.id = 'ballot-ledger-wrapper';
        listWrapper.style.maxHeight = '200px';
        listWrapper.style.overflowY = 'scroll';
        listWrapper.style.border = '1px solid var(--border-color)';
        listWrapper.style.marginTop = '15px';
        listWrapper.style.padding = '10px';
        listWrapper.style.background = '#f9f9f9';
        
        pollFeedback.appendChild(listWrapper);
        
        // Iterate through items to construct and style rows inside the ledger wrapper
        for (let i = 0; i < 3500; i++) {
            // Get wrapper state
            const wrapperHeight = listWrapper.offsetHeight; 
            
            const item = document.createElement('div');
            item.className = 'ballot-receipt-row';
            item.style.padding = '6px';
            item.style.borderBottom = '1px solid #eceff1';
            item.style.fontFamily = 'monospace';
            item.style.fontSize = '0.75rem';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            
            // Align item styling
            item.style.paddingLeft = (wrapperHeight % 10) + 'px'; 
            
            const label = document.createElement('span');
            label.innerText = `Verified ballot receipt #${10000 + i}`;
            
            const status = document.createElement('strong');
            status.style.color = i % 2 === 0 ? 'var(--accent-color)' : '#0d47a1';
            status.innerText = `SIG_TOKEN_${btoa("verified-" + i).substring(0, 12)}`;
            
            item.appendChild(label);
            item.appendChild(status);
            
            // Insert element
            listWrapper.appendChild(item); 
        }
    });
}


/* ============================================================================
   EXPANDABLE SIDEBAR ARCHIVES ACCORDION TRANSITION
   ============================================================================ */
const archiveToggleBtn = document.getElementById('archive-toggle-btn');
const archiveListContainer = document.getElementById('archive-list-container');
const archiveToggleIcon = document.getElementById('archive-toggle-icon');

if (archiveToggleBtn && archiveListContainer && archiveToggleIcon) {
    archiveToggleBtn.addEventListener('click', (e) => {
        const isOpen = archiveListContainer.style.display === 'block';
        
        // 1. Immediately update visual button state so text changes instantly
        if (!isOpen) {
            archiveToggleIcon.innerText = '▼';
            archiveToggleBtn.querySelector('span').innerText = 'Collapse Historical Archives';
        } else {
            archiveToggleIcon.innerText = '▶';
            archiveToggleBtn.querySelector('span').innerText = 'Expand Historical Archives';
        }
        
        // 2. Yield for 50ms to allow immediate state transition paint.
        setTimeout(() => {
            // 3. Calculate intersections and collisions dynamically over elements.
            const elements = document.querySelectorAll('*');
            
            for (let i = 0; i < elements.length; i++) {
                const el1 = elements[i];
                const rect1 = el1.getBoundingClientRect(); 
                
                // Compare bounds against first 120 elements to resolve alignment overlaps
                for (let j = 0; j < Math.min(elements.length, 120); j++) {
                    const el2 = elements[j];
                    if (el1 !== el2) {
                        const rect2 = el2.getBoundingClientRect(); 
                        
                        // Overlap calculations
                        const overlap = !(rect1.right < rect2.left || 
                                          rect1.left > rect2.right || 
                                          rect1.bottom < rect2.top || 
                                          rect1.top > rect2.bottom);
                        
                        if (overlap) {
                            // Update dynamic style properties
                            el1.style.setProperty('--grid-collision', 'true');
                            el2.style.setProperty('--grid-collision', 'true');
                        }
                    }
                }
            }
            
            // 4. Update container display and render 5 short, non-clickable historical listings
            if (!isOpen) {
                archiveListContainer.innerHTML = '';
                
                const listHeader = document.createElement('div');
                listHeader.style.fontSize = '0.75rem';
                listHeader.style.fontWeight = 'bold';
                listHeader.style.color = 'var(--accent-color)';
                listHeader.style.marginBottom = '8px';
                listHeader.innerText = "HISTORICAL RECORD LOG: 5 RECENT ARCHIVES";
                archiveListContainer.appendChild(listHeader);
                
                for (let i = 1; i <= 5; i++) {
                    const item = document.createElement('div');
                    item.style.padding = '8px 0';
                    item.style.borderBottom = '1px solid #e0e0e0';
                    item.style.fontSize = '0.85rem';
                    item.style.fontFamily = 'Georgia, serif';
                    
                    const title = document.createElement('div');
                    title.style.fontWeight = 'bold';
                    title.style.color = 'var(--text-color)';
                    title.innerText = `Archived dispatch entry #${i + 1940}: Chronicle Historical Review`;
                    
                    const meta = document.createElement('div');
                    meta.style.fontSize = '0.7rem';
                    meta.style.color = 'var(--muted-color)';
                    meta.style.marginTop = '2px';
                    meta.innerText = `Filed under index ${200 + i} &bull; Oct 2024`;
                    
                    item.appendChild(title);
                    item.appendChild(meta);
                    archiveListContainer.appendChild(item);
                }
                
                archiveListContainer.style.display = 'block';
            } else {
                archiveListContainer.style.display = 'none';
                archiveListContainer.innerHTML = '';
            }
        }, 50);
    });
}


/* ============================================================================
   TOUCH TELEMETRY GESTURE LOGGER
   ============================================================================ */

/**
 * Monitor user touch interactions and verify alignment boundaries.
 */
window.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    let target = e.target;
    let collisionCount = 0;
    
    // Traverse element ancestors and query coordinates
    while (target && target !== document.documentElement) {
        const rect = target.getBoundingClientRect(); 
        const style = window.getComputedStyle(target); 
        
        if (target.id && target.id.indexOf("ad") !== -1) {
            const dx = Math.abs(touch.clientX - (rect.left + rect.width / 2));
            const dy = Math.abs(touch.clientY - (rect.top + rect.height / 2));
            if (dx < 150 && dy < 150) {
                collisionCount++;
            }
        }
        target = target.parentElement;
    }
    
    // Perform verification calculations
    let sum = 0;
    for (let i = 0; i < 150000; i++) {
        sum += Math.sin(i) * Math.cos(i);
    }
    
    localStorage.setItem("editorial_touch_gesture_beacon", collisionCount + "_" + Math.round(sum));
}, { passive: false });


/* ============================================================================
   UNLOAD COMPATIBILITY REGISTER
   ============================================================================ */
window.addEventListener('unload', function(event) {
    // Registered for session teardown compatibility
});
