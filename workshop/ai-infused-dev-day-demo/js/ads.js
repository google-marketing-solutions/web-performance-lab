/* ============================================================================
   DYNAMIC GPT ADS ENGINE
   ============================================================================ */
var FAILSAFE_TIMEOUT = 3000;
var in_article_sizes = [[320, 320], [300, 250], 'fluid'];

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var sidebar_ad, leaderboard_ad;
var article_ads = [];

googletag.cmd.push(function () {
    sidebar_ad = googletag
        .defineSlot("/6353/ernberg/sidebar", [300, 600], "sidebar_ad")
        .addService(googletag.pubads());
    
    leaderboard_ad = googletag
        .defineSlot("/6353/ernberg/leaderboard", [728, 90], "leaderboard_ad")
        .addService(googletag.pubads());

    var leaderBoardSizeMapping = googletag
        .sizeMapping()
        .addSize([0, 0], [])
        .addSize([800, 0], [728, 90])
        .build();
    leaderboard_ad.defineSizeMapping(leaderBoardSizeMapping);

    var sidebarSizeMapping = googletag
        .sizeMapping()
        .addSize([0, 0], [])
        .addSize([500, 0], [300, 600])
        .build();
    sidebar_ad.defineSizeMapping(sidebarSizeMapping);

    var article_sizeMapping = googletag
        .sizeMapping()
        .addSize([0, 0], [320, 50])
        .addSize([500, 0], [[320, 320]])
        .build();

    // Define 25 dynamic ad slots
    for (var i = 25; i > 0; i--) {
        article_ads[i] = googletag
            .defineSlot("/6353/ernberg/article" + i, in_article_sizes, "article" + i)
            .addService(googletag.pubads());
    }
    article_ads[1].defineSizeMapping(article_sizeMapping);

    googletag.pubads().addEventListener("slotRequested", function() {
        // Silent in production
    });

    googletag.pubads().addEventListener('slotRenderEnded', function(event) {
        window.dispatchEvent(new CustomEvent("adSlotRendered", { detail: { slotId: event.slot.getSlotElementId() } }));
    });

    googletag.pubads().setPrivacySettings({nonPersonalizedAds: true});
    googletag.pubads().set('adsense_test_mode', 'on');
    
    googletag.pubads().disableInitialLoad();
    googletag.enableServices();
});

function requestAds() {
    googletag.cmd.push(function () {
        googletag.pubads().refresh();
    });
}

// Trigger ad requests immediately when the CMP signals consent is resolved
window.addEventListener("tcfConsentResolved", function() {
    requestAds();
});
