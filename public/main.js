function getCharCodes(s) {
    return s.split('').map(c => c.charCodeAt(0)).join(', ');
}

function getWhitespaceDiff(s1, s2) {
    if (s1.replace(/\s/g, '') !== s2.replace(/\s/g, '')) {
        return null;
    }

    const s1Spaces = s1.replace(/[^\s]/g, '');
    const s2Spaces = s2.replace(/[^\s]/g, '');

    if (s1Spaces.length !== s2Spaces.length) {
        return null;
    }

    if (s1Spaces !== s2Spaces) {
        return `differs only by whitespace:\n'${s1}' (codes: ${getCharCodes(s1Spaces)})\n'${s2}' (codes: ${getCharCodes(s2Spaces)})`;
    }

    return null;
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

                const { currency, locale, results } = cellData;
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

                    const { javaCldr, javaLegacy, node, sparticuz } = results;
                    
                    const sparticuzBrowserWhitespaceDiff = getWhitespaceDiff(sparticuz, browserResult);
                    const nodeBrowserWhitespaceDiff = getWhitespaceDiff(node, browserResult);
                    const javaCldrBrowserWhitespaceDiff = getWhitespaceDiff(javaCldr, browserResult);
                    const javaCldrLegacyWhitespaceDiff = getWhitespaceDiff(javaCldr, javaLegacy);

                    const sparticuzBrowserDiff = !sparticuzBrowserWhitespaceDiff && sparticuz !== browserResult;
                    const nodeBrowserDiff = !nodeBrowserWhitespaceDiff && node !== browserResult;
                    const javaCldrBrowserDiff = !javaCldrBrowserWhitespaceDiff && javaCldr !== browserResult;
                    const javaCldrLegacyDiff = !javaCldrLegacyWhitespaceDiff && javaCldr !== javaLegacy;
                    
                    let whitespaceIndicatorAdded = false;

                    if (sparticuzBrowserDiff) {
                        cell.classList.add('mismatch-dark-red');
                    } else if (nodeBrowserDiff) {
                        cell.classList.add('mismatch-red');
                    } else if (javaCldrBrowserDiff) {
                        cell.classList.add('mismatch-orange');
                    } else if (sparticuzBrowserWhitespaceDiff || nodeBrowserWhitespaceDiff || javaCldrBrowserWhitespaceDiff || javaCldrLegacyWhitespaceDiff) {
                        cell.textContent = '≈';
                        whitespaceIndicatorAdded = true;
                    }

                    let tooltipContent = `${currency} -- ${locale}\n\nSparticuz:     ${sparticuz}\nJava (CLDR):   ${javaCldr}\nJava (Legacy): ${javaLegacy}\nNode.js:       ${node}\nBrowser:       ${browserResult}`;

                    const diffs = [];
                    if (sparticuzBrowserWhitespaceDiff) {
                        diffs.push(`Sparticuz vs Browser: ${sparticuzBrowserWhitespaceDiff}`);
                    } else if (sparticuz !== browserResult) {
                        diffs.push(`Sparticuz vs Browser:\n  '${sparticuz}'\n  '${browserResult}'`);
                    }
                    
                    if (nodeBrowserWhitespaceDiff) {
                        diffs.push(`Node vs Browser: ${nodeBrowserWhitespaceDiff}`);
                    } else if (node !== browserResult) {
                        diffs.push(`Node vs Browser:\n  '${node}'\n  '${browserResult}'`);
                    }
                    
                    if (javaCldrBrowserWhitespaceDiff) {
                        diffs.push(`Java CLDR vs Browser: ${javaCldrBrowserWhitespaceDiff}`);
                    } else if (javaCldr !== browserResult) {
                        diffs.push(`Java CLDR vs Browser:\n  '${javaCldr}'\n  '${browserResult}'`);
                    }
                    
                    if (javaCldrLegacyWhitespaceDiff) {
                        diffs.push(`Java CLDR vs Legacy: ${javaCldrLegacyWhitespaceDiff}`);
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