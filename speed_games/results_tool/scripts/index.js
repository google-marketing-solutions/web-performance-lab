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

import Infiniship from '@yuigoto/infiniship-js';
import sortBy from 'lodash/fp/sortBy';
import JSConfetti from 'js-confetti';
import CANDIDATES_NAMES_MAP from '../config';
import runCountdown from './libraries/countdown';
import Papa from 'papaparse';

// Scene configuration
const CONFIG = {
  SETTINGS: {
    duration: 13,
    sprites: {
      h: 48,
      w: 48,
    },
  },
  SCENES: [
    {
      title: 'Largest Contentful Paint',
      bg: 'assets/space-background-red.png',
      dataKey: 'chromeUserTiming.LargestContentfulPaint',
    },
    {
      title: 'Time to first Ad request',
      bg: 'assets/space-background-grey.png',
      dataKey: 'userTime.gpt-ad-request',
    },
    {
      title: 'First Contentful Paint',
      bg: 'assets/space-background-orange.png',
      dataKey: 'chromeUserTiming.firstContentfulPaint',
    },
  ],
};

// Excluded keys from the csv data, which are not used.
const excludedKeys = ['Images', 'rendered-html'];

// Global variables used throughout the script and the scenes.
const globalVariables = {
  globalInputData: {},
  teamNameMap: new Map(),
  players: undefined,
  selectedSceneIndex: undefined,
  shipGenerator: new Infiniship(),
  confettiGenerator: new JSConfetti(),
};

