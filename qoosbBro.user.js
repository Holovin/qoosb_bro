// ==UserScript==
// @name         QOOSb Highlight
// @namespace    https://holov.in/
// @version      0.0.2
// @description  Browser helper
// @author       Alex Holovin
// @match        https://www.google.com/search?q=*
// @match        https://yandex.com/search/?text=*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function multiIncludes(text, values) {
        return values.some(function (val) {
            return text.includes(val);
        });
    }

    function processBlock(block) {
        if (block instanceof HTMLCollection) {
            for (const b of block) {
                processBlock(b);
            }

            return;
        }

        if (block instanceof HTMLElement) {
            if (multiIncludes(block.tagName, ['SCRIPT', 'STYLE', 'CITE']) || !block.textContent) {
                return;
            }

            if (block.children.length > 0) {
                for (const b of block.children) {
                    processBlock(b);
                }

                return;
            }

            if (multiIncludes(block.textContent.toLowerCase(), answers)) {
                block.style.background = 'yellow';
                block.style.fontSize = '22px';
                block.style.wordWrap = 'normal';
                block.style.whiteSpace = 'initial';
            }
        }
    }

    const url = new URL(window.location.href);
    const answers = decodeURI(url.searchParams.get('x-answers')).toLowerCase().split('|||');

    processBlock(document.body.children);
})();