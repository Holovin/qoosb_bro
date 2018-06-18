// ==UserScript==
// @name         QOOSb Highlight
// @namespace    https://holov.in/
// @version      0.0.3
// @description  Browser helper
// @author       Alex Holovin
// @match        https://www.google.com/search?q=*
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
            if (multiIncludes(block.nodeName, ['SCRIPT', 'STYLE', 'CITE']) || !block.textContent) {
                return;
            }

            if (block.nodeName === 'SPAN' && block.className === 'st') {
                tryHighlightGoogle(block);
                return;
            }

            if (block.children.length > 0) {
                for (const b of block.children) {
                    processBlock(b);
                }

                return;
            }

            tryHighlightCommon(block);
        }
    }

    function tryHighlightGoogle(block) {
        const html = block.innerHTML.toLowerCase();
        const styleWord = 'font-size: 16px;' +
                      'color: #FFEB3B;' +
                      'background: red;';

        const styleBlock = 'border: 1px solid red;' +
                           'border-radius: 8px;' +
                           'padding: 8px';

        for (let answer of answers) {
            if (!html.includes(answer)) {
                continue;
            }

            block.innerHTML = html.replace(answer,`<span style="${styleWord}">${answer}</span>`);
            block.innerHTML = `<div style="${styleBlock}">${block.innerHTML}</div>`;
            return;
        }
    }

    function tryHighlightCommon(block) {
        if (multiIncludes(block.textContent.toLowerCase(), answers)) {
            block.style.background = '#FFF176';
            block.style.wordWrap = 'normal';
            block.style.whiteSpace = 'initial';
        }
    }

    function removeExtraGoogleBlocks() {
        // remove extra search
        const extraElements = document.getElementsByClassName('xpdopen');

        for (const item of extraElements) {
            item.remove();
        }
    }

    const url = new URL(window.location.href);
    const answers = decodeURI(url.searchParams.get('x-answers')).toLowerCase().split('|||');

    removeExtraGoogleBlocks();
    processBlock(document.body.children);
})();