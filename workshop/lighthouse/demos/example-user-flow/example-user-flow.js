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

import { writeFileSync } from 'fs';
import puppeteer from 'puppeteer';
import * as pptrTestingLibrary from 'pptr-testing-library';
import { startFlow, desktopConfig } from 'lighthouse';

const { getDocument, queries } = pptrTestingLibrary;

// Setup the browser and Lighthouse.
console.log('Starting Puppeteer browser ...');
const browser = await puppeteer.launch({
  headless: 'new',
});
const page = await browser.newPage();
const flow = await startFlow(page, {
  // If Puppeteer is emulating a mobile device then we can remove the next line.
  config: desktopConfig,
  flags: { screenEmulation: { disabled: true } },
});

// Navigate to the landing page.
console.log('# Navigate to page ...');
await flow.navigate('https://google.github.io/coding-with-chrome/?home');

// Click the Game Editor Button
console.log('# Click on Game Editor Button');
await flow.startTimespan();
async () => {
  const button = await page.waitForSelector('a[href="#/game_editor"]');
  await button.click();
  await button.dispose();
  await page.waitForNavigation();
};
await flow.endTimespan();

// Navigate to game editor page
console.log('# Navigate to game editor page ...');
await flow.navigate(
  'https://google.github.io/coding-with-chrome/#/game_editor'
);

// Capture snapshot
console.log('# Snapshot ...');
await flow.snapshot();

// Click the Game Editor Button
console.log('# Click on Example File Button');
await flow.startTimespan();
async () => {
  const button = await page.waitForSelector(
    'button[data-file="assets/examples/phaser/Bouncing Ball.xml"]'
  );
  await button.click();
  await button.dispose();
  await page.waitForNavigation();
};
await flow.endTimespan();

// Get the comprehensive flow report.
console.log('Writing report and flow result to result/ ...');
writeFileSync('result/report.html', await flow.generateReport());
// Save results as JSON.
writeFileSync(
  'result/flow-result.json',
  JSON.stringify(await flow.createFlowResult(), null, 2)
);

// Cleanup.
await browser.close();
