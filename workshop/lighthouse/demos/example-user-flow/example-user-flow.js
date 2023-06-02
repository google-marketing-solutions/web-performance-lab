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
import { startFlow, desktopConfig } from 'lighthouse';

// Setup the browser and Lighthouse.
console.log('Starting Puppeteer browser ...');
const browser = await puppeteer.launch({
  headless: 'false',
});

// Setup page with a specific size
const page = await browser.newPage();

// Setup Puppeteer Testing Library for desktop
const flow = await startFlow(page, {
  config: desktopConfig,
  flags: { screenEmulation: { disabled: true } },
});

// Navigate to the landing page.
console.log('# Navigate to page ...');
await flow.navigate('https://google.github.io/coding-with-chrome/?home');

// Click the Game Editor Button and wait for the game editor page.
console.log('# Click on Game Editor Button');
await flow.startTimespan();
await page.waitForSelector('a[href="#/game_editor"]');
await page.evaluate(() => {
  const button = document.querySelector('a[href="#/game_editor"]');
  button.click();
});
await page.waitForSelector(
  'button[data-file="assets/examples/phaser/Bouncing Ball.xml"]'
);
await flow.endTimespan();

// Navigate to game editor page to capture the full page load.
console.log('# Full navigate to game editor page:' + page.url());
await flow.navigate(page.url());

// Load the example file and wait for the Blockly editor to be ready.
console.log('# Click on Example File Button');
await flow.startTimespan();
await page.evaluate(() => {
  const button = document.querySelector(
    'button[data-file="assets/examples/phaser/Bouncing Ball.xml"]'
  );
  button.click();
});
await page.waitForSelector('.blocklyWidgetDiv');
await flow.endTimespan();

// Capture snapshot after the editor is ready.
console.log('# 1. Snapshot of running demo ...');
await flow.snapshot();

// Navigate to game editor page to capture the full page load.
console.log('# Full navigate to running demo: ' + page.url());
await flow.navigate(page.url());

// Capture snapshot after the editor is ready.
console.log('# 2. Snapshot of running demo ...');
await flow.snapshot();

// Store the report and flow result.
console.log('Writing report and flow result to result/ ...');
writeFileSync('result/report.html', await flow.generateReport());
writeFileSync(
  'result/flow-result.json',
  JSON.stringify(await flow.createFlowResult(), null, 2)
);

// Cleanup and close browser.
await browser.close();
