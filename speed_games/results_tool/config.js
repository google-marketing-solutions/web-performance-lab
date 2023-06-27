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
 * @author ghys@google.com (Lou Ghys)
 */

// Fill this in with the url/name combination of the pubs
// This has to be done before build time
const CANDIDATES_NAMES_MAP = {
  'https://example1.org': 'Example Team 1',
  'https://example2.org': 'Example Team 2',
  'https://example3.org': 'Example Team 3',
};

// Example of a canditate name map
// const CANDIDATES_NAMES_MAP = {
//     "https://cool-news-pub.glitch.me": "YourNews.be",
//     "https://amazing-video-pub.glitch.me": "Videograph",
//     "https://fantastic-retail-pub.glitch.me": "Emma's shop",
// }

export default CANDIDATES_NAMES_MAP;
