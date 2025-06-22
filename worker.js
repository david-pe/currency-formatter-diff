const { workerData, parentPort } = require('worker_threads');
const { formatCurrencyJava, formatCurrencyNode } = require('./format-currency');

const { currency, locales, value } = workerData;

for (const locale of locales) {
    const javaCldr = formatCurrencyJava(locale, currency, value, true);
    const javaLegacy = formatCurrencyJava(locale, currency, value, false);
    const node = formatCurrencyNode(locale, currency, value);

    parentPort.postMessage({
        currency,
        locale,
        results: { javaCldr, javaLegacy, node },
    });
} 