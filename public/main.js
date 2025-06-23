function getCharCodes(s) {
    return s.split('').map(c => c.charCodeAt(0)).join(', ');
}

function getWhitespaceDiff(s1, s2) {
    if (s1.replace(/\s/g, '') !== s2.replace(/\s/g, '')) {
        return null;
    }

    if (s1 === s2) {
        return null;
    }

    const s1Spaces = s1.replace(/[^\s]/g, '');
    const s2Spaces = s2.replace(/[^\s]/g, '');

    if ((s1Spaces.length === 1 && s2Spaces.length === 0) || (s1Spaces.length === 0 && s2Spaces.length === 1)) {
        return 'SINGLE_REGULAR_SPACE';
    }

    return `differs only by whitespace:\n'${s1}' (codes: ${getCharCodes(s1Spaces)})\n'${s2}' (codes: ${getCharCodes(s2Spaces)})`;
}

function createRow(currency, locales) {
    const row = document.createElement('tr');
    row.id = `row-${currency}`;

    const headerCell = document.createElement('th');
    headerCell.textContent = currency;
    headerCell.title = currencyNames[currency] || currency;
    row.appendChild(headerCell);

    const cellMap = new Map();
    locales.forEach(locale => {
        const cell = row.insertCell();
        cell.classList.add('tooltip');
        cellMap.set(`${currency}-${locale}`, cell);
    });

    return row;
}

document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('comparison-table');

    fetch('/api/meta')
        .then(response => response.json())
        .then(meta => {
            const { locales, currencies, localeNames, currencyNames } = meta;

            // Create header row
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            const th = document.createElement('th');
            th.textContent = 'Currency';
            headerRow.appendChild(th);
            locales.forEach(locale => {
                const th = document.createElement('th');
                th.textContent = locale;
                th.title = localeNames[locale] || locale;
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            const cellMap = new Map();
            currencies.forEach(currency => {
                const row = tbody.insertRow();
                const currencyCell = row.insertCell();
                currencyCell.textContent = currency;
                const currencyInfo = currencyNames[currency];
                if (currencyInfo) {
                    currencyCell.title = `${currencyInfo.name} -- ${currencyInfo.symbol}`;
                } else {
                    currencyCell.title = currency;
                }
                locales.forEach(locale => {
                    const cell = row.insertCell();
                    cell.classList.add('tooltip');
                    cellMap.set(`${currency}-${locale}`, cell);
                });
            });

            const worker = new Worker('/sse-worker.js');
            worker.onmessage = (event) => {
                const cellData = event.data;

                if (cellData.type === 'end' || cellData.type === 'error') {
                    if (cellData.type === 'error') {
                        console.error('SSE stream encountered an error.');
                    }
                    worker.terminate();
                    return;
                }

                const { currency, locale, results, browserName } = cellData;
                const cell = cellMap.get(`${currency}-${locale}`);

                if (cell) {
                    if (!results.javaCldr || !results.javaLegacy || !results.node) {
                        cell.classList.add('error');
                        return;
                    }

                    const browserResult = new Intl.NumberFormat(locale, {
                        style: 'currency',
                        currency: currency,
                        currencyDisplay: 'symbol'
                    }).format(1234567.899);

                    const { javaCldr, javaLegacy, node, playwright } = results;
                    
                    const playwrightBrowserWhitespaceDiff = getWhitespaceDiff(playwright, browserResult);
                    const nodeBrowserWhitespaceDiff = getWhitespaceDiff(node, browserResult);
                    const javaCldrBrowserWhitespaceDiff = getWhitespaceDiff(javaCldr, browserResult);
                    const javaCldrLegacyWhitespaceDiff = getWhitespaceDiff(javaCldr, javaLegacy);

                    const isPlaywrightSingleSpace = playwrightBrowserWhitespaceDiff === 'SINGLE_REGULAR_SPACE';
                    const isNodeSingleSpace = nodeBrowserWhitespaceDiff === 'SINGLE_REGULAR_SPACE';
                    const isJavaCldrSingleSpace = javaCldrBrowserWhitespaceDiff === 'SINGLE_REGULAR_SPACE';

                    const playwrightBrowserDiff = !playwrightBrowserWhitespaceDiff && playwright !== browserResult;
                    const nodeBrowserDiff = !nodeBrowserWhitespaceDiff && node !== browserResult;
                    const javaCldrBrowserDiff = !javaCldrBrowserWhitespaceDiff && javaCldr !== browserResult;
                    
                    let whitespaceIndicatorAdded = false;

                    if (playwrightBrowserDiff) {
                        cell.classList.add('mismatch-dark-red');
                    } else if (nodeBrowserDiff) {
                        cell.classList.add('mismatch-red');
                    } else if (javaCldrBrowserDiff) {
                        cell.classList.add('mismatch-orange');
                    } else if (isPlaywrightSingleSpace || isNodeSingleSpace || isJavaCldrSingleSpace) {
                        cell.textContent = '⌴';
                    } else if (playwrightBrowserWhitespaceDiff || nodeBrowserWhitespaceDiff || javaCldrBrowserWhitespaceDiff) {
                        cell.textContent = '≈';
                    }

                    let tooltipContent = `${currency} -- ${locale}\n\nPlaywright (${browserName}): ${playwright}\nJava (CLDR):   ${javaCldr}\nJava (Legacy): ${javaLegacy}\nNode.js:       ${node}\nBrowser:       ${browserResult}`;

                    const diffs = [];
                    if (playwrightBrowserWhitespaceDiff === 'SINGLE_REGULAR_SPACE') {
                        diffs.push(`Playwright (${browserName}) vs Browser: differs by a single space`);
                    } else if (playwrightBrowserWhitespaceDiff) {
                        diffs.push(`Playwright (${browserName}) vs Browser: ${playwrightBrowserWhitespaceDiff}`);
                    } else if (playwright !== browserResult) {
                        diffs.push(`Playwright (${browserName}) vs Browser:\n  '${playwright}'\n  '${browserResult}'`);
                    }
                    
                    if (nodeBrowserWhitespaceDiff === 'SINGLE_REGULAR_SPACE') {
                        diffs.push(`Node vs Browser: differs by a single space`);
                    } else if (nodeBrowserWhitespaceDiff) {
                        diffs.push(`Node vs Browser: ${nodeBrowserWhitespaceDiff}`);
                    } else if (node !== browserResult) {
                        diffs.push(`Node vs Browser:\n  '${node}'\n  '${browserResult}'`);
                    }
                    
                    if (javaCldrLegacyWhitespaceDiff === 'SINGLE_REGULAR_SPACE') {
                        diffs.push(`Java CLDR vs Legacy: differs by a single space`);
                    } else if (javaCldrLegacyWhitespaceDiff) {
                        diffs.push(`Java CLDR vs Legacy:\n  '${javaCldr}'\n  '${javaLegacy}'`);
                    } else if (javaCldr !== javaLegacy) {
                        diffs.push(`Java CLDR vs Legacy:\n  '${javaCldr}'\n  '${javaLegacy}'`);
                    }

                    if (diffs.length > 0) {
                        tooltipContent += '\n\nDifferences:\n' + diffs.join('\n\n');
                    }
                    
                    const tooltipText = document.createElement('span');
                    tooltipText.className = 'tooltiptext';
                    tooltipText.textContent = tooltipContent;
                    cell.appendChild(tooltipText);
                }
            };
        });
}); 