// Helper functions used throughout the script and the scenes.
const HELPER_FUNCTIONS = {
  randomBetween: (min, max) => (Math.random() * (max - min) + min).toFixed(4),
  randomColor: () => `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  median: (array) => {
    const mid = Math.floor(array.length / 2);
    const sorted = [...array].sort((a, b) => a - b);
    return array.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  },
};

/**
 * Map the team name to the url and store it in a map.
 */
const displayAndSetPlayers = () => {
  const container = document.querySelector('#player-container');
  const template = document.querySelector('#player-template');

  globalVariables.players = Object.keys(globalVariables.globalInputData).map(
    (url, index) => {
      return {
        url: url,
        name:
          globalVariables.teamNameMap.get(url) ||
          CANDIDATES_NAMES_MAP[url] ||
          url,
        index: (index + 1).toString(),
        color: HELPER_FUNCTIONS.randomColor(),
      };
    }
  );

  globalVariables.players.forEach((candidate, index) => {
    const item = template.content.cloneNode(true);
    item.querySelector('.index').textContent = candidate.index;
    item.querySelector('.index').style.background = candidate.color;
    item.querySelector('.name').textContent = `${candidate.name}`;
    item.querySelector('.url').textContent = `${candidate.url}`;
    container.appendChild(item);
  });
};

/**
 * Run the scene with the given settings and candidates.
 * @param {Object} settings
 * @param {Object} candidates
 */
const runScene = (settings, candidates) => {
  const scores = candidates.map((c) => c.value);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const candidateCount = candidates.length;
  const duration = CONFIG.SETTINGS.duration;

  document.querySelector('#counter-scene').style.display = 'none';
  document.querySelector('#scene').style.display = 'block';
  document.querySelector('.leaderboard').style.display = 'none';
  document.querySelector('#ship-container').innerHTML = '';
  document.querySelector('#leaderboard-container').innerHTML = '';
  document.querySelector('.background-title').innerHTML = settings.title;

  setTimeout(() => {
    onEndRace();
  }, duration * 1000 + 500);

  candidates.forEach((candidate, index) => {
    const candidateScore = candidate.value;
    const value = (candidateScore - minScore) / (maxScore - minScore);

    // Candidate number
    const p = document.createElement('p');
    p.innerHTML = candidate.index.toString();

    // Ship image
    const img = globalVariables.shipGenerator.generateShipImage();
    img.height = CONFIG.SETTINGS.sprites.h;
    img.width = CONFIG.SETTINGS.sprites.w;

    // Ship object
    const ship = document.createElement('div');
    ship.style.animationDuration = `${HELPER_FUNCTIONS.randomBetween(1, 3)}s`;
    ship.style.animationDelay = `${HELPER_FUNCTIONS.randomBetween(0, 0.2)}s`;
    ship.classList.add('ship');
    ship.style.background = candidate.color;
    ship.append(p);
    ship.append(img);
    ship.style.top = `calc(90vh - ${CONFIG.SETTINGS.sprites.h}px)`;
    ship.style.left = `${index * (90 / candidateCount) + 5}vw`;
    ship.id = `ship-${index}`;
    document.querySelector('#ship-container').append(ship);

    // Ship animation
    setTimeout(() => {
      const r = () => HELPER_FUNCTIONS.randomBetween(0.2, 0.99);
      const y = () => HELPER_FUNCTIONS.randomBetween(0.2, 0.99);
      ship.style.transition = `all ${duration}s cubic-bezier(${r()},${r()},${y()},${y()})`;
      ship.style.top = `${value * 30 + 2}vh`;
    }, 200);
  });

  const onEndRace = () => {
    document.querySelector('.leaderboard').style.display = 'block';
    const container = document.querySelector('#leaderboard-container');
    const template = document.querySelector('#leaderboard-template');
    const sorted = sortBy((x) => x.value, Object.assign({}, candidates));

    setTimeout(() => {
      Array.from(document.querySelectorAll('.ship')).forEach((element) => {
        element.style.transition = 'none';
        element.style.animation = 'none';
      });
    }, 10);

    shootConfetti();

    sorted.forEach((candidate, index) => {
      const item = template.content.cloneNode(true);
      item.querySelector('.place').textContent = `${index + 1}. `;
      item.querySelector('.index').textContent = candidate.index.toString();
      item.querySelector('.index').style.background = candidate.color;
      item.querySelector('.name').textContent = `${candidate.name}: `;
      item.querySelector('.value').textContent = candidate.value.toFixed(2);
      container.appendChild(item);
    });
    settings.callback?.();
  };
};

/**
 * Adds a listener to the input element to upload and parse the CSV file.
 */
document.querySelector('#input').addEventListener('input', (event) => {
  const numberOfFiles = event.target.files.length;
  let filesParsed = 0;
  for (const file of event.target.files) {
    Papa.parse(file, {
      header: true,
      complete: (fileData) => {
        handleFileData(fileData, file.name);
        if (filesParsed++ === numberOfFiles - 1) {
          showPlayerScene();
          displayAndSetPlayers();
        }
      },
      error: (error) => {
        if (filesParsed++ === numberOfFiles - 1) {
          showPlayerScene();
          displayAndSetPlayers();
        }
      },
    });
  }
});

/**
 * @param {Object} fileData
 * @param {String} fileName
 */
const handleFileData = (fileData, fileName) => {
  fileData.data.forEach((row) => {
    const { URL, Team, ...data } = row;
    if (!URL || URL.length === 0) {
      console.warn('Skipping invalid row', row, 'in file', fileName);
    } else {
      console.debug('Parsing row', row, 'in file', fileName);

      // Make sure we have a place to store the data.
      if (!globalVariables.globalInputData[URL]) {
        globalVariables.globalInputData[URL] = {};
      }

      // Store the team name, if we have one.
      if (Team && Team.length > 0) {
        globalVariables.teamNameMap.set(URL, Team);
      }

      // Store the data, but skipping special keys and not overriding existing data.
      Object.entries(data).forEach(([key, value]) => {
        if (!excludedKeys.includes(key)) {
          if (!globalVariables.globalInputData[URL][key]) {
            globalVariables.globalInputData[URL][key] = [];
          }
          globalVariables.globalInputData[URL][key].push(Number(value));
        }
      });
    }
  });
};

/**
 * Toggles the player / team overlay.
 */
const togglePlayerScene = () => {
  showPlayerScene(
    document.querySelector('#player-scene').style.display === 'none'
  );
};

/**
 * @param {boolean} visible
 */
const showPlayerScene = (visible = true) => {
  document.querySelector('#input-scene').style.display = 'none';
  document.querySelector('#waiting-scene').style.display = 'none';
  document.querySelector('#player-scene').style.display = visible
    ? 'block'
    : 'none';
};

const setup = () => {
  document.querySelector('#counter-scene').style.display = 'none';
  document.querySelector('#scene').style.display = 'none';
  document.querySelector('#waiting-scene').style.display = 'block';
  document.querySelector('#player-scene').style.display = 'none';
};

/**
 * Add the event listeners for the different keys.
 */
window.addEventListener('keyup', (event) => {
  const isPlayerDebugKey = event.key === 'p';
  const isConfettitDebugKey = event.key === 'c';
  const isSpacebarKey = event.code === 'Space';
  const isSceneSelectionKey =
    event.code !== 'Space' && Number(event.key) <= CONFIG.SCENES.length;

  if (isSceneSelectionKey) {
    globalVariables.selectedSceneIndex = Number(event.key) - 1;
    const scene = CONFIG.SCENES[Number(event.key) - 1];

    document.querySelector('#player-scene').style.display = 'none';
    document.querySelector('#counter-scene').style.display = 'none';
    document.querySelector('#scene').style.display = 'none';
    document.querySelector('#waiting-scene').style.display = 'block';
    document.querySelector('#leaderboard-container').innerHTML = '';

    document.querySelector('body').style.backgroundImage = `url(${scene.bg})`;
    document.querySelector('#waiting-scene').querySelector('.title').innerHTML =
      scene.title;
    document
      .querySelector('#scene')
      .querySelector('.background-title').innerHTML = scene.title;
  } else if (isConfettitDebugKey) {
    shootConfetti();
  } else if (isSpacebarKey) {
    const candidates = getCandidates();
    runCountdown();
    setTimeout(() => {
      runScene({ title: scene.title, callback: () => {} }, candidates);
    }, 5000);
  } else if (isPlayerDebugKey) {
    togglePlayerScene();
  }
});

/**
 * Get the candidates for the current scene.
 * @returns {Object}
 */
const getCandidates = () => {
  const scene = CONFIG.SCENES[globalVariables.selectedSceneIndex];
  let candidates = {};
  Object.keys(globalVariables.globalInputData).forEach((rowKey) => {
    let values = globalVariables.globalInputData[rowKey][scene.dataKey] ?? [];
    values = values.filter((x) => !Number.isNaN(x) && Number(x) > 0);
    let medianValue =
      values.length > 0 ? HELPER_FUNCTIONS.median(values) : undefined;
    if (medianValue !== undefined) {
      candidates[rowKey] = medianValue;
    } else {
      console.error(rowKey, ' has no median value!');
    }
  });
  let arr = Object.keys(candidates).map((key, index) => {
    const playerObject = globalVariables.players.find((p) => p.url === key);
    return {
      index: playerObject.index,
      url: key,
      name: playerObject.name,
      value: candidates[key],
      color: playerObject.color,
    };
  });
  arr = sortBy((x) => Number(x.index), arr);
  return arr;
};

const shootConfetti = () => {
  //https://github.com/loonywizard/js-confetti
  globalVariables.confettiGenerator.addConfetti({
    emojis: ['🏆', '🥈', '🥉', '🥇'],
  });
};

setup();
