/**
    Copyright 2023 Google LLC

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
**/
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
