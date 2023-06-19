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

// Define global variables.
let interactionButtonStartTime = performance.now();
let interactionInputStartTime = performance.now();

/**
 * Blocks the main thread for a given duration.
 * @param {number} duration
 */
function blockMainThread(duration) {
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {
    // Perform no operation, creating a busy-waiting loop
  }
}

/**
 * Handles the button click event and measures the time to the next paint.
 * @param {Event} event
 * @param {number} delay
 */
function handleButtonClick(event, delay) {
  // Store the start time of the interaction.
  interactionButtonStartTime = performance.now();

  // Disable the button for the given delay, if any.
  const buttonElement = event.target;
  buttonElement.disabled = true;
  window.setTimeout(() => {
    buttonElement.disabled = false;
  }, delay + 100);

  // Block the main thread for the given delay, if any.
  if (delay) {
    blockMainThread(delay);
  }

  // Request animation frame to measure the time to the next paint.
  requestAnimationFrame(() => {
    const interactionEndTime = performance.now();
    const interactionTime = interactionEndTime - interactionButtonStartTime;
    const resultElement = document.getElementById('click_result');
    resultElement.style.color = 'black';
    resultElement.textContent = `Interaction to Next Paint: ${interactionTime.toFixed(
      2
    )}ms`;
  });
}

/**
 * Handles the key input event and measures the time to the next paint.
 * @param {Event} event
 * @param {number} delay
 */
function handleTextInput(event, delay) {
  // Store the start time of the interaction.
  interactionInputStartTime = performance.now();

  // Block the main thread for the given delay, if any.
  if (delay) {
    blockMainThread(delay);
  }

  // Request animation frame to measure the time to the next paint.
  requestAnimationFrame(() => {
    const interactionEndTime = performance.now();
    const interactionTime = interactionEndTime - interactionInputStartTime;
    const resultElement = document.getElementById('text_input_result');
    resultElement.style.color = 'black';
    resultElement.textContent = `Interaction to Next Paint: ${interactionTime.toFixed(
      2
    )}ms`;
  });
}

/**
 * Initializes the demo buttons and event listeners.
 */
window.addEventListener('load', () => {
  // Add event listener to all buttons.
  document
    .getElementById('button_without_delay')
    ?.addEventListener('click', handleButtonClick);
  document
    .getElementById('button_with_200_delay')
    ?.addEventListener('click', (event) => {
      event.target.disabled = true;
      return handleButtonClick(event, 200);
    });
  document
    .getElementById('button_with_500_delay')
    ?.addEventListener('click', (event) => {
      event.target.disabled = true;
      return handleButtonClick(event, 500);
    });
  document
    .getElementById('button_with_5000_delay')
    ?.addEventListener('click', (event) => {
      event.target.disabled = true;
      return handleButtonClick(event, 5000);
    });

  // Add event listener to all text inputs.
  document
    .getElementById('input_without_delay')
    ?.addEventListener('input', handleTextInput);
  document
    .getElementById('input_with_200_delay')
    ?.addEventListener('input', (event) => {
      return handleTextInput(event, 200);
    });
  document
    .getElementById('input_with_500_delay')
    ?.addEventListener('input', (event) => {
      return handleTextInput(event, 500);
    });
  document
    .getElementById('input_with_5000_delay')
    ?.addEventListener('input', (event) => {
      return handleTextInput(event, 5000);
    });
});
