const { workerData, parentPort } = require('worker_threads');
const { formatCurrencyJava, formatCurrencyNode, formatCurrencySparticuz } = require('./format-currency');
const puppeteer = require('puppeteer-core');

const { currency, locales, value } = workerData;

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: "new",
            args: ['--no-sandbox'],
            timeout: 60000,
        });
        const page = await browser.newPage();

        for (const locale of locales) {
            const javaCldr = formatCurrencyJava(locale, currency, value, true);
            const javaLegacy = formatCurrencyJava(locale, currency, value, false);
            const node = formatCurrencyNode(locale, currency, value);
            const sparticuz = await formatCurrencySparticuz(page, locale, currency, value);

            parentPort.postMessage({
                currency,
                locale,
                results: { javaCldr, javaLegacy, node, sparticuz },
            });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
