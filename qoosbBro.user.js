// ==UserScript==
// @name         QOOSb Highlight
// @namespace    https://holov.in/
// @version      0.0.6
// @description  Browser helper
// @author       Alex Holovin
// @match        https://www.google.com/search?q=*
// @grant        none
// @require      https://rawgit.com/farzher/fuzzysort/master/fuzzysort.js
// ==/UserScript==

// copy lib
const libFuzzy = fuzzysort;

(function (libFuzzy) {
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

    // TODO try back to innerHTML
    function tryHighlightGoogle(block) {
        const html = block.textContent;
        const htmlArrayImmutableForSearch = html.split(' ').map(word => word.replace(/((?![0-9A-zА-я-]).)*/gm, ''));
        const htmlArray = html.split(' ');

        for (const answer of answersToFuzzy) {
            const simplifiedAnswer = answer.replace(/(?![A-zА-я0-9\-+=:;., ])./g, '');

            let lastIndex = 0;
            let results = libFuzzy.go(simplifiedAnswer, htmlArrayImmutableForSearch, { threshold: -10000 });

            results.map(result => {
                if (result.target.length > 1) {
                    lastIndex = htmlArrayImmutableForSearch.indexOf(result.target, lastIndex);

                    if (lastIndex !== -1) {
                        htmlArray[lastIndex] = `<span class="qoosb-google-word qoosb-common-padding">${htmlArray[lastIndex]}</span>`;
                    } else {
                        console.warn('Try find, but something wrong!');
                    }

                    lastIndex = 0;
                }

            });

            console.warn('RESULTS', results);

            if (results.total > 0) {
                // highlight whole block
                block.innerHTML = `<div class="qoosb-google-block">${htmlArray.join(' ')}</div>`;
            }
        }
    }

    function tryHighlightCommon(block) {
        if (multiIncludes(block.textContent.toLowerCase(), answersCommon)) {
            block.className += ' qoosb-common-block qoosb-common-padding';
        }
    }

    function insertStyles(styles) {
        const css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = styles;
        document.body.appendChild(css)
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
    const answers = decodeURI(url.searchParams.get('x-answers')).toLowerCase();

    const answersCommon = answers.split('|||');
    const answersToFuzzy = answers
        .split(/(\|{3})|( )/gm)
        .filter(str =>
            !!str &&
            !!str.replace(' ', '') &&
            str !== '|||' &&
            str.length > 1);

    console.log('ANSWERS: ', answersCommon, answersToFuzzy);

    insertStyles(styles);
    processBlock(document.body.children);

})(libFuzzy);
