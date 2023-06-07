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

import Infiniship from "@yuigoto/infiniship-js";
import sortBy from 'lodash/fp/sortBy'
import mean from 'lodash/fp/mean'
import JSConfetti from 'js-confetti'
import CANDIDATES_NAMES_MAP from '../config'
import runCountdown from './libraries/countdown'
import { parse as parseCSV } from 'papaparse'


const CONFIG = {
    SETTINGS: {
        duration: 13,
        sprites: {
            h: 48,
            w: 48
        }
    },
    SCENES: [
        {
            title: "Largest Contentful Paint",
            bg: "assets/space-background-red.png",
            dataKey: "chromeUserTiming.LargestContentfulPaint"
        },
        {
            title: "Time to first Ad request",
            bg: "assets/space-background-grey.png",
            dataKey: "userTime.gpt-ad-request"
        },
        {
            title: "First Contentful Paint",
            bg: "assets/space-background-orange.png",
            dataKey: "chromeUserTiming.firstContentfulPaint"
        },
    ],
}


/**
 * 
 * 
 * 
 * Actual Code
 * 
 * 
 * 
 */
const globalVariables = {
    globalInputData: undefined,
    players: undefined,
    selectedSceneIndex: undefined,
    shipGenerator: new Infiniship(),
    confettiGenerator: new JSConfetti()
}

