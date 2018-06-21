// ==UserScript==
// @name         QOOSb Highlight
// @namespace    https://holov.in/
// @version      0.0.5
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

        for (let answer of answers) {
            let simplifiedAnswer = answer.replace(/(?![A-zА-я0-9\-+=:;., ])./g, '');

            // NLP-mode
            simplifiedAnswer = simplifiedAnswer.length > 5
                ? simplifiedAnswer.slice(0, -2)
                : simplifiedAnswer;

            alert(simplifiedAnswer);

            if (!html.includes(simplifiedAnswer) || !simplifiedAnswer) {
                continue;
            }

            block.innerHTML = html.replace(new RegExp(answer, 'g'), `<span class="qoosb-google-word qoosb-common-padding">${answer}</span>`);
            block.innerHTML = `<div class="qoosb-google-block">${block.innerHTML}</div>`;
        }
    }

    function tryHighlightCommon(block) {
        if (multiIncludes(block.textContent.toLowerCase(), answers)) {
            block.className += ' qoosb-common-block qoosb-common-padding';
        }
    }

    function insertStyles(styles) {
        const css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = styles;
        document.body.appendChild(css)
    }

    function removeExtraGoogleBlocks() {
        // remove extra search
        const extraElements = document.getElementsByClassName('xpdopen');

        for (const item of extraElements) {
            item.remove();
        }
    }

    const styles = `
        .qoosb-common-padding {
            display: inline-block;
            padding: 3px;
        }

        .qoosb-common-block {
            background: #FFF9C4;
            wordWrap: normal;
            whiteSpace: initial;
        }

        .qoosb-google-word {
            font-size: 16px;
            color: #FFEB3B;
            background: #212121;
        }

        .qoosb-google-block {
            border: 1px solid red;
            border-radius: 8px;
            padding: 8px;
        }
    `;

    const url = new URL(window.location.href);
    const answers = decodeURI(url.searchParams.get('x-answers'))
        .toLowerCase()
        .split('|||');

    // TODO: rework
    // removeExtraGoogleBlocks();
    insertStyles(styles);
    processBlock(document.body.children);
})();
