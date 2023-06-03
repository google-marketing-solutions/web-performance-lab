/**
 * @license Copyright 2023 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */

// JavaScript code for injecting ads
document.addEventListener('DOMContentLoaded', function () {
  window.setTimeout(() => {
    const adsContainer1 = document.getElementById('adsContainer1');
    adsContainer1.innerHTML = `<div class="ads">Advertisement<hr>Page speed so fast, it'll make your head spin!</div>`;
  }, 250);

  window.setTimeout(() => {
    const adsContainer2 = document.getElementById('adsContainer2');
    adsContainer2.innerHTML = `<div class="ads">Advertisement<hr>Slow pages, no more! Experience the speed galore!</div>`;
  }, 500);
});