const HELPER_FUNCTIONS = {
    randomBetween: (min, max) => (Math.random() * (max - min) + min).toFixed(4),
    randomColor: () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

const displayAndSetPlayers = () => {
    const container = document.querySelector('#player-container')
    const template = document.querySelector('#player-template')

    globalVariables.players = Object.keys(globalVariables.globalInputData).map((url, index) => {
        return {
            url: url,
            name: CANDIDATES_NAMES_MAP[url] ?? url,
            index: (index + 1).toString(),
            color: HELPER_FUNCTIONS.randomColor()
        }
    })

    globalVariables.players.forEach((candidate, index) => {
        const item = template.content.cloneNode(true);
        item.querySelector('.index').textContent = candidate.index
        item.querySelector('.index').style.background = candidate.color
        item.querySelector('.name').textContent = `${candidate.name}`
        item.querySelector('.url').textContent = `${candidate.url}`
        // item.querySelector('.value').textContent = candidate.value.toFixed(2)
        container.appendChild(item);
    });

}

const runScene = (settings, candidates) => {
    const scores = candidates.map(c => c.value)
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const candidateCount = candidates.length
    const duration = CONFIG.SETTINGS.duration

    document.querySelector('#counter-scene').style.display = 'none'
    document.querySelector('#scene').style.display = 'block'
    document.querySelector('.leaderboard').style.display = 'none'
    document.querySelector('#ship-container').innerHTML = ""
    document.querySelector('#leaderboard-container').innerHTML = ""
    document.querySelector('.background-title').innerHTML = settings.title

    setTimeout(() => { onEndRace() }, (duration * 1000) + 500);

    candidates.forEach((candidate, index) => {
        const candidateScore = candidate.value;
        const value = (candidateScore - minScore) / (maxScore - minScore)

        const ship = document.createElement('div');
        const p = document.createElement('p')
        const img = globalVariables.shipGenerator.generateShipImage();

        ship.style.animationDuration = `${HELPER_FUNCTIONS.randomBetween(1, 3)}s`
        ship.style.animationDelay = `${HELPER_FUNCTIONS.randomBetween(0, .2)}s`
        ship.classList.add('ship')
        ship.style.background = candidate.color
        img.height = CONFIG.SETTINGS.sprites.h;
        img.width = CONFIG.SETTINGS.sprites.w;
        p.innerHTML = candidate.index.toString()
        ship.append(p)
        ship.append(img)
        document.querySelector('#ship-container').append(ship);

        const POSITION = `${((value) * 30) + 2}vh`

        ship.style.top = `calc(90vh - ${CONFIG.SETTINGS.sprites.h}px)`
        ship.style.left = `${(index * (90 / candidateCount)) + 5}vw`
        const key = `ship-${index}`
        ship.id = key

        setTimeout(() => {
            const r = () => HELPER_FUNCTIONS.randomBetween(0.2, 0.99)
            const y = () => HELPER_FUNCTIONS.randomBetween(0.2, 0.99)
            ship.style.transition = `all ${duration}s cubic-bezier(${r()},${r()},${y()},${y()})`
            // ship.style.transition = `all ${duration}s ease`
            ship.style.top = POSITION;
        }, 200)
    })

    const onEndRace = () => {
        document.querySelector('.leaderboard').style.display = 'block'
        const container = document.querySelector('#leaderboard-container')
        const template = document.querySelector('#leaderboard-template')
        const sorted = sortBy(x => x.value, Object.assign({}, candidates))

        setTimeout(() => {
            Array.from(document.querySelectorAll('.ship')).forEach(element => {
                element.style.transition = 'none'
                element.style.animation = 'none'
            })
        }, 10);

        shootConfetti();

        sorted.forEach((candidate, index) => {
            const item = template.content.cloneNode(true);
            item.querySelector('.place').textContent = `${index + 1}. `
            item.querySelector('.index').textContent = candidate.index.toString()
            item.querySelector('.index').style.background = candidate.color
            item.querySelector('.name').textContent = `${candidate.name}: `
            item.querySelector('.value').textContent = candidate.value.toFixed(2)
            container.appendChild(item);
        });
        settings.callback?.();
    }

}

document.querySelector("#input").addEventListener("input", (event) => {
    parseCSV(event.target.files[0], {
        header: true,
        complete: inputCallback
    });
})

const inputCallback = (raw) => {
    const data = raw.data
    data.shift(); // remove header from data
    let result = {}
    raw.data.forEach(row => {
        const url = row['URL'];
        Object.keys(row).forEach(key => {
            if (typeof result?.[url] === 'undefined') {
                result[url] = {}
            }
            if (typeof result?.[url]?.[key] === 'undefined') {
                result[url][key] = []
            }
            result[url][key] = [
                ...((result[url] ?? {})[key] ?? []),
                Number(row[key])
            ]
        })
    })
    globalVariables.globalInputData = result;
    document.querySelector('#input-scene').style.display = 'none'
    document.querySelector('#waiting-scene').style.display = 'none'
    document.querySelector('#player-scene').style.display = 'block'
    displayAndSetPlayers();
}


const setup = () => {
    document.querySelector('#counter-scene').style.display = 'none'
    document.querySelector('#scene').style.display = 'none'
    document.querySelector('#waiting-scene').style.display = 'block'
    document.querySelector('#player-scene').style.display = 'none'
}

window.addEventListener('keyup', (event) => {
    const isConfettitDebugKey = event.key === 'c';
    const isSpacebarKey = event.code === 'Space'
    const isSceneSelectionKey = event.code !== 'Space' && Number(event.key) <= CONFIG.SCENES.length

    if (isSceneSelectionKey) {
        globalVariables.selectedSceneIndex = Number(event.key) - 1
        const scene = CONFIG.SCENES[Number(event.key) - 1]

        document.querySelector('#player-scene').style.display = 'none'
        document.querySelector('#counter-scene').style.display = 'none'
        document.querySelector('#scene').style.display = 'none'
        document.querySelector('#waiting-scene').style.display = 'block'
        document.querySelector('#leaderboard-container').innerHTML = ""

        document.querySelector('body').style.backgroundImage = `url(${scene.bg})`;
        document.querySelector('#waiting-scene').querySelector('.title').innerHTML = scene.title
        document.querySelector('#scene').querySelector('.background-title').innerHTML = scene.title

    }

    if (isConfettitDebugKey) {
        shootConfetti()
    }


    if (isSpacebarKey) {
        const sceneConfig = CONFIG.SCENES[globalVariables.selectedSceneIndex]
        const candidates = getCandidates();
        runCountdown();
        setTimeout(() => {
            runScene({ title: scene.title, callback: () => { } }, candidates);
        }, 5000);
    }
})

const getCandidates = () => {
    const scene = CONFIG.SCENES[globalVariables.selectedSceneIndex]
    let candidates = {}
    Object.keys(globalVariables.globalInputData).forEach(rowKey => {
        let values = globalVariables.globalInputData[rowKey][scene.dataKey] ?? [];
        values = values.filter(x => !Number.isNaN(x) && Number(x) > 0)
        let medianValue = values.length > 0 ? mean(values) : undefined;
        if (medianValue !== undefined) {
            candidates[rowKey] = medianValue
        } else {
            console.error(rowKey, ' has no median value!')
        }
    })
    let arr = Object.keys(candidates).map((key, index) => {
        const playerObject = globalVariables.players.find(p => p.url === key)
        return {
            index: playerObject.index,
            url: key,
            name: playerObject.name,
            value: candidates[key],
            color: playerObject.color
        }
    })
    arr = sortBy(x => x.index, arr)
    return arr
}


const shootConfetti = () => {
    //https://github.com/loonywizard/js-confetti
    globalVariables.confettiGenerator.addConfetti({ emojis: ['🏆', '🥈', '🥉', '🥇'], })
}

setup();