const { workerData, parentPort } = require('worker_threads');
const { formatCurrencyJava, formatCurrencyNode, formatCurrencyPlaywright } = require('./format-currency');

const { currency, locales, value, browserName } = workerData;

(async () => {
    try {
        for (const locale of locales) {
            const javaCldr = formatCurrencyJava(locale, currency, value, true);
            const javaLegacy = formatCurrencyJava(locale, currency, value, false);
            const node = formatCurrencyNode(locale, currency, value);
            const playwright = await formatCurrencyPlaywright(browserName, locale, currency, value);

            parentPort.postMessage({
                currency,
                locale,
                results: { javaCldr, javaLegacy, node, playwright },
                browserName: browserName,
            });
        }
    } finally {
        // No browser to close here, as it's handled in browser-format.js
    }
})();
