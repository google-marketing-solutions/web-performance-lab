/* Copyright (c) 2023 by Florin Pop (https://codepen.io/FlorinPop17/pen/LzYNWa)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

export default () => {
    document.querySelector('#counter-scene').style.display = 'block';
    document.querySelector('#scene').style.display = 'none'
    document.querySelector('#input-scene').style.display = 'none'
    document.querySelector('#waiting-scene').style.display = 'none'

    const nums = document.querySelectorAll('.nums span');
    const counter = document.querySelector('.counter');
    const finalMessage = document.querySelector('.final');

    function resetDOM() {
        counter.classList.remove('hide');
        finalMessage.classList.remove('show');

        nums.forEach(num => {
            num.classList.value = '';
        });
        nums[0].classList.add('in');
    }

    resetDOM();
    runAnimation();

    function runAnimation() {
        nums.forEach((num, idx) => {
            const penultimate = nums.length - 1;
            num.addEventListener('animationend', (e) => {
                if (e.animationName === 'goIn' && idx !== penultimate) {
                    num.classList.remove('in');
                    num.classList.add('out');
                } else if (e.animationName === 'goOut' && num.nextElementSibling) {
                    num.nextElementSibling.classList.add('in');
                } else {
                    counter.classList.add('hide');
                    finalMessage.classList.add('show');
                }
            });
        });
    }
}