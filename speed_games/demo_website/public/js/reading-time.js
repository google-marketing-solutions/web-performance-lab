/**
 *  This script calculates reading time for the articles.
 */
jQuery(function () {
  setTimeout(function(){addReadingTime()}, 1);
});
function addReadingTime() {
  $("article").each(function () {
    let _this = this;
    if ($(_this).has(".card-body").length > 0) {
      $(_this)
        .find(".card-body .card-title")
        .after("<div class='card-text'><div>");
      $(_this)
        .find(".card-body .card-text")
        .append("<span class='text-muted'></span>");
    } else {
      $(_this).find("h2").after("<span class='text-muted'></span>");
    }
    $(_this).readingTime({
      wordsPerMinute: 100,
      prependTimeString: "Reading time: ",
      lessThanAMinuteString: "<1 min",
      readingTimeTarget: $(_this).find(".text-muted"),
      success: function (data) {
        $(_this).find(".text-muted").show();
      },
      error: function (data) {
        $(_this).find(".text-muted").remove();
      },
    });
  });
}
